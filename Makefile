include core/extension.mk

.PHONY: chrome

indices = extension/index/api.js extension/index/cfn.js extension/index/cli.js

prepare-unlisted:
	@printf "unlisted" > hack/jsonnet-fragments/version-suffix

cleanup-unlisted:
	@printf "" > hack/jsonnet-fragments/version-suffix

firefox.unlisted: prepare-unlisted firefox cleanup-unlisted

empty-indices: create-index-directory empty-index-api empty-index-cfn empty-index-cli
	@echo "Empty indices created (or indices already existed)"

create-index-directory:
	@mkdir -p extension/index

empty-index-api:
	$(if \
		$(wildcard extension/index/api.js), \
		, \
		echo "var apiSearchIndex={};" > extension/index/api.js \
	)
empty-index-cfn:
	$(if \
		$(wildcard extension/index/cfn.js), \
		, \
		echo "var cfnSearchIndex={};" > extension/index/cfn.js \
	)
empty-index-cli:
	$(if \
		$(wildcard extension/index/cli.js), \
		, \
		echo "var cliSearchIndex={};" > extension/index/cli.js \
	)

indices: $(indices)

extension/index/api.js:
	@echo "Generating API index"
	hack/generate-index-api.py

extension/index/cfn.js:
	@echo "Generating CFN index"
	hack/generate-index-cfn.py

extension/index/cli.js:
	@echo "Generating CLI index"
	hack/generate-index-cli.py

clean-indices:
	rm -f extension/index/*.js
