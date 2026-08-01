const https = require('https');

https.get('https://api.spotify.com/v1/search?q=dgf&type=track&limit=20&market=TR', {
  headers: {
    'Authorization': 'Bearer dummy'
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(res.statusCode);
    console.log(data);
  });
}).on('error', err => console.error(err));
