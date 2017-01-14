/* 
YTRequest Player
ToDo:
- Websocket Rewrite
- Skip Currently Playing Track
- Deletion Endpoint by ID, title, or index
- Serverside duration check
- Configuration file
- Geofencing
*/

var express = require('express'),
    app = express(),
    port = parseInt(process.env.PORT, 10) || 80;
var bodyParser = require('body-parser');
var multer = require('multer'); // v1.0.5
var upload = multer(); // for parsing multipart/form-data
var https = require('https');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({
    extended: true
})); // for parsing application/x-www-form-urlencoded

app.use('/', express.static('public'))
app.use('/list', express.static('public/list.html'))

var playlist = [];
var locked_ips = {};
var exists = false;

Array.prototype.contains = function(k, callback) {
    var self = this;
    return (function check(i) {
        if (i >= self.length) {
            return callback(false);
        }
        if (self[i] === k) {
            return callback(true);
        }
        return process.nextTick(check.bind(null, i + 1));
    }(0));
}

app.post('/playlist/insert', upload.array(), function(req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    console.log(playlist)
    if (req.body.url.toString().match(/^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/)) {
        if ((typeof locked_ips[req.ip] === "undefined") || (locked_ips[req.ip] + 1000 * 60 * 10 < Date.now())) { // 10 minute rate limit per IP address
            exists = false;
            for (x in playlist) {
                if (playlist[x][1] == req.body.url) {
                    exists = true;
                }
            }
            if (exists) {
                res.send(JSON.stringify({
                    'status': 'failed',
                    'reason': 'already_submitted'
                }))
            } else {
                if (/v=([a-z0-9A-Z_-]*)/.test(req.body.url))
                    vidID = req.body.url.toString().match(/v=([a-z0-9A-Z_-]*)/)[1].substr(0, 11);
                else
                    vidID = req.body.url.toString().match(/.be\/([a-z0-9A-Z_-]*)/)[1].substr(0, 11);
                https.get('https://www.googleapis.com/youtube/v3/videos?id=' + vidID + '&key=AIzaSyDYwPzLevXauI-kTSVXTLroLyHEONuF9Rw&part=snippet', function(res2) {
                    var body = '';
                    res2.on("data", function(chunk) {
                        body += chunk;
                    }).on('end', function(data) {
                        body = JSON.parse(body);
                        if (body['pageInfo']['totalResults'] == 1) {
                            playlist.push([body['items'][0]['snippet']['title'], req.body.url])
                            locked_ips[req.ip] = Date.now();
                            res.send(JSON.stringify({
                                'status': 'success',
                                'reason': 'submitted'
                            }))
                        }
                    });
                })
            }
        } else {
            res.send(JSON.stringify({
                'status': 'failed',
                'reason': 'too_many_requests'
            }))
        }
    } else {
        res.send(JSON.stringify({
            'status': 'failed',
            'reason': 'invalid_url'
        }))
    }
})

app.post('/playlist/delete', function(req, res) {
    res.set('Content-Type', 'application/json');
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    if (playlist.indexOf(req.body.url) > -1) {
        playlist = playlist.splice(playlist.indexOf(req.body.url), 1);
        res.send(JSON.stringify({
            'status': 'success',
            'reason': 'success'
        }))
    } else {
        res.send(JSON.stringify({
            'status': 'failed',
            'reason': 'not_in_playlist'
        }))
    }
})


app.get('/playlist/delete/latest', function(req, res) {
    res.set('Content-Type', 'application/json');
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    playlist.shift();
    res.send(JSON.stringify({
        'status': 'success',
        'reason': 'success'
    }))
})

app.get('/playlist/get/all', function(req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.set('Content-Type', 'application/json');
    res.send(JSON.stringify(playlist));
})

app.get('/playlist/get/latest', function(req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.set('Content-Type', 'application/json');
    res.send(JSON.stringify(playlist[0][1]));
})

app.listen(80, function() {
    console.log('YTRequestPlayer listening')
})
