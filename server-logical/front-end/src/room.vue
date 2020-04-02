<template>
  <div>
    <div class="fullscreen">
      <div class="center">
        <div>
          <b>{{synced.state.room_id}}</b>
        </div>
        <div>在线用户: {{room_state.users}}</div>
        <div v-if="!game">
          <button v-on:click="join_room('0')">退出房间</button>
          <br />
          <button
            style="margin: 0.5rem; border-radius:9999px"
            v-for="n in ['😊','😱','💪','💣']"
            v-on:click="send_chat({emoji: n})"
          >{{n}}</button>

          <br />
          <button v-if="available" v-on:click="start_game(current_machine)">🎮上机</button>
        </div>
        <div v-if="game">GGGAYYYME</div>
      </div>
    </div>

    <div class="fullscreen" style="pointer-events:none">
      <chat-bubble v-bind:pack="n.pack" v-bind:pos="n.pos" v-for="n in chats"></chat-bubble>
    </div>
  </div>
</template>

<script>
import { main_socket, actions, active_game_in_room } from "./shared_actions";
var temporary = { chats: [] };
main_socket.on("chat", e => {
  temporary.chats.push({
    pack: e,
    pos: { x: 100, y: Math.random() * 100 },
    speed: (Math.random() + 1) * 5
  });
});

window.test_start = actions.start_game;

function update() {
  for (var i = 0; i < temporary.chats.length; i++) {
    temporary.chats[i].pos.x -= temporary.chats[i].speed * 0.1;
    if (temporary.chats[i].pos.x < -100) {
      temporary.chats.splice(i, 1);
      i--;
    }
  }
  requestAnimationFrame(update);
}
update();

window.test_chat = function() {
  main_socket.emit("chat", { dummy: Date.now() });
};

export default {
  props: ["synced"],
  data: function() {
    return {
      chats: temporary.chats
    };
  },
  methods: actions,
  computed: {
    current_machine: function() {
        return this.room.machine;
    },
    available: function() {
      var room_state = this.room_state;
      console.log(room_state);
      return (
        room_state &&
        !room_state.session &&
        room_state.machine_up &&
        !room_state.user_on_request
      );
    },
    game: function() {
      return active_game_in_room() == synced.state.room_id;
    },
    room: function() {
      return this.synced.rooms[this.synced.state.room_id];
    },
    room_state: function() {
      return this.synced.room_states[this.synced.state.room_id];
    }
  },
  mounted: function() {
    while (temporary.chats.length) {
      temporary.chats.pop();
    }
  }
};
</script>

<style>
</style>