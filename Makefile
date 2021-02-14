include core/extension.mk

.PHONY: chrome

prepare-unlisted:
	@printf "unlisted" > hack/jsonnet-fragments/version-suffix

cleanup-unlisted:
	@printf "" > hack/jsonnet-fragments/version-suffix

firefox.unlisted: prepare-unlisted firefox cleanup-unlisted
