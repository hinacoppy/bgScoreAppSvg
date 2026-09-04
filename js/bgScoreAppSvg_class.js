//bgScoreAppSvg_class.js
"use strict";

class bgScoreAppSvg {
  constructor() {
    this.matchlen = 5;
    this.score = [0, 0, 0];
    this.crawford = 0;
    this.cfplayer = 0;
    this.animationspeed = "0.3s";
    this.scorefontsize = "13vmax";
    this.scorefontsize = "15vmax";
    this.sgvfillcolor = "#036";
    this.settingWindowFlag = false;
    this.settingVars = {}; //設定内容を保持するオブジェクト
    this.applyUrlParams();
    this.setEventHandler();
    this.resetScore();
    this.setColorTheme();
  }

  //起動オプション(URLクエリパラメータ)で表示形式を指定する
  //例: ?f=rectangle / ?f=7segment (未指定・不正値の場合はHTML側のデフォルト(7segment)のまま)
  applyUrlParams() {
    const params = new URLSearchParams(location.search);
    const fonttypeMap = { "7segment": "7seg", rectangle: "rect" };
    const f = fonttypeMap[params.get("f")];
    if (f) {
      document.querySelector("#fonttype").value = f;
    }
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

  //フォント種別に応じてスコアカードの配色を切り替える
  setColorTheme() {
    const fonttype = document.querySelector("#fonttype").value;
    const add = (fonttype == "rect") ? "rectangle" : "sevensegment";
    document.body.classList.remove("rectangle", "sevensegment");
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
    } else if ((beforescore == 9 && afterscore == 10) || (beforescore == 10 && afterscore == 9)) {
      //9から10へのスコア変更はアニメーションできない
      this.showStaticScore(domid, afterscore);
    } else {
      this.showAnimatationScore(domid, beforescore, afterscore);
    }
  }

  showAnimatationScore(domid, beforescore, afterscore) {
    const divtag = document.getElementById(domid);
    divtag.innerHTML = "";

    const bfonesdigit = beforescore % 10;
    const bftensdigit = Math.floor(beforescore / 10);
    const afonesdigit = afterscore % 10;
    const aftensdigit = Math.floor(afterscore / 10);

    if (afterscore >= 10) {
      const svgten = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svgten.setAttribute("viewBox", "0 0 50 90");
      svgten.setAttribute("width", this.scorefontsize);

      if (bftensdigit == aftensdigit) {
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
    if (fonttype == "rect") {
      this.createStaticPolygonRectangle(svg, digit);
    } else {
      this.createStaticPolygon7Segment(svg, digit);
    }
  }

  createAnimationPolygon(svg, before, after) {
    const fonttype = document.querySelector("#fonttype").value;
    if (fonttype == "rect") {
      this.createAnimationPolygonRectangle(svg, before, after);
    } else {
      this.createAnimationPolygon7Segment(svg, before, after);
    }
  }

  //7セグの数字画像のSVGオブジェクトを生成
  createStaticPolygon7Segment(svg, digit) {
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

  createAnimationPolygon7Segment(svg, before, after) {
    const beforeMap = this.getPolygonSegments(before.toString());
    const afterMap = this.getPolygonSegments(after.toString());
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

  //矩形数字画像のSVGオブジェクトを生成
  createStaticPolygonRectangle(svg, digit) {
    const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    const points = this.getPolygonPoints(digit);
    polygon.setAttribute("points", points);
    polygon.setAttribute("fill", this.sgvfillcolor);
    svg.appendChild(polygon);
  }

  createAnimationPolygonRectangle(svg, before, after) {
    const bfafkey = before.toString() + "and" + after.toString();
    const afbfkey = after.toString() + "and" + before.toString();
    const topoints = this.getPolygonPoints(bfafkey);
    const frpoints = this.getPolygonPoints(afbfkey);
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
      "$": "20,0 20,10 10,10 10,40 0,40 0,20 20,20 20,40 10,40 10,50 20,50 20,70 0,70 0,60 10,60 10,80 20,80 20,90 30,90 30,80 40,80 40,50 50,50 50,70 30,70 30,50 40,50 40,40 30,40 30,20 50,20 50,30 40,30 40,10 30,10 30,0",

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


  saveSettingVars() {
    this.settingVars.matchlength = document.querySelector("#matchlength").value;
    this.settingVars.fonttype = document.querySelector("#fonttype").value;
  }

  loadSettingVars() {
    document.querySelector("#matchlength").value = this.settingVars.matchlength;
    document.querySelector("#fonttype").value = this.settingVars.fonttype;
  }

}
