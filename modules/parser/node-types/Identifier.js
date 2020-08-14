function Identifier(name, originalName) {
    this.type = 'Identifier';
    this.name = name;
    this.originalName = originalName;
}

Identifier.prototype = {
    toString: function () {
        return this.name;
    },
    execute: async function (scope) {
        return await Promise.resolve(scope.read(this.name));
    }
}

Identifier.new = function (name, originalName) {
    return new Identifier(name, originalName);
};

module.exports = Identifier;
