async function getProducts(websiteId) {
    const urlBase = "http://localhost:8008/api/products";
    const listaProducts = document.getElementById("specificproducts");
    const criteria = document.getElementById("searchkey").value;
    console.log("Critério: " + criteria);
    let texto = "";
    let myHeaders = new Headers();
    let url = urlBase;
  
    if (websiteId != "") {
      url = url + "/:" + websiteId;
    } else if (criteria != "") {  
             url = url + "/:" + criteria;
           }

    console.log("URL: " + url);
    const myInit = { method: "GET", headers: myHeaders };
    const myRequest = new Request(url, myInit);

    await fetch(myRequest).then(async function (response) {
      if (!response.ok) {
        listaProducts.innerHTML = 
        "Não posso mostrar produtos de momento!";
      } else {
        // console.log("I arrive here")
        specificproducts = await response.json();
        console.log(specificproducts);
        if (Object.keys(specificproducts).length == 1) {
          // Só retornou uma specificproducts, detalhamos
          specificproduct = specificproducts[0];
          texto += ` 
          <div>
            <h4>${specificproduct.title}</h4>
            &nbsp;&nbsp;&nbsp;Specifications: <a>${specificproduct.specifications}</a>
            <br>&nbsp;&nbsp;&nbsp;Price: <a>${specificproduct.price}</a>
            <br>&nbsp;&nbsp;&nbsp;<a>${specificproduct.Warranty}</a>
            <br>&nbsp;&nbsp;&nbsp;Link: <a href="${specificproduct.url}" target="_blank">${specificproduct.url}</a>
            <br>&nbsp;&nbsp;&nbsp;Website: <a>${specificproduct.source}</a>
          </div>`;
        } else {
          // Retornou mais de um produto
          for (const specificproduct of specificproducts) {
            texto += ` 
            <div>
              <h4>${specificproduct.title}
              <button type="button" onclick="getProducts('${specificproduct.title}')">
                Clique aqui para detalhar este produto
              </button></h4>
            </div>`;
          }
        }
        listaProducts.innerHTML = texto;
      }
    });
  }