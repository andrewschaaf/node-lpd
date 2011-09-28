(function() {
  var abort_job, joinBuffers, net, randomToken, receive_control_file, receive_data_file, receive_printer_job, sendJob, _ref;
  net = require('net');
  _ref = require('tafa-misc-util'), joinBuffers = _ref.joinBuffers, randomToken = _ref.randomToken;
  exports.sendJob = sendJob = function(host, controlFile, dataFile, opt, callback) {
    var debug, jobCode, jobHost, socket, steps, _send;
    debug = opt.debug || false;
    jobCode = opt.jobCode || randomToken(3, '123456789');
    jobHost = opt.jobCode || randomToken(8);
    if ((typeof controlFile) === 'function') {
      controlFile = controlFile(jobCode, jobHost);
    }
    socket = net.createConnection(515, host);
    _send = function(_arg, callback) {
      var debug_msg, msg_data;
      debug_msg = _arg[0], msg_data = _arg[1];
      if (debug) {
        console.log("Sending " + debug_msg);
      }
      socket.write(msg_data);
      return socket.on('data', function(data) {
        var data64;
        socket.removeListener('data', arguments.callee);
        data64 = data.toString('base64');
        if (data64 !== 'AA==') {
          throw new Error("LPD server responded with error: " + data64);
        }
        if (debug) {
          console.log("Got ack for " + debug_msg);
        }
        return callback();
      });
    };
    steps = [['command: receive_printer_job', receive_printer_job()], ['subcommand: receive_control_file', receive_control_file(controlFile.length, jobCode, jobHost)], ['...data...', joinBuffers([controlFile, new Buffer([0])])], ['subcommand: receive_data_file', receive_data_file(dataFile.length, jobCode, jobHost)], ['...data...', joinBuffers([dataFile, new Buffer([0])])]];
    return socket.on('connect', function() {
      return _send(steps[0], function() {
        return _send(steps[1], function() {
          return _send(steps[2], function() {
            return _send(steps[3], function() {
              return _send(steps[4], function() {
                socket.end();
                socket.destroy();
                return callback();
              });
            });
          });
        });
      });
    });
  };
  receive_printer_job = function(queue) {
    if (queue == null) {
      queue = "";
    }
    return new Buffer("\x02" + queue + "\n");
  };
  abort_job = function() {
    return new Buffer("\x01\n");
  };
  receive_control_file = function(size, jobcode, jobhost) {
    return new Buffer("\x02" + size + " cfA" + jobcode + jobhost + "\n");
  };
  receive_data_file = function(size, jobcode, jobhost) {
    return new Buffer("\x03" + size + " dfA" + jobcode + jobhost + "\n");
  };
}).call(this);
