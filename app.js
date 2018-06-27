var express = require('express');
var request = require('request');
var querystring = require('querystring');
var app = express();

app.use('/', express.static(__dirname + '/'));
app.use('/myTest', express.static(__dirname + '/test.html'));
app.use('/playlist', express.static(__dirname + '/playlist.html'));
//app.use('/newPlaylist',express.static(__dirname + '/data.html'));

app.get('/hello', function(req, res){
    res.send('hello');
});

app.get('/main', function(req, res) {
  var name = 'hello';
  res.render(__dirname + "/test.html", {name:name});
});

var client_id = 'a2ff816c53a341db849e76d58e57cd92';
var client_secret = 'deb4764130d840ca863761a3e781877f';
var scope = 'user-read-private user-read-email playlist-modify-private playlist-modify-public';
var redirect_uri = 'http://localhost:3000/callback';

var code = '';
var access_token = '';

//var global_string = 'my string';
//var global_array = [];

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
        if (!error && response.statusCode === 200) {
            access_token = body.access_token;
//            var access_token = body.access_token;
            
            var options = {
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
    
    res.redirect('/myTest');
});

app.get('/playlist',function(req,res) {
//  console.log(req);
  res.redirect('/#');
})

app.get('/newPlaylist', function(req,res) {
  console.log('New Playlist');
  
  var access_token = req.query.access_token;
  var playlist_id = req.query.playlist_id;
  
  // Get the tracks from a playlist and print to the console screen
  var options = {
    url: 'https://api.spotify.com/v1/users/me/playlists/' + playlist_id + '/tracks',
    headers: { 'Authorization': 'Bearer ' + access_token },
    json: true
  }
  
  request.get(options, function(error, response, body) {
    var track_ids = [];
    for (var i = 0; i < body.items.length; i++) {
      track_ids.push(body.items[i].track.id);
    }
    var options = {
      url: 'https://api.spotify.com/v1/audio-features',
      qs: {
        ids: track_ids.join(",")
      },
      headers: { 'Authorization': 'Bearer ' + access_token },
      json: true
    }
    request.get(options,function(error,response,body) {
      var tracks = []
      for (var i = 0; i < body.audio_features.length; i++) {
        var tmp = {
          id: body.audio_features[i].id,
          tempo: body.audio_features[i].tempo
        }
        tracks.push(tmp);
      }
      tracks.sort(function(a,b) {
        return a.tempo - b.tempo;
      });
      console.log(tracks.map(x=>'spotify:track:' + x.id));
//      PUT https://api.spotify.com/v1/users/{user_id}/playlists/{playlist_id}/tracks
      var options = {
        url: 'https://api.spotify.com/v1/users/me/playlists/' + playlist_id + '/tracks',
        qs: {
          uris: (tracks.map(x=>'spotify:track:' + x.id)).join(",")
        },
        headers: { 'Authorization': 'Bearer ' + access_token },
        json: true
      }
      request.put(options,function(error,response,body) {
        console.log(response);
      })
    })
  })
  
  res.redirect('/playlist#id=' + playlist_id + '&access_token=' + access_token);
});

app.get('/test',function(req,res) {
  console.log(req.query.id);
})

app.listen(3000);