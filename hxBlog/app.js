//加载express模块
var express = require('express');
var app = express();
//加载模板处理模块，用于渲染
var swig = require('swig');
//加载数据库模块
var mongoose = require("mongoose");
//加载body-parser，用来处理post提交过来的数据
var bodyParser = require('body-parser');
var User = require('./models/User');
//加载cookies模块
var cookies = require('cookies');
//cookies相关设置
app.use(function (req, res, next) {
    req.cookies = new cookies(req, res);
    //解析登录用户的cookie信息
    req.userInfo = {};
    if (req.cookies.get('userInfo')) {
        try {
            req.userInfo = JSON.parse(req.cookies.get('userInfo'));
            //获取当前登录用户的类型
            User.findById(req.userInfo._id).then(function (userInfo) {
                req.userInfo.isAdmin = Boolean(userInfo.isAdmin);
                next();
            });

        } catch (e) {
            next();
        }
    } else {
        next()
    }
});
//body-parser相关设置,用于接收POST提交过来的数据
app.use(bodyParser.urlencoded({extended: true}));
//设置静态文件托管
app.use('/public', express.static(__dirname + '/public'));

//模块划分,根据不同的功能划分
app.use('/admin',require('./routers/admin'));
app.use('/api', require('./routers/api'));
app.use('/', require('./routers/main'));
//配置应用模板
app.engine('html', swig.renderFile);
app.set('views', './views');
app.set('view engine', 'html');
//取消模板缓存
swig.setDefaults({cache: false});

mongoose.connect('mongodb://localhost:27017/hxBlog', function (err) {
    if (err) {
        console.log('数据连接失败了')
    } else {
        console.log('数据连接成功了');
        app.listen(8080);
    }
});
