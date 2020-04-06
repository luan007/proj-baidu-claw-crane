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
    ao.vueSetup("#app", shared.vueData);
}



var scene_main = ao.sceneBuild(
    () => {

    }, "bg", "main"
)