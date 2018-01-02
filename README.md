# ci-light-bulb 💡

[![Build Status](https://travis-ci.org/screendriver/ci-light-bulb.svg?branch=github)](https://travis-ci.org/screendriver/ci-light-bulb)

---

A Web App that connects [Jenkins](https://jenkins.io) builds to a smart
light bulb over
[Web Bluetooth](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API).

The bulb changes the color automatically according to the curret build status:

* Yellow when the build currently runs
* Red when the build failed
* Green when the build was successful
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

* `ELM_APP_CI_URL`: the URL to the Jenkins server
* `ELM_APP_BRANCH_BLACKLIST`: branches that should be ignored

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
