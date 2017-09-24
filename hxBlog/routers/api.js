var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Content = require('../models/Content');

var responseData;
router.use(function (req, res, next) {
    responseData = {
        code: 0,
        message: ''
    };
    next()
});
/*用户注册
*    注册逻辑
*
*    1，用户不能为空
*    2，密码不能为空
*    3，两次输入密码必须一致
*
*    1.用户是否已经被注册了
*    从数据库中查询
* */
router.post('/user/register', function (req, res, next) {
    // console.log(req.body);
    var username = req.body.username;
    var password = req.body.password;
    var rePassword = req.body.rePassword;
    //用户是否为空
    if (username === '') {
        responseData.code = 1;
        responseData.message = '用户名不能为空';
        res.json(responseData);
        return;
    }
    if (password === '') {
        responseData.code = 2;
        responseData.message = '密码不能为空';
        res.json(responseData);
        return;
    }
    if (password !== rePassword) {
        responseData.code = 3;
        responseData.message = '两次输入密码必须一致';
        res.json(responseData);
    }
    //用户名是否已经被注册，如果数据库中已经存在我们要注册的同名的数据，表示该用户已经注册
    User.findOne({
        username: username
    }).then(function (userInfo) {
        if (userInfo) {
            //如果存在，表示数据库中已经被注册
            responseData.code = 4;
            responseData.message = '用户已被注册';
            res.json(responseData)
        }
        //否则保存用户的注册信息到数据库中.通过构造函数，创造一个对象出来
        var user = new User({
            username: username,
            password: password
        });
        return user.save();
    }).then(function (newUserInfo) {
        responseData.message = '注册成功';
        res.json(responseData);
    });


});
router.post('/user/login', function (req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    if (username === '' || password === '') {
        responseData.code = 1;
        responseData.message = '用户名或密码不能为空';
        res.json(responseData);
        return;
    }
    //查询数据库中相同用户名和密码的用户是否存在，如果存在则登录成功
    User.findOne({
        username: username
    }).then(function (userInfo) {
        if (!userInfo) {
            responseData.code = 2;
            responseData.message = '用户不存在';
            res.json(responseData);
        }
    });
    User.findOne({
        password: password
    }).then(function (userInfo) {
        if (!userInfo) {
            responseData.code = 2;
            responseData.message = '密码错误';
            res.json(responseData);
        }
    });
    User.findOne({
        username: username,
        password: password
    }).then(function (userInfo) {
        //用户名和密码是正确的，登录成功
        responseData.message = '登录成功';
        responseData.userInfo = {
            _id: userInfo._id,
            username: userInfo.username
        };
        req.cookies.set('userInfo', JSON.stringify({
            _id: userInfo._id,
            username: userInfo.username
        }));
        res.json(responseData);
    });
});
//退出
router.get('/user/logout', function (req, res, next) {
    req.cookies.set('userInfo', null);
    responseData.message = '退出';
    res.json(responseData);
});

//评论提交
router.post('/comment/post', function (req, res, next) {

    console.log("here?");

    //整个内容唯一的Id req.body.xxxx req.query.xxx
    var contentId = req.body.contentId;
    var postData = {
        username: req.userInfo.username,
        postTime: new Date(),
        comment: req.body.comment
    };
    //查询当前内容的信息
    Content.findOne({
        _id: contentId
    }).then(function (content) {
        content.comments.push(postData);
        return content.save()
    }).then(function (newContent) {
        responseData.message = '评论成功'
        res.json(responseData);
        // console.log(newContent)
    })

});


//通过module对象返回数据
module.exports = router;