ZIP_FILE ?= k6-scenario-test.zip
EXCLUDES := ':(exclude).gitignore' ':(exclude)**/.gitignore' \
	':(exclude)Makefile' ':(exclude)**/Makefile' \
	':(exclude)AGENTS.md' ':(exclude)**/AGENTS.md' \
	':(exclude)$(ZIP_FILE)'

.PHONY: zip
zip:
	@rm -f "$(ZIP_FILE)"
	@tmp_file="$$(mktemp)"; \
		git ls-files -co --exclude-standard -- $(EXCLUDES) > "$$tmp_file"; \
		zip -q "$(ZIP_FILE)" -@ < "$$tmp_file"; \
		rm -f "$$tmp_file"; \
		echo "created $(ZIP_FILE)"
