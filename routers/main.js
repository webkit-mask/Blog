let express = require('express');
let Category = require('../models/category');
let Content = require('../models/content');
let router = express.Router();
router.use((req, res, next) => {
    data = {
        userInfo: req.userInfo,
        categories: [],
    }
    Category.find().then((categories) => {
        data.categories = categories;
        next()
    })
})
/**
 * 首页
 */
router.get('/', function (req, res, next) {

        data.category= req.query.category || '';
        data.page= Number(req.query.page || 1);
        data.limit= 2;
        data.pages= 0;
        data.count= 0;

    let where = {}

    if (data.category) {
        where.category = data.category
    }

    // 读取数据库所有分类信息
    Content.where(where).count().then((count) => {
        data.count = count;
        // 计算总页数 = 总条数 / 每页条数
        data.pages = Math.ceil(data.count / data.limit);
        // 取值不能超过pages
        data.page = Math.min(data.page, data.pages)
        // 取值不能小于1
        data.page = Math.max(data.page, 1)

        let skip = (data.page - 1) * data.limit;

        return Content.where(where).find().limit(data.limit).skip(skip).populate(['category', 'user']).sort({addTime: -1})

    }).then((contents) => {
        data.contents = contents;
        res.render('main/index', data)
    })
})
/**
 * 内容详情页展示
 */
router.get('/view', (req, res) => {
    let contenId = req.query.contenId || '';
    Content.findOne({
        _id: contenId
    }).then((content) => {
        data.content = content;
        content.views++;
        content.save();
        res.render('main/view', data)
    })
})

module.exports = router;