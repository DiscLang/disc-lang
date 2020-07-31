const grammar = require('./grammar');

function lexSource(sourceCode) {
    const sourceLines = sourceCode.split(/\r?\n/);
    const sourceLineTokens = [];

    for (let i = 0; i < sourceLines.length; i++) {
        const currentLine = sourceLines[i];
        const lexedLine = lexLine(currentLine);

        if (lexedLine.length > 0) {
            sourceLineTokens.push(lexedLine);
        }
    }

    return sourceLineTokens;
}

function isWhitespace(character) {
    return character === ' ';
}

function captureString(characterSet) {
    let finalString = '';
    let characterOffset = 0;

    for (let i = 0; i < characterSet.length; i++) {
        const currentCharacter = characterSet[i];

        if (currentCharacter === '\\') {
            finalString += characterSet[i + 1];
            i++;
        } else if (currentCharacter !== '"') {
            finalString += currentCharacter;
        } else {
            // console.log(currentCharacter);
            characterOffset = i + 1;
            break;
        }

        characterOffset = i;
    }

    return [finalString, characterOffset];
}

function buildToken(tokenString) {
    return {
        token: tokenString,
        type: grammar.getTokenType(tokenString)
    }
}

function getTokenCapture(tokens) {
    return function pushToken(token) {
        if (token !== '') {
            const capturedToken = token[0] === '"'
                ? token
                : token.toLowerCase();

            tokens.push(buildToken(capturedToken));
        }
    }
}

function lexLine(sourceLine) {
    const sourceChars = sourceLine.split('');
    const tokens = [];

    let currentToken = '';

    const captureToken = getTokenCapture(tokens);
    const pushToken = () => {
        captureToken(currentToken);
        currentToken = '';
    }

    for (let i = 0; i < sourceChars.length; i++) {
        const currentChar = sourceChars[i];

        if (currentChar === '#') {
            break;
        } else if (
            grammar.grammarTypes.isOperator(currentChar)
            || grammar.grammarTypes.isOpenExpressionDelimiter(currentChar)
            || grammar.grammarTypes.isCloseExpressionDelimiter(currentChar)
            || grammar.grammarTypes.isFunctionExecutionIndicator(currentChar)
        ) {
            pushToken();

            currentToken = currentChar;
            pushToken();
        } else if (currentChar === '"') {
            pushToken();

            const [newString, characterOffset] = captureString(sourceChars.slice(i + 1));

            currentToken = `"${newString}"`;
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
