import test from 'tape';
import sinon from 'sinon';
import { run } from '../../ColorFunction';

test('setup should work', async t => {
  t.plan(1);
  await run({ log: sinon.stub() } as any, { query: {} } as any);
  t.pass();
});
