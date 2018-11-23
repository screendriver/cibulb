import {
  connect,
  disconnect,
  getColorFromStatuses,
  BulbColor,
  BuildStatus,
} from '@/bulb';

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
      const statuses = new Map<string, BuildStatus>([
        ['test/repo', { id: 1, state: 'success' }],
        ['second/repo', { id: 2, state: 'success' }],
      ]);
      const color = getColorFromStatuses(statuses);
      expect(color).toEqual(BulbColor.GREEN);
    });

    it('should return YELLOW when one state is in "pending"', () => {
      const statuses = new Map<string, BuildStatus>([
        ['test/repo', { id: 1, state: 'success' }],
        ['second/repo', { id: 2, state: 'pending' }],
        ['third/repo', { id: 3, state: 'success' }],
      ]);
      const color = getColorFromStatuses(statuses);
      expect(color).toEqual(BulbColor.YELLOW);
    });

    it('should return RED when one state is in "failure"', () => {
      const statuses = new Map<string, BuildStatus>([
        ['test/repo', { id: 1, state: 'success' }],
        ['second/repo', { id: 2, state: 'failure' }],
        ['third/repo', { id: 3, state: 'success' }],
      ]);
      const color = getColorFromStatuses(statuses);
      expect(color).toEqual(BulbColor.RED);
    });

    it('should return RED when one state is in "error"', () => {
      const statuses = new Map<string, BuildStatus>([
        ['test/repo', { id: 1, state: 'success' }],
        ['second/repo', { id: 2, state: 'error' }],
        ['third/repo', { id: 3, state: 'success' }],
      ]);
      const color = getColorFromStatuses(statuses);
      expect(color).toEqual(BulbColor.RED);
    });

    it('should return PINK when statuses are empty', () => {
      const color = getColorFromStatuses(new Map());
      expect(color).toEqual(BulbColor.PINK);
    });
  });
});
