<template>
  <div>
    <i
      v-on:touchstart="touch('u', true)"
      v-on:touchend="touch('u', false)"
      v-if="controller == 'touch' && btn == 'u'"
      style="padding: 1rem;"
      class="fas fa-angle-up"
    ></i>
    <i
      v-on:touchstart="touch('d', true)"
      v-on:touchend="touch('d', false)"
      style="padding: 1rem;"
      v-if="controller == 'touch' && btn == 'd'"
      class="fas fa-angle-down"
    ></i>
    <i
      v-on:touchstart="touch('l', true)"
      v-on:touchend="touch('l', false)"
      style="padding: 1rem;"
      v-if="controller == 'touch' && btn == 'l'"
      class="fas fa-angle-left"
    ></i>
    <i
      v-on:touchstart="touch('r', true)"
      v-on:touchend="touch('r', false)"
      style="padding: 1rem;"
      v-if="controller == 'touch' && btn == 'r'"
      class="fas fa-angle-right"
    ></i>

    <i v-if="controller == 'emo' && btn == 'u'" class="fad fa-angry fa-swap-opacity"></i>
    <i v-if="controller == 'emo' && btn == 'd'" class="fad fa-frown fa-swap-opacity"></i>
    <i v-if="controller == 'emo' && btn == 'l'" class="fad fa-surprise fa-swap-opacity"></i>
    <i v-if="controller == 'emo' && btn == 'r'" class="fad fa-laugh-squint fa-swap-opacity"></i>

    <div class="pender" v-if="controller == 'mouth' && btn == 'l'">
      <i class="fad fa-surprise fa-swap-opacity"></i>
      <i class="fas fa-arrow-left pend"></i>
    </div>
    <div class="pender" v-if="controller == 'mouth' && btn == 'r'">
      <i class="fad fa-surprise fa-swap-opacity"></i>
      <i class="fas fa-arrow-right pend"></i>
    </div>
    <div class="pender" v-if="controller == 'mouth' && btn == 'u'">
      <i class="fad fa-surprise fa-swap-opacity"></i>
      <i class="fas fa-arrow-up pend"></i>
    </div>
    <div class="pender" v-if="controller == 'mouth' && btn == 'd'">
      <i class="fad fa-surprise fa-swap-opacity"></i>
      <i class="fas fa-arrow-down pend"></i>
    </div>

    <i
      v-if="controller == 'tilt' && btn == 'u'"
      style="transform: scale(1, 0.8) translate(0, -5px); text-shadow: rgba(255, 255, 255, 0.2) 0px 7px 0px;"
      class="fad fa-laugh fa-swap-opacity"
    ></i>
    <i
      v-if="controller == 'tilt' && btn == 'd'"
      style="transform: scale(1, 0.8) translate(0, 5px); text-shadow: rgba(255, 255, 255, 0.2) 0px -7px 0px;"
      class="fad fa-laugh fa-swap-opacity"
    ></i>
    <i
      v-if="controller == 'tilt' && btn == 'l'"
      style="transform: rotate(-45deg);"
      class="fad fa-laugh fa-swap-opacity"
    ></i>
    <i
      v-if="controller == 'tilt' && btn == 'r'"
      style="transform: rotate(45deg);"
      class="fad fa-laugh fa-swap-opacity"
    ></i>
  </div>
</template>

<script>
import { loop } from "../libao_stripped";
import * as shared from "../shared";
import * as shared_actions from "../shared-actions";
//controllers..

var aiengine = shared_actions.ai_engine;

var controllers = {};

function abstract_controller(name, brief, sync_update_cb, on_start, on_end) {
  var operation = {
    l: 0,
    r: 0,
    d: 0,
    u: 0,
    active: 0
  };
  controllers[name] = {
    update: sync_update_cb,
    op: operation,
    controller_brief: brief,
    on_start: on_start || (() => {}),
    on_stop: on_end || (() => {})
  };
  shared.vueData.operators[name] = brief;
  return operation;
}

var touch_op = abstract_controller(
  "touch",
  {
    title: "触控操作",
    subtitle: "熟悉的感觉，熟悉的味道",
    pro_title: "传统触摸操作",
    d: 0
  },
  op => {
    op.active = 1;
  }
);

abstract_controller(
  "emo",
  {
    title: "表情帝!",
    subtitle: "情绪识别控制器",
    pro_title: "(高难度) 情绪控制",
    d: 5
  },
  op => {
    /**
       * neutral: (...)
happy: (...)
sad: (...)
angry: (...)
fearful: (...)
disgusted: (...)
surprised: (...)
       */
    op.active = !!aiengine.face_data;
    op.u = aiengine.main_expr == "angry";
    op.d =
      aiengine.main_expr == "sad" ||
      aiengine.main_expr == "fearful" ||
      aiengine.main_expr == "disgusted";
    op.l = aiengine.main_expr == "surprised";
    op.r = aiengine.main_expr == "happy";
  }
);

abstract_controller(
  "tilt",
  {
    title: "颈椎病治疗仪",
    subtitle: "歪头识别控制器 - 落枕请慎重",
    pro_title: "头部倾斜识别",
    d: 1
  },
  op => {
    op.active = !!aiengine.face_data;
    op.u = aiengine.face_sp.tiltUp;
    op.d = aiengine.face_sp.tiltDown; //aiengine.main_expr == "sad" || aiengine.main_expr == "fearful" || aiengine.main_expr == "disgusted";
    op.l = aiengine.face_sp.tiltLeft; //aiengine.main_expr == "surprised";
    op.r = aiengine.face_sp.tiltRight; //aiengine.main_expr == "happy";
  }
);

abstract_controller(
  "mouth",
  {
    title: "我是一条鱼",
    subtitle: "移动头部位置，张嘴确认",
    pro_title: "头部+张口识别",
    d: 3
  },
  op => {
    op.active = !!aiengine.face_data;
    op.u = aiengine.face_pos.y < 0.42 && aiengine.face_sp.mouth;
    op.d = aiengine.face_pos.y > 0.58 && aiengine.face_sp.mouth;
    op.l = aiengine.face_pos.x < 0.42 && aiengine.face_sp.mouth;
    op.r = aiengine.face_pos.x > 0.58 && aiengine.face_sp.mouth;
  }
);

shared.vueData.operator.controller = "emo";
var prev_controller = "";
loop(() => {
  var cur_controller = shared.vueData.operator.controller;
  if (prev_controller != cur_controller) {
    if (controllers[prev_controller]) {
      controllers[prev_controller].on_stop();
    }
    prev_controller = cur_controller;
    if (controllers[cur_controller]) {
      controllers[cur_controller].on_start();
      shared.vueData.operator.controller_brief =
        controllers[cur_controller].controller_brief;
    }
  }
  if (controllers[cur_controller]) {
    controllers[cur_controller].update(controllers[cur_controller].op);
    for (var i in controllers[cur_controller].op) {
      shared.vueData.operator[i] = controllers[cur_controller].op[i];
    }
  }
});

export default {
  props: ["controller", "btn"],
  methods: {
    touch: function(key, state) {
      touch_op[key] = state;
    }
  }
};
</script>

<style scoped>
.pender {
  white-space: nowrap;
}
.pend {
  font-size: 0.8rem;
  line-height: 1;
  vertical-align: middle;
  height: 1rem;
}
</style>