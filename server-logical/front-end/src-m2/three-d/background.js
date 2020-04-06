import * as three from "three";
import {
    loop,
    ease
} from "../libao_stripped";
import {
    vueData
} from "../shared";


var SIZE_X = 13;
var SIZE_Y = 13;
var scaler = 0.3;

var CANVAS_W = SIZE_X * 2 + 1;
var CANVAS_H = SIZE_Y * 2 + 1;

var buffer_canvas = document.createElement("canvas");
buffer_canvas.width = CANVAS_W;
buffer_canvas.height = CANVAS_H;
var buffer_ctx2d = buffer_canvas.getContext('2d');

export var group = new three.Group();

var dirlight = new three.DirectionalLight(0xffffff, 0.5);
dirlight.position.set(5, 5, 5);
group.add(dirlight);

var ambient = new three.AmbientLight(0xffffff, 1);
group.add(ambient);

var mat = new three.MeshPhongMaterial({
    color: 0x2299ff,
    flatShading: true,
    shading: three.FlatShading
});

var geo = new three.BoxGeometry(scaler, scaler, scaler);
var meshes = [];
for (var x = -SIZE_X; x <= SIZE_X; x++) {
    for (var y = -SIZE_Y; y <= SIZE_Y; y++) {
        var mesh = new three.Mesh(geo, mat);
        mesh.scaler = 1;
        mesh.pos = [x + SIZE_X, y + SIZE_Y];
        meshes.push(mesh);
        mesh.position.set(x * scaler, y * scaler, -10);
        mesh.position._y = y * scaler;
        group.add(mesh);
    }
}

loop(() => {

    if(vueData.threeBg.trigger) {
        vueData.threeBg.trigger = 0;
        vueData.threeBg.visibility.value = 0;
        vueData.threeBg.visibility.to = 1;
    }

    buffer_ctx2d.strokeStyle = "rgba(255,255,255,1)"
    buffer_ctx2d.lineWidth = 3;
    buffer_ctx2d.save();
    buffer_ctx2d.translate(CANVAS_W / 2, CANVAS_H / 2);
    var sz = vueData.threeBg.visibility.value * SIZE_Y * 2;
    buffer_ctx2d.rotate(vueData.threeBg.visibility.value * 3.5);
    if (sz >= 0.7) {
        buffer_ctx2d.strokeRect(-sz, -sz, sz * 2, sz * 2)
    }
    buffer_ctx2d.restore();
    buffer_ctx2d.fillStyle = "rgba(0, 0, 0, 0.05)"
    buffer_ctx2d.fillRect(0, 0, CANVAS_W, CANVAS_H);
    var sampled = buffer_ctx2d.getImageData(0, 0, CANVAS_W, CANVAS_H).data;
    meshes.forEach((v) => {
        // var viz = 
        var X = v.pos[0];
        var Y = v.pos[1];
        var nscaler = sampled[(X + Y * CANVAS_W) * 4] / 255;
        v.scaler = ease(v.scaler, nscaler, 0.1, 0.0001);
        v.scale.set(v.scaler * 1.5, v.scaler * 1.5, v.scaler  * 1.5);
        v.position.y = v.position._y + v.scaler * 0.4;
        v.position.z = -10 + 2 * v.scaler;
        v.rotation.set(0, v.scaler * Math.PI * 2, v.scaler * Math.PI * 2);
        v.visible = v.scaler > 0.05;
    });
});


// document.body.addEventListener("touchstart", ()=>{
//     vueData.threeBg.visibility.to = 1;
// });
// document.body.addEventListener("touchend", ()=>{
//     vueData.threeBg.visibility.to = 0;
// });