/**
 * 应用程序的启动（入口)文件
 */

// 加载express 模块
const  express = require('express');
// 加载模板处理模块
const swig = require('swig');
// 加载数据库模块
const mongoose = require('mongoose')
// 加载body-paeser , 用来处理post 提交过来的数据
const bodyParser = require('body-parser')
// 加载 cookies 模块
const cookies = require('cookies')

const User = require('./models/user')
// 创建app 应用 =>Nodejs Http.createServer()
const app = express();

// 设置静态文件托管
// 当用户访问的 url 以 /public 开始，那么返回对应 __dirname + '/public' 的文件
app.use('/public', express.static(__dirname + '/public'))

// 配置应用模板
// 定义当前所使用的模板引擎
// 第一个参数 表示模板引擎的名称，同时也是模板引擎的后缀
// 第二个参数 表示用于解析处理模板内容的方法
app.engine('html', swig.renderFile)

// 设置模板文件存放的目录
// 第一个参数 必须是views
// 第二个参数 目录 
app.set('views', './views')

// 注册所使用的模板引擎
// 第一个参数 必须是 view engine
// 第二个参数 和 app.engine 这个方法中定义的模板引擎的名称（第一个参数） 一致
app.set('view engine', 'html')

// 在开发过程中，需要取消模板缓存
swig.setDefaults({cache: false})

// bodyparser 设置
app.use( bodyParser.urlencoded({extends: true}) )

// cookies 设置
app.use(function ( req, res, next ) {
    req.cookies = new cookies(req, res);

    req.userInfo = {}

    // 解析登录用户的cookies信息
    if ( req.cookies.get('userInfo') ) {
        try {
            req.userInfo = JSON.parse(req.cookies.get('userInfo'));
            // 获取当前登录用户类型，是否为管理员
            User.findById(req.userInfo._id).then((userInfo) => {
                req.userInfo.isAdmin = Boolean(userInfo.isAdmin)
                next()
            })
        } catch (e) {
            next()
        }
    } else {
        next()
    }
})

// 根据不同的功能划分不同的模块
app.use('/admin', require('./routers/admin'));
app.use('/api', require('./routers/api'));
app.use('/', require('./routers/main'));

// 监听http
mongoose.connect('mongodb://localhost:27017/blog', function (err) {
    if (err) {
        console.log('数据库连接失败')
    } else {
        console.log('数据库连接成功')
        app.listen(8081)
    }
})


// 首先由用户发送http 请求 -> url -> 解析路由 -> 找到匹配的规则 -> 执行指定的绑定函数，返回绑定的内容至用户

// /public -> 静态文件 -> 直接读取指定目录吓得文件，返回给客户
//         -> 动态文件 -> 处理业务逻辑，加载模板 -> 返回数据给用户