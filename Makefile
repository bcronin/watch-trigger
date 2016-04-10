.PHONY: publish

publish:
	npm version patch
	npm publish
	git push --tags
