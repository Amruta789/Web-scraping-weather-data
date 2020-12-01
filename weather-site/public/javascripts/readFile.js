
fs = require('fs');
// WeatherData class is declared in classes.js 
const WeatherData=require('./classes');
let place;
let myWeatherData;

// Read from output1.txt and store the required headings and text to myWeatherData object
fs.readFile('output1.txt', 'utf8',async function (err,data) {
  if (err) {
    return console.log(err);
  }
  
  array1=await data.split(' Weather Today (1–3 days)');
  place=array1[0];
  array2=array1.pop().split(`${place} Weather (4–7 days)`);
  array1.push(array2[0],array2[1]);
  array2=array1.pop().split(`10 Day ${place} Weather (7–10 days)`);
  array1.push(array2[0],array2[1]);
  array2=array1.pop().split(`${place} Weather Next Week (10–12 days)`);
  array1.push(array2[0],array2[1]);
  console.log(array1);

  myWeatherData=new WeatherData(place);
  myWeatherData.newOneToThree('Weather Today (1–3 days)',array1[1]);
  myWeatherData.newFourToSeven('Weather (4–7 days)',array1[2]);
  myWeatherData.newSevenToTen('Weather (7–10 days)',array1[3]);
  myWeatherData.newTenToTwelve('Weather Next Week (10–12 days)',array1[4]); 
});

// Read from output2.txt and store the information about nearby places in myWeatherData object
fs.readFile('output2.txt', 'utf8', async function (err,data) {
    if (err) {
      return console.log(err);
    }
    //console.log(data);
    let dataArray=await data.split('\n');
    for(let i=5; i<dataArray.length; i++){
        if(dataArray[i].match(/^\d+$/)){
            str=dataArray[i-1].concat(` ${dataArray[i]} `).concat(dataArray[i+1]);
            dataArray.splice(i-1,3,str);   
        }
    }
    console.log(dataArray);
  
    for(var i=5,count=0;i<dataArray.length; i+=5,count++){
      // Wait till myWeatherData object declaration is executed and then the following code is run. 
      await myWeatherData.newNearbyPlace(dataArray[i]);
      for(var j=0;j<4;j++){
        myWeatherData.nearbyPlaces[count].newOneToThree(dataArray[1],dataArray[i+j]);
        myWeatherData.nearbyPlaces[count].newFourToSeven(dataArray[2],dataArray[i+j]);
        myWeatherData.nearbyPlaces[count].newSevenToTen(dataArray[3],dataArray[i+j]);
        myWeatherData.nearbyPlaces[count].newTenToTwelve(dataArray[4],dataArray[i+j]);
      }
    }
    console.log(myWeatherData);
    //console.log(myWeatherData.nearbyPlaces[3].tenToTwelve.text);

    // Write to weatherdata.json file
    fs.writeFile('weatherdata.json',JSON.stringify(myWeatherData),(err)=>{
      if(err){
        console.log(err);
      }
      console.log('File written successfully');
    })    
  });
  