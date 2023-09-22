const PORT = process.env.PORT || 8000
const express = require('express')
const axios = require('axios')
const cheerio = require('cheerio')
const app = express()
const processSimplyRecipesData = require('./simplyrecipes'); // Import the function from simplyrecipes.js
const processGiallozafferanoRecipesData = require('./giallozafferanorecipes');

const newspapers = [
    {
        name: 'simplyrecipes',
        address: 'https://www.simplyrecipes.com/recipes-5090746',
        base: '',
        
    },
    {
        name: 'giallozafferano',
        address: 'https://www.giallozafferano.com/latest-recipes/page',
        base: ''
    }
];
const articles = []

newspapers.forEach(newspaper => {
        if(newspaper.name === 'simplyrecipes') {
            processSimplyRecipesData(newspaper, articles)
        }
        else if(newspaper.name === 'giallozafferano') {
            processGiallozafferanoRecipesData(newspaper, articles)
        }
        
})

app.get('/', (req, res) => {
    res.json('Welcome to my Meals API')
})

app.get('/meals', (req, res) => {
    res.json(articles)
})

app.listen(PORT, () => console.log('App listening'))
