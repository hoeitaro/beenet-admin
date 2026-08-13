$(function() {
  // 仕様定義（バイト換算）
  const MAX_IMAGE_SIZE = 20 * 1024 * 1024;  // 20MB
  const MAX_VIDEO_SIZE = 200 * 1024 * 1024; // 200MB
  const MAX_VIDEO_DURATION = 120;           // 120秒

  $('#media-upload').on('change', async function(e) {
    const file = e.target.files[0]; // 今回は単一ファイル選択を想定
    const $input = $(this);
    
    // data-属性からターゲット要素を取得
    const targetSelector = $input.data('preview-target');
    const $previewContainer = $(targetSelector);

    // ファイルが選択されていない場合はプレビューを空にして終了
    if (!file) {
      $previewContainer.empty();
      return;
    }

    // --- 1. バリデーションチェック ---
    
    // 【画像の場合】
    if (file.type.startsWith('image/')) {
      if (file.type === 'image/gif') {
        alert('GIFアニメーションは非対応です。');
        $input.val('');
        $previewContainer.empty();
        return;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        alert('画像サイズは20MB以下にしてください。');
        $input.val('');
        $previewContainer.empty();
        return;
      }
    }
    // 【動画の場合】
    else if (file.type.startsWith('video/')) {
      if (file.size > MAX_VIDEO_SIZE) {
        alert('動画サイズは200MB以下にしてください。');
        $input.val('');
        $previewContainer.empty();
        return;
      }

      // 再生時間のチェック
      try {
        const duration = await getVideoDuration(file);
        if (duration > MAX_VIDEO_DURATION) {
          alert('動画の再生時間は120秒以下にしてください。');
          $input.val('');
          $previewContainer.empty();
          return;
        }
      } catch (error) {
        alert('動画ファイルの読み込みに失敗しました。');
        $input.val('');
        $previewContainer.empty();
        return;
      }
    }

    // --- 2. プレビューの表示処理 ---
    
    // ブラウザで表示可能な一時URLを作成
    const fileURL = URL.createObjectURL(file);

    // コンテナを一度きれいにする
    $previewContainer.empty();

    if (file.type.startsWith('image/')) {
      // ⚠️ HEIC/HEIFはSafari以外ブラウザ側でプレビュー表示できないため注意書きを出す対応
      if (file.type.includes('heic') || file.type.includes('heif')) {
        $previewContainer.html('<p class="preview-note">HEIC形式（アップロード後にWebPへ変換されます）</p>');
      } else {
        // 通常の画像はimg要素を挿入
        const $img = $('<img>').attr({
          src: fileURL,
          alt: 'アップロード画像プレビュー',
          class: 'preview-image'
        });
        $previewContainer.append($img);
      }
    } else if (file.type.startsWith('video/')) {
      // 動画はvideo要素（コントロール付き）を挿入
      const $video = $('<video>').attr({
        src: fileURL,
        controls: true,
        class: 'preview-video'
      });
      $previewContainer.append($video);
    }
  });

  // 動画の再生時間を取得するヘルパー関数（Promise型）
  function getVideoDuration(file) {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = URL.createObjectURL(file);
      video.onloadedmetadata = function() {
        URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };
      video.onerror = function() {
        reject();
      };
    });
  }
});
