// Fetches our GET route from the Express server. (Note the route we are fetching matches the GET route from server.js
const callBackendAPI = async () => {
  const response = await fetch("/express");
  const body = await response.json();

  if (response.status !== 200) {
    throw Error(body.message);
  }
  return body;
};

// Spotify user authorization request
// This returns the redirect url so the front end can perform the redirect
// CORS issue with the back end redirect
const spotifyLogin = async () => {
  const response = await fetch("/login");
  const body = await response.json();

  if (response.status !== 200) {
    throw Error(body.message);
  }

  return body;
};

// search for playlists
const getPlaylists = async (keywords) => {
  // encode spaces for multiple keywords
  let _keywords = encodeURIComponent(keywords);

  const response = await fetch(`/search?keywords=${_keywords}`);
  const body = await response.json();

  if (response.status !== 200) {
    throw Error(body.message);
  }

  return body;
};

export { spotifyLogin, getPlaylists, callBackendAPI };
