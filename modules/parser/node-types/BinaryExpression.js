function BinaryExpression(operator) {
    this.type = 'BinaryExpression';
    this.operator = operator;
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

        switch(this.operator) {
            case '+':
                return left + right;
            case '-':
                return left - right;
            case '*':
                return left * right;
            case '/':
                return left / right;
            default:
                throw new Error(`Cannot perform unknown operation "${this.operator}"`);
        }
    }
}

BinaryExpression.new = function (name) {
    return new BinaryExpression(name);
};

module.exports = BinaryExpression;
