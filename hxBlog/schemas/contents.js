var mongoose = require('mongoose');
//分类的表结构
module.exports = new mongoose.Schema({
    //关联字段--内容分类的id-
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    //关联字段--用户id
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    //添加时间
    addTime: {
        type: Date,
        default: new Date()
    },
    //点击数量
    views: {
        type: Number,
        default: 0
    },
    //内容的标题
    title: String,
    //内容的简介
    description: {
        type: String,
        default: ''
    },
    //内容
    content: {
        type: String,
        default: ''
    },
    //评论存储
    comments: {
        type: Array,
        default: []

    }


});