//bgScoreAppSvg_class.js
"use strict";

class bgScoreAppSvg {
  constructor(fonttype = "7seg") {
    this.matchlen = 5;
    this.score = [0, 0, 0];
    this.crawford = 0;
    this.cfplayer = 0;
    this.animationspeed = "0.3s";
    this.animspeedhalf = "0.2s"; //flipfontのときのアニメーションスピード
    this.scorefontsize = "15vmax";
    this.sgvfillcolor = "#036";
    this.settingWindowFlag = false;
    this.settingVars = {}; //設定内容を保持するオブジェクト
    this.setEventHandler();
    this.resetScore();
    this.applyFontType(fonttype);
    this.setColorTheme();
  }

  applyFontType(fonttype) {
    document.querySelector("#fonttype").value = fonttype;
  }

  setEventHandler() {
    //スコアカード部分がクリックされたとき
    const scorebtns = ["#score1", "#score2"];
    for (const btn of scorebtns) {
      document.querySelector(btn).addEventListener("click", (evt) => {
        this.incdecScore(evt, +1);
      });
    }

    //スコアマイナスボタンがクリックされたとき
    const minusbtns = ["#minusbtn1", "#minusbtn2"];
    for (const btn of minusbtns) {
      document.querySelector(btn).addEventListener("click", (evt) => {
        this.incdecScore(evt, -1);
      });
    }

    //設定画面の[RESET SCORE]ボタンがクリックされたとき
    const applybtn = document.querySelector("#applybtn");
    applybtn.addEventListener("click", () => {
      this.resetScore();
      this.showHideSettingPanel(false);
      //this.applyFontType(); //fonttypeを選択状態にする
      this.setColorTheme(); //fonttypeの設定に従い色を変える
    });

    //設定画面の[CANCEL]ボタンがクリックされたとき
    const cancelbtn = document.querySelector("#cancelbtn");
    cancelbtn.addEventListener("click", () => {
      this.showHideSettingPanel(false);
      this.loadSettingVars(); //matchlengthを書き戻す
    });

    //メイン画面の[SETTINGS]ボタンがクリックされたとき
    const settingbtns = ["#settingbtn", "#matchinfo"]; //ポイント表示部分も設定ボタンとして機能させる
    for (const btn of settingbtns) {
      document.querySelector(btn).addEventListener("click", () => {
        this.showHideSettingPanel(true);
        this.saveSettingVars(); //元の値を覚えておく
      });
    }
  }

  saveSettingVars() {
    this.settingVars.matchlength = document.querySelector("#matchlength").value;
    this.settingVars.fonttype = document.querySelector("#fonttype").value;
  }

  loadSettingVars() {
    document.querySelector("#matchlength").value = this.settingVars.matchlength;
    document.querySelector("#fonttype").value = this.settingVars.fonttype;
  }

  //フォント種別に応じてスコアカードの配色を切り替える
  setColorTheme() {
    const fonttype = document.querySelector("#fonttype").value;
    const themeClassMap = { "7seg": "sevensegment", "rect": "rectangle", "dot": "dotmatrix", "flip": "flipfont" };
    const add = themeClassMap[fonttype] || "sevensegment";
    document.body.classList.remove("sevensegment", "rectangle", "dotmatrix", "flipfont");
    document.body.classList.add(add);
  }

  showHideSettingPanel(showflag = true) {
    this.settingWindowFlag = showflag; //Show(showflag == true), Hide(false)
    const settingwindow = document.querySelector("#settingwindow");
    if (showflag) {
      settingwindow.style.display = "block";
    } else {
      settingwindow.style.display = "none";
    }
 }

  //設定画面でapplyした際に初期設定に戻す
  resetScore() {
    this.score = [0, 0, 0];
    this.crawford = 0;
    this.cfplayer = 0;
    this.showStaticScore("score1", this.score[1]);
    this.showStaticScore("score2", this.score[2]);

    const matchinfo = document.querySelector("#matchlength").value;
    this.matchlen = parseInt(matchinfo);
    this.showMatchLength("matchinfo", this.matchlen);
    document.querySelector("#crawfordinfo").textContent = "";
    this.checkCrawford(0); //1ptマッチの時DMPと表示させる
  }

