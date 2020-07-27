const mocha = require('mocha');
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
    });
});