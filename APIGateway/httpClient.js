const axios = require('axios');

function postToEndpoint(endpoint, data) {
  return axios.post(endpoint, data)
    .then(response => {
      console.log('HTTP request successful:', response.data);
    })
    .catch(error => {
      console.error('Error making HTTP request:', error);
    });
}

module.exports = { postToEndpoint };