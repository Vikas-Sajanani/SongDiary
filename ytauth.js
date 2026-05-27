var fs = require('fs');
var readline = require('readline');
var {google} = require('googleapis');

var SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'youtube-nodejs-quickstart.json';

function getNewToken(oauth2Client) {
  return new Promise((resolve, reject) => {
    var authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES
    });
    console.log('Authorize this app by visiting this url: ', authUrl);
    var rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.question('Enter the code from that page here: ', function(code) {
      rl.close();
      oauth2Client.getToken(code, function(err, token) {
        if (err) {
          reject(new Error('Error while trying to retrieve access token'));
        } else {
          oauth2Client.credentials = token;
          storeToken(token)
            .then(() => getChannel(oauth2Client))
            .then(resolve)
            .catch(reject);
        }
      });
    });
  });
}

function storeToken(token) {
  return fs.promises.mkdir(TOKEN_DIR, { recursive: true }).then(() => {
    return fs.promises.writeFile(TOKEN_PATH, JSON.stringify(token), { mode: 0o600 });
  }).then(() => {
    console.log('Token stored to ' + TOKEN_PATH);
  });
}

function getChannel(auth) {
  return new Promise((resolve, reject) => {
    var service = google.youtube('v3');
    service.channels.list({
      auth: auth,
      part: 'snippet,contentDetails,statistics',
      forUsername: 'GoogleDevelopers'
    }, function(err, response) {
      if (err) {
        reject(new Error('The YouTube API returned an error'));
      } else {
        var channels = response.data.items;
        if (channels.length === 0) {
          reject(new Error('No channel found.'));
        } else {
          var channelData = {
            id: channels[0].id,
            title: channels[0].snippet.title,
            viewCount: channels[0].statistics.viewCount
          };
          resolve(channelData);  // Resolve with channel data
        }
      }
    });
  });
}

module.exports = {
  getNewToken,
  getChannel
};
