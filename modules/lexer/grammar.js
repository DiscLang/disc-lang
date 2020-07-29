const grammar = {
    'Operator': (value) => ['+', '-', '*', '/', ':', '(', ')'].includes(value),
    'Number': (value) => /^\-?[0-9]+(\.[0-9]+)?$/.test(value),
    'Boolean': (value) => !(value.length > 5) && (value.toLowerCase() === 'true' || value.toLowerCase() === 'false'),
    'String': (value) => value[0] === '"' && value[value.length - 1] === '"',
    'Identifier': (value) => !(/^(\"|\-|[0-9])/.test(value))
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
    grammar,
    getTokenType
};