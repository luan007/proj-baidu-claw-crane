import "./fonts/fontawesome-pro-5.13.0-web/css/all.css";
import "./fonts/openmoji.css";
import * as scenes from "./scenes";
import * as shared from "./shared";

shared.load(()=>{
    scenes.fully_loaded();
});
