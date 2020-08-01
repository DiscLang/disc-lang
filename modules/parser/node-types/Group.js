function Group() {
    this.type = 'Group';
    this.body;
}

Group.prototype = {
    setBody: function (body) {
        this.body = body;
    },

    execute: function (scope) {
        return this.body.execute(scope);
    }
}

Group.new = function () {
    return new Group();
};

module.exports = Group;
