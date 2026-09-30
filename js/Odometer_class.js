/***** Odometer (Rolling Counter) ************************************************/
"use strict";

class Odometer {
  constructor(parent) {
    this.parent = parent;
    this.animationspeed = "0.3s";
    this.digitShiftDuration = "0.15s"; //桁数変化時、1の位を中央⇔2桁時の位置へ横方向にスライドさせる時間
  }

  createStaticPolygon(svg, digit) {
    this.createStaticOdometer(svg, digit);
  }

  createAnimationPolygon(svg, before, after) {
    this.createAnimationOdometer(svg, before, after);
  }

  //機械式数取器(オドメーター)風。数字が縦にロールして次の数字に切り替わる。
  //
  createStaticOdometer(svg, digit) {
    const d = this.getOdometerGlyphPathData(digit);
    if (!d) { return; }

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    path.setAttribute("fill", this.parent.getFillColor());
    svg.appendChild(path);
  }

  //ones/tensいずれの桁も、値が変わるときは必ず隣接値(mod10で+1/-1、9→0や0→9の繰り上がり/繰り下がりを含む)
  //になるため、before/afterの前後関係だけでロール方向を判定できる。
  createAnimationOdometer(svg, before, after) {
    if (before === null) {
      //桁が新たに出現する場合(9→10など): 下から数字がせり上がってくる
      svg.appendChild(this.buildOdometerRollGroup(null, after, 0, 1));
      return;
    }

    const isIncrement = (after === (before + 1) % 10);
    if (isIncrement) {
      //増加: 現在の数字(上)から次の数字(下)へロールし、下から現れる
      svg.appendChild(this.buildOdometerRollGroup(before, after, 0, 1));
    } else {
      //減少: 前の数字(上)から現在の数字(下)へロールし、上から現れる
      svg.appendChild(this.buildOdometerRollGroup(after, before, 1, 0));
    }
  }

  //topDigit/bottomDigitの2コマ分のストリップを作り、1コマ(90unit)ぶんだけ縦にロールさせる。
  //fromRatio/toRatioは0(topDigitを表示)→1(bottomDigitを表示)の位置を表す。
  buildOdometerRollGroup(topDigit, bottomDigit, fromRatio, toRatio) {
    const svgNS = "http://www.w3.org/2000/svg";
    const group = document.createElementNS(svgNS, "g");
    group.setAttribute("transform", `translate(0,${-90 * fromRatio})`); //アニメーション開始前の基準状態

    const appendGlyph = (digit, rowIndex) => {
      if (digit === null) { return; } //桁なし(数字が存在しない状態)は何も描かない
      const d = this.getOdometerGlyphPathData(digit);
      if (!d) { return; }

      const rowGroup = document.createElementNS(svgNS, "g");
      rowGroup.setAttribute("transform", `translate(0,${90 * rowIndex})`);
      const path = document.createElementNS(svgNS, "path");
      path.setAttribute("d", d);
      path.setAttribute("fill", this.parent.getFillColor());
      rowGroup.appendChild(path);
      group.appendChild(rowGroup);
    };
    appendGlyph(topDigit, 0);
    appendGlyph(bottomDigit, 1);

    const animateTransform = document.createElementNS(svgNS, "animateTransform");
    animateTransform.setAttribute("attributeName", "transform");
    animateTransform.setAttribute("type", "translate");
    animateTransform.setAttribute("from", `0 ${-90 * fromRatio}`);
    animateTransform.setAttribute("to", `0 ${-90 * toRatio}`);
    animateTransform.setAttribute("dur", this.animationspeed);
    animateTransform.setAttribute("repeatCount", "1");
    animateTransform.setAttribute("fill", "freeze");
    group.appendChild(animateTransform);

    return group;
  }

  //グリフの実体(パスデータ)はgetOdometerGlyphPathData()経由でのみ取得する。
  //将来別のフォントに差し替える場合は、このメソッドの中身を差し替えるだけでよい。
  getOdometerGlyphPathData(digit) {
    return this.getPathDataAudiowide(digit);
  }

