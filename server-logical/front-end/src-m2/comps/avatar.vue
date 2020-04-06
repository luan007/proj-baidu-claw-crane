<template>
  <div class="user-avatar">
    <div class="head">
      <div class="user-name">
        测试用户001
      </div>
      <div class="user-stat">
        <i class="fas fa-gamepad"></i> {{vuedata.synced.user.private.coin}}
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
  }
};
</script>

<style scoped>
.user-name {
  font-size: 0.8rem;
  font-weight: bolder;
  position: absolute;
  top: 100%;
  transform: translateY(10px);
}
.user-stat {
  font-size: 0.8rem;
  font-weight: bolder;
  padding: 0.2rem 0.5rem;
  color: white;
  background: #ff5a00;
  position: absolute;
  bottom: -0.5rem;
  border: 3px solid white;
  left: 50%;
  white-space: nowrap;
  border-radius: 9999px;
}
.coins {
  font-size: 0.8rem;
  font-weight: bolder;
  padding: 0.2rem 0.5rem;
  color: white;
  background: #ff5a00;
  position: absolute;
  bottom: -0.5rem;
  border: 3px solid white;
  left: 50%;
  white-space: nowrap;
  border-radius: 9999px;
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