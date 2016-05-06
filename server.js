var http = require('http');
var querystring = require('querystring');
var express = require('express');
var weather = require('./api/weatherAPI.js');
var app = express();
app.use(express.static('public'));

app.get('/weather', function(req, res) {
  weather.get('http://api.openweathermap.org/data/2.5/weather', req.query.lat, req.query.lon, function(obj) {
    res.send(obj);
  });
});

app.get('/forecast', function(req, res) {
  weather.get('http://api.openweathermap.org/data/2.5/forecast', req.query.lat, req.query.lon, function(obj) {
    res.send(obj);
  });
});

app.listen(3000, function() {
  console.log('app listening on port 3000');
});
