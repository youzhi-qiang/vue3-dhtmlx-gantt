<template>
	<section class="my-gantt">
		<div class="header-box-plus">
			<div class="time-box">
				<el-radio-group v-model="timeState" @change="changeTime">
					<el-radio-button label="day">日</el-radio-button>
					<el-radio-button label="week">周</el-radio-button>
					<el-radio-button label="month">月</el-radio-button>
					<el-radio-button label="year">年</el-radio-button>
				</el-radio-group>
			</div>
			<div class="tip-box">
				<div class="tip-item today">
					<div class="tip-item-title">今日时间</div>
				</div>
				<div class="tip-item completed">
					<div class="tip-item-title">已完成</div>
				</div>
				<div class="tip-item uncompleted">
					<div class="tip-item-title">未完成</div>
				</div>
				<div class="tip-item completion-time">
					<div class="tip-item-title">完成时间</div>
				</div>
			</div>
		</div>
		<div id="gantt_here" ref="ganttRef"></div>
	</section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { gantt } from 'dhtmlx-gantt'
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css'
import dayjs from 'dayjs'

const ganttRef = ref()
const timeState = ref('day')

const props = defineProps({
	realData: {
		type: Object,
		required: true
	}
})

// 定义时间刻度配置
const zoomConfig = {
	levels: [
		{
			name: 'day',
			scales: [
				{ unit: 'month', step: 1, format: '%Y年%M' },
				{ unit: 'day', step: 2, format: '%j日' }
			]
		},
		{
			name: 'week',
			scales: [
				{ unit: 'month', step: 1, format: '%Y年%M' },
				{ unit: 'week', step: 2, format: '第%W周' }
			]
		},
		{
			name: 'month',
			scales: [
				{ unit: 'year', step: 1, format: '%Y年' },
				{ unit: 'month', step: 1, format: '%M月' }
			]
		},
		{
			name: 'year',
			scales: [
				{ unit: 'year', step: 1, format: '%Y年' },
			]
		}
	]
}

const changeTime = (value: string) => {
	switch (value) {
		case 'day':
			gantt.config.scales = [
				{ unit: 'day', step: 1, format: '%d日' },  // Primary scale: day
				{ unit: 'month', step: 1, format: '%Y年%M' }  // Subscale: month
			];
			break;
		case 'week':
			gantt.config.scales = [
				{ unit: 'week', step: 1, format: '第%W周' },  // Primary scale: week
				{ unit: 'month', step: 1, format: '%Y年%M' }  // Subscale: month
			];
			break;
		case 'month':
			gantt.config.scales = [
				{ unit: 'month', step: 1, format: '%M' },  // Primary scale: month
				{ unit: 'year', step: 1, format: '%Y年' }  // Subscale: year
			];
			break;
		case 'year':
			gantt.config.scales = [
				{ unit: 'year', step: 1, format: '%Y年' }  // Primary scale: year
			];
			break;
	}
	gantt.render();
}

