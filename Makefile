unpacked_chrome = dist/chrome
unpacked_firefox = dist/firefox
dist = dist

.PHONY: build build-chrome build-firefox pack pack-chrome pack-firefox clean

build: build-chrome build-firefox

build-chrome:
	rm -rf $(unpacked_chrome)
	mkdir -p $(unpacked_chrome)
	@echo "/* Auto-generated file - do not edit manually */" > src/styles/dashboard-css.ts
	@echo "/* Generated from dashboard.css */" >> src/styles/dashboard-css.ts
	@echo "export const dashboardCSS = \`$$(cat src/styles/dashboard.css)\`;" >> src/styles/dashboard-css.ts
	bun build ./src/background.ts --outfile=$(unpacked_chrome)/background.js
	bun build ./src/dashboard.ts --outfile=$(unpacked_chrome)/dashboard.js
	cp manifests/chrome.json $(unpacked_chrome)/manifest.json
	cp src/styles/dashboard.css $(unpacked_chrome)/dashboard.css

build-firefox:
	rm -rf $(unpacked_firefox)
	mkdir -p $(unpacked_firefox)
	@echo "/* Auto-generated file - do not edit manually */" > src/styles/dashboard-css.ts
	@echo "/* Generated from dashboard.css */" >> src/styles/dashboard-css.ts
	@echo "export const dashboardCSS = \`$$(cat src/styles/dashboard.css)\`;" >> src/styles/dashboard-css.ts
	bun build ./src/background.ts --outfile=$(unpacked_firefox)/background.js
	bun build ./src/dashboard.ts --outfile=$(unpacked_firefox)/dashboard.js
	cp manifests/firefox.json $(unpacked_firefox)/manifest.json
	cp src/styles/dashboard.css $(unpacked_firefox)/dashboard.css

pack: pack-chrome pack-firefox

pack-chrome: build-chrome
	tar -czvf $(dist)/ludicrous-speed-chrome.tar.gz -C $(unpacked_chrome) .

pack-firefox: build-firefox
	tar -czvf $(dist)/ludicrous-speed-firefox.tar.gz -C $(unpacked_firefox) .

clean:
	rm -rf $(dist)
