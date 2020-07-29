function Identifier(name) {
    this.type = 'Identifier';
    this.name = name;
}

Identifier.prototype = {
}

Identifier.new = function (name) {
    return new Identifier(name);
};




module.exports = Identifier;
