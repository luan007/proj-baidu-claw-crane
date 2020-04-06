<template>
  <div ref="main" class='fullscreen'>

  </div>
</template>

<script>
import * as scenes from "../scenes";
export default {
    mounted: function () {
        this.$refs.main.appendChild(
            scenes.three_renderer.domElement
        );
    }
}
</script>

<style>

</style>