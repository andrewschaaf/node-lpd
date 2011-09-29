(function() {
  var async, joinBuffers, net, randomToken, sendLPDJob, _ref;
  net = require('net');
  async = require('async');
  _ref = require('tafa-misc-util'), joinBuffers = _ref.joinBuffers, randomToken = _ref.randomToken;
  sendLPDJob = function(_arg, callback) {
    var controlFile, dataFile, host, jobCode, jobHost, port, queue, socket, verbose, _sendAndGetAck;
    host = _arg.host, controlFile = _arg.controlFile, dataFile = _arg.dataFile, port = _arg.port, verbose = _arg.verbose, jobCode = _arg.jobCode, jobHost = _arg.jobHost;
    if (callback == null) {
      callback = (function() {});
    }
    port || (port = 515);
    jobCode || (jobCode = randomToken(3, '123456789'));
    jobHost || (jobHost = randomToken(8));
    if ((typeof controlFile) === 'function') {
      controlFile = controlFile(jobCode, jobHost);
    }
    queue = "";
    socket = net.createConnection(port, host);
    _sendAndGetAck = function(_arg2, callback) {
      var data, description;
      description = _arg2[0], data = _arg2[1];
      if (verbose) {
        console.log("[sendLPDJob] " + description);
      }
      if (verbose) {
        console.log("[sendLPDJob] (" + data.length + " bytes sent)");
      }
      socket.write(data);
      return socket.on('data', function(data) {
        socket.removeListener('data', arguments.callee);
        if (!(data.length === 1 && data[0] === 0)) {
          return callback(new Error("Error response."));
        }
        if (verbose) {
          console.log("[sendLPDJob] Got ack.");
        }
        return callback(null);
      });
    };
    return socket.on('connect', function() {
      return async.forEachSeries([["Command: receive_printer_job", new Buffer("\x02" + queue + "\n")], ['Subcommand: receive_control_file', new Buffer("\x02" + controlFile.length + " cfA" + jobCode + jobHost + "\n")], ['...data...', joinBuffers([controlFile, new Buffer([0])])], ['Subcommand: receive_data_file', new Buffer("\x03" + dataFile.length + " dfA" + jobCode + jobHost + "\n")], ['...data...', joinBuffers([dataFile, new Buffer([0])])]], _sendAndGetAck, function(e) {
        socket.end();
        socket.destroy();
        return callback(e);
      });
    });
  };
  module.exports = {
    sendLPDJob: sendLPDJob
  };
}).call(this);
