import './main.css';
import { Main } from './Main.elm';
import registerServiceWorker from './registerServiceWorker';

const { ports } = Main.fullscreen();

ports.requestDevice.subscribe(() => {
  if (!navigator.bluetooth) {
    ports.error.send('Web Bluetooth is not supported on this platform');
  }
  navigator.bluetooth
    .requestDevice({
      acceptAllDevices: true,
    })
    .then(device => Promise.all([device, device.gatt.connect()]))
    .then(([device, gattServer]) => {
      ports.device.send({ id: device.id, name: device.name });
    })
    .catch(error => ports.error.send(error.toString()));
});

registerServiceWorker();
