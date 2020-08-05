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
    if (typeof a !== 'number' || typeof b !== 'number') {
        throw new Error(`All values provided to ${operation} must be numbers; values received are: ${a} of type ${typeof a} and ${b} of type ${typeof b}`);
    }
}

module.exports = function (promptSync) {
    let finalApi = {};

    finalApi.array = function (...args) {
        return args;
    };

    finalApi.append = function (valuesArray, value) {
        if (!Array.isArray(values)) {
            throw new Error('Append can only add values to an array.');
        }

        valuesArray.push(value);

        return valuesArray;
    };

    finalApi.dictionary = function () {
        return new Dictionary();
    };

    finalApi.hasKey = function (dictionary, key) {
        if (!dictionary instanceof Dictionary) {
            throw new Error('Keys can only be accessed on a dictionary.');
        }

        return dictionary.hasKey(key);
    };

    finalApi.keys = function (dictionary) {
        if (!dictionary instanceof Dictionary) {
            throw new Error('Keys can only be accessed on a dictionary.');
        }

        return dictionary.keys();
    };

    finalApi.read = function (valuesObject, key) {
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
    };

    finalApi.remove = function (valuesObject, key) {
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
    };

    finalApi.set = function (dictionary, key, value) {
        if (!dictionary instanceof Dictionary) {
            throw new Error('Values may only be set on a dictionary.');
        }

        dictionary[key.toLowerCase()] = value;

        return dictionary;
    };

    finalApi.isNil = function (value) {
        return value instanceof Nil;
    };

    // User I/O

    finalApi.print = function (...args) {
        if (typeof window === 'object' && typeof window.print === 'function') {
            window.print(...args);
        } else {
            console.log(...args);
        }
    };

    finalApi.prompt = function (message) {
        if (typeof window === 'object') {
            prompt(message);
        } else {
            const prompt = promptSync()

            return prompt(message).trim();
        }
    };

    // Strings.

    finalApi.join = function (...args) {
        return args.join('');
    };

    finalApi.toLowerCase = function (value) {
        return value.toLowerCase();
    };

    finalApi.toUpperCase = function (value) {
        return value.toUpperCase();
    };

    finalApi.toArray = function (value, delimiter = '') {
        return value.split(delimiter);
    }

    finalApi.getCharacterAt = function (value, index) {
        return value[index - 1];
    }

    finalApi.lengthOf = function (value) {
        return value.length;
    }

    // Logic.

    finalApi.not = function (value) {
        if(typeof value !== 'boolean') {
            throw new Error(`Cannot apply not function to non-boolean values. Got value ${value} of type ${typeof value}`);
        }

        return !value;
    }

    // Math.

    finalApi.isLessThan = function (a, b) {
        verifyNumberValues('isLessThan', a, b);

        return a < b;
    };

    finalApi.isGreaterThan = function (a, b) {
        verifyNumberValues('isGreaterThan', a, b);

        return a > b;
    };

    finalApi.isLessOrEqualTo = function (a, b) {
        verifyNumberValues('isLessOrEqualTo', a, b);

        return !(a > b);
    };

    finalApi.isGreaterOrEqualTo = function (a, b) {
        verifyNumberValues('isGreaterOrEqualTo', a, b);

        return !(a < b);
    };

    finalApi.isEqualTo = function (a, b) {
        return a === b;
    };

    finalApi.random = function (min = 0, max = 1) {
        verifyNumberValues('random', min, max);

        const safeMax = min >= max ? min + Math.abs(max) : max;
        const numberDiff = safeMax - min;
        const randomNumber = Math.random() * numberDiff;

        return randomNumber + min;
    };

    finalApi.absoluteValue = function (value) {
        return Math.abs(value);
    };

    finalApi.floor = function (value) {
        return Math.floor(value);
    };

    finalApi.ceiling = function (value) {
        return Math.ceil(value);
    };

    finalApi.squareRoot = function (value) {
        return Math.sqrt(value);
    }

    finalApi.power = function (value, exponent) {
        verifyNumberValues('power', value, exponent);

        return Math.pow(value, exponent);
    }

    finalApi.maximum = function (a, b) {
        verifyNumberValues('maximum', a, b);

        return a > b ? a : b;
    }

    finalApi.minimum = function (a, b) {
        verifyNumberValues('minimum', a, b);

        return a < b ? a : b;
    }

    finalApi.remainder = function(a, b) {
        verifyNumberValues('modulus', a, b);

        return a % b;
    }

    finalApi.round = function (a, b) {
        verifyNumberValues('round', a, b);

        const magnitude = Math.pow(10, b);

        return Math.round(a * magnitude) / magnitude;
    }

    finalApi.log = function (value, base = Math.E) {
        verifyNumberValues('log', value, base);

        return Math.log(value)/Math.log(base);
    }

    return finalApi;
};