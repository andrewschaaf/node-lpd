
net = require 'net'
async = require 'async'
{joinBuffers, randomToken} = require 'tafa-misc-util'


sendLPDJob = ({host, controlFile, dataFile, port, verbose, jobCode, jobHost}, callback=(->)) ->
  
  port    or= 515
  jobCode or= randomToken 3, '123456789'
  jobHost or= randomToken 8
  if (typeof controlFile) == 'function'
    controlFile = controlFile jobCode, jobHost
  
  queue = ""
  
  socket = net.createConnection port, host
  
  _sendAndGetAck = ([description, data], callback) ->
    console.log "[sendLPDJob] #{description}"               if verbose
    console.log "[sendLPDJob] (#{data.length} bytes sent)"  if verbose
    socket.write data
    socket.on 'data', (data) ->
      socket.removeListener 'data', arguments.callee
      return callback(new Error "Error response.") if not (data.length == 1 and data[0] == 0)
      console.log "[sendLPDJob] Got ack." if verbose
      callback null
  
  socket.on 'connect', () ->
    async.forEachSeries [
      # Note: the wording is from the server's POV
      ["Command: receive_printer_job",      new Buffer "\x02#{queue}\n"]
      ['Subcommand: receive_control_file',  new Buffer "\x02#{controlFile.length} cfA#{jobCode}#{jobHost}\n"]
      ['...data...',                        joinBuffers [controlFile, new Buffer [0]]]
      ['Subcommand: receive_data_file',     new Buffer "\x03#{dataFile.length} dfA#{jobCode}#{jobHost}\n"]
      ['...data...',                        joinBuffers([dataFile, new Buffer [0]])]
    ], _sendAndGetAck, (e) ->
      socket.end()
      socket.destroy()
      callback e


module.exports =
  sendLPDJob: sendLPDJob
