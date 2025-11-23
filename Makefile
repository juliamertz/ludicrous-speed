unpacked_chrome = dist/chrome
unpacked_firefox = dist/firefox
dist = dist

.PHONY: build build-chrome build-firefox build-dashboard pack pack-chrome pack-firefox pack-zip pack-zip-chrome pack-zip-firefox clean

build: build-chrome build-firefox

build-chrome:
	rm -rf $(unpacked_chrome)
	mkdir -p $(unpacked_chrome)
	bun build ./src/background.ts --outfile=$(unpacked_chrome)/background.js
	cp manifests/chrome.json $(unpacked_chrome)/manifest.json

build-firefox:
	rm -rf $(unpacked_firefox)
	mkdir -p $(unpacked_firefox)
	bun build ./src/background.ts --outfile=$(unpacked_firefox)/background.js
	cp manifests/firefox.json $(unpacked_firefox)/manifest.json

# Build dashboard.js for server deployment
build-dashboard:
	@echo "/* Auto-generated file - do not edit manually */" > src/styles/dashboard-css.ts
	@echo "/* Generated from dashboard.css */" >> src/styles/dashboard-css.ts
	@echo "export const dashboardCSS = \`$$(cat src/styles/dashboard.css)\`;" >> src/styles/dashboard-css.ts
	bun build ./src/dashboard.ts --outfile=$(dist)/dashboard.js
	@if [ -f scripts/private-key.pem ]; then \
		bun scripts/sign-dashboard.js $(dist)/dashboard.js; \
		echo "dashboard.js signed"; \
	else \
		echo "Private key not found."; \
	fi

pack: pack-chrome pack-firefox

pack-chrome: build-chrome
	tar -czvf $(dist)/ludicrous-speed-chrome.tar.gz -C $(unpacked_chrome) .

pack-firefox: build-firefox
	tar -czvf $(dist)/ludicrous-speed-firefox.tar.gz -C $(unpacked_firefox) .

pack-zip: pack-zip-chrome pack-zip-firefox

pack-zip-chrome: build-chrome
	cd $(unpacked_chrome) && zip -r ../ludicrous-speed-chrome.zip .

pack-zip-firefox: build-firefox
	cd $(unpacked_firefox) && zip -r ../ludicrous-speed-firefox.zip .

clean:
	rm -rf $(dist)
