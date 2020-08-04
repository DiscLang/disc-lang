const BinaryExpression = require('./node-types/BinaryExpression');
const Conditional = require('./node-types/Conditional');
const FunctionCall = require('./node-types/FunctionCall');
const Group = require('./node-types/Group');
const Identifier = require('./node-types/Identifier');
const InitializationExpression = require('./node-types/InitializationExpression');
const Literal = require('./node-types/Literal');
const Loop = require('./node-types/Loop');
const Program = require('./node-types/Program');
const UpdateExpression = require('./node-types/UpdateExpression');

function cut(tokens, count) {
    tokens.splice(0, count);

    return tokens;
}

function getTokenString(tokenSet) {
    return tokenSet
        .map(token =>
            Array.isArray(token)
                ? token[0].token.toString()
                : token.token.toString())
        .join(' ');
}

function parse(tokens) {
    const body = parseBlockBody(tokens.slice(1));
    return Program.new(body);
}

function getNextTokenLine(tokenLines) {
    return tokenLines.splice(0, 1)[0];
}

function isLoop(tokenSet) {
    return tokenSet[0].token === 'loop'
        && tokenSet[1].token === 'while';
}

function parseLoop(currentTokenLine, tokenLines) {
    const tokens = cut(currentTokenLine, 2);
    const condition = parseTokenSet(tokens.slice(0));
    const newLoop = Loop.new(condition);

    const body = parseBlockBody(tokenLines);

    newLoop.setBody(body);

    return newLoop;
}

function parseBlockBody(tokenLines) {
    const body = [];

    while (
        tokenLines.length > 0
        && tokenLines[0][0].token !== 'end'
    ) {
        const currentTokenLine = getNextTokenLine(tokenLines);

        let parsedLine;

        if (currentTokenLine[0].token === 'if') {
            const tokens = cut(currentTokenLine, 1);
            const condition = parseTokenSet(tokens.slice(0));
            const newConditional = Conditional.new(condition);

            const success = parseBlockBody(tokenLines);

            newConditional.setSuccess(success);

            const hasElse = tokenLines[0][0].token === 'else'
            const elseIsTerminal = hasElse && tokenLines[0].length === 1;

            if (hasElse) {
                if (elseIsTerminal) {
                    cut(tokenLines, 1);
                    const fail = parseBlockBody(tokenLines);

                    newConditional.setFail(fail);
                } else {
                    cut(tokenLines[0], 1);
                    const fail = parseBlockBody(tokenLines);

                    newConditional.setFail(fail);
                }
            }

            parsedLine = newConditional;

            if(elseIsTerminal) {
                body.push(parsedLine);
                return body;
            }
        } else if (currentTokenLine[0].token === 'else') {
            tokenLines.unshift(currentTokenLine);

            return body;
        } else if (isLoop(currentTokenLine)) {
            parsedLine = parseLoop(currentTokenLine, tokenLines);
        } else {
            parsedLine = parseTokenSet(currentTokenLine.slice(0));
        }

        body.push(parsedLine);
    }

    if (tokenLines.length === 0) {
        throw new Error('Incomplete program: an "end" declaration is missing.');
    }

    cut(tokenLines, 1);

    return body;
}

function getParsedGroupToken(parsedGroup) {
    return {
        type: 'ParsedTokenSet',
        token: parsedGroup
    };
}

function getParsedBinaryExpression(binaryExpression) {
    return {
        type: 'ParsedBinaryExpression',
        token: binaryExpression
    };
}


const parsers = [
    [isBinaryExpression, parseBinaryExpression],
    [isLiteral, parseLiteral],
    [isGroupOpen, parseGroup],
    [isIdentifier, parseIdentifier],
    [isVariableInitialization, parseVariableInitialization],
    [isVariableUpdate, parseVariableUpdate],
    [isFunctionCall, parseFunctionCall]
];

function parseTokenSet(tokenSet) {
    if (tokenSet.length === 0) {
        return;
    }

    const parser = parsers.find(parserPair => parserPair[0](tokenSet));

    if (isGroupClose(tokenSet)) {
        cut(tokenSet, 1);
        return;
    } else if (Boolean(parser)) {
        return parser[1](tokenSet);
    } else if (tokenSet.length > 1 && tokenSet[0].type !== 'operator') {
        const firstParsedToken = parseTokenSet([tokenSet[0]]);
        cut(tokenSet, 1);

        if (tokenSet[0].type === 'operator') {
            return firstParsedToken;
        } else {
            const parsedRemainingTokens = parseTokenSet(tokenSet);
            return Boolean(parsedRemainingTokens)
                ? [firstParsedToken].concat(parsedRemainingTokens)
                : firstParsedToken;
        }

    } else {
        throwUnparseableError(tokenSet);
    }
}

function throwUnparseableError(tokenSet) {
    const line = Boolean(tokenSet[0].line) ? tokenSet[0].line : 'unknown line';

    throw new Error(`Unable to interpret this program, an error exists at line ${line} near "${getTokenString(tokenSet)}"`);
}

