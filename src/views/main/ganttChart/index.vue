<template>
	<section class="my-gantt">
		<div class="header-box-plus">
			<div class="time-box">
				<el-radio-group v-model="timeState" @change="changeTime">
					<el-radio-button label="day">日</el-radio-button>
					<!-- <el-radio-button label="week">周</el-radio-button> -->
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
	<div id="gantt_here" ref="ganttRef"  ></div>

	</section>

</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { gantt } from 'dhtmlx-gantt'
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css'
import dayjs from 'dayjs'
import { id } from 'element-plus/es/locale'

const ganttRef = ref()
const timeState = ref('day')
const tasksDatas = ref([])

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
	gantt.config.scale_height = 40
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
			// tree: true,
			align: "center",

			width: 120,
		},
		{
			name: "startTime",
			label: "预计开始",
			width: 85,
			align: "center",
			template: (task) =>{
				if(!task.startTime) return '暂未设置'
				return dayjs(task.startTime).format('YYYY-MM-DD')
			} 
		},
		{
			name: "endTime",
			label: "预计结束",
			width: 85,
			align: "center",
			template: (task) =>{
				console.log('单条任务数据',task)
				if(!task.endTime) return '暂未设置'
				return dayjs(task.endTime).format('YYYY-MM-DD')
			}  
		},
		{
			name: "projectTotalTime",
			label: "工期",
			width: 80,
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
	// gantt.config.show_quick_info = false  // 禁用默认的快速信息
	// gantt.config.tooltip_timeout = 0      // 设置显示延迟为0
	// gantt.config.tooltip_offset_x = 0   // 设置水平偏移
	// gantt.config.tooltip_offset_y = 20    // 设置垂直偏移
	// gantt.config.tooltip_hide_timeout = 50 // 设置隐藏延迟

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
	const secondGridColumns = {

		columns: [
			{
				name: "remainingQuestion", label: "存在问题", width: 60, align: "center",
				template: function (task: any) {
					console.log('单条数据', task)
					return task.remainingQuestion ?? ''
				}
			},
			{
				name: "principalDutyPerson", width: 80, label: "主要负责人", template: function (task: any) {
					return task.principalDutyPerson ?? ''

				}
			},
			{
				name: "principalChargePerson", width: 80, label: "主要责任人", template: function (task: any) {
					return task.principalChargePerson ?? ''

				}
			},
			{
				name: "dutyPerson", width: 80, label: "责任人", template: function (task: any) {
					return task.dutyPerson ?? ''

				}
			}]
	};
	gantt.config.layout = {
    css: "gantt_container",
    rows: [
        {
            cols: [
                // 左侧表格（grid）
                {
                    width: 450,
                    min_width: 300,
                    rows: [
                        { 
                            view: "grid", 
                            scrollX: "gridScroll", 
                            scrollable: true, 
                            scrollY: "scrollVer" // 使用统一的滚动条
                        }
                    ]
                },
                // 中间部分：时间轴（Gantt 图）
                {
                    rows: [
                        { 
                            view: "timeline", 
                            scrollX: "scrollHor", 
                            scrollY: "scrollVer" // 使用统一的滚动条
                        },
                        { view: "scrollbar", id: "scrollHor", height: 5 }
                    ]
                },
                // 右侧表格（grid）
                {   id: "gridRight",
                    view: "grid",  
                    width: 300,
                    bind: "task", // 绑定任务数据
                    scrollY: "scrollVer", // 与左侧表格的纵向滚动条共享滚动
                    config: secondGridColumns // 右侧表格的配置
                },

                { view: "scrollbar", id: "scrollVer" } // 纵向滚动条，确保只使用一个
            ]
        },
        // 外部的横向滚动条
        { view: "scrollbar", id: "scrollHor" }
    ]
};


 

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
	gantt.config.scroll_size = 5
	gantt.config.autoscroll = true
	gantt.config.autoscroll_speed = 30


	// 配置拖动滚动
	gantt.config.drag_move = false  // 禁用任务拖动
	gantt.config.drag_progress = false  // 禁用进度条拖动
	gantt.config.drag_resize = false  // 禁用任务调整大小
	gantt.config.drag_links = false  // 禁用链接拖动

	// 启用平滑滚动
	gantt.config.scroll_smooth = true
	gantt.config.scroll_size = 5
	gantt.config.autoscroll = true
	gantt.config.show_empty_tasks = true;
	gantt.config.auto_scheduling = false;


}

