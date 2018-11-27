import Vue from 'vue';
import firebaseLib from 'firebase/app';
import 'firebase/messaging';
import { getConfig } from './config';
import { initializeApp } from './firebase';
import App from './App.vue';
import { createStore } from './store';

const config = getConfig(process.env);
const app = initializeApp(firebaseLib, config.firebase);

// tslint:disable-next-line
new Vue({
  store: createStore(config),
  render(createElement) {
    return createElement(App, { props: { app } });
  },
  el: '#app',
});
