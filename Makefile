.PHONY: publish

publish:
	npm version patch
	npm publish
