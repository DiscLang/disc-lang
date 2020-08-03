function FunctionCall(name) {
    this.type = 'FunctionCall';
    this.name = name;
    this.arguments = [];
}

FunctionCall.prototype = {
    addArguments: function (parsedArguments) {
        this.arguments = parsedArguments;
    },

    toString: function () {
        const argumentStrings = this.arguments.map(argument => argument.toString());

        return [this.name + ':'].concat(argumentStrings).join(' ');
    },

    execute: function (scope) {
        const behavior = scope.read(this.name);

        if (typeof behavior !== 'function') {
            throw new Error(`Cannot call ${this.name}, it is not a function.`);
        } else {
            const args = this.arguments.map(argument => argument.execute(scope));

            return behavior.apply(null, args);
        }
    }
}

FunctionCall.new = function (name) {
    return new FunctionCall(name);
};

module.exports = FunctionCall;
