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

      packageManifest = lib.importJSON ./package.json;

      dashboard-js = pkgs.stdenvNoCC.mkDerivation {
        pname = "dashboard.js";
        inherit (packageManifest) version;

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
          inherit (packageManifest) name version;
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
          inherit (packageManifest) version;

          src = filter {
            root = ./.;
            include = [
              ./package.json
              ./package-lock.json
              ./src/background.ts
            ];
          };
          npmDepsHash = "sha256-f1pCb4Barzv47IW3iHRF2fwKRs52s1Z+D1FHsQlIdmk=";

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
          awscli
          prefetch-npm-deps
        ];
      };
    });

    apps = eachSystem (pkgs: {
      update-deps-hash = {
        type = "app";
        program = "${pkgs.writeShellScriptBin "update-npm-deps-hash" ''
          export PATH="${lib.makeBinPath (with pkgs; [ prefetch-npm-deps gnused ])}:$PATH"
          hash=$(prefetch-npm-deps package-lock.json 2>/dev/null)
          if [ -z "$hash" ]; then
            echo "Error: Failed to generate hash" >&2
            exit 1
          fi
          echo "Generated hash: $hash" >&2
          sed -i "s|npmDepsHash = \".*\";|npmDepsHash = \"$hash\";|" flake.nix
          echo "Updated npmDepsHash in flake.nix"
        ''}/bin/update-npm-deps-hash";
      };
    });
  };
}
