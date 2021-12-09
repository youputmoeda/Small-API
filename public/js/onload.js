window.onload = () => {
  (async () => {
    const urlBase = "http://localhost:8008/api/products";
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
            &nbsp;&nbsp;&nbsp;Specifications: <a>${product.specifications}</a>
            <br>&nbsp;&nbsp;&nbsp;Price: <a>${product.price}</a>
            <br>&nbsp;&nbsp;&nbsp;<a>${product.Warranty}</a>
            <br>&nbsp;&nbsp;&nbsp;Link: <a href="${product.url}" target="_blank">${product.url}</a>
            <br>&nbsp;&nbsp;&nbsp;Website: <a>${product.source}</a>
        </div>`;
        }
        listaProducts.innerHTML = texto;
      }
    });
  })();
}