function isVariableInitialization(tokenLine) {
    return tokenLine.length > 3 &&
        ((tokenLine[0].token === 'let' && tokenLine[2].token === 'be')
            || (tokenLine[0].token === 'define' && tokenLine[2].token === 'as'));
}

function isVariableUpdate(tokenLine) {
    return tokenLine.length > 3 &&
        tokenLine[0].token === 'update' && tokenLine[2].token === 'to';
}

function isFunctionCall(tokenSet) {
    return tokenSet.length > 2 &&
        (tokenSet[0].type === 'Identifier' &&
            tokenSet[1].type === 'FunctionExecutionIndicator')
        || (tokenSet[0].type === 'CallOperator' &&
            tokenSet[2].token === 'with')
        || (tokenSet[0].type === 'InfixOperator');
}

const literalTypes = ['Number', 'Boolean', 'String'];
const literalParsedTypes = ['ParsedTokenSet', 'ParsedBinaryExpression'];

function isLiteral(tokenSet) {
    return tokenSet.length === 1
        && (literalTypes.includes(tokenSet[0].type)
            || literalParsedTypes.includes(tokenSet[0].type));
}

function isIdentifier(tokenSet) {
    return tokenSet.length === 1
        && tokenSet[0].type === 'Identifier'
}

function isOperator(tokenSet) {
    return tokenSet[0].type === 'Operator';
}

function isBinaryExpression(tokenSet) {
    return tokenSet.length > 2
        && (isLiteral([tokenSet[0]])
            || isIdentifier([tokenSet[0]]))
        && isOperator([tokenSet[1]]);
}

function isGroupOpen(tokenSet) {
    return tokenSet[0].type === 'OpenGroupDelimiter';
}

function isGroupClose(tokenSet) {
    return tokenSet[0].type === 'CloseGroupDelimiter';
}

function parseBinaryExpression(tokenSet) {
    const binaryExpression = BinaryExpression.new(tokenSet[1].token);
    binaryExpression.setLeft(parseTokenSet([tokenSet[0]]));

    if (['and', '*', '/'].includes(tokenSet[1].token)) {
        let tokenToParse;

        if (isLiteral([tokenSet[2]])) {
            tokenToParse = tokenSet[2];
            cut(tokenSet, 3);
        } else if (isGroupOpen([tokenSet[2]])) {
            parseGroup(cut(tokenSet, 2));

            tokenToParse = tokenSet[0];

            cut(tokenSet, 1);
        } else {
            throw new Error('Arithmetic expression contains an error: ', getTokenString(tokenSet));
        }

        binaryExpression.setRight(parseTokenSet([tokenToParse]));

        const parsedBinaryExpression = getParsedBinaryExpression(binaryExpression);

        tokenSet.unshift(parsedBinaryExpression);

        return parseTokenSet(tokenSet);
    } else {
        binaryExpression.setRight(parseTokenSet(cut(tokenSet, 2)));

        return binaryExpression;
    }
}

function parseGroup(tokenSet) {
    const newGroup = Group.new();

    const groupBody = parseTokenSet(cut(tokenSet, 1));

    if (!Boolean(groupBody) || Array.isArray(groupBody)) {
        throw new Error(`Unparseable group in source: "${getTokenString(tokenSet)}"`);
    }

    newGroup.setBody(groupBody);

    const parsedGroupToken = getParsedGroupToken(newGroup);
    tokenSet.unshift(parsedGroupToken);

    return parseTokenSet(tokenSet);
}

function parseVariableInitialization(tokenLine) {
    const variableType = tokenLine[0].token;
    const identifier = Identifier.new(tokenLine[1].token);
    const value = parseTokenSet(cut(tokenLine, 3));

    return InitializationExpression.new(variableType, identifier, value);
}

function parseVariableUpdate(tokenLine) {
    const identifier = Identifier.new(tokenLine[1].token);
    const value = parseTokenSet(cut(tokenLine, 3));

    return UpdateExpression.new(identifier, value);
}

function parseLiteral(tokenSet) {
    return literalParsedTypes.includes(tokenSet[0].type)
        ? tokenSet[0].token
        : Literal.new(tokenSet[0]);
}

function parseIdentifier(tokenSet) {
    return Identifier.new(tokenSet[0].token);
}

function parseFunctionCall(tokenSet) {
    if (tokenSet.length <= 2) {
        return;
    }

    if (tokenSet[0].type === 'CallOperator') {
        cut(tokenSet, 1);
    } else if (tokenSet[0].type === 'InfixOperator') {
        const operator = tokenSet[0];
        const functionName = tokenSet[2];
        const firstArgument = tokenSet[1];

        tokenSet[0] = functionName;
        tokenSet[1] = operator;
        tokenSet[2] = firstArgument;
    }

    const functionCall = FunctionCall.new(tokenSet[0].token);

    const parsedArgs = parseTokenSet(cut(tokenSet, 2));
    const functionArgs = Array.isArray(parsedArgs) ? parsedArgs : [parsedArgs];

    functionCall.addArguments(functionArgs);

    return functionCall;
}

module.exports = {
    parse
};