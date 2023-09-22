const express = require('express')
const axios = require('axios')
const cheerio = require('cheerio')
const app = express()

async function processGiallozafferanoRecipesData(newspaper, articles) {
    for (let id = 1; id < 6; id++) { // Adjust the loop condition as needed
        try {
            const response = await axios.get(newspaper.address + id);
            const html = response.data;
            const $ = cheerio.load(html);

            $('.gz-title a', html).each(async function () {
                let title = $(this).text();
                const url = $(this).attr('href');
                let Category = '';
                let Instructions = '';
                let Ingredients = [];
                let Img = '';

                try {
                    const res = await axios.get(newspaper.base + url);
                    const htmlArticle = res.data;
                    const ar = cheerio.load(htmlArticle);

                    Category = ar('.gz-breadcrumb ul li', htmlArticle).text();
                    Category = Category.replace(/\n+/g, '');
                    Category = Category.trim();

                    ar('.gz-ingredient').each(function () {
                        let oneIng = ar(this).text();
                        oneIng = oneIng.replace(/\t+/g, '');
                        oneIng = oneIng.replace(/\n+/g, ' ');
                        oneIng = oneIng.trim();
                        Ingredients.push(oneIng);
                    });

                    Instructions = ar('.gz-content-recipe-step').text();
                    Instructions = Instructions.replace(/\n+/g, '');
                    Instructions = Instructions.replace(/\t+/g, '');
                    Instructions = Instructions.replace(/<[^>]+>/g, '');
                    Instructions = Instructions.trim();

                    Img = ar('.gz-type-photo img').attr('src');
                    articles.push({
                        title,
                        url: newspaper.base + url,
                        source: newspaper.name,
                        category: Category,
                        instructions: Instructions,
                        ingredients: Ingredients,
                        img: Img,
                        id: articles.length
                    });
                } catch (error) {
                    console.error('Error processing article:', error);
                }
            });
        } catch (error) {
            console.error('Error fetching recipe:', error);
        }
    }
}
module.exports = processGiallozafferanoRecipesData;