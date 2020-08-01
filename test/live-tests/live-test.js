const fs = require('fs');
const path = require('path');
const EnvironmentTable = require('../../modules/runtime/EnvironmentTable');
const lexer = require('../../modules/lexer/sourceLexer');
const parser = require('../../modules/parser/tokenParser');

const sourceFileName = process.argv.slice(2)[0];

function loadSource(fileName) {
    const filePath = path.join(__dirname, fileName);
    const fileSource = fs.readFileSync(filePath, { encoding: 'utf8' });

    const lexedSource = lexer.lexSource(fileSource);

    return parser.parse(lexedSource);
}

const initializedScope = EnvironmentTable.new();

initializedScope.define('print', (...args) => console.log(...args));
initializedScope.define('join', (...args) => args.join(''));

loadSource(sourceFileName).execute(initializedScope);