
// class for Basic Crawling
function TickerFetcher(){
    console.log("running TickerFetcher")
    this.fetchTicker()
    
}

// methods for TicketFetcher
TickerFetcher.prototype.startWebdriver = function(chrome, Builder){
    return new Builder()
        .forBrowser('chrome')
        .setChromeOptions(new chrome.Options().headless())
        .build()
}

TickerFetcher.prototype.quitWebdriver = function(driver){
    driver.quit()
}

TickerFetcher.prototype.crawlNews = async function(driver, newsPaper, url, tickerXPath, titleXPath, linkXPath, dateXPath){
    var {By} = require('selenium-webdriver')

    console.log("start crawling: "+url)
    driver.get(url)
    await driver.sleep(3000);
    
    var schlagzeilenXpaths = await driver.findElements(By.xpath(tickerXPath))
    var schlagzeilenNewsPaper = {}
    var title, date, link=null;
    for(var element of schlagzeilenXpaths){
        title= await element.findElement(By.xpath(titleXPath)).getAttribute("title")
        link= await element.findElement(By.xpath(linkXPath)).getAttribute("href")
        date= await element.findElement(By.xpath(dateXPath)).getText()
        schlagzeilenNewsPaper[(Object.keys(schlagzeilenNewsPaper).length)]={
            "newspaper":newsPaper, 
            "title": title, 
            "date":date, 
            "link":link
        }
    }
    // convert JSON to string and save as JSON file
    var fs =require('fs')
    fs.writeFile(newsPaper+"-Ticker.json", JSON.stringify(schlagzeilenNewsPaper,null,4), (err)=>{
        if(err){
            throw err;
        }
        console.log("JSON data is saved.")
    })
}

TickerFetcher.prototype.runCrawling = async function(driver){
    // faz
    await this.crawlNews(driver, 
        "FAZ", 
        "https://www.faz.net/faz-live", 
        "//*[@id='FAZContentLeftInner']/div[contains(@class,'liveTeaser')]", 
        ".//a[@class='TeaserHeadLink']", 
        ".//a[@class='TeaserHeadLink']", 
        "./div[@class='liveTime']/span")
    // welt
    await this.crawlNews(driver, 
        "Welt", 
        "https://www.welt.de/newsticker/", 
        "//ul/li/article[@class='o-teaser c-teaser-newsticker']", 
        ".//a[@data-qa='Teaser.Link']", 
        ".//a[@data-qa='Teaser.Link']", 
        ".//span[@data-qa='Teaser.date']")
}

TickerFetcher.prototype.fetchTicker = async function(){
    var chrome = require('selenium-webdriver/chrome')
    var {Builder} = require('selenium-webdriver')
    var driver = this.startWebdriver(chrome,Builder)
    await this.runCrawling(driver)
    await this.quitWebdriver(driver)
}


// prototype-based Class
var NewsCrawler = function(){
    console.log("NewsCrawler started")
    this.tickerFetcher = new TickerFetcher()
}

// run Program
var newsCrawler = new NewsCrawler()
