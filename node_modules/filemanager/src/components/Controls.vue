<template>
  <div class="controls">
    <div v-if="orderChanged" id="orderChangedIcon" class="alert alert-info" role="alert">
      <i class="fa fa-exchange"></i> Page order has changed.
    </div>
    <button @click="save" id="save_btn" type="button" class="btn btn-lg btn-primary" :disabled="isDisabled">
      Save
    </button>
  </div>
</template>

<script>
export default {
  name: 'controls',
  data: function () {
    return {
      hidden: this.orderChanged
    }
  },
  computed: {
    orderChanged: function () {
      var ogOrder = JSON.stringify(this.$store.state.ogImages.map(img => img.id))
      var imgOrder = JSON.stringify(this.$store.state.images.map(img => img.id))
      return ogOrder !== imgOrder
    },
    isDisabled: function () {
      if (this.orderChanged || this.$store.state.changeList.length > 0) {
        return false
      } else {
        return true
      }
    }
  },
  methods: {
    save: function () {
      let body = {
        startpage: this.$store.state.startPage,
        thumbnail: this.$store.state.thumbnail,
        images: this.$store.state.images
      }
      this.$store.dispatch('saveState', body)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>

</style>
