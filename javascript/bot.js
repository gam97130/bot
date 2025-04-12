const fs = require("fs");
const fetch = require("node-fetch");
const { execSync } = require("child_process");

// ✅ URL fournie par argument ou par défaut
const BASE_URL = process.argv[2] || "https://anime-sama.fr/catalogue/overlord/saison1/vf/";
console.log("🌐 URL utilisée par le bot :", BASE_URL);

// 🔑 Token GitHub
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";

// 🧠 Détermine si l'URL est un fichier episodes.js direct
function isEpisodesJsUrl(url) {
    return url.includes("episodes.js");
}

// 🔍 Recherche et retourne le lien vers episodes.js (ou le garde s’il est déjà direct)
async function findEpisodesJsUrl(baseUrl) {
    if (isEpisodesJsUrl(baseUrl)) {
        console.log("🔗 URL directe vers episodes.js détectée :", baseUrl);
        return baseUrl;
    }

    try {
        console.log(`🔄 Recherche du fichier episodes.js sur ${baseUrl}...`);
        const response = await fetch(baseUrl);
        if (!response.ok) throw new Error(`Erreur HTTP : ${response.status}`);
        const html = await response.text();

        const matches = [...html.matchAll(/<script[^>]*src=['"]([^"']*episodes\.js[^"']*)['"][^>]*>/g)];
        if (!matches || matches.length === 0) {
            throw new Error("❌ Aucun fichier episodes.js trouvé sur la page.");
        }

        const episodesJsUrl = new URL(matches[0][1], baseUrl).href;
        console.log(`✅ Fichier episodes.js trouvé : ${episodesJsUrl}`);
        return episodesJsUrl;
    } catch (error) {
        console.error("❌ Erreur lors de la recherche de episodes.js :", error.message);
        process.exit(1);
    }
}

// 📦 Télécharge, transforme et sauvegarde episodes.json
async function fetchAndConvertEpisodes(sourceUrl) {
    try {
        console.log(`📥 Téléchargement de episodes.js depuis ${sourceUrl}...`);
        const response = await fetch(sourceUrl);
        if (!response.ok) throw new Error(`Erreur HTTP : ${response.status}`);
        let jsText = await response.text();

        const matches = jsText.match(/var\s+(\w+)\s*=\s*(\[[\s\S]*?\]);/gs);
        if (!matches) {
            console.error("❌ Aucune donnée eps trouvée !");
            return false;
        }

        let episodes = {};
        matches.forEach(block => {
            const parts = block.match(/var\s+(\w+)\s*=\s*(\[[\s\S]*?\]);/s);
            if (parts) {
                const key = parts[1];
                const array = parts[2].replace(/'/g, '"').replace(/,\s*]/g, "]");
                try {
                    episodes[key] = JSON.parse(array).map((url, i) => ({
                        episode: i + 1,
                        url
                    }));
                } catch (e) {
                    console.error(`❌ Erreur JSON pour ${key} :`, e);
                }
            }
        });

        fs.writeFileSync("episodes.json", JSON.stringify(episodes, null, 2));
        console.log("✅ episodes.json sauvegardé avec succès !");
        return true;
    } catch (error) {
        console.error("❌ Erreur lors de la conversion :", error);
        return false;
    }
}

// 📤 Commit et push
function pushToGitHub() {
    try {
        if (!fs.existsSync("episodes.json")) {
            console.error("❌ Fichier episodes.json introuvable !");
            process.exit(1);
        }

        console.log("📤 Envoi sur GitHub...");
        execSync("git config --global user.name 'GitHub Actions Bot'");
        execSync("git config --global user.email 'actions@github.com'");
        execSync("git add episodes.json");

        const changes = execSync("git status --porcelain").toString().trim();
        if (!changes) {
            console.log("⚠️ Aucun changement détecté.");
            return;
        }

        execSync('git commit -m "🔄 Mise à jour automatique de episodes.json"');
        execSync("git push origin main");

        console.log("✅ Commit & push terminés !");
    } catch (error) {
        console.error("❌ Erreur push Git :", error.message);
    }
}

// 🚀 Lance le script
findEpisodesJsUrl(BASE_URL)
    .then(fetchAndConvertEpisodes)
    .then(success => {
        if (success) pushToGitHub();
    });
