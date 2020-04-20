<template>
  <div
    v-bind:class="{pin: true, show: scene=='game'}"
    style="position: absolute; bottom: 160px;left: 50%;height: 1px;width: 1px;"
  >
    <div v-bind:class="{panel: true, active: is_in_game()}">
      <div class="core">
        <div class="pad-title">
          <div style="font-weight: bolder;">{{operator.controller_brief.title}}</div>
          <div style="font-size: 0.8em; color: #000;">{{operator.controller_brief.subtitle}}</div>
          <div v-if="operator.controller_brief.d > -1" style="font-size: 0.5em; color: #ff004f;">
            <i v-for="a in operator.controller_brief.d" class="fas fa-star"></i>
            <i v-for="a in 5-operator.controller_brief.d" style="color:#ccc" class="far fa-star"></i>
          </div>
        </div>
        <div class="rel">
          <div ref="corearea" v-bind:class="{padring: true, active: operator.active}"></div>
          <div class="operator">
            <div v-bind:class="{b: 1, u: 1, activate: operator.u}">
              <pad-face v-bind:controller="operator.controller" btn="u"></pad-face>
            </div>
            <div v-bind:class="{b: 1, d: 1, activate: operator.d}">
              <pad-face v-bind:controller="operator.controller" btn="d"></pad-face>
            </div>
            <div v-bind:class="{b: 1, l: 1, activate: operator.l}">
              <pad-face v-bind:controller="operator.controller" btn="l"></pad-face>
            </div>
            <div v-bind:class="{b: 1, r: 1, activate: operator.r}">
              <pad-face v-bind:controller="operator.controller" btn="r"></pad-face>
            </div>
          </div>
          <div class="aux">
            <div
              v-on:touchstart="set_op_push(true)"
              v-on:touchend="set_op_push(false)"
              v-bind:class="{pushbtn: 1, activate: operator.push}"
            >
              <i class="fas fa-crosshairs"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-on:click="start_game(current_machine_id())"
      v-bind:class="{throw_coin: true, show: get_room_state(current_room_id()).state == 1}"
    >
      <div style="position:Absolute; top:50%; left: 0; right: 0; transform:translateY(-50%)">
        <div style="font-size: 2em; margin-bottom: 5px;">
          <i class="fas fa-coins"></i> 2
        </div>
        <div>投币开启</div>
      </div>
    </div>

    <div
      v-on:click="join_room('0')"
      v-bind:class="{throw_coin: true, back: true, show: !is_in_game()}"
    >
      <div style="position:Absolute; top:50%; left: 0; right: 0; transform:translateY(-50%)">
        <div style="font-size: 2em; margin-bottom: 5px;">
          <i class="fas fa-arrow-left"></i>
        </div>
        <div>返回大厅</div>
      </div>
    </div>
  </div>
</template>

<script>
import * as shared from "../shared";
import { loop, eased } from "../libao_stripped";
var canvas = document.createElement("CANVAS");
canvas.style.width = "100%";
canvas.style.height = "100%";
var ctx2d = canvas.getContext("2d");
var W = 180;
var H = 180;
canvas.width = W;
canvas.height = H;

var offsets = {
  x: eased(0, 0, 0.1, 0.001),
  y: eased(0, 0, 0.1, 0.001)
};
loop(() => {
  //mount stuff here..
  ctx2d.clearRect(0, 0, 180, 180);
  if (
    !shared.ai_engine.face_data_persist ||
    !shared.ai_engine.face_data_persist.detection
  ) {
    return;
  }
  var box = shared.ai_engine.face_data_persist.alignedRect.box;
  ctx2d.save();
  offsets.x.to = box.x + box.width / 2;
  offsets.y.to = box.y + box.height / 2;
  ctx2d.translate(W / 2, H / 2);
  ctx2d.scale(0.6, 0.6);
  ctx2d.translate(-offsets.x, -offsets.y);
  ctx2d.drawImage(shared.facevid, 0, 0);
  ctx2d.restore();

  var points = shared.ai_engine.face_data_persist.landmarks.relativePositions;
  ctx2d.save();
  ctx2d.fillStyle = "#ff0000";
  ctx2d.restore();
});

shared.actions.set_op_push = function(o) {
  console.log(o);
  shared.vueData.operator.push = o;
};
export default {
  data: function() {
    return shared.vueData;
  },
  mounted: function() {
    this.$refs.corearea.appendChild(canvas);
  },
  beforeDestroy: function() {
    canvas.remove();
  },
  methods: shared.actions
};
</script>

