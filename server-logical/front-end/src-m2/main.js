import "./fonts/openmoji.css";
import * as scenes from "./scenes";
import * as shared from "./shared";

shared.load(()=>{
    scenes.fully_loaded();
});
