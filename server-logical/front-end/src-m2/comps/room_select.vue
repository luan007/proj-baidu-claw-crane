<template>
  <div class="room-selector">
    <div class="scroller">
      <div v-for="n,key in [1,2,3,4,5,6,7,8]" class="room-card">
        <div class="room-avatar"></div>
        <div class="room-title">抓抓机 1号</div>
        <div class="room-subtitle">抓抓好东西</div>
      </div>
    </div>
    <div class="room-select-title big_cute_text">
      选择娃娃机
      <div style="font-size:0.8em">MACHINE SELECT</div>
    </div>
  </div>
</template>

<script>
export default {};
</script>

<style>
@keyframes blink {
  0% {
    transform: translateY(0px);
    box-shadow: 0px 1px 0px rgba(0, 0, 0, 0.2);
  }
  50% {
    transform: translateY(-5px);
    box-shadow: 0px 8px 0px rgba(0, 0, 0, 0.2);
  }
  100% {
    transform: translateY(0px);
    box-shadow: 0px 1px 0px rgba(0, 0, 0, 0.2);
  }
}
.blinky {
  animation: blink 3s infinite;
}
.big_cute_text {
  position: absolute;
  padding: 10px 20px;
  /* border: 3px solid #07a5ee; */
  border-radius: 10px;
  font-weight: 900;
  -webkit-text-stroke-width: 1px;
  -moz-text-stroke-width: 1px;
  -webkit-text-stroke-color: #fff;
  background: #07a5ee;
  box-shadow: 5px 5px 0px rgba(0, 0, 0, 0.2);
  -moz-text-stroke-color: #fff;
  color: #fff;
  font-size: 1.2rem;
  transform: translateY(-5px);
  box-shadow: 0px 5px 0px rgba(0, 0, 0, 0.2);
}
.room-select-title {
  position: absolute;
  letter-spacing: 2px;
  top: -2.5rem;
  font-weight: 900;
  left: 1.2rem;
}
.scroller {
  scroll-behavior: smooth;
  overflow: scroll;
  -webkit-overflow-scrolling: touch;
  position: absolute;
  top: 0px;
  left: 10px;
  right: 10px;
  bottom: 0px;
  padding-top: 40px;
}

@keyframes scrollbg {
  0% {
    background-position: 50px 50px;
  }
  50% {
    background-position: 40px 80px;
  }
  100% {
    background-position: 50px 50px;
  }
}
.room-selector {
  position: absolute;
  /* bottom: -3px; */
  bottom: 0px;
  left: -3px;
  right: -3px;
  top: 60%;
  white-space: nowrap;
  text-align: left;
  /* border-radius: 20px; */
  border-radius: 0px;
  border: 2px solid rgb(0, 153, 255);
  border-bottom: none;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  /* border: 2px solid #99eeff; */
  background: linear-gradient(
    45deg,
    rgb(0, 153, 255, 0.2) 7.5%,
    rgba(0, 0, 0, 0) 7.5%,
    rgba(0, 0, 0, 0) 42.5%,
    rgb(0, 153, 255, 0.2) 42.5%,
    rgb(0, 153, 255, 0.2) 57.5%,
    rgba(0, 0, 0, 0) 57.5%,
    rgba(0, 0, 0, 0) 92.5%,
    rgb(0, 153, 255, 0.2) 92.5%
  );
  background-size: 16px 16px;
  animation: scrollbg 10s infinite both;
}

@keyframes card-shadow {
  0% {
    transform: translateY(0px);
    box-shadow: 3px 3px 0px rgba(0, 0, 0, 0.2);
  }
  50% {
    transform: translateY(-2px);
    box-shadow: 3px 5px 0px rgba(0, 0, 0, 0.2);
  }
  100% {
    transform: translateY(0px);
    box-shadow: 3px 3px 0px rgba(0, 0, 0, 0.2);
  }
}

.room-card.selected,
.room-card:hover {
  color: #fff;
  animation: none;
  background-color: #07a5ee;
}

.room-card {
  position: relative;
  font-size: 1rem;
  padding: 1rem 2rem;
  font-weight: bolder;
  padding-left: 6rem;
  background-color: rgba(255, 255, 255, 0.8);
  border: 2px solid #07a5ee;
  border-radius: 7px;
  margin-bottom: 40px;
  word-wrap: break-word;
  margin-right: 30px;
  white-space: normal;
  margin-left: 30px;
  color: #07a5ee;
  transition: all 0.2s ease;
  animation: blink 2s infinite;
}
.room-subtitle {
  text-align: left;
  font-style: italic;
  font-size: 1rem;
  font-weight: lighter;
}
.room-title {
  margin-bottom: 0.5rem;
  text-align: left;
  font-size: 2rem;
}
.room-avatar {
  transition: all 0.2s ease;
  position: absolute;
  height: 4rem;
  width: 4rem;
  background: #07a5ee;
  border-radius: 5px;
  left: 1rem;
  top: 1rem;
}
.room-card.selected .room-avatar,
.room-card:hover .room-avatar {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.2);
}
</style>