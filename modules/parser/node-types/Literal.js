const Literal = (function () {
    function Literal(value) {
        this.type = 'Literal';
        this.value = value;
    }

    Literal.prototype = {
    }

    Literal.new = function (value) {
        return new Literal(value);
    };

    return Literal;
})();

(function () {
    const isNode = typeof module ==='object'
        && module !== null
        && typeof module.exports !== 'undefined';

    if(isNode) {
        module.exports = Literal;
    }
})();