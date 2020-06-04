const express = require("express"); // Express web server framework
var request = require("request"); // "Request" library
const querystring = require("query-string");
const cookieParser = require("cookie-parser");
const cors = require("cors");

require("dotenv").config();

const port = process.env.PORT || 5000;
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_SECRET;
const REDIRECT_URI = "http://localhost:5000/callback";
const DEV_URL = "http://localhost:3000/";
const SPOTIFY_URL = "https://accounts.spotify.com";
const SPOTIFY_API_URL = "https://api.spotify.com";

const app = express();

app.use(cookieParser()).use(cors());

/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function (length) {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

let stateKey = "spotify_auth_state";

let clientAuthOptions = {
  url: `${SPOTIFY_URL}/api/token`,
  form: {
    grant_type: "client_credentials",
  },
  headers: {
    Authorization:
      "Basic " +
      Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
  },
  json: true,
};

// Spotify user authorization request
// Return redirect url
// CORS issue when trying to do the redirect here
app.get("/login", (req, res) => {
  let state = generateRandomString(16);
  res.cookie(stateKey, state);

  console.log("got into /login");

  // Authorization scopes
  // https://developer.spotify.com/documentation/general/guides/scopes/

  var scope = "user-read-private user-read-email user-top-read";

  let redirect_url =
    SPOTIFY_URL +
    "/authorize?" +
    querystring.stringify({
      response_type: "code",
      client_id: CLIENT_ID,
      scope: scope,
      redirect_uri: REDIRECT_URI,
      state: state,
      show_dialog: true,
    });

  res.send({ redirectUrl: redirect_url });

  // res.redirect(
  //   "https://accounts.spotify.com/authorize?" +
  //     querystring.stringify({
  //       response_type: "code",
  //       client_id: CLIENT_ID,
  //       scope: scope,
  //       redirect_uri: REDIRECT_URI,
  //       state: state,
  //       show_dialog: true,
  //     })
  // );
});

// Callback after user authenticates
app.get("/callback", function (req, res) {
  // your application requests refresh and access tokens
  // after checking the state parameter

  console.log("got into /callback");

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect(
      DEV_URL +
        "#" +
        querystring.stringify({
          error: "state_mismatch",
        })
    );
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: `${SPOTIFY_URL}/api/token`,
      form: {
        code: code,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      },
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
      },
      json: true,
    };

    request.post(authOptions, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        var access_token = body.access_token,
          refresh_token = body.refresh_token;

        var options = {
          url: `${SPOTIFY_API_URL}/v1/me/top/artists`,
          headers: { Authorization: "Bearer " + access_token },
          json: true,
        };

        // use the access token to access the Spotify Web API
        request.get(options, function (error, response, body) {
          console.log(body);
        });

        // we can also pass the token to the browser to make requests from there
        // res.redirect(
        //   DEV_URL +
        //     "#" +
        //     querystring.stringify({
        //       access_token: access_token,
        //       refresh_token: refresh_token,
        //     })
        // );
        res.redirect(DEV_URL);
      } else {
        // redirect user to home page if they deny access
        // res.redirect(
        //   DEV_URL +
        //     "#" +
        //     querystring.stringify({
        //       error: "invalid_token",
        //     })
        // );
        res.redirect(DEV_URL);
      }
    });
  }
});

/* Search for playlists
  Required query parameters:
  q – search query keywords
  type – comma-separated list (album, artist, playlist, track, show, episode)
  limit (optional) – Min 1, default 20, max 50
  offset (optional) – Default 0, max 2,000 (use with limit to get next page of results)
*/
app.get("/search", (req, res) => {
  request.post(clientAuthOptions, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      let access_token = body.access_token;
      let keywords = req.query.keywords;
      let track_count = {};
      let all_tracks = [],
        playlists = [];

      // use the access token to access the Spotify Web API
      let options = {
        url: `${SPOTIFY_API_URL}/v1/search?q=${keywords}&type=playlist&limit=50`,
        headers: { Authorization: `Bearer ${access_token}` },
        json: true,
      };

      // get playlists
      request.get(options, (error, response, body) => {
        console.log("got playlists");

        // create a list of playlist IDs
        // save all 50 playlists' info
        let playlists_ids = [];
        playlists = body.playlists.items;
        playlists.map((playlist, i) => {
          playlists_ids.push(playlist.id);
        });

        let test_playlists = [];
        test_playlists.push(playlists[0]);
        test_playlists.push(playlists[1]);

        let requests = test_playlists.map((playlist) => {
          //create a promise for each API call
          return new Promise((resolve, reject) => {
            request(
              {
                uri: playlist.tracks.href,
                headers: { Authorization: `Bearer ${access_token}` },
                json: true,
              },
              (err, res, body) => {
                if (err) {
                  reject(err);
                }
                //call the resolve function which is passed to the executor                             //function passed to the promise
                resolve(body);
              }
            );
          });
        });

        Promise.all(requests)
          .then((body) => {
            // body should contain an array of objects (representing a playlist) with the tracks
            let tracks_list = body;

            //check if track is already in track_count array
            tracks_list.forEach((tracks) => {
              tracks.items.forEach((item) => {
                let track_id = item.track.id;
                if (track_count[track_id]) {
                  console.log("track already in list");
                  track_count[track_id] += 1;
                } else {
                  // if not, add it
                  console.log("track not in list");
                  track_count[track_id] = 1;
                  // create a list of all tracks for reference
                  all_tracks.push(item.track);
                }
              });
            });

            // sort list of track count
            // get track info of top tracks from all_tracks

            res.send({ all_tracks: all_tracks });
          })
          .catch((err) => {
            console.log(error);
          });
      });
    } else {
      // else redirect user
      res.redirect(
        DEV_URL +
          "#" +
          querystring.stringify({
            error: "invalid_token",
          })
      );
    }
  });
});

// GET a list of categories
app.get("/categories", (req, res) => {
  request.post(clientAuthOptions, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      let access_token = body.access_token;

      // use the access token to access the Spotify Web API
      let options = {
        url: `${SPOTIFY_API_URL}/v1/browse/categories`,
        headers: { Authorization: "Bearer " + access_token },
        json: true,
      };

      request.get(options, (error, response, body) => {
        res.send({ categories: body.categories });
      });
    } else {
      // else redirect user
      res.redirect(
        DEV_URL +
          "#" +
          querystring.stringify({
            error: "invalid_token",
          })
      );
    }
  });
});

// create a GET route
app.get("/express", (req, res) => {
  res.send({
    express: `YOUR EXPRESS BACKEND IS CONNECTED TO REACT`,
  });
});

// console.log that your server is up and running
app.listen(port, () => console.log(`Listening on port ${port}`));
