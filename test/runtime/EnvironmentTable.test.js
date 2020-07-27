const { assert } = require('chai');

const EnvironmentTable = require('../../modules/runtime/EnvironmentTable');

describe('Environment Table', function () {

    describe('define', function () {
        it('creates a new defined scope-level constant', function () {
            const localScope = EnvironmentTable.new();

            const expectedValue = 'this is a test';

            localScope.define('TEST_CONST', expectedValue);

            assert.equal(localScope.read('TEST_CONST'), expectedValue);
        });

        it('throws an error if user tries to update a defined value', function () {
            const localScope = EnvironmentTable.new();

            const expectedValue = 'this is a test';
            const valueName = 'TEST_CONST';

            localScope.define(valueName, expectedValue);
            const testBehavior = () => localScope.update(valueName, 'Something else');

            assert.throws(testBehavior, `Cannot update ${valueName}. It is a constant value.`);
        });
    });

    describe('initialize', function () {
        it('creates a new variable in the local scope', function () {
            const localScope = EnvironmentTable.new();

            const varName = 'testVar';
            const expectedValue = 'This is a test value';

            localScope.initialize(varName, expectedValue);

            assert.equal(localScope.read(varName), expectedValue);
        });

        it('updates normally when original type is adhered to', function () {
            const localScope = EnvironmentTable.new();

            const varName = 'testVar';
            const expectedValue = 'This is a test value';

            localScope.initialize(varName, expectedValue);

            assert.doesNotThrow(() => localScope.update(varName, 'this is a test'));
        });

        it('throws on update when new value does not match old type', function () {
            const localScope = EnvironmentTable.new();

            const varName = 'testVar';
            const expectedValue = 'This is a test value';
            const newValue = 5;

            localScope.initialize(varName, expectedValue);

            assert.throws(() => localScope.update(varName, newValue), `Cannot assign '${newValue}' to '${varName}'. New value type must be '${typeof expectedValue}'`);
        });
    });

    describe('read', function () {
        it('reads through the environment tree to the nearest scoped variable requested', function () {
            const parentScope = EnvironmentTable.new();
            const localScope = parentScope.new();

            const varName = 'testVar';
            const testValue = 'This is a test value';

            parentScope.initialize(varName, testValue);

            assert.equal(localScope.read(varName), testValue);
        });

        it('throws an error if the variable is not defined', function () {
            const parentScope = EnvironmentTable.new();
            const localScope = parentScope.new();

            const varName = 'testVar';
            const testValue = 'This is a test value';

            assert.throws(() => localScope.read(varName), `Variable '${varName}' has not been created.`);
        });
    });
});