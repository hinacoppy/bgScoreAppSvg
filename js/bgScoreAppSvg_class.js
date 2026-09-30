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
    this.sgvfillcolor = "#036";
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
    return this.sgvfillcolor;
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
    const bftensdigit = beforescore >= 10 ? Math.floor(beforescore / 10) : null;
    const aftensdigit = afterscore >= 10 ? Math.floor(afterscore / 10) : null;

    //桁数が変化する場合(9→10, 10→9)は専用の処理で実行
    //専用処理に分岐するのはodometerのときだけ
    //色々試行錯誤したが、結局アニメーションしないことで対応
    if (this.fonttype == "odo") {
      if (beforescore == 9 && afterscore == 10) {
        this.showStaticScore(domid, afterscore);
        //this.fontWorker.showAnimatationScoreDigitAppearing(divtag, bfonesdigit, afonesdigit, aftensdigit);
        return;
      }
      if (beforescore == 10 && afterscore == 9) {
        this.showStaticScore(domid, afterscore);
        //this.fontWorker.showAnimatationScoreDigitDisappearing(divtag, bfonesdigit, afonesdigit, bftensdigit);
        return;
      }
    }

    if (afterscore >= 10) {
      const svgten = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svgten.setAttribute("viewBox", "0 0 50 90");
      svgten.setAttribute("width", this.scorefontsize);

      const alwaysAnimateTens = (this.fonttype == "flip");

      //10の位をアニメーションするのは10の位が変わるときとflipのとき
      if (bftensdigit !== aftensdigit || alwaysAnimateTens) {
        this.createAnimationPolygon(svgten, bftensdigit, aftensdigit);
      } else {
        this.createStaticPolygon(svgten, aftensdigit);
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
    this.fontWorker.createStaticPolygon(svg, digit);
  }

  createAnimationPolygon(svg, before, after) {
    this.fontWorker.createAnimationPolygon(svg, before, after);
  }

}
