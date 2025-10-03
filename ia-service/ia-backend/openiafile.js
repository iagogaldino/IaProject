import fs from "fs";
import pdf from "pdf-parse";

const buffer = fs.readFileSync("meuarquivo.pdf");

pdf(buffer).then(data => {
    console.log(data.text); // todo o texto extraído
});
