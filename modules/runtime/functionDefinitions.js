const { Nil, getNil } = require('./Nil');
const { Dictionary, getDictionary } = require('./Dictionary');

function verifyNumberValues(operation, a, b) {
    if (typeof a !== 'number' || typeof b !== 'number') {
        throw new Error(`All values provided to ${operation} must be numbers; values received are: ${a} of type ${typeof a} and ${b} of type ${typeof b}`);
    }
}

module.exports = function ({
    promptSync,
    clear
}) {
    let finalApi = {};

    finalApi.newArray = function (...args) {
        return args;
    };

    finalApi.appendTo = function (valuesArray, value) {
        if (!Array.isArray(valuesArray)) {
            throw new Error('Append can only add values to an array.');
        }

        valuesArray.push(value);

        return valuesArray;
    };

    finalApi.newDictionary = getDictionary;

    finalApi.hasKey = function (dictionary, key) {
        if (!dictionary instanceof Dictionary) {
            throw new Error('Keys can only be accessed on a dictionary.');
        }

        return dictionary.hasKey(key);
    };

    finalApi.getKeysFrom = function (dictionary) {
        if (!dictionary instanceof Dictionary) {
            throw new Error('Keys can only be accessed on a dictionary.');
        }

        return dictionary.keys();
    };

    finalApi.readFrom = function (valuesObject, key) {
        let result;

        if (valuesObject instanceof Dictionary) {
            const safeKey = key.toLowerCase();
            result = valuesObject.read(safeKey);
        } else if (Array.isArray(valuesObject)) {
            const safeKey = parseInt(key) - 1;
            result = valuesObject[safeKey];
        } else if (valuesObject instanceof Nil) {
            result = null;
        } else {
            throw new Error('ReadFrom can only be used on dictionaries, arrays, and Nil.');
        }

        return result === null || typeof result === 'undefined' ? getNil() : result
    };

    finalApi.removeFrom = function (valuesObject, key) {
        if (valuesObject instanceof Dictionary) {
            const safeKey = key.remove(key);
            return valuesObject.read(safeKey);
        } else if (Array.isArray(valuesObject)) {
            const safeKey = parseInt(key) - 1;

            valuesObject.splice(safeKey, 1);

            return valuesObject;
        } else {
            throw new Error('Remove can only be used on dictionaries and arrays.');
        }
    };

    finalApi.setOn = function (dictionary, key, value) {
        if (!dictionary instanceof Dictionary) {
            throw new Error('Values may only be set on a dictionary.');
        }

        dictionary.set(key.toLowerCase(), value);

        return dictionary;
    };

    finalApi.updateOn = function (collection, key, value) {
        if(collection instanceof Dictionary) {
            console.log('Update key: ', key);
            collection.set(key.toLowerCase(), value);
        } else if (Array.isArray(collection)) {
            collection[key - 1] = value;
        } else {
            throw new Error('Values may only be updated on a dictionary or array.');
        }

        return collection;
    };

    finalApi.isNil = function (value) {
        return value instanceof Nil;
    };

    finalApi.newNil = function () {
        return getNil();
    };

    // User I/O

    finalApi.print = function (...args) {
        args.forEach(function (value) {
            if (typeof window === 'object' && typeof window.print === 'function') {
                window.print(value);
            } else {
                console.log(value);
            }
        });
    };

    finalApi.prompt = async function (message) {
        if (typeof window === 'object') {
            return new Promise(function (resolve) {
                setTimeout(function () {
                    const response = definedPrompt(message);

                    const sanitizedResponse = response === null
                        ? ''
                        : response.trim();

                    resolve(sanitizedResponse);
                }, 10);
            });
        } else {
            const prompt = promptSync()

            return prompt(message).trim();
        }
    };

    finalApi.readKey = async function () {
        if (typeof window === 'object') {
            return new Promise(function (resolve) {
                function getKey(event) {
                    document.removeEventListener('keypress', getKey);
                    
                    resolve(event.key);
                }

                document.addEventListener('keypress', getKey);
            });
        } else {
            return new Promise(function (resolve) {
                process.stdin.resume();
                process.stdin.setRawMode(true);
                process.stdin.setEncoding('utf8');

                process.stdin.on('data', function (key) {
                    process.stdin.pause();
                    process.stdin.setRawMode(false);

                    resolve(key);
                });
            });
        }
    }

    finalApi.clearScreen = function () {
        if (typeof window === 'object') {
            window.clear();
        } else {
            clear()
        }
    }

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

    finalApi.stringToNumber = function (value) {
        if (typeof value !== 'string') {
            throw new Error(`Function stringToNumber requires a string.`);
        }

        return parseFloat(value);
    }

    finalApi.getCharacterAtIndex = function (value, index) {
        if (typeof value !== 'string') {
            throw new Error(`Cannot read characters from a non-string value. Got ${value} of type ${typeof value}.`);
        }
        return value[index - 1];
    }

    finalApi.lengthOf = function (value) {
        return value.length;
    }

    // Numbers.

    finalApi.numberToString = function (value) {
        if (typeof value !== 'number') {
            throw new Error('Function numberToString requires an argument of type number.');
        }
        return value.toString();
    }

    // Logic.

    finalApi.not = function (value) {
        if (typeof value !== 'boolean') {
            throw new Error(`Cannot apply 'not' function to non-boolean values. Got value ${value} of type ${typeof value}`);
        }

        return !value;
    }

    // Other.

    finalApi.wait = function (seconds) {
        if (typeof seconds !== 'number') {
            throw new Error(`Function wait requires the number of seconds to wait, as a number.`);
        }

        return new Promise(function (resolve) {
            setTimeout(function () {
                resolve(true);
            }, 1000 * seconds);
        });
    }

    // Math.

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

    finalApi.remainder = function (a, b) {
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

        return Math.log(value) / Math.log(base);
    }

    return finalApi;
};