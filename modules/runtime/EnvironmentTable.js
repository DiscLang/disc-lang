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
            Object.defineProperty(this.identifiers, key, {
                value: value
            });
        },
        
        read: function (key) {
            return this.identifiers[key];
        },
        
        update: function (key, value) {
            this.identifiers[key] = value;
        },
        
        new: function () { }
    };

    EnvironmentTable.new = function () {
        return new EnvironmentTable();
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