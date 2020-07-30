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

    if (tokenLines.length === 0) {
        return body;
    }

    while (
        tokenLines[index] &&
        tokenLines[index][0].token !== 'end' &&
        index < tokenLines.length
    ) {
        const tokenLine = tokenLines[index];

        if (tokenLine[0].token === 'let') {
            const initialization = parseInitialization(tokenLine);
            body.push(initialization);
        }

        index++;
    }

    return [body, index];
}

function parseInitialization(tokenLine) {
    const identifier = Identifier.new(tokenLine[1].token);
    const value = parseValue(tokenLine.slice(3));

    return InitializationExpression.new(identifier, value);
}

function parseValue(valueTokens) {
    return Literal.new(valueTokens[0]);
}

module.exports = {
    parse
};