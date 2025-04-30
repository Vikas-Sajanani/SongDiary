import React from "react";

const LoggedInScreen = ({ profile, accessToken, refreshToken, onRefresh }) => {
  if (!profile) return <p>Loading...</p>;

  return (
    <div className="container text-center mt-4">
      <h1>Logged in as {profile.display_name}</h1>
      <div className="row mt-3">
        <div className="col">
          <img src={profile.images?.[0]?.url} alt="Profile" width="150" />
        </div>
        <div className="col text-start">
          <dl>
            <dt>Display name</dt><dd>{profile.display_name}</dd>
            <dt>ID</dt><dd>{profile.id}</dd>
            <dt>Email</dt><dd>{profile.email}</dd>
            <dt>Spotify URI</dt><dd><a href={profile.external_urls.spotify}>{profile.external_urls.spotify}</a></dd>
            <dt>Link</dt><dd><a href={profile.href}>{profile.href}</a></dd>
            <dt>Country</dt><dd>{profile.country}</dd>
          </dl>
        </div>
      </div>
      <hr />
      <h2>OAuth Info</h2>
      <dl>
        <dt>Access Token</dt><dd>{accessToken}</dd>
        <dt>Refresh Token</dt><dd>{refreshToken}</dd>
      </dl>
      <button className="btn btn-danger mt-3" onClick={onRefresh}>
        Obtain new token using the refresh token
      </button>
    </div>
  );
};

export default LoggedInScreen;