// 初始化甘特图配置
const initGanttConfig = () => {
	// 基本配置
	gantt.config.readonly = true
	gantt.config.show_progress = false
	gantt.config.mark_today = true
	gantt.config.scale_height = 50
	gantt.config.min_column_width = 50
	gantt.config.fit_tasks = true
	gantt.config.show_grid = true

	// 配置中文
	gantt.i18n.setLocale({
		date: {
			month_full: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
			month_short: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"]
		}
	})

	// 配置列
	gantt.config.columns = [
		{
			name: "projectName",
			label: "项目名称",
			tree: true,
			width: 120,
		},
		{
			name: "startTime",
			label: "预计开始",
			width: 100,
			align: "center",
			template: (task) => dayjs(task.startTime).format('YYYY-MM-DD')
		},
		{
			name: "endTime",
			label: "预计结束",
			width: 100,
			align: "center",
			template: (task) => dayjs(task.endTime).format('YYYY-MM-DD')
		},
		{
			name: "projectTotalTime",
			label: "工期",
			width: 50,
			align: "center",

		},
		{
			name: "projectStatus",
			label: "状态",
			width: 80,
			align: "center",
		},
	]

	// 配置任务条样式和动画
	gantt.config.bar_height = 20
	gantt.config.row_height = 40
	gantt.config.task_scroll_offset = 100
	gantt.config.scroll_smooth = true
	gantt.config.scroll_smooth_interval = 10

	// 配置任务条样式
	gantt.templates.task_class = (start, end, task) => {
		const classes = [task.showEndTime ? 'completed-task' : 'planned-task']
		classes.push('extended-task')  // 添加新的类名
		return classes.join(' ')
	}

	// 配置单元格样式
	gantt.templates.timeline_cell_class = (item: { showEndTime: string | number | Date | dayjs.Dayjs | null | undefined; }, date: string | number | Date | dayjs.Dayjs | null | undefined) => {
		const today = dayjs()
		const cellDate = dayjs(date)
		const classes = []

		if (cellDate.isSame(today, 'day')) {
			classes.push('today-line')
		}

		if (item.showEndTime && cellDate.isSame(dayjs(item.showEndTime), 'day')) {
			classes.push('completed-line')
		}

		return classes.join(' ')
	}

	// 添加单元格的title属性
	gantt.templates.task_cell_title = (item: { showEndTime: string | number | Date | dayjs.Dayjs | null | undefined; }, date: string | number | Date | dayjs.Dayjs | null | undefined) => {
		const today = dayjs()
		const cellDate = dayjs(date)

		if (cellDate.isSame(today, 'day')) {
			return `今日时间：${today.format('YYYY-MM-DD')}`
		}

		if (item.showEndTime && cellDate.isSame(dayjs(item.showEndTime), 'day')) {
			return `完成时间：${dayjs(item.showEndTime).format('YYYY-MM-DD')}`
		}

		return ''
	}

	// 配置任务区间显示
	gantt.config.show_task_cells = true
	gantt.config.smart_rendering = true
	gantt.config.smart_scales = true



	// 设置任务条的高度和位置
	gantt.config.bar_height = 20
	gantt.config.row_height = 40

	// 确保任务条显示
	gantt.config.show_tasks = true
	gantt.config.show_progress = false
	gantt.config.fit_tasks = true

	// 配置时间刻度
	gantt.config.scales = [
		{ unit: 'day', step: 1, format: '%d日' },  // Primary scale: day
		{ unit: 'month', step: 1, format: '%Y年%M' }  // Subscale: month
	];



	// 配置任务条文字显示
	gantt.templates.task_text = (start, end, task) => {
		return `<span class="task-text">${task.projectName}</span>`
	}

	// 启用工具提示
	gantt.config.show_quick_info = false  // 禁用默认的快速信息
	gantt.config.tooltip_timeout = 0      // 设置显示延迟为0
	gantt.config.tooltip_offset_x = 10    // 设置水平偏移
	gantt.config.tooltip_offset_y = 20    // 设置垂直偏移
	gantt.config.tooltip_hide_timeout = 50 // 设置隐藏延迟

	// 配置工具提示内容
	gantt.templates.tooltip_text = (start, end, task) => {
		const cellDate = dayjs(start)
		const today = dayjs()

		if (cellDate.isSame(today, 'day')) {
			return `<div class="gantt-tooltip">今日时间：${today.format('YYYY-MM-DD')}</div>`
		}

		if (task.showEndTime && cellDate.isSame(dayjs(task.showEndTime), 'day')) {
			return `<div class="gantt-tooltip">完成时间：${dayjs(task.showEndTime).format('YYYY-MM-DD')}</div>`
		}

		return ''
	}

	// 配置工具提示的显示位置
	gantt.templates.tooltip_date_format = (date) => {
		return dayjs(date).format('YYYY-MM-DD')
	}

	// 配置布局
	gantt.config.layout = {
		css: "gantt_container",
		rows: [
			{
				cols: [
					{
						width: 450,
						min_width: 300,
						rows: [
							{ view: "grid", scrollX: "gridScroll", scrollable: true, scrollY: "scrollVer" }
						]
					},
					{ resizer: true, width: 1 },
					{
						rows: [
							{ view: "timeline", scrollX: "scrollHor", scrollY: "scrollVer" },
							{ view: "scrollbar", id: "scrollHor", height: 20 }
						]
					},
					{ view: "scrollbar", id: "scrollVer" }
				]
			}
		]
	}

	// 隐藏横向网格线
	gantt.templates.grid_row_class = () => 'no-horizontal-line'
	gantt.config.show_task_cells = false

	// 配置竖向网格线
	gantt.config.show_grid = true
	gantt.config.show_task_cells = true
	gantt.config.scale_cell_class = 'grid-cell'

	// 启用拖动滚动
	// gantt.config.drag_timeline = { ignore: true }  // 启用时间轴拖动
	// gantt.config.drag_multiple = true  // 允许多方向拖动
	gantt.config.drag_timeline_ignore = false // 忽略拖动事件
	gantt.config.drag_move = true  // 禁用任务拖动
	gantt.config.drag_progress = false  // 禁用进度条拖动
	gantt.config.drag_resize = false  // 禁用任务调整大小
	gantt.config.drag_links = false  // 禁用链接拖动

	// 配置滚动行为
	gantt.config.scroll_on = true
	gantt.config.scroll_size = 50
	gantt.config.autoscroll = true
	gantt.config.autoscroll_speed = 30


	// 配置拖动滚动
	gantt.config.drag_move = false  // 禁用任务拖动
	gantt.config.drag_progress = false  // 禁用进度条拖动
	gantt.config.drag_resize = false  // 禁用任务调整大小
	gantt.config.drag_links = false  // 禁用链接拖动

	// 启用平滑滚动
	gantt.config.scroll_smooth = true
	gantt.config.scroll_size = 50
	gantt.config.autoscroll = true


}

