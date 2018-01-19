'use strict';

const CLIENT_ID = '5f795f8bb8c14d94bafa6dcd2ed3038b';

const getFromApi = function (endpoint, query = {}) {
  // You won't need to change anything in this function, but you will use this function 
  // to make calls to Spotify's different API endpoints. Pay close attention to this 
  // function's two parameters.

  const url = new URL(`https://api.spotify.com/v1/${endpoint}`);
  const headers = new Headers();
  headers.set('Authorization', `Bearer ${localStorage.getItem('SPOTIFY_ACCESS_TOKEN')}`);
  headers.set('Content-Type', 'application/json');
  const requestObject = {
    headers
  };

  Object.keys(query).forEach(key => url.searchParams.append(key, query[key]));
  return fetch(url, requestObject).then(function (response) {
    if (!response.ok) {
      return Promise.reject(response.statusText);
    }
    return response.json();
        
  });
};

let artist;

const getArtist = function (name) {
  return getFromApi('search', {
    q: name,
    limit: 1,
    type: 'artist'
  })
    .then(data => {
      artist = data.artists.items[0];
      return getFromApi(`artists/${artist.id}/related-artists`);
    })
    .then(item => {
      artist.related = item.artists;
      let promises = [];
      for (let i=0; i < artist.related.length; i++) {
        promises.push(getFromApi(`artists/${artist.related[i].id}/top-tracks`, { country: 'US' }));
        return artist; 
      } 
      return Promise.all(promises);
    })    
    .then()
        
   

    .catch(error => console.log(error));
};





// =========================================================================================================
// IGNORE BELOW THIS LINE - THIS IS RELATED TO SPOTIFY AUTHENTICATION AND IS NOT NECESSARY  
// TO REVIEW FOR THIS EXERCISE
// =========================================================================================================
const login = function () {
  const AUTH_REQUEST_URL = 'https://accounts.spotify.com/authorize';
  const REDIRECT_URI = 'http://localhost:8888'; 

  const query = new URLSearchParams();
  query.set('client_id', CLIENT_ID);
  query.set('response_type', 'token');
  query.set('redirect_uri', REDIRECT_URI);

  window.location = AUTH_REQUEST_URL + '?' + query.toString();
};

$(() => {
  $('#login').click(login);
});
