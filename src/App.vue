<!-- 
 * This file is default entry point for the Vue.js application component file.
 * It imports the main dashboard component and renders it.
 * The dashboard is responsible for managing comple project functionalities.
 *
 * @author Yogeesh Narasegowda
 * @version 1.0
-->
<template>
  <WorkCaseDashboard/>
</template>

<script>
import WorkCaseDashboard from './components/WorkCaseDashboard.vue';

export default {
  name: 'App',
  components: {
    WorkCaseDashboard
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
