<template>
  <div id="SearchInListApp" class="SearchInListApp" v-loading="loading">
    <div class="panel">
      <div class="panel-row">
        <div class="panel-item">
          <span class="text-label">对应库中的列:</span>
          <el-select v-model="searchCol" placeholder="请选择" size="mini">
            <el-option
                v-for="item in colOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
            </el-option>
          </el-select>
        </div>
        <div class="panel-item" style="display: flex">
          <span class="text-label">总行数:</span>
          <span class="panel-item-count">{{ count }}</span></div>
      </div>
      <div class="panel-row">
        <div class="panel-item" style="width: 100px">
          <span class="text-label">多列分割类型:</span>
        </div>
        <div class="panel-item panel-input">
          <el-radio
              v-model="splitCharCode"
              size="mini"
              v-for="item in splitCharCodes"
              :key="item.value"
              :label="item.value">
            {{ item.label }}
          </el-radio>
          <el-input
              size="mini"
              style="width: 100px"
              placeholder=""
              v-model="splitCharDiy"
              :disabled="splitCharCode!='-1'">
          </el-input>
        </div>
        <div class="panel-item">
          <el-button type="primary" plain size="mini" @click="reSpliteTetxFile">执行文本分割</el-button>
        </div>
      </div>
    </div>
    <div class="content">
      <div class="tool">
        <div class="left">
          <el-button type="primary" icon="el-icon-folder-opened" size="mini" @click="openFile">打开文件</el-button>
          <el-button type="primary" icon="el-icon-document-copy" size="mini" @click="copyData">粘贴数据</el-button>
          <span class="text-label">(*单击表头可选中行与列)</span>

        </div>
        <div class="right">
          <el-switch
              v-model="headerRow"
              active-text="首行作为表头"
              @change=setHeaderRow
          >
          </el-switch>
          <el-button type="danger" plain icon="el-icon-s-open" @click=clean size="mini">清空</el-button>
          <el-button type="danger" plain icon="el-icon-delete" @click=deleteRow size="mini">删除</el-button>
        </div>
      </div>
      <div class="table" id="luckysheet">

      </div>
    </div>
  </div>
</template>

<script>
import 'luckysheet/dist/plugins/css/pluginsCss.css';
import 'luckysheet/dist/plugins/plugins.css';
import '../../public/luckysheet/dist/css/luckysheet.css';
import 'luckysheet/dist/assets/iconfont/iconfont.css';


import papaCSV from 'papaparse'
import Vue from 'vue'
import '../../public/search_inlist.css'
//import CryptoApi from 'crypto-api/src/index.mjs';
//Cannot find module 'core-js/library/xxx' when import element-ui #2275
//npm i async-validato@1.11.5
// var $ = require( "jquery" );
// var uuid = require( "uuid" );
// var clipboard   = require( "clipboard-js" );
// var spectrum  = require( "spectrum-colorpicker" );
// var jqueryUi = require( "jquery-ui" );
// var mousewheel   = require( "jquery.mousewheel" );
// var html2canvas   = require( "html2canvas" );
// var localforage     = require( "localforage" );
// var lodash   = require( "lodash" );
// var jStat     = require( "jStat" );
// var CryptoApi = {};
// $.sPage= function (){};

import luckySheet from 'luckysheet'
import luckyExcel from 'luckyexcel'

//统一异常处理
window.onerror = function (message, source, lineno, colno, error) {
  console.warn('捕获到异常：', arguments);
  //alert(error);
}
window.addEventListener("unhandledrejection", function (e) {
  console.warn('捕获到异常：', arguments);
  //alert(e.reason);
});

var supportColsConfig = {
  "TP_CARD_VIEW": [{
    value: 'PERSON_NUM',
    label: '人员编号'
  }, {
    value: 'CARD_NUM',
    label: '卡片号码'
  }, {
    value: 'MIS_PERSON_NUM',
    label: 'MIS人员编号'
  }, {
    value: 'SHENFEN_ID',
    label: '身份证号'
  }, {
    value: 'NAME',
    label: '姓名'
  }, {
    value: 'BIRTH_DATE ',
    label: '出生日期'
  }, {
    value: 'ID',
    label: '卡片ID'
  }],
  "LP_CASE_VIEW": [{
    value: 'CE_NUM',
    label: '案事件编号'
  }, {
    value: 'ABIS_CE_NUM',
    label: '指纹系统案事件编号'
  }, {
    value: 'SCENE_INVEST_NUM',
    label: '现勘号'
  }, {
    value: 'ACCEPT_POLICE_NUM',
    label: '接警号'
  }, {
    value: 'ID',
    label: '案事件ID'
  }],
  "LP_CARD_VIEW": [{
    value: 'CARD_NUM',
    label: '卡片号码'
  }, {
    value: 'CE_NUM',
    label: '案事件编号'
  }, {
    value: 'ABIS_CE_NUM',
    label: '指纹系统案事件编号'
  }, {
    value: 'SCENE_INVEST_NUM',
    label: '现勘号'
  }, {
    value: 'ACCEPT_POLICE_NUM',
    label: '接警号'
  }, {
    value: 'ID',
    label: '卡片ID'
  }, {
    value: 'CE_ID',
    label: '案事件ID'
  }],
  "MATCH_VIEW": [{
    value: 'QRY_NUM',
    label: '比对任务号码'
  }, {
    value: 'ID',
    label: '比对任务ID'
  }, {
    value: 'FIRST_SRC_CARD_NUM',
    label: '源卡卡号'
  }, {
    value: 'ABIS_CE_NUM',
    label: '指纹系统案事件编号'
  }, {
    value: 'PERSON_NUM',
    label: '人员编号'
  }]
};

