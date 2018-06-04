var express = require('express');
var request = require('request');
var querystring = require('querystring');
var app = express();

app.use('/', express.static(__dirname + '/'));
app.use('/myTest', express.static(__dirname + '/test.html'));
app.use('/playlist', express.static(__dirname + '/playlist.html'));

app.get('/hello', function(req, res){
    res.send('hello');
});

app.get('/main', function(req, res) {
  var name = 'hello';
  res.render(__dirname + "/test.html", {name:name});
});

// CLientID: a2ff816c53a341db849e76d58e57cd92
// CLientSecret: deb4764130d840ca863761a3e781877f

var client_id = 'a2ff816c53a341db849e76d58e57cd92';
var client_secret = 'deb4764130d840ca863761a3e781877f';
var scope = 'user-read-private user-read-email playlist-modify-private playlist-modify-public';
var redirect_uri = 'http://localhost:3000/callback';

var code = '';
var access_token = '';

app.get('/login', function(req,res) {
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: client_id,
            scope: scope,
            redirect_uri: redirect_uri
    }));
});


app.get('/callback', function(req,res) {
    code = req.query.code || null;
//    res.send('');
    
    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
            code: code,
            redirect_uri: redirect_uri,
            grant_type: 'authorization_code'
        },
        headers: {
            'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
        },
        json: true
    }; 
    
    request.post(authOptions, function(error, response, body) {
        console.log(body);
        if (!error && response.statusCode === 200) {
            access_token = body.access_token;
//            var access_token = body.access_token;
            
            var options = {
//                url: 'https://api.spotify.com/v1/me',
                url: 'https://api.spotify.com/v1/me/playlists',
                headers: { 'Authorization': 'Bearer ' + access_token },
                json: true
            }
            request.get(options, function(error, response, body) {
//                console.log(body);
            });
            
            res.redirect('/myTest#' + 
                querystring.stringify({
                    access_token: access_token,
                    message: 'HELLO_WORLD'
            }));
        }
    });
    
    
//    res.redirect('/#');
    
});

app.get('/playlists',function(req,res) {
    
    var options = {
//        url: 'https://api.spotify.com/v1/me',
        url: 'https://api.spotify.com/v1/me/playlists',
        headers: { 'Authorization': 'Bearer ' + access_token },
        json: true
    }
//    request.get(options, function(error, response, body) {
//        for (var i = 0; i < body.items.length; i++) {
//            console.log(body.items[i].name);
//        }
//        
//    });
    
    res.redirect('/myTest');
});

app.get('/playlist',function(req,res) {
  console.log(req);
  res.redirect('/#');
})

//app.get('/myTest',function(req,res) {
//    console.log('HERE');
//});

app.get('/newPlaylist', function(req,res) {
  console.log('New Playlist');
  
//  POST https://api.spotify.com/v1/users/{user_id}/playlists/{playlist_id}/tracks
  
  var access_token = 'BQCx8EEaI-WlGwgvmKOHORyfcjJAZpmCdy9I_nDy9u7Z5JUizCmC0TZfXsqklbqoMhO-nuQ6DQER-haRtdVWTY0EfgKpGjNMnCl_Vkrf4-pPQvL-E1dr1lzrQVbpg9e8VLPAtUWx3M4ToQfLntXK3hB3NhT5FCCYgDIC2CgpDtuOJ_3KVqszj991WhhhvxvWG2UbZ6_SU5g88FRjK7jjN7_eCeDgrywV3Q';
  
  var track_id = '4D7jMhi6n60TZi9MBuvdYk';
  
  var options = {
//    url: 'https://api.spotify.com/v1/users/{user_id}/playlists/{playlist_id}/tracks'
    url: 'https://api.spotify.com/v1/users/mattskelley-au/playlists/7nOq1mWncPNUmI0tEP83g8/tracks',
    qs: {
      uris:"spotify:track:4iV5W9uYEdYUVa79Axb7Rh"
    },
    headers: { 'Authorization': 'Bearer ' + access_token },
    json: true
  }   
  
  request.post(options, function(error, response, body) {
    console.log(response);
    console.log(body);
  });
  
//  request.post(options, function(error, response, body) {
//    console.log(response);
//  
//  });      
  
});

app.listen(3000);