const fs = require('fs');
const parse = require('csv-parse/lib/sync');
const tests = require('./tests.json');

const rows = parse(fs.readFileSync('./confluence_24ddcd3e1.csv'), {
    columns: true
});

// https://stackoverflow.com/a/17572910
function isUpperCase(str) {
    return str === str.toUpperCase();
}

for (const row of rows) {
    const {api, chrome, firefox, safari} = row;
    const [iface, member] = api.split('#');
    const confluenceUrl = `https://web-confluence.appspot.com/#!/catalog?q=%22${iface}%23${member}%22`;
    let bcdPath = `api.${iface}.${member}`;
    let mdnUrl = `https://developer.mozilla.org/en-US/docs/Web/API/${iface}/${member}`;
    if (iface === 'Window' && isUpperCase(member[0])) {
        bcdPath = `api.${member}`;
        mdnUrl = `https://developer.mozilla.org/en-US/docs/Web/API/${member}`;
    }
    const check = bcdPath in tests ? 'x' : ' ';
    console.log(`- [${check}] ${api} ([Confluence](${confluenceUrl}), [MDN](${mdnUrl}))`);
}
