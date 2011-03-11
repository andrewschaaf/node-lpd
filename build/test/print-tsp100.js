(function() {
  var controlFile, dataFile, fs, host, lpd;
  fs = require('fs');
  lpd = require('lpd');
  host = '192.168.0.199';
  controlFile = fs.readFileSync('sample-control-tsp100');
  dataFile = fs.readFileSync('sample-data-tsp100');
  lpd.client.sendJob(host, controlFile, dataFile, {
    debug: true
  }, function(e) {
    return console.log("Done.");
  });
}).call(this);
