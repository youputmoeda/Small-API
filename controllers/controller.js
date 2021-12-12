require("dotenv").config();

const db = require("../models/nedb"); // Define o MODEL que vamos usar
const bcrypt = require("bcrypt");
const axios = require('axios')
const cheerio = require('cheerio')  
const jwt = require("jsonwebtoken");

function authenticateToken(req, res) {
  console.log("A autorizar...");
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) {
    console.log("Token nula");
    return res.sendStatus(401);
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.email = user;
  });
}
const nodemailer = require("nodemailer");
const { response } = require("express");

// async..await não é permitido no contexto global
async function enviaEmail(recipients, confirmationToken) {
  // Gera uma conta do serviço SMTP de email do domínio ethereal.email
  // Somente necessário na fase de testes e se não tiver uma conta real para utilizar
  let testAccount = await nodemailer.createTestAccount();

  // Cria um objeto transporter reutilizável que é um transporter SMTP
  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true para 465, false para outras portas
    auth: {
      user: testAccount.user, // utilizador ethereal gerado
      pass: testAccount.pass, // senha do utilizador ethereal
    },
  });

  // envia o email usando o objeto de transporte definido
  let info = await transporter.sendMail({
    from: '"Fred Foo 👻" <foo@example.com>', // endereço do originador
    to: recipients, // lista de destinatários
    subject: "Hello ✔", // assunto
    text: "Clique aqui para ativar sua conta: " + confirmationToken, // corpo do email
    html: "<b>Clique aqui para ativar sua conta: " + confirmationToken + "</b>", // corpo do email em html
  });

  console.log("Mensagem enviada: %s", info.messageId);
  // Mensagem enviada: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // A pré-visualização só estará disponível se usar uma conta Ethereal para envio
  console.log(
    "URL para visualização prévia: %s",
    nodemailer.getTestMessageUrl(info)
  );
  // URL para visualização prévia: https://ethereal.email/message/WaQKMgKddxQDoou...
}

exports.verificaUtilizador = async (req, res) => {
  const confirmationCode = req.params.confirmationCode;
  db.crUd_ativar(confirmationCode);
  const resposta = { message: "O utilizador está ativo!" };
  console.log(resposta);
  return res.send(resposta);
};

// REGISTAR - cria um novo utilizador
exports.registar = async (req, res) => {
  console.log("Registar novo utilizador");
  if (!req.body) {
    return res.status(400).send({
      message: "O conteúdo não pode ser vazio!",
    });
  }
  const salt = await bcrypt.genSalt();
  const hashPassword = await bcrypt.hash(req.body.password, salt);
  const email = req.body.email;
  const password = hashPassword;
  const confirmationToken = jwt.sign(
    req.body.email,
    process.env.ACCESS_TOKEN_SECRET
  );
  const confirmURL = `http://localhost:${process.env.PORT}/api/auth/confirm/${confirmationToken}`
  db.Crud_registar(email, password, confirmationToken) // C: Create
    .then((dados) => {
      enviaEmail(email, confirmURL).catch(console.error);
      res.status(201).send({
        message:
          "Utilizador criado com sucesso, confira sua caixa de correio para ativar!",
      });
      console.log("Controller - utilizador registado: ");
      console.log(JSON.stringify(dados)); // para debug
    })
    .catch((response) => {
      console.log("controller - registar:");
      console.log(response);
      return res.status(400).send(response);
    });
};

// LOGIN - autentica um utilizador
exports.login = async (req, res) => {
  console.log("Autenticação de um utilizador");
  if (!req.body) {
    return res.status(400).send({
      message: "O conteúdo não pode ser vazio!",
    });
  }
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(req.body.password, salt);
  const email = req.body.email;
  const password = hashPassword;
  db.cRud_login(email) //
    .then(async (dados) => {
      if (await bcrypt.compare(req.body.password, dados.password)) {
        const user = { name: email };
        const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
        res.json({ accessToken: accessToken }); // aqui temos de enviar a token de autorização
        console.log("Resposta da consulta à base de dados: ");
        console.log(JSON.stringify(dados)); // para debug
      } else {
        console.log("Password incorreta");
        return res.status(401).send({ erro: "A senha não está correta!" });
      }
    })
    .catch((response) => {
      console.log("controller:");
      console.log(response);
      return res.status(400).send(response);
    });
};

// const express = require('express')
// const app = express()
// const { response } = require('express')
// const { last } = require('cheerio/lib/api/traversing')

const websites = [
    {
        name: 'BackMarket',
        address: 'https://www.backmarket.pt/apple-recondicionados.html',
        base: 'https://www.backmarket.pt'
    },
    {
        name: 'iOutlet',
        address: 'https://www.ioutletstore.pt/',
        base: ''
    },
    {
        name: 'Swappie',
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

            if (website.name == 'BackMarket'){
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
            } else if (website.name == 'iOutlet') {
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

exports.FirstPage = (req, res) => {
    const message = ('Welcome to my API of reconditioned Apple Devices\
        The paths that are possible are:\
        /products\
        /products/:websiteId\
        The websites that are used are: BackMarket, iOutlet and Swappie')
    res.json(message)
}

exports.findAll = (req, res) => {
  authenticateToken(req, res);
  if (req.email != null) {
    console.log(`FindAll - user: ${req.email.name}`);
    res.json(products)
  }
    // console.log("token: " + authenticateToken)
    // if (req.email != null) {
    // // utilizador autenticado
    //   console.log(`FindAll - user: ${req.email.name}`);
    // }
}

exports.findOne = async (req, res) => {
  authenticateToken(req, res);
  if (req.email != null) {
    // utilizador autenticado
    console.log(`FindAll - user: ${req.email.name}`);
    const websiteId = req.params.websiteId
    console.log("websiteId: " + websiteId)
    const websiteAdress = websites.filter(website => website.name == websiteId)[0].address
    const websiteBase = websites.filter(website => website.name == websiteId)[0].base
    axios.get(websiteAdress)
        .then(response => {
            const html = response.data
            const $ = cheerio.load(html)
            const specificproducts = []
  
            if (websiteId == 'BackMarket'){
                $('section', html).each(function () {
                    $('a[data-bmid]', html).each(function () {
                        const title = $('h2', this).text().trim()
                        const url = $(this).attr('href')
                        const specifications = $('span:Contains("GB")', this).text().trim()
                        const Warranty = $('span:Contains("Garantia")', this).text().trim()
                        const price = $('span:Contains("€")', this).first().text().trim()
                        //var Myimage = new Image()
                        // image.src = $(this)
                        //console.log("image: "+ Myimage)
                        specificproducts.push({
                            title,
                            specifications,
                            Warranty,
                            price,
                            url: websiteBase + url,
                            source: websiteId
                            //image
                        })
                    })
                })
            } else if (websiteId == 'iOutlet') {
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
  }
}