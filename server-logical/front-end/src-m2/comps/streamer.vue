<template>
  <div v-bind:class="{video_shell: 1, show: show}">
    <div
      v-bind:class="{
      video_holder: true, 
      occupied: current_room_session() && current_room_session().user != synced.user.uid,
      self: current_room_session() && current_room_session().user == synced.user.uid
    }"
      ref="canvas_holder"
    >
      <canvas class="stretcher" height="640" width="480"></canvas>
      <div class="video_state" v-if="current_room_state()">
        <i v-if="video_state <= 0" class="fad fa-signal-alt-slash"></i>
        <i v-if="video_state > 0" class="fas fa-signal-alt"></i>
        在线: {{current_room_state().users}}
      </div>
      <div class="countdown">
        <i class="fas fa-clock"></i>
        <span
          v-if="current_room_session() && !current_room_session().ended"
        >{{current_room_session().countdown}}</span>
      </div>
      <div class="game-header occupied">
        <i class="fas fa-signal-stream"></i>
        <span>玩家游戏中</span>
      </div>
      <div class="game-header self">
        <i class="fas fa-gamepad"></i>
        <span>! 您已上机 !</span>
      </div>
    </div>
  </div>
</template>

<script>
import "./shared.less";
import * as shared from "../shared";
var methods = {
  reload: function() {
    if (this.vars.prev_src == this.src) {
      return;
    }
    this.destroy();
    this.vars.prev_src = this.src;
    if (!this.src) return;
    var _t = this;
    this.vars.player = new JSMpeg.Player(this.src, {
      audio: false,
      loop: false,
      autoplay: true,
      onStalled: function() {
        _t.video_state = -1;
      },
      onSourceCompleted: function() {
        _t.video_state = -2;
      },
      onPlay: function() {
        _t.video_state = 1;
      },
      onEnded: function() {
        _t.video_state = 0;
      }
    });
    this.$refs.canvas_holder.appendChild(this.vars.player.renderer.canvas);
    this.vars.player.renderer.canvas.width = 480;
    this.vars.player.renderer.canvas.height = 640;
    console.log("creating canvas");
  },
  destroy: function() {
    if (this.vars.player) {
      this.vars.player.destroy();
      this.vars.player = null;
    }
  }
};
for (var i in shared.actions) {
  methods[i] = shared.actions[i];
}
export default {
  props: ["src", "show"],
  data: function() {
    return {
      synced: shared.vueData.synced,
      video_state: 0
    };
  },
  created: function() {
    this.vars = { player: null, prev_src: undefined };
  },
  watch: {
    src: function() {
      console.log("SRC");
      this.reload();
    }
  },
  methods: methods,
  mounted: function() {
    this.reload();
  },
  beforeDestroy: function() {
    console.log("DESTROYING STREAM");
    this.destroy();
  }
};
</script>

<style>
.self .game-header.self,
.occupied .game-header.occupied {
  transform: translateX(-50%) translateY(0%);
}
.game-header {
  position: absolute;
  top: -2px;
  left: 50%;
  transform: translateX(-50%) translateY(-100%);
  border-radius: 0 0 10px 10px;
  background: white;
  z-index: 99;
  padding: 5px 20px;
  font-size: 0.8rem;
  font-weight: bolder;
  color: white;
  background: #fb2020;
  transition: all 0.5s ease;
  box-shadow: 0px 3px 0px rgba(0, 0, 0, 0.2);
}

.game-header.self {
  background: #20ef20;
}
.video_shell {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  transform: translateX(-150%) rotate(-15deg);
  transition: all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transform-origin: 50% 50%;
}
.video_shell.show {
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transform: translateX(0%) rotate(0deg);
}
.video_shell .video_holder {
  position: absolute;
  left: 50%;
  transform: translate(-50%, 0%);
  top: 5rem;
  width: 80%;
  box-sizing: border-box;
  border: 3px solid white;
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.5s ease;
}
.video_shell .video_holder.occupied {
  border-color: #fb2020;
}

.video_shell .video_holder.self {
  border-color: #20ef20;
}

.video_shell .video_holder .stretcher {
  width: 100%;
  position: relative;
  height: 100%;
  display: block;
  background: #333;
}
.video_shell .video_holder canvas {
  width: 100%;
  height: 100%;
  display: block;
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
}
.video_shell .video_holder:after {
  content: " ";
  display: block;
  box-shadow: inset 0px 6px 8px rgba(0, 0, 0, 0.27);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.video_state {
  position: absolute;
  top: 1rem;
  right: 1rem;
  overflow: visible;
  font-size: 0.8rem;
  z-index: 5;
  color: white;
}

@keyframes opa-blink {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    opacity: 1;
  }
}

.countdown {
  position: absolute;
  left: 0.5rem;
  top: 0.5rem;
  animation: opa-blink 0.5s infinite;
  /* border: 3px solid #22ef1f; */
  z-index: 9;
  padding: 0.2rem 0.5rem;
  border-radius: 10px;
  font-weight: bolder;
  background: #fff;
  color: #222;
  box-shadow: 0px 5px 0px rgba(0, 0, 0, 0.5);
  transition: all 0.5s ease;
  transform: translateX(-200px);
}
.self .countdown,
.occupied .countdown {
  transform: translateX(0px);
}
</style>