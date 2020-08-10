function Nil() { }

Nil.prototype = {
    toString: () => "nil"
};

function getNil() {
    const newNil = new Nil();

    return Object.freeze(newNil);
}

module.exports = {
    Nil,
    getNil
};