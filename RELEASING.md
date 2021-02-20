# Releasing

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
