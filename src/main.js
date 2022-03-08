import Vue from 'vue'
import App from './App.vue'
import Element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

Vue.use(Element)
Vue.config.productionTip = false
/* eslint-disable */
new Vue({
    render: h => h(App),
}).$mount('#app')
//统一异常处理
Vue.config.errorHandler = function (error, vm) {
    console.warn('VUE 抛出全局异常', error);
    vm.$notify({
        title: '警告',
        message: error,
        type: 'warning'
    });
};
