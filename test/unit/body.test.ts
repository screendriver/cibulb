import { assert } from 'chai';
import { define, random } from 'cooky-cutter';
import {
  isWebhookEventBody,
  assertHasEventBody,
  parseEventBody,
  WebhookEventBody,
} from '../../src/body';

const requestBody = define<WebhookEventBody>({
  object_attributes: {
    id: random(),
    ref: '',
    status: 'success',
  },
  project: {
    path_with_namespace: '',
  },
});

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

  test('assertHasEventBody() throws when body is null', function () {
    assert.throw(() => assertHasEventBody(null));
  });

  test('assertHasEventBody() does not throw when body is not null', function () {
    assert.doesNotThrow(() => assertHasEventBody('test'));
  });

  test('parseEventBody() returns given body as JSON', function () {
    const body = requestBody();
    const actual = parseEventBody(JSON.stringify(body));
    const expected = body;
    assert.deepEqual(actual, expected);
  });
});