// 初始化甘特图
const initGantt = () => {
	if (!props.realData?.data?.length) return

	// 先清除现有数据和实例
	if (gantt.clearAll) {
		gantt.clearAll()
	}

	// 处理数据
	const tasks = props.realData.data.map((item: { id: any; projectName: any; startTime: string | number | Date; endTime: string | number | Date; showEndTime: any; projectTotalTime: any; projectStatus: any; }) => ({
		id: item.id,
		text: item.projectName,
		projectName: item.projectName,
		startTime: item.startTime,
		endTime: item.endTime,
		showEndTime: item.showEndTime,
		start_date: new Date(item.startTime),
		end_date: new Date(item.endTime),
		progress: 0,
		projectTotalTime: item.projectTotalTime,
		projectStatus: item.projectStatus,
		duration: 1
	}))

	console.log('Processed tasks:', tasks)

	// 初始化配置
	initGanttConfig()

	// 初始化甘特图
	gantt.init('gantt_here')

	// 设置时间范围
	const dates = tasks
		.map((task: { startTime: string | number | Date | null; endTime: string | number | Date | null; showEndTime: string | number | Date | null; }) => {
			// 过滤掉空的时间
			if (task.startTime && task.endTime) {
				return [
					new Date(task.startTime),
					new Date(task.endTime),
					task.showEndTime ? new Date(task.showEndTime) : null,
					new Date()
				];
			}
			return [];  // 返回空数组，如果 startTime 或 endTime 为 null 或 undefined
		})
		.filter((datePair: any[]) => datePair.length > 0 && datePair.every(date => date !== null && date !== undefined))  // 过滤掉空数组

	// 计算最小和最大时间 开始时间 结束时间 完成时间 当前时间  取中间的最小值最大值当甘特图的起止时间
	const date1 = new Date(Math.min(...dates.map((d: Date) => d[0].getTime())))
	const date2 = new Date(Math.max(...dates.map((d: Date) => d[1].getTime())))
	const date3 = new Date(Math.max(...dates.map((d: Date) => d[2].getTime())))
	const date4 = new Date(Math.max(...dates.map((d: Date) => d[3].getTime())))
	const _dates = [date1, date2, date3, date4]

	const minDate = new Date(Math.min(..._dates.map((d: Date) => d.getTime())))
	const maxDate = new Date(Math.max(..._dates.map((d: Date) => d.getTime())))
	// 扩展时间范围
	minDate.setDate(minDate.getDate() - 14)
	maxDate.setDate(maxDate.getDate() + 14)
	console.log('minDate最小时间', minDate, 'maxDate最大时间', maxDate)
	gantt.config.start_date = minDate
	gantt.config.end_date = maxDate

	// 加载数据
	try {
		gantt.parse({ data: tasks })
		console.log('Data loaded successfully')
	} catch (error) {
		console.error('Error loading data:', error)
	}

	// 强制重新渲染
	gantt.render()
}

