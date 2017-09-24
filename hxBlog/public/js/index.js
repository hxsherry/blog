$(function () {
    var $loginBox = $('.loginBox');
    var $registerBox = $('.registerBox');
    var $userInfo = $('.userInfo');
    //切换到注册面板
    $loginBox.find('a').on('click', function () {
        $registerBox.show();
        $loginBox.hide();
    });
    //切换到登录面板
    $registerBox.find('a').on('click', function () {
        $registerBox.hide();
        $loginBox.show();
    });
    //注册
    $registerBox.find('.btn').on('click', function () {
        $.ajax({
            type: 'post',
            url: '/api/user/register',
            data: {
                username: $registerBox.find('[name="username"]').val(),
                password: $registerBox.find('[name="password"]').val(),
                rePassword: $registerBox.find('[name="rePassword"]').val()
            },
            dataType: 'json',
            success: function (result) {
                $registerBox.find('.warning').html(result.message);
                if (!result.code) {
                    setTimeout(function () {
                        $loginBox.show();
                        $registerBox.hide();
                    }, 1000)
                }
            }
        })
    });
    //登录成功的话
    $loginBox.find('.btn').on('click', function () {
        $.ajax({
            type: 'post',
            url: '/api/user/login',
            data: {
                username: $loginBox.find('[name=username]').val(),
                password: $loginBox.find('[name="password"]').val()
            },
            dataType: 'json',
            success: function (result) {
                $loginBox.find('.warning').html(result.message);
                if (!result.code) {
                    //登录成功
                    // setTimeout(function () {
                    //     $loginBox.hide();
                    //     $userInfo.show();
                    //     //显示登录用户的信息
                    //     $userInfo.find('.username').html(result.userInfo.username);
                    //     $userInfo.find('.info').html('你好，欢迎光临我的博客！')
                    //
                    // }, 1000)
                    window.location.reload()
                }
            }
        })
    });
    $('.logout').on('click', function () {
        $.ajax({
            url:"/api/user/logout",
            success:function (result) {
                if(!result.code){
                    window.location.reload()
                }
            }
        })
    })

});