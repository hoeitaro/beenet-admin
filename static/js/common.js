// モーダルダイアログ
var w_p;
var modalP = function(){
  w_p = $(window).scrollTop();
	$('html, body').css({'position':'fixed','top':-w_p});
	$('.modal').fadeIn();
	$('.item_modal').scrollTop(0);
	// $('.tab>li:first-child').addClass('active').siblings('li').removeClass('active');
	// $('.tab_li:eq(0)').addClass('active').siblings('.tab_li').removeClass('active');
};
var modalC = function () {
  $('.modal').fadeOut();
  $('html, body').css({'position':'relative','top':''});
	$('html, body').prop({ scrollTop: w_p });
}

// 上位表示設定－スライド
function rankSlide() {
  $('#rank_flg-1').is(':checked') ? $('.rank_set').slideDown() : $('.rank_set').slideUp();
}


// JavaScript Document
$(function(){

//-------------リンクエリア
  //$('.link_area').click(function(){
  $('.side,.contents').on('click', '.link_area', function(){
    var anchor = $(this).closest('.link_box').find('a');
    if(anchor.attr('target')) {
      window.open(anchor.attr('href'));
    } else {
      window.location=anchor.attr('href');
    }
    return false;
  });

//-------------リンクアニメーション
  $('.guide').click(function(){
    var speed = 1000;
    var href= $(this).attr('href');
    var target = $(href == '#' || href == '' ? 'html' : href);
    var position = target.offset().top;
    $('html, body').animate({scrollTop:position}, speed, 'easeInOutExpo');
    return false;
  });

//-------------お知らせ モーダル
  $('.modal_wrapper').on('click', '.modal_on', function () {

    modalP();

    //infomation用
    $('.modal_infomation .date').html($(this).parent().siblings('.date').text());
    $('.modal_infomation dt').html($(this).text());
    $('.modal_infomation dd').html($(this).parent().siblings('.txt').html());

    //小画像用
    $('.modal_imgS_btn').on('click', function () {
      modalC();
    });
  });

  $('.imgS_setting .file_btn').on('click', 'button', function () {
    $(this).siblings('input[type="file"]').click();
    return false;
  });

  //閉じる
  $('.close_modal,.bk_modal').on('click', function () {
    modalC();
  });

//-------------スライダー
  var slider_recommended_count = $('.li_recommended li').length;
  if(slider_recommended_count > 3){
    var slider_recommended = $('.li_recommended').bxSlider({
      speed:800,
      maxSlides:3,
      minSlides:3,
      moveSlides:1,
      slideMargin:30,
      slideWidth:300,
      easing:'easeInOutExpo',
      useCSS:false,
      touchEnabled:false,
    });
  }else{
    $('.li_recommended').addClass('li_recommended_noSlide');
  }

//-------------スライダーのボタン連打防止
  $(document).on('click', '.bx-controls-direction a', function() {
    $('.bx-controls-direction').addClass('barrier');
    setTimeout(function(){
      $('.bx-controls-direction').removeClass('barrier');
    },800);
  });

//-------------ページトップリンク表示非表示
  var float_menu_flg = true;

  $(window).on('scroll load', function(){
    if(float_menu_flg && $(this).scrollTop() > 70){
      $('.page_top').fadeIn();
    }else{
      $('.page_top').fadeOut();
    }
  });

//-------------03自動更新スケジュール設定
  $('input[name="rank_flg"]').change(function(){
    rankSlide();
  });

//-------------チェックを外す
  $('.rank_set').hide();
  rankSlide();

//-------------よくある質問
  var modelH_value;
  function modelH(){
    modelH_value = $('.model').outerHeight();
  };

  function model_hide(){
    $('.model').css('bottom','-'+modelH_value+'px');
  };

  modelH()
  model_hide()

  $(window).resize(function(){
    if($('.model').hasClass('model_off')){
      modelH();
      model_hide();
    }else{
      modelH();
    }
  });

  $('.btn_shopqa').click(function(){
    $('.model').removeClass('model_off').css('bottom','0');
    $('.bk_model').fadeIn();
  });

  $('.close_model span,.bk_model').click(function(){
    $('.model').addClass('model_off');
    model_hide();
    $('.bk_model').hide();
  });

//-------------20 tips_hover
  $('.tips').hover(
    function(){
      $(this).siblings('.tips_wanted').fadeIn();
    },
    function(){
      $(this).siblings('.tips_wanted').stop(true,true).fadeOut();
    }
  );

  $('.tips_feature').hover(
    function(){
      $(this).find('.tips_item').fadeIn();
    },
    function(){
      $(this).find('.tips_item').stop(true,true).fadeOut();
    }
  );

//-------------35
  $('.btn_accordion_blog').each(function(){
    if($(this).is(':checked')){
      $(this).parent('.radio_type1_wrapper').next('.accordion_blog').show();
    }
  });

  $('.btn_accordion_blog').change(function(){
    $(this).closest('.partition').find('.accordion_blog').slideToggle();
  });

//-------------40 character select
  $('.character_wrap').hover(
    function(){
      $(this).find('.character').fadeIn();
    },
    function(){
      $(this).find('.character').stop(true,true).fadeOut();
    }
  );

  $('.li_character>*:not(.not_character)').click(function(){
    $(this).addClass('on').siblings().removeClass('on');
    $(this).closest('.character').siblings('.btn_character').text($('.on').text());
    $(this).parent('.li_character').siblings('input[name="staff_character"]').val($('.on').data('characterId'));
  });

  //$('.tips').hover(
//    function(){
//      $(this).closest('.tips_wrap').find('.tips_item').fadeIn();
//    },
//    function(){
//      $(this).closest('.tips_wrap').find('.tips_item').stop(true,true).fadeOut();
//    }
//  );

//-------------20 table表示非表示
  $('.radio_type2 label').click(function(){
    if($(this).hasClass('wanted_history-1')){
      $('.wanted_history').slideDown();
    }else{
      $('.wanted_history').slideUp();
    }
  });

  $(window).load(function(){
    if($('.wanted_history-1').prev().prop('checked')){
      $('.wanted_history').slideDown();
    }
  });

//-------------input関連

  $('.div_sum').focusin(function(e) {
    $(this).val($(this).val().replace(/,/g, ''));
    }).focusout(function(e) {
    $(this).val($(this).val().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'));
  });

  $('.number').change(function(){
    var text  = $(this).val();

    if(text.match(/^[0-9 ０-９]+$/)){
    var henkan = text.replace(/[０-９]/g,function(s){
      return String.fromCharCode(s.charCodeAt(0)-0xFEE0);
    });
      $(this).val(henkan);
    }else{
      $(this).val('');
    }
  });

//-------------err

  $('.err_top a').each(function(i){
    $(this).attr('href', '#'+'err' + (i+1));
  });

  $('.err').each(function(i){
    $(this).attr('id', 'err' + (i+1));
  });

  var headerHight = 71;
  $('.guide_err').click(function(){
    var href= $(this).attr('href');
    var target = $(href == '#' || href == '' ? 'html' : href);
    var position = target.offset().top-headerHight;
    $('html, body').animate({scrollTop:position}, 1000, 'easeInOutExpo');
    return false;
  });

});
