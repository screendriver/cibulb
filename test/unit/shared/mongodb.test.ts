import { connect } from '../../../api/shared/mongodb';

test('connect', async () => {
  const client = {
    connect: jest.fn(),
  };
  const dbUri = 'mongodb://localhost';
  await connect(
    client as any,
    dbUri,
  );
  expect(client.connect).toHaveBeenCalledWith(dbUri, { useNewUrlParser: true });
});
