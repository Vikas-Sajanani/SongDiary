var fs = require('fs');
var readline = require('readline');
var {google} = require('googleapis');

var SCOPES = ['https://www.googleapis.com/auth/youtube'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'youtube-nodejs-quickstart.json';

  function getNewToken(oauth2Client, callback) {
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
          console.log('Error while trying to retrieve access token', err);
          return null;
        }
        oauth2Client.credentials = token;
        storeToken(token);
        var channelData = callback(oauth2Client);
        return channelData;
      });
    });
  }
  
  /**
   * Store token to disk be used in later program executions.
   *
   * @param {Object} token The token to store to disk.
   */
  function storeToken(token) {
    try {
      fs.mkdirSync(TOKEN_DIR);
    } catch (err) {
      if (err.code != 'EEXIST') {
        throw err;
      }
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
      if (err) throw err;
      console.log('Token stored to ' + TOKEN_PATH);
    });
  }
  
  /**
   * Lists the names and IDs of up to 10 files.
   *
   * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
   */
  function getChannel(auth) {
    var service = google.youtube('v3');
    service.channels.list({
      auth: auth,
      part: 'snippet,contentDetails,statistics',
      forUsername: 'GoogleDevelopers'
    }, function(err, response) {
      if (err) {
        console.log('The API returned an error: ' + err);
        return null;
      }
      var channels = response.data.items;
      if (channels.length == 0) {
        console.log('No channel found.');
        var channelData = 'No channel Found'
        return channelData;
      } else {
        console.log('This channel\'s ID is %s. Its title is \'%s\', and ' +
                    'it has %s views.',
                    channels[0].id,
                    channels[0].snippet.title,
                    channels[0].statistics.viewCount);

                    var channelData = {id : channels[0].id, title : channels[0].snippet.title, viewCount : channels[0].statistics.viewCount};
                    return channelData;
      }
    });
  }
  
  module.exports = {
    getNewToken,
    getChannel
  }