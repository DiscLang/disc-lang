const indent = require('./utils/indent');
const { promisifyExec } = require('./utils/promisify');
const getNil = require('../../runtime/Nil');

function Conditional(blockType, condition) {
    this.type = 'Conditional';
    this.blockType = blockType;
    this.condition = condition;
    this.success = [];
    this.fail = null;
}

Conditional.prototype = {
    setSuccess: function (body) {
        this.success = Array.isArray(body) ? body : [];
    },

    setFail: function (failConditional) {
        if (this.fail === null) {
            this.fail = failConditional;
        } else {
            this.fail.setFail(failConditional);
        }
    },

    toString: function () {
        const conditionStart = `${blockType} ${blockType !== 'else' ? this.condition.toString() : ''}`;
        const successContent = this.success.map(line => indent('    ', line.toString()));

        let finalContent = [conditionStart].concat(successContent);

        if (this.fail !== null) {
            finalContent.concat(this.fail.toString());
        }

        if (this.blockType === 'if') {
            finalContent.concat('end');
        }

        return finalContent.join('\n');
    },

    execute: async function (scope) {
        const localScope = scope.new();

        let conditionResult = await promisifyExec(this.condition, localScope);
        let lastResult = getNil();

        if(conditionResult) {
            const actions = this.success;

            for(let i = 0; i < actions.length; i++) {
                lastResult = await promisifyExec(actions[i], localScope);
            }

            return lastResult;
        } else if (this.fail !== null) {
            return promisifyExec(this.fail, scope);
        } else {
            return lastResult;
        }
    }
}

Conditional.new = function (blockType, condition) {
    return new Conditional(blockType, condition);
};

module.exports = Conditional;
