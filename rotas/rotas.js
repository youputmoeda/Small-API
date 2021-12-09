module.exports = app => {
    const controlador = require("../controllers/controller.js");
  
    var router = require("express").Router();

    //inicio
    router.get("/", controlador.FirstPage);

    //produtos
    router.get("/products/", controlador.findAll);

    //website
    router.get("/products/:websiteId", controlador.findOne);

    app.use('/api', router);
};