/***** 5x9 Dot Matrix ************************************************/
"use strict";

class DotMatrix {
  constructor(parent) {
    this.parent = parent;
    this.animationspeed = "0.3s";
  }

  createStaticPolygon(svg, digit) {
    this.createStaticDotMatrix(svg, digit);
  }

  createAnimationPolygon(svg, before, after) {
    this.createAnimationDotMatrix(svg, before, after);
  }

  //5x9ドットマトリクスの数字画像のSVGオブジェクトを生成
  createStaticDotMatrix(svg, digit) {
    const pattern = this.getDotMatrixPattern(digit.toString());
    if (!pattern) { return; }
    const { cols, rows, radius, onOpacity, offOpacity } = this.getDotMatrixGeometry();

    for (let r = 0; r < rows.length; r++) {
      for (let c = 0; c < cols.length; c++) {
        const on = pattern[r][c] == "1";
        const attr = {"cx": cols[c],
                      "cy": rows[r],
                      "r": radius,
                      "fill": this.parent.getFillColor(),
                      "opacity": on ? onOpacity : offOpacity};
        const circle = this.parent.createSvgElement("circle", attr);
        svg.appendChild(circle);
      }
    }
  }

  createAnimationDotMatrix(svg, before, after) {
    const beforePattern = this.getDotMatrixPattern(before === null ? null : before.toString());
    const afterPattern = this.getDotMatrixPattern(after === null ? null : after.toString());
    if (!beforePattern || !afterPattern) { return; }
    const { cols, rows, radius, onOpacity, offOpacity } = this.getDotMatrixGeometry();

    for (let r = 0; r < rows.length; r++) {
      for (let c = 0; c < cols.length; c++) {
        const beforeOn = beforePattern[r][c] == "1";
        const afterOn = afterPattern[r][c] == "1";
        const fromOpacity = beforeOn ? onOpacity : offOpacity;
        const toOpacity = afterOn ? onOpacity : offOpacity;

        const attr1 = {"cx": cols[c],
                       "cy": rows[r],
                       "r": radius,
                       "fill": this.parent.getFillColor(),
                       "opacity": toOpacity};
        const circle = this.parent.createSvgElement("circle", attr1);

        if (beforeOn != afterOn) { //点灯状態が変化するドットだけopacityをアニメーションさせる
          const attr2 = {"attributeName": "opacity",
                         "repeatCount": "1",
                         "dur": this.animationspeed,
                         "from": fromOpacity,
                         "to": toOpacity};
          const animate = this.parent.createSvgElement("animate", attr2);
          circle.appendChild(animate);
        }
        svg.appendChild(circle);
      }
    }
  }

  //ドットの格子座標・半径・点灯/消灯時の不透明度
  getDotMatrixGeometry() {
    return {
      cols: [7, 16, 25, 34, 43],                     //5列
      rows: [5, 15, 25, 35, 45, 55, 65, 75, 85],     //9行
      radius: 4.3,
      onOpacity: 1,
      offOpacity: 0.05, //消灯ドットもうっすら見せて実物のドットマトリクス表示らしさを出す
    };
  }

  getDotMatrixPattern(keystr) {
    if (keystr === null) { return Array(9).fill("00000"); } //桁なし(数字が存在しない状態) = 全消灯

    // 5x9ドットマトリクスの数字定義。各要素が1行分(5文字)、'1'が点灯ドット
    const patterns = {
      "0": ["01110", "10001", "10001", "10001", "10001", "10001", "10001", "10001", "01110"],
      "1": ["00100", "01100", "00100", "00100", "00100", "00100", "00100", "00100", "01110"],
      "2": ["01110", "10001", "00001", "00001", "00010", "00100", "01000", "10000", "11111"],
      "3": ["11110", "00001", "00001", "00001", "01110", "00001", "00001", "00001", "11110"],
      "4": ["00010", "00110", "01010", "10010", "10010", "10010", "11111", "00010", "00010"],
      "5": ["11111", "10000", "10000", "11110", "00001", "00001", "00001", "10001", "01110"],
      "6": ["00111", "01000", "10000", "10000", "11110", "10001", "10001", "10001", "01110"],
      "7": ["11111", "00001", "00001", "00010", "00010", "00100", "00100", "01000", "01000"],
      "8": ["01110", "10001", "10001", "10001", "01110", "10001", "10001", "10001", "01110"],
      "9": ["01110", "10001", "10001", "10001", "01111", "00001", "00001", "00010", "01100"],
      "$": ["00100", "01111", "10100", "10100", "01110", "00101", "00101", "11110", "00100"],
    };
    return patterns[keystr];
  }

}
