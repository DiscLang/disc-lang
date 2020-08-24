const { getNil } = require('./Nil');

function Dictionary() {
    this.dictionary = {};
}

Dictionary.prototype = {
    getSafeKey: function (key) {
        if (typeof key !== 'string') {
            throw new Error('Dictionary keys can only be strings.');
        }
        return key.toLowerCase();
    },

    keys: function () {
        return Object.keys(this.dictionary);
    },

    hasKey: function (key) {
        const safeKey = this.getSafeKey(key);

        return typeof this.dictionary[safeKey] !== 'undefined';
    },

    read: function (key) {
        const safeKey = this.getSafeKey(key);

        return typeof this.dictionary[safeKey] !== 'undefined'
            ? this.dictionary[safeKey]
            : getNil();
    },

    remove: function (key) {
        const safeKey = this.getSafeKey(key);

        this.dictionary[safeKey] = undefined;
        delete this.dictionary[safeKey];
    },

    set: function (key, value) {
        const safeKey = this.getSafeKey(key);

        this.dictionary[safeKey] = value;

        return this;
    },

    toString: function () {
        let outputLines = Object
            .keys(this.dictionary)
            .map(key => {
                value = typeof this.dictionary[key] === 'string'
                    ? `"${this.dictionary[key]}"`
                    : this.dictionary[key].toString();

                return value.split('\n').length === 1
                    ? indent(`${key}: ${value}`)
                    : indent(`${key}: \n${indent(value)}`);
            });
        return ['Dictionary {'].concat(outputLines).concat(['}']).join('\n');
    }
};

function indent(value) {
    const lines = value.split('\n');
    return lines.map(line => '    ' + line).join('\n');
}

function getDictionary () {
    return new Dictionary();
}

module.exports = {
    Dictionary,
    getDictionary
};