// 添加拖动滚动功能
onMounted(() => {
	try {
		console.log('Mounting component with data:', props.realData)
		initGantt()

		// 添加拖动滚动事件
		let isDragging = false
		let lastClientX = 0
		let lastClientY = 0

		const timeline = gantt.$container.querySelector('.gantt_task_bg')
		if (timeline) {
			timeline.style.cursor = 'grab'

			gantt.event(timeline, 'mousedown', (e: MouseEvent) => {
				if (e.button !== 0) return // 只响应左键
				isDragging = true
				lastClientX = e.clientX
				lastClientY = e.clientY
				timeline.style.cursor = 'grabbing'
			})

			gantt.event(document, 'mousemove', (e: MouseEvent) => {
				if (!isDragging) return

				const dx = lastClientX - e.clientX
				const dy = lastClientY - e.clientY

				const scrollContainer = gantt.$task.querySelector('.gantt_task')
				if (scrollContainer) {
					scrollContainer.scrollLeft += dx
					scrollContainer.scrollTop += dy
				}

				lastClientX = e.clientX
				lastClientY = e.clientY
			})

			gantt.event(document, 'mouseup', () => {
				isDragging = false
				timeline.style.cursor = 'grab'
			})

			// 防止拖动时选中文本
			gantt.event(timeline, 'selectstart', (e: Event) => {
				if (isDragging) {
					e.preventDefault()
				}
			})
		}
	} catch (error) {
		console.error('Error initializing gantt:', error)
	}
})

// 清理事件监听
onUnmounted(() => {
	const timeline = gantt.$container?.querySelector('.gantt_task_bg')
	if (timeline) {
		gantt.eventRemove(timeline, 'mousedown')
		gantt.eventRemove(document, 'mousemove')
		gantt.eventRemove(document, 'mouseup')
		gantt.eventRemove(timeline, 'selectstart')
	}
})

// 添加数据变化监听
watch(() => props.realData, (newVal) => {
	console.log('Data changed:', newVal)
	if (newVal?.data?.length) {
		try {
			initGantt()
		} catch (error) {
			console.error('Error reinitializing gantt:', error)
		}
	}
}, { deep: true })

onUnmounted(() => {
	gantt.clearAll()
})
</script>

<style lang="scss" scoped>
.my-gantt {
	width: 100%;
	height: 100%;
	background: #fff;

	.header-box-plus {
		display: flex;

		padding: 10px;
		border-bottom: 1px solid #f0f0f0;

		border-bottom: 1px solid #f0f0f0;
		justify-content: space-between;
		align-items: center;

		.time-box {
			// 时间选择框样��
		}

		.tip-box {
			display: flex;
			flex-direction: row;
			align-items: center;
			gap: 20px;
			padding: 10px;

			.tip-item {
				display: flex;
				align-items: center;
				gap: 10px;

				.tip-item-title {
					position: relative;
					padding-left: 20px;
					font-size: 14px;
					white-space: nowrap;

					&::before {
						content: '';
						position: absolute;
						top: 50%;
						left: 0;
						transform: translateY(-50%);
						width: 12px;
						height: 12px;
						border-radius: 2px;
					}
				}

				// 各个标记的颜色保持不变
				&.today .tip-item-title::before {
					background-color: #ff4d4f;
				}

				&.completed .tip-item-title::before {
					background-color: #a855f7;
				}

				&.uncompleted .tip-item-title::before {
					background-color: #55b6f7;
				}

				&.completion-time .tip-item-title::before {
					background: #52c41a;
				}
			}
		}
	}



	#gantt_here {
		height: 500px;
	}

	// 添加拖动相关样式
	:deep(.gantt_task_bg) {
		cursor: grab;
		user-select: none;
		touch-action: none; // 禁用触摸操作的默认行为

		&:active {
			cursor: grabbing;
		}
	}

	// 防止拖动时出现选中效果
	:deep(.gantt_task_line),
	:deep(.gantt_task_content),
	:deep(.gantt_grid_data),
	:deep(.gantt_task_cell) {
		user-select: none;
		-webkit-user-drag: none;
	}

	// 优化滚动条显示
	:deep(.gantt_hor_scroll),
	:deep(.gantt_ver_scroll) {
		opacity: 0;
		transition: opacity 0.3s;
	}

	&:hover {

		:deep(.gantt_hor_scroll),
		:deep(.gantt_ver_scroll) {
			opacity: 1;
		}
	}

	// 优化滚动条样式
	:deep(.gantt_hor_scroll) {
		&::-webkit-scrollbar {
			height: 8px;
		}

		&::-webkit-scrollbar-track {
			background: #f5f5f5;
			border-radius: 4px;
		}

		&::-webkit-scrollbar-thumb {
			background: #ddd;
			border-radius: 4px;
			cursor: pointer;

			&:hover {
				background: #ccc;
			}

			&:active {
				background: #bbb;
			}
		}
	}

	// 防止文本被选中
	:deep(.gantt_task_content),
	:deep(.gantt_grid_data),
	:deep(.gantt_task_bg) {
		user-select: none;
	}
}

