const fs = require('fs');

async function testSpotify() {
  // Use a hardcoded dummy token just to see if Spotify returns 400 or 401
  const searchParams = new URLSearchParams({
    q: 'yeni çıkanlar',
    type: 'track',
    limit: '20'
  });
  
  const searchUrl = 'https://api.spotify.com/v1/search?' + searchParams.toString();
  
  const res = await fetch(searchUrl, {
    headers: {
      'Authorization': 'Bearer invalid_token_12345'
    }
  });
  
  const data = await res.json();
  console.log('Status:', res.status);
  console.log('Data:', JSON.stringify(data, null, 2));
}

testSpotify();
