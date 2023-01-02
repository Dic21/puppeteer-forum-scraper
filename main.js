const express = require("express");
const puppeteer = require("puppeteer");
const app = express();
const port = 4000;

app.get("/scraper/lihkg", (req, res)=>{
    async function test(){
        const browser =  await puppeteer.launch({ headless: false});
        const page = await browser.newPage();
        let data = [];
        try{
            page.on('response', async (response) => {   
                if(response.url() == "https://lihkg.com/api_v2/thread/category?cat_id=16&page=1&count=60&type=now"){
                    console.log('XHR response received'); 
                    //console.log(await response.json()); 
                    result = await response.json();
                    data = result.response.items;
                    console.log(data);
                    let resData = [];
                    data.forEach((post)=>{
                        let obj = {};
                        obj.title = post.title;
                        obj.cmCount = post.no_of_reply;
                        obj.link = `https://lihkg.com/thread/${post.thread_id}`
                        resData.push(obj);
                    })
                    res.json(resData);
                    browser.close();
                }
            });

            await page.goto("https://lihkg.com/category/16");

        }catch(err){
            console.log(err);
            res.status(404);
        }
    }
    test();
})

app.get("/scraper/baby", (req, res)=>{
    async function get(){
        //Launch browser
        const browser = await puppeteer.launch();
        //Open a new tab
        const page = await browser.newPage();
        //Go to our URL
        await page.goto('https://www.baby-kingdom.com/forum.php?mod=forumdisplay&fid=22');

        const target = await page.$$eval('tr:has(.new)', (titleList)=>{
            return titleList.map((t, index)=>{
                if(index>4){
                    let obj = {};
                    const title = t.querySelector('.new>a').innerHTML;
                    const cmCount = t.querySelector('.num>a').textContent.replace("/", "").trim();
                    const url = t.querySelector('.new>a').getAttribute('href');
                    obj.title = title;
                    obj.cmCount = cmCount;
                    obj.link = `https://www.baby-kingdom.com/${url}`;
                    return obj;
                }
            })
        })
        let result = target.filter((t)=>{
            return t !== null;
        })
        browser.close();
        return res.send(result);
    }
    get();
})

app.get("/scraper/hkd", (req, res)=>{
    async function getHK(){
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto('https://www.discuss.com.hk/forumdisplay.php?fid=40', {timeout: 0});

        const news = await page.evaluate(()=>{
            const topNews = [];
            const list = Array.from(document.querySelectorAll('.forumdisplay_thread'));
            
            for (let i = 0; i < 23; i++){
                let obj = {};
                const title = list[i].querySelector('.tsubject>a').innerHTML;
                const cmCount = list[i].querySelector('.icon-talk-alt').innerHTML;
                const url = list[i].querySelector('.tsubject>a').getAttribute('href');
                if(i>3){
                    obj.title = title;
                    obj.cmCount = cmCount;
                    obj.link = `https://www.discuss.com.hk/${url}`
                    topNews.push(obj);
                }
            }
            return topNews;
        })
        await browser.close();
        return res.json(news);
    }
    getHK();
})

app.listen(port, ()=>{
    console.log(`Example app listening at http://localhost:${port}`)
})