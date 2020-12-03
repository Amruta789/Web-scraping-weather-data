const cheerio= require('cheerio');
const fetch = require('node-fetch');
//const readFiles=require('./readFile');
const WeatherData=require('./classes');
fs = require('fs');
exports.scrapeData=async function (place){
  // URL to be scraped from
  return await fetch(`https://www.weather-forecast.com/locations/${place}/forecasts/latest`)
      .then(async (res)=>{ 
          if(res.ok){       
              let $=cheerio.load(await res.text());
              let myWeatherData=new WeatherData(place);
              //Get weather forecast summary from that place table
              let siteData = $('body > main > section:nth-child(3) > div > div > div.b-forecast__overflow > div > table > thead > tr.b-forecast__table-description.b-forecast__hide-for-small.days-summaries.js-day-summary');
              //console.log(siteData.text());
              
              array1=siteData.text().split(' Weather Today (1–3 days)');
              array2=array1.pop().split(`${place} Weather (4–7 days)`);
              array1.push(array2[0],array2[1]);
              array2=array1.pop().split(`10 Day ${place} Weather (7–10 days)`);
              array1.push(array2[0],array2[1]);
              array2=array1.pop().split(`${place} Weather Next Week (10–12 days)`);
              array1.push(array2[0],array2[1]);

              //console.log(array1);
              myWeatherData.newOneToThree('Weather Today (1–3 days)',array1[1]);
              myWeatherData.newFourToSeven('Weather (4–7 days)',array1[2]);
              myWeatherData.newSevenToTen('Weather (7–10 days)',array1[3]);
              myWeatherData.newTenToTwelve('Weather Next Week (10–12 days)',array1[4]);

                        
              siteData = $('body > main > section:nth-child(14) > div.small-12.large-8.columns > div > table > tbody');
              //console.log(siteData.text());

              let dataArray=siteData.text().replace(/^(?=\n)$|^\s*|\s*$|\n\n+/gm,"").trim().split('\n');
              for(let i=5; i<dataArray.length; i++){
                  if(dataArray[i].match(/^\d+$/)){
                      str=dataArray[i-1].concat(` ${dataArray[i]} `).concat(dataArray[i+1]);
                      dataArray.splice(i-1,3,str);   
                  }
              }
              //console.log(dataArray);
            
              for(var i=5,count=0;i<dataArray.length; i+=5,count++){
                // Wait till myWeatherData object declaration is executed and then the following code is run. 
                myWeatherData.newNearbyPlace(dataArray[i]);
                for(var j=0;j<4;j++){
                  myWeatherData.nearbyPlaces[count].newOneToThree(dataArray[1],dataArray[i+j]);
                  myWeatherData.nearbyPlaces[count].newFourToSeven(dataArray[2],dataArray[i+j]);
                  myWeatherData.nearbyPlaces[count].newSevenToTen(dataArray[3],dataArray[i+j]);
                  myWeatherData.nearbyPlaces[count].newTenToTwelve(dataArray[4],dataArray[i+j]);
                }
              }
              // console.log(myWeatherData);
      
              // console.log(myWeatherData.nearbyPlaces[3].tenToTwelve.text);
              return JSON.stringify(myWeatherData);
              
          }else{
              throw new Error(res.statusText);
          }
      })
       
      .catch(error =>{
          console.log(error);
          //console.log("No results found");
          return "No results found";
      })
}