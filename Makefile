unpacked = dist/unpacked
dist = dist

build:
	rm -rf $(dist)
	mkdir -p $(unpacked)
	bun build ./src/background.ts --outfile=$(unpacked)/background.js
	bun build ./src/dashboard.ts --outfile=$(unpacked)/dashboard.js
	cp manifest.json $(unpacked)

pack:
	$(MAKE) build
	tar -czvf $(dist)/ludicrous-speed.tar.gz -C $(unpacked) .