:deep(.gantt_task_line) {
	border-radius: 2px;
	height: 20px !important;
	line-height: 20px;
	margin-top: 10px;
	transition: all 0.3s ease;
	color: #fff;
	// &.planned-task {
	// 	background-color: #55b6f7;
	// 	border-color: #55b6f7;
	// 	background-color: transparent;
	// 	border: none;


	// 	&::after{
	// 	content: '';
	// 	position: absolute;
	// 	top: 0;
	// 	bottom: 0;
	// 	right: 0;
	// 	width:60px;
	// 	background-color: #55b6f7;
	// }
	// }
	&.planned-task {
		background-color: transparent;
		border: none;
		background-color: #55b6f7;
		border-color: #55b6f7;

		&::after {
			content: '';
			position: absolute;
			top: -10px;

			right: -50px;
			// width:60px;
			height: 20px;
			line-height: 20px;
			margin-top: 10px;
			background-color: #55b6f7;
			border-left: 26px solid #55b6f7;
			border-right: 27px solid #55b6f7;
			border-top-right-radius: 2px;
			border-bottom-right-radius: 2px;
		}
	}

	&.completed-task {
		background-color: transparent;
		border: none;
		background-color: #a855f7;
		border-color: #9333ea;

		&::after {
			content: '';
			position: absolute;
			top: -10px;

			right: -50px;
			// width:60px;
			height: 20px;
			line-height: 20px;
			margin-top: 10px;
			background-color: #a855f7;
			border-left: 26px solid #a855f7;
			border-right: 27px solid #a855f7;
			border-top-right-radius: 2px;
			border-bottom-right-radius: 2px;
		}
	}
}

:deep(.gantt_task_row) {
	border-bottom: none;
	height: 40px !important;
	line-height: 40px;
	transition: background-color 0.2s ease;

	&:hover {
		background-color: rgba(0, 0, 0, 0.02);
	}

	&.gantt_selected {
		background-color: rgba(0, 0, 0, 0.05);
	}
}

:deep(.gantt_grid_scale),
:deep(.gantt_task_scale) {
	background-color: #fafafa;
	color: #090909;
	font-size: 12px;
	border-bottom: 1px solid #e0e0e0;
	transition: all 0.3s ease;

	&:hover {
		background-color: #f5f5f5;
	}
}

:deep(.gantt_grid) {
	border-right: 1px solid #e0e0e0;
}

:deep(.gantt_grid_data) {
	.gantt_cell {
		border-right: 1px solid #e0e0e0;
		color: #080808;
		font-size: 12px;
	}
}

:deep(.gantt_task_cell) {
	border-right: 1px solid rgba(0, 0, 0, 0.05) !important;
	transition: background-color 0.2s ease;
	position: relative;

	&::before {
		content: '';
		position: absolute;
		top: 0;
		bottom: 0;
		right: 0;
		width: 1px;
		// background-color: rgba(0, 0, 0, 0.1);
		opacity: 0;
		transition: opacity 0.2s ease;
	}

	&:hover::before {
		opacity: 1;
	}
}

:deep(.grid-cell) {
	position: relative;

	&::after {
		content: '';
		position: absolute;
		top: 0;
		bottom: 0;
		right: 0;
		width: 1px;
		background-color: rgba(0, 0, 0, 0.1);
	}
}

:deep(.gantt_task_bg) {
	background-image: linear-gradient(90deg,
			rgba(0, 0, 0, 0.05) 1px,
			transparent 1px);
	background-size: 50px 100%;
	background-position: -1px 0;
}

:deep(.today-line) {
	position: relative;
	cursor: pointer;

	&::after {
		content: '';
		position: absolute;
		top: 0;
		bottom: 0;
		left: 10%;
		height: 100%;
		width: 4px;
		background-color: #ff4d4f;
		z-index: 99;
	}


}

:deep(.gantt_today) {
	background-color: #fff1f0;
	transition: background-color 0.3s ease;
}

// 确保任务条容器可见
:deep(.gantt_task_line_wrapper) {
	display: block !important;
	opacity: 1 !important;
	transition: transform 0.3s ease;
}

// 优化滚动条样式
:deep(.gantt_hor_scroll),
:deep(.gantt_ver_scroll) {
	&::-webkit-scrollbar {
		width: 8px;
		height: 8px;
	}

	&::-webkit-scrollbar-track {
		background: #f5f5f5;
		border-radius: 4px;
	}

	&::-webkit-scrollbar-thumb {
		background: #ddd;
		border-radius: 4px;

		&:hover {
			background: #ccc;
		}

		&:active {
			background: #bbb;
		}
	}
}

