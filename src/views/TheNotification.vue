<template />

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class TheNotification extends Vue {
  public async mounted() {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      if (result === 'granted') {
        this.$store.subscribeAction((action, state) => {
          if (action.type === Mutations.SHOW_NOTIFICATION) {
            const { notification } = state;
            new Notification(notification.title, {
              body: notification.body,
              renotify: notification.renotify,
              tag: notification.tag,
            });
          }
        });
      }
    }
  }
}
</script>
