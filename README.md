
## Limitations

I've only implemented the tiny subset of LPD that I've needed. Pull requests welcome.


## LPDServer
<pre>
{LPDServer} = require 'lpd'

server = new LPDServer
server.listen PORT, () -> console.log "Listening on #{PORT}..."
server.on 'job', ({controlFile, dataFile}) ->
</pre>


## sendLPDJob
<pre>
{sendLPDJob} = require 'lpd'

sendJob {
  host:         "..."
  controlFile:  ...Buffer...
  dataFile:     ...Buffer...
  port:         # default: 515
  verbose:      # default: false
  jobDigits:    # default: random 3-digit job number string
  jobHost:      # default: random token
}, (e) ->
</pre>


#### Example
<pre>
{sendLPDJob} = require 'lpd' 
{tsp100} = require '<a href="https://github.com/shopkeep/lpd-printers">lpd-printers</a>'
sendLPDJob {
  host: '192.168.0.123'
  controlFile: tsp100.controlFile,
  dataFile: tsp100.dataFileForP4(<a href="http://en.wikipedia.org/wiki/Netpbm_format">pbm_p4</a>),
}, (e) ->
</pre>
