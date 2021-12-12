const urlBase = "http://localhost:8008/api";
const modalLogin = document.getElementById("modalLogin");
const bsModalLogin = new bootstrap.Modal(modalLogin, (backdrop = "static")); // Pode passar opções
const modalRegistar = document.getElementById("modalRegistar");
const bsModalRegistar = new bootstrap.Modal(
  modalRegistar,
  (backdrop = "static")
); // Pode passar opções

const btnModalLogin = document.getElementById("btnModalLogin");
const btnModalRegistar = document.getElementById("btnModalRegistar");
const btnLogoff = document.getElementById("btnLogoff");
const pRegistar = document.getElementById("pRegistar");
const listaProducts = document.getElementById("listaProducts");

pRegistar.addEventListener("click", () => {
  bsModalLogin.hide();
  chamaModalRegistar();
});

modalLogin.addEventListener("shown.bs.modal", () => {
  document.getElementById("usernameLogin").focus();
});
btnModalLogin.addEventListener("click", () => {
  bsModalLogin.show();
});
btnModalRegistar.addEventListener("click", () => {
  chamaModalRegistar();
});

function chamaModalRegistar() {
  document.getElementById("btnSubmitRegistar").style.display = "block";
  document.getElementById("btnCancelaRegistar").innerHTML = "Cancelar";
  bsModalRegistar.show();
}

btnLogoff.addEventListener("click", () => {
  localStorage.removeItem("token");
  document.getElementById("btnLogoff").style.display = "none";
  window.location.replace("index.html");
});

function validaRegisto() {
  let email = document.getElementById("usernameRegistar").value; // email é validado pelo próprio browser
  let senha = document.getElementById("senhaRegistar").value; // tem de ter uma senha
  const statReg = document.getElementById("statusRegistar");
  if (senha.length < 4) {
    document.getElementById("passErroLogin").innerHTML =
      "A senha tem de ter ao menos 4 carateres";
    return;
  }
  fetch(`${urlBase}/registar`, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "POST",
    body: `email=${email}&password=${senha}`,
  })
    .then(async (response) => {
      if (!response.ok) {
        erro = response.statusText;
        statReg.innerHTML = response.statusText;
        throw new Error(erro);
      }
      result = await response.json();
      console.log(result.message);
      statReg.innerHTML = result.message;
      document.getElementById("btnSubmitRegistar").style.display = "none";
      document.getElementById("btnCancelaRegistar").innerHTML =
        "Fechar este diálogo";
    })
    .catch((error) => {
      document.getElementById(
        "statusRegistar"
      ).innerHTML = `Pedido falhado: ${error}`;
    });
}

function validaLogin() {
  let email = document.getElementById("usernameLogin").value; // email é validado pelo próprio browser
  let senha = document.getElementById("senhaLogin").value; // tem de ter uma senha
  if (senha.length < 4) {
    document.getElementById("passErroLogin").innerHTML =
      "A senha tem de ter ao menos 4 carateres";
    return;
  }
  const statLogin = document.getElementById("statusLogin");

  fetch(`${urlBase}/login`, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "POST", // o login não vai criar nada, só ver se o user existe e a pass está correta
    body: `email=${email}&password=${senha}`,
  })
    .then(async (response) => {
      if (!response.ok) {
        erro = await response.json();
        throw new Error(erro.msg);
      }
      result = await response.json();
      console.log(result.accessToken);
      const token = result.accessToken;
      localStorage.setItem("token", token);
      document.getElementById("statusLogin").innerHTML = "Sucesso!";
      listaProducts.innerHTML = "";
      document.getElementById("btnLoginClose").click();
    })
    .catch(async (error) => {
      statLogin.innerHTML = error;
    });
}


async function getProducts(websiteId, websiteSource, websiteUrl, websiteWarra, websitePrice, websiteSpec) {
    const listaProducts = document.getElementById("specificproducts");
    const criteria = document.getElementById("searchkey").value;
    console.log("Critério: " + criteria);
    let texto = "";
    let url = urlBase + "/products";

    const token = localStorage.token;
    console.log(token);

    
    if (criteria != "") {  
             url = url + "/" + criteria;
           }

    console.log("URL: " + url);
    const myInit = { 
      method: "GET", 
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${token}`,
      },
    };
    const myRequest = new Request(url, myInit);

    await fetch(myRequest).then(async function (response) {
      if (!response.ok) {
        listaProducts.innerHTML = 
        "Não posso mostrar produtos de momento!";
      } else {
        // console.log("I arrive here")
        specificproducts = await response.json();
        console.log(specificproducts);
          if (websiteSource) {
            texto += ` 
            <!--Comentário: Link para as funcionalidades CSS do Bootstrap-->
            <link
              href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css"
              rel="stylesheet"
              integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3"
              crossorigin="anonymous"
            />
            <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
        
            <!-- Bootstrap CSS -->
            <link
              rel="stylesheet"
              href="https://www.markuptag.com/bootstrap/5/css/bootstrap.min.css"
            />
                <div>
                  <h4><a href="${websiteUrl}" target="_blank">${websiteId}</a></h4>
                  &nbsp;&nbsp;&nbsp;Specifications: <a>${websiteSpec}</a>
                  <br>&nbsp;&nbsp;&nbsp;Price: <a>${websitePrice}</a>
                  <br>&nbsp;&nbsp;&nbsp;<a>${websiteWarra}</a>
                  <br>&nbsp;&nbsp;&nbsp;Website: <a>${websiteSource}</a>
                  </div>`;
              console.log("arroz")
              //<br>&nbsp;&nbsp;&nbsp;Img: <a>${websiteImg}</a>
          }
          // Retornou mais de um produto
          for (const specificproduct of specificproducts) {
            texto += ` 
            <!--Comentário: Link para as funcionalidades CSS do Bootstrap-->
            <link
              href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css"
              rel="stylesheet"
              integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3"
              crossorigin="anonymous"
            />
            <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
        
            <!-- Bootstrap CSS -->
            <link
              rel="stylesheet"
              href="https://www.markuptag.com/bootstrap/5/css/bootstrap.min.css"
            />
            <div>
            <h4><em>${specificproduct.title}</em>
            <button type = "button" class="btn btn-dark btn-sm" onclick="getProducts('${specificproduct.title}', '${specificproduct.source}', '${specificproduct.url}', '${specificproduct.Warranty}', '${specificproduct.price}', '${specificproduct.specifications}', '${specificproduct.image}')">
              Clique aqui para detalhar este produto
            </button></h4>
            </div>`;
          }
        }
        listaProducts.innerHTML = texto;
    });
  }