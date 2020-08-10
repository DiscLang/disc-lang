const {promisifyExec} = require('./utils/promisify');

function BinaryExpression(operator) {
    this.type = 'BinaryExpression';
    this.operator = operator;
}

const mathOperations = {
    '+': (a, b) => a + b,
    '-': (a, b) => a - b,
    '*': (a, b) => a * b,
    '/': (a, b) => a / b,
};

const logicalOperations = {
    'and': (a, b) => a && b,
    'or': (a, b) => a || b
};

function numericOnly(name, comparison) {
    return function (a, b) {
        if (typeof a !== 'number' || typeof b !== 'number') {
            throw new Error(`Cannot compare non-number values with ${name} operator.`);
        }

        return comparison(a, b);
    }
}

const comparisonOperations = {
    'isgreaterthan': numericOnly('isGreaterThan', (a, b) => a > b),
    'islessthan': numericOnly('isLessThan', (a, b) => a < b),
    'isgreaterorequalto': numericOnly('isGreaterOrEqualTo', (a, b) => !(a < b)),
    'islessorequalto': numericOnly('isLessOrEqualTo', (a, b) => !(a > b)),
    'isequalto': (a, b) => a === b
};

function performMathOperation(operator, a, b) {
    if (typeof a !== 'number' || typeof b !== 'number') {
        throw new Error(`Arithmetic operations can only be run on numbers. Received ${a} of type ${typeof a} && ${b} of type ${typeof b}.`);
    }

    return mathOperations[operator](a, b);
}

function performComparisonOperation(operator, a, b) {
    return comparisonOperations[operator](a, b);
}

function performLogicalOperation(operator, a, b) {
    if (typeof a !== 'boolean' || typeof b !== 'boolean') {
    }

    return logicalOperations[operator](a, b);
}

BinaryExpression.prototype = {
    setLeft: function (node) {
        this.left = node;
    },
    setRight: function (node) {
        this.right = node;
    },
    toString: function () {
        return `${this.left.toString()} ${this.operator} ${this.right.toString()}`
    },

    performOperation: function (left, right) {
        if (Object.keys(mathOperations).includes(this.operator)) {
            return performMathOperation(this.operator, left, right);
        } else if (Object.keys(comparisonOperations).includes(this.operator)) {
            return performComparisonOperation(this.operator, left, right);
        } else {
            return performLogicalOperation(this.operator, left, right);
        }
    },

    execute: async function (scope) {
        let left = await promisifyExec(this.left, scope);
        let right = await promisifyExec(this.right, scope);

        return await Promise.resolve(this.performOperation(left, right))
    }
}

BinaryExpression.new = function (name) {
    return new BinaryExpression(name);
};

module.exports = BinaryExpression;
