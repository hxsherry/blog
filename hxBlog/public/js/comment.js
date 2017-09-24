$('.btn').on('click', function () {

    //contentId  commentId xxxxx
    var contentId = $('#contentId').val();
    var message = $('#commentMessage').val();
    console.log("contentId:");
    console.log(contentId);
    console.log("message:");
    console.log(message);

    $.ajax({
        type: 'POST',
        url: '/api/comment/post',
        data: {
            contentId: contentId,
            comment: message
        },
        success: function (responseData) {
            console.log(responseData)
        }
    })
});