  //Audiowideフォント(SIL OFL 1.1, https://fonts.google.com/specimen/Audiowide)のグリフアウトラインを
  //path d属性として定義したもの。viewBox "0 0 50 90"に収まるよう正規化済み。
  //Audiowideは横に広い(正方形に近い)デザインのため、縦を高さいっぱいに合わせると大半の桁が
  //50幅を超えてしまう(特に"0"は他の桁よりさらに横長)。そのため縦横比を保たず、桁ごとに個別の
  //倍率で幅を縮めて中央寄せしてある(生成スクリプト: fonts/extract_audiowide.py、
  //幅の調整はスクリプト内のTARGET_WIDTHを変更して再生成する)。
  getPathDataAudiowide(keystr) {
    const pathlist = {
      "0": "M45 52.18Q45 57.58 44.46 62.4Q43.92 67.21 42.94 71.33Q41.96 75.44 40.61 78.69Q39.27 81.94 37.68 84.24Q36.08 86.55 34.29 87.77Q32.49 89 30.62 89H19.38Q17.49 89 15.69 87.77Q13.89 86.55 12.3 84.24Q10.7 81.94 9.36 78.69Q8.02 75.44 7.05 71.33Q6.08 67.21 5.54 62.4Q5 57.58 5 52.18V37.82Q5 29.72 6.19 22.97Q7.37 16.22 9.36 11.34Q11.35 6.46 13.95 3.73Q16.55 1 19.38 1H30.62Q32.49 1 34.29 2.23Q36.08 3.45 37.68 5.76Q39.27 8.06 40.61 11.31Q41.96 14.56 42.94 18.67Q43.92 22.79 44.46 27.6Q45 32.42 45 37.82ZM38.72 37.82Q38.72 33.09 38.05 29.23Q37.38 25.36 36.26 22.6Q35.15 19.84 33.69 18.37Q32.23 16.89 30.62 16.96H19.38Q17.82 16.89 16.35 18.34Q14.87 19.78 13.74 22.51Q12.6 25.24 11.91 29.14Q11.23 33.03 11.23 37.82V52.18Q11.23 56.97 11.9 60.83Q12.57 64.7 13.7 67.43Q14.83 70.16 16.3 71.63Q17.77 73.11 19.38 73.04H30.62Q32.47 73.04 33.96 71.48Q35.46 69.91 36.52 67.15Q37.57 64.39 38.15 60.56Q38.72 56.72 38.72 52.18ZM36.01 26.16Q36.37 27.51 36.49 29.08Q36.61 30.64 36.49 32.14Q36.37 33.65 36.02 34.97Q35.68 36.29 35.13 37.21L18.3 65.99Q17.89 66.79 17.46 67.09Q17.03 67.4 16.58 67.4Q15.81 67.4 15.11 66.48Q14.42 65.56 13.99 63.84Q13.63 62.49 13.51 60.92Q13.39 59.36 13.5 57.86Q13.6 56.35 13.94 55.03Q14.28 53.71 14.83 52.79L31.7 24.01Q32.23 23.09 32.84 22.79Q33.45 22.48 34.04 22.79Q34.62 23.09 35.14 23.95Q35.65 24.81 36.01 26.16Z",
      "1": "M33 89H24.58V16.96H17V1H33Z",
      "2": "M44 89H6V59.48Q6 57.21 6.25 54.67Q6.49 52.12 7.01 49.6Q7.53 47.09 8.35 44.82Q9.17 42.55 10.34 40.8Q11.51 39.05 13.04 38Q14.57 36.96 16.5 36.96H33.41Q34.94 36.96 35.68 35.33Q36.41 33.71 36.41 30.58V23.52Q36.41 20.27 35.66 18.61Q34.91 16.96 33.47 16.96H9.38V1H33.47Q35.37 1 36.9 2.04Q38.43 3.09 39.6 4.84Q40.77 6.58 41.61 8.85Q42.44 11.13 42.98 13.61Q43.51 16.1 43.75 18.64Q44 21.19 44 23.4V30.58Q44 36.78 42.95 41.04Q41.89 45.31 40.31 47.98Q38.72 50.65 36.89 51.84Q35.06 53.04 33.47 53.04H16.5Q15.58 53.04 15.03 53.59Q14.48 54.14 14.18 55.06Q13.88 55.98 13.73 57.15Q13.59 58.32 13.5 59.48V73.04H44Z",
      "3": "M43 66.6Q43 72.8 41.9 77.06Q40.81 81.33 39.17 84Q37.54 86.67 35.61 87.83Q33.69 89 32.04 89H7V73.04H32.04Q33.63 73.04 34.4 71.39Q35.16 69.73 35.16 66.6V53.04H7V36.96H35.16V23.52Q35.16 16.96 32.04 16.96H7V1H32.04Q34.05 1 35.64 2.04Q37.24 3.09 38.45 4.84Q39.67 6.58 40.54 8.85Q41.41 11.13 41.95 13.61Q42.49 16.1 42.74 18.64Q43 21.19 43 23.4Z",
      "4": "M44 89H36.44V53.04H9.78Q8.97 53.04 8.28 52.39Q7.59 51.75 7.08 50.68Q6.58 49.6 6.29 48.13Q6 46.66 6 45V1H13.5V36.96H36.44V1H44Z",
      "5": "M44 66.6Q44 68.87 43.75 71.39Q43.51 73.9 42.98 76.39Q42.44 78.87 41.62 81.15Q40.8 83.42 39.63 85.16Q38.46 86.91 36.93 87.96Q35.4 89 33.5 89H6V73.04H33.5Q34.91 73.04 35.68 71.2Q36.44 69.36 36.44 66.6V59.48Q36.44 56.35 35.69 54.7Q34.94 53.04 33.44 53.04H16.53Q13.62 53.04 11.61 50.8Q9.61 48.56 8.37 45.18Q7.13 41.81 6.56 37.88Q6 33.95 6 30.58V1H40.57V16.96H13.5V30.58Q13.5 33.77 14.28 35.37Q15.06 36.96 16.53 36.96H33.5Q35.06 36.96 36.9 38.16Q38.75 39.35 40.32 42.02Q41.89 44.69 42.95 48.99Q44 53.28 44 59.48Z",
      "6": "M13.5 36.96H33.47Q35.06 36.96 36.89 38.16Q38.72 39.35 40.31 42.02Q41.89 44.69 42.95 48.99Q44 53.28 44 59.48V66.6Q44 68.87 43.75 71.39Q43.51 73.9 42.98 76.39Q42.44 78.87 41.62 81.15Q40.8 83.42 39.63 85.16Q38.46 86.91 36.93 87.96Q35.4 89 33.47 89H19.88Q18.49 89 16.92 88.32Q15.35 87.65 13.82 86.15Q12.29 84.64 10.86 82.34Q9.43 80.04 8.37 76.76Q7.3 73.47 6.65 69.18Q6 64.88 6 59.48V30.58Q6 25.18 6.65 20.88Q7.3 16.59 8.37 13.3Q9.43 10.02 10.86 7.69Q12.29 5.36 13.82 3.85Q15.35 2.35 16.92 1.68Q18.49 1 19.88 1H38.69V16.96H19.88Q18.44 17.2 17.27 18.24Q16.1 19.29 15.26 21.01Q14.43 22.72 13.96 25.15Q13.5 27.57 13.5 30.58ZM13.5 53.04V59.48Q13.5 62.61 14.01 65.1Q14.51 67.58 15.38 69.36Q16.24 71.14 17.41 72.09Q18.58 73.04 19.94 73.04H33.47Q34.91 73.04 35.68 71.2Q36.44 69.36 36.44 66.6V59.48Q36.44 56.35 35.69 54.7Q34.94 53.04 33.41 53.04Z",
      "7": "M41.52 5.05Q42 6.95 42 9.07Q42 11.19 41.52 13.09L21.07 89H12.54L31.88 16.96H8V1H38.31Q39.31 1 40.17 2.07Q41.04 3.15 41.52 5.05Z",
      "8": "M44 66.6Q44 68.87 43.75 71.39Q43.51 73.9 42.98 76.39Q42.44 78.87 41.61 81.15Q40.77 83.42 39.6 85.16Q38.43 86.91 36.9 87.96Q35.37 89 33.47 89H16.5Q14.94 89 13.1 87.83Q11.25 86.67 9.68 84Q8.11 81.33 7.05 77.06Q6 72.8 6 66.6V59.48Q6 57.15 6.25 54.57Q6.49 52 7.02 49.48Q7.56 46.96 8.39 44.69Q9.23 42.42 10.41 40.77Q9.9 38.19 9.64 35.55Q9.38 32.91 9.38 30.58V23.4Q9.38 17.26 10.43 12.97Q11.48 8.67 13.05 6.03Q14.63 3.39 16.47 2.2Q18.32 1 19.88 1H30.03Q31.97 1 33.51 2.04Q35.06 3.09 36.22 4.84Q37.39 6.58 38.21 8.85Q39.04 11.13 39.56 13.61Q40.08 16.1 40.32 18.64Q40.57 21.19 40.57 23.4V30.58Q40.57 36.59 39.56 41.01Q40.48 42.3 41.29 44.05Q42.1 45.8 42.7 48.07Q43.31 50.34 43.65 53.19Q44 56.05 44 59.48ZM33.06 23.52Q33.06 20.27 32.29 18.61Q31.51 16.96 30.03 16.96H19.94Q18.41 16.96 17.67 18.61Q16.94 20.27 16.94 23.4V30.58Q16.94 33.77 17.7 35.37Q18.46 36.96 19.88 36.96H30.03Q31.56 36.96 32.31 35.33Q33.06 33.71 33.06 30.58ZM36.41 59.48Q36.41 56.41 35.62 54.73Q34.82 53.04 33.47 53.04H16.5Q15.12 53.04 14.31 54.88Q13.5 56.72 13.5 59.48V66.6Q13.5 69.55 14.35 71.3Q15.2 73.04 16.5 73.04H33.47Q34.91 73.04 35.66 71.2Q36.41 69.36 36.41 66.6Z",
      "9": "M6 30.58V23.4Q6 21.19 6.25 18.64Q6.49 16.1 7.01 13.61Q7.53 11.13 8.37 8.85Q9.2 6.58 10.37 4.84Q11.54 3.09 13.07 2.04Q14.6 1 16.53 1H30.06Q31.45 1 33.04 1.68Q34.62 2.35 36.17 3.85Q37.71 5.36 39.12 7.69Q40.54 10.02 41.62 13.3Q42.7 16.59 43.35 20.88Q44 25.18 44 30.58V59.48Q44 64.88 43.35 69.18Q42.7 73.47 41.62 76.76Q40.54 80.04 39.12 82.34Q37.71 84.64 36.17 86.15Q34.62 87.65 33.04 88.32Q31.45 89 30.06 89H11.34V73.04H30.06Q31.48 72.8 32.65 71.82Q33.81 70.84 34.67 69.15Q35.52 67.46 35.98 65.04Q36.44 62.61 36.44 59.48V53.04H16.53Q15.46 53.04 14.28 52.52Q13.1 52 11.93 50.86Q10.76 49.73 9.69 47.98Q8.63 46.23 7.8 43.71Q6.98 41.2 6.49 37.94Q6 34.69 6 30.58ZM36.44 30.58Q36.44 27.45 35.95 24.93Q35.46 22.42 34.61 20.64Q33.76 18.86 32.59 17.91Q31.42 16.96 30.06 16.96H16.53Q15.15 16.96 14.32 18.8Q13.5 20.64 13.5 23.4V30.58Q13.5 33.71 14.28 35.33Q15.06 36.96 16.59 36.96H36.44Z",
      "$": "M44 45Q44 50.71 43.29 55.03Q42.58 59.36 41.41 62.58Q40.23 65.8 38.73 67.95Q37.23 70.1 35.65 71.39Q34.07 72.68 32.54 73.23Q31 73.78 29.74 73.78V89H20.26V73.78H10.74V59.48H29.66Q29.94 59.48 30.49 59.24Q31.04 58.99 31.68 58.22Q32.33 57.46 32.94 56.02Q33.55 54.57 33.95 52.18H10.74Q9.77 52.18 8.9 51.63Q8.03 51.08 7.4 50.12Q6.77 49.17 6.38 47.85Q6 46.53 6 45Q6 39.72 6.61 35.7Q7.22 31.68 8.19 28.71Q9.16 25.73 10.33 23.71Q11.51 21.68 12.64 20.39Q13.94 18.86 15.22 18.03Q16.49 17.2 17.53 16.8Q18.56 16.4 19.29 16.31Q20.02 16.22 20.26 16.22V1H29.74V16.22H39.26V30.58H20.34Q20.1 30.58 19.55 30.82Q19 31.07 18.36 31.81Q17.71 32.54 17.08 33.98Q16.45 35.43 16.05 37.82H39.26Q40.27 37.82 41.12 38.37Q41.97 38.92 42.62 39.91Q43.27 40.89 43.64 42.21Q44 43.53 44 45Z",
    };
    return pathlist[keystr.toString()];
  }

