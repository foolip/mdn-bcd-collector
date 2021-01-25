const fs = require('fs');
const tests = require('./tests.json');

const filename = process.argv[2];
const lines = fs.readFileSync(filename, 'utf8')
                  .split('\n').filter(l => l);

function capitalize(str) {
    return str[0].toUpperCase() + str.substr(1);
}

const outLines = lines.map(line => {
    const [iface, member] = line.substr(6).split(' ')[0].split('#');
    let haveTest = false;
    if (`api.${iface}.${member}` in tests) {
        haveTest = true;
    } else if (`api.${capitalize(iface)}.${member}` in tests) {
        haveTest = true;
    } else if (iface === 'Window' && `api.${member}` in tests) {
        haveTest = true;
    }
    const check = line.startsWith('- [x] ') || haveTest ? 'x' : ' ';
    return `- [${check}] ${line.substr(6)}`;
});
outLines.push('');

fs.writeFileSync(filename, outLines.join('\n'), 'utf8');
