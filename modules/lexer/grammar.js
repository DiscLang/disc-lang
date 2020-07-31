const booleanOptions = ['true', 'false'];
const openBlockDelimiter = 'begin';
const closeBlockDelimiter = 'end';
const subtractionToken = '-';

const characterSet = {
    operators: ['+', subtractionToken, '*', '/'],
    openExpressionDelimiter: '(',
    closeExpressionDelimiter: ')',
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

    'Operator': (value) => characterSet.operators.includes(value),
    'FunctionExecutionIndicator': (value) => value === characterSet.functionExecutionIndicator,

    'OpenExpressionDelimiter': (value) => value === characterSet.openExpressionDelimiter,
    'CloseExpressionDelimiter': (value) => value === characterSet.closeExpressionDelimiter,

    'OpenBlockDelimiter': (value) => value.toLowerCase() === openBlockDelimiter,
    'CloseBlockDelimiter': (value) => value.toLowerCase() === closeBlockDelimiter,

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