  //svg(ルート要素)自身にtranslateのanimateTransformを追加する。fromPx→toPxはCSS px単位。
  //(このアプリの他のアニメーションはviewBox内の要素にSMILで座標をアニメーションさせているが、
  //ルートのsvg要素自体を動かす場合はCSSのtransformではなくSVGのtransform属性として与える必要がある。
  //こうすることでフォント側のアニメーションが使うviewBox内のクリップ領域とは独立して動かせるため、
  //数字が途中で欠けて見えることもない)
  addSvgShiftAnimation(svg, fromPx, toPx, dur, onComplete) {
    const svgNS = "http://www.w3.org/2000/svg";
    svg.setAttribute("transform", `translate(${fromPx},0)`);

    const animateTransform = document.createElementNS(svgNS, "animateTransform");
    animateTransform.setAttribute("attributeName", "transform");
    animateTransform.setAttribute("type", "translate");
    animateTransform.setAttribute("from", `${fromPx} 0`);
    animateTransform.setAttribute("to", `${toPx} 0`);
    //begin="indefinite" + beginElement()で明示的に開始する。
    //(挿入から時間が経ったsvgに後から追加するケースがあり、暗黙のbegin="0s"だと
    //SVGドキュメントのタイムライン基準で解釈され、挿入直後扱いにならないことがあるため)
    animateTransform.setAttribute("begin", "indefinite");
    animateTransform.setAttribute("dur", dur);
    animateTransform.setAttribute("repeatCount", "1");
    animateTransform.setAttribute("fill", "freeze");
    if (onComplete) {
      animateTransform.addEventListener("endEvent", () => {
        //fill="freeze"されたSMILアニメーションは終了後も値を上書きし続け、setAttributeで書き換えても
        //反映されない。ここではアニメーション要素自体を取り除いて上書きを解除する
        //(その結果、svgのtransformは基準値であるtranslate(fromPx,0)に戻る。呼び出し側は、
        //補正が不要になった時点のfromPxが0になるようfromPx/toPxを選ぶこと)
        animateTransform.remove();
        onComplete();
      }, { once: true });
    }
    svg.appendChild(animateTransform);
    animateTransform.beginElement();
  }

