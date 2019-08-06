import test from 'ava';
import sinon from 'sinon';
import { connect } from '../../../src/shared/mongodb';

test('connect', async t => {
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
