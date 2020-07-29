const Identifier = (function () {
    function Identifier(name) {
        this.type = 'Identifier';
        this.name = name;
    }

    Identifier.prototype = {
    }

    Identifier.new = function (name) {
        return new Identifier(name);
    };

    return Identifier;
})();

(function () {
    const isNode = typeof module ==='object'
        && module !== null
        && typeof module.exports !== 'undefined';

    if(isNode) {
        module.exports = Identifier;
    }
})();