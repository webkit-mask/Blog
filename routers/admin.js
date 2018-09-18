let express = require('express')
let router = express.Router();
let User = require('../models/user');
let Category = require('../models/category');
let Content = require('../models/content');

router.use(function (req, res, next) {
    if (!req.userInfo.isAdmin) {
        // 如果当前用户是非管理员
        res.send('对不起，只有管理员才可以进入后台管理')
        return
    }
    next()
})

/**
 * 首页
 */
router.get('/', function (req, res, next) {
    res.render('admin/index', {
        userInfo: req.userInfo
    })
})
/**
 * 用户管理
 */
router.get('/user', function (req, res) {
    // 从数据库中读取所有用户数据
    // limit(Number): 限制获取数据条数
    // skip(): 忽略数据的条数
    // 每页显示两条
    // 1: 1-2 skip:0    -> (当前页-1) * limit
    // 2: 3-4 skip:2

    let page = Number(req.query.page || 1);

    let limit = 10;
    let pages = 0;

    User.count().then(function (count) {
        
        // 计算总页数 = 总条数 / 每页条数
        pages = Math.ceil(count / limit);
        // 取值不能超过pages
        page = Math.min( page, pages )
        // 取值不能小于1
        page = Math.max( page, 1 )

        let skip = (page - 1) * limit;

        User.find().limit(limit).skip(skip).then(function (users) {
            res.render('admin/user_index', {
                userInfo: req.userInfo,
                users: users,
                // 总条数
                count: count,
                // 总页数
                pages: pages,
                // 每页显示多少条
                limit: limit,
                // 当前是多少页
                page: page,
            })
        });
    })
})
/**
 * 分类管理
 */
router.get('/category', function (req, res) {

    let page = Number(req.query.page || 1);

    let limit = 10;
    let pages = 0;

    Category.count().then(function (count) {

        // 计算总页数 = 总条数 / 每页条数
        pages = Math.ceil(count / limit);
        // 取值不能超过pages
        page = Math.min(page, pages)
        // 取值不能小于1
        page = Math.max(page, 1)

        let skip = (page - 1) * limit;
    
        // sort: 1: 升序   -1: 降序
        Category.find().sort({ _id: -1 }).limit(limit).skip(skip).then(function (categories) {
            res.render('admin/category_index', {
                userInfo: req.userInfo,
                categories: categories,
                // 总条数
                count: count,
                // 总页数
                pages: pages,
                // 每页显示多少条
                limit: limit,
                // 当前是多少页
                page: page,
            })
        });
    })
})
/** 
 * 分类的添加
 */
router.get('/category/add', function (req, res) {
    res.render('admin/category_add', {
        userInfo: req.userInfo
    })
})
/**
 * 分类的保存
 */
router.post('/category/add', function (req, res) {
    let name = req.body.name || '';
    // 当用户名为空
    if (name == '') {
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '名称不能为空'
        })
        return;
    }
    // 数据库中是否存在同名的分类名称
    Category.findOne({
        name: name
    }).then(function (rs) {
        if (rs) {
            // 表示在数据库中存在该分类
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '该分类已经存在'
            })
            return Promise.reject();
        } else {
            // 数据库中不存在该分类，可以保存
            return new Category({
                name: name 
            }).save()
        }
    }).then(function (newCategory) {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '分类保存成功',
            url: '/admin/category'
        })
    })


})
/**
 * 分类修改
 */
router.get('/category/edit', function (req, res) {  
    // 获取要修改的分类的信息，并用表单形式展示出来
    let id = req.query.id || '';
    // 获取要修改的分类信息
    Category.findOne({
        _id: id
    }).then(function (category) {
        if (!category) {
            res.render('admin/error',{
                userInfo: req.userInfo,
                message: '分类信息不存在'
            })
        } else {
            res.render('admin/category_edit', {
                userInfo: req.userInfo,
                category: category
            })  
        }
    })
})
/**
 * 分类的修改保存
 */
