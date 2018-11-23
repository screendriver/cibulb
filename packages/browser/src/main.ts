import Vue from 'vue';
import { getConfig } from './config';
import App from './App.vue';
import { createStore } from './store';

const config = getConfig();

Vue.config.productionTip = false;

new Vue({
  store: createStore(config),
  render: h => h(App),
}).$mount('#app');
