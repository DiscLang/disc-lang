function Program(body) {
    this.type = 'Program';
    this.body = body;
}

Program.prototype = {
    addBodyNode: function (newNode) {
        this.body.push(newNode);
    }
}

Program.new = function (body) {
    return new Program(body);
};

module.exports = Program;
