const indent = require('./utils/indent');
const { promisifyExec } = require('./utils/promisify');

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

    execute: async function (scope) {
        try {
            for (let i = 0; i < this.body.length; i++) {
                await promisifyExec(this.body[i], scope);
            }

        } catch (error) {
            if(error.message.includes("'length'")) {
                throw error;
            }
            scope.read('print')(error.message)
        }
    }
}

Program.new = function (body) {
    return new Program(body);
};

module.exports = Program;
