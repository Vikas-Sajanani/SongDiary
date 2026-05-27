import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import LoginScreen from "./components/LoginScreen";
import LoggedInScreen from "./components/LoggedInScreen";

function App() {
  const [accessToken, setAccessToken] = useState(null);
  const [profile, setProfile] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.substring(1));
    const token = params.get("access_token");
    const error = params.get("error");

    if (error) {
      setErrorMessage("Authentication failed. Please try again.");
    } else if (token) {
      window.history.replaceState(null, "", window.location.pathname);
      setAccessToken(token);

      fetch("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: "Bearer " + token,
        },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Unable to load Spotify profile");
          }
          return res.json();
        })
        .then((data) => setProfile(data))
        .catch(() => setErrorMessage("Unable to load Spotify profile."));
    }
  }, []);

  const handleRefresh = async () => {
    const res = await fetch("/refresh_token", {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) {
      setErrorMessage("Unable to refresh Spotify session.");
      return;
    }

    const data = await res.json();
    setAccessToken(data.access_token);
    setErrorMessage(null);
  };

  if (!accessToken) return <LoginScreen errorMessage={errorMessage} />;

  return (
    <LoggedInScreen
      profile={profile}
      accessToken={accessToken}
      errorMessage={errorMessage}
      onRefresh={handleRefresh}
    />
  );
}

export default App;
