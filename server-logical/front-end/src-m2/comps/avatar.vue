<template>
  <div>
    <div class="user-avatar">
      <div class="head" v-on:click="show_dialog('user')">
        <div class="user-name">测试用户001</div>
        <div class="user-stat" v-if="vuedata.local_state.channel.connected > 0">
          <i class="fas fa-gamepad"></i>
          {{Object.keys(vuedata.synced.user.sessions).length}}
        </div>
        <div v-else class="user-stat" style="background: red">
          <i class="fas fa-satellite-dish"></i>
          正在连接..
        </div>
      </div>
    </div>

    <div class="coins">
      <div class="tag-stat">
        <i class="fas fa-coins" v-on:click="show_dialog('coin')" style="padding-right:0.3rem"></i>
        {{vuedata.synced.user.private.coin}}
      </div>
    </div>
  </div>
</template>

<script>
import "../fonts/fontawesome-free-5.13.0-web/css/all.css";
import * as shared from "../shared";
export default {
  data: function() {
    return {
      vuedata: shared.vueData
    };
  },
  methods: shared.actions
};
</script>

<style scoped>
.coins {
  position: fixed;
  top: 20px;
  right: 20px;
  text-align: right;
}
.user-name {
  font-size: 0.8rem;
  font-weight: bolder;
  position: absolute;
  top: 100%;
  transform: translateY(10px);
}
.tag-stat,
.user-stat {
  font-size: 0.8rem;
  font-weight: bolder;
  padding: 0.2rem 0.5rem;
  color: white;
  background: #73ce67;
  position: absolute;
  bottom: -0.5rem;
  border: 3px solid white;
  left: 50%;
  white-space: nowrap;
  border-radius: 9999px;
}
.tag-stat {
  bottom: 0;
  left: 0;
  font-size: 1.0rem;
  padding: 0.4rem 0.8rem;
  background: #ff9d00;
  position: relative;
  display: inline-block;
}
.user-avatar {
  position: fixed;
  left: 20px;
  top: 20px;
}

.head {
  height: 70px;
  width: 70px;
  border: 3px solid #ffffff;
  background: #ccc;
  border-radius: 999999px;
}
</style>