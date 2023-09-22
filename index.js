const PORT = process.env.PORT || 8000
const express = require('express')
const axios = require('axios')
const cheerio = require('cheerio')
const app = express()

const newspapers = [
    {
        name: 'simplyrecipes',
        address: 'https://www.simplyrecipes.com/recipes-5090746',
        base: '',
        
    },
    {
        name: 'epicurious',
        address: 'https://www.epicurious.com/recipes-menus',
        base: 'https://www.epicurious.com/'
    }/*,
    {
        name: 'nytimes',
        address: 'https://cooking.nytimes.com/',
        base: ''
    }*/
];
const articles = []

newspapers.forEach(newspaper => {
    axios.get(newspaper.address)
        .then(response => {
            if(newspaper.name === 'simplyrecipes') {
                const html = response.data
                const $ = cheerio.load(html)

                $('#mntl-taxonomysc-article-list_1-0 a', html).each(function () {
                    let title = $(this).text()
                    const url = $(this).attr('href')
                    var Category = ''
                    let Instructions = ''
                    let Ingredients = []
                    let Img = ''
                    if(newspaper.name === 'epicurious') console.log("jeste")
                    // setting the title
                    if(title.length > 100) {
                        title = ''
                        let position = url.search('.com/')
                        let i = position+5
                        let ch = url[i].toLocaleUpperCase()
                        while(i<url.length) {
                            if(ch === '-') {
                                title = title + ' '
                            }
                            else if(/^[A-Za-z]+$/.test(ch)) { // is alphabetic character
                                title = title + ch
                            }
                            i++
                            ch = url[i]
                        }
                    }
                    
                // getting category, insturctions, ingridience, img
                
                    axios.get(newspaper.base + url)
                    .then(res => {
                        const htmlArticle = res.data
                        const ar = cheerio.load(htmlArticle);
                        

                        Category = ar('.tag-nav-content ul li:first', htmlArticle).text();
                        Category = Category.slice(1, -1)
                        let i = 0
                        for(i = 0; i<Category.length; i++) {
                            if(!/^[A-Za-z]+$/.test(Category[i])) {
                                break
                            }
                        }
                        Category = Category.slice(0, i)

                        // getting the ingredients
                        ar('#structured-ingredients_1-0 ul li', htmlArticle).each(function() {
                            let oneIng = ar(this).text()
                            oneIng = oneIng.slice(1, -1)
                            Ingredients.push(oneIng)
                        })
                        Instructions = ar('#section--instructions_1-0 #structured-project__steps_1-0 ol').text();

                        // Clean up the text by removing unwanted characters
                        Instructions = Instructions.replace(/\n+/g, '\n'); // Replace multiple consecutive newlines with a single newline
                        Instructions = Instructions.replace(/<[^>]+>/g, ''); // Remove HTML tags
                        Instructions = Instructions.replace(/\n+/g, '\n'); // Replace multiple consecutive newlines with a single newline
                        Instructions = Instructions.trim(); // Remove leading and trailing whitespace

                        // getting the image
                        Img = ar('.primary-image__media .img-placeholder img').attr('src')
                        
                        if(Ingredients != [] && Instructions != '') {
                            articles.push({
                                title,
                                url: newspaper.base + url,
                                source: newspaper.name,
                                category: Category,
                                instructions: Instructions,
                                ingredients: Ingredients,
                                img: Img,
                                id: articles.length
                            })
                        }
                        
                    })
                
                    
                    

                })  
            }
        })
})

app.get('/', (req, res) => {
    res.json('Welcome to my Meals API')
})

app.get('/meals', (req, res) => {
    res.json(articles)
})

app.listen(PORT, () => console.log('App listening'))
