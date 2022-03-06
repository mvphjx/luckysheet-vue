# luckysheet-vue
luckysheet封装，目标是解决必须通过link引起的缺陷

## 背景&问题

luckysheet库，目前只支持link方式引入。

```javascript
<link rel='stylesheet' href='./plugins/css/pluginsCss.css' />
<link rel='stylesheet' href='./plugins/plugins.css' />
<link rel='stylesheet' href='./css/luckysheet.css' />
<link rel='stylesheet' href='./assets/iconfont/iconfont.css' />
<script src="./plugins/js/plugin.js"></script>
<script src="./luckysheet.umd.js"></script>
```
查看源代码发现，打包工具使用了gulpfile.js，输出的dist/luckysheet.esm.js支持es6导入。
但是pluginsJs依赖了多个本地js库，然后进行了合并打包，输出的plugin.js不支持模块导入。
```javascript
pluginsJs:[
'node_modules/jquery/dist/jquery.min.js', //"jquery": "^2.2.4"
'node_modules/uuid/dist/umd/uuid.min.js', //"uuid": "^8.3.2"
'src/plugins/js/clipboard.min.js',//clipboard  "clipboard-js": "^0.3.6"
'src/plugins/js/spectrum.min.js',//$.spectrum "spectrum-colorpicker":"1.8.1"
'src/plugins/js/jquery-ui.min.js',//jquery-ui":"1.13.1"
'src/plugins/js/jquery.mousewheel.min.js',//$.mousewheel  "jquery.mousewheel":"3.1.9"
'src/plugins/js/html2canvas.min.js', //html2canvas  "html2canvas":"0.5.0"
'src/plugins/js/localforage.min.js', //localforage  "localforage":"1.10.0"
'src/plugins/js/lodash.min.js', //"lodash":"4.17.21"
'src/plugins/js/jstat.min.js', //jStat  "jstat":"1.9.5"
'src/plugins/js/crypto-api.min.js',  //CryptoApi  "crypto-api":"0.8.5"
'src/plugins/js/jquery.sPage.min.js' //$.sPage  "":""
]
```
版本v0.1，除去plugin.js外，其他代码支持import。后续版本再优化pluginsJs涉及的本地js库

## 引入组件

index.html中引入   
```javascript
<script src="luckysheet/plugin.js"></script>
```

业务组件中引入
```javascript
import 'luckysheet/dist/plugins/css/pluginsCss.css';
import 'luckysheet/dist/plugins/plugins.css';
//因为原始的luckysheet.css的ico文件 目录不对？所以编译不过，改了一下
import '@/../public/luckysheet/dist/css/luckysheet.css';
import 'luckysheet/dist/assets/iconfont/iconfont.css';
import luckySheet from 'luckysheet'
import luckyExcel from 'luckyexcel'
import papaCSV from 'papaparse'
//以下为项目自定义内容
import '@/../public/search_inlist.css'
```


##  组件介绍  

功能：导入列表，进行检索
