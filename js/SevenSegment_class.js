/***** 7 Segment Polygon ************************************************/
"use strict";

class SevenSegment {
  constructor(parent) {
    this.parent = parent;
    this.animationspeed = "0.3s";
  }

  createStaticPolygon(svg, digit) {
    this.createStatic7Segment(svg, digit);
  }

  createAnimationPolygon(svg, before, after) {
    this.createAnimation7Segment(svg, before, after);
  }

  //7セグの数字画像のSVGオブジェクトを生成
  createStatic7Segment(svg, digit) {
    const segmentMap = this.getPolygonSegments(digit);
    if (!segmentMap) { return; }

    // それぞれのセグメントを独立したポリゴンとして描画
    for (const points of Object.values(segmentMap)) {
      const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      polygon.setAttribute("points", points);
      polygon.setAttribute("fill", this.parent.getFillColor());
      svg.appendChild(polygon);
    }
  }

  createAnimation7Segment(svg, before, after) {
    const beforeMap = this.getPolygonSegments(before === null ? null : before.toString());
    const afterMap = this.getPolygonSegments(after === null ? null : after.toString());
    if (!beforeMap || !afterMap) { return; }

    const segmentKeys = ["A", "B", "C", "D", "E", "F", "G"];

    for (const seg of segmentKeys) {
      const center = this.getSegmentCenter(seg);
      const degenerate = `${center} ${center} ${center} ${center} ${center} ${center}`;

      const from = beforeMap[seg] || degenerate;
      const to = afterMap[seg] || degenerate;

      const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      polygon.setAttribute("points", to);
      polygon.setAttribute("fill", this.parent.getFillColor());

      const animate = document.createElementNS("http://www.w3.org/2000/svg", "animate");
      animate.setAttribute("attributeName", "points");
      animate.setAttribute("repeatCount", "1");
      animate.setAttribute("dur", this.animationspeed);
      animate.setAttribute("from", from);
      animate.setAttribute("to", to);

      polygon.appendChild(animate);
      svg.appendChild(polygon);
    }
  }

  getSegmentCenter(segment) {
    // セグメント中央座標 (x,y)
    const centers = {
      A: "25,5",  // Top
      B: "45,25", // Top-Right
      C: "45,65", // Bottom-Right
      D: "25,85", // Bottom
      E: "5,65",  // Bottom-Left
      F: "5,25",  // Top-Left
      G: "25,45"  // Middle
    };
    return centers[segment] || "0,0";
  }

  getPolygonSegments(keystr) {
    if (keystr === null) { return {}; } //桁なし(数字が存在しない状態) = セグメントなし

    // 7セグメントディスプレイ風の明確な数字定義
    // 各数字を構成するセグメントを組み合わせる
    const segments = { //各セグメントのpolygon座標
      A: "4,3 7,0 43,0 46,3 39,10 11,10",       // 上段 (Top)
      B: "47,4 50,7 50,44 47,44 40,39 40,11",   // 右上 (Top-Right)
      C: "47,46 50,46 50,84 47,86 40,80 40,51", // 右下 (Bottom-Right)
      D: "11,81 39,81 46,87 43,90 7,90 4,87",   // 下段 (Bottom)
      E: "3,46 10,51 10,80 3,86 0,84 0,46",     // 左下 (Bottom-Left)
      F: "3,4 10,11 10,39 3,44 0,44 0,7",       // 左上 (Top-Left)
      G: "4,45 11,40 39,40 46,45 39,50 11,50",  // 中段 (Middle)
    };

    const digitSegments = { //各数字(文字)を構成しているセグメント
      "0": "ABCDEF",
      "1": "BC",
      "2": "ABDEG",
      "3": "ABCDG",
      "4": "BCFG",
      "5": "ACDFG",
      "6": "ACDEFG",
      "7": "ABCF",
      "8": "ABCDEFG",
      "9": "ABCDFG",
      "$": "ABCDEF", //== 0
    };

    const result = {};
    for (const seg of digitSegments[keystr].split("")) { //文字列→配列
      result[seg] = segments[seg];
    }
    return result;
  }
}
