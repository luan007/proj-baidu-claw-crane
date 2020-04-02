<template>
  <div class="pinned">
      <button v-if="synced.user && synced.user.private" v-on:click="add_coin">💰({{synced.user.private.coin}}) Add Coin</button>
  </div>
</template>

<script>
import { actions } from "./shared_actions";
export default {
    props: ["synced"],
    methods: actions
};
</script>

<style>
.pinned {
    text-align: left;
    position: absolute;
    top: 1rem;
    left:  1rem;
    right:  1rem;
}
</style>