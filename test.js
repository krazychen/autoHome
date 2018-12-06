const json2csv = require('json2csv');
const fs = require('fs');
const iconv = require('iconv-lite');

let tt="新疆：\\t";

console.log(tt.replace(/：\\t/ig,""))

let chars = ['A', 'B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'W', 'X', 'Y', 'Z'];
const brands=[];
chars.forEach(function (cs) {
    const pageId = "#html" + cs;
    console.log(pageId)
});

const fields =  ['name','tele','phone','fax','company','address'];
const myCars = [ { name: '陈其煊',
    tele: '86 0592 6100276',
    phone: '登录后可见',
    fax: '86',
    company: '厦门千鹿贸易有限公司',
    address: '中国 福建 厦门市集美区杏锦路IOI园博湾6号楼407' },
    { name: '陈其煊',
        tele: '86 0592 6100276',
        phone: '登录后可见',
        fax: '86',
        company: '厦门千鹿贸易有限公司',
        address: '中国 福建 厦门市集美区杏锦路IOI园博湾6号楼407' },
    { name: '张余娣',
        tele: '登录后可见',
        phone: '登录后可见',
        fax: '86',
        company: '厦门市集美区萌缘宠物店',
        address: '中国 福建 厦门市集美区杏林村苑东路88-2萌缘宠物店' },
    { name: 'no data' },
    { name: '张余娣',
        tele: '登录后可见',
        phone: '登录后可见',
        fax: '86',
        company: '厦门市集美区萌缘宠物店',
        address: '中国 福建 厦门市集美区杏林村苑东路88-2萌缘宠物店' } ]
;

let writerStream = fs.createWriteStream('productLinks-'+'.txt');
writerStream.write(JSON.stringify(myCars, undefined, 2), 'UTF8');
writerStream.end();

const csv = json2csv.parse(myCars, { fields: fields});
fs.writeFile('file.csv', csv, function(err) {
    if (err) throw err;
    console.log('file saved');
});


const csv2 = json2csv.parse(myCars, { fields: fields});
const newCsv = iconv.encode(csv2, 'GBK'); // 转编码
console.log(newCsv);
fs.writeFile('file1.csv', newCsv, function(err) {
    if (err) throw err;
    console.log('file saved');
});