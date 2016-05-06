var http = require('http');
var querystring = require('querystring');
var credential = require('./credential.js');
module.exports.get = function(url, lat, lon, callback) {
  var qsObj = {
    lat: lat,
    lon: lon,
    units: 'metric',
    APPID: credential.KEY
  };
  var qs = querystring.stringify(qsObj);
  url = url + '?' + qs;
  http.get(url, function(res) {
      var output = '';
      res.on('data', function(chunk) {
        output += chunk;
      });
      res.on('end', function() {
        var obj = JSON.parse(output);
        callback(obj);
      });
    })
    .on('error', function(e) {
      console.log('error:' + e);
    });
};
