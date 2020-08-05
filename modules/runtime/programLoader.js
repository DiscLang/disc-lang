const EnvironmentTable = require('./EnvironmentTable');
const functionDefinitions = require('./functionDefinitions');
const lexer = require('../lexer/sourceLexer');
const parser = require('../parser/tokenParser');

function prepScope(promptSync) {
    const programScope = EnvironmentTable.new();
    const functionApi = functionDefinitions(promptSync);

    Object.keys(functionApi).forEach(function(key){
        programScope.define(key.toLowerCase(), functionApi[key]);
    });

    return programScope;
}

function lexAndParse(sourceDocument) {
    const lexedSource = lexer.lexSource(sourceDocument);

    return parser.parse(lexedSource);
}

function loadAndRun(sourceDocument, promptSync) {
    const programScope = prepScope(promptSync);
    const programTree = lexAndParse(sourceDocument);

    programTree.execute(programScope);
}

module.exports = {
    loadAndRun
}