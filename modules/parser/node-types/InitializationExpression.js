function InitializationExpression(identifier, value) {
    this.type = 'InitializationExpression';

    this.identifier = identifier;
    this.value = value;
}

InitializationExpression.prototype = {
}

InitializationExpression.new = function (identifier, value) {
    return new InitializationExpression(identifier, value);
};

module.exports = InitializationExpression;
