"use strict"
// These are the classes made to store the weather data in json format
class InnerData{
    constructor(heading, text){
        this.heading=heading;
        this.text=text;
    }
    
}
class WeatherData {
    constructor(place){
        this.place=place;
        this.oneToThree=new InnerData();
        this.fourToSeven=new InnerData();
        this.sevenToTen=new InnerData();
        this.tenToTwelve=new InnerData();
        this.nearbyPlaces=[];
    }
    
    newOneToThree(heading,text){
        this.oneToThree=new InnerData(heading,text);
    }
    
    newFourToSeven(heading,text){
        this.fourToSeven=new InnerData(heading,text);
    }
    
    newSevenToTen(heading,text){
        this.sevenToTen=new InnerData(heading,text);
    }
    
    newTenToTwelve(heading,text){
        this.tenToTwelve=new InnerData(heading,text);
    }
    newNearbyPlace(place){
       this.nearbyPlaces.push(new WeatherData(place));
    }
}

module.exports=WeatherData;