var express = require('express');
var router = express.Router();
var Category = require('../models/Category');
var Content = require('../models/Content');
var data;
//利用中间件，处理通用的数据
router.use(function (req, res, next) {
    data = {
        userInfo: req.userInfo,
        categories: []
    };
    Category.find().then(function (categories) {
        data.categories = categories;
        next();
    })
});
//首页
router.get('/', function (req, res, next) {
    //传过来的数据对象
    data.category = req.query.category || '';
    data.page = Number(req.query.page || 1);
    data.limit = 2;
    data.pages = 0;
    data.count = 0;
// console.log(req.query.category);
//条件
    var where = {};
    if (data.category) {
        where.category = data.category;
    }
    Content.where(where).count().then(function (count) {
        data.count = count;
        //计算总页数
        data.pages = Math.ceil(data.count / data.limit);
        data.page = Math.min(data.page, data.pages);
        data.page = Math.max(data.page, 1);
        var skip = (data.page - 1) * data.limit;
        return Content.find().where(where).sort({_id: -1}).limit(data.limit).skip(skip).populate('user');
    }).then(function (contents) {
        data.contents = contents;
        res.render('main/index', data);
    })
});
//读取内容详情页
router.get('/view', function (req, res, next) {
    var contentId = req.query.contentId || '';
    Content.findOne({_id: contentId}).populate('user').then(function (content) {
        data.content = content;
        content.views++;
        content.save();
        res.render('main/view', data)
    })
});


//通过module对象返回数据
module.exports = router;