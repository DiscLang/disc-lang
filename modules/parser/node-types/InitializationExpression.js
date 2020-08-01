function InitializationExpression(variableType, identifier, value) {
    this.type = 'InitializationExpression';

    this.variableType = variableType
    this.identifier = identifier;
    this.value = value;
}

InitializationExpression.prototype = {
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
