const puppeteer = require('puppeteer');
const fs = require('fs');
const util = require('util')
const moment = require('moment');
const json2csv = require('json2csv');

const curDate =moment(new Date(),"YYYYMMDDHHmmss");
const fs_writeFile = util.promisify(fs.writeFile);

let productList=[];
let spLists=[];

async function getProducts() {
    let isEnd=false;
    let isEndNo=1;
    const browser = await puppeteer.launch();
    try {
        const page = await browser.newPage();
        //china
        await page.goto('https://p4psearch.1688.com/p4p114/p4psearch/offer2.htm?cosite=360jj&keywords=%E4%BF%9D%E5%81%A5%E5%93%81&trackid=8856888022272688587535&location=re&province=&city=&provinceValue=%E6%89%80%E5%9C%A8%E5%9C%B0%E5%8C%BA&sortType=&descendOrder=&priceStart=&priceEnd=&dis=');
        //fujian
        //await page.goto('https://p4psearch.1688.com/p4p114/p4psearch/offer2.htm?cosite=360jj&keywords=%E4%BF%9D%E5%81%A5%E5%93%81&trackid=8856888022272688587535&location=re&province=&city=&provinceValue=%E7%A6%8F%E5%BB%BA&sortType=&descendOrder=&priceStart=&priceEnd=&dis=%27');
        //xiamen
        //await page.goto('https://p4psearch.1688.com/p4p114/p4psearch/offer2.htm?cosite=360jj&keywords=%E4%BF%9D%E5%81%A5%E5%93%81&trackid=8856888022272688587535&location=re&province=%E7%A6%8F%E5%BB%BA&city=%E5%8E%A6%E9%97%A8&provinceValue=%E5%8E%A6%E9%97%A8&sortType=&descendOrder=&priceStart=&priceEnd=&dis=%27');

        await page.waitForSelector('.next-loading-component');

         while (await !isEnd) {
            // await page.waitFor(2500);
            const tempObj = await handleProductData(page);

            const isEndTemp = await tempObj['page'];
            isEnd=await tempObj['ds'];
            if(isEndTemp!=0){
                await isEndNo++;
            }
            await console.log(isEndNo+":"+tempObj['ds']);
            await page.waitFor(2500);
        }
        await console.log(productList);
        let writerStream = await fs.createWriteStream('productLinks-'+curDate+'.txt');
        await  writerStream.write(JSON.stringify(productList, undefined, 2), 'UTF8');
        await writerStream.end();

        // const productFields = ['link'];
        // const productCsv = await json2csv.parse(productList, { fields: productFields});
        // await fs.writeFile('productFile-'+curDate+'.csv', productCsv, function(err) {
        //     if (err) throw err;
        //     console.log('file saved');
        // });
        await browser.close();

        for(let i=0;i<productList.length;i++){
            const tempSP=await getSPs(productList[i]);
            // await console.log(tempSP);
        }
        await console.log(spLists);
        const spFields = ['name','tele','phone','fax','company','address'];
        const spCsv = await json2csv.parse(spLists, { fields: spFields});
        await console.log(spCsv);
        await fs_writeFile('spFile-'+curDate+'.csv', spCsv)
            .catch((error) => {
                console.log(error)
            });
        // await fsPromises.writeFile('spFile-'+curDate+'.csv', spCsv, function(err) {
        //     if (err)  console.log(err);
        //     console.log('file saved');
        // });
        //
        // let writerStream2 = await fs.createWriteStream('spLists-'+curDate+'.txt');
        // await writerStream2.write(JSON.stringify(spLists, undefined, 2), 'UTF8');
        // await writerStream2.end();
    }catch (error) {
        // 出现任何错误，打印错误消息并且关闭浏览器
        console.log(error)
        console.log('服务意外终止');
        await browser.close()
    } finally {
        // 最后要退出进程
        process.exit(0)
    }
}

async function handleProductData(page) {
    const list = await page.evaluate(( )=> {
        let productLinks=[];
        let productObj=new Object();
        const productsDiv =document.querySelectorAll('.next-loading .offer_item');
        productsDiv.forEach(function(pdiv){
            //获取商品的详细链接
            let links = pdiv.querySelector(".img a").getAttribute("href");
            if(links.indexOf('https://')==-1){
                links="https:"+links;
            }
            productLinks.push(links);
        });
        productObj['obj']=productLinks;

        // const currentPage =document.querySelector('.next-pagination-list button');
        // let isEnd=0;
        // if(currentPage) {
        //     productLinks.push(currentPage.innerText);
        //     let nextPage=currentPage.nextElementSibling;
        //     //whether have next page
        //     if(nextPage) {
        //         //has next page
        //         isEnd=nextPage.innerText;
        //         nextPage.click();
        //     }else{
        //         //ending, set is end to 1;
        //         isEnd=0;
        //     }
        // }else{
        //     isEnd=0;
        // }

        //get next page button
        const nextPage =document.querySelector('button.next-btn.next-btn-normal.next-btn-large.next-pagination-item.next');
        let isEnd=1;
        //if next page button is disabled, that end
        if(nextPage) {
            // console.log(nextPage.innerText);
            const ds=nextPage.disabled;
            if(!ds){
                nextPage.click();
            }else{
                isEnd=0;
            }
            productObj['ds']=ds;
        }else{
            isEnd=0;
        }

        productObj['page']=isEnd;
        return productObj;
    });
    await page.waitFor(4500);
    productList=productList.concat(list['obj']);
    return list;
}

