const cheerio= require('cheerio');
const fetch = require('node-fetch');

let place='Mumbai';

fetch(`https://www.weather-forecast.com/locations/${place}/forecasts/latest`)
    .then(async(res)=>{ 
        if(res.ok){       
            let $=cheerio.load(await res.text());
            let siteData = $('body > main > section:nth-child(3) > div > div > div.b-forecast__overflow > div > table > thead > tr.b-forecast__table-description.b-forecast__hide-for-small.days-summaries.js-day-summary');
            console.log(siteData.text());            
            siteData = $('body > main > section:nth-child(14) > div.small-12.large-8.columns > div > table > tbody');
            console.log(siteData.text());
        }else{
            throw new Error(res.statusText);
        }
    })
    .catch(error => console.log(error))
