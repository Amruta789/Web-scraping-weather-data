const cheerio= require('cheerio');
const fetch = require('node-fetch');

function checkStatus(res) {
    if (res.ok) { // res.status >= 200 && res.status < 300
        return res.text();
    } else {
        console.log("bad");
        throw new Error(res.statusText);
    }
}


fetch('https://www.npmjs.com/package/node-fetch/')
    // .then(checkStatus)
    
    .then((res)=>{ 
        if(res.ok){       
            let $=cheerio.load(res);
            console.log(res);
            let siteData = $('#readme > p:nth-child(8)');
            console.log(siteData);
            console.log(siteData.text());
            console.log(siteData.html());
            return res.text();
        }else{
            throw new Error(res.statusText);
        }
    }) 
    .then(body => console.log(body))       
    .catch(error => console.log(error))
