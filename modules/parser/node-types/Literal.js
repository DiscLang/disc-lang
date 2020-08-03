function convertTokenToValue(token) {
    switch (token.type) {
        case 'String':
            return token.token.replace(/^\"(.*)\"$/, '$1');
        case 'Number':
            return Number(token.token);
        case 'Boolean':
            return token.token === 'true';
        default:
            return null;
    }
}

function Literal(token) {
    this.type = 'Literal';
    this.value = convertTokenToValue(token);
}

Literal.prototype = {
    toString: function () {
        return typeof this.value === 'string'
            ? `"${this.value}"`
            : this.value.toString();
    },
    execute: function () {
        return this.value;
    }
}

Literal.new = function (value) {
    return new Literal(value);
};

module.exports = Literal;
