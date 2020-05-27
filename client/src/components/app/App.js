import React, { Component } from "react";
import * as API from "../../util/API";
import "../../styles/home.scss";

class App extends Component {
  state = {
    categories: [],
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
    let { categories } = this.state;
    console.log("categories", categories);

    return (
      <div className="home-wrap">
        <div className="inner-wrap">
          <header>
            <h1>Spotify</h1>
          </header>
          {categories && (
            <React.Fragment>
              {categories.map((category, i) => {
                return <div>{category.name}</div>;
              })}
            </React.Fragment>
          )}

          <button onClick={this.login}>Login</button>
        </div>
      </div>
    );
  }
}

export default App;
