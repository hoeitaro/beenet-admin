//------------------------------------------------------------------------------
// submit関連
//------------------------------------------------------------------------------
// aタグでsubmit
function aSubmit(id, msg) {
	var msg = msg || null;
	showLoadingPopup(msg);
	$('#'+id)[0].submit();
	return false;
}

// preview用のsubmit
function pSubmit(id, action) {
	f = $('#'+id);
	var preAct = f.attr('action');
	f.attr({
		action: action,
		target: '_blank'
	});
	f.submit();
	f.attr('action', preAct).removeAttr('target');
	return false;
}

//------------------------------------------------------------------------------
//アラート
//------------------------------------------------------------------------------
function deleteCheck() {
	if (confirm("削除しますか？")) {
		return true;
	}
	else {
		return false;
	}
}
function updateCheck() {
	if (confirm("更新しますか？")) {
		return true;
	}
	else {
		return false;
	}
}
function shinseiCheck() {
	if (confirm("審査の申請を行いますか？")) {
		return true;
	}
	else {
		return false;
	}
}


//------------------------------------------------------------------------------
// Ajax通信中のポップアップを表示
//------------------------------------------------------------------------------
var g_ajaxStartTime;	//Ajax通信処理の開始時間

// Ajax通信中のポップアップを表示
function showLoadingPopup(msg) {

	msg = msg || '読み込み中…';

	//Ajax通信中のポップアップを表示
	$.blockUI({
		message	:msg,
		showOverlay: false,
		fadeIn: 0,//事情により0に設定。
		fadeOut: 150,
		css: {
		    width: '20%',
		    top: '40%',
		    left: '40%',
			border: 'none',
			padding: '20px',
			backgroundColor: '#000',
			'border-radius': '10px',
			'-webkit-border-radius': '10px',
			'-moz-border-radius': '10px',
			'font-size': '17px',
			opacity: .8,
			color: '#fff'
		}
	});

	//Ajax通信処理の開始時間を設定
	g_ajaxStartTime = (+new Date());
}

// Ajax通信中のポップアップを非表示
function hideLoadingPopup(time) {

	if(time){
		settime = time;
	}else{
		settime = 500;
	}

	//Ajax通信処理の終了時間を設定
	var end = (+new Date());
	//通信中ポップアップの最低表示秒数を設定(ミリ秒単位)
	var min = settime;
	//Ajax通信処理時間を算出
	var diff = (end - g_ajaxStartTime);
	//最低表示秒数より処理時間の方が短い場合
	if (diff < min) {
		//最低表示秒数経過後に、通信中ポップアップ解除
		setTimeout($.unblockUI, (min - diff));
	} else {
		//通信中ポップアップ解除
		$.unblockUI();
	}

	return;
}

//------------------------------------------------------------------------------
// 改行コード変換  改行コード → <br />
//------------------------------------------------------------------------------
function nl2br(str) {
	return str.replace(/[\n\r]/g, "<br />");
}



//------------------------------------------------------------------------------
//CKEditorの文字数カウント共通処理
//------------------------------------------------------------------------------
function refleshTextCountCKEditor(editor) {
	//データのテキスト表現を取得
	var data = $.trim(	//6. 前後のスペース等を除去
		$('<div>').html(
			editor.getData().replace(/&nbsp;/g, ' ')	//1. CKEditorからgetData()で値を取得
														//  (getSnapshot()だと文字化けがあったり、勝手に付加されるノーブレークスペースが除去しにくいので使用しない)
														//2. ノーブレークスペースは普通のスペースと違い文字コードが異なるので、先に普通のスペースへ変換しておく
														//   先に変換しておかないと、後の処理でうまくtrimできなくなる為
		).text()	//3. jQueryの小技でHTMLアンエスケープする
		.replace(/ [\r\n]/g, '')	//4. CKEditorで改行の前にたまに勝手に付加されるスペースを除去
		.replace(/[\r\n]/g, '')		//5. 改行を除去
	);

	//文字数の表示を更新
	var len = data.length;
	var textCount = $('span.' + editor.name + '-textcount');
	var count = textCount.children('span.textcount');
	count.html(len);

	//最大文字数が指定されている場合
	var maxlength = textCount.attr('data-max-length');
	if (typeof maxlength !== 'undefined') {
		//最大文字数以上なら赤太字にする
		count.removeClass('red b');
		if (len > maxlength) {
			count.addClass('red b');
		}
	}
}




