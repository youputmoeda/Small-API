function ondemand() {
  (async () => {
    const query = prompt("Please enter your website");
    const urlBase = `http://localhost:8008/products/${query}`;
    const listaProducts = document.getElementById("products");
    let texto = "";
    var myHeaders = new Headers();

    var myInit = { method: "GET", headers: myHeaders };

    var myRequest = new Request(`${urlBase}`, myInit);
    await fetch(myRequest).then(async function (response) {
      if (!response.ok) {
        listaProducts.innerHTML =
          "Não posso mostrar produtos de momento!";
      } else {
        products = await response.json();
        for (const product of products) {
          texto += ` 
                <div>
            <h4>${product.title}</h4>
            &nbsp;&nbsp;&nbsp;Docente: <a href="${product.url}" target="_blank">${product.url}</a>
        </div>`;
        }
        listaProducts.innerHTML = texto;
      }
    });
  })();
}

