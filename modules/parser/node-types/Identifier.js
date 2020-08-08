function Identifier(name) {
    this.type = 'Identifier';
    this.name = name;
}

Identifier.prototype = {
    toString: function () {
        return this.name;
    },
    execute: async function (scope) {
        return await Promise.resolve(scope.read(this.name));
    }
}

Identifier.new = function (name) {
    return new Identifier(name);
};

module.exports = Identifier;
