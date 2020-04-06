<template>
  <div v-bind:class="{'room-selector' : 1, 'show': vuedata.scene=='room'}">
    <div class="scroller">
      <div
        v-on:click="pick_room(key)"
        v-for="n,key in vuedata.synced.rooms"
        v-bind:class="{'room-card': true, 'selected': key == vuedata.picked_room}"
      >
        <div class="room-avatar">
          <div class="hidden_go">GO</div>
        </div>
        <div class="room-cost">{{room_machine(key).public.cost}}</div>
        <div class="room-title">{{room_machine(key).public.title}}</div>
        <div class="room-subtitle">{{room_machine(key).public.intro}}</div>
        <div v-if="true" class="room-states">
          <div class="tag">
            <span style="padding-right: 2px; ">{{get_room_state(key).emoji}}</span>
            {{get_room_state(key).message}}
          </div>
          <div class="tag">
            <span style="padding-right: 2px; ">📶</span>
            在线 {{vuedata.synced.room_states[key].users}}
          </div>
        </div>
        <div v-else class="room-states">
          <div class="tag">
            <span style="padding-right: 2px; ">⭕️</span>虚拟娃娃机
          </div>
        </div>
      </div>
    </div>
    <div class="room-select-title big_cute_text">
      选择娃娃机
      <div style="font-size:0.8em">CHOOSE MACHINE</div>
    </div>
  </div>
</template>

<script>
import "./shared.less";
import * as shared from "../shared";
export default {
  props: ["vuedata"],
  methods: shared.actions
};
</script>

<style>
.room-selector {
  transition: all 0.8s cubic-bezier(0.165, 0.84, 0.44, 1);
  transform: translateY(120%);
}
.room-selector.show {
  transform: translateY(0%);
}
.room-select-title {
  position: absolute;
  letter-spacing: 2px;
  top: -2.5rem;
  font-weight: 900;
  left: 1.2rem;
}
.scroller {
  overflow: scroll;
  -webkit-overflow-scrolling: touch;
  position: absolute;
  top: 0px;
  left: 10px;
  right: 10px;
  pointer-events: all;
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

.room-card.selected {
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
  box-shadow: 5px 5px 0px rgba(0,0,0,0.2);
  /* animation: blink 2s infinite; */
}

.room-card.selected {
  box-shadow: 1px 1px 0px rgba(0,0,0,0.2);
}

.room-subtitle {
  color: #333;
  text-align: left;
  font-style: italic;
  font-size: 0.8rem;
  margin-top: 0.8rem;
  margin-bottom: 0.8rem;
  font-weight: lighter;
}
.room-states {
  margin-top: 0.5rem;
  text-align: left;
  font-size: 0.8rem;
  font-weight: bolder;
}
.room-states .tag {
  text-align: right;
  font-size: 0.8rem;
  font-weight: bolder;
  display: inline-block;
  background: #07a5ee;
  color: #fff;
  /* color: #ffffff; */
  vertical-align: middle;
  padding: 5px 5px;
  line-height: 0.8rem;
}
.room-title {
  margin-bottom: 0.5rem;
  text-align: left;
  color: #000;
  font-size: 1.5rem;
}
.selected .room-title, .selected .room-subtitle{
  color: #fff;
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
.room-cost {
  transition: all 0.2s ease;
  position: absolute;
  width: 4rem;
  background: #07a5ee;
  border-radius: 5px;
  left: 1rem;
  top: 5.5rem;
  color: white;
  font-size: 1rem;
  font-weight: bolder;
}
.room-card.selected .room-avatar {
  background: rgba(255, 255, 255, 1);
  /* transform: scale(1.2); */
}
.room-avatar .hidden_go {
  color: #07a5ee;
  top: 50%;
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>