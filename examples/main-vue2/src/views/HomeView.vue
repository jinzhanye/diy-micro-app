<template>
  <div class="home">
    <micro-app
      name='child-react18'
      :data='testData'
      @datachange='handleDataChange'
      url='http://localhost:3000/'/>
  </div>
</template>

<script>
export default {
  name: 'HomeView',
  components: {},
  data() {
    return {
      testData: {
        name: '来自基座应用的数据1'
      }
    }
  },
  mounted () {
    setTimeout(() => {
      this.testData = {
        name: '来自基座应用的数据2'
      }
    }, 2000)
  },
  methods: {
    handleDataChange (e) {
      console.log('接受子应用数据：', e.detail.data)
    }
  }
}
</script>