  //桁が新たに出現する場合(9→10など)専用のアニメーション。
  //1の位は「単独中央表示だった位置」から「2桁表示時の位置」へまず横方向にスライドし、
  //スライドが終わってからフォント本来の桁アニメーション(モーフ/ロール等)を開始する。
  //横方向のスライドとフォント本来のアニメーションを同時に動かすと、並進ベースのアニメーション
  //(Odometerのロールや、FlipFontの拡大縮小)では斜めに動いて見えてしまうため、順番に再生する。
  showAnimatationScoreDigitAppearing(divtag, bfonesdigit, afonesdigit, aftensdigit) {
    divtag.innerHTML = "";
    const shiftDurMs = parseFloat(this.digitShiftDuration) * 1000;

    const svgten = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgten.setAttribute("viewBox", "0 0 50 90");
    svgten.setAttribute("width", this.parent.scorefontsize);
    this.parent.createAnimationPolygon(svgten, null, aftensdigit);
    divtag.appendChild(svgten);

    const svgone = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgone.setAttribute("viewBox", "0 0 50 90");
    svgone.setAttribute("width", this.parent.scorefontsize);
    this.parent.createStaticPolygon(svgone, bfonesdigit); //スライドが終わるまでは元の数字を静止表示しておく
    divtag.appendChild(svgone);

    //挿入後の実測幅の半分だけ左にずらした位置(=単独中央表示時の位置)から、
    //2桁表示時の本来の位置(ズレ0)へスライドさせる
    const halfWidthPx = svgone.getBoundingClientRect().width / 2;
    this.addSvgShiftAnimation(svgone, -halfWidthPx, 0, this.digitShiftDuration);

    setTimeout(() => {
      svgone.innerHTML = "";
      svgone.setAttribute("transform", "translate(0,0)");
      this.parent.createAnimationPolygon(svgone, bfonesdigit, afonesdigit);
      svgone.offsetHeight;
    }, shiftDurMs);

    divtag.offsetHeight; //ブラウザのレイアウトエンジンにレンダリング確定を強制
  }

