const cheerio= require('cheerio');
const fetch = require('node-fetch');
fs = require('fs');

let place='Vuyyuru';
// URL to be scraped from
fetch(`https://www.weather-forecast.com/locations/${place}/forecasts/latest`)
    .then(async (res)=>{ 
        if(res.ok){       
            let $=cheerio.load(await res.text());
            //Get weather forecast summary from that place table
            let siteData = $('body > main > section:nth-child(3) > div > div > div.b-forecast__overflow > div > table > thead > tr.b-forecast__table-description.b-forecast__hide-for-small.days-summaries.js-day-summary');
            console.log(siteData.text());
            // siteData is written to output1.txt
            fs.writeFile("output1.txt", siteData.text(), (err) => { 
                if (err) 
                  console.log(err); 
                else { 
                  console.log("File written successfully"); 
                } 
              }); 
            // Get weather forecast summary for places in that region, the same places can be typed in search           
            siteData = $('body > main > section:nth-child(14) > div.small-12.large-8.columns > div > table > tbody');
            console.log(siteData.text());
            // siteData is written to output2.txt
            fs.writeFile("output2.txt", siteData.text().replace(/^(?=\n)$|^\s*|\s*$|\n\n+/gm,"").trim(), (err) => { 
                if (err) 
                  console.log(err); 
                else { 
                  console.log("File written successfully\n"); 
                } 
              });   

        }else{
            throw new Error(res.statusText);
        }
    })
    .catch(error =>{
        //console.log(error);
        console.log("No results found")
    })
