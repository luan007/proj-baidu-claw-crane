<template>
  <div class="fs">
    <div v-bind:class="{fs:true, show: local_state.dialog == 'coin'}">
      <div class="mask" v-on:click="close_dialog('coin')"></div>
      <div class="round-dialog-kindof-thing dialog bgw">
        <div class="title">
          获取更多金币
          <br />
          <span style="font-size: 0.8em">ADD COINS</span>
        </div>
        <div class="forms" style="position: relative; ">
          <div class="minor">点击按钮充值获取金币</div>
          <div class="btn" v-on:click="add_coin(10)">测试+10</div>
          <div class="btn" v-on:click="close_dialog('coin')">关闭</div>
          <div class="minor" style="margin-top: 1rem; font-size: 0.6em; font-weight: 300;">
            <i>
              点击测试后系统模拟支付过程
              <br />约10秒后“充值到账”
            </i>
          </div>
        </div>
      </div>
    </div>

    <div v-bind:class="{fs:true, show: local_state.dialog == 'user'}">
      <div class="mask" v-on:click="close_dialog('user')"></div>
      <div class="round-dialog-kindof-thing dialog bgw">
        <div class="title">
          玩家信息
          <br />
          <span style="font-size: 0.8em">PLAYER SETTINGS</span>
        </div>
        <div class="forms" style="position: relative; ">
          <div class="btn" v-on:click="close_dialog('user')">关闭</div>
          <div class="btn" v-on:click="join_room('0')">返回Lobby</div>
          <div class="minor" style="margin-top: 1rem; font-size: 0.6em; font-weight: 300;">
            <i>
              用户配置将在这里
            </i>
          </div>
        </div>
      </div>
    </div>



    <div v-bind:class="{fs:true, show: local_state.dialog == 'help'}">
      <div class="mask" v-on:click="close_dialog('help')"></div>
      <div class="round-dialog-kindof-thing dialog bgw">
        <div class="title">
          玩法教学
          <br />
          <span style="font-size: 0.8em">TUTORIAL</span>
        </div>
        <div class="forms" style="position: relative; ">
          <div class="btn" v-on:click="close_dialog('help')">关闭</div>
          <div class="minor" style="margin-top: 1rem; font-size: 0.6em; font-weight: 300;">
            <i>
              玩法教学Placeholder
            </i>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import "./shared.less";
import * as shared from "../shared";
export default {
  data: function() {
    return shared.vueData;
  },
  methods: shared.actions
};
</script>

<style scoped>
.forms {
  padding-bottom: 1rem;
  padding: 1.5rem;
}
input::placeholder {
  font-style: italic;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.5);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
}
input {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  font-weight: 600;
  outline: transparent;
  display: block;
  background: #07a5ee;
  border: none;
  color: white;
  padding: 0.5rem;
  border-radius: 8px;
  margin-left: 1rem;
  margin-right: 1rem;
}
.dialog {
  border: none;
  box-shadow: 0px 5px 0px rgba(0, 0, 0, 0.1);
}
.minor {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 1rem;
  font-weight: bolder;
}
.btn:hover {
  background: #07a5ee;
  color: white;
}
.btn {
  border: 3px solid #07a5ee;
  /* border: 3px solid #07a5ee; */
  border-radius: 10px;
  display: inline-block;
  color: #07a5ee;
  padding: 0.5rem 1rem;
  font-size: 1.2rem;
}
.title {
  position: absolute;
  top: -5.5rem;
  left: 0;
  right: 0;
  padding: 10px 20px;
  -webkit-text-stroke-color: #fff;
  -moz-text-stroke-color: #fff;
  color: #fff;
  padding: 1rem 2rem;
  font-weight: 900;
  -webkit-text-stroke-width: 1px;
  -moz-text-stroke-width: 1px;
  -webkit-text-stroke-color: rgb(255, 255, 255);
  -moz-text-stroke-color: rgb(255, 255, 255);
  color: rgb(255, 255, 255);
  font-size: 1.5rem;
  transform-origin: 50% 50%;
  animation: swing 3s ease infinite;
}
.bgw {
  background: white;
}
.fs {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}
.mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(19, 221, 177, 0.5);
}
.expand {
  height: 50px;
  /* width: 50px; */
}

.confirm.btn {
  background: #07a5ee;
  color: white;
  font-weight: bolder;
}

.fs {
  pointer-events: none;
}

.fs .mask {
  opacity: 0;
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.fs .dialog {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0) rotate(30deg);
  transform-origin: 50% 50%;
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.fs.show .mask {
  opacity: 1;
  pointer-events: all;
}
.fs.show .dialog {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
  pointer-events: all;
  transform-origin: 50% 50%;
}
</style>