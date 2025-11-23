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
    filter = nix-filter.lib;
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

        src = filter {
          root = ./.;
          include = [./src];
          exclude = [./src/background.ts];
        };

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

      manifestFor = targetBrowser:
        {
          name = "LudicrousSpeed";
          version = "1.1.0";
          manifest_version = 3;
          permissions = ["scripting"];
          host_permissions = ["<all_urls>"];
          background =
            if targetBrowser == "firefox"
            then {scripts = ["background.js"];}
            else if targetBrowser == "chrome"
            then {service_worker = "background.js";}
            else throw "invalid browser target: '${targetBrowser}'";
        }
        // lib.optionalAttrs (targetBrowser == "firefox") {
          browser_specific_settings = {
            gecko = {
              id = "ludicrousspeed@example.com";
            };
          };
        };

      backgroundJSFor = targetBrowser: let
        manifest = pkgs.writeText "manifest.json" (builtins.toJSON (manifestFor targetBrowser));
      in
        pkgs.buildNpmPackage {
          pname = "background.js";
          version = "0.1.1";

          src = filter {
            root = ./.;
            include = [
              ./package.json
              ./package-lock.json
              ./src/background.ts
            ];
          };
          npmDepsHash = "sha256-fVVKnfDO6V0uP2SFI33NS73p11Fh+Np9BxXmv2Tp9B8=";

          buildPhase = ''
            ${lib.getExe pkgs.bun} build ./src/background.ts --outfile=bundle.js
            ${lib.getExe pkgs.minify} bundle.js > background.js
          '';

          installPhase = ''
            mkdir -p $out
            install background.js $out/background.js
            install ${manifest} $out/manifest.json
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
