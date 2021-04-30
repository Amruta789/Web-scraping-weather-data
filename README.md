# Web-scraping-weather-data

This is a simple website that displays 12 day weather forecast by scraping data from <https://www.weather-forecast.com/locations/{$place}/forecasts/latest> where ${place} represents the location in India.

This website is fully functional admin login as well regular user login.
Requirements:
-npm
-NodeJS

First read the package.json file.
`npm install` command installs all the necessary packages.

`npm run devstart`
starts the server in development mode.

Type localhost:3000/ in URL to access the homepage.

Give username as "Admin" to register as administrator. Not more than one admnstrator for the website.

Create a '.env' and store the values of MONGODB_URL and SECRET.