export default {
  name: 'SearchInList',
  props: {
    tableName: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      count: 0,//总记录数
      fileTemp: null,//本地文件缓存
      copyTemp: null,//本地粘贴数据缓存
      loading: false,//加载中标识
      splitCharCode: ",",
      splitCharDiy: "",
      splitCharCodes: [
        {
          value: ',',
          label: '逗号'
        },
        {
          value: ' ',
          label: '空格'
        },
        {
          value: '\t',
          label: 'Tab'
        },
        {
          value: '-1',
          label: '自定义'
        }
      ],
      searchCol: "",
      colOptions: [],
      headerRow: null,//首行设置为表头
      sheetOptions: {
        container: 'luckysheet',
        lang: 'zh',
        showinfobar: false,
        showtoolbar: false,
        showsheetbar: false,
        showstatisticBar: false,
        showstatisticBarConfig: {
          zoom: true
        },
        cellRightClickConfig: {
          copy: true, // 复制
          copyAs: false, // 复制为
          paste: true, // 粘贴
          insertRow: true, // 插入行
          insertColumn: true, // 插入列
          deleteRow: true, // 删除选中行
          deleteColumn: true, // 删除选中列
          deleteCell: true, // 删除单元格
          hideRow: false, // 隐藏选中行和显示选中行
          hideColumn: false, // 隐藏选中列和显示选中列
          rowHeight: false, // 行高
          columnWidth: false, // 列宽
          clear: false, // 清除内容
          matrix: false, // 矩阵操作选区
          sort: false, // 排序选区
          filter: false, // 筛选选区
          chart: false, // 图表生成
          image: false, // 插入图片
          link: false, // 插入链接
          data: false, // 数据验证
          cellFormat: false // 设置单元格格式
        }, data: [{
          "name": "Sheet1",
          "color": "",
          "status": "1",
          "order": "0",
          "data": [],
          "config": {},
          "index": 0,
          "zoomRatio": 1
        }]
      },
      csvOptions: {
        delimiter: "",	// 分隔符,不填自动判断
        newline: "",	// 换行符,不填自动判断
        delimitersToGuess: [',', '\t', '|', ';', ' ', papaCSV.RECORD_SEP, papaCSV.UNIT_SEP],//支持的分隔符
      },
      sheetLastUpdateTime: null,
      rowLimit: 1000,
      colNamesToGuess: ["ID", "PERSON_NUM", "CARD_NUM", "SHENFEN_ID", "CE_NUM",
        "ABIS_CE_NUM", "SCENE_INVEST_NUM", "QRY_NUM", "FIRST_SRC_CARD_NUM",
        "人员编号", "卡片号码", 'MIS人员编号', '身份证', '身份证号', '身份证号码', '案事件编号',
        '指纹系统案事件编号', '现勘号', '物证号', '比对任务号码', '源卡卡号', '姓名', '人员类别',
        '人员上报编号', '案件上报编号', '上报编号', '接警号', 'ACCEPT_POLICE_NUM']//根据关键字数组，自动判断表头
    }
  },
  methods: {
    setHeaderRow() {//更新表头 样式
      if (this.headerRow) {
        luckySheet.frozenFirstRow();
        //var length =luckysheet.getSheetData()[0].length;
        for (let i = 0; i < 10; i++) {
          luckySheet.setCellValue(0, i, {fc: "#ff0000", bl: 1})
        }
      } else {
        luckySheet.cancelFrozen()
        for (let i = 0; i < 10; i++) {
          luckySheet.setCellValue(0, i, {fc: "#000", bl: 0})
        }
      }
    },
    copyData() {
      if (navigator.clipboard) {
        navigator.clipboard.readText().then(text => {
          console.log('Pasted content: ', text);
          this.parseCSV(text)
        }).catch(() => {
          throw "剪切板读取权限被禁用。请选中表格，使用ctrl+v,进行粘贴";
        })
      } else {
        throw "当前环境不支持读取剪切板。请选中表格，使用ctrl+v,进行粘贴";
      }
    },
    openFile() {
      var _this = this;
      var fileInputId = "in_list_file_input_id";
      //反复上传同一个文件，不会触发change，所以需要移除掉
      $("#" + fileInputId).remove();
      $("body").append('<input id="' + fileInputId + '" type="file" multiple accept=".txt,.cas,.xlsx"  style="display:none;">');
      var $file = $("#" + fileInputId);
      //完成选择文件
      $file.change(function (evt) {
        console.log("打开本地文件");
        var files = evt.target.files;
        if (files == null || files.length === 0) {
          return;
        }
        let file = files[0];
        _this.parseFile(file);
      });
      //点击文件，打开选择文件对话框
      $file.click();
    },
    /**
     * 手动重新执行文本分隔
     */
    reSpliteTetxFile() {
      var splitChar = this.splitCharCode;
      if (splitChar === "-1") {
        splitChar = this.splitCharDiy;
      }
      if (this.fileTemp) {
        this.parseFile(this.fileTemp, splitChar)
      } else if (this.copyTemp) {
        this.parseCSV(this.copyTemp, splitChar)
      } else {
        throw "请先导入数据";
      }
    },
    /**
     * 文件解析
     * @param file
     * @param delimiter 分隔符，不传可自动判断
     * @param charset 字符集，缺省为
     */
    parseFile(file, delimiter, charset) {
      console.time("parseFile");
      this.fileTemp = file;
      this.copyTemp = null;
      this.headerRow = null;
      var _this = this;
      let name = file.name;
      let suffixArr = name.split("."), suffix = suffixArr[suffixArr.length - 1];
      if (suffix === "xlsx") {
        console.timeLog("parseFile", "Excel");
        luckyExcel.transformExcelToLucky(file, function (exportJson) {
          if (exportJson.sheets == null || exportJson.sheets.length === 0) {
            throw "xlsx解析失败";
          }
          _this.loadSheet(exportJson.sheets);
        });
      } else if (suffix === "txt" || suffix === "csv") {
        console.timeLog("parseFile", "csv");
        getText(file, charset).then(text => {
          _this.parseCSV(text, delimiter);
        })
      } else {
        console.timeEnd("parseFile");
        throw "目前支持xlsx、txt、csv。如果是xls文件需要转换为xlsx；或者打开文件进行复制，使用【粘贴数据】。";
      }
      console.timeEnd("parseFile");

      async function getText(file, charset) {
        if (charset) {
          return await readAsText(file, charset)
        } else {//自动判断编码
          let str = await readAsText(file, "utf-8");
          if (str.indexOf("�") !== -1) {
            return await readAsText(file, "GBK")
          } else {
            return str
          }
        }
      }

      function readAsText(file, charset) {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.readAsText(file, charset)
          reader.onload = function (evt) {
            resolve(evt.target.result);
          };
        });
      }

    },
    parseCSV(str, delimiter) {
      console.time("parseCSV");
      this.fileTemp = null;
      this.copyTemp = str;
      this.headerRow = null;
      var _this = this;
      var options = Object.assign({}, this.csvOptions, {
        delimiter: delimiter || "",	// 分隔符,不填自动判断
        complete: function (results) {
          var sheets = buildSheets(results.data)
          console.timeEnd("parseCSV");
          _this.loadSheet(sheets);
        }
      });
      papaCSV.parse(str, options);

      /**
       * 构造sheet 单元格数据
       * @param data 行列的二维数组
       * @returns 单元格的一维数组
       */
      function buildSheets(data) {
        var celldata = [];
        var sheets = [{"celldata": celldata}];
        if (data) {
          for (let index in data) {
            let row = data[index];
            if (Object.prototype.toString.call(row) === '[object Array]') {
              for (let cindex in row) {
                celldata.push({
                  "r": index,
                  "c": cindex,
                  "v": {
                    "ct": {//单元格值格式
                      "fa": "General",
                      "t": "s"
                    },
                    "fs": 10,//字体大小
                    "ff": "Arial",//字体
                    "tb": 0,//文本换行
                    "v": row[cindex],
                    "qp": 1
                  }
                })
              }
            } else {
              console.error("buildSheets格式错误")
            }
          }
        }
        return sheets;
      }
    },
    /**
     * 更新Excel
     * @param sheets  Excel数据
     */
    loadSheet(sheets) {
      console.time("loadSheet");
      if (!sheets) {
        //获取初始配置
        var sheet = Object.assign({}, this.sheetOptions.data[0]);
        sheets = [sheet];
      } else {
        for (var index in sheets) {
          sheets[index] = Object.assign({}, this.sheetOptions.data[0], sheets[index]);
        }

      }
      var sheetOptions = Object.assign({}, this.sheetOptions, {
        data: sheets, hook: {
          updated: (operate) => {
            if (operate.type == "delRC") {
              this.updateData();
            }else if(operate.type =='datachange'){
              //fix 手动修改表格数据  触发数据更新
              this.updateData();
            }
          },
          rowTitleCellRenderBefore: (options) => {

          },
          workbookCreateAfter: (json) => {
            this.loading = false;
            this.updateData();
            this.detectRange();
          }
        }
      });
      if (sheetOptions) {
        var sheet = sheetOptions && sheetOptions.data && sheetOptions.data[0];
        var count = sheet && sheet.celldata && sheet.celldata.length;
        var lastCell = null;
        console.log("导入单元格数量", count);
        if (count) {
          lastCell = sheet.celldata[count - 1];
          var rowCount = sheet.celldata[count - 1].r;
          if (rowCount > this.rowLimit) {
            throw "记录数过多，超过" + this.rowLimit;
          }
          if (count > 100 * 100) {
            //大量单元格加载,增加加载提示
            this.loading = true;
            this.$forceUpdate();
          }
        }
      }
      /**
       * 改成异步延时加载。
       * GUI渲染线程与JS引擎线程是互斥的，所以如果JS执行的时间过长，这样就会造成页面的渲染不连贯，导致页面渲染加载阻塞。。。
       */
      setTimeout(function () {
        luckySheet.destroy();
        luckySheet.create(sheetOptions);
        console.timeEnd("loadSheet");
      }, 30);
    },
    /**
     * 获取查询条件
     */
    getWhereParam() {
      if (!this.searchCol) {
        throw "请选择对应库中的列";
      }
      if (this.count === 0) {
        throw "选中的数据为空";
      }
      var selectJson = luckySheet.getRangeJson();
      var count = selectJson.length;
      var cols = Object.keys(selectJson[0]).length;
      if (cols > 1 || count < this.count) {
        throw "请点击表头选中一列数据";
      }
      var values = [];
      var where = [{
        "colName": this.searchCol,
        "dataType": 0,
        "values": values
      }];
      //过滤表头、空行
      let gridColKey = Object.keys(selectJson[0])[0];
      for (let index in selectJson) {
        if (index === "0" && this.headerRow) {
          continue;
        }
        let rowData = selectJson[index];
        if (rowData[gridColKey]) {
          var value = rowData[gridColKey];
          if (value.trim) {
            value = value.trim();
          }
          values.push(value);
        }
      }
      if (values.length === 0) {
        throw "选中的数据为空";
      }
      return where;

    },
    clean() {
      this.headerRow = null;
      this.loadSheet();
    },
    deleteRow() {
      var range = luckySheet.getRange();
      var rowRange = range[0].row;
      luckySheet.deleteRow(rowRange[0], rowRange[1]);
      this.updateData();
    },
    updateData() {//数据变化后，更新总数、表头配置,缺省选区
      var time = new Date().getTime();
      //避免循环更新，引起死循环
      if (this.sheetLastUpdateTime && (time - this.sheetLastUpdateTime < 1000)) {
        return
      } else {
        this.sheetLastUpdateTime = time
      }
      var count = 0;
      var data = luckySheet.getSheetData();
      //过滤空行
      for (let index in data) {
        let exist = false
        let rowData = data[index];
        if (index == 0) {
          if (this.headerRow !== false) {
            this.detectHeader(rowData);
            this.setHeaderRow();
          }
        }
        for (let key in rowData) {
          if (rowData[key] !== null) {
            exist = true;
            break;
          }
        }
        if (exist) {
          count++;
        }
      }
      this.count = count;
    },
    detectRange() {//设置缺省选区,选中第一列
      luckySheet.setRangeShow([
        {
          "row": [0, this.count - 1],
          "column": [0, 0],
        }
      ]);
    },
    detectHeader(rowData) {//自动判断是否存在表头
      if (!rowData) {
        return;
      }
      this.headerRow = false;
      var line = "";
      for (let key in rowData) {
        if (rowData[key] !== null) {
          line = line + "," + rowData[key].v + ",";
        }
      }
      console.log("header line", line)
      //根据列关键字判断 是否是表头
      for (let key in this.colNamesToGuess) {
        if (line.indexOf("," + this.colNamesToGuess[key] + ",") > -1) {
          this.headerRow = true;
          break;
        }
      }
    }
  },
  mounted() {
    var _this = this;
    this.tableName = this.tableName.toUpperCase();
    if (!supportColsConfig[this.tableName]) {
      throw "当前列表不支持列表中检索:" + this.tableName;
    }
    this.colOptions = supportColsConfig[this.tableName];
    this.loadSheet();
    //监听用户粘贴操作
    document.addEventListener('paste', (ev) => {
      ev.clipboardData.items[0].getAsString(text => {
        console.log(text);
        _this.parseCSV(text)
      });
    });
  }
}
</script>
