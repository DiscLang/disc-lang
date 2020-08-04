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
        // const loopStart = `loop while ${this.condition.toString()}`;
        // const bodyContent = this.body.map(line => '    ' + line.toString());

        // return [loopStart].concat(bodyContent).concat(['end']).join('\n');
        return '';
    },

    execute: function (scope) {
        const localScope = scope.new();

        if(this.condition.execute(localScope)) {
            for(let i = 0; i < this.success.length; i++) {
                this.success[i].execute(localScope);
            }
        } else {
            for(let i = 0; i < this.fail.length; i++) {
                this.fail[i].execute(localScope);
            }
        }
    }
}

Conditional.new = function (blockType, condition) {
    return new Conditional(blockType, condition);
};

module.exports = Conditional;
