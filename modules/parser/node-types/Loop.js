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
        const bodyContent = this.body.map(line => '    ' + line.toString());

        return [loopStart].concat(bodyContent).concat(['end']).join('\n');
    },

    execute: function (scope) {
        const localScope = scope.new();

        while(this.condition.execute(localScope)) {
            for(let i = 0; i < this.body.length; i++) {
                this.body[i].execute(localScope);
            }
        }
    }
}

Loop.new = function (condition) {
    return new Loop(condition);
};

module.exports = Loop;
