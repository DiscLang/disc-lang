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
    return /[\s\t]/.test(character);
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

function buildToken(originalTokenString, line) {
    const tokenString = originalTokenString[0] === stringBeginIndicator
        ? originalTokenString
        : originalTokenString.toLowerCase();

    return {
        line: line,
        token: tokenString,
        originalToken: originalTokenString,
        type: grammar.getTokenType(tokenString)
    }
}

function getTokenCapture(tokens) {
    return function pushToken(token, line) {
        if (token !== '') {
            tokens.push(buildToken(token, line));
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
