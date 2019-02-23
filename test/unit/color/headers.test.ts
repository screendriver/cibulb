import test from 'tape';
import { IncomingMessage } from 'http';
import { xHubSignature } from '../../../src/color/headers';

test('returns "x-hub-signature" from request headers', t => {
  t.plan(1);
  const req: Partial<IncomingMessage> = {
    headers: {
      'x-hub-signature': 'foo',
    },
  };
  const actual = xHubSignature(req as IncomingMessage);
  t.equal(actual, 'foo');
});

test('returns an empty string when "x-hub-signature" is not present', t => {
  t.plan(1);
  const req: Partial<IncomingMessage> = {
    headers: {},
  };
  const actual = xHubSignature(req as IncomingMessage);
  t.equal(actual, '');
});
