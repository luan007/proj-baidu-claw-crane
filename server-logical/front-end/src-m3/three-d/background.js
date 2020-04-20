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


var SIZE_X = 13;
var SIZE_Y = 13;
var scaler = 0.3;

var CANVAS_W = SIZE_X * 2 + 1;
var CANVAS_H = SIZE_Y * 2 + 1;

var buffer_canvas = document.createElement("canvas");
// document.body.appendChild(buffer_canvas);
buffer_canvas.width = CANVAS_W;
buffer_canvas.height = CANVAS_H;
var buffer_ctx2d = buffer_canvas.getContext('2d');

var dirlight = new three.DirectionalLight(0xffffff, 0.5);
dirlight.position.set(5, 5, 5);
group.add(dirlight);

var ambient = new three.AmbientLight(0xffffff, 1);
group.add(ambient);

var triggered_color_map = [new three.Color(0x2299ff), new three.Color(0xee33aa)];
var mat = new three.MeshPhongMaterial({
    color: 0x2299ff,
    flatShading: true,
    shading: three.FlatShading
});

function lerp_color(co, col1, col2) {
    var r = (col1 >> 16) & 0xff;
    var g = (col1 >> 8) & 0xff;
    var b = (col1 & 0xff);
    var nr = (col2 >> 16) & 0xff;
    var ng = (col2 >> 8) & 0xff;
    var nb = (col2 & 0xff);

    return lerp(co, r, nr) << 16 +
        lerp(co, g, ng) << 8 +
        lerp(co, b, nb)
}

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


var scale_oeff = eased(2, 2, 0.1, 0.0001);
var wanders = [];
for (var i = 0; i < 30; i++) {
    wanders.push({
        x: Math.random() * CANVAS_W,
        y: Math.random() * CANVAS_H,
        vec: Math.random() * 1 + 0.1,
        size: Math.random() * 2 + 1,
        rot: Math.random(),
        alpha: Math.random() * 0.05 + 0.01
    });
}

console.log(triggered_color_map);
var pumped_color = eased(0, 0, 0.05, 0.001);
loop(() => {


    scale_oeff.to = vueData.threeBg.bgScaleCoeff;
    if (vueData.threeBg.trigger) {
        vueData.threeBg.trigger = 0;
        vueData.threeBg.visibility.value = 0;
        vueData.threeBg.visibility.to = 1;
        pumped_color.value = 1;
        pumped_color.to = 0;
    }
    mat.color.setRGB(
        ease(mat.color.r, map(pumped_color, 0, 1, triggered_color_map[0].r, triggered_color_map[1].r), 0.4, 0.0001),
        ease(mat.color.g, map(pumped_color, 0, 1, triggered_color_map[0].g, triggered_color_map[1].g), 0.4, 0.0001),
        ease(mat.color.b, map(pumped_color, 0, 1, triggered_color_map[0].b, triggered_color_map[1].b), 0.4, 0.0001)
    );
    mat.needsUpdate = true;


    buffer_ctx2d.fillStyle = "rgba(0, 0, 0, 0.05)"
    buffer_ctx2d.fillRect(0, 0, CANVAS_W, CANVAS_H);

    for (var i = 0; i < wanders.length; i++) {
        wanders[i].x += wanders[i].vec * 0.2;
        wanders[i].x %= CANVAS_W;
        wanders[i].rot += wanders[i].vec * 0.01;
        let sz = wanders[i].size * scale_oeff.to;
        buffer_ctx2d.save();
        buffer_ctx2d.translate(wanders[i].x, wanders[i].y);
        buffer_ctx2d.scale(sz, sz);
        buffer_ctx2d.rotate(wanders[i].rot);
        //draw random stuff
        buffer_ctx2d.fillStyle = "rgba(255,255,255," + wanders[i].alpha + ")"
        buffer_ctx2d.fillRect(-2, -2, 4, 4);
        buffer_ctx2d.restore();
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
    var sampled = buffer_ctx2d.getImageData(0, 0, CANVAS_W, CANVAS_H).data;
    meshes.forEach((v) => {
        // var viz = 
        var X = v.pos[0];
        var Y = v.pos[1];
        var nscaler = sampled[(X + Y * CANVAS_W) * 4] / 255;
        v.scaler = ease(v.scaler, nscaler, 0.1, 0.0001);
        v.scale.set(v.scaler * 1.5, v.scaler * 1.5, v.scaler * 1.5);
        v.position.y = v.position._y + v.scaler * 0.4;
        v.position.z = -20 + 2 * v.scaler;
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