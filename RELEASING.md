# Releasing

## Updating the version and building the packages

Checkout the latest state from `main`, then run:

```
npm version (major|minor|patch)
```

to auto-create a commit with the desired version bump and the associated tag.
Then push both:

```
git push --tags origin main
```

A GitHub workflow will launch which auto-builds the artifacts required for publishing into the browsers' web-stores.
The extension-packages will be attached to an automatically created release-draft for the new version, from where they can be downloaded and then manually submitted into the stores for review.

## Prepared text-snippets for use in the extension stores

Short how-to-test:

> The extension can be tested by typing "ase" into the omnibar followed by a space or tab, and subsequently typing something to search the AWS documentation.
> 
> An example query is "lambda/invoke", which when typed shows all documentation-results for the AWS Lambda API that contain the word "invoke", with the first entry probably being the actual "Invoke" endpoint.
> Pressing enter now will open the documentation in question in the current tab.
