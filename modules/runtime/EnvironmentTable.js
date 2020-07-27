const EnvironmentTable = (function () {
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
                    if(typeof newValue !== originalType) {
                        throw new Error(`Cannot assign '${newValue}' to '${key}'. New value type must be '${originalType}'`);
                    }

                    varValue = newValue;
                }
            });
        },
        
        read: function (key) {
            if(typeof this.identifiers[key] !== 'undefined') {
                return this.identifiers[key];
            } else if(this.parent !== null) {
                return this.parent.read(key);
            } else {
                throw new Error(`Variable '${key}' has not been created.`);
            }
        },
        
        update: function (key, value) {
            this.identifiers[key] = value;
        },
        
        new: function () {
            return EnvironmentTable.new(this);
        }
    };

    EnvironmentTable.new = function (parentScope) {
        return new EnvironmentTable(parentScope);
    }

    return EnvironmentTable;
})();

(function () {
    const isNodeEnvironment = typeof module === 'object'
        && module !== null
        && typeof module.exports !== 'undefined';

    if (isNodeEnvironment) {
        module.exports = EnvironmentTable;
    }
})();