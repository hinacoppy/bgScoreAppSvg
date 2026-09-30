//bgScoreAppSvg_class.js
"use strict";

class bgScoreAppSvg {
  constructor(fonttype = "7seg") {
    this.fonttype = fonttype;
    this.matchlen = 5;
    this.score = [0, 0, 0];
    this.crawford = 0;
    this.cfplayer = 0;
    this.scorefontsize = "15vmax";
    this.settingWindowFlag = false;
    this.settingVars = {}; //設定内容を保持するオブジェクト
    this.fontWorker = this.makeFontWorker(fonttype);
    this.setEventHandler();
    this.resetScore();
  }

  makeFontWorker(fonttype) {
    switch (fonttype) {
    case "7seg":
      return new SevenSegment(this);
    case "rect":
      return new RectanglePolygon(this);
    case "dot":
      return new DotMatrix(this);
    case "flip":
      return new FlipFont(this);
    case "odo":
      return new Odometer(this);
    case "hand":
      return new HandWrite(this);
    default:
      alert("Unknown font type " + fonttype);
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
  }

  loadSettingVars() {
    document.querySelector("#matchlength").value = this.settingVars.matchlength;
  }

  getFillColor() {
    return getComputedStyle(document.body).getPropertyValue("--svg-fill-color").trim();
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
  //player: 今回スコアを操作したプレイヤー(1 or 2)、delta: 増減値(+1 / -1 / 0)
  //this.cfplayer: match point(matchlen-1)に先に到達したプレイヤー(0=該当なし)
  //this.crawford: 1=Crawfordゲーム中、0=Post Crawford(または該当なし)
  //DMP/MATCH表示中は状態を変更しない(「−」で戻したときに直前の状態へ復帰させるため)
  checkCrawford(player, delta = 0) {
    const mp = this.matchlen - 1; //match point
    const [s1, s2] = [this.score[1], this.score[2]];
    let cfstr = "";
    if (this.matchlen == 0) {
      cfstr = "";
    } else if (s1 >= this.matchlen || s2 >= this.matchlen) {
      cfstr = "MATCH"; //(「==」だと99点上限まで加点したとき表示が消えるため「>=」)
    } else if (s1 == mp && s2 == mp) {
      cfstr = "DMP";
    } else if (s1 == mp || s2 == mp) {
      const leader = (s1 == mp) ? 1 : 2;
      if (this.cfplayer != leader) {
        //leaderがmatch pointに到達した直後 → Crawfordゲーム開始
        this.cfplayer = leader; this.crawford = 1;
      } else if (this.crawford == 1 && delta > 0 && player != leader) {
        //Crawfordゲーム中にリードされている側が得点 → Post Crawfordへ
        //(「−」による訂正ではCrawfordのまま変えない)
        this.crawford = 0;
      }
      cfstr = this.crawford ? "Crawford" : "Post<br>Crawford";
    } else {
      this.crawford = 0; this.cfplayer = 0; //誰もmatch pointにいない
    }
    document.querySelector("#crawfordinfo").innerHTML = cfstr;
  }

  incdecScore(evt, delta) {
    if (this.settingWindowFlag) { return; } //設定画面表示時はスコアは操作できない

    const minmaxfunc = (num, min, max) => { return Math.max(min, Math.min(num, max)); }
    const player = parseInt(evt.currentTarget.id.slice(-1));
    const domid = "score" + player;
    const afterscore = minmaxfunc(this.score[player] + delta, 0, 99);
    const beforescore = this.score[player];
    this.showScore(domid, beforescore, afterscore);
    this.score[player] = afterscore;
    this.checkCrawford(player, afterscore - beforescore); //0点/99点の上限で変化しなかったときは0
  }

  showScore(domid, beforescore, afterscore) {
    if (beforescore == afterscore) {
      this.showStaticScore(domid, afterscore);
    } else {
      this.showAnimationScore(domid, beforescore, afterscore);
    }
  }

  showAnimationScore(domid, beforescore, afterscore) {
    const divtag = document.getElementById(domid);
    divtag.innerHTML = "";

    const bfonesdigit = beforescore % 10;
    const afonesdigit = afterscore % 10;
    const bftensdigit = beforescore >= 10 ? Math.floor(beforescore / 10) : null;
    const aftensdigit = afterscore >= 10 ? Math.floor(afterscore / 10) : null;

    //桁数が変化する場合(9→10, 10→9)は専用の処理で実行
    //専用処理に分岐するのはodometerのときだけ
    //色々試行錯誤したが、結局アニメーションしないことで対応
    if (this.fonttype == "odo") {
      if (beforescore == 9 && afterscore == 10) {
        this.showStaticScore(domid, afterscore);
        //this.fontWorker.showAnimationScore9to10(divtag, bfonesdigit, afonesdigit, aftensdigit);
        return;
      }
      if (beforescore == 10 && afterscore == 9) {
        this.showStaticScore(domid, afterscore);
        //this.fontWorker.showAnimationScoreDigit10to9(divtag, bfonesdigit, afonesdigit, bftensdigit);
        return;
      }
    }

    if (afterscore >= 10) {
      const attr = {"viewBox": "0 0 50 90", "width": this.scorefontsize};
      const svgten = this.createSvgElement("svg", attr);

      //10の位をアニメーションするのは10の位が変わるときとflipのとき
      if (bftensdigit !== aftensdigit || this.fonttype == "flip") {
        this.createAnimationPolygon(svgten, bftensdigit, aftensdigit);
      } else {
        this.createStaticPolygon(svgten, aftensdigit);
      }
      divtag.appendChild(svgten);
    }

    const attr = {"viewBox": "0 0 50 90", "width": this.scorefontsize};
    const svgone = this.createSvgElement("svg", attr);

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
      const attr = {"viewBox": "0 0 50 90", "width": width};
      const innersvg = this.createSvgElement("svg", attr);
      this.createStaticPolygon(innersvg, tensdigit);
      divtag.appendChild(innersvg);
    }

    const attr = {"viewBox": "0 0 50 90", "width": width};
    const innersvg = this.createSvgElement("svg", attr);
    this.createStaticPolygon(innersvg, onesdigit);
    divtag.appendChild(innersvg);
  }

  createSvgElement(name, attr) {
    const svgEl = document.createElementNS("http://www.w3.org/2000/svg", name);
    for (const [key, value] of Object.entries(attr)) {
      svgEl.setAttribute(key, value);
    }
    return svgEl;
  }

  createStaticPolygon(svg, digit) {
    this.fontWorker.createStaticPolygon(svg, digit);
  }

  createAnimationPolygon(svg, before, after) {
    this.fontWorker.createAnimationPolygon(svg, before, after);
  }

}
