const fs = require('fs');
const sourceLexer = require('../../modules/lexer/sourceLexer');
const simpleSource = fs.readFileSync(__dirname + '/fixtures/simple-source', { encoding: 'utf8' });

require('../test-utilities/approvals')();

describe('Text Lexer', function () {
    it('lexes source document properly', function () {
        const tokenOutput = sourceLexer.lexSource(simpleSource);

        this.verify(JSON.stringify(tokenOutput, null, 4));
    });
});