const indent = require('./utils/indent');
const { promisifyExec } = require('./utils/promisify');

function Loop(condition) {
    this.type = 'Loop';
    this.condition = condition;
    this.body = [];
}

Loop.prototype = {
    setBody: function (body) {
        this.body = body;
    },

    toString: function () {
        const loopStart = `loop while ${this.condition.toString()}`;
        const bodyContent = this.body.map(line => indent('    ', line.toString()));

        return [loopStart].concat(bodyContent).concat(['end']).join('\n');
    },

    execute: async function (scope) {
        const localScope = scope.new();

        let conditionResult = await promisifyExec(this.condition, localScope);
        let lastResult;

        while(conditionResult) {
            const runScope = localScope.new();

            for (let i = 0; i < this.body.length; i++) {
                lastResult = await promisifyExec(this.body[i], runScope);
            }
            
            conditionResult = await promisifyExec(this.condition, localScope);
        }

        return lastResult;
    }
}

Loop.new = function (condition) {
    return new Loop(condition);
};

module.exports = Loop;
