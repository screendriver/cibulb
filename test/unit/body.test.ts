import { assert } from 'chai';
import { isWebhookEventBody } from '../../src/body';

suite('body', function () {
  test('isWebhookEventBody() returns false when body is undefined', function () {
    const body = undefined;
    const actual = isWebhookEventBody(body);
    assert.isFalse(actual);
  });

  test('isWebhookEventBody() returns false when body is null', function () {
    const body = null;
    const actual = isWebhookEventBody(body);
    assert.isFalse(actual);
  });

  test('isWebhookEventBody() returns false when body is not valid', function () {
    const body = {
      foo: 'bar',
    };
    const actual = isWebhookEventBody(body);
    assert.isFalse(actual);
  });

  test('isWebhookEventBody() returns true when body is valid', function () {
    const body = {
      object_attributes: {
        id: 1,
        ref: '',
        status: 'success',
      },
      project: {
        path_with_namespace: '',
      },
    };
    const actual = isWebhookEventBody(body);
    assert.isTrue(actual);
  });
});
