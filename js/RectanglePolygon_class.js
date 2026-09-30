/***** Rectangle Polygon ************************************************/
"use strict";

class RectanglePolygon {
  constructor(parent) {
    this.parent = parent;
    this.animationspeed = "0.3s";
  }

  createStaticPolygon(svg, digit) {
    this.createStaticRectangle(svg, digit);
  }

  createAnimationPolygon(svg, before, after) {
    this.createAnimationRectangle(svg, before, after);
  }

  //矩形数字画像のSVGオブジェクトを生成
  createStaticRectangle(svg, digit) {
    const points = this.getPolygonPoints(digit);
    const attr = {"points": points, "fill": this.parent.getFillColor()};
    const polygon = this.parent.createSvgElement("polygon", attr);
    svg.appendChild(polygon);
  }

  createAnimationRectangle(svg, before, after) {
    let topoints, frpoints;
    if (before === null) {
      //桁が出現する: 中心に収縮した状態から、新しい数字の形状へ展開
      const afterPoints = this.getPolygonPoints(after.toString());
      topoints = afterPoints;
      frpoints = this.getBlankRectanglePoints(this.countRectanglePoints(afterPoints));
    } else if (after === null) {
      //桁が消える: 古い数字の形状から、中心に収縮した状態へ
      const beforePoints = this.getPolygonPoints(before.toString());
      topoints = this.getBlankRectanglePoints(this.countRectanglePoints(beforePoints));
      frpoints = beforePoints;
    } else {
      const bfafkey = before.toString() + "and" + after.toString();
      const afbfkey = after.toString() + "and" + before.toString();
      topoints = this.getPolygonPoints(bfafkey);
      frpoints = this.getPolygonPoints(afbfkey);
    }
    const attr1 = {"points": topoints, "fill": this.parent.getFillColor()};
    const polygon = this.parent.createSvgElement("polygon", attr1);

    const attr2 = {"attributeName": "points",
                   "repeatCount": "1",
                   "dur": this.animationspeed,
                   "from": frpoints,
                   "to": topoints,
                 };
    const animate = this.parent.createSvgElement("animate", attr2);

    polygon.appendChild(animate);
    svg.appendChild(polygon);
  }

  getPolygonPoints(keystr) {
    const pointlist = {
      "0": "0,0 0,90 50,90 50,0 10,0 10,10 40,10 40,80 10,80 10,0",
      "1": "10,0 10,10 20,10 20,90 30,90 30,0",
      "2": "0,0 0,10 40,10 40,40 0,40 0,90 50,90 50,80 10,80 10,50 50,50 50,0",
      "3": "0,0 0,10 40,10 40,40 0,40 0,50 40,50 40,80 0,80 0,90 50,90 50,0",
      "4": "0,0 0,50 40,50 40,90 50,90 50,0 40,0 40,40 10,40 10,0",
      "5": "0,0 0,50 40,50 40,80 0,80 0,90 50,90 50,40 10,40 10,10 50,10 50,0",
      "6": "0,0 0,90 50,90 50,40 10,40 10,50 40,50 40,80 10,80 10,10 50,10 50,0",
      "7": "0,0 0,30 10,30 10,10 40,10 40,90 50,90 50,0",
      "8": "0,0 0,90 50,90 50,0 10,0 10,10 40,10 40,40 10,40 10,50 40,50 40,80 10,80 10,0",
      "9": "0,0 0,50 40,50 40,40 10,40 10,10 40,10 40,80 0,80 0,90 50,90 50,0",
      "$": "20,0 20,10 10,10 10,40 0,40 0,20 20,20 20,40 10,40 10,50 20,50 20,70 0,70 0,60 10,60 \
            10,80 20,80 20,90 30,90 30,80 40,80 40,50 50,50 50,70 30,70 30,50 40,50 40,40 30,40 \
            30,20 50,20 50,30 40,30 40,10 30,10 30,0",

      "1and2": "0,0 0,10 40,10 40,40 0,40 0,90 50,90 50,80 10,80 10,50 50,50 50,0",
      "2and1": "10,0 10,10 20,10 20,40 20,40 20,90 30,90 30,80 30,80 30,50 30,50 30,0",
      "2and3": "0,0 0,10 40,10 40,40 0,40 0,50 40,50 40,80 0,80 0,90 50,90 50,80 50,80 50,50 50,50 50,0",
      "3and2": "0,0 0,10 40,10 40,40 0,40 0,50  0,50  0,80 0,80 0,90 50,90 50,80 10,80 10,50 50,50 50,0",
      "3and4": "40,0 40,10 40,10 40,40 10,40 10,0  0,0  0,50 40,50 40,80 40,80 40,90 50,90 50,0",
      "4and3": " 0,0  0,10 40,10 40,40 10,40 10,40 0,40 0,50 40,50 40,80  0,80  0,90 50,90 50,0",
      "4and5": "0,0 0,50 40,50 40,80  0,80  0,90 50,90 50,40 40,40 40,40 10,40 10,10 50,10 50,0",
      "5and4": "0,0 0,50 40,50 40,80 40,80 40,90 50,90 50,0  40,0  40,40 10,40 10,10 10,10 10,0",
      "5and6": "0,0 0,80 10,80 10,50 0,50 40,50 40,80 0,80 0,90 50,90 50,40 10,40 10,10 50,10 50,0",
      "6and5": "0,0 0,50 10,50 10,50 0,50 40,50 40,80 0,80 0,90 50,90 50,40 10,40 10,10 50,10 50,0",
      "6and7": "0,0 0,30 10,30 10,0  10,0  10,10  0,10  0,30 10,30 10,10 40,10 40,90 50,90 50,10 50,0",
      "7and6": "0,0 0,90 50,90 50,40 10,40 10,50 40,50 40,80 10,80 10,10 40,10 40,10 50,10 50,10 50,0",
      "7and8": "0,0 0,80 10,80 10,10 40,10 40,40 10,40 10,50 40,50 40,80  0,80  0,90 40,90 50,90 50,0",
      "8and7": "0,0 0,30 10,30 10,10 40,10 40,40 40,40 40,50 40,50 40,80 40,80 40,90 40,90 50,90 50,0",
      "8and9": "0,0 0,50 10,50 10,50 40,50 40,40 10,40 10,10 40,10 40,80 0,80 0,90 50,90 50,0",
      "9and8": "0,0 0,80 10,80 10,50 40,50 40,40 10,40 10,10 40,10 40,80 0,80 0,90 50,90 50,0",
      "9and0": "0,0 0,50 10,50 10,40 10,40 10,10 40,10 40,80 10,80 10,50 0,50 0,90 50,90 50,0",
      "0and9": "0,0 0,50 40,50 40,40 10,40 10,10 40,10 40,80 10,80 10,80 0,80 0,90 50,90 50,0",
      "0and1": "20,0 20,90 30,90 30,0 10,0 10,10 20,10 20,80 30,80 30,0",
      "1and0": "0,0   0,90 50,90 50,0 10,0 10,10 40,10 40,80 10,80 10,0",
    };
    return pointlist[keystr.toString()]; //数字でアクセスしてもOKとなるようにしておく
  }

  //桁が出現/消失するアニメーション用に、中心の1点に収縮した状態のpoints文字列を生成する
  //(頂点数を対応する数字と揃えることで、from/toの頂点数が一致し滑らかにモーフする)
  getBlankRectanglePoints(count) {
    return Array(count).fill("25,45").join(" ");
  }

  countRectanglePoints(pointsStr) {
    return pointsStr.trim().split(/\s+/).length;
  }

}
