import { assert } from 'chai';
import { define, random } from 'cooky-cutter';
import {
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
