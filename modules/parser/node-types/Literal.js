function Literal(value) {
    this.type = 'Literal';
    this.value = value;
}

Literal.prototype = {
}

Literal.new = function (value) {
    return new Literal(value);
};

module.exports = Literal;
