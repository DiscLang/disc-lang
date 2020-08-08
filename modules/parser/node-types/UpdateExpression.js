const { promisifyExec } = require('./utils/promisify');

function UpdateExpression(identifier, value) {
    this.type = 'UpdateExpression';

    this.identifier = identifier;
    this.value = value;
}

UpdateExpression.prototype = {
    toString: function () {
        return `update ${this.identifier.toString()} to ${this.value.toString()}`;
    },

    execute: async function (scope) {
        const literalValue = await promisifyExec(this.value, scope);
        
        scope.update(this.identifier.name, literalValue);

        return literalValue;
    }
}

UpdateExpression.new = function (identifier, value) {
    return new UpdateExpression(identifier, value);
};

module.exports = UpdateExpression;
