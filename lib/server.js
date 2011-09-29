(function() {
  var Binary, EventEmitter, LPDServer, NEWLINE, ZERO, net, _extractLength;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  net = require('net');
  EventEmitter = require('events').EventEmitter;
  Binary = require('binary');
  ZERO = new Buffer([0]);
  NEWLINE = new Buffer('\n');
  _extractLength = function(line) {
    var digits;
    digits = line.slice(1).toString('utf-8').split(' ')[0];
    return parseInt(digits, 10);
  };
  LPDServer = (function() {
    __extends(LPDServer, EventEmitter);
    function LPDServer(_arg) {
      var lpdServer, verbose;
      verbose = _arg.verbose;
      LPDServer.__super__.constructor.call(this);
      lpdServer = this;
      this.tcpServer = net.createServer(function(c) {
        var s;
        if (verbose) {
          console.log("[LPDServer] New connection.");
        }
        s = Binary.stream(c);
        s.scan('line', NEWLINE);
        return s.tap(function(_arg2) {
          var line;
          line = _arg2.line;
          c.write(ZERO);
          this.scan('line', NEWLINE);
          return this.tap(function(_arg3) {
            var controlFileLength;
            line = _arg3.line;
            c.write(ZERO);
            controlFileLength = _extractLength(line);
            console.log("[LPDServer] controlFileLength: " + controlFileLength + " bytes");
            this.buffer('controlFile', controlFileLength);
            this.buffer('zero', 1);
            return this.tap(function(_arg4) {
              var controlFile;
              controlFile = _arg4.controlFile;
              c.write(ZERO);
              this.scan('line', NEWLINE);
              return this.tap(function(_arg5) {
                var dataFileLength;
                line = _arg5.line;
                c.write(ZERO);
                dataFileLength = _extractLength(line);
                console.log("[LPDServer] dataFileLength: " + dataFileLength + " bytes");
                this.buffer('dataFile', _extractLength(line));
                this.buffer('zero', 1);
                return this.tap(function(_arg6) {
                  var dataFile;
                  dataFile = _arg6.dataFile;
                  c.write(ZERO);
                  return lpdServer.emit('job', {
                    controlFile: controlFile,
                    dataFile: dataFile
                  });
                });
              });
            });
          });
        });
      });
    }
    LPDServer.prototype.listen = function(port, callback) {
      if (port == null) {
        port = 515;
      }
      if (callback == null) {
        callback = (function() {});
      }
      return this.tcpServer.listen(port, callback);
    };
    return LPDServer;
  })();
  module.exports = {
    LPDServer: LPDServer
  };
}).call(this);
