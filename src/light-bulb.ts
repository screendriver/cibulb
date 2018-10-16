const bulbName = 'icolorlive';
const serviceName = 'f000ffa0-0451-4000-b000-000000000000';
const changeModeCharacteristic = 'f000ffa3-0451-4000-b000-000000000000';
// 4d43 (0x4F43) changes to color
// 4d57 (0x4F57) changes to white
const changeColorCharacteristic = 'f000ffa4-0451-4000-b000-000000000000';

export const enum BulbColor {
  OFF,
  BLUE,
  YELLOW,
  GREEN,
  RED,
  PINK,
}

export interface BuildStatus {
  id: string;
  state: 'pending' | 'failure' | 'error' | 'success';
}

type BulbColorRgb = [number, number, number];
type DeviceId = string;

function assertUnreachable(_x: never): never {
  throw new Error("Didn't expect to get here");
}

function getRgb(color: BulbColor): BulbColorRgb {
  switch (color) {
    case BulbColor.OFF:
      return [0, 0, 0];
    case BulbColor.BLUE:
      return [0, 0, 26];
    case BulbColor.YELLOW:
      return [26, 26, 0];
    case BulbColor.GREEN:
      return [0, 26, 0];
    case BulbColor.RED:
      return [26, 0, 0];
    case BulbColor.PINK:
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
) {
  const service = await gattServer.getPrimaryService(params.service);
  const characteristic = await service.getCharacteristic(params.characteristic);
  await characteristic.writeValue(new Uint8Array(params.value));
}

export async function connect(): Promise<
  [BluetoothRemoteGATTServer, DeviceId]
> {
  if (!navigator.bluetooth) {
    throw new Error('Web Bluetooth is not supported on this platform');
  }
  const device = await navigator.bluetooth.requestDevice({
    filters: [{ name: bulbName }],
    optionalServices: [serviceName],
  });
  const gattServer = await device.gatt!.connect();
  return [gattServer, device.id];
}

export function disconnect(gattServer: BluetoothRemoteGATTServer) {
  gattServer.disconnect();
}

export function changeColor(
  color: BulbColor,
  gattServer: BluetoothRemoteGATTServer,
) {
  return writeValue(gattServer, {
    service: serviceName,
    characteristic: changeColorCharacteristic,
    value: getRgb(color),
  });
}

export function getColorFromStatus(
  statuses: ReadonlyArray<BuildStatus>,
): BulbColor {
  if (statuses.length === 0) {
    return BulbColor.PINK;
  }
  if (statuses.every(({ state }) => state === 'success')) {
    return BulbColor.GREEN;
  }
  if (statuses.some(({ state }) => state === 'pending')) {
    return BulbColor.YELLOW;
  }
  if (statuses.some(({ state }) => state === 'failure' || state === 'error')) {
    return BulbColor.RED;
  }
  return BulbColor.PINK;
}
