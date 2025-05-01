var fs = require('fs');
var readline = require('readline');
var {google} = require('googleapis');

var SCOPES = ['https://www.googleapis.com/auth/youtube'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'youtube-nodejs-quickstart.json';

// Updated: getNewToken now returns a Promise
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
          reject('Error while trying to retrieve access token: ' + err);
        } else {
          oauth2Client.credentials = token;
          storeToken(token);
          resolve(oauth2Client);  // Resolve with oauth2Client containing credentials
        }
      });
    });
  });
}

function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code !== 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
    if (err) throw err;
    console.log('Token stored to ' + TOKEN_PATH);
  });
}

// Updated: getChannel now returns a Promise
function getChannel(auth) {
  return new Promise((resolve, reject) => {
    var service = google.youtube('v3');
    service.channels.list({
      auth: auth,
      part: 'snippet,contentDetails,statistics',
      forUsername: 'GoogleDevelopers'
    }, function(err, response) {
      if (err) {
        reject('The API returned an error: ' + err);
      } else {
        var channels = response.data.items;
        if (channels.length === 0) {
          reject('No channel found.');
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
