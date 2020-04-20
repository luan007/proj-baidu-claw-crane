import * as shared_actions from "./shared-actions";
import {
    eased,
    loop
} from "./libao_stripped";

export var actions = shared_actions.actions
export var facevid = shared_actions.facevid;
export var ai_engine = shared_actions.ai_engine;


import * as three from "three"
import {
    GLTFLoader
} from "three/examples/jsm/loaders/GLTFLoader"

export var resources = {
    model_claw: {}
};

export var vueData = {
    scene: "main",
    bgScene: "main",
    picked_room: "",
    operator: {
        l: 0,
        r: 0,
        d: 0,
        u: 0,
        push: 0,
        active: 0,
        controller: "",
        controller_brief: {
            title: "Loading...",
            subtitle: "Loading...",
            d: 0
        },
    },
    operators: {},
    threeBg: {
        bgScaleCoeff: 0.2,
        visibility: eased(0, 0, 0.02, 0.00001),
        trigger: 0,
        sceneOffsetY: 0
    },
    synced: shared_actions.synced,
    local_state: shared_actions.local_state
};




window.vueData = vueData;


var gui_related_states = {};

export var data = {};
export var combined_methods = {
    set_controller_to(k) {
        if (vueData.operators[k]) {
            vueData.operator.controller = k;
        }
    }
};

for (var i in shared_actions.actions) {
    combined_methods[i] = shared_actions.actions[i];
}

//lets setup three & soon


export function load(cb) {
    var loader = new GLTFLoader();
    loader.load("./models/claw_machine.gltf", (result) => {
        result.scene.traverse(function (child) {
            if ((child.material && child.material.name === 'Material.009') ||
                (child.material && child.material.name === 'Material.018')) {
                var mat = child.material;
                child.material = new three.MeshBasicMaterial({
                    map: mat.emissiveMap,
                    alphaMap: mat.emissiveMap,
                    side: three.DoubleSide,
                    depthWrite: false,
                    transparent: true
                });
            }
            child.castShadow = child.receiveShadow = true;
        });
        resources.model_claw = result.scene;
        console.log(result.scene);
        cb();
    })

}


var cmd_built = {
    left: 0,
    right: 0,
    bottom: 0,
    up: 0,
    grab: 0
};
var mapper = {
    l: "left",
    r: "right",
    u: "up",
    d: "bottom",
    push: "grab"
};

loop(() => {
    var changed = false;
    for (var i in mapper) {
        var key = mapper[i];
        if (cmd_built[key] != vueData.operator[i]) {
            changed = true;
            cmd_built[key] = vueData.operator[i] ? 1 : 0;
        }
    }
    if (changed) {
        console.log(JSON.stringify(cmd_built));
        actions.send_cmd(cmd_built);
    }
});

setInterval(() => {
    //auto sender..
    actions.send_cmd(cmd_built);
}, 500);