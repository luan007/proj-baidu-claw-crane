<template>
  <div class="fs">
    <div class="fs" v-if="local_state.login.login <= 0">
      <div class="mask"></div>
      <!-- loading or so -->
      <!-- <div class="round-dialog-kindof-thing">
      <div class="expand"></div>
      </div>-->
      <!-- login -->
      <div class="round-dialog-kindof-thing login">
        <div class="title">
          登录
          <br />
          <span style="font-size: 0.8em">LOGIN</span>
        </div>
        <div
          v-if="!local_state.login.login_token"
          class="login-forms"
          style="position: relative; margin-top: 1rem;"
        >
          <div class="minor">请输入手机号码</div>
          <input v-model="local_state.login.phone_number" placeholder="+861.." />
          <div class="minor error">{{local_state.login.log}}</div>
          <div class="btn" v-on:click="req_login">发送验证码</div>
        </div>
        <div v-else class="login-forms" style="position: relative; margin-top: 1rem;">
          <div class="minor">请输入验证码</div>
          <input v-model="local_state.login.anwser" placeholder="****" />
          <div class="minor error">{{local_state.login.log}}</div>
          <div class="btn" v-on:click="clear_quiz">返回</div>
          <div class="btn confirm" v-on:click="req_quiz">验证</div>
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
.login {
  text-align: left;
}
.login-forms {
  padding-bottom: 1rem;
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
.login {
  pointer-events: all;
  border: none;
  box-shadow: 0px 5px 0px rgba(0, 0, 0, 0.1);
}
.minor {
  font-size: 1.2rem;
  color: #666;
  margin-top: 1rem;
  margin-bottom: 1rem;
  font-weight: bolder;
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
  top: -7rem;
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
  font-size: 2.2rem;
  transform-origin: 50% 50%;
  animation: swing 3s ease infinite;
}
.login {
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
  width: 50px;
}

.confirm.btn {
  background: #07a5ee;
  color: white;
  font-weight: bolder;
}
</style>