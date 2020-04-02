<template>
  <div class="fullscreen debug">
    <div>{{channel.log}}</div>
    <div v-if="show_channel" v-for="n, j in channel.debug" v-if="j < 5">{{n}}</div>
    <pre v-if="show_synced" style="opacity: 0.5;">{{JSON.stringify(synced, "\t", 4)}}</pre>
  </div>
</template>

<script>
export default {
    props: ["show_channel", "show_synced", "synced", "channel"]
};
</script>

<style>
</style>