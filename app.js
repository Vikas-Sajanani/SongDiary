const express = require("express");
const crypto = require("crypto");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");
require("dotenv").config();

const { getChannel } = require("./ytauth.js");

const OAuth2 = google.auth.OAuth2;
const PORT = Number(process.env.PORT || 8888);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000";
const SPOTIFY_AUTH_STATE_COOKIE = "spotify_auth_state";
const SPOTIFY_REFRESH_COOKIE = "spotify_refresh_token";
const TOKEN_DIR = path.join(
  process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE || ".",
  ".credentials"
);
const TOKEN_PATH = path.join(TOKEN_DIR, "youtube-nodejs-quickstart.json");

const spotifyClientId = process.env.SPOTIFY_CLIENT_ID;
const spotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const spotifyRedirectUri = process.env.REDIRECT_URI;

function requireEnv(name, value) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
}

requireEnv("SPOTIFY_CLIENT_ID", spotifyClientId);
requireEnv("SPOTIFY_CLIENT_SECRET", spotifyClientSecret);
requireEnv("REDIRECT_URI", spotifyRedirectUri);

const app = express();

app
  .use(express.static(path.join(__dirname, "public")))
  .use(express.json())
  .use(
    cors({
      origin: CLIENT_ORIGIN,
      credentials: true,
    })
  )
  .use(cookieParser());

function generateRandomString(length) {
  return crypto.randomBytes(Math.ceil(length / 2)).toString("hex").slice(0, length);
}

function secureCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  };
}

function spotifyBasicAuthHeader() {
  const credentials = Buffer.from(`${spotifyClientId}:${spotifyClientSecret}`).toString("base64");
  return `Basic ${credentials}`;
}

async function requestSpotifyToken(form) {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      Authorization: spotifyBasicAuthHeader(),
    },
    body: new URLSearchParams(form),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = body.error_description || body.error || "Spotify token request failed";
    throw new Error(message);
  }

  return body;
}

app.get("/login", (req, res) => {
  const state = generateRandomString(32);
  res.cookie(SPOTIFY_AUTH_STATE_COOKIE, state, {
    ...secureCookieOptions(),
    maxAge: 10 * 60 * 1000,
  });

  const scope = "user-read-private user-read-email";
  const params = new URLSearchParams({
    response_type: "code",
    client_id: spotifyClientId,
    scope,
    redirect_uri: spotifyRedirectUri,
    state,
  });

  res.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
});

app.get("/callback", async (req, res) => {
  const code = req.query.code;
  const state = req.query.state;
  const storedState = req.cookies ? req.cookies[SPOTIFY_AUTH_STATE_COOKIE] : null;

  if (!state || state !== storedState || typeof code !== "string") {
    res.clearCookie(SPOTIFY_AUTH_STATE_COOKIE, secureCookieOptions());
    res.redirect(`/#${new URLSearchParams({ error: "state_mismatch" }).toString()}`);
    return;
  }

  try {
    const tokenResponse = await requestSpotifyToken({
      code,
      redirect_uri: spotifyRedirectUri,
      grant_type: "authorization_code",
    });

    res.clearCookie(SPOTIFY_AUTH_STATE_COOKIE, secureCookieOptions());
    if (tokenResponse.refresh_token) {
      res.cookie(SPOTIFY_REFRESH_COOKIE, tokenResponse.refresh_token, {
        ...secureCookieOptions(),
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
    }

    res.redirect(
      `/#${new URLSearchParams({
        access_token: tokenResponse.access_token,
      }).toString()}`
    );
  } catch (err) {
    console.error("Spotify callback failed:", err.message);
    res.redirect(`/#${new URLSearchParams({ error: "invalid_token" }).toString()}`);
  }
});

app.post("/refresh_token", async (req, res) => {
  const refreshToken = req.cookies ? req.cookies[SPOTIFY_REFRESH_COOKIE] : null;

  if (!refreshToken) {
    res.status(401).send({ error: "missing_refresh_token" });
    return;
  }

  try {
    const tokenResponse = await requestSpotifyToken({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    });

    if (tokenResponse.refresh_token) {
      res.cookie(SPOTIFY_REFRESH_COOKIE, tokenResponse.refresh_token, {
        ...secureCookieOptions(),
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
    }

    res.send({ access_token: tokenResponse.access_token });
  } catch (err) {
    console.error("Spotify refresh failed:", err.message);
    res.status(502).send({ error: "spotify_refresh_failed" });
  }
});

app.get("/ytlogin", async (req, res) => {
  try {
    const clientSecretPath = path.join(__dirname, "client_secret.json");
    const content = await fs.promises.readFile(clientSecretPath, "utf8");
    const credentials = JSON.parse(content);
    const channelData = await authorize(credentials);

    res.redirect(
      `${CLIENT_ORIGIN}/ytcallback?${new URLSearchParams({
        data: JSON.stringify(channelData),
      }).toString()}`
    );
  } catch (err) {
    console.error("YouTube login failed:", err.message);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/ytcallback", (req, res) => {
  const serializedData = req.query.data;

  if (!serializedData || typeof serializedData !== "string") {
    res.status(400).send("No channelData received");
    return;
  }

  try {
    const channelData = JSON.parse(serializedData);
    res.send({ channelData });
  } catch (err) {
    console.error("Error parsing channelData:", err.message);
    res.status(400).send("Invalid channelData");
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
        reject(new Error("Missing YouTube token. Run the YouTube OAuth setup before using /ytlogin."));
        return;
      }

      try {
        oauth2Client.credentials = JSON.parse(token);
      } catch (parseErr) {
        reject(parseErr);
        return;
      }

      getChannel(oauth2Client).then(resolve).catch(reject);
    });
  });
}

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
