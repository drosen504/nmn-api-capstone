'use strict';

const CLIENT_ID = '5f795f8bb8c14d94bafa6dcd2ed3038b';

const getFromApi = function (endpoint, query = {}) {

  const url = new URL(`https://api.spotify.com/v1/${endpoint}`);
  const headers = new Headers();
  headers.set('Authorization', `Bearer ${localStorage.getItem('SPOTIFY_ACCESS_TOKEN')}`);
  headers.set('Content-Type', 'application/json');
  const requestObject = {
    headers
  };
  console.log(url);

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
    type: 'artist',
    limit: 1
  })
    .then(data => {
      artist = data.artists.items[0];
      return getFromApi(`artists/${artist.id}/related-artists`);
    })
    .then(data => {
      artist.related = data.artists;
      const promises = [];
      artist.related.forEach(relatedArtist => {
        const { id } = relatedArtist;
        promises.push(getFromApi(`artists/${id}/top-tracks`, { country: 'US' }));
      });
      return Promise.all(promises);
    })
    .then(artistTracks => {
      artistTracks.forEach((artistTrack, index) => {
        artist.related[index].tracks = artistTrack.tracks;
      });
      return artist;
    })
    .catch(console.log);
};



const login = function () {
  const AUTH_REQUEST_URL = 'https://accounts.spotify.com/authorize';
  const REDIRECT_URI = 'http://localhost:8888/auth'; 

  const query = new URLSearchParams();
  query.set('client_id', CLIENT_ID);
  query.set('response_type', 'token');
  query.set('redirect_uri', REDIRECT_URI);

  window.location = AUTH_REQUEST_URL + '?' + query.toString();
};

$(() => {
  $('#login').click(login);
});
