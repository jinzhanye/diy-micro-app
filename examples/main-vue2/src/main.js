import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'
import DiyMicroApp from 'diy-micro-app'
import router from './router'

Vue.config.productionTip = false

DiyMicroApp.start()

Vue.use(VueRouter)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
