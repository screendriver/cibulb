import sinon from 'sinon';
import { connect } from '../../../api/shared/mongodb';

suite('mongodb', () => {
  test('connect', async () => {
    const client = {
      connect: sinon.fake(),
    };
    const dbUri = 'mongodb://localhost';
    await connect(client as any, dbUri);
    sinon.assert.calledWith(client.connect, dbUri, { useNewUrlParser: true });
  });
});
