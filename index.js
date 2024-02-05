const puppeteer = require("puppeteer");
const fs = require('fs')
const URL = "https://shopmfns.com/";

const getProducts = async () => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
    });
    const page = await browser.newPage();
    await page.goto(URL, {
        waitUntil: "networkidle2",
    });

    const products = await page.evaluate(() => {
        const productsList = document.querySelectorAll(".product-card-wrapper");
        return Array.from(productsList).map((product) => {
            const title = product.querySelector("h3 .full-unstyled-link").innerText.split("\n")[1].trim();
            const price = product.querySelector(".price").innerText.split("\n")[1];
            const image = product.querySelector("img").src;
            return {
                title,
                price,
                image
            };
        });
    });
    
    await browser.close();
    return products;
}

function jsonToCsv(products) {
    const header = Object.keys(products[0]);
    const headerString = header.join(',');
    const replacer = (key, value) => value ?? '';
    const rowItems = products.map((row) =>
    header
    .map((fieldName) => JSON.stringify(row[fieldName], replacer))
    .join(',')
    );
    const csv = [headerString, ...rowItems].join('\r\n');
    return csv;
}

getProducts().then(products => {
    console.log(products);
    fs.writeFile('output.json', JSON.stringify(products), (err) => {
        if (err) throw err;
    })
    fs.writeFile('output.csv', jsonToCsv(products), (err) => {
        if (err) throw err;
    })
})
