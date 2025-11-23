dist = dist
unpacked_chrome = $(dist)/chrome
unpacked_firefox = $(dist)/firefox

private_key_path ?= private-key.pem
dashboard_dir ?= $(dist)/dashboard
dashboard_path ?= $(dashboard_dir)/dashboard.js
signature_path = $(dashboard_path).sig


.PHONY: build build-chrome build-firefox build-dashboard pack pack-chrome pack-firefox pack-zip pack-zip-chrome pack-zip-firefox clean

clean:
	rm -rf result $(dist)

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

build-dashboard:
	nix build .#dashboard-js
	mkdir -p $(dashboard_dir)
	cp --no-preserve=mode result/dashboard.js $(dashboard_dir)/dashboard.js
	$(MAKE) sign-dashboard

publish-dashboard:
	$(MAKE) build-dashboard
	aws s3 sync dist/dashboard s3://nettenshop

pack-zip: pack-zip-chrome pack-zip-firefox

pack-zip-chrome: build-chrome
	cd $(unpacked_chrome) && zip -r ../ludicrous-speed-chrome.zip .

pack-zip-firefox: build-firefox
	cd $(unpacked_firefox) && zip -r ../ludicrous-speed-firefox.zip .