// 初始化甘特图
const initGantt = () => {
	if (!props.realData?.data?.length) return

	// 先清除现有数据和实例
	if (gantt.clearAll) {
		gantt.clearAll()
	}
	console.log('Processed tasks===:', props.realData.data)
	const convertToDateTime = (date: string, type: number, addDay: boolean) => {
		if (date) {
			// 确保输入格式为 YYYY-MM-DD
			const dateParts = date.split('-');
			if (dateParts.length === 3) {
				let [year, month, day] = dateParts;

				// 创建日期对象，默认时间为 00:00:00
				let dateObj = new Date(`${year}-${month}-${day}T${addDay ? '23:59:59' : '00:00:00'}`);

				// 根据 type 返回结果
				if (type === 1) {
					// 返回字符串格式：YYYY-MM-DD HH:mm:ss
					return `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1).toString().padStart(2, '0')}-${dateObj.getDate().toString().padStart(2, '0')} ${addDay ? '23:59:59' : '00:00:00'}`;
				} else if (type === 2) {
					// 返回 Date 对象
					return dateObj;
				}
			} else {
				return undefined;  // 如果日期格式不正确
			}
		}
		return undefined;  // 如果日期为空
	};

	tasksDatas.value = props.realData.data.map((item: any, index: number) => {
		return {
			id: item.id,
			text: item.projectName,
			projectName: item.projectName,
			startTime: convertToDateTime(item.startTime, 1, false),
			endTime: convertToDateTime(item.endTime, 1, true),
			showEndTime: convertToDateTime(item.showEndTime, 1, false),
			start_date: convertToDateTime(item.startTime, 2, false),  // 使用格式化函数
			end_date: convertToDateTime(item.endTime, 2, true),      // 使用格式化函数
			progress: 0,
			projectTotalTime: item.projectTotalTime ?? 0,
			projectStatus: item.projectStatus,
			duration: 1,
			dutyPerson: item.dutyPerson || '',
			principalDutyPerson: item.principalDutyPerson || '',
			principalChargePerson: item.principalChargePerson || '',
			remainingQuestion: item.remainingQuestion || '',
			$index: index  // 显式添加 index
		};
	});


	console.log('Processed tasks:', tasksDatas.value)

	// 初始化配置
	initGanttConfig()

	// 初始化甘特图
	gantt.init('gantt_here')

	// 设置时间范围
	const dates = tasksDatas.value
		.map((task: { startTime: string | number | Date | null; endTime: string | number | Date | null; showEndTime: string | number | Date | null; }) => {
			// 直接在 map 阶段过滤掉 startTime 和 endTime 都为空的任务
			if (!task.startTime || !task.endTime) {
				return null; // 返回 null 以便后续过滤
			}
			return [
				new Date(task.startTime),
				new Date(task.endTime),
				task.showEndTime ? new Date(task.showEndTime) : null,
				new Date()
			];
		})
		.filter((datePair: any): datePair is Date[] => Array.isArray(datePair)); // 过滤掉 null
	// 计算最小和最大时间 开始时间 结束时间 完成时间 当前时间  取中间的最小值最大值当甘特图的起止时间
	const getValidTimestamps = (index: number) =>
		dates
			.map(d => (d[index] instanceof Date ? d[index].getTime() : null))
			.filter((time): time is number => time !== null); // 过滤掉 null 并确保是 number[]

	const safeMin = (index: number) => {
		const validTimes = getValidTimestamps(index);
		return validTimes.length > 0 ? new Date(Math.min(...validTimes)) : new Date(); // 如果没有有效时间，返回当前时间
	};

	const safeMax = (index: number) => {
		const validTimes = getValidTimestamps(index);
		return validTimes.length > 0 ? new Date(Math.max(...validTimes)) : new Date(); // 如果没有有效时间，返回当前时间
	};

	const date1 = safeMin(0);
	const date11 = safeMax(0);
	const date2 = safeMin(1);
	const date22 = safeMax(1);
	const date3 = safeMin(2);
	const date33 = safeMax(2);
	const date4 = safeMin(3);
	const date44 = safeMax(3);
	const _dates1 = [date1, date2, date3, date4]
	const _dates2 = [date11, date22, date33, date44]

	const minDate = new Date(Math.min(..._dates1.map((d: Date) => d.getTime())))
	const maxDate = new Date(Math.max(..._dates2.map((d: Date) => d.getTime())))

	// 扩展时间范围
	minDate.setDate(minDate.getDate() - 14)
	maxDate.setDate(maxDate.getDate() + 14)
	console.log('minDate最小时间', minDate, 'maxDate最大时间', maxDate)
	gantt.config.start_date = minDate
	gantt.config.end_date = maxDate
	// 禁用自动调度，以确保没有时间字段的任务不会被自动过滤掉
	gantt.config.auto_scheduling = false;
	gantt.config.show_empty_tasks = true;  // 显示没有时间的任务

	// // 确保所有没有时间的任务设置默认时间
	// gantt.attachEvent("onBeforeTaskAdd", function (id, task) {
	// 	if (!task.start_date || !task.end_date) {
	// 		let defaultDate = new Date();
	// 		task.start_date = defaultDate;
	// 		task.end_date = defaultDate;
	// 		task.startTime = defaultDate,
	// 			task.endTime = defaultDate
	// 	}
	// 	return true;
	// });

	// // 如果任务创建后没有时间字段，也设置默认时间
	// gantt.attachEvent("onTaskCreated", function (task) {
	// 	if (!task.start_date || !task.end_date) {
	// 		let defaultDate = new Date();
	// 		task.start_date = defaultDate;
	// 		task.end_date = defaultDate;
	// 		task.startTime = defaultDate,
	// 			task.endTime = defaultDate
	// 	}
	// });
	//    tasks[0] = {   ...tasks[2],...tasks[0]  }
	console.log('任务数据', tasksDatas.value[0], tasksDatas.value[2])

	// 加载数据
	try {

		gantt.parse({ data: tasksDatas.value })


	} catch (error) {
		console.error('Error loading data:', error)
	}
	// tasks.forEach((item: any) => {
	// 	console.log('显示任务',item )

	// 		gantt.isTaskVisible(item.id)
	// 	})
	// 强制重新渲染
	gantt.render()
}

