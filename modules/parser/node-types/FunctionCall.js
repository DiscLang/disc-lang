function FunctionCall(name) {
    this.type = 'FunctionCall';
    this.name = name;
    this.arguments = [];
}

FunctionCall.prototype = {
    addArguments: function (parsedArguments) {
        this.arguments = parsedArguments;
    }
}

FunctionCall.new = function (name) {
    return new FunctionCall(name);
};

module.exports = FunctionCall;
