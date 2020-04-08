<template>
  <div v-bind:class="{fs: 1, show: show}">
    <streamer v-bind:show="show" v-bind:src="(show && current_room_id() && room_machine(current_room_id())) ? room_machine(current_room_id()).public.view_streams[0] : ''"></streamer>
  </div>
</template>

<script>
import "./shared.less";
import * as shared from "../shared";
export default {
  data: function() {
    return shared.vueData
  },
  computed: {
    show: function() {
      return this.scene=='game'
    }
  },
  methods: shared.actions
};
</script>

<style scoped>
.fs {
  z-index: 0;
  pointer-events: none;
}

.fs.show {
  pointer-events: all;
}
</style>