import './main.css';

import { Main } from './Main.elm';
import registerServiceWorker from './registerServiceWorker';

const { ports } = Main.fullscreen();

let gattServer;

ports.connect.subscribe(async ({ bulbName, service }) => {
  if (!navigator.bluetooth) {
    ports.error.send('Web Bluetooth is not supported on this platform');
    return;
  }
  try {
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ name: bulbName }],
      optionalServices: [service],
    });
    gattServer = await device.gatt.connect();
    ports.connected.send(device.id);
  } catch (error) {
    ports.error.send(error.toString());
  }
});

ports.writeValue.subscribe(async params => {
  try {
    const service = await gattServer.getPrimaryService(params.service);
    const characteristic = await service.getCharacteristic(
      params.characteristic,
    );
    await characteristic.writeValue(new Uint8Array(params.value));
  } catch (error) {
    ports.error.send(error.toString());
  }
});

ports.disconnect.subscribe(() => {
  if (gattServer) {
    gattServer.disconnect();
    ports.disconnected.send(null);
  } else {
    ports.error.send("Can't disconnect because no device connected");
  }
});

registerServiceWorker();
