const fs = require('fs');
const bcd = require('@mdn/browser-compat-data');
const tests = require('./tests.json');

const filename = process.argv[2];
const lines = fs.readFileSync(filename, 'utf8')
                  .split('\n').filter(l => l);

function capitalize(str) {
    return str[0].toUpperCase() + str.substr(1);
}

const outLines = lines.map(line => {
    const [owner, member] = line.substr(6).split(' ')[0].split('#');
    let checkIt = false;
    if (`api.${owner}.${member}` in tests) {
        checkIt = true;
    } else if (`api.${capitalize(owner)}.${member}` in tests) {
        checkIt = true;
    } else if (owner === 'Window' && `api.${member}` in tests) {
        checkIt = true;
    } else if (owner in bcd.javascript.builtins && member in bcd.javascript.builtins[owner]) {
        checkIt = true;
    }
    const check = line.startsWith('- [x] ') || checkIt ? 'x' : ' ';
    return `- [${check}] ${line.substr(6)}`;
});
outLines.push('');

fs.writeFileSync(filename, outLines.join('\n'), 'utf8');
