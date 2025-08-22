// 进度条容器（总长 200，圆角外框）
let barOuter = widget.addStack();
barOuter.size = new Size(200, 10);
barOuter.cornerRadius = 5;
barOuter.backgroundColor = new Color("#cccccc");
barOuter.layoutHorizontally();

// 已完成部分
let doneStack = barOuter.addStack();
let doneWidth = Math.max(0, 200 * progress);

// 渐变色（蓝 -> 青）
let gradient = new LinearGradient();
gradient.colors = [new Color("#007aff"), new Color("#00c6ff")];
gradient.locations = [0, 1];
gradient.startPoint = new Point(0, 0);
gradient.endPoint = new Point(1, 0);

doneStack.backgroundGradient = gradient;
doneStack.size = new Size(doneWidth, 10);

// 只在左边保留圆角，右边直角
doneStack.cornerRadius = 0;
if (progress > 0.98) {
  // 接近满进度时，保持整体圆角
  doneStack.cornerRadius = 5;
}

// 剩余部分
let leftWidth = 200 - doneWidth;
if (leftWidth > 0) {
  let leftStack = barOuter.addStack();
  leftStack.backgroundColor = new Color("#cccccc");
  leftStack.size = new Size(leftWidth, 10);
  leftStack.cornerRadius = 0;
  if (progress < 0.02) {
    // 接近零进度时，保持整体圆角
    leftStack.cornerRadius = 5;
  }
}
