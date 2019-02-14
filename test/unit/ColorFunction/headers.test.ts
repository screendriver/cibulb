import test from 'tape';
import { HttpRequest } from '@azure/functions';
import { xHubSignature } from '../../../ColorFunction/headers';

test('returns "x-hub-signature" from request headers', t => {
  t.plan(1);
  const req: Partial<HttpRequest> = {
    headers: {
      'x-hub-signature': 'foo',
    },
  };
  const actual = xHubSignature(req as HttpRequest);
  t.equal(actual, 'foo');
});
