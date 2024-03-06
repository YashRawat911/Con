<template>
  <div class="sidebar">
    <div id="detail" class="actions">
      <img id="detail_img" :src="selectedImageUrl"></img>
    </div>
  </div>
</template>

<script>
export default {
  name: 'detail',
  computed: {
    selectedImageUrl () {
      if (this.$store.state.selected.length === 1) {
        return this.$store.state.selected[0].url
      } else {
        return ''
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
#detail {
  height: 100%;
  padding: 15px;
}

#detail img {
  height: 100%;
}
</style>
