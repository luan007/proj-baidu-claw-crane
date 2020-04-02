import Vue from "vue/dist/vue.esm.browser";
import * as shared from "./shared_actions";
import * as comps from "./*.vue"

for (var i in comps) {
    if (i == 'default') continue;
    console.log(i);
    Vue.component(i, comps[i].default)
}

var app = new Vue({
    el: '#app',
    data: shared.local_state,
    computed: {
        not_logged_in: () => {
            return local_state.login.login <= 0;
        },
        location: () => {
            //check fuckin room
            if(synced.state.room_id) {
                return "room";
            }
            else {
                return "";
            }
        }
    },
    watch: {
        "login.login": function (val) {
            console.log("login state changed")
            shared.change_login_state();
        }
    }
})