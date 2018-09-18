let perpage = 10;
let page = 1;
let pager = 0;
let comments = [];

// 提交评论
$('#messageBtn').on('click', () => {
    $.ajax({
        type: 'POST',
        url: '/api/comment/post',
        data: {
            contenid: $('#contentId').val(),
            content: $('#messageContent').val()
        },
        success: (responseData) => {
            $('#messageContent').val('')
            comments = responseData.data.comments.reverse()
            renderComment()
        }
    })
})

// 每次页面重载的时候获取一下该文章的所有评论
$.ajax({
    url: '/api/comment',
    data: {
        contenid: $('#contentId').val()
    },
    success: (responseData) => {
        comments = responseData.data.reverse() 
        renderComment() 
    }
})

/**
 * 事件委托
 */
$('.pager').delegate('a', 'click', function () {
    if ($(this).parent().hasClass('previous')) {
        page--;
    } else {
        page++;
    }
    renderComment();
})

/**
 * 每页显示多少条
 */


function renderComment () {

    $('#messageNumber').html(comments.length)
    pages = Math.ceil( comments.length / perpage)
    let start = Math.max(0, (page - 1) * perpage);
    let end = Math.min((start + perpage), comments.length);
    let $lis = $('.pager li');

    $lis.eq(1).html(page + '/' + pages )

    if (page <= 1) {
        page = 1;
        $lis.eq(0).html('<span>没有上一页</span>')
    } else {
        $lis.eq(0).html('<a href="javascript:;">上一页</a>')
    }

    if ( page >= pages ) {
        page = pages;
        $lis.eq(2).html('<span>没有下一页</span>')
    } else {
        $lis.eq(2).html('<a href="javascript:;">下一页</a>')
    }
    

    let html = '';
    for ( let i = start; i < end; i++ ) {
        html += '<div class="messageBox">'+
                    '<p class="name"><span class="fl">' + comments[i].username + '</span> <span class="fr">' + formatData(comments[i].postTime) +'</span></p >'+
                    '<p class="cats">' + comments[i].content + '</p>'+
                '</div >'
    }
    $('.messageList').html(html)
}

function formatData (d) {
    let date1 = new Date(d)
    return date1.getFullYear() + '年' + (date1.getMonth()+1) + '月' + date1.getDate() + '日 ' + date1.getHours() + ':' + date1.getMinutes() + ':' + date1.getSeconds();
}