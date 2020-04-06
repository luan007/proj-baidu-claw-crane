import * as three from "three";
import {
    loop,
    ease,
    eased
} from "../libao_stripped";
import {
    vueData,
    resources
} from "../shared";

export var group = new three.Group();

loop(() => {
    group.position.y = ease(group.position.y, vueData.threeBg.sceneOffsetY, 0.1, 0.0001);
});
var machines = [];

// shared.resources.model_claw.position.z = -5;
// shared.resources.model_claw.rotation.x = 0.4;
// shared.resources.model_claw.rotation.y = 0.2;
// loop((v) => {
//     shared.resources.model_claw.rotation.y += 0.01;
// });
// three_scene.add(shared.resources.model_claw);

export class tiny_machine {
    constructor() {
        machines.push(this);
        this.group = new three.Group();
        group.add(this.group);
        this.build_struct();
        this.t = 0;
        this.visibility = eased(0, 0, 0.1, 0.0001);
    }
    build_struct() {
        var grp = resources.model_claw.clone();
        this.children = [];
        this.target_scales = [];
        grp.traverse((c) => {
            this.target_scales.push(c.scale.clone());
            this.children.push(c);
        });
        this.group_obj = grp;
        grp.scale.set(0.3, 0.3, 0.3);
        var platform = new three.CircleGeometry(1, 50);
        var m = new three.MeshBasicMaterial({
            color: 0xcccccc
        });
        var mesh = new three.Mesh(platform, m);
        this.platform = mesh;
        mesh.rotation.x = -0.5 * Math.PI
        this.group.add(mesh);
        this.group.add(grp);
        this.group.position.z = -5;
        this.group.position.y = -0.5;
        this.group.rotation.x = 0.2;
        this.group.rotation.y = 0.6;
        loop(() => {
            this.loop()
        });
    }
    loop() {
        var v = this.visibility.value + 0.01;
        var bounce = 1 - Math.pow(2 * (this.visibility.value - 0.5), 2);
        this.t += 0.001;
        this.group_obj.scale.y = Math.sin(this.t * 50) * 0.01 + 0.3;
        this.group_obj.scale.x = Math.cos(this.t * 50) * 0.005 + 0.3;
        this.group_obj.scale.z = Math.cos(this.t * 50) * 0.005 + 0.3;
        this.group_obj.position.y = bounce;
        this.group.rotation.y = (1 - this.visibility.value) * Math.PI * 3 + (Math.sin(this.t * 17) * Math.PI / 4);
        this.group.scale.set(v, v, v);
    }
}

export function init() {
    var tx = new tiny_machine();
    window.tx = tx;
}