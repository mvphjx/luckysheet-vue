<template>
  <div id="app">
    <SearchInList tableName="TP_CARD_VIEW" ref="searchInList"></SearchInList>
    <input type="button" @click="getWhereParam" value="获取检索条件"></input>
  </div>
</template>

<script>
import SearchInList from './components/searchinlist.vue'
export default {
  name: 'App',
  components: {
    SearchInList
  },
  methods: {
    getWhereParam() {
      const param = this.$refs.searchInList.getWhereParam()
      this.$notify.success({
        title: '获取检索参数',
        message: JSON.stringify(param)
      })
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
