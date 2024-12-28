// 获取当前日期
const now = new Date();

// 配置会议信息
const conferenceName = "My Conference"; // 设置你想追踪的会议名字
const dueDate = new Date("2024-02-15T23:59:59"); // 设置截止日期

// 以上信息均可在 https://ccfddl.github.io/ 查到

// 计算倒计时时间
const remainingTime = Math.max(0, dueDate - now); // 剩余时间（毫秒）
const totalTime = dueDate - new Date("2024-01-01T00:00:00"); // 总时长（毫秒）”自定义你开始 Project 的时间“
const progress = Math.min(1, remainingTime / totalTime); // 进度

// 格式化倒计时
const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
const remainingText = `${days}d ${hours}h ${minutes}m ${seconds}s`;

// 创建小组件
let widget = new ListWidget();
widget.backgroundColor = new Color("#ffffff");

// 添加会议名称
let title = widget.addText(conferenceName);
title.font = Font.boldSystemFont(16);
title.textColor = new Color("#000000");
widget.addSpacer(8);

// 添加截止日期
let dateText = widget.addText(`Due: ${dueDate.toLocaleDateString()} ${dueDate.toLocaleTimeString()}`);
dateText.font = Font.systemFont(12);
dateText.textColor = new Color("#555555");
widget.addSpacer(8);

// 添加倒计时
let countdownText = widget.addText(remainingText);
countdownText.font = Font.boldSystemFont(18);
countdownText.textColor = new Color("#ff0000");
widget.addSpacer(8);

// 添加进度条
let progressStack = widget.addStack();
progressStack.layoutHorizontally();
let progressBar = progressStack.addStack();
progressBar.backgroundColor = new Color("#007aff");
progressBar.cornerRadius = 4;
progressBar.size = new Size(200 * progress, 8); // 动态调整长度

let remainingBar = progressStack.addStack();
remainingBar.backgroundColor = new Color("#cccccc");
remainingBar.cornerRadius = 4;
remainingBar.size = new Size(200 * (1 - progress), 8);

// 设置小组件
widget.addSpacer();
Script.setWidget(widget);
widget.presentMedium();
Script.complete();
