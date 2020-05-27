const express = require("express"); // Express web server framework
var request = require("request"); // "Request" library
const querystring = require("query-string");
const cookieParser = require("cookie-parser");
const cors = require("cors");

require("dotenv").config();

const port = process.env.PORT || 5000;
const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_SECRET;
const redirect_uri = "http://localhost:5000/callback";
const dev_url = "http://localhost:3000/";
const spotify_url = "https://accounts.spotify.com";
const spotify_api_url = "https://api.spotify.com";

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
    spotify_url +
    "/authorize?" +
    querystring.stringify({
      response_type: "code",
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state,
      show_dialog: true,
    });

  res.send({ redirectUrl: redirect_url });

  // res.redirect(
  //   "https://accounts.spotify.com/authorize?" +
  //     querystring.stringify({
  //       response_type: "code",
  //       client_id: client_id,
  //       scope: scope,
  //       redirect_uri: redirect_uri,
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
      dev_url +
        "#" +
        querystring.stringify({
          error: "state_mismatch",
        })
    );
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: `${spotify_url}/api/token`,
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: "authorization_code",
      },
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(client_id + ":" + client_secret).toString("base64"),
      },
      json: true,
    };

    request.post(authOptions, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        var access_token = body.access_token,
          refresh_token = body.refresh_token;

        var options = {
          url: `${spotify_api_url}/v1/me`,
          headers: { Authorization: "Bearer " + access_token },
          json: true,
        };

        // use the access token to access the Spotify Web API
        request.get(options, function (error, response, body) {
          console.log(body);
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect(
          dev_url +
            "#" +
            querystring.stringify({
              access_token: access_token,
              refresh_token: refresh_token,
            })
        );
      } else {
        res.redirect(
          dev_url +
            "#" +
            querystring.stringify({
              error: "invalid_token",
            })
        );
      }
    });
  }
});

// GET a list of categories
app.get("/categories", (req, res) => {
  let categories = [];

  var authOptions = {
    url: `${spotify_url}/api/token`,
    form: {
      grant_type: "client_credentials",
    },
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(client_id + ":" + client_secret).toString("base64"),
    },
    json: true,
  };

  request.post(authOptions, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      let access_token = body.access_token;

      // use the access token to access the Spotify Web API
      let options = {
        url: `${spotify_api_url}/v1/browse/categories`,
        headers: { Authorization: "Bearer " + access_token },
        json: true,
      };

      request.get(options, (error, response, body) => {
        console.log(body.categories);
        categories = body.categories;
        res.send({ categories: categories });
      });
    } else {
      // else redirect user
      res.redirect(
        dev_url +
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