<style lang="less" scoped>
.throw_coin.back {
  opacity: 0;
  left: -140px;
  top: 60px;
  height: 60px;
  background: #ffffff00;
  width: 80px;
  animation: none;
  border-width: 5px;
  color: #000000;
  border-radius: 30px;
  pointer-events: none;
  border-color: #000000;
  /* background: transparent; */
}
.throw_coin.back.show {
  pointer-events: all;
  opacity: 0.3;
}
.throw_coin.show {
  pointer-events: all;
  transform: translate(-50%, -50%);
  opacity: 1;
}
.throw_coin div {
  font-size: 0.8rem;
}
@keyframes border-blink {
  0% {
    border-color: rgba(255, 255, 255, 1);
  }
  50% {
    border-color: rgba(255, 255, 255, 0);
  }
  100% {
    border-color: rgba(255, 255, 255, 1);
  }
}
.throw_coin {
  height: 100px;
  width: 100px;
  animation: border-blink 0.5s ease infinite;
  position: absolute;
  pointer-events: none;
  border-radius: 100px;
  background: #ff9c01;
  font-weight: bolder;
  color: #ffffff;
  /* overflow: visible; */
  font-size: 0.8rem !important;
  /* left: 70px; */
  opacity: 0;
  transform: translate(-50%, -20%);
  box-shadow: 0 8px 0 rgba(0, 0, 0, 0.1);
  top: -200px;
  border: 8px solid #ffffff;
  transition: all 0.5s ease;

  left: -140px;
  top: -50px;
}
.throw_coin:hover {
  top: -45px;
  color: #ff9c01;
  background: white;

  box-shadow: 0 5px 0 rgba(0, 0, 0, 0);
}
.pad-title {
  position: absolute;
  bottom: -100px;
  opacity: 1;
  transition: all 0.5s ease;
  left: 50%;
  text-align: left;
  transform: translateX(-50%);
  white-space: nowrap;
  padding: 0.2rem 1.3rem;
  border-radius: 3rem;
  background: white;
  font-weight: bolder;
  font-size: 1rem;
  border: 10px solid #5bcffa;
  pointer-events: none;
}
.active .pad-title {
  opacity: 0;
}
.padring {
  overflow: hidden;
  position: absolute;
  height: 100%;
  width: 100%;
  border: 20px solid #fff;
  transition: all 0.5s ease;
  box-sizing: border-box;
  background: #555;
  border-radius: 99999rem;
}

@keyframes tracking-blink {
  0% {
    border-color: #6dffb6;
  }
  50% {
    border-color: #6debb6;
  }
  100% {
    border-color: #6dffb6;
  }
}
.padring.active {
  animation: tracking-blink 0.3s ease infinite;
}
.operator {
  position: absolute;
  height: 100%;
  width: 100%;
  border: 5px solid #ccc;
  box-sizing: border-box;
  border-radius: 99999rem;
}

.b {
  color: white;
  position: absolute;
  height: 50px;
  width: 50px;
  transform: translate(-50%, -50%);
  background: black;
  border-radius: 50px;
  transition: all 0.2s ease;
  box-shadow: 0px 5px 0px rgba(0, 0, 0, 0.2);
}

.b > * {
  color: #ea40f7;
  //   color: #fff;
  /* line-height: 100%; */
  /* vertical-align: middle; */
  top: 50%;
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2rem;
}

.b.activate {
  background: white;
  color: #000;
  box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.2);
  transform: translate(-50%, -40%);
}

.b.u {
  top: 0;
  left: 50%;
}

.b.l {
  top: 50%;
  left: 0%;
}

.b.r {
  top: 50%;
  left: 100%;
}

.b.d {
  top: 100%;
  left: 50%;
}

.panel {
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transform: translateX(50px) scale(0.9);
  opacity: 0.8;
  position: absolute;
}

.active.panel {
  opacity: 1;
  transform: translateY(70px) scale(0.9);
}

.core {
  position: absolute;
  top: 0%;
  left: 0%;
  transform: translate(-50%, -50%);
  width: 180px;
  height: 180px;
  border-radius: 999999px;
  border: 35px solid #5ccffa;
  background: white;
}
.rel {
  position: relative;
  height: 100%;
  width: 100%;
}
.aux {
  position: absolute;
      top: 110px;
    right: -90px;
  width: 70px;
  height: 70px;
  background: black;
  // transform: translate(66%, -66%);
  border-radius: 999999px;
  border: 20px solid #5ccffa;
}

.pushbtn > *,
.aux > * {
  color: #6dedb6;
  /* line-height: 100%; */
  /* vertical-align: middle; */
  top: 50%;
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2rem;
}

.pushbtn {
  display: block;
  position: absolute;
  box-sizing: border-box;
  height: 100%;
  width: 100%;
  border-radius: 100000px;
  transition: all 0.2s ease;
  border: 6px solid white;
  box-shadow: 0px 5px 0px rgba(0, 0, 0, 0.3);
}

.pushbtn.activate {
  background: white;
  color: black;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.3);
}

.pin {
  transition: all 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transform: translateY(350px) rotate(45deg) scale(0.5);
}

.show.pin {
  transform: translateY(0) rotate(0deg) scale(0.85);
}
</style>
