const express = require('express')
const axios = require('axios')
const cheerio = require('cheerio')
const { response } = require('express')
const { last } = require('cheerio/lib/api/traversing')
const PORT = process.env.PORT || 8080

const app = express()

const websites = [
    {
        name: 'blackmarket',
        address: 'https://www.backmarket.pt/apple-recondicionados.html',
        base: 'https://www.backmarket.pt'
    },
    {
        name: 'ioutlet',
        address: 'https://www.ioutletstore.pt/',
        base: ''
    },
    {
        name: 'swappie',
        address: 'https://swappie.com/pt-en/iphone/',
        base: 'https://swappie.com'
    }
]

const products = []

websites.forEach(website => {
    axios.get(website.address)
        .then(response => {
            const html = response.data
            const $ = cheerio.load(html)

            if (website.name == 'blackmarket'){
                $('section', html).each(function () {
                    $('a[data-bmid]', html).each(function () {
                        const title = $('h2', this).text().trim()
                        const url = $(this).attr('href')
                        const specifications = $('span:Contains("GB")', this).text().trim()
                        const Warranty = $('span:Contains("Garantia")', this).text().trim()
                        const price = $('span:Contains("€")', this).first().text().trim()
                        products.push({
                            title,
                            specifications,
                            Warranty,
                            price,
                            url: website.base + url,
                            source: website.name
                        })
                    })
                })
            } else if (website.name == 'ioutlet') {
                    $('div.woocommerce-card__header', html).each(function () {
                        const title = $('a:Contains("Apple")', this).attr('aria-label')
                        if (!title) {
                            return 
                        }
                        const price = $('ins', this).text()
                        const url = $('a:Contains("Apple")', this).attr('href')
                        products.push({
                            title,
                            price,
                            url: website.base + url,
                            source: website.name
                        })
                    })
                } else {
                    $('li', html).each(function () {
                        const title = $('a:Contains("iPhone")', this).text().trim()
                        if (!title) {
                            return 
                        }
                        const price = $('span:Contains("€")',this).last().text().trim()
                        const url = $('a:Contains("iPhone")', this).attr('href')
                        products.push({
                            title,
                            price,
                            url: website.base + url,
                            source: website.name
                        })
                    })
                }
            })
})

app.get('/', (req, res) => {
    res.json('Welcome to my API of reconditioned iPhones')
})

app.get('/products', (req, res) => {
    res.json(products)
})

app.get('/products/:websiteId', async (req, res) => {
    const websiteId = req.params.websiteId

    const websiteAdress = websites.filter(website => website.name == websiteId)[0].address
    const websiteBase = websites.filter(website => website.name == websiteId)[0].base

    axios.get(websiteAdress)
        .then(response => {
            const html = response.data
            const $ = cheerio.load(html)
            const specificproducts = []

            if (websiteId == 'blackmarket'){
                $('section', html).each(function () {
                    $('a[data-bmid]', html).each(function () {
                        const title = $('h2', this).text().trim()
                        const url = $(this).attr('href')
                        const specifications = $('span:Contains("GB")', this).text().trim()
                        const Warranty = $('span:Contains("Garantia")', this).text().trim()
                        const price = $('span:Contains("€")', this).first().text().trim()
                        specificproducts.push({
                            title,
                            specifications,
                            Warranty,
                            price,
                            url: websiteBase + url,
                            source: websiteId
                        })
                    })
                })
            } else if (websiteId == 'ioutlet') {
                    $('div.woocommerce-card__header', html).each(function () {
                        const title = $('a:Contains("Apple")', this).attr('aria-label')
                        if (!title) {
                            return 
                        }
                        const price = $('ins', this).text()
                        const url = $('a:Contains("Apple")', this).attr('href')
                        specificproducts.push({
                            title,
                            price,
                            url: websiteBase + url,
                            source: websiteId
                        })
                    })
                } else {
                    $('li', html).each(function () {
                        const title = $('a:Contains("iPhone")', this).text().trim()
                        if (!title) {
                            return 
                        }
                        const price = $('span:Contains("€")',this).last().text().trim()
                        const url = $('a:Contains("iPhone")', this).attr('href')
                        specificproducts.push({
                            title,
                            price,
                            url: websiteBase + url,
                            source: websiteId
                        })
                    })
                }
            res.json(specificproducts)
        }).catch(err => console.log(err))
})

app.listen(PORT, () => console.log(`Server running in PORT ${PORT}`))