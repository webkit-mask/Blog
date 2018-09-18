$(function () {
    let $longBox = $('.user-login');
    let $registeBox = $('.user-registe');
    let $userInfo = $('#userInfo');
    //  切换到注册面板
    $longBox.find('.colMint').click(function () {
        $('.user-login').addClass('hidden');
        $('.user-registe').removeClass('hidden');
    })
    //  切换到登陆面板
    $registeBox.find('.colMint').click(function () {
        $('.user-login').removeClass('hidden');
        $('.user-registe').addClass('hidden');
    })
    // 注册
    $registeBox.find('button').on('click', function () {
        // 通过ajax 提交请求
        $.ajax({
            type: 'post',
            url: '/api/user/register',
            data: {
                username: $registeBox.find('[name="username"]').val(),
                password: $registeBox.find('[name="password"]').val(),
                repassword: $registeBox.find('[name="repassword"]').val()
            },
            dataType: 'json',
            success: function (result) {
                $registeBox.find('.colWarning').html(result.message);

                if (!result.code) {
                    // 注册成功
                    setTimeout(() => {
                        $('.user-login').removeClass('hidden');
                        $('.user-registe').addClass('hidden');
                    }, 1000);
                }
            }
        })
    })

    // 登录模块
    $longBox.find('button').on('click', function () {
        // 通过ajax 提交请求
        $.ajax({
            type: 'post',
            url: '/api/user/login',
            data: {
                username: $longBox.find('[name="username"]').val(),
                password: $longBox.find('[name="password"]').val(),
            },
            datatype: 'json',
            success: function (result) {
                $longBox.find('.colWarning').html(result.message);
                if (!result.code) {
                    // 登录成功
                    // setTimeout(() => {
                    //     $('.user-login').addClass('hidden');
                    //     $userInfo.show();

                    //     // 显示用户登录信息
                    //     $userInfo.find('.userName').html( result.userInfo.username )
                    //     $userInfo.find('.info').html('你好， 欢迎光临我的博客')
                    // }, 1000);
                    window.location.reload()
                }
            }
        })
    })

    // 退出登录
    $('#logout').on('click', () => {
        $.ajax({
            url: "/api/user/logout",
            success: (result) => {
                if (!result.code) {
                    window.location.reload()
                }
            }
        })
    })

})