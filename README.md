# Vujut-web

Sources for <https://vujut.linkkijkl.fi>.
Make sure you have [git lfs](https://git-lfs.com/) installed before cloning.

## Development in Linux
1. Using Linux, install [Hugo](https://gohugo.io/) and [Yarn](https://yarnpkg.com/).
2. In project root, run `yarn` and then `hugo server`

## Development with Devcontainers (any OS which supports Docker)
1. Open this project in your [IDE of choice with support for Devcontainers](https://containers.dev/supporting)
2. Build and run Devcontainer
3. Run `hugo server` from terminal inside the container

## Adding new dependencies
1. Run `yarn add <yourpackage>`
2. Find the distributable files inside the packages directory, i.e `node_modules/bootstrap/dist/js/bootstrap.bundle.js`
3. Add distributable files to `link-node-dependencies.sh` in project root
4. Run `yarn`, which will invoke `link-node-dependencies.sh`
5. Finally link js files to `layouts/partials/scripts.html` and css to `layouts/partials/headers.html`

## Tips
Some content will have `draft = true` in its front matter, which means that it will not get into production builds. Running hugo with `--buildDrafts` will override this behaviour.
