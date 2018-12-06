const json2csv = require('json2csv');
const fs = require('fs');

let tt="新疆：\\t";

console.log(tt.replace(/：\\t/ig,""))

let chars = ['A', 'B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'W', 'X', 'Y', 'Z'];
const brands=[];
chars.forEach(function (cs) {
    const pageId = "#html" + cs;
    console.log(pageId)
});

const fields =  ['name','tele','phone','fax','company','address'];
const myCars = [ { name: 'load unready' },
    { name: 'load unready' },
    { name: 'load unready' } ];
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
fs.writeFile('file1.csv', csv2, function(err) {
    if (err) throw err;
    console.log('file saved');
});