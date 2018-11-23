import Vue from 'vue';
import firebaseLib from 'firebase/app';
import { getConfig } from './config';
import { initializeApp } from './firebase';
import App from './App.vue';
import { createStore } from './store';

const config = getConfig(process.env);
initializeApp(firebaseLib, config.firebase);

Vue.config.productionTip = false;

new Vue({
  store: createStore(config),
  render: h => h(App),
}).$mount('#app');
