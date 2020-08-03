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
