<template>
  <div id="app">
    <SearchInList tableName="TP_CARD_VIEW"></SearchInList>
  </div>
</template>

<script>
// import luckysheet from './components/luckysheet.vue'
import SearchInList from './components/searchinlist.vue'
export default {
  name: 'App',
  components: {
    SearchInList
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
