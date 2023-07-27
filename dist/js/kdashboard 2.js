/**
 * Created by Kevin Rosario c2019
 */
$(function () {

    // Admin Dashboard Template Controller
    function setDashboardController(){
        /**
         * For Active and Inactive sidebar links and child menu
         */ 
        let _k_navLink = $("ul.sidebar-nav-list a.active");
        
        function sidebarSetActive(){
            if(typeof _k_setActiveNav != 'undefined'){
                _k_navLink = $("ul.sidebar-nav-list a["+_k_setActiveNav+"]");
            }

            for(
                var a = window.location,
                    i= _k_navLink
                        .addClass("active")
                        .parent()
                        .addClass("active");
                    i.is("li");
            ){
                i=i.parent().addClass("in").siblings("a").addClass("active").parent().addClass("active")
            };
            
        
        }

        function sidebarInitSlimScroll(){
            $(".scroll-sidebar").slimScroll({destroy: true}).height("auto");
            $(".scroll-sidebar").slimScroll({size:'5px',height:($(window).height() - $(".main-header").height()) + "px",position:'left'});
        }

        $("ul.sidebar-nav-list a").on("click",function(e){
            if (
                (!$(this).hasClass('active') && !$('body').hasClass('sidebar-mini')) ||
                (!$(this).hasClass('active') && $('body').hasClass('sidebar-mini') && $('body').hasClass('show-sidebar')) ||
                (!$(this).hasClass('active') && $(this).parent().parent().parent().is('li'))        
            ){
                // console.log($(this).parent().parent().parent());
                $(this).parent().parent().find('li.active,a.active,a.has-arrow.active,.collapse.in').removeClass('active in');
                for(
                    var a = window.location,
                        i=$(this)
                            .addClass("active")
                            .parent()
                            .addClass("active");
                    i.is('li');
                )i=i.children('ul').addClass("in");
            }else{
                $(this).parent().parent().find('li.active,a.active,a.has-arrow.active,.collapse.in').removeClass('active in');
            }
            // sidebarInitSlimScroll();
        });
        

        function sidebarCloseAll(){
            $("ul.sidebar-nav-list").find('li.active,a.active,a.has-arrow.active,.collapse.in').removeClass('active in');
        }


        function sidebarToggle(){
            if(!$('body').hasClass('sidebar-mini') && !$('body').hasClass('show-sidebar')){
                sidebarSetActive();
            }else if($('body').hasClass('sidebar-mini') && $('body').hasClass('show-sidebar')){
                sidebarSetActive();
            }else{
                sidebarCloseAll();
            }
        }

        /**
         * Sidebar Toggle and Page Responsive for 
         */

        var _k_height = $(this).innerHeight();
        var _k_width = $(this).innerWidth();
        if(_k_width<1170){
            $('body').addClass('sidebar-mini').removeClass('show-navbar');
        }

        sidebarToggle();
        sidebarInitSlimScroll();
        
        $(window).on('resize',function () {
            // console.log(_k_height);
            if ($(this).innerHeight()!=_k_height){
                sidebarInitSlimScroll();
            }
            if($(this).innerWidth() != _k_width && $(this).innerWidth()<1170){
                $('body').addClass('sidebar-mini').removeClass('show-navbar');
            }else if($(this).innerWidth() != _k_width && $('body').hasClass('sidebar-mini')){
                $('body').removeClass('sidebar-mini').removeClass('show-sidebar');
            }
            _k_height = $(this).innerHeight();
            _k_width = $(this).innerWidth();
            sidebarToggle();
        });

        $(document).on('click','.nav-toggle',function () {
            if ($('body').hasClass('sidebar-mini')){
                var w = $(window).innerWidth();
                if (w < 1170 && w > 767){
                    $('body').toggleClass('sidebar-mini').removeClass('show-navbar');
                }else if ($(window).innerWidth() < 768){
                    $('body').toggleClass('show-sidebar');
                } else{
                    $('body').toggleClass('sidebar-mini')
                }
                
            }else{
                $('body').addClass('sidebar-mini');
            }
            sidebarToggle();
        });
    }

    
    // Init

    /**
     * Admin Dashboard Controller
     * body.fixed class only
     */
    if($('body.fixed').length>0){
        setDashboardController();
    }
    /**
     * Preloader
     */
    window.onload = function(){
        $('.preloader').fadeOut(500).remove();
        // //
        setTimeout(function(){
            if($('.preloader').length>0){
                $('.preloader').fadeOut(500).remove();
            }
        },5);
    }
    /**
     * End Preloader
     */

});

