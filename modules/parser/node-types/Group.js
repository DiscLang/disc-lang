function Group() {
    this.type = 'Group';
    this.body;
}

Group.prototype = {
    setBody: function (body) {
        this.body = body;
    }
}

Group.new = function () {
    return new Group();
};

module.exports = Group;
