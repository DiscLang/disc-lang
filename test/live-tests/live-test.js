const fs = require('fs');
const path = require('path');
const EnvironmentTable = require('../../modules/runtime/EnvironmentTable');
const lexer = require('../../modules/lexer/sourceLexer');
const parser = require('../../modules/parser/tokenParser');
const functionDefinitions = require('../../modules/runtime/functionDefinitions');

const sourceFileName = process.argv.slice(2)[0];

function loadSource(fileName) {
    const filePath = path.join(__dirname, fileName);
    const fileSource = fs.readFileSync(filePath, { encoding: 'utf8' });

    const lexedSource = lexer.lexSource(fileSource);

    return parser.parse(lexedSource);
}

const initializedScope = EnvironmentTable.new();

Object.keys(functionDefinitions).forEach(function(key){
    initializedScope.define(key.toLowerCase(), functionDefinitions[key]);
})


const parsedSource = loadSource(sourceFileName);

console.log('\n********** Program source: **********\n');

console.log(parsedSource.toString());

console.log('\n********** Program output: **********\n');

parsedSource.execute(initializedScope);