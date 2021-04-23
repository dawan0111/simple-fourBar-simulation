function vectorToXY(vector) {
  return [
    vector.value * Math.cos(vector.degree * Math.PI / 180),
    vector.value * Math.sin(vector.degree * Math.PI / 180)
  ]
}

function XYToVector(x, y) {
  return {
    value: Math.sqrt(x ** 2 + y ** 2),
    degree: Math.atan2(y, x) * 180 / Math.PI
  }
}

function vectorAdd(v1, v2) {
  const [x1, y1] = vectorToXY(v1);
  const [x2, y2] = vectorToXY(v2);

  return XYToVector(x1 + x2, y1 + y2)
}

const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
/*
  link는 벡터로 표현됨
  gr은 그라운드 링크
  degree 좌표평면상 x 왼쪽방향 부터 시작함
*/
const linkOptions = ["r1", "r2", "r3", "r4"].reduce((acc, key) => ({
  ...acc,
  [key]: {
    value: 200,
    degree: 90
  }
}), {})

const Draw = function(ctx) {
  this.GROUND_LINK_SIZE = 30;
  this.ctx = ctx;

  this.clear = () => {
    this.ctx.clearRect(0, 0, 9999, 9999)
  },

  this.groundLink = (x, y) => {
    const ctx = this.ctx;
    const GROUND_LINK_SIZE = this.GROUND_LINK_SIZE;
    const drawStartX = x;
    const drawStartY = y - GROUND_LINK_SIZE / 2;
    const M = GROUND_LINK_SIZE / 3;

    ctx.beginPath();
    ctx.moveTo(drawStartX, drawStartY)
    ctx.lineTo(drawStartX + M * 3, drawStartY)
    ctx.moveTo(drawStartX + M, drawStartY)
    ctx.lineTo(drawStartX + M, drawStartY - M)
    ctx.arc(drawStartX + M * 3 / 2, drawStartY - M, M / 2, Math.PI, false)
    ctx.lineTo(drawStartX + M * 2, drawStartY)
    ctx.lineTo(drawStartX + M * 3, drawStartY)

    ctx.moveTo(drawStartX + M * 3 / 2 + M / 4, drawStartY - M)
    ctx.arc(drawStartX + M * 3 / 2, drawStartY - M, M / 4, Math.PI * 2, false)

    for (let i = 0; i < 4; i++) {
      ctx.moveTo(drawStartX + GROUND_LINK_SIZE / 4 * i, drawStartY)
      ctx.lineTo(drawStartX + GROUND_LINK_SIZE / 4 * (i + 1), drawStartY + GROUND_LINK_SIZE / 4)
    }
    ctx.stroke()
  },

  this.link = (vector, x, y, circle = false) => {
    this.ctx = ctx;
    const [linkX, linkY] = vectorToXY(vector);
    const M = this.GROUND_LINK_SIZE / 3;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + linkX, y - linkY);
    ctx.moveTo(x + linkX + M / 4, y - linkY)
    circle && ctx.arc(x + linkX, y - linkY, M / 4, Math.PI * 2, false)
    ctx.stroke();

    return [x + linkX, y - linkY]
  }
}

const LinkSystem = function(canvas, linkOptions, draw) {
  this.canvas = canvas
  this.linkOptions = linkOptions
  this.draw = draw


  this.drawLink = () => {
    this.linkCalc();
    const startX = this.canvas.width / 3;
    const startY = this.canvas.height;

    this.draw.clear()

    this.draw.groundLink(startX, startY)

    const [x2, y2] = this.draw.link(this.linkOptions.r1, startX + this.draw.GROUND_LINK_SIZE / 2, startY - this.draw.GROUND_LINK_SIZE / 4 * 3, true)
    const [x3, y3] = this.draw.link(this.linkOptions.r2, x2, y2, true)
    const [x4, y4] = this.draw.link(this.linkOptions.r3, x3, y3)

    this.draw.groundLink(startX + this.linkOptions.r4.value + this.draw.GROUND_LINK_SIZE / 12, startY)
    // let [x4, y4] = this.draw.link(this.linkOptions.r1, startX + this.draw.GROUND_LINK_SIZE / 2, startY - this.draw.GROUND_LINK_SIZE / 4 * 3)
  }

  this.linkCalc = () => {
    const lo = this.linkOptions;
    const theta1 = +document.getElementById("theta1").value;
    const r1 = +document.getElementById("r1").value;
    const r2 = +document.getElementById("r2").value;
    const r3 = +document.getElementById("r3").value;
    const r4 = +document.getElementById("r4").value;

    lo.r1.value = r1;
    lo.r2.value = r2;
    lo.r3.value = r3;
    lo.r4.value = r4;

    lo.r1.degree = theta1;
    lo.r4.degree = 180;

    const sLink = vectorAdd(lo.r4, lo.r1)
    const psi = Math.acos((lo.r2.value ** 2 + sLink.value ** 2 - lo.r3.value ** 2) / (2 * lo.r2.value * sLink.value)) * 180 / Math.PI;
    const psi2 = Math.acos((lo.r4.value ** 2 + sLink.value ** 2 - lo.r1.value ** 2) / (2 * lo.r4.value * sLink.value)) * 180 / Math.PI;
    const beta = Math.acos((lo.r3.value ** 2 + sLink.value ** 2 - lo.r2.value ** 2) / (2 * lo.r3.value * sLink.value)) * 180 / Math.PI;

    lo.r2.degree = psi - psi2;
    lo.r3.degree = (180 - beta - psi2) + 180;
  }

  this.drawLink()
}

const draw = new Draw(ctx)

const linkSystem = new LinkSystem(canvas, linkOptions, draw)

const inputElement = document.querySelectorAll("#theta1, #r1, #r2, #r3, #r4");
inputElement.forEach(element => {
  element.addEventListener("input", function(e) {
    linkSystem.drawLink()
  })
})