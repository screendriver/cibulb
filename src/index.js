import './main.css';
import { Main } from './Main.elm';
import registerServiceWorker from './registerServiceWorker';

const { ports } = Main.fullscreen();

let gattServer;

ports.requestDevice.subscribe(async () => {
  if (!navigator.bluetooth) {
    ports.error.send('Web Bluetooth is not supported on this platform');
  }
  try {
    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
    });
    gattServer = await device.gatt.connect();
    ports.device.send({ id: device.id, name: device.name });
  } catch (error) {
    ports.error.send(error.toString());
  }
});

ports.disconnect.subscribe(() => {
  if (gattServer) {
    gattServer.disconnect();
    ports.disconnected.send(true);
  }
});

registerServiceWorker();
