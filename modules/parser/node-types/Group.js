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

    execute: function (scope) {
        return this.body.execute(scope);
    }
}

Group.new = function () {
    return new Group();
};

module.exports = Group;
