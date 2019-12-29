import { assert } from 'chai';
import sinon from 'sinon';
import { SNSEventRecord, SNSMessage } from 'aws-lambda';
import { Got } from 'got';
import { triggerName, firstMessage, createIftttTrigger } from '../../src/ifttt';

function createSNSEventRecord(message: string): SNSEventRecord {
  const snsMessage: Partial<SNSMessage> = {
    Message: message,
  };
  const record: Partial<SNSEventRecord> = {
    Sns: snsMessage as SNSMessage,
  };
  return record as SNSEventRecord;
}

suite('ifttt', function() {
  test('triggerName() gets correct name for "success" message', function() {
    const actual = triggerName('success');
    const expected = 'ci_build_success';
    assert.strictEqual(actual, expected);
  });

  test('triggerName() gets correct name for "pending" message', function() {
    const actual = triggerName('pending');
    const expected = 'ci_build_pending';
    assert.strictEqual(actual, expected);
  });

  test('triggerName() gets correct name for "failed" message', function() {
    const actual = triggerName('failed');
    const expected = 'ci_build_failure';
    assert.strictEqual(actual, expected);
  });

  test('triggerName() gets correct name for unknown message', function() {
    const actual = triggerName('unknown');
    const expected = 'ci_build_failure';
    assert.strictEqual(actual, expected);
  });

  test('firstMessage() returns empty string when records are empty', function() {
    const records: SNSEventRecord[] = [];
    const actual = firstMessage(records);
    const expected = '';
    assert.strictEqual(actual, expected);
  });

  test('firstMessage() returns message of first record', function() {
    const record1 = createSNSEventRecord('first');
    const record2 = createSNSEventRecord('second');
    const records: SNSEventRecord[] = [record1, record2];
    const actual = firstMessage(records);
    const expected = 'first';
    assert.strictEqual(actual, expected);
  });

  test('createIftttTrigger() calls IFTTT with the correct URL', async function() {
    const got = sinon.fake.resolves('bbbbccc');
    const iftttKey = 'my-key';
    const iftttBaseUrl = 'http://example.com';
    const trigger = 'ci_build_success';
    const iftttTrigger = createIftttTrigger(trigger);
    await iftttTrigger((got as unknown) as Got, iftttKey, iftttBaseUrl);
    sinon.assert.calledWith(got, `trigger/${trigger}/with/key/${iftttKey}`, {
      prefixUrl: iftttBaseUrl,
    });
  });
});
