<template>
  <div class="bubble" v-bind:style="{transform: `translate(${pos.x}%, ${pos.y}%)`}">
      <div class="bbb">{{pack.msg.chat.emoji}} - {{pack.msg.user.uid.substring(0, 4)}}</div>
  </div>
</template>

<script>
export default {
  props: ["pos", "pack"]
};
</script>

<style>
.bbb {
    border-radius: 99999em;
    padding: 0.3rem 1.2rem;
    font-size: 1.2rem;
    background: rgba(255,255,255,0.5);
    box-shadow: 0px 3px 10px rgba(0, 0, 0, 0.5);
    display: inline-block;
}
.bubble {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    pointer-events: none;
    text-align: left;
    right: 0;
}
</style>