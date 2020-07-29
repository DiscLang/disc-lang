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

    initialize: function (key, value) {
        const originalType = typeof value;
        let varValue = value;

        Object.defineProperty(this.identifiers, key, {
            get: function () {
                return varValue;
            },

            set: function (newValue) {
                if (typeof newValue !== originalType) {
                    throw new Error(`Cannot assign '${newValue}' to '${key}'. New value type must be '${originalType}'`);
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
    }
};

EnvironmentTable.new = function (parentScope) {
    return new EnvironmentTable(parentScope);
}

module.exports = EnvironmentTable;
