# ci-light-bulb 💡

[![Build Status](https://travis-ci.org/screendriver/ci-light-bulb.svg?branch=github)](https://travis-ci.org/screendriver/ci-light-bulb)

---

A Web App that connects [GitHub Statuses API](https://developer.github.com/v3/repos/statuses/)
to a smart light bulb over
[Web Bluetooth](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API).

The bulb changes the color automatically according to the curret build status:

* Yellow when one of the builds are currently running
* Red when of the builds failed
* Green when all builds are successful
* Pink when the build state is unknown (this should always indicate a bug 🐛
  in the App)

## Prerequisites

To build this project you need to install [Node.js](https://nodejs.org) and
[Yarn](https://yarnpkg.com). Furthermore you need
[Google Chrome](https://www.google.com/chrome/) because it is at the moment
of writing this the only Browser that supports this experimental API.

After that copy `.env.sample` to a file called `.env` and fill out the given
template:

### .env

* `ELM_APP_GITHUB_API_URL`: the URL to the GitHub server
* `ELM_APP_GITHUP_API_TOKEN`: your API token
* `ELM_APP_GITHUB_OWNER`: the owner of the repository
* `ELM_APP_GITHUB_REPO`: the repository to watch
* `ELM_APP_GITHUB_BRANCH_BLACKLIST`: branches that should be ignored

## Installation

Just install all needed dependencies with `yarn install`. That's all. Everything
gets installed automatically for you.

## Build

To make a production build: `yarn build`

## Development

To start a local development server: `yarn serve`. The App is reachable at
http://localhost:3000. Hot reload included 🔥 Every code change automatically
refreshes the App.

## Tests

To run all tests: `yarn test`
