import { Store } from 'vuex';
import { showNotification } from '@/notification';
import { State, Mutations } from '@/store';

const bulbName = 'icolorlive';
const serviceName = 'f000ffa0-0451-4000-b000-000000000000';
const changeModeCharacteristic = 'f000ffa3-0451-4000-b000-000000000000';
// 4d43 (0x4F43) changes to color
// 4d57 (0x4F57) changes to white
const changeColorCharacteristic = 'f000ffa4-0451-4000-b000-000000000000';

export type BulbColor = 'off' | 'blue' | 'yellow' | 'green' | 'red' | 'pink';
type BulbColorRgb = [number, number, number];

function assertUnreachable(_x: never): never {
  throw new Error("Didn't expect to get here");
}

function getRgb(color: BulbColor): BulbColorRgb {
  switch (color) {
    case 'off':
      return [0, 0, 0];
    case 'blue':
      return [0, 0, 26];
    case 'yellow':
      return [26, 26, 0];
    case 'green':
      return [0, 26, 0];
    case 'red':
      return [26, 0, 0];
    case 'pink':
      return [26, 0, 26];
  }
  return assertUnreachable(color);
}

interface WriteParams {
  service: string;
  characteristic: string;
  value: [number, number, number];
}

async function writeValue(
  gattServer: BluetoothRemoteGATTServer,
  params: WriteParams,
  store: Store<State>,
) {
  try {
    const service = await gattServer.getPrimaryService(params.service);
    const characteristic = await service.getCharacteristic(
      params.characteristic,
    );
    await characteristic.writeValue(new Uint8Array(params.value));
    store.commit(Mutations.VALUE_WRITTEN, params);
  } catch (error) {
    store.commit(Mutations.ERROR, error.toString());
  }
}

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
      optionalServices: [serviceName],
    });
    const gattServer = await device.gatt!.connect();
    store.commit(Mutations.CONNECTED, device.id);
    await showNotification('Info', 'Connected');
    return gattServer;
  } catch (error) {
    store.commit(Mutations.ERROR, error.toString());
    return;
  }
}

export async function disconnect(gattServer: BluetoothRemoteGATTServer) {
  gattServer.disconnect();
  await showNotification('Info', 'Disconnected');
}

export function changeColor(
  color: BulbColor,
  gattServer: BluetoothRemoteGATTServer,
  store: Store<State>,
) {
  return writeValue(
    gattServer,
    {
      service: serviceName,
      characteristic: changeColorCharacteristic,
      value: getRgb(color),
    },
    store,
  );
}
