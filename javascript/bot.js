const fs = require('fs');
const fetch = require('node-fetch');

const URL_EPISODES_JS = "https://anime-sama.fr/catalogue/overlord/saison1/vf/episodes.js";
const OUTPUT_FILE = "episodes.json";

async function fetchAndConvert() {
    try {
        // Récupérer episodes.js
        const response = await fetch(URL_EPISODES_JS);
        let text = await response.text();

        // Transformer en JSON valide
        text = text.replace(/var\s+\w+\s*=\s*/, "").trim();
        const jsonData = JSON.parse(text);

        // Sauvegarde
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(jsonData, null, 2));
        console.log("✅ episodes.json généré !");
    } catch (error) {
        console.error("❌ Erreur :", error);
        process.exit(1);
    }
}

fetchAndConvert();
