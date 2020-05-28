import React, { Component } from "react";
import * as API from "../util/API";
import "../styles/home.scss";

class Home extends Component {
  state = {
    categories: [],
    userTopArtists: [],
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
    // GET Spotify's categories
    API.getCategories()
      .then((res) => {
        this.setState({
          categories: res.categories.items,
        });
      })
      .catch((err) => console.log(err));
  }

  render() {
    let { categories, userTopArtists } = this.state;
    console.log("categories", categories);

    return (
      <div className="home-wrap">
        <div className="inner-wrap">
          <h1>Spotify Categories</h1>
          <div className="categories-wrap">
            {categories && (
              <React.Fragment>
                {categories.map((category, i) => {
                  return (
                    <div key={i} className="category-wrap">
                      <figure
                        style={{
                          backgroundImage: `url( ${category.icons[0].url})`,
                        }}
                      >
                        <figcaption>{category.name}</figcaption>
                      </figure>
                    </div>
                  );
                })}
              </React.Fragment>
            )}
          </div>

          <button onClick={this.login}>Login</button>
        </div>
      </div>
    );
  }
}

export default Home;
