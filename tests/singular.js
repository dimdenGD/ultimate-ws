const childProcess = require("child_process");
const fs = require("fs");
const exitHook = require("exit-hook");

let args = process.argv.slice(2);

let u = args.some(arg => arg === '-u');
args = args.filter(arg => arg !== '-u');

let path = args[0];

if (!path) {
    console.error('Usage: node singular.js [-u] <path>');
    process.exit(1);
}

if (u) {
    console.log('Running as Ultimate WS');
    let code = fs.readFileSync(path, 'utf8');
    fs.writeFileSync(path, code.replace('const ws = require("ws");', 'const ws = require("../../../src/index.js");'));
} else {
    let code = fs.readFileSync(path, 'utf8');
    fs.writeFileSync(path, code.replace(`const ws = require("../../../src/index.js");`, `const ws = require("ws");`));
    console.log('Running as normal WS');
}

let node = childProcess.spawn('node', ['-r', './tests/preload.cjs', path]);

node.stdout.on('data', data => {
    console.log(data.toString());
});

node.stderr.on('data', data => {
    console.error(data.toString());
});

exitHook(() => {
    let code = fs.readFileSync(path, 'utf8');
    fs.writeFileSync(path, code.replaceAll(`const ws = require("../../../src/index.js");`, `const ws = require("ws");`));
});
