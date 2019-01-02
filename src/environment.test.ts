import * as assert from 'assert';
import { resolveEnvironmentVariables } from './environment';

describe('Environment', () => {
    describe('resolveEnvironmentVariables', () => {
        beforeEach(() => {
            process.env['TEST'] = 'foo';
            process.env['TEST_2'] = 'bar';
        });
        it('should resolve %VAR% syntax on Windows', () => {
            assert.equal(resolveEnvironmentVariables('abc %TEST% def', true), 'abc foo def');
        });
        it('should resolve %VAR% syntax on Windows', () => {
            assert.equal(resolveEnvironmentVariables('abc %TEST%%TEST_2% def', true), 'abc foobar def');
        });
        it('should not resolve %VAR% syntax on non-Windows', () => {
            assert.equal(resolveEnvironmentVariables('abc %TEST% def', false), 'abc %TEST% def');
        });
        it('should not resolve $VAR syntax on Windows', () => {
            assert.equal(resolveEnvironmentVariables('abc $TEST def', true), 'abc $TEST def');
        });
        it('should resolve $VAR syntax on non-Windows', () => {
            assert.equal(resolveEnvironmentVariables('abc $TEST def', false), 'abc foo def');
        });
        it('should resolve multiple $VAR syntax on non-Windows', () => {
            assert.equal(resolveEnvironmentVariables('abc $TEST$TEST_2 def', false), 'abc foobar def');
        });
    });
});