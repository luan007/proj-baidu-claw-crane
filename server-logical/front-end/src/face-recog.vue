<template>
  <div class="frec">
    <video ref="vid" muted autoplay></video>
  </div>
</template>

<script>
import { actions } from "./shared_actions";

export default {
  methods: actions,
  mounted: function() {
  }
};
</script>

<style>
.frec {
  position: absolute;
  user-select: none;
  pointer-events: none;
  bottom: 0;
  right: 0;
  left: 50%;
}

.frec video {
  width: 100%;
  display: block;
  visibility: hidden;
}
</style>