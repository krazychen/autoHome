const puppeteer = require('puppeteer');
const fs = require('fs');
const moment = require('moment');

const curDate =moment(new Date(),"YYYYMMDDHHmmss");

let productList=[];
let spLists=[];

async function getProducts() {
    let isEnd=false;
    let isEndNo=1;
    const browser = await puppeteer.launch();
    try {
        const page = await browser.newPage();
        await page.goto('https://p4psearch.1688.com/p4p114/p4psearch/offer2.htm?cosite=360jj&keywords=%E4%BF%9D%E5%81%A5%E5%93%81&trackid=8856888022272688587535&location=re&province=&city=&provinceValue=%E6%89%80%E5%9C%A8%E5%9C%B0%E5%8C%BA&sortType=&descendOrder=&priceStart=&priceEnd=&dis=');

        await page.waitForSelector('.next-loading-component');

         while (!isEnd) {
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
        let writerStream = fs.createWriteStream('productLinks-'+curDate+'.txt');
        await  writerStream.write(JSON.stringify(productList, undefined, 2), 'UTF8');
        await writerStream.end();
        await browser.close();

        for(let i=0;i<productList.length;i++){
            const tempSP=await getSPs(productList[i]);
            await console.log(tempSP);
        }
        await console.log(spLists);
        writerStream = await fs.createWriteStream('spLists-'+curDate+'.txt');
        await writerStream.write(JSON.stringify(spLists, undefined, 2), 'UTF8');
        await writerStream.end();
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
            console.log(nextPage.innerText);
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
        await page.goto(index);

        await page.waitFor(6000);
        // await page.waitForSelector('div.mod-contactSmall', { timeout: 100000, visible: true });
        const spObj = await page.evaluate(( )=> {
            let sp=new Object();
            let spDiv =document.querySelector('#site_content .mod-contactSmall');
            if(!spDiv) return "load unready";
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
        spLists =spLists.push(spObj);
        await console.log(spObj);
        // let writerStream = fs.createWriteStream('spList-'+curDate+'.txt');
        // writerStream.write(JSON.stringify(spList, undefined, 2), 'UTF8');
        // writerStream.end();
        await browser.close();

        return spObj;
    }catch(e){
        console.log(e);
        console.log('服务意外终止');
        await browser.close();
    } finally {
        // 最后要退出进程
        process.exit(0)
    }



}

// getProducts();
getSPs("https://detail.1688.com/offer/552929152950.html");