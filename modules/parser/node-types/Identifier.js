function Identifier(name) {
    this.type = 'Identifier';
    this.name = name;
}

Identifier.prototype = {
    execute: function (scope) {
        const value = scope.read(this.name);

        return value;
    }
}

Identifier.new = function (name) {
    return new Identifier(name);
};

module.exports = Identifier;
