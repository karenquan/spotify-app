import React, { Component } from "react";
import * as API from "../util/API";
import "../styles/home.scss";

class Home extends Component {
  state = {
    playlists: [],
    searchKeyword: "",
  };

  // Allow user to log in to Spotify
  login = () => {
    API.spotifyLogin()
      .then((res) => {
        window.location.href = res.redirectUrl;
      })
      .catch((err) => console.log(err));
  };

  componentDidMount() {
    // Execute test search for playlists
    API.getPlaylists("happy")
      .then((res) => {
        // get list of playlist ids
        this.setState({ playlists: res.playlists });
        console.log(res);
      })
      .catch((err) => console.log(err));
  }

  render() {
    let { playlists } = this.state;
    // console.log("categories", categories);

    return (
      <div className="home">
        <div className="inner">
          <h1>Search</h1>
          <p>Search for a playlist </p>
          <section className="playlists">
            {playlists && (
              <React.Fragment>
                {playlists.map((playlist, i) => {
                  return (
                    <div key={i} className="playlist">
                      <div className="playlist-info-wrap">
                        <div className="playlist-img">
                          <div
                            className="cover-img"
                            style={{
                              backgroundImage: `url( ${playlist.images[0].url})`,
                            }}
                          ></div>
                        </div>
                        <div className="playlist-info">
                          <a
                            href={playlist.external_urls.spotify}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <h2>{playlist.name}</h2>
                          </a>
                          <p className="playlist-owner">
                            By:{" "}
                            <a
                              href={playlist.owner.external_urls.spotify}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {playlist.owner.display_name}
                            </a>
                          </p>
                          <p
                            className="playlist-description"
                            dangerouslySetInnerHTML={{
                              __html: playlist.description,
                            }}
                          ></p>
                        </div>
                      </div>
                      <div className="playlist-songs"></div>
                    </div>
                  );
                })}
              </React.Fragment>
            )}
          </section>

          <button onClick={this.login}>Login</button>
        </div>
      </div>
    );
  }
}

export default Home;
