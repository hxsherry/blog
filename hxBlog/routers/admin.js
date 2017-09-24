var express = require('express');
var router = express.Router();
//引入模型
var User = require('../models/User');
var Category = require('../models/Category');
var Content = require('../models/Content');
router.use(function (req, res, next) {
    if (!req.userInfo.isAdmin) {
        //如果当前用户非管理员
        res.send('对不起，只有管理员才能进入后台管理');
        return;
    }
    next()
});
//管理首页
router.get('/', function (req, res, next) {
    res.render('admin/index', {
        userInfo: req.userInfo

    });
});

/*用户管理*/
router.get('/user', function (req, res, next) {
    /*从数据库中读取所有的用户数据
    * limit(Number):限制获取的数据条数
    *skip()忽略，跳过
    * 每页显示2条
    * 1：1-2，skip：0，
    * 2：3-4，skip：2
    * 3：5-7，skip:4  （当前页-1）*limit
    * */
    var page = Number(req.query.page || 1);
    var limit = 2;
    var pages = 0;
    User.count().then(function (count) {
        //计算总页数
        pages = Math.ceil(count / limit);
        page = Math.min(page, pages);
        page = Math.max(page, 1);
        var skip = (page - 1) * limit;
        User.find().limit(limit).skip(skip).then(function (users) {
            res.render('admin/user_index', {
                userInfo: req.userInfo,
                users: users,
                count: count,
                limit: limit,
                pages: pages,
                page: page
            });
        });
    });


});


/*分类首页*/
router.get('/category', function (req, res, next) {
    /*从数据库中读取所有的用户数据
   * limit(Number):限制获取的数据条数
   *skip()忽略，跳过
   * 每页显示2条
   * 1：1-2，skip：0，
   * 2：3-4，skip：2（当前页-1）*limit
    */
    var page = Number(req.query.page || 1);
    var limit = 2;
    var pages = 0;
    Category.count().then(function (count) {
        //计算总页数
        pages = Math.ceil(count / limit);
        page = Math.min(page, pages);
        page = Math.max(page, 1);
        var skip = (page - 1) * limit;
        /*1表示升序，-1表示降序 */
        Category.find().sort({_id: -1}).limit(limit).skip(skip).then(function (categories) {
            res.render('admin/category_index', {
                userInfo: req.userInfo,
                categories: categories,
                count: count,
                limit: limit,
                pages: pages,
                page: page
            });
        });
    });


});
/*获取添加分类的首页*/
router.get('/category/add', function (req, res, next) {
    res.render('admin/category_add', {
        userInfo: req.userInfo
    })
});
//添加分类的保存
router.post('/category/add', function (req, res, next) {
    var name = req.body.name || '';
    if (name === "" || name.trim() === '') {
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '名称不能为空'
        });
        return;
    }
    //验证是否已经存在同名的分类名称
    Category.findOne({
        name: name
    }).then(function (sameName) {
        if (sameName) {
            //表示当前数据库存在同名分类
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '分类已经存在'
            });
            return Promise.reject();
        } else {
            //数据库中不存在该分类，可以保存
            return new Category({name: name}).save()
        }
    }).then(function (newCategory) {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '分类保存成功',
            url: '/admin/category'
        })
    })
});

