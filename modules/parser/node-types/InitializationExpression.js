function InitializationExpression(variableType, identifier, value) {
    this.type = 'InitializationExpression';

    this.variableType = variableType
    this.identifier = identifier;
    this.value = value;
}

InitializationExpression.prototype = {
}

InitializationExpression.new = function (variableType, identifier, value) {
    return new InitializationExpression(variableType, identifier, value);
};

module.exports = InitializationExpression;
