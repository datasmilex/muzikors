const https = require('https');

https.get('https://api.spotify.com/v1/search?q=test&type=track&limit=20', {
  headers: {
    'Authorization': 'Bearer undefined'
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(res.statusCode);
    console.log(data);
  });
}).on('error', err => console.error(err));
