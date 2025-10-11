# Contributing to LearningMaps

Thanks for taking the time to improve LearningMaps!

This document describes how to prepare a PR for a change in the main repository.

- [Prerequisites](#prerequisites)
- [Making changes in the Go code](#making-changes-in-the-go-code)
- [Making changes in the UI](#making-changes-in-the-ui)

## Prerequisites

- Go 1.23+ (for making changes in the Go code)
- Node 18+ (for making changes in the UI)

If you haven't already, you can fork the main repository and clone your fork so that you can work locally:

```
git clone https://github.com/your_username/learningmaps.git
```

> [!IMPORTANT]
> It is recommended to create a new branch from master for each of your bugfixes and features.
> This is required if you are planning to submit multiple PRs in order to keep the changes separate for review until they eventually get merged.

## Making changes in the Go code

1. Run `make setup`
2. Run `make run`

This will start a web server on `http://localhost:8090` with the embedded UI from `ui/dist`. And that's it!

## Making changes in the UI

LearningMaps UI is a single-page application (SPA) built with Astro and React.

To start the UI:

1. Run `make setup`
2. Run `make run`

This will start the UI and the backend server.

You could open the browser and access the running UI at `http://localhost:4321`.

Since the UI is just a client-side application, you need to have the LearningMaps backend server also running in the background.

> [!NOTE]
> By default, the UI is expecting the backend server to be started at `http://localhost:8090`, but you could change that by creating a new `ui/.env.development.local` file with `PUBLIC_BACKEND_URL = YOUR_ADDRESS` variable inside it.

Every change you make in the UI should be automatically reflected in the browser at `http://localhost:4321` without reloading the page.

Once you are done with your changes, you have to build the UI with `npm run build`, so that it can be embedded in the go package. And that's it - you can make your PR to the main LearningMaps repository.
