const fs = require("fs");
const fetch = require("node-fetch");
const { execSync } = require("child_process");

// 📥 Fonction pour récupérer `episodes.js` et le convertir
async function fetchAndConvertEpisodes(sourceUrl) {
    try {
        console.log(`🔄 Téléchargement de episodes.js depuis ${sourceUrl}...`);
        const response = await fetch(sourceUrl);
        if (!response.ok) throw new Error(`Erreur HTTP : ${response.status}`);

        const jsText = await response.text();

        // 🔍 Extraire les variables eps1, eps2, etc.
        const match = jsText.match(/var\s+(\w+)\s*=\s*(\[.*?\]);/gs);
        if (!match) throw new Error("❌ Aucune donnée trouvée dans episodes.js");

        let episodes = {};
        match.forEach(block => {
            const [_, key, array] = block.match(/var\s+(\w+)\s*=\s*(\[.*?\]);/s);
            episodes[key] = JSON.parse(array.replace(/'/g, '"'));
        });

        // 📄 Sauvegarder en episodes.json
        fs.writeFileSync("episodes.json", JSON.stringify(episodes, null, 2));
        console.log("✅ episodes.json mis à jour !");

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
        execSync('git commit -m "Mise à jour automatique de episodes.json"');
        execSync("git push");
        console.log("✅ Mise à jour réussie !");
    } catch (error) {
        console.error("❌ Erreur lors du push GitHub :", error);
    }
}

// 🔄 Exécution du bot
const sourceUrl = process.argv[2]; // L'URL est passée en paramètre
if (!sourceUrl) {
    console.error("❌ Aucune URL fournie !");
    process.exit(1);
}

fetchAndConvertEpisodes(sourceUrl).then(success => {
    if (success) pushToGitHub();
});
