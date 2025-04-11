const fs = require("fs");
const fetch = require("node-fetch");
const { execSync } = require("child_process");

// 🌐 URL de la saison (base)
const BASE_URL = process.argv[2] || "https://anime-sama.fr/catalogue/overlord/saison1/vf/";
console.log("\ud83c\udf10 URL utilisée par le bot :", BASE_URL);

// 🔑 Token GitHub (nécessaire pour push en mode CI/CD)
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || ""; 

async function findEpisodesJsUrl(baseUrl) {
    try {
        console.log(`\ud83d\udd04 Recherche du fichier episodes.js sur ${baseUrl}...`);

        // 👥 Télécharger le contenu HTML de la page de la saison
        const response = await fetch(baseUrl);
        if (!response.ok) throw new Error(`Erreur HTTP : ${response.status}`);

        const html = await response.text();

        // 🔍 Chercher un script contenant episodes.js
        const match = html.match(/<script[^>]*src=['"]([^"']*episodes\.js\?filever=\d+)['"][^>]*>/);
        if (!match) throw new Error("❌ Aucun fichier episodes.js trouvé sur la page.");

        // 🏰 Construire l’URL complète
        const episodesJsUrl = new URL(match[1], baseUrl).href;
        console.log(`✅ Fichier episodes.js trouvé : ${episodesJsUrl}`);

        return episodesJsUrl;
    } catch (error) {
        console.error("❌ Erreur lors de la recherche de episodes.js :", error);
        process.exit(1);
    }
}

async function fetchAndConvertEpisodes(sourceUrl) {
    try {
        console.log(`\ud83d\udd04 Téléchargement de episodes.js depuis ${sourceUrl}...`);
        const response = await fetch(sourceUrl);
        if (!response.ok) throw new Error(`Erreur HTTP : ${response.status}`);

        let jsText = await response.text();
        console.log("\ud83d\udd0d Contenu récupéré (extrait) :\n", jsText.slice(0, 500));

        // 🔍 Extraction des listes eps1, eps2, etc.
        const match = jsText.match(/var\s+(\w+)\s*=\s*(\[[\s\S]*?\]);/gs);
        if (!match) {
            console.error("❌ Erreur : Aucune donnée trouvée dans episodes.js !");
            return false;
        }

        let episodes = {};
        match.forEach(block => {
            const parts = block.match(/var\s+(\w+)\s*=\s*(\[[\s\S]*?\]);/s);
            if (parts) {
                let key = parts[1]; // Nom de la variable (eps1, eps2, ...)
                let array = parts[2]; // Contenu du tableau

                console.log(`\ud83d\udd0d Extraction de ${key}`);

                // ✅ Correction des apostrophes et espaces
                let jsonArray = array
                    .replace(/'/g, '"')    // Convertit les apostrophes en guillemets
                    .replace(/,\s*]/g, "]"); // Supprime les virgules en trop à la fin des tableaux

                try {
                    episodes[key] = JSON.parse(jsonArray);
                } catch (parseError) {
                    console.error(`❌ Erreur de parsing JSON pour ${key} :`, parseError);
                }
            }
        });

        console.log("\ud83d\udd0d Données extraites avant sauvegarde :", JSON.stringify(episodes, null, 2));

        // 🔄 Correction de la numérotation (de 0-12 à 1-13)
        Object.keys(episodes).forEach(key => {
            episodes[key] = episodes[key].map((url, index) => ({
                episode: index + 1, // Correction de la numérotation
                url: url
            }));
        });

        console.log("📁 Enregistrement dans episodes.json à la racine !");
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
        if (!fs.existsSync("episodes.json")) {
            console.error("❌ Erreur : episodes.json n'a pas été généré !");
            process.exit(1);
        }

        console.log("\ud83d\udce4 Envoi de episodes.json sur GitHub...");

        // Vérifier si le repo Git est bien initialisé
        try {
            execSync("git rev-parse --is-inside-work-tree");
        } catch {
            console.error("❌ Erreur : Ce dossier n'est pas un dépôt Git !");
            process.exit(1);
        }

        console.log("\ud83d\udc49 Commandes Git exécutées :");
        console.log("git add episodes.json");
        console.log("git commit -m \"\ud83d\udd04 Mise à jour automatique de episodes.json\"");
        console.log("git push origin main");

        // Configuration GitHub si un token est disponible
        if (GITHUB_TOKEN) {
            execSync(`git config --global user.email "bot@github.com"`);
            execSync(`git config --global user.name "GitHub Bot"`);
            execSync(`git remote set-url origin https://${GITHUB_TOKEN}@github.com/gam97130/bot.js.git`);
        }

        execSync("git add episodes.json");
        execSync('git commit -m "\ud83d\udd04 Mise à jour automatique de episodes.json"');
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