async function getProductsT() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://p4psearch.1688.com/p4p114/p4psearch/offer2.htm?cosite=360jj&keywords=%E4%BF%9D%E5%81%A5%E5%93%81&trackid=8856888022272688587535&location=re&province=&city=&provinceValue=%E6%89%80%E5%9C%A8%E5%9C%B0%E5%8C%BA&sortType=&descendOrder=&priceStart=&priceEnd=&dis=');

    await page.waitForSelector('.next-loading-component');

    productList = await page.evaluate(( )=> {
        let productLinks=[];
        const productsDiv =document.querySelectorAll('.next-loading .offer_item');
        productsDiv.forEach(function(pdiv){
            //获取商品的详细链接
            let links = pdiv.querySelector(".img a").getAttribute("href");
            productLinks.push(links);
        });
        setTimeout(3000);
        const currentPage =document.querySelector('.next-pagination-list button');
        let isEnd=0;
        if(currentPage) {
            productLinks.push(currentPage.innerText);
            let nextPage=currentPage.nextElementSibling;
            //whether have next page
            if(nextPage) {
                productLinks.push(nextPage.innerText);
            }else{
                //ending, set is end to 1;
                isEnd=1;
                productLinks.push("nextPage");
            }
        }else{
            productLinks.push("currentPage");
        }


        return productLinks;
    });

    console.log(productList);
    let writerStream =await fs.createWriteStream('productLinks-'+curDate+'.txt');
    writerStream.write(JSON.stringify(productList, undefined, 2), 'UTF8');
    writerStream.end();
    await browser.close();

    // spLists=[];
    // for(let i=0;i<3;i++){
    //     spLists.push(getSPs(productList[i]));
    // }
    // console.log(spLists);
    // writerStream = fs.createWriteStream('spLists-'+curDate+'.txt');
    // writerStream.write(JSON.stringify(spLists, undefined, 2), 'UTF8');
    // writerStream.end();

}

async function getSPs(index) {

    const browser = await puppeteer.launch();

    try{
        const page = await browser.newPage();
        // await page.goto(index,{ timeout: 100000 });
        await page.goto(index);

        await page.waitFor(10000);
        // await page.waitForSelector('#site_content.mod-contactSmall', { timeout: 100000, visible: true });
        await page.screenshot({path: 'example.png',fullPage:true});
        const spObj = await page.evaluate(( )=> {
            let sp=new Object();
            let spDiv =document.querySelector('#site_content .mod-contactSmall');
            if(!spDiv) {
                sp["name"]="no data";
                return sp;
            };
            let nameDiv=spDiv.querySelector(".membername");
            let name;
            if(nameDiv){
                name=nameDiv.innerText;
            }

            let teleDiv=nameDiv.parentNode.nextElementSibling;
            let tele;
            if(teleDiv){
                if(teleDiv.querySelector("dd"))  tele=teleDiv.querySelector("dd").innerText;
            }

            let phoneDiv=spDiv.querySelector(".m-mobilephone");
            let phoneDivDd=phoneDiv.querySelector("dd");
            let phone;
            if(phoneDivDd){
                phone=phoneDivDd.innerText;
            }

            let faxDiv=phoneDiv.nextElementSibling;
            let fax;
            if(faxDiv){
                if(faxDiv.querySelector("dd"))    fax=faxDiv.querySelector("dd").innerText;
            }

            sp["name"]=name;
            sp["tele"]=tele;
            sp["phone"]=phone
            sp["fax"]=fax;
            let dataView= JSON.parse(spDiv.getAttribute("data-view-config"));
            sp["company"]=dataView.companyName;
            sp["address"]=dataView.address;
            return sp;
        });
        await page.waitFor(2500);
        spLists.push(spObj);
        await console.log(spLists);
        // let writerStream = fs.createWriteStream('spList-'+curDate+'.txt');
        // writerStream.write(JSON.stringify(spList, undefined, 2), 'UTF8');
        // writerStream.end();
        const spFields = ['name','tele','phone','fax','company','address'];
        const spCsv = await json2csv.parse(spLists, { fields: spFields});
        // await console.log(spCsv);
        await fs_writeFile('spFile-'+curDate+'.csv', spCsv)
            .catch((error) => {
                console.log(error)
            });
        await browser.close();

        return spObj;
    }catch(e){
        console.log(e);
        console.log('服务意外终止');
        await browser.close();
    } finally {

    }



}

// getProducts();
getSPs("https://dj.1688.com/ci_bb?a=282324907&e=bXr3J13ombDbJh1XfjDyDQFF2yxP1boBh5CIXbq9YT2c8GcaPy-9JnTiA4FO8mnbGJN-fd.xeOHJiRcoQLkAYPTNbKJ4zC73CFIAf7DoiJZakLbEG8DwZYNA42.97W2t9u7Gz07jruWYeTtrioq9-0.viMonhcuuMOo9Q-0KIuPsYerPJJVJ.74dODWPMcA9iZzg8TrynUfv7UQKHlvbGiBgTkxjc6f6P.34lVOLFeZI47E3-jmO43qaSUOq314RVFAylNtGQ1nfj4luE5r-3ViCzgayBqC517P5OBDj4i5wUKgLd3T.MtK-3EfiBHvH5r67ImQPffXPD8ZS5HPyNHdsaUdBGuvwnFUmplH-zEgwWtiY3Bw6YM3H1-n2O1L5LYsQNMwhmo4VoyugT9ZVcnqTVyYxW2Vd63VgREbhT.2Sr.FcWqPKLNP.OxwpUlLlVvI07c0HgPu9QtK7JdZQWRljue0XWRg.EJ33VEGIe3inix-BSUD0PYr.aTJv0Uu5pTZyAYBu8C6JEcbQuovqMn2T8RqJJ0QWnfQft2gNnVsG8-FBa4GYxpIaECvRwUBtcbPYcrBJC6gLi8XriVXiBg__&v=4&ap=176&rp=16");