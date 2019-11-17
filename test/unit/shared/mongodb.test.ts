import { expect } from 'chai';
import sinon from 'sinon';
import { connect } from '../../../api/shared/mongodb';

suite('mongodb', () => {
  test('connect', async () => {
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
