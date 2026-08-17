/* jQuery imo RichFile  (C) 2015 imo */

//無名関数でプラグイン領域を定義(変数などの競合防止)
(function ($) {
  //関数を定義してプラグインを割り当て
  $.fn.imorichfile = function (options) {
    //デフォルト設定
    var defaults = {
      accept: "image/jpeg,image/png,image/webp", //fileコントロールのaccept
      width: null, //引数で必須指定
      height: null, //引数で必須指定
      marginUpDown: 50,
      marginRightLeft: 50,
    };

    //メソッドチェーン対応でthisを返す
    //(ソースの頭で戻り値が分かるため、この書き方が推奨されている)
    return this.each(function () {
      //デフォルト設定と引数の設定をマージして、設定を作成
      //			var setting = $.extend(defaults, options);
      var setting = $.extend(true, defaults, options); //第1引数trueでディープコピー

      //エリアのIDの末尾「_area」を除去してベースとなるIDを作成
      var id = $(this)
        .attr("id")
        .replace(/_area$/, "");
      setting.id = id; //設定に保存(内部関数でも参照するため)

      //画像の縦横比を算出
      setting.aspectRatio = setting.width / setting.height;

      //エリアにcssのclassを設定
      $(this).addClass("imorichfile");

      //エリアの幅を算出(画像の横幅＋左右のマージン)
      var areaWidth = setting.width + setting.marginRightLeft * 2;
      //最低300pxとする
      if (areaWidth < 300) {
        areaWidth = 300;
        //マージンを広げる
        setting.marginRightLeft = Math.floor((300 - setting.width) / 2);
      }
      //エリアの高さを算出(画像の高さ＋上下のマージン)
      var areaHeight = setting.height + setting.marginUpDown * 2;

      //HTMLの要素を出力
      $(this).append(
        '\
				<input type="file" id="' +
          id +
          '_file" accept="' +
          setting.accept +
          '">\
				<div>\
					<div id="' +
          id +
          '_select" class="imorichfile-select">\
						<div>\
						ここを<span class="f_c_red f_em">クリックして画像ファイルを選択</span>してください。<br>\
						<span class="f_c_red f_em">画像ファイルをドラッグ＆ドロップ</span>することもできます。<br>\
						</div>\
						<div class="mt10">\
						<span class="imorichfile-red">*</span> <span class="imorichfile-strong">JPEG / PNG / WebP</span>ファイルが使用できます。<br>\
<span class="imorichfile-red">*</span> 画像サイズは、<span class="imorichfile-strong">200 × 200ピクセル以上</span>を推奨します。\
						</div>\
					</div>\
				</div>\
				<div id="' +
          id +
          '_edit_area" class="imorichfile-edit-area">\
					<div class="imorichfile-canvas-area" id="' +
          id +
          '_canvas_area">\
						<canvas class="imorichfile-canvas-image" id="' +
          id +
          '_image">このページを正しく表示するにはHTML5のcanvas要素をサポートしたブラウザが必要です。</canvas>\
						<canvas class="imorichfile-canvas-mask" id="' +
          id +
          '_mask"></canvas>\
					</div>\
					<div class="btn_imorichfile_wrap">\
						<input type="button" class="imorichfile-zoom-out" id="' +
          id +
          '_zoom_out" value="縮小">\
						<input type="button" class="imorichfile-zoom-in" id="' +
          id +
          '_zoom_in" value="拡大">\
						<input type="button" class="imorichfile-reset" id="' +
          id +
          '_reset" value="元に戻す">\
					</div>\
				</div>\
				<input type="hidden" id="' +
          id +
          '" name="' +
          id +
          '" disabled>\
			',
      );

      //参照を変数化
      var select = $("#" + id + "_select"); //選択エリア
      var canvasArea = $("#" + id + "_canvas_area"); //canvasエリア
      var file = $("#" + id + "_file"); //fileコントロール
      var canvas = $("#" + id + "_image"); //画像のcanvas
      var canvasMask = $("#" + id + "_mask"); //マスクのcanvas

      //選択エリアの幅を設定
      select.css("width", "100%");
      //canvasエリアの高さ、幅を設定
      canvasArea.css("width", areaWidth);
      canvasArea.css("height", areaHeight);
      //編集エリアの幅を設定
      $("#" + id + "_edit_area").css("width", areaWidth);

      //各canvasの高さ、幅を設定
      //(親エリアのborder幅(1px + 1px = 2px)だけ差し引く)
      canvas.attr("width", areaWidth - 2);
      canvas.attr("height", areaHeight - 2);
      canvasMask.attr("width", areaWidth - 2);
      canvasMask.attr("height", areaHeight - 2);

      //選択エリアのクリックイベント
      select.on("click", function (event) {
        //fileコントロールのクリックイベントをキックしファイル選択させる
        file.click();

        return true;
      });

      //エリアにドラッグ要素が重なったときのイベント
      //			select.on('dragover',function(event){
      $(this).on("dragover", function (event) {
        event.preventDefault(); //当該要素のその他のイベントをキャンセル
        event.stopPropagation(); //親要素へのバブリングの伝播をキャンセル

        //ドロップしたファイルがコピーされることをユーザへ表す
        //プラットフォーム(ブラウザ)依存だが、概ねマウスアイコンが変更される
        //(何もしないと移動アイコンになってしまうので、ユーザに分かりづらい)
        event.originalEvent.dataTransfer.dropEffect = "copy";

        return true;
      });

      //エリアのドロップイベント
      $(this).on("drop", function (event) {
        event.preventDefault(); //当該要素のその他のイベントをキャンセル
        event.stopPropagation(); //親要素へのバブリングの伝播をキャンセル

        //ファイル情報の取得、展開等の共通処理
        load($(this).closest(".imorichfile"), setting, event.originalEvent.dataTransfer.files[0]);

        return true;
      });

      //fileコントロールの変更イベント
      file.on("change", function (event) {
        //ファイルが1つ以上ある場合
        if (event.target.files.length >= 1) {
          //ファイル情報の取得、展開等の共通処理
          load($(this).closest(".imorichfile"), setting, event.target.files[0]);
        }

        return true;
      });

      //初期処理で読み込み画像が指定されている場合
      if (typeof $(this).attr("data-src") !== "undefined") {
        //ファイル情報の取得、展開等の共通処理
        load($(this).closest(".imorichfile"), setting, null, $(this).attr("data-src"));
      }
    });
  };

  //画像を描画
  function drawImage(context, image, imageObject) {
    context.drawImage(
      image,
      imageObject.x,
      imageObject.y,
      imageObject.width * imageObject.scale,
      imageObject.height * imageObject.scale,
    );
  }

  //拡大率変更の共通処理
  function zoom(scale, context, canvas, image, imageObject, setting) {
    //画像canvasのクリア
    context.clearRect(0, 0, canvas.width(), canvas.height());

    //縮小の場合
    if (scale < 1) {
      //縮小後のサイズを算出
      var afterWidth = imageObject.width * imageObject.scale * scale;
      var afterHeight = imageObject.height * imageObject.scale * scale;
      var scaleWidth = null;
      var scaleHeight = null;

      //指定幅よりも小さくなってしまう場合
      if (setting.width > afterWidth) {
        //指定幅となる拡大率とする
        scaleWidth = setting.width / imageObject.width / imageObject.scale;
        scale = scaleWidth;
      }
      //指定高さよりも小さくなってしまう場合
      if (setting.height > afterHeight) {
        //指定高さとなる拡大率とする
        scaleHeight = setting.height / imageObject.height / imageObject.scale;
        scale = scaleHeight;

        //幅と高さで拡大率が大きい方に合わせる
        if (scaleWidth !== null && scaleWidth > scaleHeight) {
          scale = scaleWidth;
        }
      }
    }

    /*
★
これだと画像の中心から計算されてしまう
クリップ領域の中心から計算されるように変更する
その方がより視覚的に拡大したいところが拡大されたように見えるはず
*/
    //拡大率変更時に画像が中央を中心に拡大/縮小されるように座標を調整
    //拡大率変更後の幅の差を算出
    var diffWidth = imageObject.width * imageObject.scale * scale - imageObject.width * imageObject.scale;
    //幅の差の半分だけX座標をずらす
    imageObject.x -= diffWidth / 2;
    //拡大率変更後の高さの差を算出
    var diffHeight = imageObject.height * imageObject.scale * scale - imageObject.height * imageObject.scale;
    //幅の差の半分だけY座標をずらす
    imageObject.y -= diffHeight / 2;

    //画像の表示開始位置 X座標がクリップ領域の中になってしまう場合
    if (setting.marginRightLeft < imageObject.x) {
      //中に入らないよう、クリップ領域と合わせる
      imageObject.x = setting.marginRightLeft;
    }
    if (setting.marginUpDown < imageObject.y) {
      imageObject.y = setting.marginUpDown;
    }

    //クリップ領域の右側の座標と、画像をそのまま表示した場合の右側の座標の差を算出
    var diffX =
      setting.marginRightLeft + setting.width - (imageObject.x + imageObject.width * imageObject.scale * scale);
    //画像の右側のX座標がクリップ領域の中になってしまう場合
    if (diffX > 0) {
      //中に入らないよう、クリップ領域と合わせる
      imageObject.x += diffX;
    }

    //クリップ領域の下側の座標と、画像をそのまま表示した場合の下側の座標の差を算出
    var diffY =
      setting.marginUpDown + setting.height - (imageObject.y + imageObject.height * imageObject.scale * scale);
    //画像の下側のY座標がクリップ領域の中になってしまう場合
    if (diffY > 0) {
      //中に入らないよう、クリップ領域と合わせる
      imageObject.y += diffY;
    }

    //拡大率を現在のn倍にして設定
    imageObject.scale *= scale;

    //画像を描画
    drawImage(context, image, imageObject);
  }

  //ファイル情報の取得、展開等の共通処理
  function load(area, setting, file, imageUrl) {
    //ローカルファイルが指定されている場合
    if (file !== null) {
      //ファイル形式チェック(JPEG)
      // ファイル形式チェック
      var allowedTypes = ["image/jpeg", "image/png", "image/webp"];

      if (!allowedTypes.includes(file.type)) {
        alert("JPEG、PNG、WebPファイルを指定してください。");
        return;
      }
    }

    //編集エリアが非表示(初期状態)の場合
    if (!$("#" + setting.id + "_edit_area").is(":visible")) {
      //編集エリアを表示
      $("#" + setting.id + "_edit_area").slideDown();

      var canvasMask = $("#" + setting.id + "_mask"); //マスクのcanvas
      var contextMask = canvasMask[0].getContext("2d"); //canvasのマスクのコンテキスト
      //マスクの設定
      //透明な白い矩形を描画
      contextMask.globalAlpha = 0.6;
      contextMask.fillStyle = "#ffffff";
      contextMask.fillRect(0, 0, canvasMask.width(), canvasMask.height());
      //マージンを考慮して画像サイズに中央を切り抜き
      contextMask.clearRect(setting.marginRightLeft - 1, setting.marginUpDown - 1, setting.width, setting.height);
      //画像サイズに矩形を描画
      contextMask.globalAlpha = 1;
      contextMask.lineWidth = 1;
      contextMask.lineWidth = 2;
      contextMask.strokeStyle = "#000000";
      contextMask.setLineDash([3, 3]);
      contextMask.strokeRect(
        setting.marginRightLeft - 1,
        setting.marginUpDown - 1, //矩形の破線の幅を差し引く
        setting.width + 1,
        setting.height + 1,
      ); //矩形の破線の幅を加算
    }

    var image = new Image();
    image.crossOrigin = "Anonymous"; //サーバの画像を編集可能にする設定
    var reader = new FileReader();

    //参照を変数化
    var canvas = $("#" + setting.id + "_image"); //canvasの画像
    var canvasMask = $("#" + setting.id + "_mask"); //canvasのマスク
    var context = canvas[0].getContext("2d"); //canvasの画像のコンテキスト

    var imageObject = {
      x: 0, //表示座標X
      y: 0, //表示座標Y
      dragX: 0, //ドラッグ中の表示座標X
      dragY: 0, //ドラッグ中の表示座標Y
      width: 0, //画像の幅
      height: 0, //画像の高さ
      scale: 1, //拡大率(1=100%)
    };
    var imageObjectBackup;

    // 画像がloadされた後に、canvasに描画する
    image.onload = function () {
      //画像の縦横サイズを取得
      imageObject.width = image.naturalWidth;
      imageObject.height = image.naturalHeight;

      //画像canvasのクリア
      context.clearRect(0, 0, canvas.width(), canvas.height());

      //読み込んだ画像の縦横サイズが一致する場合
      if (imageObject.width == setting.width && imageObject.height == setting.height) {
        //なにもしない
      } else {
        //読み込んだ画像の縦横比を算出
        var aspectRatio = imageObject.width / imageObject.height;
        //縦長の場合は、横幅に合わせて調整
        if (setting.aspectRatio > aspectRatio) {
          //拡大率を算出
          imageObject.scale = setting.width / imageObject.width;
          //横長の場合は、高さに合わせて調整
        } else {
          //拡大率を算出
          imageObject.scale = setting.height / imageObject.height;
        }
      }
      //座標を設定
      imageObject.x = setting.marginRightLeft;
      imageObject.y = setting.marginUpDown;
      //画像を描画
      drawImage(context, image, imageObject);

      //現在の状態を保存
      context.save();
      imageObjectBackup = $.extend(true, {}, imageObject); //第1引数trueでディープコピー
    };

    if (file === null) {
      //画像のURLをソースに設定
      image.src = imageUrl;
    } else {
      //File APIを使用してファイルを読み込み
      reader.onload = function (event) {
        //画像のURLをソースに設定
        image.src = event.target.result;
      };

      //ファイル読み込み
      reader.readAsDataURL(file);
    }

    var drag = false; //ドラッグ状態
    var startX = -1; //ドラッグ開始位置 X座標
    var startY = -1; //ドラッグ開始位置 Y座標

    //マスクcanvasのマウスオーバーイベント
    canvasMask.on("mouseover", function (event) {
      //マウスポインタの文書全体での座標(pageX/Y)からcanvasの座標を差し引いて、
      //canvas内での座標を取得
      var x = event.pageX - canvas.offset().left;
      var y = event.pageY - canvas.offset().top;
    });

    //マスクcanvasのマウス押下イベント
    canvasMask.on("mousedown", function (event) {
      //マウスポインタの文書全体での座標(pageX/Y)からcanvasの座標を差し引いて、
      //canvas内での座標を取得
      var x = event.pageX - canvas.offset().left;
      var y = event.pageY - canvas.offset().top;
      //マウスポインタの座標が画像表示領域内に収まっている場合
      if (
        x > setting.marginRightLeft &&
        x < setting.marginRightLeft + setting.width &&
        y > setting.marginUpDown &&
        y < setting.marginUpDown + setting.height
      ) {
        //ドラッグ状態をオン
        drag = true;
        //ドラッグを始めたときのマウスの座標
        startX = x;
        startY = y;
      }
    });

    //マスクcanvasのマウス移動イベント
    canvasMask.on("mousemove", function (event) {
      //マウスポインタの文書全体での座標(pageX/Y)からcanvasの座標を差し引いて、
      //canvas内での座標を取得
      var x = event.pageX - canvas.offset().left;
      var y = event.pageY - canvas.offset().top;

      //マウスポインタの座標が画像表示領域内に収まっている場合
      if (
        x > setting.marginRightLeft &&
        x < setting.marginRightLeft + setting.width &&
        y > setting.marginUpDown &&
        y < setting.marginUpDown + setting.height
      ) {
        //マウスカーソルを変更
        $(this).css("cursor", "move");
      } else {
        //マウスカーソルを変更
        $(this).css("cursor", "auto");
      }

      //ドラッグ中の場合
      if (drag) {
        //画像がない領域が発生しないように、座標を計算して調整
        var drawX = imageObject.x + x - startX; //画像の表示開始位置 X座標
        var drawY = imageObject.y + y - startY; //画像の表示開始位置 Y座標

        //画像の表示開始位置 X座標がクリップ領域の中になってしまう場合
        if (setting.marginRightLeft < drawX) {
          //中に入らないよう、クリップ領域と合わせる
          drawX = setting.marginRightLeft;
        }
        if (setting.marginUpDown < drawY) {
          drawY = setting.marginUpDown;
        }

        //クリップ領域の右側の座標と、画像をそのまま表示した場合の右側の座標の差を算出
        var diffX = setting.marginRightLeft + setting.width - (drawX + imageObject.width * imageObject.scale);
        //画像の右側のX座標がクリップ領域の中になってしまう場合
        if (diffX > 0) {
          //中に入らないよう、クリップ領域と合わせる
          drawX += diffX;
        }

        //クリップ領域の下側の座標と、画像をそのまま表示した場合の下側の座標の差を算出
        var diffY = setting.marginUpDown + setting.height - (drawY + imageObject.height * imageObject.scale);
        //画像の下側のY座標がクリップ領域の中になってしまう場合
        if (diffY > 0) {
          //中に入らないよう、クリップ領域と合わせる
          drawY += diffY;
        }

        //画像canvasのクリア
        context.clearRect(0, 0, canvas.width(), canvas.height());

        //画像の座標を変更して表示
        context.drawImage(
          image,
          drawX,
          drawY,
          imageObject.width * imageObject.scale,
          imageObject.height * imageObject.scale,
        );

        //ドラッグ中の座標を保存
        imageObject.dragX = drawX;
        imageObject.dragY = drawY;
      }
    });

    //マウス移動終了の共通処理
    function mouseMoveEnd(event) {
      //ドラッグ中の場合
      if (drag) {
        //ドラッグ中の座標を画像の表示座標に設定
        imageObject.x = imageObject.dragX;
        imageObject.y = imageObject.dragY;

        //ドラッグ状態をオフ
        drag = false;
      }
    }

    //マスクcanvasのマウスを離したときのイベント
    canvasMask.on("mouseup", function (event) {
      //マウス移動終了の共通処理
      mouseMoveEnd(event);
    });

    //マスクcanvasのマウスが外れたときのイベント
    canvasMask.on("mouseleave", function () {
      //マウス移動終了の共通処理
      mouseMoveEnd(event);
    });

    //イベント用の名前空間を作成
    var nameSpace = ".imorichfile" + setting.id;

    //拡大ボタン押下イベント
    var zoomInButton = $("#" + setting.id + "_zoom_in");
    zoomInButton.off("click" + nameSpace); //loadの度にイベントが重複しないように名前空間を指定して削除
    zoomInButton.on("click" + nameSpace, function (event) {
      //拡大率変更の共通処理
      zoom(1.05, context, canvas, image, imageObject, setting);

      return true;
    });

    //縮小ボタン押下イベント
    var zoomOutButton = $("#" + setting.id + "_zoom_out");
    zoomOutButton.off("click" + nameSpace); //loadの度にイベントが重複しないように名前空間を指定して削除
    zoomOutButton.on("click" + nameSpace, function (event) {
      //拡大率変更の共通処理
      zoom(0.95, context, canvas, image, imageObject, setting);

      return true;
    });

    //元に戻すボタン押下イベント
    var resetButton = $("#" + setting.id + "_reset");
    resetButton.off("click" + nameSpace); //loadの度にイベントが重複しないように名前空間を指定して削除
    resetButton.on("click" + nameSpace, function (event) {
      //最初の状態に戻す
      context.restore();
      //再度、現在の状態を保存
      context.save();

      //画像canvasのクリア
      context.clearRect(0, 0, canvas.width(), canvas.height());

      //バックアップから復元
      imageObject = $.extend(true, {}, imageObjectBackup); //第1引数trueでディープコピー

      //画像を描画
      drawImage(context, image, imageObject);
    });

    //フォームの送信イベント
    var form = $(area).closest("form");
    form.off("submit" + nameSpace); //loadの度にイベントが重複しないように名前空間を指定して削除
    form.on("submit" + nameSpace, function () {
      //ローカルファイルが指定されていない(サーバの画像を表示)、
      //かつ、拡大率が変更されていない場合
      if (file === null && imageObject.scale == 1) {
        //なにもしない
        //ローカルファイルが指定されている場合
        //または、サーバの画像を編集した場合
      } else {
        //送信用のhiddenコントロールを有効にする
        $("#" + setting.id).prop("disabled", false);

        var clipX = 0; //元画像のクリップする座標X
        var clipY = 0; //元画像のクリップする座標Y

        //編集のcanvas上での画像の表示座標が正数の場合
        //(編集のcanvas内に画像の表示座標がある場合)
        if (imageObject.x >= 0) {
          //上のマージンから画像の表示座標を差し引いて、元画像のクリップ座標Xを算出
          clipX = setting.marginRightLeft - imageObject.x;
          //編集のcanvas上での画像の表示座標が負数の場合
          //(編集のcanvasの外に画像の表示座標がある場合)
        } else {
          //画像の表示座標(マイナス値)を正数にして、上のマージンを加算して、元画像のクリップ座標Xを算出
          clipX = imageObject.x * -1 + setting.marginRightLeft;
        }

        if (imageObject.y >= 0) {
          clipY = setting.marginUpDown - imageObject.y;
        } else {
          clipY = imageObject.y * -1 + setting.marginUpDown;
        }

        //拡大率を考慮した元画像のクリップ座標を算出
        clipX /= imageObject.scale;
        clipY /= imageObject.scale;

        //拡大率を考慮した元画像のクリップ領域の縦横サイズを算出
        var clipWidth = setting.width / imageObject.scale;
        var clipHeight = setting.height / imageObject.scale;
        //小数点以下の端数を四捨五入(しないと、リサイズ後の画像が斜体のようにずれてしまう)
        clipWidth = Math.round(clipWidth);
        clipHeight = Math.round(clipHeight);

        //canvas要素を変数上で作成
        var canvasDummy = document.createElement("canvas");
        //canvasの2Dコンテキストを取得
        var contextDummy = canvasDummy.getContext("2d");
        //canvasのサイズを設定
        canvasDummy.width = clipWidth;
        canvasDummy.height = clipHeight;
        //imageをcanvasへ描画
        contextDummy.drawImage(image, clipX, clipY, clipWidth, clipHeight, 0, 0, clipWidth, clipHeight);
        //canvasの指定した矩形のImageDataを取得
        //.dataは、RGBAの順番のデータを含んだ1次元配列。それぞれの値は0～255の範囲。
        var dataToScale = contextDummy.getImageData(0, 0, clipWidth, clipHeight).data;

        //リサイズ後のcanvas
        //				var canvasClip = $('#' + setting.id + '_clip')[0];
        var canvasClip = document.createElement("canvas");
        //リサイズ後のcanvasの2Dコンテキスト
        var contextClip = canvasClip.getContext("2d");
        //リサイズ後のサイズを設定
        canvasClip.width = setting.width;
        canvasClip.height = setting.height;
        //リサイズ処理
        var resized = new Resize(clipWidth, clipHeight, setting.width, setting.height, true, true, false, function (
          buffer,
        ) {
          updateCanvas(contextClip, contextClip.createImageData(setting.width, setting.height), buffer);
        });
        resized.resize(dataToScale);

        //送信用のhiddenへ画像データを設定
        //(先頭の「data:image/jpeg;base64,」は不要データなので削除)
        //データが送信されるように無効→有効へ変更
        $("#" + setting.id)
          .val(canvasClip.toDataURL("image/jpeg").replace(/^data:image\/jpeg;base64,/, ""))
          .prop("disabled", false);
      }

      //送信しないようにfileコントロールを無効にする
      $("#" + setting.id + "_file").prop("disabled", true);

      return true;
    });

    /*
		$('#shop_img2_rotateRight').on('click',function(event){
			context.clearRect(0, 0, canvas.width(), canvas.height());

	context.save();
	//		context.translate(imageObject.width / 2, imageObject.height / 2);
			context.translate(
				imageObject.width / 2 + imageObject.height / 2,
				(imageObject.width / 2 - imageObject.height / 2) * -1
			);

			//ラジアン角の値で指定
			context.rotate(90 * Math.PI / 180);
			
			//translateした分戻して原点を0，0に
	//		context.translate( -1 * imageObject.width/2, -1 * imageObject.height/2 );    

			//画像の重心がキャンバス座標の中心点にくるように画像を表示する
//			context.drawImage(image, -imageObject.width / 2,-imageObject.height / 2,
//				imageObject.width, imageObject.height);
//			context.drawImage(image, 0, 0,
//				imageObject.width, imageObject.height);

			context.drawImage(image,
				imageObject.x, imageObject.y,
				imageObject.width * imageObject.scale, imageObject.height * imageObject.scale);
			context.restore();

			return true;
		});

		$('#shop_img2_rotateLeft').on('click',function(event){
			return true;
		});
*/
  }

  //リサイズ用のコールバック
  function updateCanvas(contextPassed, imageBuffer, frameBuffer) {
    var data = imageBuffer.data;
    var length = data.length;
    for (var x = 0; x < length; ++x) {
      data[x] = frameBuffer[x] & 0xff;
    }
    contextPassed.putImageData(imageBuffer, 0, 0);
  }
})(jQuery);
