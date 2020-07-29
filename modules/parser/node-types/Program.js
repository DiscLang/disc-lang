const Program = (function () {
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

    return Program;
})();

(function () {
    const isNode = typeof module ==='object'
        && module !== null
        && typeof module.exports !== 'undefined';

    if(isNode) {
        module.exports = Program;
    }
})();