  //Crawfordかどうかを判断
  checkCrawford(player) {
    let cfstr;
    if (this.matchlen == 0) {
      cfstr = "";
    } else if (this.score[1] == this.matchlen || this.score[2] == this.matchlen) {
      cfstr = "MATCH";
    } else if (this.score[1] == this.score[2] && this.matchlen - this.score[player] == 1) {
      cfstr = "DMP";
    } else if (this.matchlen - this.score[player] == 1 && this.crawford == 0) {
      this.crawford = 1; this.cfplayer = player;
      cfstr = "Crawford";
    } else if (this.matchlen - this.score[this.cfplayer] == 1) {
      this.crawford = 0;
      cfstr = "Post<br>Crawford";
    } else {
      this.crawford = 0; this.cfplayer = 0;
      cfstr = "";
    }
    document.querySelector("#crawfordinfo").innerHTML = cfstr;
  }

  incdecScore(evt, delta) {
    if (this.settingWindowFlag) { return; } //設定画面表示時はスコアは操作できない

    const minmaxfunc = (num, min, max) => { return Math.max(min, Math.min(num, max)); }
    const player = parseInt(evt.currentTarget.id.slice(-1));
    const domid = "score" + player;
    const afterscore = minmaxfunc(this.score[player] + delta, 0, 99);
    this.showScore(domid, this.score[player], afterscore);
    this.score[player] = afterscore;
    this.checkCrawford(player);
  }

  showScore(domid, beforescore, afterscore) {
    if (beforescore == afterscore) {
      this.showStaticScore(domid, afterscore);
    } else {
      this.showAnimatationScore(domid, beforescore, afterscore);
    }
  }

  showAnimatationScore(domid, beforescore, afterscore) {
    const divtag = document.getElementById(domid);
    divtag.innerHTML = "";

    const bfonesdigit = beforescore % 10;
    const afonesdigit = afterscore % 10;
    //10の位が存在しない場合はnull(=「桁なし」)として扱う。9→10, 10→9のような桁の増減もこれで表現する
    const bftensdigit = beforescore >= 10 ? Math.floor(beforescore / 10) : null;
    const aftensdigit = afterscore >= 10 ? Math.floor(afterscore / 10) : null;

    //flipフォントは10の位の値が変わらない場合も、統一感を出すためフリップさせる(他フォントは静的表示のままでよい)
    const fonttype = document.querySelector("#fonttype").value;
    const alwaysAnimateTens = (fonttype == "flip");

    //10の位が最終的に無くなる場合(10→9など)は、アニメーションさせず最初から1桁レイアウトにする。
    //(アニメーション後に要素を取り除く方式だと、消えた瞬間に1の位の表示位置がずれて違和感があるため)
    if (aftensdigit !== null) {
      const svgten = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svgten.setAttribute("viewBox", "0 0 50 90");
      svgten.setAttribute("width", this.scorefontsize);

      if (bftensdigit === aftensdigit && !alwaysAnimateTens) {
        this.createStaticPolygon(svgten, aftensdigit);
      } else {
        this.createAnimationPolygon(svgten, bftensdigit, aftensdigit);
      }
      divtag.appendChild(svgten);
    }

    const svgone = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgone.setAttribute("viewBox", "0 0 50 90");
    svgone.setAttribute("width", this.scorefontsize);

    this.createAnimationPolygon(svgone, bfonesdigit, afonesdigit);
    divtag.appendChild(svgone);

    divtag.offsetHeight; //ブラウザのレイアウトエンジンにレンダリング確定を強制
    //offsetHeight プロパティを読み取ることで、レイアウト計算がスケジュール待ちではなく同期実行される
  }

  showStaticScore(domid, score) {
    const divtag = document.getElementById(domid);
    divtag.innerHTML = "";
    this.createStaticSvg(divtag, score, false);
  }

  showMatchLength(domid, matchlength) {
    const divtag = document.getElementById(domid);
    divtag.innerHTML = "";
    this.createStaticSvg(divtag, matchlength, true);
  }

  createStaticSvg(divtag, num, matchinfoflag = false) {
    const onesdigit = (matchinfoflag && num == 0) ? "$" : num % 10;
    const tensdigit = Math.floor(num / 10);
    const width = matchinfoflag ? "4vmax" : this.scorefontsize;

    if (num >= 10) {
      const innersvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      innersvg.setAttribute("viewBox", "0 0 50 90");
      innersvg.setAttribute("width", width);
      const polygon = this.createStaticPolygon(innersvg, tensdigit);
      divtag.appendChild(innersvg);
    }

    const innersvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    innersvg.setAttribute("viewBox", "0 0 50 90");
    innersvg.setAttribute("width", width);
    const polygon = this.createStaticPolygon(innersvg, onesdigit);
    divtag.appendChild(innersvg);
  }

