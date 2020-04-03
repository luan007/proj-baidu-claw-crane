<template>
  <div class='video_holder' ref="canvas_holder"></div>
</template>

<script>
export default {
  props: ["src"],
  created: function() {
    this.vars = { player: null, prev_src: undefined };
  },
  watch: {
      src: function() {
          this.reload();
      }
  },
  methods: {
    reload: function() {
      if (this.vars.prev_src == this.src) {
        return;
      }
      this.destroy();
      if(!this.src) return;
      this.vars.prev_src = this.src;
      this.vars.player = new JSMpeg.Player(this.src, {
        loop: true,
        autoplay: true
      });
      this.$refs.canvas_holder.appendChild(this.vars.player.renderer.canvas);
    },
    destroy: function() {
      if (this.vars.player) {
        this.vars.player.destroy();
        this.vars.player = null;
      }
    }
  },
  mounted: function() {
      this.reload();
  },
  beforeDestroy: function() {
      this.destroy();
  }
};
</script>

<style>
.video_holder {
    position: absolute;
    left: 50%;
    top: 50%;
    transform-origin: 50% 50%;
    transform: rotate(90deg) scale(0.8);
}
.video_holder canvas {
    position: absolute;
    left: 0;
    transform: translate(-50%, -50%);
    top: 0;
}
</style>