<template>
	<div class="name" :style="{ background: props.data.colorPair.light }">
	  <div class="colorBar" :style="{ background: props.data.colorPair.dark }" />
	  <div class="type">{{ props.data.type }}</div>
	  <div class="carId">{{ props.data.name }}{{ props.data.id }}</div>
	  <div class="speed">{{ props.data.speed }}km/s</div>
	</div>
  </template>
  
  <script setup lang="ts">
  const props = defineProps({
	data: {
		type: Object,
		required: true
	},
 
  });
  </script>
  
  <style scoped lang="scss">
  .name {
	display: flex;
	box-sizing: border-box;
	overflow: hidden;
	height: 100%;
	width: 100%;
	padding: 0 5px 0 0;
	border-radius: 8px 0 0 8px;
	align-items: center;
  }
  .colorBar {
	width: 10px;
	height: 100%;
  }
  
  .carId {
	flex: 1;
  }
  
  .type {
	padding: 0 5px 0 0;
	font-size: 1.2rem;
  }
  </style>
  