  createStaticPolygon(svg, digit) {
    const fonttype = document.querySelector("#fonttype").value;
    switch (fonttype) {
    case "rect":
      this.createStaticRectangle(svg, digit);
      break;
    case "dot":
      this.createStaticDotMatrix(svg, digit);
      break;
    case "flip":
      this.createStaticFlipFont(svg, digit);
      break;
    case "7seg":
    default:
      this.createStatic7Segment(svg, digit);
      break;
    }
  }

  createAnimationPolygon(svg, before, after) {
    const fonttype = document.querySelector("#fonttype").value;
    switch (fonttype) {
    case "rect":
      this.createAnimationRectangle(svg, before, after);
      break;
    case "dot":
      this.createAnimationDotMatrix(svg, before, after);
      break;
    case "flip":
      this.createAnimationFlipFont(svg, before, after);
      break;
    case "7seg":
    default:
      this.createAnimation7Segment(svg, before, after);
      break;
    }
  }

  /***** 7 Segment Polygon ************************************************/
  //7セグの数字画像のSVGオブジェクトを生成
  createStatic7Segment(svg, digit) {
    const segmentMap = this.getPolygonSegments(digit);
    if (!segmentMap) { return; }

    // それぞれのセグメントを独立したポリゴンとして描画
    for (const points of Object.values(segmentMap)) {
      const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      polygon.setAttribute("points", points);
      polygon.setAttribute("fill", this.sgvfillcolor);
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
      polygon.setAttribute("fill", this.sgvfillcolor);

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

  /***** Rectangle Polygon ************************************************/
  //矩形数字画像のSVGオブジェクトを生成
  createStaticRectangle(svg, digit) {
    const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    const points = this.getPolygonPoints(digit);
    polygon.setAttribute("points", points);
    polygon.setAttribute("fill", this.sgvfillcolor);
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
    const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    polygon.setAttribute("points", topoints);
    polygon.setAttribute("fill", this.sgvfillcolor);

    const animate = document.createElementNS("http://www.w3.org/2000/svg", "animate");
    animate.setAttribute("attributeName", "points");
    animate.setAttribute("repeatCount", "1");
    animate.setAttribute("dur", this.animationspeed);
    animate.setAttribute("from", frpoints);
    animate.setAttribute("to", topoints);

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

  /***** 5x9 Dot Matrix ************************************************/
  //5x9ドットマトリクスの数字画像のSVGオブジェクトを生成
  createStaticDotMatrix(svg, digit) {
    const pattern = this.getDotMatrixPattern(digit.toString());
    if (!pattern) { return; }
    const { cols, rows, radius, onOpacity, offOpacity } = this.getDotMatrixGeometry();

    for (let r = 0; r < rows.length; r++) {
      for (let c = 0; c < cols.length; c++) {
        const on = pattern[r][c] == "1";
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", cols[c]);
        circle.setAttribute("cy", rows[r]);
        circle.setAttribute("r", radius);
        circle.setAttribute("fill", this.sgvfillcolor);
        circle.setAttribute("opacity", on ? onOpacity : offOpacity);
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

        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", cols[c]);
        circle.setAttribute("cy", rows[r]);
        circle.setAttribute("r", radius);
        circle.setAttribute("fill", this.sgvfillcolor);
        circle.setAttribute("opacity", toOpacity);

        if (beforeOn != afterOn) { //点灯状態が変化するドットだけopacityをアニメーションさせる
          const animate = document.createElementNS("http://www.w3.org/2000/svg", "animate");
          animate.setAttribute("attributeName", "opacity");
          animate.setAttribute("repeatCount", "1");
          animate.setAttribute("dur", this.animationspeed);
          animate.setAttribute("from", fromOpacity);
          animate.setAttribute("to", toOpacity);
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

  /***** Flip (Shrink and Expand) ************************************************/
  //フリップ(シュリンク&エクスパンド)風の数字画像のSVGオブジェクトを生成。
  createStaticFlipFont(svg, digit) {
    const d = this.getPathDataFlipFont(digit);
    if (!d) { return; }

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    path.setAttribute("fill", this.sgvfillcolor);
    svg.appendChild(path);
  }

  //中央(y=45)を基準に、古い数字が上下からシュリンクして消えた後、
  //新しい数字が中央から上下へエクスパンドして現れる2段階アニメーション。
  //フェーズ1・2とも同期的に生成し、フェーズ2はbegin属性の時間オフセットで開始を遅らせる
  createAnimationFlipFont(svg, before, after) {
    //before/afterがnullの場合は「桁なし(数字が存在しない状態)」を表す。
    //その場合はシュリンク/エクスパンドの該当フェーズ自体を作らない(=最初から縮みきった状態として扱う)
    const beforeData = before === null ? null : this.getPathDataFlipFont(before.toString());
    const afterData = after === null ? null : this.getPathDataFlipFont(after.toString());
    if ((before !== null && !beforeData) || (after !== null && !afterData)) { return; }

    //フェーズ1: 古い数字を上下から中央へシュリンク(1→0)。即時開始(古い数字がない場合は省略)
    if (beforeData) {
      svg.appendChild(this.buildScaleGroup(beforeData, 1, 0, "0s"));
    }
    //フェーズ2: 新しい数字を中央から上下へエクスパンド(0→1)。
    //常にフェーズ1の再生時間分だけ開始を遅らせる(この桁にフェーズ1が無い場合=桁が出現する場合でも、
    //1の位など他の桁のフェーズ2と開始タイミングを揃えるため)
    if (afterData) {
      svg.appendChild(this.buildScaleGroup(afterData, 0, 1, this.animspeedhalf));
    }
  }

  //transformは子から順に適用されるため、下から読むと
  //「中央に原点を移動→Y方向スケール→原点を戻す」という順で効く
  buildScaleGroup(pathData, fromScale, toScale, beginTime) {
    const svgNS = "http://www.w3.org/2000/svg";
    const center = 45; //シュリンク/エクスパンドの基準線(y座標)

    const outerGroup = document.createElementNS(svgNS, "g");
    outerGroup.setAttribute("transform", `translate(0,${center})`);

    const scaleGroup = document.createElementNS(svgNS, "g");
    scaleGroup.setAttribute("transform", `scale(1,${fromScale})`); //基準値=このフェーズのアニメーション開始前の状態

    const animateTransform = document.createElementNS(svgNS, "animateTransform");
    animateTransform.setAttribute("attributeName", "transform");
    animateTransform.setAttribute("type", "scale");
    animateTransform.setAttribute("from", `1 ${fromScale}`);
    animateTransform.setAttribute("to", `1 ${toScale}`);
    animateTransform.setAttribute("begin", beginTime);
    animateTransform.setAttribute("dur", this.animspeedhalf);
    animateTransform.setAttribute("repeatCount", "1");
    animateTransform.setAttribute("fill", "freeze");
    scaleGroup.appendChild(animateTransform);

    const innerGroup = document.createElementNS(svgNS, "g");
    innerGroup.setAttribute("transform", `translate(0,${-center})`);
    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", pathData);
    path.setAttribute("fill", this.sgvfillcolor);
    innerGroup.appendChild(path);

    scaleGroup.appendChild(innerGroup);
    outerGroup.appendChild(scaleGroup);
    return outerGroup;
  }

  //flipfont専用のSVGフォント(Anton, SIL Open Font License 1.1。ライセンス全文はfonts/anton/OFL.txt参照)の
  //グリフアウトラインをpath d属性として定義したもの。viewBox "0 0 50 90"に収まるよう正規化済み。
  getPathDataFlipFont(keystr) {
    const pathlist = {
      "0": "M25 89.55Q13.89 89.55 7.84 83.33Q1.79 77.1 1.79 65.4V25.85Q1.79 13.5 7.54 6.9Q13.3 0.3 25 0.3Q36.75 0.3 42.48 6.9Q48.21 13.5 48.21 25.85V65.4Q48.21 77.1 42.18 83.33Q36.16 89.55 25 89.55ZM25 73.41Q27.04 73.41 28.19 71.57Q29.33 69.73 29.33 67.44V24.16Q29.33 21.07 28.66 18.75Q27.99 16.44 25 16.44Q22.01 16.44 21.34 18.75Q20.67 21.07 20.67 24.16V67.44Q20.67 69.73 21.84 71.57Q23.01 73.41 25 73.41Z",
      "1": "M21.14 88.75V21.22Q19.35 23.36 16.21 24.68Q13.07 26 10.28 26V12Q12.92 11.6 15.96 10.29Q19 8.97 21.61 6.65Q24.23 4.33 25.62 1.05H39.72V88.75Z",
      "2": "M2.06 88.75V84.57Q2.06 78.05 4.08 72.84Q6.1 67.64 9.29 63.18Q12.47 58.72 16.01 54.44Q19.45 50.25 22.56 45.85Q25.67 41.44 27.64 36.28Q29.61 31.13 29.61 24.7Q29.61 21.62 28.69 19.4Q27.76 17.18 24.88 17.18Q20.49 17.18 20.49 25V35.71H2.06Q2.01 34.57 1.94 33.12Q1.86 31.68 1.86 30.33Q1.86 20.87 3.86 14.27Q5.85 7.67 10.9 4.21Q15.96 0.75 25.12 0.75Q36.03 0.75 42.08 6.87Q48.14 13 48.14 24.36Q48.14 32.08 46.14 37.88Q44.15 43.68 40.86 48.44Q37.58 53.19 33.64 57.92Q30.85 61.26 28.24 64.75Q25.62 68.23 23.63 72.22H47.54V88.75Z",
      "3": "M24.2 89.75Q12.6 89.75 7.32 83.62Q2.04 77.5 2.04 65.15V55.98H20.02V65.2Q20.02 68.68 20.89 71.1Q21.76 73.51 24.8 73.51Q27.89 73.51 28.74 70.9Q29.58 68.28 29.58 62.36V60.17Q29.58 55.63 28.06 52.25Q26.54 48.86 22.11 48.86Q21.56 48.86 21.14 48.88Q20.72 48.91 20.42 48.96V33.22Q24.95 33.22 27.34 31.2Q29.73 29.19 29.73 24.45Q29.73 17.03 25.45 17.03Q22.66 17.03 21.69 19.2Q20.72 21.37 20.72 24.7V27.34H2.59Q2.54 26.75 2.51 25.9Q2.49 25.05 2.49 24.26Q2.49 12.2 8.12 6.57Q13.74 0.95 25.35 0.95Q47.76 0.95 47.76 24.26Q47.76 30.73 46.02 34.94Q44.28 39.15 39.54 40.84Q43.28 42.63 45.07 45.42Q46.86 48.21 47.41 52.35Q47.96 56.48 47.96 62.36Q47.96 75.51 42.46 82.63Q36.95 89.75 24.2 89.75Z",
      "4": "M26.72 88.8V74.91H0.72V61.21L17.3 1.05H44.6V60.27H49.28V74.91H44.6V88.8ZM16.36 60.27H26.72V16.09Z",
      "5": "M24.73 90Q14.62 90 8.22 84.99Q1.82 79.99 1.82 69.63V56.58H20.04V64.1Q20.04 66.44 20.32 68.63Q20.59 70.82 21.59 72.22Q22.58 73.61 24.73 73.61Q27.57 73.61 28.46 71.7Q29.36 69.78 29.36 66.79V49.56Q29.36 47.42 29.08 45.32Q28.81 43.23 27.86 41.84Q26.92 40.44 24.83 40.44Q19.85 40.44 19.85 47.66H3.76V1.05H45.55V17.48H20.39V29.83Q21.69 28.24 23.9 27.02Q26.12 25.8 29.11 25.8Q35.09 25.8 38.85 28.09Q42.61 30.38 44.62 34.47Q46.64 38.55 47.41 43.93Q48.18 49.31 48.18 55.48Q48.18 63.4 47.36 69.75Q46.54 76.1 44.13 80.64Q41.71 85.17 37.05 87.58Q32.4 90 24.73 90Z",
      "6": "M25.4 89.55Q16.28 89.55 11.13 86.44Q5.97 83.33 3.86 77.05Q1.74 70.77 1.74 61.41V37.7Q1.74 28.59 2.51 21.62Q3.28 14.64 5.72 9.91Q8.17 5.18 13 2.74Q17.83 0.3 25.9 0.3Q31.43 0.3 36.21 2.22Q40.99 4.13 43.93 7.94Q46.86 11.75 46.86 17.48V26.95H29.98V25.15Q29.98 22.96 29.76 20.77Q29.53 18.58 28.64 17.13Q27.74 15.69 25.6 15.69Q22.66 15.69 21.51 17.31Q20.37 18.93 20.37 21.96V39.55Q21.61 37.21 24.1 35.79Q26.59 34.37 30.18 34.37Q37.45 34.37 41.36 37.28Q45.27 40.19 46.77 45.97Q48.26 51.75 48.26 60.42Q48.26 69.18 46.12 75.73Q43.98 82.28 38.97 85.92Q33.97 89.55 25.4 89.55ZM24.75 73.41Q27.84 73.41 28.44 70.8Q29.03 68.18 29.03 64.1V57.03Q29.03 49.86 25 49.86Q20.37 49.86 20.37 56.08V66.94Q20.37 73.41 24.75 73.41Z",
      "7": "M6.62 88.71Q7.42 76.45 10.06 65.79Q12.7 55.14 16.13 45.95Q19.57 36.76 22.76 29.09L27.64 17.28H2.89V1.05H47.11V10.61Q47.11 15.89 45.37 21.27Q43.63 26.65 40.79 33.12Q34.61 47.17 30.95 61.09Q27.29 75.01 26.44 88.71Z",
      "8": "M25 89.7Q12.65 89.7 7.37 82.63Q2.09 75.56 2.09 62.61V56.78Q2.09 50.11 3.68 45.97Q5.28 41.84 9.56 39.65Q5.53 38 3.83 34.14Q2.14 30.28 2.14 24.55V22.26Q2.14 10.61 7.99 5.3Q13.84 0 25 0Q36.46 0 42.13 5.45Q47.81 10.91 47.81 22.96Q47.81 29.29 46.32 33.57Q44.82 37.85 40.39 39.75Q45.12 42.19 46.52 46.15Q47.91 50.11 47.91 56.78V62.61Q47.91 75.56 42.63 82.63Q37.35 89.7 25 89.7ZM25 32.27Q29.63 32.27 29.63 23.91Q29.63 21.12 28.66 18.63Q27.69 16.14 25 16.14Q22.31 16.14 21.34 18.63Q20.37 21.12 20.37 23.91Q20.37 32.27 25 32.27ZM25 72.37Q29.78 72.37 29.78 64.65V56.63Q29.78 52.65 28.71 50.4Q27.64 48.16 25 48.16Q22.26 48.16 21.26 50.4Q20.27 52.65 20.27 56.63V64.65Q20.27 72.37 25 72.37Z",
      "9": "M24.1 89.55Q18.57 89.55 13.79 87.63Q9.01 85.72 6.07 81.88Q3.14 78.05 3.14 72.37V62.91H20.02V64.7Q20.02 66.89 20.24 69.08Q20.47 71.27 21.39 72.72Q22.31 74.16 24.4 74.16Q27.34 74.16 28.49 72.54Q29.63 70.92 29.63 67.89V50.3Q28.39 52.6 25.9 54.04Q23.41 55.48 19.82 55.48Q12.6 55.48 8.66 52.57Q4.73 49.66 3.23 43.88Q1.74 38.1 1.74 29.44Q1.74 20.67 3.88 14.12Q6.02 7.57 11.03 3.93Q16.03 0.3 24.6 0.3Q33.77 0.3 38.9 3.41Q44.03 6.52 46.14 12.78Q48.26 19.03 48.26 28.44V52.15Q48.26 61.26 47.49 68.23Q46.72 75.21 44.28 79.94Q41.83 84.67 37 87.11Q32.17 89.55 24.1 89.55ZM25 39.99Q29.63 39.99 29.63 33.77V22.91Q29.63 16.44 25.25 16.44Q22.16 16.44 21.56 19.05Q20.97 21.67 20.97 25.75V32.82Q20.97 39.99 25 39.99Z",
      "$": "M20.56 90V82.52Q11.11 81.41 7.05 75.89Q2.98 70.36 2.98 59.82V57.05H20.45V59.16Q20.45 66.9 25.33 66.9Q27.44 66.9 28.42 65.59Q29.39 64.29 29.39 62.53Q29.39 59.41 26.23 56.2L11.82 41.69Q3.88 33.75 3.88 24.46Q3.88 19.44 6.17 15.59Q8.45 11.75 12.24 9.32Q16.04 6.88 20.56 6.08V0H29.24V5.93Q37.83 7.03 42.3 13.01Q46.77 18.98 46.77 28.83H28.84V25.56Q28.84 23.4 27.69 22.25Q26.53 21.09 24.62 21.09Q22.51 21.09 21.46 22.15Q20.4 23.2 20.4 24.96Q20.4 27.47 25.38 32.39L39.44 46.26Q42.55 49.32 44.79 53.69Q47.02 58.06 47.02 63.58Q47.02 71.87 41.95 76.82Q36.88 81.76 29.24 82.62V90Z",
    };
    return pathlist[keystr.toString()]; //数字でアクセスしてもOKとなるようにしておく
  }

}
