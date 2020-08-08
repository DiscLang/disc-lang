const { promisifyExec } = require('./utils/promisify');

function Group() {
    this.type = 'Group';
    this.body;
}

Group.prototype = {
    setBody: function (body) {
        this.body = body;
    },

    toString: function () {
        return `(${this.body.toString()})`;
    },

    execute: async function (scope) {
        return await promisifyExec(this.body, scope);
    }
}

Group.new = function () {
    return new Group();
};

module.exports = Group;
