import React, { Component } from "react";
import * as API from "../util/API";
import "../styles/home.scss";

class Home extends Component {
  state = {
    playlists: [],
    searchKeyword: "",
    topTracks: [],
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
        this.setState({ playlists: res.playlists, topTracks: res.top_tracks });
        console.log(res);
      })
      .catch((err) => console.log(err));
  }

  render() {
    let { playlists, topTracks } = this.state;
    // console.log("categories", categories);

    return (
      <div className="home">
        <div className="inner">
          {/* <h1>Search</h1>
          <p>Search for a playlist </p> */}
          <h2>Top 100 songs</h2>
          <section className="top-tracks">
            {topTracks &&
              topTracks.map((track, i) => {
                return (
                  <div className="top-track" key={i}>
                    <p>{track.name}</p>
                    <p>
                      By:{" "}
                      {track.artists.map((artist, j) => {
                        return j === track.artists.length - 1 ? (
                          <span key={j}>{artist.name}</span>
                        ) : (
                          <span key={j}>{artist.name}, </span>
                        );
                      })}
                    </p>
                  </div>
                );
              })}
          </section>
          <section className="playlists">
            {playlists &&
              playlists.map((playlist, i) => {
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
          </section>

          <button onClick={this.login}>Login</button>
        </div>
      </div>
    );
  }
}

export default Home;
