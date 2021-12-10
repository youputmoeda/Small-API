module.exports = app => {
    const controlador = require("../controllers/controller.js");
  
    var router = require("express").Router();

    //inicio
    router.get("/", controlador.FirstPage);

    // Cria um novo utilizador
    router.post("/registar", controlador.registar);

    // Rota para login - tem de ser POST para não vir user e pass na URL
    router.post("/login", controlador.login);

    // Rota para verificar e ativar o utilizador
    router.get("/auth/confirm/:confirmationCode", controlador.verificaUtilizador)

    //produtos
    router.get("/products/", controlador.findAll);

    //website
    router.get("/products/:websiteId", controlador.findOne);

    app.use('/api', router);
};