
## Installing
<pre>
npm install lpd
</pre>


## Client Example
<pre>
lpd = require('lpd');
tsp100 = require('<a href="https://github.com/shopkeep/lpd-printers">lpd-printers</a>').tsp100;

<a href="http://en.wikipedia.org/wiki/Netpbm_format">pbm_p4</a> = new Buffer([...]);

lpd.client.sendJob(
              '192.168.0.123',
              tsp100.controlFileForP4(pbm_p4),
              tsp100.dataFileForP4(pbm_p4),
              {},
              function(err){...});
</pre>

## Usage

### lpd.client.sendJob

<pre>
lpd.client.sendJob(host, controlFile, dataFile, options, callback)

options:
  debug      // (default: false)
  jobDigits  // (default: random) 3-digit job number string
  jobHost    // (default: random token)
</pre>
