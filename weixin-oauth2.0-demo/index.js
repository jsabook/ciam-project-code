// index.js
const express = require('express')
const request = require('request') //用于请求外部API（如https://api.weixin.qq.com/sns/oauth2/）的插件
const app = express()
const port = 80
let AppID = '<APPID>'
let AppSecret = '<APPSecret>'
let code = ''
 
app.get('/getCode', (req, res) => {
    let return_uri = '<url>'//'http://ec2-3-17-25-12.us-east-2.compute.amazonaws.com/auth'
    let scoped = 'snsapi_userinfo'
    let state = '123'
    console.log("access...")
    res.redirect(`https://open.weixin.qq.com/connect/oauth2/authorize?appid=${AppID}&redirect_uri=${return_uri}&response_type=code&scope=${scoped}&state=STATE#wechat_redirect`)
})

app.get('/auth',(req,res)=>{
    code = req.query.code
    console.log('得到授权码code：', code)
    request.get(
        {
            url:`https://api.weixin.qq.com/sns/oauth2/access_token?appid=${AppID}&secret=${AppSecret}&code=${code}&grant_type=authorization_code`
        },(error,response,body)=>{
            if(response.statusCode == 200){
                let data = JSON.parse(body)
                console.log('data answer')
                console.log(data)
                let access_token = data.access_token;
                let openid = data.openid;
                res.redirect(`/Usermessage?access_token=${access_token}&openid=${openid}`)
            }
        }
    )
})
app.get('/Usermessage',(req,res)=>{

    let access_token = req.query.access_token
    let openid = req.query.openid
    request.get(
        {
            url:`https://api.weixin.qq.com/sns/userinfo?access_token=${access_token}&openid=${openid}&lang=zh_CN`
        }, // 调用获取用户信息的api
        function(error,response,body){
            let userinfo = JSON.parse(body);
            console.log(userinfo)
                if (userinfo.sex === 0){
                    sex = "男"
                } else {
                    sex = "女"
                }
                res.send(`\
                    <h1>个人信息</h1>
                    <p><img src='${userinfo.headimgurl}' /></p>
                    <p>${userinfo.city} ${userinfo.province} ${userinfo.country}</p>
                    <hr/>
                    <p>姓名: ${userinfo.nickname} 性别:${sex}</p>
                    <hr/>
                `);
            }
    )
    
})

app.listen(port, () => {
    console.log('可以启动啦'+'http://localhost')
})