.PHONY: default
default: demo

.PHONY: demo
demo:
	make -C example/demo run

.PHONY: publish
publish:
	npm version patch
	npm publish
	git push --tags
