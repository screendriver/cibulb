<template>
  <p>{{ errorMessage }}</p>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapState } from 'vuex';

@Component({
  computed: mapState(['errorMessage']),
})
export default class TheErrorMessage extends Vue {}
</script>

<style scoped>
p {
  color: red;
}
</style>
