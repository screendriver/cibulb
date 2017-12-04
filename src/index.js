import "./main.css";
import { Main } from "./Main.elm";
import registerServiceWorker from "./registerServiceWorker";

const { ports } = Main.fullscreen();

let gattServer;

ports.connect.subscribe(async bulbName => {
  if (!navigator.bluetooth) {
    ports.error.send("Web Bluetooth is not supported on this platform");
  }
  try {
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ name: bulbName }]
    });
    gattServer = await device.gatt.connect();
    ports.connected.send(device.id);
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
