(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const booleanOptions = ['true', 'false'];
const transitionalOperators = ['be', 'as', 'to', 'with', 'while'];
const controlOperators = ['loop', 'if', 'else'];
const openBlockDelimiter = 'begin';
const closeBlockDelimiter = 'end';
const callOperator = 'call';
const subtractionToken = '-';
const infixOperators = ['::', 'toInfix'];

const characterSet = {
    operators: ['+', subtractionToken, '*', '/'],
    openGroupDelimiter: '(',
    closeGroupDelimiter: ')',
    functionExecutionIndicator: ':',
    stringBeginIndicator: '"',
    stringEndIndicator: '"',
    stringEscapeCharacter: '\\',
    commentCharacter: '#',
    whitespaceCharacter: ' ',
    subtractionToken: subtractionToken
};

const grammar = {
    'Number': (value) => /^\-?[0-9]+(\.[0-9]+)?$/.test(value),
    'Boolean': (value) => booleanOptions.includes(value.toLowerCase()),
    'String': (value) => value[0] === characterSet.stringBeginIndicator
        && value[value.length - 1] === characterSet.stringEndIndicator,

    'InfixOperator': (value) => infixOperators.includes(value),
    'Operator': (value) => characterSet.operators.concat(['and', 'or']).includes(value),
    'FunctionExecutionIndicator': (value) => value === characterSet.functionExecutionIndicator,

    'OpenGroupDelimiter': (value) => value === characterSet.openGroupDelimiter,
    'CloseGroupDelimiter': (value) => value === characterSet.closeGroupDelimiter,

    'OpenBlockDelimiter': (value) => value.toLowerCase() === openBlockDelimiter,
    'CloseBlockDelimiter': (value) => value.toLowerCase() === closeBlockDelimiter,
    'TransitionalOperator': (value) => transitionalOperators.includes(value.toLowerCase()),

    'CallOperator': (value) => value.toLowerCase() === callOperator,
    'ControlOperator': (value) => controlOperators.includes(value.toLowerCase()),

    'Identifier': () => true,
};

const grammarCheckList = Object
    .keys(grammar)
    .map(key => ({
        type: key,
        test: grammar[key]
    }));

function getTokenType(value) {
    const grammarTokenType = grammarCheckList
        .filter(testObject => testObject.test(value))
        .map(testObject => testObject.type)[0];

    if (typeof grammarTokenType === 'undefined') {
        throw new Error('Unknown value or symbol in source code: ' + value);
    }

    return grammarTokenType;
}

module.exports = {
    grammarTypes: Object.keys(grammar).reduce(function (result, key) {
        result['is' + key] = grammar[key];

        return result;
    }, {}),
    tokenTypes: Object.keys(grammar).reduce(function (tokenTypes, key) {
        tokenTypes[key] = key;

        return tokenTypes;
    }, {}),
    getTokenType,
    characterSet
};
},{}],2:[function(require,module,exports){
const grammar = require('./grammar');

const tokenTypes = grammar.tokenTypes;
const {
    stringBeginIndicator,
    stringEndIndicator,
    stringEscapeCharacter,
    commentCharacter,
    whitespaceCharacter,
    subtractionToken
} = grammar.characterSet;


function lexSource(sourceCode) {
    const sourceLines = sourceCode.split(/\r?\n/);
    const sourceLineTokens = [];

    for (let i = 0; i < sourceLines.length; i++) {
        const currentLine = sourceLines[i];
        const currentLineNumber = i + 1;
        const lexedLine = lexLine(currentLine, currentLineNumber);

        if (lexedLine.length > 0) {
            sourceLineTokens.push(lexedLine);
        }
    }

    return sourceLineTokens;
}

function isWhitespace(character) {
    return character === whitespaceCharacter;
}

function captureString(characterSet) {
    let finalString = '';
    let characterOffset = 0;

    for (let i = 0; i < characterSet.length; i++) {
        const currentCharacter = characterSet[i];

        if (currentCharacter === stringEscapeCharacter) {
            finalString += characterSet[i + 1];
            i++;
        } else if (currentCharacter !== stringEndIndicator) {
            finalString += currentCharacter;
        } else {
            characterOffset = i + 1;
            break;
        }

        characterOffset = i;
    }

    return [finalString, characterOffset];
}

function buildToken(tokenString, line) {
    return {
        line: line,
        token: tokenString,
        type: grammar.getTokenType(tokenString)
    }
}

function getTokenCapture(tokens) {
    return function pushToken(token, line) {
        if (token !== '') {
            const capturedToken = token[0] === stringBeginIndicator
                ? token
                : token.toLowerCase();

            tokens.push(buildToken(capturedToken, line));
        }
    }
}

function lexLine(sourceLine, currentLineNumber) {
    const sourceChars = sourceLine.split('');
    const tokens = [];

    let currentToken;

    const captureToken = getTokenCapture(tokens);

    const resetCurrentToken = () => currentToken = '';

    const pushToken = () => {
        captureToken(currentToken, currentLineNumber);
        resetCurrentToken();
    }

    resetCurrentToken();

    for (let i = 0; i < sourceChars.length; i++) {
        const currentChar = sourceChars[i];

        if (currentChar === commentCharacter) {
            break;
        } else if (currentChar === ':' && sourceChars[i + 1] === ':') {
            pushToken();

            currentToken = '::';
            i++;

            pushToken();
        } else if (
            grammar.grammarTypes.isOperator(currentChar)
            || grammar.grammarTypes.isOpenGroupDelimiter(currentChar)
            || grammar.grammarTypes.isCloseGroupDelimiter(currentChar)
            || grammar.grammarTypes.isFunctionExecutionIndicator(currentChar)
        ) {
            pushToken();

            currentToken = currentChar;

            const lastToken = tokens[tokens.length - 1];

            if (
                currentChar !== subtractionToken
                || lastToken.type === tokenTypes.Number
                || lastToken.type === tokenTypes.CloseGroupDelimiter
            ) {
                pushToken();
            }
        } else if (currentChar === stringBeginIndicator) {
            pushToken();

            const [newString, characterOffset] = captureString(sourceChars.slice(i + 1));

            currentToken = `${stringBeginIndicator}${newString}${stringEndIndicator}`;
            pushToken();

            i += characterOffset;
        } else if (isWhitespace(currentChar) && currentToken !== '') {
            pushToken();
        } else if (!isWhitespace(currentChar)) {
            currentToken += currentChar;
        }
    }

    pushToken();

    return tokens;
}


module.exports = {
    lexSource
};

},{"./grammar":1}],3:[function(require,module,exports){
function BinaryExpression(operator) {
    this.type = 'BinaryExpression';
    this.operator = operator;
}

const mathOperations = {
    '+': (a, b) => a + b,
    '-': (a, b) => a - b,
    '*': (a, b) => a * b,
    '/': (a, b) => a / b,
};

const logicalOperations = {
    'and': (a, b) => a && b,
    'or': (a, b) => a || b
};

function performMathOperation (operator, a, b) {
    if(typeof a !== 'number' || typeof b !== 'number') {
        throw new Error(`Arithmetic operations can only be run on numbers. Received ${a} of type ${typeof a} && ${b} of type ${typeof b}.`);
    }

    return mathOperations[operator](a, b);
}

function performLogicalOperation(operator, a, b) {
    if(typeof a !== 'boolean' || typeof b !== 'boolean') {
        throw new Error(`Logical operations can only be run on boolean values. Received ${a} of type ${typeof a} && ${b} of type ${typeof b}.`);
    }

    return logicalOperations[operator](a, b);
}

BinaryExpression.prototype = {
    setLeft: function (node) {
        this.left = node;
    },
    setRight: function (node) {
        this.right = node;
    },
    toString: function () {
        return `${this.left.toString()} ${this.operator} ${this.right.toString()}`
    },
    execute: function (scope) {
        const left = this.left.execute(scope);
        const right = this.right.execute(scope);

        if(Object.keys(mathOperations).includes(this.operator)) {
            performMathOperation(this.operator, left, right);
        } else {
            performLogicalOperation(this.operator, left, right);
        }
    }
}

BinaryExpression.new = function (name) {
    return new BinaryExpression(name);
};

module.exports = BinaryExpression;

},{}],4:[function(require,module,exports){
const indent = require('./utils/indent');

function Conditional(blockType, condition) {
    this.type = 'Conditional';
    this.blockType = blockType;
    this.condition = condition;
    this.success = [];
    this.fail = null;
}

Conditional.prototype = {
    setSuccess: function (body) {
        this.success = Array.isArray(body) ? body : [];
    },

    setFail: function (failConditional) {
        if(this.fail === null) {
            this.fail = failConditional;
        } else {
            this.fail.setFail(failConditional);
        }
    },

    toString: function () {
        const conditionStart = `${blockType} ${blockType !== 'else' ? this.condition.toString() : ''}`;
        const successContent = this.success.map(line => indent('    ', line.toString()));

        let finalContent = [conditionStart].concat(successContent);

        if(this.fail !== null) {
            finalContent.concat(this.fail.toString());
        }

        if(this.blockType === 'if') {
            finalContent.concat('end');
        }

        return finalContent.join('\n');
    },

    execute: function (scope) {
        const localScope = scope.new();

        if(this.condition.execute(localScope)) {
            for(let i = 0; i < this.success.length; i++) {
                this.success[i].execute(localScope);
            }
        } else if(this.fail !== null) {
            this.fail.execute(scope);
        }
    }
}

Conditional.new = function (blockType, condition) {
    return new Conditional(blockType, condition);
};

module.exports = Conditional;

},{"./utils/indent":13}],5:[function(require,module,exports){
function FunctionCall(name) {
    this.type = 'FunctionCall';
    this.name = name;
    this.arguments = [];
}

FunctionCall.prototype = {
    addArguments: function (parsedArguments) {
        this.arguments = parsedArguments;
    },

    toString: function () {
        const argumentStrings = this.arguments.map(argument => argument.toString());

        return [this.name + ':'].concat(argumentStrings).join(' ');
    },

    execute: function (scope) {
        const behavior = scope.read(this.name);

        if (typeof behavior !== 'function') {
            throw new Error(`Cannot call ${this.name}, it is not a function.`);
        } else {
            const args = this.arguments.map(argument => argument.execute(scope));

            return behavior.apply(null, args);
        }
    }
}

FunctionCall.new = function (name) {
    return new FunctionCall(name);
};

module.exports = FunctionCall;

},{}],6:[function(require,module,exports){
function Group() {
    this.type = 'Group';
    this.body;
}

Group.prototype = {
    setBody: function (body) {
        this.body = body;
    },

    toString: function () {
        return `(${this.body.toString()})`;
    },

    execute: function (scope) {
        return this.body.execute(scope);
    }
}

Group.new = function () {
    return new Group();
};

module.exports = Group;

},{}],7:[function(require,module,exports){
function Identifier(name) {
    this.type = 'Identifier';
    this.name = name;
}

Identifier.prototype = {
    toString: function () {
        return this.name;
    },
    execute: function (scope) {
        const value = scope.read(this.name);

        return value;
    }
}

Identifier.new = function (name) {
    return new Identifier(name);
};

module.exports = Identifier;

},{}],8:[function(require,module,exports){
function InitializationExpression(variableType, identifier, value) {
    this.type = 'InitializationExpression';

    this.variableType = variableType;
    this.identifier = identifier;
    this.value = value;
}

InitializationExpression.prototype = {
    toString: function () {
        if(this.variableType === 'let') {
            return `let ${this.identifier.toString()} be ${this.value.toString()}`;
        } else {
            return `define ${this.identifier.toString()} as ${this.value.toString()}`;
        }
    },

    execute: function (scope) {
        const literalValue = this.value.execute(scope);

        if(this.variableType === 'let') {
            scope.initialize(this.identifier.name, literalValue);
        } else {
            scope.define(this.identifier.name, literalValue);
        }

        return literalValue;
    }
}

InitializationExpression.new = function (variableType, identifier, value) {
    return new InitializationExpression(variableType, identifier, value);
};

module.exports = InitializationExpression;

},{}],9:[function(require,module,exports){
function convertTokenToValue(token) {
    switch (token.type) {
        case 'String':
            return token.token.replace(/^\"(.*)\"$/, '$1');
        case 'Number':
            return Number(token.token);
        case 'Boolean':
            return token.token === 'true';
        default:
            return null;
    }
}

function Literal(token) {
    this.type = 'Literal';
    this.value = convertTokenToValue(token);
}

Literal.prototype = {
    toString: function () {
        return typeof this.value === 'string'
            ? `"${this.value}"`
            : this.value.toString();
    },
    execute: function () {
        return this.value;
    }
}

Literal.new = function (value) {
    return new Literal(value);
};

module.exports = Literal;

},{}],10:[function(require,module,exports){
const indent = require('./utils/indent');

function Loop(condition) {
    this.type = 'Loop';
    this.condition = condition;
    this.body = [];
}

Loop.prototype = {
    setBody: function (body) {
        this.body = body;
    },

    toString: function () {
        const loopStart = `loop while ${this.condition.toString()}`;
        const bodyContent = this.body.map(line => indent('    ', line.toString()));

        return [loopStart].concat(bodyContent).concat(['end']).join('\n');
    },

    execute: function (scope) {
        const localScope = scope.new();

        while(this.condition.execute(localScope)) {
            for(let i = 0; i < this.body.length; i++) {
                this.body[i].execute(localScope);
            }
        }
    }
}

Loop.new = function (condition) {
    return new Loop(condition);
};

module.exports = Loop;

},{"./utils/indent":13}],11:[function(require,module,exports){
const indent = require('./utils/indent');

function Program(body) {
    this.type = 'Program';
    this.body = body;
}

Program.prototype = {
    addBodyNode: function (newNode) {
        this.body.push(newNode);
    },

    toString: function () {
        const bodyStrings = this.body.map(line => indent('    ', line.toString()));

        return ['begin'].concat(bodyStrings).concat('end').join('\n');
    },

    execute: function (scope) {
        this.body.forEach(function(node) {
            node.execute(scope);
        });
    }
}

Program.new = function (body) {
    return new Program(body);
};

module.exports = Program;

},{"./utils/indent":13}],12:[function(require,module,exports){
function UpdateExpression(identifier, value) {
    this.type = 'UpdateExpression';

    this.identifier = identifier;
    this.value = value;
}

UpdateExpression.prototype = {
    toString: function () {
        return `update ${this.identifier.toString()} to ${this.value.toString()}`;
    },

    execute: function (scope) {
        const literalValue = this.value.execute(scope);

        scope.update(this.identifier.name, literalValue);

        return literalValue;
    }
}

UpdateExpression.new = function (identifier, value) {
    return new UpdateExpression(identifier, value);
};

module.exports = UpdateExpression;

},{}],13:[function(require,module,exports){
function indent(spacing, text) {
    return text
        .split('\n')
        .map(line => spacing + line)
        .join('\n');
}

module.exports = indent;
},{}],14:[function(require,module,exports){
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
            const newConditional = Conditional.new('if', condition);

            const success = parseBlockBody(tokenLines);

            newConditional.setSuccess(success);

            let hasElse;
            let elseIsTerminal;

            do {
                hasElse = tokenLines[0][0].token === 'else'
                elseIsTerminal = hasElse && tokenLines[0].length === 1;

                if (hasElse) {
                    const conditionalType = elseIsTerminal
                        ? 'else' : 'else if';

                    let condition;

                    if (elseIsTerminal) {
                        condition = Literal.new({ type: 'Boolean', token: 'true' });
                    } else {
                        cut(tokenLines[0], 2);
                        condition = parseTokenSet(tokenLines[0]);
                    }
                    const elseConditional = Conditional.new(
                        conditionalType,
                        condition);

                    const success = parseBlockBody(cut(tokenLines, 1));

                    elseConditional.setSuccess(success);
                    newConditional.setFail(elseConditional);
                }

                if (elseIsTerminal) {
                    break;
                }

            } while (hasElse)

            parsedLine = newConditional;
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
        || (tokenSet[0].type === 'CallOperator')
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
    const functionArgs = Array.isArray(parsedArgs)
        ? parsedArgs
        : [parsedArgs].filter(argument => Boolean(argument));

    functionCall.addArguments(functionArgs);

    return functionCall;
}

module.exports = {
    parse
};
},{"./node-types/BinaryExpression":3,"./node-types/Conditional":4,"./node-types/FunctionCall":5,"./node-types/Group":6,"./node-types/Identifier":7,"./node-types/InitializationExpression":8,"./node-types/Literal":9,"./node-types/Loop":10,"./node-types/Program":11,"./node-types/UpdateExpression":12}],15:[function(require,module,exports){
function EnvironmentTable(parent = null) {
    this.identifiers = {};
    this.parent = parent;
}

EnvironmentTable.prototype = {
    define: function (key, value) {
        Object.defineProperty(this.identifiers, key, {
            get: function () {
                return value;
            },
            set: function () {
                throw new Error(`Cannot update ${key}. It is a constant value.`);
            }
        });
    },

    initialize: function (key, value) {
        const originalType = typeof value;
        let varValue = value;

        Object.defineProperty(this.identifiers, key, {
            get: function () {
                return varValue;
            },

            set: function (newValue) {
                if (typeof newValue !== originalType) {
                    throw new Error(`Cannot assign '${newValue}' to '${key}'. New value type must be '${originalType}'`);
                }

                varValue = newValue;
            }
        });
    },

    read: function (key) {
        if (typeof this.identifiers[key] !== 'undefined') {
            return this.identifiers[key];
        } else if (this.parent !== null) {
            return this.parent.read(key);
        } else {
            throw new Error(`Cannot read variable '${key}'. It has not been created.`);
        }
    },

    update: function (key, value) {
        if (typeof this.identifiers[key] !== 'undefined') {
            this.identifiers[key] = value;
        } else if (this.parent !== null) {
            this.parent.update(key, value);
        } else {
            throw new Error(`Cannot update variable '${key}'. It has not been created.`);
        }
    },

    new: function () {
        return EnvironmentTable.new(this);
    }
};

EnvironmentTable.new = function (parentScope) {
    return new EnvironmentTable(parentScope);
}

module.exports = EnvironmentTable;

},{}],16:[function(require,module,exports){
function Nil() { }

Nil.prototype = {
    toString: () => "nil"
};

function getNil() {
    const newNil = new Nil();

    return Object.freeze(newNil);
}

function Dictionary() {
    this.map = {};
}

Dictionary.prototype = {
    getSafeKey: function (key) {
        if (typeof key !== 'string') {
            throw new Error('Dictionary keys can only be strings.');
        }
        return key.toLowerCase();
    },

    keys: function () {
        return Object.keys(this.map);
    },

    hasKey: function (key) {
        const safeKey = this.getSafeKey(key);

        return typeof this.map[safeKey] !== 'undefined';
    },

    read: function (key) {
        const safeKey = this.getSafeKey(key);

        return typeof this.map[safeKey] !== 'undefined'
            ? this.map[safeKey]
            : getNil();
    },

    remove: function (key) {
        const safeKey = this.getSafeKey(key);

        this.map[safeKey] = undefined;
        delete this.map[safeKey];
    },

    set: function (key, value) {
        const safeKey = this.getSafeKey(key);

        this.map[safeKey, value];

        return this;
    },

    toString: function () {
        return JSON.stringify(this.map);
    }
};

function verifyNumberValues(operation, a, b) {
    if (typeof a !== 'number' || typeof b !== 'number') {
        throw new Error(`All values provided to ${operation} must be numbers; values received are: ${a} of type ${typeof a} and ${b} of type ${typeof b}`);
    }
}

module.exports = function (promptSync) {
    let finalApi = {};

    finalApi.array = function (...args) {
        return args;
    };

    finalApi.append = function (valuesArray, value) {
        if (!Array.isArray(values)) {
            throw new Error('Append can only add values to an array.');
        }

        valuesArray.push(value);

        return valuesArray;
    };

    finalApi.dictionary = function () {
        return new Dictionary();
    };

    finalApi.hasKey = function (dictionary, key) {
        if (!dictionary instanceof Dictionary) {
            throw new Error('Keys can only be accessed on a dictionary.');
        }

        return dictionary.hasKey(key);
    };

    finalApi.keys = function (dictionary) {
        if (!dictionary instanceof Dictionary) {
            throw new Error('Keys can only be accessed on a dictionary.');
        }

        return dictionary.keys();
    };

    finalApi.read = function (valuesObject, key) {
        if (valuesObject instanceof Dictionary) {
            const safeKey = key.toLowerCase();
            return valuesObject.read(safeKey);
        } else if (Array.isArray(valuesObject)) {
            const safeKey = parseInt(key);

            return typeof valuesObject[safeKey] !== 'undefined'
                ? valuesObject[key]
                : getNil();
        } else {
            throw new Error('Read can only be used on dictionaries and arrays.');
        }
    };

    finalApi.remove = function (valuesObject, key) {
        if (valuesObject instanceof Dictionary) {
            const safeKey = key.remove(key);
            return valuesObject.read(safeKey);
        } else if (Array.isArray(valuesObject)) {
            const safeKey = parseInt(key);

            valuesObject.splice(safeKey, 1);

            return valuesObject;
        } else {
            throw new Error('Read can only be used on dictionaries and arrays.');
        }
    };

    finalApi.set = function (dictionary, key, value) {
        if (!dictionary instanceof Dictionary) {
            throw new Error('Values may only be set on a dictionary.');
        }

        dictionary[key.toLowerCase()] = value;

        return dictionary;
    };

    finalApi.isNil = function (value) {
        return value instanceof Nil;
    };

    // User I/O

    finalApi.print = function (...args) {
        if (typeof window === 'object' && typeof window.print === 'function') {
            window.print(...args);
        } else {
            console.log(...args);
        }
    };

    finalApi.prompt = function (message) {
        if (typeof window === 'object') {
            prompt(message);
        } else {
            const prompt = promptSync()

            return prompt(message).trim();
        }
    };

    // Strings.

    finalApi.join = function (...args) {
        return args.join('');
    };

    finalApi.toLowerCase = function (value) {
        return value.toLowerCase();
    };

    finalApi.toUpperCase = function (value) {
        return value.toUpperCase();
    };

    finalApi.toArray = function (value, delimiter = '') {
        return value.split(delimiter);
    }

    // Logic.

    finalApi.not = function (value) {
        if(typeof value !== 'boolean') {
            throw new Error(`Cannot apply not function to non-boolean values. Got value ${value} of type ${typeof value}`);
        }

        return !value;
    }

    // Math.

    finalApi.isLessThan = function (a, b) {
        verifyNumberValues('isLessThan', a, b);

        return a < b;
    };

    finalApi.isGreaterThan = function (a, b) {
        verifyNumberValues('isGreaterThan', a, b);

        return a > b;
    };

    finalApi.isLessOrEqualTo = function (a, b) {
        verifyNumberValues('isLessOrEqualTo', a, b);

        return !(a > b);
    };

    finalApi.isGreaterOrEqualTo = function (a, b) {
        verifyNumberValues('isGreaterOrEqualTo', a, b);

        return !(a < b);
    };

    finalApi.isEqualTo = function (a, b) {
        return a === b;
    };

    finalApi.random = function (min = 0, max = 1) {
        verifyNumberValues('random', min, max);

        const safeMax = min >= max ? min + Math.abs(max) : max;
        const numberDiff = safeMax - min;
        const randomNumber = Math.random() * numberDiff;

        return randomNumber + min;
    };

    finalApi.absoluteValue = function (value) {
        return Math.abs(value);
    };

    finalApi.floor = function (value) {
        return Math.floor(value);
    };

    finalApi.ceiling = function (value) {
        return Math.ceil(value);
    };

    return finalApi;
};
},{}],17:[function(require,module,exports){
const EnvironmentTable = require('./EnvironmentTable');
const functionDefinitions = require('./functionDefinitions');
const lexer = require('../lexer/sourceLexer');
const parser = require('../parser/tokenParser');

function prepScope(promptSync) {
    const programScope = EnvironmentTable.new();

    Object.keys(functionDefinitions(promptSync)).forEach(function(key){
        programScope.define(key.toLowerCase(), functionDefinitions[key]);
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
},{"../lexer/sourceLexer":2,"../parser/tokenParser":14,"./EnvironmentTable":15,"./functionDefinitions":16}],18:[function(require,module,exports){
const programLoader = require('./modules/runtime/programLoader');

module.exports = {
    loadAndRunProgram: programLoader.loadAndRun
}
},{"./modules/runtime/programLoader":17}]},{},[18]);
