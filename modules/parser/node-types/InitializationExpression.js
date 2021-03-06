const { promisifyExec } = require('./utils/promisify');

function InitializationExpression(variableType, identifier, value, line) {
    this.type = 'InitializationExpression';

    this.line = line;
    this.variableType = variableType;
    this.identifier = identifier;
    this.value = value;
}

InitializationExpression.prototype = {
    toString: function () {
        if (this.variableType === 'let') {
            return `let ${this.identifier.toString()} be ${this.value.toString()}`;
        } else {
            return `define ${this.identifier.toString()} as ${this.value.toString()}`;
        }
    },

    execute: async function (scope) {
        const literalValue = await promisifyExec(this.value, scope);

        if (this.variableType === 'let') {
            scope.initialize(this.identifier.name, literalValue);
        } else {
            scope.define(this.identifier.name, literalValue);
        }

        return literalValue;
    }
}

InitializationExpression.new = function (variableType, identifier, value, line) {
    return new InitializationExpression(variableType, identifier, value, line);
};

module.exports = InitializationExpression;
