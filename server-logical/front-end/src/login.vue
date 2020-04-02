<template>
  <div>
    <div v-if="login.login==-1" class="fullscreen">
      <div class="center">正在检查登录信息...</div>
    </div>
    <div v-if="login.login==0" class="fullscreen">
      <div class="center">
        <h3>登录</h3>
        <div class="line" v-if="!login.login_token">
          <input v-model="login.phone_number" placeholder="手机号码" />
          <button v-on:click="req_login">发送验证码</button>
        </div>
        <div class="line" v-if="login.login_token">
          <input v-model="login.anwser" placeholder="请输入验证码" />
          <button v-on:click="req_quiz">验证</button>
          <div class="line">
            <button v-on:click="_clear_quiz">返回</button>
          </div>
        </div>
        <div class="line">{{login.log}}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { actions } from "./shared_actions";

export default {
  props: ["login"],
  methods: actions,
  mounted: () => {
    actions.is_logged_in();
  }
};
</script>

<style>
</style>