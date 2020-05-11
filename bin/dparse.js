const fs = require('fs');
const disk = require('diskusage');

function dparse() {
  var d = {};

  d.time = Math.round(new Date().getTime() / 1000);
  try {
    const data = fs.readFileSync('/proc/uptime', 'utf8');
    d.uptime = data.match(/\S+/g)[0];
  } catch (err) {
    d.uptime = 0;
    console.error(err);
  }

  d.cpu = {}
  try {
    const data = fs.readFileSync('/sys/devices/system/cpu/cpu0/cpufreq/scaling_cur_freq', 'utf8');
    d.cpu.freq = data.match(/\S+/g)[0];
  } catch (err) {
    d.cpu.freq = 0;
    console.error(err);
  }

  try {
    const data = fs.readFileSync('/proc/stat', 'utf8');
    const stats = data.split('\n')[0].match(/\S+/g);
    d.cpu.stat = {'user': stats[1],
                  'nice': stats[2],
                  'sys': stats[3],
                  'idle': stats[4],
                  'iowait': stats[5],
                  'irq': stats[6],
                  'softirq': stats[7]};
  } catch (err) {
    d.cpu.stat = {'user': 0, 'nice': 0, 'sys': 0, 'idle': 0, 'iowait': 0,
                       'irq': 0, 'softirq': 0};
    console.error(err);
  }

  try {
    const data = fs.readFileSync('/sys/class/thermal/thermal_zone0/temp', 'utf8');
    d.cpu.temp = data;
  } catch (err) {
    d.cpu.temp = 0;
    console.error(err);
  }

  d.mem = {};
  try {
    const data = fs.readFileSync('/proc/meminfo', 'utf8');
    pmem = {};
    for (const s of data.split('\n')) {
      const ss = s.match(/\S+/g);
      if (ss != null) {
        pmem[ss[0]] = ss[1];
      }
    }

    d.mem.total = +(Number(pmem['MemTotal:']) / 1024).toFixed(2);
    d.mem.free = +(Number(pmem['MemFree:']) / 1024).toFixed(2);
    d.mem.buffers = +(Number(pmem['Buffers:']) / 1024).toFixed(2);
    d.mem.cached = +(Number(pmem['Cached:']) / 1024).toFixed(2);
    if (d.mem.cached != 0) {
      d.mem.cached_percent = +(d.mem.cached / d.mem.total * 100).toFixed(2);
    }
    else {
      d.mem.cached_percent = 0;
    }
    d.mem.used = d.mem.total - d.mem.free;
    if (d.mem.total != 0) {
      d.mem.percent = +(d.mem.used / d.mem.total * 100).toFixed(2);
    }
    else {
      d.mem.percent = 0;
    }

    d.mem.real = {};
    d.mem.real.used = d.mem.total - d.mem.free - d.mem.cached - d.mem.buffers;
    d.mem.real.free = +(d.mem.total - d.mem.real.used).toFixed(2);
    if (d.mem.total != 0) {
      d.mem.real.percent = +(d.mem.real.used / d.mem.total * 100).toFixed(2);
    }
    else {
      d.mem.real.percent = 0;
    }

    d.mem.swap = {}
    d.mem.swap.total = +(Number(pmem['SwapTotal:']) / 1024).toFixed(2);
    d.mem.swap.free = +(Number(pmem['SwapFree:']) / 1024).toFixed(2);
    d.mem.swap.used = +(d.mem.swap.total - d.mem.swap.free).toFixed(2);
    if (d.mem.swap.total != 0) {
      d.mem.swap.percent = +(d.mem.swap.used / d.mem.swap.total * 100).toFixed(2);
    }
    else {
      d.mem.swap.percent = 0;
    }
  } catch (err) {
    d.mem = {
      "total": 0,
      "free": 0,
      "buffers": 0,
      "cached": 0,
      "cached_percent": 0,
      "used": 0,
      "percent": 0,
      "real": {
        "used": 0,
        "free": 0,
        "percent": 0
      },
      "swap": {
        "total": 0,
        "free": 0,
        "used": 0,
        "percent": 0
      }
    };
    console.error(err);
  }

  try {
    const data = fs.readFileSync('/proc/loadavg', 'utf8');
    d.load_avg = data.match(/\S+/g).slice(0, 4);
  } catch (err) {
    d.load_avg = [0, 0, 0, '0/0'];
    console.error(err);
  }

  d.disk = {}
  try {
    let info = disk.checkSync('.');

    d.disk.total = +(info.total / (1024 * 1024 * 1024)).toFixed(3);
    d.disk.free = +(info.available / (1024 * 1024 * 1024)).toFixed(3);
    d.disk.used = d.disk.total - d.disk.free;
    if (d.disk.total != 0) {
      d.disk.percent = +(d.disk.used / d.disk.total * 100).toFixed(2);
    }
    else {
      d.disk.percent = 0;
    }
  }
  catch (err) {
    console.log(err);
  }

  d.net = {}
  try {
    const data = fs.readFileSync('/proc/net/dev', 'utf8');
    const lines = data.split('\n').slice(2);
    d.net.interfaces = [];
    for (const s of lines) {
      const ss = s.match(/\S+/g);
      if (ss != null) {
        d.net.interfaces.push({'name': ss[0].slice(0, -1),
                               'total_in': ss[1],
                               'total_out': ss[9]});
      }
    }
    d.net.count = d.net.interfaces.length;
  } catch (err) {
    d.net.count = 0;
    console.error(err);
  }
  return d;
}

module.exports = dparse;
