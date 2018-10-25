const puppeteer = require('puppeteer');
const fs = require('fs');

let cityMap=new Object();
let brandList=new Object();

async function getCities() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://www.autohome.com.cn/AreaList.html');
    // await page.screenshot({path: 'example.png',fullPage:true});

    // let cityListDiv= await page.$$(".mainWrap .t0.font14WithLine");
    const prAndCity = await page.evaluate(( )=> {

        let province;
        let citys=[];
        const cityListDiv =document.querySelectorAll('.cityList tr');
        cityListDiv.forEach(function(cityTable){
            // console.log(cityTable.querySelector("td").innerText);
            //省份,如果为空则为第一个城市：
            province = cityTable.querySelector("th").innerText.replace(/：/ig,"").trim();

            if(province.trim() =="\\t" || province.trim() =="") {
                province = cityTable.querySelector("a").innerText.replace(/：/ig,"").trim();
            }
            //省份下的城市
            citys=[];
            cityTable.querySelectorAll("a").forEach(function(city){
                citys.push({cn:city.innerText,link:city.getAttribute("href")});
            });
            cityMap[province]=citys;
        });
        return cityMap;
    });

    console.log(prAndCity);
    let writerStream = fs.createWriteStream('citys.txt');
    writerStream.write(JSON.stringify(prAndCity, undefined, 2), 'UTF8');
    writerStream.end();
    await browser.close();
};

async function getCars() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    let chars = ['A', 'B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T','V', 'W', 'X', 'Y', 'Z'];
    // let chars = ['A'];


    for (var char of chars) {
        await page.waitFor(2000);
        await page.goto('http://www.autohome.com.cn/grade/carhtml/' + char + '.html');
        await page.waitFor(1000);
        // page.screenshot({path: 'example'+char+'.png',fullPage:true});

        const brands=await page.evaluate(( )=> {
            let brands=new Object();
            let branddl=document.querySelectorAll("dl");
            //每个字母下的品牌名
            branddl.forEach((brand)=>{
                let brandName=brand.querySelector("dt div a").innerText;
                let brandLink=brand.querySelector("dt div a").getAttribute("href");
                let brandTypes=brand.querySelectorAll(".h3-tit");
                let brandTypeObject=new Object();
                //每个字母下的品牌名的类型
                brandTypes.forEach((brandType) =>{
                    let brandTypeName=brandType.querySelector("a").innerText;
                    // let brandTypeLink=brandType.querySelector("a").getAttribute("href");
                    // brandTypeList.push({brandTypeName:brandTypeName,brandTypeLink,brandTypeLink});
                    let brandSubList=[];
                    let brandSubs=brandType.nextElementSibling.querySelectorAll("li");
                    //每个字母下的品牌名的类型的车型
                    brandSubs.forEach((brandSub)=>{
                        let brandSubO=brandSub.querySelector("h4 a");
                        let brandSubDivs=brandSub.querySelectorAll("div a");
                        if(brandSubO){
                            let brandSubName=brandSubO.innerText;
                            let brandSubPriceLink=brandSubDivs[1].getAttribute("href");
                            if(brandSubPriceLink.indexOf("www.che168")!=-1){
                                brandSubList.push({brandSubName:brandSubName,brandSubPriceLink:"无报价"});
                            }else{
                                brandSubList.push({brandSubName:brandSubName,brandSubPriceLink:brandSubPriceLink});
                            }

                        }
                    })
                    brandTypeObject[brandTypeName]=brandSubList;

                })
                brands[brandName]=brandTypeObject;

            })
            return brands;
        });

        brandList[char]=brands;
    }

    console.log(JSON.stringify(brandList, undefined, 2));
    let writerStream = fs.createWriteStream('brands.txt');
    writerStream.write(JSON.stringify(brandList, undefined, 2), 'UTF8');
    writerStream.end();
    await browser.close();
}

async function getCars2() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://www.autohome.com.cn/car/', {waitUntil: 'networkidle'});
    // await page.screenshot({path: 'example.png',fullPage:true});

    // console.log(await page.evaluate(
    //     () => document.querySelector('[data-meto="A"]').innerText)
    // );

    const brands = await page.evaluate(() =>{
        let chars = ['A', 'B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'W','X', 'X', 'Y', 'Z'];
        const brands=[];
        chars.forEach(function (cs) {
            const unfoldButton = document.querySelector('[data-meto="B"]');
            brands.push(unfoldButton.innerHTML);
                    unfoldButton.click();
            const pageId="#htmlB";
            const hc=document.querySelector(pageId);
            if(hc) {
                const brand = hc.querySelector("dt div a");
                if(brand) {
                    brands.push({brand: brand.innerText, link: brand.getAttribute("href")})
                }
            }
            // brands.push(pageId)
        })

        return brands;
    })
    await page.$eval('[data-meto="B"]', element => element.click());
    await page.screenshot({path: 'example.png',fullPage:true});

    // const brands = await page.evaluate(() =>{
    //     let chars = ['A', 'B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'W','X', 'X', 'Y', 'Z'];
    //     const brands=[];
    //     chars.forEach(function (cs) {
    //         const unfoldButton = document.querySelector('a[data-meto="'+cs.toString()+'"]');
    //         unfoldButton.click();
    //
    //         const pageId="#html"+cs.toString();
    //         const hc=document.querySelector(pageId);
    //         if(hc) {
    //             const brand = hc.querySelector("dt");
    //             if(brand) {
    //                 brands.push({brand: brand.innerText, link: brand.getAttribute("href")})
    //             }
    //         }
    //         // brands.push(pageId)
    //     })
    //
    //     return brands;
    // })

    console.log(brands);

    await browser.close();
};

// getCities();

getCars();