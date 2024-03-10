# SongDiary - Combines Spotify and YT accounts for data analytics and behaviour insights for user's personal history

This app displays your Spotify profile information using [Authorization Code](https://developer.spotify.com/documentation/web-api/tutorials/code-flow)
to grant permissions to the app.
This app uses Youtube v3 Data API to authenticate with and access your account information.

Setting up credentials for using this app and ground rules for safety will be highlighted in sections below.

## March 24 Branch - Updates, instructions and information for service

The UI - Landing page update with images and links to each auth service

![SongDiaryAPI](https://github.com/Vikas-Sajanani/SongDiary/assets/142914809/7842820b-7465-4972-b79a-162d37ab30f9)

The spotify pageflow has two pages and is complete. The YT auth page flow uses console and has no UI implementation currently once triggered.

Authenticating with Spotify - follow instructions in using your own credentials part below
The button will redirect to your Spotify for approval. The following page will show profile details along with auth tokens used.
These will be removed in later months as servie shifts focus away from authentication and towards data analytics.

Authenticating with YT - follow instructions in using your own credentials part below
Click on YT auth button. The BE processes should prompt you from console to an OAuth link asking permissions
to your Google YT account for given scope. Once these are granted the service will go to an empty call back page
and log a 400 invalid request error once the logic is being execute.
This is being investigated and expected to be fixed by April release.

## Installation
This app is under ongoing development, for the latest version of the app please clone the monthly feature branch in your environment

This example runs on Node.js. On [its website](http://www.nodejs.org/download/) you can find instructions on how to install it.

Install the app dependencies running:

    $ npm install

## Using your own credentials

You will need to register your app and get your own credentials from the [Spotify for Developers Dashboard](https://developer.spotify.com/dashboard).

- Create a new app in the dashboard and add `http://localhost:3000/callback` to the app's redirect URL list.
- Once you have created your app, update the `client_id`, `redirect_uri`, and `client_secret` in the `app.js` file with the credentials obtained from the app settings in the dashboard.

You will need to follow the instructions on [YouTube OAuth for Node.js](https://developers.google.com/youtube/v3/quickstart/nodejs) page in order to download your own secrets json file for the app.

The code for this service can this be used as is - it's already modified for our purposes

## Running the example

From a console shell:

    $ npm start

Then, open `http://localhost:3000` in a browser.
