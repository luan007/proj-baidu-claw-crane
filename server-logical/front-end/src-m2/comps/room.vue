<template>
  <div class='fs'>
      <div class="video"></div>
  </div>
</template>

<script>
import "./shared.less";
import * as shared from "../shared";
export default {
  props: ["vuedata"],
  methods: shared.actions
};
</script>

<style scoped>

</style>