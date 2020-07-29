const fs = require('fs');
const path = require('path');
const lexer = require('../../../modules/lexer/sourceLexer');

function loadSource(fileName) {
    const filePath = path.join(__dirname, '..', 'fixtures', fileName);
    const fileSource = fs.readFileSync(filePath, { encoding: 'utf8' });

    return lexer.lexSource(fileSource);
}

module.exports = {
    loadSource: loadSource
}