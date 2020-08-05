function Nil() { }

Nil.prototype = {
    toString: () => "nil"
};

function getNil() {
    const newNil = new Nil();

    return Object.freeze(newNil);
}

function Dictionary() {
    this.map = {};
}

Dictionary.prototype = {
    getSafeKey: function (key) {
        if (typeof key !== 'string') {
            throw new Error('Dictionary keys can only be strings.');
        }
        return key.toLowerCase();
    },

    keys: function () {
        return Object.keys(this.map);
    },

    hasKey: function (key) {
        const safeKey = this.getSafeKey(key);

        return typeof this.map[safeKey] !== 'undefined';
    },

    read: function (key) {
        const safeKey = this.getSafeKey(key);

        return typeof this.map[safeKey] !== 'undefined'
            ? this.map[safeKey]
            : getNil();
    },

    remove: function (key) {
        const safeKey = this.getSafeKey(key);

        this.map[safeKey] = undefined;
        delete this.map[safeKey];
    },

    set: function (key, value) {
        const safeKey = this.getSafeKey(key);

        this.map[safeKey, value];

        return this;
    },

    toString: function () {
        return JSON.stringify(this.map);
    }
};

function verifyNumberValues(operation, a, b) {
    if(typeof a !== 'number' || typeof b !== 'number') {
        throw new Error(`All values provided to ${operation} must be numbers; values received are: ${a} of type ${typeof a} and ${b} of type ${typeof b}`);
    }
}

module.exports = {
    array: function (...args) {
        return args;
    },

    append: function (valuesArray, value) {
        if (!Array.isArray(values)) {
            throw new Error('Append can only add values to an array.');
        }

        valuesArray.push(value);

        return valuesArray;
    },

    dictionary: function () {
        return new Dictionary();
    },

    hasKey: function (dictionary, key) {
        if (!dictionary instanceof Dictionary) {
            throw new Error('Keys can only be accessed on a dictionary.');
        }

        return dictionary.hasKey(key);
    },

    keys: function (dictionary) {
        if (!dictionary instanceof Dictionary) {
            throw new Error('Keys can only be accessed on a dictionary.');
        }

        return dictionary.keys();
    },

    read: function (valuesObject, key) {
        if (valuesObject instanceof Dictionary) {
            const safeKey = key.toLowerCase();
            return valuesObject.read(safeKey);
        } else if (Array.isArray(valuesObject)) {
            const safeKey = parseInt(key);

            return typeof valuesObject[safeKey] !== 'undefined'
                ? valuesObject[key]
                : getNil();
        } else {
            throw new Error('Read can only be used on dictionaries and arrays.');
        }
    },

    remove: function (valuesObject, key) {
        if (valuesObject instanceof Dictionary) {
            const safeKey = key.remove(key);
            return valuesObject.read(safeKey);
        } else if (Array.isArray(valuesObject)) {
            const safeKey = parseInt(key);

            valuesObject.splice(safeKey, 1);

            return valuesObject;
        } else {
            throw new Error('Read can only be used on dictionaries and arrays.');
        }
    },

    set: function (dictionary, key, value) {
        if (!dictionary instanceof Dictionary) {
            throw new Error('Values may only be set on a dictionary.');
        }

        dictionary[key.toLowerCase()] = value;

        return dictionary;
    },

    isNil: function (value) {
        return value instanceof Nil;
    },

    // User I/O

    print: function (...args) {
        if (typeof window === 'object') {
            window.print(...args);
        } else {
            console.log(...args);
        }
    },

    prompt: function (message) {
        if (typeof window === 'object') {
            prompt(message);
        } else {
            const prompt = require('prompt-sync')()

            return prompt(message).trim();
        }
    },

    // Strings.

    join: function (...args) {
        return args.join('');
    },

    // Math.

    isLessThan: function (a, b) {
        verifyNumberValues('isLessThan', a, b);

        return a < b;
    },

    isGreaterThan: function (a, b) {
        verifyNumberValues('isGreaterThan', a, b);

        return a > b;
    },

    isLessOrEqualTo: function (a, b) {
        verifyNumberValues('isLessOrEqualTo', a, b);

        return !(a > b);
    },

    isGreaterOrEqualTo: function (a, b) {
        verifyNumberValues('isGreaterOrEqualTo', a, b);

        return !(a < b);
    },

    isEqualTo: function (a, b) {
        return a === b;
    },

    random: function (min = 0, max = 1) {
        verifyNumberValues('random', min, max);

        const safeMax = min >= max ? min + Math.abs(max) : max;
        const numberDiff = safeMax - min;
        const randomNumber = Math.random() * numberDiff;

        return randomNumber + min;
    },

    absoluteValue: function (value) {
        return Math.abs(value);
    },

    floor: function (value) {
        return Math.floor(value);
    },

    ceiling: function (value) {
        return Math.ceil(value);
    }
};