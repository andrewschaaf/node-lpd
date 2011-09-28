
net = require 'net'
{EventEmitter} = require 'events'
Binary = require 'binary'


ZERO    = new Buffer [0]
NEWLINE = new Buffer '\n'

_extractLength = (line) ->
  digits = line.slice(1).toString('utf-8').split(' ')[0]
  parseInt digits, 10


class LPDServer extends EventEmitter
  constructor: ({verbose}) ->
    super()
    lpdServer = @
    @tcpServer = net.createServer (c) ->
      console.log "[LPDServer] New connection." if verbose
      s = Binary.stream c
      
      # "\x02#{queue}\n"
      s.scan 'line', NEWLINE
      s.tap ({line}) ->
        c.write ZERO
        
        # "\x02#{controlFile.length} cfA#{jobCode}#{jobHost}\n"
        @scan 'line', NEWLINE
        @tap ({line}) ->
          c.write ZERO
          
          # ...controlFile + ZERO...
          controlFileLength = _extractLength line
          console.log "[LPDServer] controlFileLength: #{controlFileLength} bytes"
          @buffer 'controlFile', controlFileLength
          @buffer 'zero', 1
          @tap ({controlFile}) ->
            c.write ZERO
            
            # "\x03#{dataFile.length} dfA#{jobCode}#{jobHost}\n"
            @scan 'line', NEWLINE
            @tap ({line}) ->
              c.write ZERO
              
              # ...dataFile + ZERO...
              dataFileLength = _extractLength line
              console.log "[LPDServer] dataFileLength: #{dataFileLength} bytes"
              @buffer 'dataFile', _extractLength(line)
              @buffer 'zero', 1
              @tap ({dataFile}) ->
                c.write ZERO
                
                lpdServer.emit 'job', {
                  controlFile:controlFile
                  dataFile:dataFile
                }
  
  listen: (port=515, callback=(->)) ->
    @tcpServer.listen port, callback


module.exports =
  LPDServer: LPDServer
