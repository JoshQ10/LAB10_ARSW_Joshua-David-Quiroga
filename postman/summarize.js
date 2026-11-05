// Resume los reportes JSON de Newman generados por run-concurrent.sh
const fs = require('fs');
const path = require('path');
const dir = process.argv[2];
const files = fs.readdirSync(dir).filter(f => /^run-\d+\.json$/.test(f))
  .sort((a, b) => parseInt(a.match(/\d+/)) - parseInt(b.match(/\d+/)));
let ok = 0, fail = 0; const times = [];
for (const f of files) {
  const run = JSON.parse(fs.readFileSync(path.join(dir, f))).run;
  for (const ex of run.executions) {
    const code = ex.response ? ex.response.code : 'ERR';
    const t = ex.response ? ex.response.responseTime : null;
    const failed = run.failures.length > 0 || code !== 200;
    failed ? fail++ : ok++;
    if (t !== null) times.push(t);
    console.log(`${f.replace('.json', '').padEnd(12)} status=${code} tiempo=${t}ms ${failed ? 'FALLO' : 'OK'}`);
  }
}
if (times.length) {
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  console.log(`Exitosas=${ok} Fallidas=${fail} Min=${Math.min(...times)}ms Max=${Math.max(...times)}ms Promedio=${avg.toFixed(0)}ms`);
}
