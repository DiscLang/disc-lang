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

function performMathOperation (operator, a, b) {
    if(typeof a !== 'number' || typeof b !== 'number') {
        throw new Error(`Arithmetic operations can only be run on numbers. Received ${a} of type ${typeof a} && ${b} of type ${typeof b}.`);
    }

    return mathOperations[operator](a, b);
}

function performLogicalOperation(operator, a, b) {
    if(typeof a !== 'boolean' || typeof b !== 'boolean') {
        throw new Error(`Logical operations can only be run on boolean values. Received ${a} of type ${typeof a} && ${b} of type ${typeof b}.`);
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
    execute: function (scope) {
        const left = this.left.execute(scope);
        const right = this.right.execute(scope);

        if(Object.keys(mathOperations).includes(this.operator)) {
            performMathOperation(this.operator, left, right);
        } else {
            performLogicalOperation(this.operator, left, right);
        }
    }
}

BinaryExpression.new = function (name) {
    return new BinaryExpression(name);
};

module.exports = BinaryExpression;
