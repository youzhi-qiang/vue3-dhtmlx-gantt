<template>
	<div class="box">
		<Gantt :realData="ganttData" />
	</div>
</template>

<script setup lang="ts">
import Gantt from './ganttChart/index.vue'
import { ref } from 'vue'
const ganttData = ref({
	data: [{
		id: 2,
		projectName: '测试项目',
		startTime: '2023-10-01',
		endTime: '2023-10-25',
		showEndTime: '2023-10-22',
		projectStatus: '滞后',
		projectProgress: 0.27,
		projectRatio: 0.15,
		projectTotalTime: 25,
		projectUsedTime: 22,
		functionName: '测量工具',
		xmdj: '1',
		cityName: '佛山',
		name: '7',
		projectMap: {},
		parent: 0,
		start_date: '2023-06-27 16:00:00.000',
		end_date: '2023-10-25 16:00:00.000',
		progress: 0.67
	},
	{
		id: 3,
		projectName: '测试项目2',
		startTime: "2025-01-14",
		endTime: "2025-01-23",
		showEndTime:null,
		projectStatus: '进行中',
		projectProgress: 0.27,
		projectRatio: 0.15,
		projectTotalTime: 25,
		projectUsedTime: 22,
		functionName: '测量工具',
		xmdj: '1',
		cityName: '佛山',
		name: '7',
		projectMap: {},
		parent: 0,
		start_date: '2023-06-27 16:00:00.000',
		end_date: '2023-10-25 16:00:00.000',
		progress: 0.67
	},


	]
})
 
</script>

<style scoped>

.box{
	width: 91vw;
    height: 87vh;
	overflow:hidden;
	margin: 0 auto;
}
</style>