dist = dist
unpacked_chrome = $(dist)/chrome
unpacked_firefox = $(dist)/firefox

private_key_path ?= private-key.pem
dashboard_dir ?= $(dist)/dashboard
dashboard_path ?= $(dashboard_dir)/dashboard.js
dashboard_css = src/styles/dashboard.css
signature_path = $(dashboard_path).sig

.PHONY: build build-chrome build-firefox build-dashboard pack pack-chrome pack-firefox pack-zip pack-zip-chrome pack-zip-firefox clean

clean:
	rm -rf result $(dist) src/styles/dashboard-css.ts

update-deps:
	npm install
	nix run .#update-deps-hash

format:
	prettier --write .

build: build-dashboard build-chrome build-firefox

build-chrome:
	nix build .#background-js-chrome
	rm -rf $(unpacked_chrome)
	mkdir -p $(unpacked_chrome)
	cp -r --no-preserve=mode ./result/* $(unpacked_chrome)

build-firefox:
	nix build .#background-js-firefox
	rm -rf $(unpacked_firefox)
	mkdir -p $(unpacked_firefox)
	cp -r --no-preserve=mode ./result/* $(unpacked_firefox)

sign-dashboard: $(dashboard_path) $(private_key_path)
	@echo "Signing $(dashboard_path)..."
	@openssl pkeyutl -sign \
		-inkey $(private_key_path) \
		-in $(dashboard_path) \
		-rawin \
		-out $(signature_path).tmp
	@base64 < $(signature_path).tmp > $(signature_path)
	@rm $(signature_path).tmp

build-styles $(dashboard_css):
	@echo "/* Auto-generated file - do not edit manually */" > src/styles/dashboard-css.ts
	@echo "/* Generated from dashboard.css */" >> src/styles/dashboard-css.ts
	@echo "export const dashboardCSS = \`$$(cat $(dashboard_css) | minify --type css)\`;" >> src/styles/dashboard-css.ts

build-dashboard:
	$(MAKE) build-styles
	mkdir -p $(dashboard_dir)
	bun build src/dashboard.ts | minify --type js > $(dashboard_dir)/dashboard.js
	$(MAKE) sign-dashboard

publish-dashboard:
	$(MAKE) build-dashboard
	aws s3 sync dist/dashboard s3://nettenshop

pack-zip: pack-zip-chrome pack-zip-firefox

pack-zip-chrome: build-chrome
	cd $(unpacked_chrome) && zip -r ../ludicrous-speed-chrome.zip .

pack-zip-firefox: build-firefox
	cd $(unpacked_firefox) && zip -r ../ludicrous-speed-firefox.zip .
