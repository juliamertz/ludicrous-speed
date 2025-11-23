{
  description = "A Nix-flake-based bun development environment";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
    systems.url = "github:nix-systems/default";
    nix-filter.url = "github:numtide/nix-filter";
  };

  outputs = {
    self,
    nixpkgs,
    systems,
    nix-filter,
  }: let
    inherit (nixpkgs) lib;
    eachSystem = f:
      lib.genAttrs (import systems) (
        system: f (import nixpkgs {inherit system;})
      );
  in {
    packages = eachSystem (pkgs: let
      minify = path:
        builtins.readFile "${pkgs.runCommand "" {} ''
          ${lib.getExe pkgs.minify} ${path} > $out
        ''}";

      dashboard-js = pkgs.stdenvNoCC.mkDerivation {
        pname = "dashboard.js";
        version = "0.1.1";

        src = ./.;

        patchPhase = let
          dashboardCss =
            pkgs.writeText "dashboard.css"
            # typescript
            ''
              export const dashboardCSS = `${minify ./src/styles/dashboard.css}`
            '';
        in
          # sh
          ''
            cp ${dashboardCss} ./src/styles/dashboard-css.ts
          '';

        buildPhase = ''
          ${lib.getExe pkgs.bun} build ./src/dashboard.ts --outfile=bundle.js
          ${lib.getExe pkgs.minify} bundle.js > dashboard.js
        '';

        installPhase = ''
          mkdir -p $out
          install dashboard.js $out/dashboard.js
        '';
      };

      backgroundJSFor = targetBrowser: let
        manifestPath = ./manifests/${targetBrowser}.json;
      in
        pkgs.buildNpmPackage {
          pname = "background.js";
          version = "0.1.1";

          src = ./.;
          npmDepsHash = "sha256-2djtxoV6kEcy8dJAgFRH553RCWEJGpiC1aphKMbuSao=";

          buildPhase = ''
            ${lib.getExe pkgs.bun} build ./src/background.ts --outfile=bundle.js
            ${lib.getExe pkgs.minify} bundle.js > background.js
          '';

          installPhase = ''
            mkdir -p $out
            install background.js $out/background.js
            install ${manifestPath} $out/manifest.json
          '';
        };

      background-js-firefox = backgroundJSFor "firefox";
      background-js-chrome = backgroundJSFor "chrome";
    in {
      inherit dashboard-js background-js-firefox background-js-chrome;
    });

    devShells = eachSystem (pkgs: {
      default = pkgs.mkShell {
        packages = with pkgs; [
          bun
          reflex
          nodePackages.prettier
        ];
      };
    });
  };
}
