const fs = require('fs');
const sourceLexer = require('../../modules/lexer/sourceLexer');
const simpleSource = fs.readFileSync(__dirname + '/fixtures/simple-source', { encoding: 'utf8' });


describe('Text Lexer', function () {
    it('does something. Test goes here', function () {
        const tokenOutput = sourceLexer.lexSource(simpleSource);

        console.log(tokenOutput);
    });
});