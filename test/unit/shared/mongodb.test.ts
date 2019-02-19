import test from 'tape';
import sinon from 'sinon';
import { connect } from '../../../shared/mongodb';

test('connect', async t => {
  t.plan(1);
  const client = {
    connect: sinon.stub(),
  };
  const dbUri = 'mongodb://localhost';
  await connect(
    client as any,
    dbUri,
  );
  t.true(client.connect.calledWith(dbUri, { useNewUrlParser: true }));
});
