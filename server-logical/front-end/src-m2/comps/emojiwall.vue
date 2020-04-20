<template>
  <div class="emojiwall">
    <template v-for="a in local_state.chats">
      <div v-bind:style="{top: a.pos.y + '%',transform: `translate(${a.pos.x}%, 0)`}">
        <div class="real">{{a.pack.msg.chat.emoji}}</div>
      </div>
    </template>
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

<style lang="less" scoped>
.emojiwall {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 55;
  bottom: 0;
  pointer-events: none;
}
.emojiwall > div {
  left: 0;
  right: 0;
  position: absolute;
}

.emojiwall .real {
  padding: 0.2rem 1rem;
  border: 1px solid #ccc;
  border-radius: 9999em;
  background: rgba(255, 255, 255, 0.5);
  display: inline-block;
}

</style>