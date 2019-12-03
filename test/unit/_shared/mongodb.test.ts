import sinon from 'sinon';
import { connect } from '../../../api/_shared/mongodb';

suite('mongodb', function() {
  test('connect', async function() {
    const client = {
      connect: sinon.fake(),
    };
    const dbUri = 'mongodb://localhost';
    await connect(client as any, dbUri);
    sinon.assert.calledWith(client.connect, dbUri, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
  });
});
