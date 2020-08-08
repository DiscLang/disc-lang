const { promisifyExec } = require('./utils/promisify');
const indent = require('./utils/indent');

function FunctionDeclaration(name) {
    this.type = 'FunctionDeclaration';
    this.name = name;
    this.parameters = [];
    this.body = [];
}

FunctionDeclaration.prototype = {
    setBody: function(body) {
        this.body = body;
    },

    toString: function () {
        let functionStart = `declare function ${this.name}`;

        if(this.parameters.length > 0) {
            const parameterString = this.parameters.map(parameter => parameter.toString()).join(' ');
            functionStart += ' withparameters ' + parameterString;
        }

        const bodyContent = this.body.map(line => indent('    ', line.toString()));

        return [functionStart].concat(bodyContent).concat(['end']).join('\n');
    },

    execute: function (scope) {
        const newFunction = async function (...args) {
            if(args.length != this.parameters.length) {
                throw new Error(`Function '${this.name}' takes ${this.parameters.length} arguments, but received ${this.args.length}.`);
            }

            const localScope = scope.new();

            for (let i = 0; i < this.parameters.length; i++) {
                const parameterName = this.parameters[i].toString();
                
                localScope.initialize(parameterName, args[i]);
            }

            let result;

            for (let i = 0; i < this.body.length; i++) {
                const line = this.body[i];
                result = promisifyExec(line, localScope);
            }

            return result;
        };

        scope.define(this.name.toLowerCase(), newFunction);
    }
};

FunctionDeclaration.new = function (name) {
    return new FunctionDeclaration(name);
};

module.exports = FunctionDeclaration;