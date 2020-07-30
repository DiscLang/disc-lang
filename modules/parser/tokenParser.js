const Program = require('./node-types/Program');
const InitializationExpression = require('./node-types/InitializationExpression');
const Identifier = require('./node-types/Identifier');
const Literal = require('./node-types/Literal');

function parse(tokens) {
    const [body] = parseBlockBody(tokens.slice(1));
    return Program.new(body);
}

function parseBlockBody(tokenLines) {
    const body = [];
    let index = 0;
    let unprocessedLines = [];

    if (tokenLines.length === 0) {
        return body;
    }

    while (
        tokenLines[index] &&
        tokenLines[index][0].token !== 'end' &&
        index < tokenLines.length
    ) {
        const tokenLine = tokenLines[index];

        if (isVariableInitialization(tokenLine)) {
            const initialization = parseInitialization(tokenLine);
            body.push(initialization);
        } else {
            unprocessedLines.push(tokenLine);
        }

        index++;
    }

    if(unprocessedLines.length > 0) {
        const firstBadLine = unprocessedLines[0]
            .map(token => token.token)
            .join(' ');

        throw new Error("Unable to interpret this program, failing line: " + firstBadLine);
    }

    return [body, index];
}

function isVariableInitialization(tokenLine) {
    return (tokenLine[0].token === 'let' && tokenLine[2].token === 'be')
        || (tokenLine[0].token === 'define' && tokenLine[2].token === 'as');
}

function parseInitialization(tokenLine) {
    const variableType = tokenLine[0].token;
    const identifier = Identifier.new(tokenLine[1].token);
    const value = parseValue(tokenLine.slice(3));

    return InitializationExpression.new(variableType, identifier, value);
}

function parseValue(valueTokens) {
    if(['Number', 'Boolean', 'String'].includes(valueTokens[0].type)) {
        return Literal.new(valueTokens[0]);
    } else if(valueTokens[0].type === 'Identifier') {
        return Identifier.new(valueTokens[0].token);
    }
}

module.exports = {
    parse
};