//获取分类修改的首页
router.get('/category/edit', function (req, res, next) {
    var id = req.query.id || '';
    //以id信息来确认要修改的是哪一条分类信息
    Category.findOne({
        _id: id
    }).then(function (category) {
        if (!category) {
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: "分类信息不存在"
            });
        } else {
            res.render('admin/category_edit', {
                userInfo: req.userInfo,
                category: category
            });
        }
    })
});
//分类的修改保存
router.post('/category/edit', function (req, res, next) {
    //以id信息来确认要保存修改的是哪一条分类信息
    var id = req.query.id || '';
    //获取post提交过来的新的分类名称
    var name = req.body.name;
    //获取要修改的分类信息
    Category.findOne({
        _id: id
    }).then(function (category) {
        if (!category) {
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: "分类信息不存在"
            });
            return Promise.reject();
        } else {
            //当用户没有做任何修改提交的时候
            if (name === category.name) {
                res.render('admin/success', {
                    userInfo: req.userInfo,
                    message: "保存成功",
                    url: '/admin/category'
                });
                return Promise.reject();
            } else {
                if (name === '' || name.trim() === '') {
                    res.render('admin/error', {
                        userInfo: req.userInfo,
                        message: "分类名称不能为空"
                    });
                    return Promise.reject();
                } else {
                    //要修改的分类名称是否在数据库中存在了
                    return Category.findOne({
                        _id: {$ne: id},
                        name: name
                    });
                }
            }
        }
    }).then(function (sameCategory) {
        if (sameCategory) {
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: "数据库中已有同名分类存在"
            });
            return Promise.reject();
        } else {
            Category.update({_id: id},
                {name: name}).then(function () {
                res.render('admin/success', {
                    userInfo: req.userInfo,
                    message: "修改成功",
                    url: '/admin/category'
                });
            })

        }


    })
});
//分类的删除
router.get('/category/delete', function (req, res, next) {
    var id = req.query.id || '';
    //获取要删除分类的ID
    Category.remove({
        _id: id
    }).then(function () {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: "删除成功",
            url: '/admin/category'
        });
    })
});


//内容首页
router.get('/content', function (req, res) {
    var page = Number(req.query.page || 1);
    var limit = 2;
    var pages = 0;
    Content.count().then(function (count) {
        //计算总页数
        pages = Math.ceil(count / limit);
        page = Math.min(page, pages);
        page = Math.max(page, 1);
        var skip = (page - 1) * limit;
        /*1表示升序，-1表示降序 */
        Content.find().sort({_id: -1}).limit(limit).skip(skip).populate(['category', 'user']).then(function (contents) {
            res.render('admin/content_index', {
                userInfo: req.userInfo,
                contents: contents,
                count: count,
                limit: limit,
                pages: pages,
                page: page
            });
        });
    });

});
//获取内容添加的首页
router.get('/content/add', function (req, res) {
    Category.find().sort({_id: -1}).then(function (categories) {
        res.render('admin/content_add', {
            userInfo: req.userInfo,
            categories: categories
        })
    })

});
//内容添加的保存
router.post('/content/add', function (req, res) {
    // 验证提交不能为空
    if (req.body.category === "") {
        res.render("admin/error", {
            userInfo: req.userInfo,
            message: '内容分类不能为空'
        });
        return;
    }
    if (req.body.title === "") {
        res.render("admin/error", {
            userInfo: req.userInfo,
            message: '内容标题不能为空'
        });
        return;
    }
    new Content({
        user: req.userInfo,
        category: req.body.category,
        title: req.body.title,
        description: req.body.description,
        content: req.body.content
    }).save().then(function () {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '内容添加保存成功',
            url: "/admin/content"
        })
    })
});
//内容的修改,先得到要修改的内容
router.get('/content/edit', function (req, res) {
    var id = req.query.id || '';
    Category.find().sort({_id: -1}).then(function (categories) {
        Content.findOne({_id: id}).populate('category').then(function (content) {
            if (!content) {
                res.render('admin/error', {
                    userInfo: req.userInfo,
                    message: '指定内容不存在'
                });
            } else {
                res.render('admin/content_edit', {
                    userInfo: req.userInfo,
                    content: content,
                    categories: categories
                })
            }
        })
    });


});
//修改内容的保存
router.post('/content/edit', function (req, res) {
    var id = req.query.id || '';
    // 验证提交不能为空
    if (req.body.category === "") {
        res.render("admin/error", {
            userInfo: req.userInfo,
            message: '内容分类不能为空'
        });
        return;
    }
    if (req.body.title === "") {
        res.render("admin/error", {
            userInfo: req.userInfo,
            message: '内容标题不能为空'
        });
        return;
    }
    Content.update({_id: id}, {
        category: req.body.category,
        title: req.body.title,
        description: req.body.description,
        content: req.body.content
    }).then(function () {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '内容添加保存成功',
            url: "/admin/content"
        })
    });
});
//内容的删除
router.get('/content/delete', function (req, res) {
    var id = req.query.id || '';
    Content.remove({_id: id}).then(function () {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '内容删除成功',
            url: '/admin/content'
        })
    })
});

// //通过module对象返回数据
module.exports = router;