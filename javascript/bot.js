const fs = require("fs");
const fetch = require("node-fetch");
const { execSync } = require("child_process");

// 🌍 URL de la saison fournie en argument
const BASE_URL = process.argv[2] || "https://anime-sama.fr/catalogue/overlord/saison1/vf/";
console.log("🌐 URL utilisée par le bot :", BASE_URL);

// 🔑 Token GitHub (pour push)
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";

async function findEpisodesJsUrl(baseUrl) {
    try {
        console.log(`🔄 Recherche du fichier episodes.js sur ${baseUrl}...`);

        // 📥 Télécharger le HTML de la page
        const response = await fetch(baseUrl);
        if (!response.ok) throw new Error(`Erreur HTTP : ${response.status}`);

        const html = await response.text();

        // 🔍 Chercher un script contenant episodes.js
        const matches = [...html.matchAll(/<script[^>]*src=['"]([^"']*episodes\.js[^"']*)['"][^>]*>/g)];

        if (!matches || matches.length === 0) {
            throw new Error("❌ Aucun fichier episodes.js trouvé sur la page.");
        }

        // 🏰 Prendre le premier match et construire l'URL complète
        const episodesJsUrl = new URL(matches[0][1], baseUrl).href;
        console.log(`✅ Fichier episodes.js trouvé : ${episodesJsUrl}`);

        return episodesJsUrl;
    } catch (error) {
        console.error("❌ Erreur lors de la recherche de episodes.js :", error);
        process.exit(1);
    }
}

async function fetchAndConvertEpisodes(sourceUrl) {
    try {
        console.log(`🔄 Téléchargement de episodes.js depuis ${sourceUrl}...`);
        const response = await fetch(sourceUrl);
        if (!response.ok) throw new Error(`Erreur HTTP : ${response.status}`);

        let jsText = await response.text();
        console.log("🔍 Contenu récupéré (extrait) :\n", jsText.slice(0, 500));

        // 🔍 Extraction des variables eps1, eps2, etc.
        const matches = jsText.match(/var\s+(\w+)\s*=\s*(\[[\s\S]*?\]);/gs);
        if (!matches) {
            console.error("❌ Erreur : Aucune donnée trouvée dans episodes.js !");
            return false;
        }

        let episodes = {};
        matches.forEach(block => {
            const parts = block.match(/var\s+(\w+)\s*=\s*(\[[\s\S]*?\]);/s);
            if (parts) {
                let key = parts[1];
                let array = parts[2];

                console.log(`🔍 Extraction de ${key}`);

                let jsonArray = array
                    .replace(/'/g, '"')
                    .replace(/,\s*]/g, "]");

                try {
                    episodes[key] = JSON.parse(jsonArray);
                } catch (parseError) {
                    console.error(`❌ Erreur de parsing JSON pour ${key} :`, parseError);
                }
            }
        });

        console.log("🔍 Données extraites avant sauvegarde :", JSON.stringify(episodes, null, 2));

        // 🔄 Correction de la numérotation (de 0-12 à 1-13)
        Object.keys(episodes).forEach(key => {
            episodes[key] = episodes[key].map((url, index) => ({
                episode: index + 1,
                url: url
            }));
        });

        const filePath = "episodes.json";
        console.log(`📁 Enregistrement dans ${filePath} à la racine du dépôt !`);
        fs.writeFileSync(filePath, JSON.stringify(episodes, null, 2));

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
        const filePath = "episodes.json";
        if (!fs.existsSync(filePath)) {
            console.error("❌ Erreur : episodes.json n'a pas été généré !");
            process.exit(1);
        }

        console.log("📤 Envoi de episodes.json sur GitHub...");

        try {
            execSync("git rev-parse --is-inside-work-tree");
        } catch {
            console.error("❌ Erreur : Ce dossier n'est pas un dépôt Git !");
            process.exit(1);
        }

        execSync("git add episodes.json");
        const changes = execSync("git status --porcelain").toString().trim();
        if (!changes) {
            console.log("⚠️ Aucun changement détecté, commit annulé.");
            return;
        }

        execSync('git commit -m "🔄 Mise à jour automatique de episodes.json"');
        execSync("git push origin main");

        console.log("✅ Mise à jour réussie !");
    } catch (error) {
        console.error("❌ Erreur lors du push GitHub :", error);
    }
}

// 🔄 Exécution du bot
findEpisodesJsUrl(BASE_URL)
    .then(fetchAndConvertEpisodes)
    .then(success => {
        if (success) pushToGitHub();
    });
