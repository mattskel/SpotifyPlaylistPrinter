var express = require('express');
var request = require('request');
var querystring = require('querystring');
var app = express();

app.use('/', express.static(__dirname + '/'));
app.use('/myTest', express.static(__dirname + '/test.html'));

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
var scope = 'user-read-private user-read-email';
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
                    access_token: access_token
            }));
        }
    });
    
    
//    res.redirect('/#');
    
});

app.get('/playlist',function(req,res) {
    
    var options = {
//        url: 'https://api.spotify.com/v1/me',
        url: 'https://api.spotify.com/v1/me/playlists',
        headers: { 'Authorization': 'Bearer ' + access_token },
        json: true
    }
    request.get(options, function(error, response, body) {
        for (var i = 0; i < body.items.length; i++) {
            console.log(body.items[i].name);
        }
        
    });
    
    res.redirect('/myTest');
});

app.get('/myTest',function(req,res) {
    console.log('HERE');
});

app.listen(3000);