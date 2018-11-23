<template>
  <div class="main">
    <bulb @click="onBulbClick" />
    <the-error-message />
    <the-footer />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Bulb from '@/components/Bulb.vue';
import TheErrorMessage from '@/views/TheErrorMessage.vue';
import TheFooter from '@/views/TheFooter.vue';
import { connect, disconnect, BulbColor } from '@/bulb';
import { Actions, Mutations } from '@/store';
import { showNotification, NotificationTitle } from '@/notification';

@Component({
  components: {
    Bulb,
    TheErrorMessage,
    TheFooter,
  },
})
export default class App extends Vue {
  public async onBulbClick() {
    switch (this.$store.state.bulbConnection) {
      case 'disconnected':
        await this.$store.dispatch(Actions.CONNECT);
        break;
      case 'connected':
        await this.$store.dispatch(Actions.DISCONNECT);
        break;
    }
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css?family=Roboto');

body {
  background: #6504d4;
  background: linear-gradient(to bottom, #6504d4, #42024b);
  background-attachment: fixed;
  font-family: 'Roboto', sans-serif;
}

svg.bulb {
  height: 50vh;
  transition: transform 0.3s;
}

svg.bulb:hover {
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

svg.bulb > .bulbWire {
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
