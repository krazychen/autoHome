const puppeteer = require('puppeteer');
const fs = require('fs');
const moment = require('moment');

const curDate =moment(new Date(),"YYYYMMDDHHmmss");

async function getProducts() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://p4psearch.1688.com/p4p114/p4psearch/offer2.htm?cosite=360jj&keywords=%E4%BF%9D%E5%81%A5%E5%93%81&trackid=8856888022272688587535&location=re&province=&city=&provinceValue=%E6%89%80%E5%9C%A8%E5%9C%B0%E5%8C%BA&sortType=&descendOrder=&priceStart=&priceEnd=&dis=');

    await page.waitForSelector('.next-loading-component');
    const productList = await page.evaluate(( )=> {
        let productLinks=[];
        const productsDiv =document.querySelectorAll('.next-loading .offer_item');
        productsDiv.forEach(function(pdiv){
            //获取商品的详细链接
            let links = pdiv.querySelector(".img a").getAttribute("href");
            productLinks.push(links);
        });

        setTimeout(3000);
        const currentPage =document.querySelector('.next-pagination-list button');
        if(currentPage) {
            productLinks.push(currentPage.innerText);
            let nextPage=currentPage.nextElementSibling;
            if(nextPage) {
                productLinks.push(nextPage.innerText);
            }else{
                productLinks.push("nextPage");
            }
        }else{
            productLinks.push("currentPage");
        }


        return productLinks;
    });

    console.log(productList);
    let writerStream = fs.createWriteStream('productLinks-'+curDate+'.txt');
    writerStream.write(JSON.stringify(productList, undefined, 2), 'UTF8');
    writerStream.end();
    await browser.close();


}

async function getSPs() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://dj.1688.com/ci_bb?a=1156440792&e=-iOOpHYNdAgZ2R8BJe8jfN1TdiHdOD2hDELDv07o75JNry5p-UY.MrjqvTsQfqGnjRbHe0mxUEuE-QlhPgFa1i-vw8RcdJYFOY13P0mB-V3nnakEsZAwrfnIFOjlhsBDfesQ8oVzTAgZJWDZsbFTxSIvVBmp.JABpJSiG-WUmzS5bulUguby6iGgsCljxklBUPd8lqMIzwawEeOxgTBu-8giYE-NiouqxO2E9RlaNtxe6zjtrpFC6s6EGMi7iuQv1q4C2LxEijTckbeYXcZ1WXkCB3OCjkxD9VHLE7ac5r4twP.xzViwiMQ0erSrD8Oems5Pn2Di7e1JwxNplB1ZJuQm1WpVJiXvRiy4xvyGGA-bu7rw5uu1e0iM.7nDXQ1MKd-plR3JFcMyhtv6NTqz-sBgifK2qWW55kQ-RzZLEA3SkR-NfKp.wKfaQIaUFhpyMzhIAko7KNDb.21K1mvuBL4x-lVqf2E-f2g5XdxpeHTyJPhPqz8-Q-Z90Sv4hcKRTEvtCCEpmdT8FNMLjcouUJa6pk8EAq1Dz5rnd4EsPzCcnemQJrgNeElvlsVGhcFhmk8n0Rm.f6EFfDgh6RYw--bw.-6GYQGwye.KsfUjLyQscI0z0X2C8VzYbODlwHLgl9ckaGdxd93A2oiwfKLfAa2Aj-eo994n&v=4&ap=1&rp=1');

    // await page.waitForSelector('.content-wrap');
    const spList = await page.evaluate(( )=> {
        let spList=new Object();
        let sp=new Object();
        let spDiv =document.querySelector('.mod-contactSmall');
        let name=spDiv.querySelector(".membername").innerText;
        let title=spDiv.querySelector(".membername").innerText;
        sp["name"]=name;
        spList[sp["name"]]=sp;
        return spList;
    });

    console.log(spList);
    // let writerStream = fs.createWriteStream('spList-'+curDate+'.txt');
    // writerStream.write(JSON.stringify(spList, undefined, 2), 'UTF8');
    // writerStream.end();
    await browser.close();


}

// getProducts();
getSPs();