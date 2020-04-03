<template>
  <div>
    <button v-for="n, j in cmd" v-on:mousedown="setcmd(j, 1)" v-on:mouseup="setcmd(j, 0)">{{j}}</button>
  </div>
</template>

<script>
import { actions } from "./shared_actions";
var built_actions = { ...actions };
built_actions.setcmd = function(k, v) {
  var send_it = false;
  if (this.cmd[k] != v) {
    send_it = true;
  }
  this.cmd[k] = v;
  if (send_it) {
    built_actions.send_cmd(this.cmd);
  }
};
export default {
  created: function() {
    this.vars = { auto_sender: 0 };
  },
  methods: built_actions,
  data: function() {
    return {
      cmd: {
        left: 0,
        right: 0,
        bottom: 0,
        up: 0,
        grab: 0
      }
    };
  },
  mounted: function() {
    this.vars.auto_sender = setInterval(() => {
      console.log(JSON.stringify(this.cmd));
      built_actions.send_cmd(this.cmd);
    }, 200);
  },
  beforeDestroy: function() {
    console.log("UNMOUNT");
    clearInterval(this.vars.auto_sender);
  }
};
</script>

<style>
</style>