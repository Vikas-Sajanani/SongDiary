import React from "react";
import pandaImg from "../public/images/pandabg.png";
import waveImg from "../public/images/wavebg.png";

const LoginScreen = () => (
  <div className="container text-center">
    <h1>SongDiary - tunes tell a story</h1>
    <div className="row my-4">
      <div className="col">
        <a href="http://localhost:8888/login" className="btn btn-success">Log in with Spotify</a>
      </div>
      <div className="col">
        <a href="http://localhost:8888/login" className="btn btn-danger">Log in with YT Music</a>
      </div>
    </div>
    <div className="row">
      <div className="col">
        <img src={pandaImg} className="img-fluid" alt="Panda" />
      </div>
      <div className="col">
        <img src={waveImg} className="img-fluid" alt="Wave" />
      </div>
    </div>
  </div>
);

export default LoginScreen;
