// ExpressJS调用方式
var express = require('express');
var fs = require('fs');
var app = express();
port = process.env.p || 3000;
var path = require('path')

app.listen(port, function () {
    console.log('app start listening on port ' + port + '!');
});


// if(process.env.clear) {
//     function deleteFolder(path) {
//         var files = [];
//         if( fs.existsSync(path) ) {
//             files = fs.readdirSync(path);
//             files.forEach(function(file,index){
//                 var curPath = path + "/" + file;
//                 if(fs.statSync(curPath).isDirectory()) { // recurse
//                     deleteFolder(curPath);
//                 } else { // delete file
//                     fs.unlinkSync(curPath);
//                 }
//             });
//             fs.rmdirSync(path);
//         }
//     }
//     deleteFolder('./statics');
// }


app.get('/*', function(req, res){
    
    // 完整URL
    var url = req.protocol + '://'+ req.hostname + req.originalUrl;

    // 预渲染后的页面字符串容器
    var content = '';
    var filePath='./statics/'+url.replace(/\//g,'')+'.html';
    if(fs.existsSync(filePath)){

        fs.readFile(filePath,function (err,data){
            res.send(data.toString());
        });

    }else{
        // 引入NodeJS的子进程模块
        var child_process = require('child_process');
        // 开启一个phantomjs子进程
        var phantom = child_process.spawn('phantomjs', ['spider.js', url]);

        // 设置stdout字符编码
        phantom.stdout.setEncoding('utf8');

        // 监听phantomjs的stdout，并拼接起来
        phantom.stdout.on('data', function(data){
            content += data.toString();
        });

        // 监听子进程退出事件
        phantom.on('exit', function(code){
            switch (code){
                case 1:
                    console.log('加载失败');
                    res.send('加载失败');
                    break;
                case 2:
                    console.log('加载超时: '+ url);
                    res.send('加载超时');
                    break;
                default:
                    res.send(content);
                    break;
            }

        });



    }


    
});
