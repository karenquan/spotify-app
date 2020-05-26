import React, { Component } from "react";
import * as API from "../../util/API";
import "../../styles/home.scss";

class App extends Component {
  state = {};

  spotifyLogin = () => {
    API.spotifyLogin()
      .then((res) => {
        window.location.href = res.redirectUrl;
      })
      .catch((err) => console.log(err));
  };

  componentDidMount() {}

  render() {
    return (
      <div className="home-wrap">
        <div className="inner-wrap">
          <header>
            <h1>Spotify</h1>
          </header>
          <button onClick={this.spotifyLogin}>Login</button>
        </div>
      </div>
    );
  }
}

export default App;
