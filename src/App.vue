<template>
  <div class="main">
    <light-bulb @click="onBulbClick" />
    <the-error-message />
    <the-footer />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import LightBulb from '@/components/LightBulb.vue';
import TheErrorMessage from '@/views/TheErrorMessage.vue';
import TheFooter from '@/views/TheFooter.vue';
import { connect, disconnect, BulbColor } from '@/light-bulb';
import { Actions, Mutations } from '@/store';
import { showNotification, NotificationTitle } from '@/notification';

@Component({
  components: {
    LightBulb,
    TheErrorMessage,
    TheFooter,
  },
})
export default class App extends Vue {
  public intervalId: number | null = null;

  public async onBulbClick() {
    switch (this.$store.state.connection) {
      case 'disconnected':
        await this.$store.dispatch(Actions.CONNECT);
        await this.$store.dispatch(Actions.CHANGE_COLOR, BulbColor.BLUE);
        this.intervalId = window.setInterval(() => {
          this.$store.dispatch(Actions.FETCH_BUILD_STATUS);
        }, 15 * 1000);
        break;
      case 'connected':
        await this.$store.dispatch(Actions.CHANGE_COLOR, BulbColor.OFF);
        await this.$store.dispatch(Actions.DISCONNECT);
        if (this.intervalId) {
          window.clearInterval(this.intervalId);
          this.intervalId = null;
        }
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
