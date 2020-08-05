const indent = require('./utils/indent');

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
        if(this.fail === null) {
            this.fail = failConditional;
        } else {
            this.fail.setFail(failConditional);
        }
    },

    toString: function () {
        const conditionStart = `${blockType} ${blockType !== 'else' ? this.condition.toString() : ''}`;
        const successContent = this.success.map(line => indent('    ', line.toString()));

        let finalContent = [conditionStart].concat(successContent);

        if(this.fail !== null) {
            finalContent.concat(this.fail.toString());
        }

        if(this.blockType === 'if') {
            finalContent.concat('end');
        }

        return finalContent.join('\n');
    },

    execute: function (scope) {
        const localScope = scope.new();

        if(this.condition.execute(localScope)) {
            for(let i = 0; i < this.success.length; i++) {
                this.success[i].execute(localScope);
            }
        } else if(this.fail !== null) {
            this.fail.execute(scope);
        }
    }
}

Conditional.new = function (blockType, condition) {
    return new Conditional(blockType, condition);
};

module.exports = Conditional;
