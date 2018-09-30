import {
  connect,
  disconnect,
  getColorFromStatus,
  BulbColor,
} from '@/light-bulb';

describe('light-bulb', () => {
  describe('connect()', () => {
    it('should throw when Web Bluetooth is not supported', () => {
      return expect(connect()).rejects.toEqual(
        new Error('Web Bluetooth is not supported on this platform'),
      );
    });
  });

  describe('disconnect()', () => {
    it('should call disconnect() on given GATT server', () => {
      const gattServer: Partial<BluetoothRemoteGATTServer> = {
        disconnect: jest.fn(),
      };
      disconnect(gattServer as BluetoothRemoteGATTServer);
      expect(gattServer.disconnect).toHaveBeenCalled();
    });
  });

  describe('getColorFromStatus()', () => {
    it('should return GREEN when every state is in "success"', () => {
      const color = getColorFromStatus([
        { id: '', state: 'success' },
        { id: '', state: 'success' },
      ]);
      expect(color).toEqual(BulbColor.GREEN);
    });

    it('should return YELLOW when one state is in "pending"', () => {
      const color = getColorFromStatus([
        { id: '', state: 'success' },
        { id: '', state: 'pending' },
        { id: '', state: 'success' },
      ]);
      expect(color).toEqual(BulbColor.YELLOW);
    });

    it('should return RED when one state is in "failure"', () => {
      const color = getColorFromStatus([
        { id: '', state: 'success' },
        { id: '', state: 'failure' },
        { id: '', state: 'success' },
      ]);
      expect(color).toEqual(BulbColor.RED);
    });

    it('should return RED when one state is in "error"', () => {
      const color = getColorFromStatus([
        { id: '', state: 'success' },
        { id: '', state: 'error' },
        { id: '', state: 'success' },
      ]);
      expect(color).toEqual(BulbColor.RED);
    });

    it('should return PINK when statuses are empty', () => {
      const color = getColorFromStatus([]);
      expect(color).toEqual(BulbColor.PINK);
    });
  });
});
