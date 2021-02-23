/*
 * @Author: your name
 * @Date: 2021-02-22 14:11:54
 * @LastEditTime: 2021-02-23 10:44:43
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \drawing-webpack\scripts\createIndex.js
 */
let  fs = require('fs');
let path = require('path')
let  join = require('path').join;

let pathReseach=path.resolve(__dirname, "../drawing");
function createIndex(){
    let fileNames=findSync(pathReseach);
    let importFiles='';
    let pathReseachReg=pathReseach.replace(/\\/g,'\\/');
    fileNames.forEach((val,index)=>{
        val=val.replace(/\\/g,'/');
        val=val.replace(eval("/"+pathReseachReg+"/g"),".");
        val=val.replace(".ts","");
        importFiles+=`import * as any${index} from "${val}";\n export {any${index}}\n`;
    })
    console.log(importFiles)
    //生成文件
    WriteFile(path.resolve(__dirname, "../drawing/index.ts"), importFiles)
    .then(res => {
        console.log('已经生成', 'green');
    })
    .catch(err => {
        console.log(err);
    });

}

function findSync(startPath) {

    let result=[];

    function finder(path) {

        let files=fs.readdirSync(path);

        files.forEach((val,index) => {

            let fPath=join(path,val);

            let stats=fs.statSync(fPath);

            if(stats.isDirectory()) finder(fPath);

            if(stats.isFile()) result.push(fPath);

        });
    }

    finder(startPath);
    return result;

}


// 文件写入
function WriteFile(filename, data, options) {
  return new Promise((resolve, reject) => {
      fs.writeFile(filename, data, options, err =>
          err === null ? resolve(filename) : reject(err)
      );
  });
}

createIndex()

module.exports={
    createIndex
}