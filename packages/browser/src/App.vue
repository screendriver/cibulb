<template>
  <div class="main">
    <bulb @click="onBulbClick" />
    <the-error-message />
    <the-footer />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import Bulb from '@/components/Bulb.vue';
import TheErrorMessage from '@/views/TheErrorMessage.vue';
import TheFooter from '@/views/TheFooter.vue';
import firebaseLib from 'firebase/app';
import { Actions, Mutations } from '@/store';
import { requestMessagingPermission, getRegistrationToken } from '@/firebase';

@Component({
  components: {
    Bulb,
    TheErrorMessage,
    TheFooter,
  },
})
export default class App extends Vue {
  @Prop() app!: firebaseLib.app.App;

  public async onBulbClick() {
    switch (this.$store.state.bulbConnection) {
      case 'disconnected':
        this.connect();
        break;
      case 'connected':
        this.disconnect();
        break;
    }
  }

  private async connect() {
    try {
      await requestMessagingPermission(this.app);
      const token = await getRegistrationToken(this.app.messaging());
      if (!token) {
        throw new Error(
          'No Instance ID token available. Request permission to generate one.',
        );
      }
      await this.$store.dispatch(Actions.CONNECT);
    } catch (e) {
      this.$store.commit(Mutations.ERROR, e.message);
    }
  }

  private async disconnect() {
    await this.$store.dispatch(Actions.DISCONNECT);
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
