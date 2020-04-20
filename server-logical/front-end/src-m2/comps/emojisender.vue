<template>
  <div v-show="local_state.ai_engine.main_expr">
    <div style="font-size: 2em; margin-bottom: 5px;">
    {{local_state.emojimap[local_state.ai_engine.main_expr]}}
    </div>
    <div style="font-size: 0.8em;">发送表情</div>
  </div>
</template>

<script>
import "./shared.less";
import * as shared from "../shared";
export default {
  data: function() {
    return shared.vueData;
  },
  methods: shared.combined_methods
};
</script>

<style>
</style>