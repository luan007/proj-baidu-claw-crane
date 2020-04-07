<template>
  <div style="position: absolute; z-index: 9999;bottom: 50%;left: 50%;height: 0;width: 0;">
    <div class="panel">
      <div class="core">
        <div class="rel">
          <div class="operator">
            <div class="b u">
              <i class="fas fa-smile"></i>
            </div>
            <div class="b d">
              <i class="fad fa-surprise"></i>
            </div>
            <div class="b l">
              <i class="fas fa-smile"></i>
            </div>
            <div class="b r">
              <i class="fas fa-smile"></i>
            </div>
          </div>
          <div class="aux">
            <i class="fas fa-crosshairs"></i>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {};
</script>

<style lang="less" scoped>
.operator {
  position: absolute;
  height: 100%;
  width: 100%;
  border: 5px solid #ccc;
  box-sizing: border-box;
  border-radius: 99999rem;
}

.b {
  color: white;
  position: absolute;
  height: 50px;
  width: 50px;
  transform: translate(-50%, -50%);
  background: black;
  border-radius: 50px;
}

.b > * {
  color: #ea40f7;
  /* line-height: 100%; */
  /* vertical-align: middle; */
  top: 50%;
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2rem;
}

.b.u {
  top: 0;
  left: 50%;
}

.b.l {
  top: 50%;
  left: 0%;
}

.b.r {
  top: 50%;
  left: 100%;
}

.b.d {
  top: 100%;
  left: 50%;
}

.panel {
  position: absolute;
}
.core {
  position: absolute;
  top: 0%;
  left: 0%;
  transform: translate(-50%, -50%);
  width: 180px;
  height: 180px;
  border-radius: 999999px;
  border: 35px solid #5ccffa;
  background: white;
}
.rel {
  position: relative;
  height: 100%;
  width: 100%;
}
.aux:before {
  content: " ";
  display: block;
  position: absolute;
  box-sizing: border-box;
  height: 100%;
  width: 100%;
  border-radius: 100000px;
  border: 6px solid white;
}
.aux {
  position: absolute;
  top: 0%;
  right: 0%;
  width: 70px;
  height: 70px;
  background: black;
  transform: translate(66%, -66%);
  border-radius: 999999px;
  border: 20px solid #5ccffa;
}

.aux > * {
  color: #6dedb6;
  /* line-height: 100%; */
  /* vertical-align: middle; */
  top: 50%;
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2rem;
}
</style>
