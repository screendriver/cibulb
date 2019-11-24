import { expect } from 'chai';
import sinon from 'sinon';
import { connect } from '../../../api/_shared/mongodb';

suite('mongodb', function() {
  test('connect', async function() {
    const client = {
      connect: sinon.fake(),
    };
    const dbUri = 'mongodb://localhost';
    await connect(client as any, dbUri);
    expect(client.connect).to.have.been.calledWith(dbUri, {
      useNewUrlParser: true,
    });
  });
});