  //桁が消える場合(10→9など)専用のアニメーション。
  //1の位はまず現在の2桁表示時の位置のままフォント本来のアニメーションを再生し、
  //それが終わってから10の位を取り除きつつ、1の位を単独中央表示の位置へ横方向にスライドさせる。
  showAnimatationScoreDigitDisappearing(divtag, bfonesdigit, afonesdigit, bftensdigit) {
    divtag.innerHTML = "";
    const rollDurMs = parseFloat(this.animationspeed) * 1000;

    const svgten = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgten.setAttribute("viewBox", "0 0 50 90");
    svgten.setAttribute("width", this.parent.scorefontsize);
    this.parent.createStaticPolygon(svgten, bftensdigit); //消える10の位はアニメーションさせず元の見た目のまま表示しておく
    divtag.appendChild(svgten);

    const svgone = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgone.setAttribute("viewBox", "0 0 50 90");
    svgone.setAttribute("width", this.parent.scorefontsize);
    this.parent.createAnimationPolygon(svgone, bfonesdigit, afonesdigit);
    divtag.appendChild(svgone);

    //挿入直後(このタイミング)で幅を実測しておく。setTimeoutの中で後から実測すると、
    //直前に別の桁アニメーションを割り込みキャンセルした直後などにレイアウトが未確定のままの値を
    //読んでしまうことがあるため
    const halfWidthPx = svgone.getBoundingClientRect().width / 2;

    setTimeout(() => {
      //2桁表示時の位置(ズレ0)から、実測幅の半分だけ左にずらした位置(=単独中央表示時の位置)へスライドさせる
      this.addSvgShiftAnimation(svgone, 0, -halfWidthPx, this.digitShiftDuration, () => {
        //10の位を取り除くのと同時に、1の位のスライド効果を解除する。取り除いた瞬間、
        //1の位は単独表示として自然に中央へ再配置されるため、この2つを同時に行うことで見た目の位置がズレない
        svgten.remove();
      });
    }, rollDurMs);

    divtag.offsetHeight; //ブラウザのレイアウトエンジンにレンダリング確定を強制
  }

}
