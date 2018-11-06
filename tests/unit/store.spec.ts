import { mutations, Mutations, State } from '@/store';
import { BulbColor, BuildStatus } from '@/bulb';
import { GitHubHook } from '@/socket';

function createMockState(overrides: Partial<State> = {}): State {
  return {
    bulbConnection: 'disconnected',
    socketConnection: 'disconnected',
    writeValueInProgress: false,
    errorMessage: '',
    deviceId: null,
    gattServer: null,
    buildStatuses: new Map(),
    color: BulbColor.OFF,
    ...overrides,
  };
}

describe('store', () => {
  describe('mutations', () => {
    it('BULB_CONNECTING', () => {
      const mockState = createMockState();
      mutations[Mutations.BULB_CONNECTING](mockState, undefined);
      expect(mockState.bulbConnection).toBe('connecting');
    });

    it('BULB_CONNECTED', () => {
      const mockState = createMockState();
      mutations[Mutations.BULB_CONNECTED](mockState, {
        deviceId: 'my-device',
        gattServer: {},
      });
      expect(mockState.bulbConnection).toBe('connected');
      expect(mockState.deviceId).toBe('my-device');
      expect(mockState.gattServer).toEqual({});
    });

    it('BULB_DISCONNECTED', () => {
      const mockState = createMockState({
        deviceId: 'my-device',
        gattServer: undefined,
      });
      mutations[Mutations.BULB_DISCONNECTED](mockState, undefined);
      expect(mockState.bulbConnection).toBe('disconnected');
      expect(mockState.deviceId).toBeNull();
      expect(mockState.gattServer).toBeNull();
    });

    it('SOCKET_CONNECTING', () => {
      const mockState = createMockState();
      mutations[Mutations.SOCKET_CONNECTING](mockState, undefined);
      expect(mockState.socketConnection).toBe('connecting');
    });

    it('SOCKET_CONNECTED', () => {
      const mockState = createMockState();
      mutations[Mutations.SOCKET_CONNECTED](mockState, undefined);
      expect(mockState.socketConnection).toBe('connected');
    });

    it('SOCKET_DISCONNECTED', () => {
      const buildStatus: BuildStatus = { id: 123, state: 'success' };
      const mockState = createMockState({
        buildStatuses: new Map([['my/repo', buildStatus]]),
      });
      mutations[Mutations.SOCKET_DISCONNECTED](mockState, undefined);
      expect(mockState.socketConnection).toBe('disconnected');
      expect(mockState.buildStatuses.size).toBe(0);
    });

    it('ERROR', () => {
      const mockState = createMockState();
      mutations[Mutations.ERROR](mockState, 'I am the error');
      expect(mockState.errorMessage).toBe('I am the error');
    });

    it('COLOR_CHANGED', () => {
      const mockState = createMockState();
      mutations[Mutations.COLOR_CHANGED](mockState, BulbColor.GREEN);
      expect(mockState.color).toBe(BulbColor.GREEN);
    });

    it('VALUE_WRITING', () => {
      const mockState = createMockState();
      mutations[Mutations.VALUE_WRITING](mockState, undefined);
      expect(mockState.writeValueInProgress).toBe(true);
    });

    it('VALUE_WRITTEN', () => {
      const mockState = createMockState();
      mutations[Mutations.VALUE_WRITTEN](mockState, undefined);
      expect(mockState.writeValueInProgress).toBe(false);
    });

    it('GITHUB_HOOK_RECEIVED', () => {
      const hook: GitHubHook = {
        id: 123,
        name: 'my/repo',
        state: 'pending',
      };
      const mockState = createMockState();
      mutations[Mutations.GITHUB_HOOK_RECEIVED](mockState, hook);
      expect(mockState.buildStatuses.get('my/repo')).toEqual({
        id: 123,
        state: 'pending',
      });
    });
  });
});
