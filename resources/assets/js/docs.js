/**
 * Created by wwrtwe on 2017/5/15.
 */


// docs menu silder bar
$(function(){
    var menu_list = $('section.sidebar ul>li>ul');
    var menu = $('section.sidebar ul>li');

    menu_list.find('li')
        .each(function(index,item){
            // current docs
            if($(item).css('font-weight') == 'bold') {
                $(item).parent()
                    .show();
                $(item).addClass('font-gray');
                return true;
            }
        });
    menu.click(function(){
        $(this).children().toggle('quick');
    });

    // 滚动
    $(document).ready(function () {
        $('.scotch-panel-wrapper').after('<img class="returnTop" src="/assets/images/huojian.png"/>');
        $('.returnTop').on('click',function(){
            $('html,body').animate({scrollTop:'0px'},400);
        });
    });
    $(document).on('scroll',function(){
        //当前滚动条的Y坐标
        var scrollY = $(document).scrollTop();
        //浏览器窗口可见高度
        var screenY =  window.innerHeight;
        //向下滑动一定距离，显示小火箭
        if( scrollY > screenY-screenY/3 ){
            $('.returnTop').fadeIn(1000);
        }else{
            //document.title= document.documentElement.scrollTop + ',' + window.innerHeight;
            $('.returnTop').fadeOut(1000);
        }
    });
});