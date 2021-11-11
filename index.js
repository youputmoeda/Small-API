const express = require('express')
const axios = require('axios')
const cheerio = require('cheerio')
const { response } = require('express')
const { last } = require('cheerio/lib/api/traversing')
const PORT = process.env.PORT || 8080

const app = express()

const jornals = [
    {
        name: 'maisfutebol',
        address: 'https://maisfutebol.iol.pt/liga',
        base: 'https://maisfutebol.iol.pt'
    },
    {
        name: 'livescore',
        address: 'https://www.livescore.com/en/news',
        base: 'https://www.livescore.com'
    },
    {
        name: 'jogo',
        address: 'https://www.ojogo.pt/futebol.html',
        base: 'https://www.ojogo.pt'
    },
    {
        name: 'record',
        address: 'https://www.record.pt/ultimas-noticias',
        base: 'https://www.record.pt'
    },
    {
        name: 'besoccer',
        address: 'https://pt.besoccer.com/noticias',
        base: ''
    }
]

const classification = []

jornals.forEach(jornal => {
    axios.get(jornal.address)
        .then(response => {
            const html = response.data
            const $ = cheerio.load(html)

            $('a:contains("º")', html).each(function () {
                const title = $(this).text()
                const url = $(this).attr('href')

                classification.push({
                    title,
                    url: jornal.base + url,
                })
            })

        })
})

const articles = []

jornals.forEach(jornal => {
    axios.get(jornal.address)
        .then(response => {
            const html = response.data
            const $ = cheerio.load(html)

            $('a', html).each(function () {
                const title = $(this).text()
                const url = $(this).attr('href')
 
                articles.push({
                    title,
                    url: jornal.base + url,
                    source: jornal.name
                })
            })

        })
})

app.get('/', (req, res) => {
    res.json('Welcome to my Football API')
})

app.get('/classificacao', (req, res) => {
    res.json(classification)
})

app.get('/ultimas', (req, res) => {
    res.json(articles)
})

app.get('/ultimas/:jornalId', async (req, res) => {
    const jornalId = req.params.jornalId

    const jornalAdress = jornals.filter(jornal => jornal.name == jornalId)[0].address
    const jornalBase = jornals.filter(jornal => jornal.name == jornalId)[0].base

    axios.get(jornalAdress)
        .then(response => {
            const html = response.data
            const $ = cheerio.load(html)
            const specificArticles = []

            $('h1', html).each(function () {
                const title = $(this).text()
                const url = $(this).attr('href')
                specificArticles.push({
                    title,
                    url: jornalBase + url,
                    source: jornalId
                })
            })

            $('h2', html).each(function () {
                const title = $(this).text()
                const url = $(this).attr('href')
                specificArticles.push({
                    title,
                    url: jornalBase + url,
                    source: jornalId
                })
            })
            res.json(specificArticles)
        }).catch(err => console.log(err))
})

app.listen(PORT, () => console.log(`Server running in PORT ${PORT}`))