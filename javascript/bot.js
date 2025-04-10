const fs = require("fs");
const fetch = require("node-fetch");
const { execSync } = require("child_process");

// 🌍 URL par défaut si aucun argument n'est fourni
const DEFAULT_SOURCE_URL = "https://anime-sama.fr/catalogue/overlord/saison1/vf/episodes.js?filever=2498";

// 🔄 Récupération de l'URL depuis les arguments ou fallback sur la valeur par défaut
const sourceUrl = process.argv[2] || DEFAULT_SOURCE_URL;

async function fetchAndConvertEpisodes(sourceUrl) {
    try {
        console.log(`🔄 Téléchargement de episodes.js depuis ${sourceUrl}...`);
        const response = await fetch(sourceUrl);
        if (!response.ok) throw new Error(`Erreur HTTP : ${response.status}`);

        let jsText = await response.text();

        // 🔍 Extraction des listes eps1, eps2, etc.
        const match = jsText.match(/var\s+(\w+)\s*=\s*(\[.*?\]);/gs);
        if (!match) throw new Error("❌ Aucune donnée trouvée dans episodes.js");

        let episodes = {};
        match.forEach(block => {
            const parts = block.match(/var\s+(\w+)\s*=\s*(\[.*?\]);/s);
            if (parts) {
                let key = parts[1]; // Nom de la variable (eps1, eps2, ...)
                let array = parts[2]; // Contenu du tableau
                
                // ✅ Transformation en JSON valide
                episodes[key] = JSON.parse(array.replace(/'/g, '"'));
            }
        });

        // 📄 Sauvegarde en episodes.json
        fs.writeFileSync("episodes.json", JSON.stringify(episodes, null, 2));
        console.log("✅ episodes.json mis à jour avec succès !");
        return true;
    } catch (error) {
        console.error("❌ Erreur :", error);
        return false;
    }
}

// 🚀 Fonction pour commiter et pousser sur GitHub
function pushToGitHub() {
    try {
        console.log("📤 Envoi de episodes.json sur GitHub...");
        execSync("git add episodes.json");
        execSync('git commit -m "🔄 Mise à jour automatique de episodes.json"');
        execSync("git push");
        console.log("✅ Mise à jour réussie !");
    } catch (error) {
        console.error("❌ Erreur lors du push GitHub :", error);
    }
}

// 🔄 Exécution du bot
fetchAndConvertEpisodes(sourceUrl).then(success => {
    if (success) pushToGitHub();
});
if (!fs.existsSync("episodes.json")) {
    console.error("❌ Erreur : episodes.json n'a pas été généré !");
    process.exit(1);
}
