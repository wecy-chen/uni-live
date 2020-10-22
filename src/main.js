import Vue from 'vue'
import App from './App'
// #ifdef H5
import VConsole from 'vconsole'
// #endif

Vue.config.productionTip = false

// #ifdef H5
// eslint-disable-next-line no-new
new VConsole()
// #endif

App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
