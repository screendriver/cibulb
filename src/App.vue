<template>
  <div class="main">
    <light-bulb />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import LightBulb from './components/LightBulb.vue';

@Component({
  components: {
    LightBulb,
  },
})
export default class App extends Vue {}
</script>

<style>
@import url('https://fonts.googleapis.com/css?family=Roboto');

body {
  background: #6504d4;
  background: linear-gradient(to bottom, #6504d4, #42024b);
  background-attachment: fixed;
  font-family: 'Roboto', sans-serif;
}

p.errorMessage {
  color: red;
}

svg.lightBulb {
  height: 50vh;
  transition: transform 0.3s;
}

svg.lightBulb:hover {
  cursor: pointer;
  transform: scale(1.1);
}

@keyframes power {
  0% {
    opacity: 1;
  }
  10% {
    opacity: 1;
  }
  15% {
    opacity: 0;
  }
  100% {
    opacity: 0;
  }
}

svg.lightBulb > .lightBulbWire {
  animation: power 1s ease infinite;
}

footer {
  bottom: 1rem;
  color: white;
  font-size: 0.7rem;
  position: absolute;
}

footer a {
  color: #ececec;
}
</style>

<style scoped>
.main {
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100vh;
}
</style>
