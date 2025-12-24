let cd = { d: 0, h: 0, m: 0, s: 0 };
function setup() {
  createCanvas(600, 200).parent('countdownCanvas');
}
function draw() {
  background(15);
  translate(width/2, height/2);
  push();
  rotate(sin(frameCount * 0.05) * 0.1);
  fill(255);
  textAlign(CENTER);
  textSize(32);
  text(`${cd.d}d ${cd.h}h ${cd.m}m ${cd.s}s`, 0, 0);
  pop();
}
window.updateCountdownData = (d,h,m,s) => { cd = {d,h,m,s}; };
