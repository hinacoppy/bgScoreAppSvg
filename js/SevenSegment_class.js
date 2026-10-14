/***** 7 Segment Polygon ************************************************/
"use strict";

class SevenSegment {
  constructor(parent) {
    this.parent = parent;
    this.svgfillcolor = parent.svgfillcolor;
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
      const attr = {"points": points, "fill": this.svgfillcolor};
      const polygon = this.parent.createSvgElement("polygon", attr);
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

      const attr1 = {"points": to, "fill": this.svgfillcolor};
      const polygon = this.parent.createSvgElement("polygon", attr1);

      const attr2 = {"attributeName": "points",
                     "repeatCount": "1",
                     "dur": this.animationspeed,
                     "from": from,
                     "to": to};
      const animate = this.parent.createSvgElement("animate", attr2);

      polygon.appendChild(animate);
      svg.appendChild(polygon);
    }
  }

  getSegmentCenter(segment) {
    // セグメント中央座標 (x,y)
    const centers0degree = { //傾斜0度
      A: "25,5",  // Top
      B: "45,25", // Top-Right
      C: "45,65", // Bottom-Right
      D: "25,85", // Bottom
      E: "5,65",  // Bottom-Left
      F: "5,25",  // Top-Left
      G: "25,45"  // Middle
    };
    const centers3degree = { //傾斜3度
      A: "27.1,5",  // Top
      B: "44.2,25", // Top-Right
      C: "42.1,65", // Bottom-Right
      D: "22.9,85", // Bottom
      E: "5.8,65",  // Bottom-Left
      F: "7.9,25",  // Top-Left
      G: "25,45"    // Middle
    };
    const centers5degree = { //傾斜5度
      A: "28.5,5",  // Top
      B: "43.6,25", // Top-Right
      C: "40.1,65", // Bottom-Right
      D: "21.5,85", // Bottom
      E: "6.4,65",  // Bottom-Left
      F: "9.9,25",  // Top-Left
      G: "25,45"    // Middle
    };
    const centers = centers3degree //ちょうどいい傾斜角度を使う
    return centers[segment] || "0,0";
  }

  getPolygonSegments(keystr) {
    if (keystr === null) { return {}; } //桁なし(数字が存在しない状態) = セグメントなし

    // 7セグメントディスプレイ風の明確な数字定義
    // 各数字を構成するセグメントを組み合わせる
    //傾斜0度
    const segments0degree = { //各セグメントのpolygon座標
      A: "4,3 7,0 43,0 46,3 39,10 11,10",       // 上段 (Top)
      B: "47,4 50,7 50,44 47,44 40,39 40,11",   // 右上 (Top-Right)
      C: "47,46 50,46 50,84 47,86 40,80 40,51", // 右下 (Bottom-Right)
      D: "11,81 39,81 46,87 43,90 7,90 4,87",   // 下段 (Bottom)
      E: "3,46 10,51 10,80 3,86 0,84 0,46",     // 左下 (Bottom-Left)
      F: "3,4 10,11 10,39 3,44 0,44 0,7",       // 左上 (Top-Left)
      G: "4,45 11,40 39,40 46,45 39,50 11,50",  // 中段 (Middle)
    };
    // viewBox "0 0 50 90" に収めるためx方向を縮小するための導出式
    // 50·s + 90·tanθ = 50 → s = (50 − 90·tanθ) / 50 = 1 − 1.8·tanθ
    // x' = x * s + (90 - y) * tanθ
    //傾斜3度
    // θ=3°→ tan 3°= 0.052408 → s = 0.9057
    // x' = x * 0.9057 + (90 - y) * tan(3°)
    const segments3degree = {
      A: "8.2,3 11.1,0 43.7,0 46.2,3 39.5,10 14.2,10",        // 上段 (Top)
      B: "47.1,4 49.6,7 47.7,44 45,44 38.9,39 40.4,11",       // 右上 (Top-Right)
      C: "44.9,46 47.6,46 45.6,84 42.8,86 36.8,80 38.3,51",   // 右下 (Bottom-Right)
      D: "10.4,81 35.8,81 41.8,87 38.9,90 6.3,90 3.8,87",     // 下段 (Bottom)
      E: "5,46 11.1,51 9.6,80 2.9,86 0.3,84 2.3,46",          // 左下 (Bottom-Left)
      F: "7.2,4 13.2,11 11.7,39 5.1,44 2.4,44 4.3,7",         // 左上 (Top-Left)
      G: "6,45 12.6,40 37.9,40 44,45 37.4,50 12.1,50",        // 中段 (Middle)
    };
    //傾斜5度
    // θ=5°→ tan 5°= 0.08749 → s = 0.8425
    // x' = x * 0.8425 + (90 - y) * tan(5°)
    const segments5degree = {
      A: "11,3 13.8,0 44.1,0 46.4,3 39.9,10 16.3,10",         // 上段 (Top)
      B: "47.1,4 49.4,7 46.2,44 43.6,44 38.2,39 40.6,11",     // 右上 (Top-Right)
      C: "43.4,46 46,46 42.7,84 39.9,86 34.6,80 37.1,51",     // 右下 (Bottom-Right)
      D: "10.1,81 33.6,81 39,87 36.2,90 5.9,90 3.6,87",       // 下段 (Bottom)
      E: "6.4,46 11.8,51 9.3,80 2.9,86 0.5,84 3.8,46",        // 左下 (Bottom-Left)
      F: "10.1,4 15.3,11 12.9,39 6.6,44 4,44 7.3,7",          // 左上 (Top-Left)
      G: "7.3,45 13.6,40 37.2,40 42.7,45 36.4,50 12.8,50",    // 中段 (Middle)
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

    const segments = segments3degree; //ちょうどいい傾斜角度を使う
    const result = {};
    for (const seg of digitSegments[keystr].split("")) { //文字列→配列
      result[seg] = segments[seg];
    }
    return result;
  }
}
