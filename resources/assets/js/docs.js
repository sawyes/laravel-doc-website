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

});