
net = require 'net'
{joinBuffers, randomToken} = require 'tafa-misc-util'



exports.sendJob = sendJob = (host, controlFile, dataFile, opt, callback) ->
  
  debug = opt.debug or false
  jobCode = opt.jobCode or randomToken 3, '123456789'
  jobHost = opt.jobCode or randomToken 8
  
  if (typeof controlFile) == 'function'
    controlFile = controlFile jobCode, jobHost
  
  socket = net.createConnection 515, host
  
  _send = ([debug_msg, msg_data], callback) ->
    if debug
      console.log "Sending #{debug_msg}"
    socket.write msg_data
    socket.on 'data', (data) ->
      socket.removeListener 'data', arguments.callee
      data64 = data.toString('base64')
      if data64 != 'AA=='
        throw new Error "LPD server responded with error: #{data64}"
      if debug
        console.log "Got ack for #{debug_msg}"
      callback()
  
  steps = [
    ['command: receive_printer_job',      receive_printer_job()]
    ['subcommand: receive_control_file',  receive_control_file(controlFile.length, jobCode, jobHost)]
    ['...data...',                        joinBuffers([controlFile, new Buffer [0]])]
    ['subcommand: receive_data_file',     receive_data_file(dataFile.length, jobCode, jobHost)]
    ['...data...',                        joinBuffers([dataFile, new Buffer [0]])]
  ]
  
  socket.on 'connect', () ->
    _send steps[0], () ->
      _send steps[1], () ->
        _send steps[2], () ->
          _send steps[3], () ->
            _send steps[4], () ->
              socket.end()
              socket.destroy()
              callback()


#### Commands
# (wording from server's POV)

receive_printer_job = (queue="") -> new Buffer "\x02#{queue}\n"

#### Subcommands

abort_job = () -> new Buffer "\x01\n"

receive_control_file = (size, jobcode, jobhost) ->
  new Buffer "\x02#{size} cfA#{jobcode}#{jobhost}\n"

receive_data_file = (size, jobcode, jobhost) ->
  new Buffer "\x03#{size} dfA#{jobcode}#{jobhost}\n"

