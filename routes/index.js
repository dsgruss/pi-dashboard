var express = require('express');
var router = express.Router();
var os = require( 'os' );
const execSync = require('child_process').execSync;

const dparse = require('../bin/dparse');

/* GET home page. */
router.get('/', function(req, res, next) {
  d = {}
  d.model = { name: 'Raspberry Pi', id: 'raspberry-pi' };
  d.hostip = os.networkInterfaces().eth0[0].address;
  d.user = process.env.USER;
  d.os = os.type();
  d.hostname = os.hostname();

  // d.uname = os.version();  // Added in node v13.11.0
  d.uname = execSync('uname -a');

  cpus = os.cpus();

  d.cpu = {};
  d.cpu.count = cpus.length;
  if (d.cpu.count == 1) {
    d.cpu.model = cpus[0].model + " @ " + cpus[0].speed + " MHz";
  }
  else {
    d.cpu.model = cpus[0].model + " @ " + cpus[0].speed + " MHz × " + d.cpu.count;
  }

  d.version = '1.1.1';

  dint = dparse();
  d.cpu.freqmhz = dint.cpu.freq / 1000;
  res.render('index', { dparse: JSON.stringify(dint), d: d, dint: dint });
});

module.exports = router;
