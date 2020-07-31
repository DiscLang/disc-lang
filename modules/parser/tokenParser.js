const FunctionCall = require('./node-types/FunctionCall');
const Group = require('./node-types/Group');
const Identifier = require('./node-types/Identifier');
const InitializationExpression = require('./node-types/InitializationExpression');
const Literal = require('./node-types/Literal');
const Program = require('./node-types/Program');

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

        const parsedLine = parseTokenSet(tokenLine);
        body.push(parsedLine);

        index++;
    }

    return [body, index];
}

const parsers = [
    [isLiteral, parseLiteral],
    [isGroupOpen, parseGroup],
    [isIdentifier, parseIdentifier],
    [isVariableInitialization, parseVariableInitialization],
    [isFunctionCall, parseFunctionCall]
];

function parseTokenSet(tokenSet) {
    const parser = parsers.find(parserPair => parserPair[0](tokenSet));

    if (tokenSet.length === 0 || isGroupClose(tokenSet)) {
        return;
    } else if (Boolean(parser)) {
        return parser[1](tokenSet);
    } else if (tokenSet.length > 1 && tokenSet[0].type !== 'operator') {
        const firstParsedToken = parseTokenSet([tokenSet[0]]);
        const parsedRemainingTokens = parseTokenSet(tokenSet.slice(1));
        return Boolean(parsedRemainingTokens)
            ? [firstParsedToken].concat(parsedRemainingTokens)
            : firstParsedToken;
    } else {
        throwUnparseableError(tokenSet);
    }
}

function throwUnparseableError(tokenSet) {
    throw new Error("Unable to interpret this program, failing line: " + tokenSet);
}

function isVariableInitialization(tokenLine) {
    return tokenLine.length > 3 &&
        ((tokenLine[0].token === 'let' && tokenLine[2].token === 'be')
            || (tokenLine[0].token === 'define' && tokenLine[2].token === 'as'));
}

function isFunctionCall(tokenSet) {
    return tokenSet.length > 2 &
        tokenSet[0].type === 'Identifier' &&
        tokenSet[1].type === 'FunctionExecutionIndicator'
}

const literalTypes = ['Number', 'Boolean', 'String'];

function isLiteral(tokenSet) {
    return tokenSet.length === 1
        && literalTypes.includes(tokenSet[0].type);
}

function isIdentifier(tokenSet) {
    return tokenSet.length === 1
        && tokenSet[0].type === 'Identifier'
}

function isGroupOpen(tokenSet) {
    return tokenSet[0].type === 'OpenGroupDelimiter';
}

function isGroupClose(tokenSet) {
    return tokenSet[0].type === 'CloseGroupDelimiter';
}

function parseGroup(tokenSet) {
    const newGroup = Group.new();

    const groupBody = parseTokenSet(tokenSet.slice(1));

    if (!Boolean(groupBody) || Array.isArray(groupBody)) {
        throw new Error(`Unparseable group in source: "${tokenSet.map(token => token.token).join(' ')}"`);
    }

    newGroup.setBody(groupBody);

    return newGroup;
}

function parseVariableInitialization(tokenLine) {
    const variableType = tokenLine[0].token;
    const identifier = Identifier.new(tokenLine[1].token);
    const value = parseTokenSet(tokenLine.slice(3));

    return InitializationExpression.new(variableType, identifier, value);
}

function parseLiteral(tokenSet) {
    return Literal.new(tokenSet[0]);
}

function parseIdentifier(tokenSet) {
    return Identifier.new(tokenSet[0].token);
}

function parseFunctionCall(tokenSet) {
    const functionCall = FunctionCall.new(tokenSet[0].token);
    const remainingTokens = tokenSet.slice(2);

    const parsedArgs = parseTokenSet(remainingTokens);
    const functionArgs = Array.isArray(parsedArgs) ? parsedArgs : [parsedArgs];

    functionCall.addArguments(functionArgs);

    return functionCall;
}

module.exports = {
    parse
};