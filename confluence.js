const fs = require('fs');
const tests = require('./tests.json');

const lines = fs.readFileSync('../confluence.md/confluence.md', 'utf8')
                  .split('\n').filter(l => l);

function capitalize(str) {
    return str[0].toUpperCase() + str.substr(1);
}

for (const line of lines) {
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
    console.log(`- [${check}] ${line.substr(6)}`);
}
