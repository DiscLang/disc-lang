const { Nil } = require('./Nil');
const { Dictionary } = require('./Dictionary');

function EnvironmentTable(parent = null) {
    this.identifiers = {};
    this.parent = parent;
}

EnvironmentTable.prototype = {
    define: function (key, value) {
        Object.defineProperty(this.identifiers, key, {
            get: function () {
                return value;
            },
            set: function () {
                throw new Error(`Cannot update ${key}. It is a constant value.`);
            }
        });
    },

    getValueType: function (value) {
        if (Array.isArray(value)) {
            return 'array';
        } else if (value instanceof Nil) {
            return 'nil';
        } else if (value instanceof Dictionary) {
            return 'dictionary';
        } else {
            return typeof value;
        }
    },

    matchesOriginalType: function (originalType, value) {
        return value instanceof Nil || originalType === this.getValueType(value);
    },

    initialize: function (key, value) {
        const getValueType = this.getValueType;
        const matchesOriginalType = this.matchesOriginalType.bind(this);

        const originalType = this.getValueType(value);
        let varValue = value;

        Object.defineProperty(this.identifiers, key, {
            get: function () {
                return varValue;
            },

            set: function (newValue) {
                if (!matchesOriginalType(originalType, newValue)) {
                    throw new Error(`Cannot assign '${newValue}' to '${key}'. New value type must be '${originalType}', but got '${getValueType(newValue)}'`);
                }

                varValue = newValue;
            }
        });
    },

    read: function (key) {
        if (typeof this.identifiers[key] !== 'undefined') {
            return this.identifiers[key];
        } else if (this.parent !== null) {
            return this.parent.read(key);
        } else {
            throw new Error(`Cannot read variable '${key}'. It has not been created.`);
        }
    },

    update: function (key, value) {
        if (typeof this.identifiers[key] !== 'undefined') {
            this.identifiers[key] = value;
        } else if (this.parent !== null) {
            this.parent.update(key, value);
        } else {
            throw new Error(`Cannot update variable '${key}'. It has not been created.`);
        }
    },

    new: function () {
        return EnvironmentTable.new(this);
    },

    getIdentifiers: function () {
        return Object.keys(this.identifiers);
    }
};

EnvironmentTable.new = function (parentScope) {
    return new EnvironmentTable(parentScope);
}

module.exports = EnvironmentTable;
