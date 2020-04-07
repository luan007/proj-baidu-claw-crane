import * as ao from "./libao_stripped";
import * as shared from "./shared";
import {
    vueData
} from "./shared";
import * as q from "./comps/*.vue";

import * as three_components from "./three-d";
import {
    loop
} from "./libao_stripped";
import * as three from "three"

export var three_scene = ao.threeScene();
export var three_renderer = ao.threeRenderer({
    clearColor: 0,
    alpha: 0
});
three_renderer.shadowMap.enabled = true;
three_renderer.shadowMap.type = three.PCFSoftShadowMap; // default THREE.PCFShadowMap
three_renderer.setPixelRatio(devicePixelRatio);

export var three_camera = ao.threeOrthoCamera();

ao.loop(() => {
    ao.sceneGrpSelectId("main", vueData.scene, true);
    ao.sceneGrpSelectId("bg", vueData.bgScene, true);
});

ao.threeLoop();
ao.looperStart();

export function fully_loaded() {
    three_components.comp_machine.init();
    three_scene.add(three_components.comp_background.group)
    three_scene.add(three_components.comp_machine.group);
    ao.vueLoadComponents(q)
    ao.vueSetup("#app", {
        data: shared.vueData
    });
}

var scene_main = ao.sceneBuild(
    () => {}, "main", "main"
)

var room_prev_val = vueData.picked_room;
var scene_room = ao.sceneBuild(
    () => {
        if(room_prev_val != vueData.picked_room) {
            room_prev_val = vueData.picked_room;
            vueData.threeBg.trigger = 1;
        }
    }, "main", "room"
)

loop(() => {
    vueData.threeBg.sceneOffsetY = shared.vueData.scene == 'room' ? 1 : 0;
    if (shared.vueData.local_state.login.login) {
        shared.vueData.scene = "room";
        // if (window["tx"]) {
        //     tx.visibility.to = 1
        // }
    }
    else {
        shared.vueData.scene = "login";
    }
})