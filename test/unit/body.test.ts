import { assert } from 'chai';
import { assertHasEventBody } from '../../src/body';

suite('body', function() {
  test('assertHasEventBody() throws when body is null', function() {
    assert.throw(() => assertHasEventBody(null));
  });

  test('assertHasEventBody() does not throw when body is not null', function() {
    assert.doesNotThrow(() => assertHasEventBody('test'));
  });
});