// 优化时轴样式
:deep(.gantt_scale_cell) {
	transition: background-color 0.2s ease;

	&:hover {
		background-color: rgba(0, 0, 0, 0.02);
	}
}

// 添加动画
@keyframes fadeIn {
	from {
		opacity: 0;
		transform: scaleX(0);
	}

	to {
		opacity: 1;
		transform: scaleX(1);
	}
}

// 今日列样式
:deep(.today-cell) {
	background-color: transparent !important;
	position: relative;

	// 左侧虚线
	&::before {
		content: '';
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		width: 1px;
		border-left: 1px dashed #ff4d4f;
		z-index: 98;
		opacity: 0.6;
	}

	// 右侧虚线
	&::after {
		content: '';
		position: absolute;
		top: 0;
		bottom: 0;
		right: 0;
		width: 1px;
		border-right: 1px dashed #ff4d4f;
		z-index: 98;
		opacity: 0.6;
	}

	// 背景高亮
	&::before {
		content: '';
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		background-color: rgba(255, 77, 79, 0.05);
		z-index: 1;
	}
}

// 优化表头中的今日标记
:deep(.gantt_scale_cell) {
	&.today-cell {
		font-weight: bold;
		color: #ff4d4f;
		background-color: rgba(255, 77, 79, 0.05);

		// 左侧虚线
		&::before {
			content: '';
			position: absolute;
			top: 0;
			bottom: 0;
			left: 0;
			width: 1px;
			border-left: 1px dashed #ff4d4f;
			z-index: 98;
			opacity: 0.6;
		}

		// 右侧虚线
		&::after {
			content: '';
			position: absolute;
			top: 0;
			bottom: 0;
			right: 0;
			width: 1px;
			border-right: 1px dashed #ff4d4f;
			z-index: 98;
			opacity: 0.6;
		}
	}
}

// 任务区域中的今日列
:deep(.gantt_task_cell) {
	&.today-cell {
		// background-color: rgba(255, 77, 79, 0.05) !important;

		// 左侧虚线
		&::before {
			content: '';
			position: absolute;
			top: 0;
			bottom: 0;
			left: 0;
			width: 1px;
			border-left: 1px dashed #ff4d4f;
			z-index: 98;
			opacity: 0.6;
		}

		// 右侧虚线
		&::after {
			content: '';
			position: absolute;
			top: 0;
			bottom: 0;
			right: 0;
			width: 1px;
			border-right: 1px dashed #ff4d4f;
			z-index: 98;
			opacity: 0.6;
		}

		// 悬浮效果
		&:hover {
			background-color: rgba(255, 77, 79, 0.08) !important;
		}
	}
}

// 任务��样式
:deep(.gantt_task_line) {
	transform: translateX(-18px);

	&.planned-task {
		background-color: #55b6f7;
		border-color: #55b6f7;

	}

	&.completed-task {
		background-color: #a855f7;
		border-color: #9333ea;
	}

	.task-text {
		position: absolute;
		left: 8px;
		top: 50%;
		transform: translateY(-50%);
		color: #fdfbfb;
		font-size: 12px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: calc(100% - 16px);
		z-index: 9999;
		pointer-events: none;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
	}

	&.planned-task,
	&.completed-task {
		.task-text {
			color: #f8f4f4;
		}
	}

	&:hover {
		z-index: 10;
	}
}

// 工具提示样式
:deep(.gantt-tooltip) {
	background-color: rgba(0, 0, 0, 0.85);
	color: #ffffff;
	padding: 6px 12px;
	border-radius: 4px;
	font-size: 12px;
	font-weight: 500;
	white-space: nowrap;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

// 确保工具提示显示在最上层
:deep(.gantt_tooltip) {
	z-index: 9999 !important;
	position: absolute;
	pointer-events: none;
}

// 完成时间线样式
:deep(.completed-line) {
	position: relative;
	cursor: pointer;

	&::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 50%;
		width: 100%;
		height: 50%;
		background-color: #52c41a;
		z-index: 98;
		transform: translateX(-50%);
	}


}

// 当同时存在今日线和完成时间线时的样式
:deep(.today-line.completed-line) {
	&::after {
		background: linear-gradient(to bottom, #ff4d4f 50%, #52c41a 50%);
		width: 50px;
	}

	// 调整双重提示的位置
	&:hover::before {
		top: -50px; // 避免提示重叠
	}
}
</style>