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
    .then(device => console.log(device))
    .catch(error => ports.error.send(error.toString()));
});

registerServiceWorker();