// 添加拖动滚动功能
onMounted(() => {
	try {
		console.log('Mounting component with data:', props.realData)
		initGantt()

		 
	} catch (error) {
		console.error('Error initializing gantt:', error)
	}
})

// 清理事件监听
onUnmounted(() => {
	// const timeline = gantt.$container?.querySelector('.gantt_task_bg')
	// if (timeline) {
	// 	gantt.eventRemove(timeline, 'mousedown')
	// 	gantt.eventRemove(document, 'mousemove')
	// 	gantt.eventRemove(document, 'mouseup')
	// 	gantt.eventRemove(timeline, 'selectstart')
	// }
	// 获取类名为 'gantt_task_bg' 的元素

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
    width: 100%;
    // min-height: calc(100vh - 52px); /* 最小高度为100vh - 52px */
    height: 500px; /* 高度自适应内容，当内容不足时，撑满最小高度 */
    // box-sizing: border-box; /* 确保 padding 不影响总高度 */
	border-left: 1px solid #f0f0f0;
	border-right: 1px solid #f0f0f0;
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
			height: 5px;
		}

		&::-webkit-scrollbar-track {
			background: #f5f5f5;
			border-radius: 2.5px;
		}

		&::-webkit-scrollbar-thumb {
			background: #ddd;
			border-radius: 2.5px;
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

		// &::after {
		// 	content: '';
		// 	position: absolute;
		// 	top: -10px;

		// 	right: -50px;
		// 	// width:60px;
		// 	height: 20px;
		// 	line-height: 20px;
		// 	margin-top: 10px;
		// 	background-color: #55b6f7;
		// 	border-left: 26px solid #55b6f7;
		// 	border-right: 27px solid #55b6f7;
		// 	border-top-right-radius: 2px;
		// 	border-bottom-right-radius: 2px;
		// }
	}

	&.completed-task {
		background-color: transparent;
		border: none;
		background-color: #a855f7;
		border-color: #9333ea;

		// &::after {
		// 	content: '';
		// 	position: absolute;
		// 	top: -10px;

		// 	right: -50px;
		// 	// width:60px;
		// 	height: 20px;
		// 	line-height: 20px;
		// 	margin-top: 10px;
		// 	background-color: #a855f7;
		// 	border-left: 26px solid #a855f7;
		// 	border-right: 27px solid #a855f7;
		// 	border-top-right-radius: 2px;
		// 	border-bottom-right-radius: 2px;
		// }
	}
}
:deep(.gantt_task_bg) {
  .gantt_task_row {
    border-bottom: none; /* 默认没有底部边框 */
	// border-left: none;
	// border-right: none;
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

  /* 给最后一个 .gantt_task_row 元素添加底部边框 */
  .gantt_task_row:last-of-type {
	border-bottom: 1px solid #dfe0e1; /* 最后一个元素有底部边框 */

  }
}
 
:deep(.gantt_grid_scale),
:deep(.gantt_task_scale) {
	background-color: #fafafa;
	color: #090909;
	font-size: 12px;
	// border-bottom: 1px solid #e0e0e0;
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

 

:deep(.gantt_data_area) {
	// height: auto !important;
}
:deep(.gridRight_cell ){
    border-right:1px solid #e0e0e0;
	
}
:deep(.gantt_layout_content ) {
	height: auto !important;
}
:deep(.gridRight_cell .gantt_row_task){
	border-left:1px solid #e0e0e0 !important;
 

}
:deep(.today-line) {
	position: relative;
	cursor: pointer;

	&::after {
		content: '';
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
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
// :deep(.gantt_scale_cell) {
// 	&.today-cell {
// 		font-weight: bold;
// 		color: #ff4d4f;
// 		background-color: rgba(255, 77, 79, 0.05);

// 		// 左侧虚线
// 		&::before {
// 			content: '';
// 			position: absolute;
// 			top: 0;
// 			bottom: 0;
// 			left: 0;
// 			width: 1px;
// 			border-left: 1px dashed #ff4d4f;
// 			z-index: 98;
// 			opacity: 0.6;
// 		}

// 		// 右侧虚线
// 		&::after {
// 			content: '';
// 			position: absolute;
// 			top: 0;
// 			bottom: 0;
// 			right: 0;
// 			width: 1px;
// 			border-right: 1px dashed #ff4d4f;
// 			z-index: 98;
// 			opacity: 0.6;
// 		}
// 	}
// }

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
	// transform: translateX(-18px);

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
// :deep(.gantt_tooltip) {
// 	z-index: 9999 !important;
// 	position: absolute;
// 	pointer-events: none;
// }

// 完成时间线样式
:deep(.completed-line) {
	position: relative;
	cursor: pointer;

	&::after {
		content: '';
		position: absolute;
		bottom: 0;
		//  left: 4%;
		width: 50px;
		height: 50%;
		background-color: #52c41a;
		z-index: 98;
		// transform: translateX(-3%);
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
:deep(.gantt_grid){
	border-right: none !important;
	border-left: none !important;

}
:deep(.gantt_container, .gantt_container *  ){
	box-sizing: content-box !important;
}
:deep(.gantt_layout_cell_border_right){
	border-right: none !important;
	border-left: none !important;
 
}
// :deep(.gantt_layout_cell  .scrollHor_cell) {
// 	 height: 12px !important;
//     position: absolute !important;
//     bottom: 0 !important;
// }
</style>