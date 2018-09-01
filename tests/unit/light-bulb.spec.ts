import { connect, disconnect } from '@/light-bulb';

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
});
