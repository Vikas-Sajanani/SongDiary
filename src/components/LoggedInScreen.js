import React from "react";

const LoggedInScreen = ({ profile, accessToken, errorMessage, onRefresh }) => {
  if (!profile) return <p>Loading...</p>;

  const spotifyUrl = profile.external_urls?.spotify;

  return (
    <div className="container text-center mt-4">
      <h1>Logged in as {profile.display_name}</h1>
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
      <div className="row mt-3">
        <div className="col">
          {profile.images?.[0]?.url && <img src={profile.images[0].url} alt="Profile" width="150" />}
        </div>
        <div className="col text-start">
          <dl>
            <dt>Display name</dt><dd>{profile.display_name}</dd>
            <dt>ID</dt><dd>{profile.id}</dd>
            <dt>Email</dt><dd>{profile.email}</dd>
            {spotifyUrl && (
              <>
                <dt>Spotify URI</dt>
                <dd><a href={spotifyUrl} rel="noreferrer" target="_blank">{spotifyUrl}</a></dd>
              </>
            )}
            <dt>Country</dt><dd>{profile.country}</dd>
          </dl>
        </div>
      </div>
      <hr />
      <h2>OAuth Info</h2>
      <dl>
        <dt>Access token</dt><dd>{accessToken ? "Stored in memory for this session" : "Unavailable"}</dd>
        <dt>Refresh token</dt><dd>Stored in an HTTP-only cookie</dd>
      </dl>
      <button className="btn btn-danger mt-3" onClick={onRefresh}>
        Refresh Spotify session
      </button>
    </div>
  );
};

export default LoggedInScreen;
