const indent = require('./utils/indent');

function Program(body) {
    this.type = 'Program';
    this.body = body;
}

Program.prototype = {
    addBodyNode: function (newNode) {
        this.body.push(newNode);
    },

    toString: function () {
        const bodyStrings = this.body.map(line => indent('    ', line.toString()));

        return ['begin'].concat(bodyStrings).concat('end').join('\n');
    },

    execute: function (scope) {
        this.body.forEach(function(node) {
            node.execute(scope);
        });
    }
}

Program.new = function (body) {
    return new Program(body);
};

module.exports = Program;
