<template>
  <div>
    <div class="fullscreen">
      <div class="center">
        <h3>LOBBY</h3>
        <div v-for="r, k in synced.room_states" class="line">
            <button v-on:click="join_room(k)">JOIN {{k}} 在线={{r.users}}</button>
        </div>
      </div>
    </div>
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
</style>