//------------------------------------------------------------------------------
// 共通イベント
//------------------------------------------------------------------------------
$(function() {

//------------------------------------------------------------------------------
// 削除ボタン押下
//------------------------------------------------------------------------------
	var classBtn = '';//クリックされたクラス名
	$(document).on('click', ".confirmChk_1,.confirmChk_2", function(){

		//クラスに応じてメッセージを変更
		if( $(this).hasClass("confirmChk_1")){
			classBtn = 'confirmChk_1';
			var msg = '削除しますか？';
		}else if ( $(this).hasClass("confirmChk_2")){
			classBtn = 'confirmChk_2';
			var msg = '申請しますか？';
		}

		//confirmChkCompクラスがあれば確認後なので処理をストップ
		if( $(this).hasClass("confirmChkComp") ){
			classBtn = '';
			return true;
		}

		//アラート表示中は、フラグ用のクラスを追加
		$(this).addClass("confirmChkActive");

		//前回のタグを削除
		$('#question').remove();
		//タグを表示
		$('<div id="question" style="display:none; cursor: default"><div>'+msg+'</div><div class="box_btn_confirm"><span id="yes" class="btn_confirm">YES</span><span id="no" class="btn_confirm">NO</span></div></div>').appendTo("body");

	    $.blockUI({
			message: $('#question'),
			overlayCSS:  {
				opacity: 0,
				cursor: 'wait'
			},
			css: {
			    width: '20%',
			    top: '40%',
			    left: '40%',
				border: 'none',
				padding: '20px',
				'backgroundColor': '#000',
				'border-radius': '10px',
				'-webkit-border-radius': '10px',
				'-moz-border-radius': '10px',
				'font-size': '17px',
				opacity: .8,
				color: '#fff'
			}
		});

		return false;
    });

	//YESをクリック
    $(document).on('click', '#yes', function(){
		$(".confirmChkActive").addClass("confirmChkComp");//表示中から確認後のクラス名に移行
		$(".confirmChkActive").removeClass("confirmChkActive");//アラート表示中のクラス名を削除
		$.unblockUI();

		//イベントを発生させる
  		var a = jQuery(".confirmChkComp")[0];
  		var e = document.createEvent('MouseEvents');
  		e.initEvent('click', true, true);
  		a.dispatchEvent(e);
    });

	//NOをクリック
    $(document).on('click', '#no', function(){
		$(".confirmChkActive").removeClass("confirmChkActive");//アラート表示中のクラス名を削除
		$.unblockUI();
		return false;
    });


//------------------------------------------------------------------------------
// 左ナビのイベント
//------------------------------------------------------------------------------
	// 左ナビがあるページのみ
	if($('.side')[0]) {

		// 左ナビ読み込み
		// ※左ナビを全ページ固定で出力するので、体感速度を上げるためにページ読み込み後に非同期で実行
		$.blockUI({
			message :'Loading…',
			showOverlay: false,
			fadeIn: 150,
			fadeOut: 150,
			css: {
				width: '10%',
				top: '40%',
				left: '35px',
				border: 'none',
				padding: '20px',
				backgroundColor: '#000',
				'border-radius': '10px',
				'font-size': '14px',
				opacity: .8,
				color: '#fff'
			},
			overlayCSS: {
				backgroundColor: '#000',
				opacity: .6,
			}
		});
		$.post('/manage/top/leftnav/', null, function(data) {
			$("#side_nav").html(data);
			hideLoadingPopup(); // 通信中非表示
		});

		// 上位表示
		$(document).on('click', '#updaterank', function(e) {

			if($('#rank_count').text() == 0) {
				showLoadingPopup('更新回数が不足しています。');
				hideLoadingPopup(); // 通信中非表示
				return false;
			}

			e.preventDefault();
			// ajax.post
			$.post( $(this).attr('href'), { updateRank: 1 }, function(data, status) {
				var obj = null;
				try {
					obj = jQuery.parseJSON(data);
				} catch (e) {
					console.error('updaterank response parse error', e, data);
					showLoadingPopup('更新処理の応答が不正です。時間をおいて再実行してください。');
					hideLoadingPopup(); // 通信中非表示
					return;
				}
				//応答内容表示
				showLoadingPopup(obj.msg);
				// HTML更新
				if(obj.rank_count) {
					$('#rank_count').html(obj.rank_count);
				} else {
					$('#rank_count').html(0);
				}
				if(obj.rank_date) $('#rank_date').html(obj.rank_date);
				hideLoadingPopup(); // 通信中非表示
			});
			hideLoadingPopup(); // 通信中非表示
			return false;
		});
	}


//------------------------------------------------------------------------------
//審査ボタンクリックイベント
//------------------------------------------------------------------------------
//	$("#shinsa").click(function() {
	$('.side,.contents').on('click', '#shinsa', function() {
		if( shinseiCheck() ){

			//フォーム送信処理
			var param = {
							shinsa:1
						};
			var url = '/manage/top/shinsa/';
			$.post(url, param, function(data, status) {
				var obj = jQuery.parseJSON(data);

				switch (obj.status) {
					case 'success':
						showLoadingPopup(obj.msg);
						//HTML更新
						$('#shinsa_box').html('<a class="btn_shinsei">申請中</a>');
						break;
					case 'validationError':
						//HTML更新
						alert(obj.msg);
						break;
					default:
						//HTML更新
						alert('不正な処理が行われました');
						break;
				}

				hideLoadingPopup();//通信中非表示
			});
			return false;
		}
	});



//------------------------------------------------------------------------------
//テキストの文字数カウンタ
//------------------------------------------------------------------------------
	$('span[class$="-textcount"]').each(function(){
		//ターゲットのIDを取得
		var targetId = $(this).attr('data-target-id');

		//CKEditorの場合
		if ($('#' + targetId).hasClass('ckeditor')) {
			//CKEditorの準備完了イベント
			CKEDITOR.on('instanceReady', function(ev){
				//エディタのオブジェクトを取得
				var editor = ev.editor;
				//当該CKEditorに対応する文字数表示が存在する場合
				if ($('span.' + editor.name + '-textcount')[0]) {
					//CKEditorの文字数カウント共通処理
					refleshTextCountCKEditor(editor);

					//ターゲットのテキスト変更イベント
					editor.on('change', function(){
						//CKEditorの文字数カウント共通処理
						refleshTextCountCKEditor(this);

						return true;
					});
				}
				return true;
			});
		//CKEditorでない場合
		} else {
			//文字数の表示を更新
			$(this).children('span.textcount').html($('#' + targetId).val().replace(/[\r\n]/g, '').length);

			//ターゲットのテキスト変更イベント
			$(document).on('keyup change', '#' + targetId, function(){
				//文字数の表示を更新
				$('span.' + $(this).attr('id') + '-textcount span.textcount').html($(this).val().replace(/[\r\n]/g, '').length);
				return true;
			});
		}
	});
});


