import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import LoginScreen from "./components/LoginScreen";
import LoggedInScreen from "./components/LoggedInScreen";

function App() {
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.substring(1));
    const token = params.get("access_token");
    const refresh = params.get("refresh_token");
    const error = params.get("error");

    if (error) {
      alert("Authentication error");
    } else if (token) {
      setAccessToken(token);
      setRefreshToken(refresh);

      fetch("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: "Bearer " + token,
        },
      })
        .then(res => res.json())
        .then(data => setProfile(data));
    }
  }, []);

  const handleRefresh = async () => {
    const res = await fetch(`/refresh_token?refresh_token=${refreshToken}`);
    const data = await res.json();
    setAccessToken(data.access_token);
  };

  if (!accessToken) return <LoginScreen />;

  return (
    <LoggedInScreen
      profile={profile}
      accessToken={accessToken}
      refreshToken={refreshToken}
      onRefresh={handleRefresh}
    />
  );
}

export default App;
