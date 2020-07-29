const InitializationExpression = (function () {
    function InitializationExpression(identifier, value) {
        this.type = 'InitializationExpression';

        this.identifier = identifier;
        this.value = value;
    }

    InitializationExpression.prototype = {
    }

    InitializationExpression.new = function (identifier, value) {
        return new InitializationExpression(identifier, value);
    };

    return InitializationExpression;
})();

(function () {
    const isNode = typeof module ==='object'
        && module !== null
        && typeof module.exports !== 'undefined';

    if(isNode) {
        module.exports = InitializationExpression;
    }
})();