// ---------- 二十四节气：通用算法（定气法，带进度条，无标题） ----------

// 节气名称与对应太阳黄经（度）——注意：0°=春分
const TERMS = [
  { name: "小寒", angle: 285 },
  { name: "大寒", angle: 300 },
  { name: "立春", angle: 315 },
  { name: "雨水", angle: 330 },
  { name: "惊蛰", angle: 345 },
  { name: "春分", angle:   0 },
  { name: "清明", angle:  15 },
  { name: "谷雨", angle:  30 },
  { name: "立夏", angle:  45 },
  { name: "小满", angle:  60 },
  { name: "芒种", angle:  75 },
  { name: "夏至", angle:  90 },
  { name: "小暑", angle: 105 },
  { name: "大暑", angle: 120 },
  { name: "立秋", angle: 135 },
  { name: "处暑", angle: 150 },
  { name: "白露", angle: 165 },
  { name: "秋分", angle: 180 },
  { name: "寒露", angle: 195 },
  { name: "霜降", angle: 210 },
  { name: "立冬", angle: 225 },
  { name: "小雪", angle: 240 },
  { name: "大雪", angle: 255 },
  { name: "冬至", angle: 270 },
];

function mod360(x){ return (x % 360 + 360) % 360; }

// 儒略日（UTC）
function julianDay(y, m, d) {
  if (m <= 2){ y -= 1; m += 12; }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
}

// 太阳黄经（简化近似，精度够用）
function sunLongitude(jd) {
  const T = (jd - 2451545.0) / 36525;
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T; // 平黄经
  const M  = 357.52911 + 35999.05029 * T - 0.0001537 * T * T; // 平近点角
  const Mr = M * Math.PI / 180;
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mr)
          + (0.019993 - 0.000101 * T) * Math.sin(2 * Mr)
          + 0.000289 * Math.sin(3 * Mr);                        // 日心黄经差
  const trueLong = L0 + C;
  return mod360(trueLong);
}

// 儒略日 -> Date(UTC)
function dateFromJD(jd){
  const J2000 = 2451545.0; // 2000-01-01 12:00:00 UTC
  const ms = (jd - J2000) * 86400000 + Date.UTC(2000,0,1,12,0,0);
  return new Date(ms);
}

// 计算某年 24 个节气的 UTC 时间
function calcTermsForYear(year){
  const jdJan1 = julianDay(year, 1, 1);
  const approxStep = 15.22; // 平均每个节气约 15.2 天
  const approxOffset = 5;   // 小寒大约在 1 月 5-6 日

  return TERMS.map((t, idx) => {
    // 初值：按平均间隔粗略猜一天
    let jd = jdJan1 + approxOffset + idx * approxStep;

    // 牛顿/割线式迭代：按每日约 0.9856° 修正
    for (let i=0; i<25; i++){
      const lng = sunLongitude(jd);
      const diff = ((t.angle - lng + 540) % 360) - 180; // 最小差（-180,180]
      jd += diff / 0.98564736; // 太阳日平均黄经变化（度/日）
      if (Math.abs(diff) < 1e-4) break;
    }
    return { name: t.name, angle: t.angle, dateUTC: dateFromJD(jd) };
  });
}

// —— 选取最近节气（用 UTC 比较，显示用北京时间，如需改成本机时区把 timeZone 改为 undefined）——
const nowUTC = new Date(); // Date 本身就是绝对时间，比较安全
const Y = nowUTC.getUTCFullYear();
const termsY    = calcTermsForYear(Y);
const termsY1   = calcTermsForYear(Y+1);
const termsYm1  = calcTermsForYear(Y-1);

let next = [...termsY, ...termsY1].find(t => t.dateUTC > nowUTC);
let hostYear = (termsY.includes(next) ? Y : Y+1);
let hostList = (hostYear === Y ? termsY : termsY1);
let idx = hostList.indexOf(next);

// 上一个节气要正确跨年
let prev;
if (idx > 0) {
  prev = hostList[idx - 1];
} else {
  prev = (hostYear === Y ? termsYm1[23] : termsY[23]);
}

// —— 倒计时 & 进度 —— 
const msRemain = Math.max(0, next.dateUTC - nowUTC);
const days  = Math.floor(msRemain / 86400000);
const hours = Math.floor(msRemain % 86400000 / 3600000);
const mins  = Math.floor(msRemain % 3600000 / 60000);
const secs  = Math.floor(msRemain % 60000 / 1000);
const remainText = `${days}天 ${hours}小时 ${mins}分 ${secs}秒`;

const total = next.dateUTC - prev.dateUTC;
const passed = nowUTC - prev.dateUTC;
const progress = Math.min(1, Math.max(0, passed / total));

// —— Widget —— 
let widget = new ListWidget();
widget.backgroundColor = new Color("#f5f5f5");

// 节气名（无标题）
let nameText = widget.addText(next.name);
nameText.font = Font.boldSystemFont(36);
nameText.textColor = new Color("#000000");
widget.addSpacer(6);

// 日期（显示为北京时间，如需本机时区请改成 { } 或删去 timeZone）
let dateText = widget.addText(
  next.dateUTC.toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })
);
dateText.font = Font.systemFont(12);
dateText.textColor = new Color("#555555");
widget.addSpacer(6);

// 倒计时
let cd = widget.addText(remainText);
cd.font = Font.boldSystemFont(24);
cd.textColor = new Color("#d0021b");
widget.addSpacer(8);

// 进度条
// 进度条容器（总长 200，圆角外框）
let barOuter = widget.addStack();
barOuter.size = new Size(300, 10);
barOuter.cornerRadius = 5;
barOuter.backgroundColor = new Color("#cccccc");
barOuter.layoutHorizontally();

// 已完成部分
let doneStack = barOuter.addStack();
let doneWidth = Math.max(0, 300 * progress);

// 渐变色（红 -> 紫）
let gradient = new LinearGradient();
gradient.colors = [new Color("#ff0000"), new Color("#800080")];
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
let leftWidth = 300 - doneWidth;
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


Script.setWidget(widget);
widget.presentMedium();
Script.complete();
