# Red Bull Doodles Generator

A web application for generating images in the Red Bull doodle style using [Replicate's API](https://replicate.com/colinmcdonnell22/redbull_doodles).

## About

This application uses the Red Bull Doodles model trained by Colin McDonnell, available on Replicate. It allows users to enter text prompts and generate images that match the unique Red Bull artistic style.

## Usage

To get started, you'll need Node.js 18 or later. The simplest way to install it is using the installer at [nodejs.org](https://nodejs.org/).

Next, grab a Replicate API token from [replicate.com/account](http://replicate.com/account) and set it as an environment variable:

```console
export REPLICATE_API_TOKEN=...
```

Or create a .env file with:

```
REPLICATE_API_TOKEN=your_token_here
```

Then run your app:

```console
npm install
npm start
```

## Features

- Generate images in the Red Bull doodle style
- Adjust parameters like quality, detail level, and style intensity
- Simple and intuitive user interface