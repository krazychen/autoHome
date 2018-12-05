const puppeteer = require('puppeteer');
const fs = require('fs');
const moment = require('moment');

const curDate =moment(new Date(),"YYYYMMDDHHmmss");

let productList;
let spLists;

async function getProducts() {
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
    let writerStream = fs.createWriteStream('productLinks-'+curDate+'.txt');
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
    const page = await browser.newPage();
    await page.goto(index);

    // await page.waitFor(6000);
    // await page.waitForSelector('div .mod-contactSmall', { timeout: 100000, visible: true });
    try{
        const spList = await page.evaluate(( )=> {
            let spList=new Object();
            let sp=new Object();
            let spDiv =document.querySelector('#site_content .mod-contactSmall');
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
            spList[sp["phone"]]=sp;
            return spList;
        });

        return spList;
        console.log(spList);
    }catch(e){
        console.log(e);
    }

    // let writerStream = fs.createWriteStream('spList-'+curDate+'.txt');
    // writerStream.write(JSON.stringify(spList, undefined, 2), 'UTF8');
    // writerStream.end();
    await browser.close();


}

getProducts();
// getSPs("https://dj.1688.com/ci_bb?a=2004000869&e=MRrS4nBmwy7bK9PN7bbqDCK13sgXILWW8YnxVi7mVjCwKEHkNmvLVO2OCijk72T8wCcBssQTpt7AEFoxEOKKf0kmEeFvaj-eLfKnp1GFDxcPHcJGU3q9O9N-0MlRF58FahkfjKENNWwVXwOLilNlV-aWRi0eQKYOJCARaNkKQYveuvPhGrEsYHsB-XTovd5ex03jE8.HEM7SqGb.xd2xe-OkEc8Rzh60dXyKs0scpqSB-VmuN27UYg8gU6Drr-ZbNGq5vHY6xPASAxG6leuuovltMGo1-ZGvtBBqQKeuNN5x37cZTwHLJSLxtxhqfLLkcgEEkfVUM6htJf1w5lOe.ieOair6XedsAxuFZgCWWxfbJmrP.hfijbI6MOwpZrakLg-iKpw2JLqLa6Z426nr79dDr7HXIt8vaz9g2v1sQv-OCiQwXTRMbf4s4nec4mK0wDkExP.aW3NL6nZtAfrqwpu2k9a8lVgJWc4gnppTSmEXDgKiSwGsVdJSdnVvOB6IOwE5LQsWF3vuZu1lG2-Y0eptRXo7fj0bZ.NfS6jaDUDQNG33CYNCJy0tu5ty0fk-dyrjxoEYFk29orR-UySYehKj2kf9WyAeyAwfJVUnMj8frVG4a3psppHVsMCMVpOydmijhWAB8ckIwMp7hXw9kA__&v=4&ap=2&rp=2");