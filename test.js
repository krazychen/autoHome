let tt="新疆：\\t";

console.log(tt.replace(/：\\t/ig,""))

let chars = ['A', 'B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'W', 'X', 'Y', 'Z'];
const brands=[];
chars.forEach(function (cs) {
    const pageId = "#html" + cs;
    console.log(pageId)
});
