
assert = require 'assert'
{LPDServer, sendLPDJob} = require '../src/lpd'
{timeoutSet} = require 'tafa-misc-util'


SERVER_PORT = 38465


assertBuffersEqual = (x, y) ->
  assert.equal x.toString('base64'), y.toString('base64')


main = () ->
  
  CONTROL_FILE = new Buffer "foo"
  DATA_FILE = new Buffer "bar"
  numJobs = 0
  
  server = new LPDServer verbose:true
  server.on 'job', ({controlFile, dataFile}) ->
    assertBuffersEqual CONTROL_FILE, controlFile
    assertBuffersEqual DATA_FILE, dataFile
    numJobs++
  
  server.listen SERVER_PORT, () ->
    
    sendLPDJob {
      host: 'localhost'
      port: SERVER_PORT
      controlFile: CONTROL_FILE
      dataFile: DATA_FILE
      verbose: true
    }, (e) ->
      throw e if e
      
      timeoutSet 100, () ->
        
        assert.equal numJobs, 1
        
        console.log 'OK'
        process.exit()


if not module.parent
  main()


module.exports =
  main: main
