import { Store } from 'vuex';
import { connect } from '@/light-bulb';
import { State, Mutations } from '@/store';

describe('light-bulb', () => {
  const store: Partial<Store<State>> = {
    commit: jest.fn(),
  };

  describe('connect()', () => {
    it('should return undefined when Web Bluetooth is not supported', async () => {
      const actual = await connect(store as Store<State>);
      expect(actual).toBeUndefined();
    });

    it('should commit ERROR mutation when Web Bluetooth is not supported', async () => {
      const actual = await connect(store as Store<State>);
      expect(store.commit).toHaveBeenCalledWith(
        Mutations.ERROR,
        'Web Bluetooth is not supported on this platform',
      );
    });
  });
});
