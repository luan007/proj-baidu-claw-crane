import * as three from "three";
import {
    loop,
    ease,
    eased,
    lerp,
    map
} from "../libao_stripped";
import {
    vueData
} from "../shared";

export var group = new three.Group();

export var xpand = eased(0, 0, 0.05, 0.00001);
var geo = new three.BoxGeometry(5.5, 5.5, 5.5);
var mat = new three.MeshBasicMaterial({
    color: 0x98effd
});
var mesh = new three.Mesh(geo, mat);

group.add(mesh);

loop(() => {
    var sc = Math.pow(xpand + 0.01, 2) * 2; 
    mesh.rotation.set(xpand * 2.5, xpand * 5.2, xpand * 0.05);
    mesh.scale.set(sc, sc, sc);
    mesh.visible = xpand > 0.01;
    window.pause_three = xpand > 0.9; //opti-three
});

group.position.z = -8;