router.post('/category/edit', function (req, res) {
    // 获取要修改的分类信息，并且用表单的形式展现出来
    let id = req.query.id || '';
    // 获取post 提交过来的分类名称
    let name = req.body.name || '';

    Category.findOne({
        _id: id
    }).then(function (category) {
        if (!category) {
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '分类信息不存在'
            })
            return Promise.reject()
        } else {
            // 当用户没有做任何修改提交的时候
            if ( name == category.name ) {
                res.render('admin/success', {
                    userInfo: req.userInfo,
                    message: '修改成功',
                    url: '/admin/category'
                })
                return Promise.reject()
            } else {
                // 要修改的分类名称是否已经在数据库中存在
                return Category.findOne({
                    _id: {$ne: id},
                    name: name
                })
            }
        }
    }).then(function (sameCategory) {
        if (sameCategory) {
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '数据库中有同名存在分类'
            })
            return Promise.reject()
        } else {
            return Category.update({
                _id: id
            }, {
                name: name
            })
        }
    }).then(function () {
        res.render('admin/success', {
            userInfo: res.userInfo,
            message: '修改成功',
            url: '/admin/category'
        })
    })
})
/**
 * 分类删除
 */
router.get('/category/delete', (req, res) => {
    
    // 获取要删除的分类的id
    let id = req.query.id || '';

    Category.remove({
        _id: id
    }).then(() => {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '删除成功',
            url: '/admin/category'
        })
    })
})
/**
 * 内容首页
 */
router.get('/content', (req, res) => {
    // Content.find().then((content) => {
    //     res.render('admin/content_index', {
    //         userInfo: req.userInfo,
    //         content: content
    //     })
    // })
    let page = Number(req.query.page || 1);

    let limit = 10;
    let pages = 0;

    Content.count().then(function (count) {

        // 计算总页数 = 总条数 / 每页条数
        pages = Math.ceil(count / limit);
        // 取值不能超过pages
        page = Math.min(page, pages)
        // 取值不能小于1
        page = Math.max(page, 1)

        let skip = (page - 1) * limit;

        // sort: 1: 升序   -1: 降序
        Content.find().sort({ _id: -1 }).limit(limit).skip(skip).populate(['category','user']).then(function (contents) {
            res.render('admin/content_index', {
                userInfo: req.userInfo,
                contents: contents,
                // 总条数
                count: count,
                // 总页数
                pages: pages,
                // 每页显示多少条
                limit: limit,
                // 当前是多少页
                page: page,
            })
        });
    })
})
/**
 * 内容添加页面
 */
router.get('/content/add', (req, res) => {

    Category.find().then((categories) => {
        res.render('admin/content_add', {
            userInfo: req.userInfo,
            categories: categories
        })
    })
   
})
/**
 * 内容保存
 */
router.post('/content/add', (req, res) => {

    if ( req.body.category == '' ) {
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '内容分类不能为空'
        })
        return;
    }

    if ( req.body.title == '' ) {
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '内容标题不能为空'
        })
        return;
    }

    // 保存数据到数据库
    new Content({
        category: req.body.category,
        title: req.body.title,
        user: req.userInfo._id.toString(),
        description: req.body.description,
        content: req.body.content
    }).save().then((rs) => {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '内容保存成功',
            url: '/admin/content'
        })
    })
})
/**
 * 修改内容
 */
router.get('/content/edit', (req, res) => {
    // 获取要修改的分类信息，并且用表单的形式展现出来
    let id = req.query.id || '';
    // 获取 post 提交过来的名称
    let name = req.body.name || '';

    let categories = []

    Category.find().sort({_id: -1}).then((rs) => {

        categories = rs;

        return Content.findOne({
            _id: id
        }).populate('category');
    }).then((content) => {
        if (!content) {
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '指定内容不存在'
            })
            return Promise.reject()
        } else {
            res.render('admin/content_edit', {
                userInfo: req.userInfo,
                categories: categories,
                content: content
            })
        }
    })

})
/**
 * 修改保存
 */
router.post('/content/edit', (req, res) => {
    let id = req.query.id || '';

    if ( req.body.category == '' ) {
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '内容分类不能为空'
        })
        return;
    }

    if ( req.body.title == '' ) {
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '内容标题不能为空'
        })
        return;
    }

    Content.update({
        _id: id
    }, {
        category: req.body.category,
        title: req.body.title,
        description: req.body.description,
        content: req.body.content,
    }).then(() => {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '内容保存成功',
            url: '/admin/content/edit?id=' + id
        })
    })
})
/**
 * 内容删除
 */
router.get('/content/delete', (req, res) => {
    let id = req.query.id || '';
    Content.remove({
        _id: id
    }).then(() => {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '删除成功',
            url: '/admin/content'
        })
    })
})
module.exports = router;    