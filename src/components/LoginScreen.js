import React from "react";
import pandaImg from "../public/images/pandabg.png";
import waveImg from "../public/images/wavebg.png";

const LoginScreen = () => (
  <div className="container text-center py-5" style={{ background: "#f7f9fc", minHeight: "100vh" }}>
    <h1 className="display-4 mb-4 text-primary">🎵 SongDiary</h1>
    <p className="lead text-muted mb-5">Tunes tell a story — capture yours</p>

    <div className="d-flex justify-content-center mb-5 gap-3">
      <a href="http://localhost:8888/login" className="btn btn-success btn-lg px-4">
        <i className="bi bi-spotify"></i> Log in with Spotify
      </a>
      <a href="http://localhost:8888/ytlogin" className="btn btn-danger btn-lg px-4">
        <i className="bi bi-youtube"></i> Log in with YT Music
      </a>
    </div>

    <div className="row justify-content-center">
      <div className="col-md-5 mb-4">
        <img src={pandaImg} className="img-fluid rounded shadow" alt="Panda" />
      </div>
      <div className="col-md-5 mb-4">
        <img src={waveImg} className="img-fluid rounded shadow" alt="Wave" />
      </div>
    </div>
  </div>
);

export default LoginScreen;
