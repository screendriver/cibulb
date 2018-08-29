import { Store } from 'vuex';
import { State, Mutations } from '@/store';

const bulbName = 'icolorlive';
const service = 'f000ffa0-0451-4000-b000-000000000000';
const changeModeCharacteristic = 'f000ffa3-0451-4000-b000-000000000000';
// 4d43 (0x4F43) changes to color
// 4d57 (0x4F57) changes to white
const changeColorCharacteristic = 'f000ffa4-0451-4000-b000-000000000000';

export async function connect(store: Store<State>) {
  if (!navigator.bluetooth) {
    store.commit(
      Mutations.ERROR,
      'Web Bluetooth is not supported on this platform',
    );
    return;
  }
  try {
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ name: bulbName }],
      optionalServices: [service],
    });
    const gattServer = await device.gatt!.connect();
    store.commit(Mutations.CONNECTED, device.id);
    return gattServer;
  } catch (error) {
    store.commit(Mutations.ERROR, error);
    return;
  }
}
