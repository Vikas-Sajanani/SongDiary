/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/documentation/web-api/tutorials/code-flow
 */

var express = require('express');
var request = require('request');
var crypto = require('crypto');
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
require('dotenv').config();

var fs = require('fs');
var {google} = require('googleapis');
var OAuth2 = google.auth.OAuth2;

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/youtube-nodejs-quickstart.json
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'youtube-nodejs-quickstart.json';

var client_id = process.env.SPOTIFY_CLIENT_ID; // Your client id Spotify
var client_secret = process.env.SPOTIFY_CLIENT_SECRET; // Your secret Spotify
var redirect_uri = process.env.REDIRECT_URI; // Your redirect uri Spotify

const { getNewToken, getChannel } = require("./ytauth.js");

const generateRandomString = (length) => {
  return crypto
  .randomBytes(60)
  .toString('hex')
  .slice(0, length);
}

var stateKey = 'spotify_auth_state';

var app = express();

app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());

app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          console.log(body);
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect('/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

app.get('/refresh_token', function(req, res) {

  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 
      'content-type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64')) 
    },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token,
          refresh_token = body.refresh_token;
      res.send({
        'access_token': access_token,
        'refresh_token': refresh_token
      });
    }
  });
});

app.get('/ytlogin', async function(req, res) {
  try {
    // Make sure the function is async and you can use await
    const content = await fs.promises.readFile('client_secret.json', 'utf8');
    console.log("read file read secret as " + content);

    const credentials = JSON.parse(content);

    // Assuming `authorize` returns a Promise, and we await it here
    const channelData = await authorize(credentials, getChannel); // This works now

    console.log(channelData);

    // Serialize the data to pass it in the URL
    const serializedData = encodeURIComponent(JSON.stringify(channelData));

    // Redirect with the serialized data as query parameter
    res.redirect('http://localhost:3000/ytcallback?data=' + serializedData);

  } catch (err) {
    console.error('Error loading client secret file:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/ytcallback', function(req, res) {
  // Deserialize the channelData from the query parameter
  const serializedData = req.query.data;
  
  // Check if the data exists and parse it
  if (serializedData) {
    try {
      const channelData = JSON.parse(decodeURIComponent(serializedData));

      // Now channelData is an actual JavaScript object
      console.log('Received channelData:', channelData);

      res.send({ 'channelData': channelData });
    } catch (err) {
      console.error('Error parsing channelData:', err);
      res.status(400).send('Invalid channelData');
    }
  } else {
    res.status(400).send('No channelData received');
  }
});

function authorize(credentials) {
  return new Promise((resolve, reject) => {
    const clientSecret = credentials.web.client_secret;
    const clientId = credentials.web.client_id;
    const redirectUrl = credentials.web.redirect_uris[0];
    const oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

    fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) {
        // If no token exists, get a new one
        getNewToken(oauth2Client).then(channelData => resolve(channelData)).catch(reject);
      } else {
        oauth2Client.credentials = JSON.parse(token);
        getChannel(oauth2Client).then(channelData => resolve(channelData)).catch(reject);
      }
    });
  });
}

console.log('Listening on 8888');
app.listen(8888);
