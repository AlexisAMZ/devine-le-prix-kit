// Script pour récupérer les 5 images manquantes en mode wallpaper
// Utilisation : node fetch_missing.js

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const API_KEY = "b406419352caf72aac67a6e4b2b7980e6e93967ee7f1529b061a447be27b7bdc";
const BASE_URL = "https://serpapi.com/search.json";
const ASSETS_DIR = path.join(__dirname, '..', 'assets', 'products');

// Les 5 produits manquants
const missingProducts = [
    { 
        name: "Tesla Model Y", 
        query: "Tesla Model Y wallpaper 4k",
        filename: "tesla_model_y.jpg",
        price: 49990
    },
    { 
        name: "Casquette Gucci GG", 
        query: "Gucci cap wallpaper",
        filename: "casquette_gucci_gg.jpg",
        price: 420
    },
    { 
        name: "Plein Essence", 
        query: "gas station wallpaper",
        filename: "plein_essence.jpg",
        price: 98.5
    },
    { 
        name: "Abonnement Spotify Duo", 
        query: "Spotify logo wallpaper",
        filename: "abonnement_spotify_duo.jpg",
        price: 179
    },
    { 
        name: "Nuit Ritz Paris", 
        query: "Ritz Paris hotel wallpaper luxury",
        filename: "nuit_ritz_paris.jpg",
        price: 3200
    }
];

// Télécharger une image
function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        
        protocol.get(url, (response) => {
            if (response.statusCode === 200) {
                const file = fs.createWriteStream(filepath);
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve(filepath);
                });
            } else if (response.statusCode === 301 || response.statusCode === 302) {
                downloadImage(response.headers.location, filepath).then(resolve).catch(reject);
            } else {
                reject(new Error(`Status: ${response.statusCode}`));
            }
        }).on('error', reject);
    });
}

// Récupérer image en mode wallpaper
async function fetchWallpaper(product, index) {
    const filepath = path.join(ASSETS_DIR, product.filename);
    
    // Vérifier si déjà téléchargé
    if (fs.existsSync(filepath)) {
        console.log(`✅ [${index + 1}/5] ${product.name} - DÉJÀ PRÉSENT\n`);
        return true;
    }
    
    const url = `${BASE_URL}?engine=google_images&q=${encodeURIComponent(product.query)}&api_key=${API_KEY}&num=3`;
    
    try {
        console.log(`🔍 [${index + 1}/5] Recherche wallpaper: ${product.name}...`);
        
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);
        
        const data = await response.json();
        
        if (data.images_results && data.images_results.length > 0) {
            // Essayer les 3 premières images jusqu'à ce qu'une fonctionne
            for (let i = 0; i < Math.min(3, data.images_results.length); i++) {
                try {
                    const imageUrl = data.images_results[i].original || data.images_results[i].thumbnail;
                    console.log(`📥 Tentative ${i + 1}/3...`);
                    
                    await Promise.race([
                        downloadImage(imageUrl, filepath),
                        new Promise((_, reject) => 
                            setTimeout(() => reject(new Error('Timeout')), 8000)
                        )
                    ]);
                    
                    console.log(`✅ [${index + 1}/5] ${product.name} - TÉLÉCHARGÉ !\n`);
                    return true;
                } catch (error) {
                    console.log(`⚠️  Tentative ${i + 1} échouée, essai suivant...`);
                    continue;
                }
            }
            
            console.error(`❌ [${index + 1}/5] ${product.name}: Toutes les tentatives ont échoué\n`);
            return false;
        } else {
            console.error(`❌ [${index + 1}/5] ${product.name}: Aucun résultat trouvé\n`);
            return false;
        }
    } catch (error) {
        console.error(`❌ [${index + 1}/5] ${product.name}: ${error.message}\n`);
        return false;
    }
}

// Mettre à jour game_data.js
function updateGameData() {
    const gameDataPath = path.join(__dirname, 'js', 'game_data.js');
    let content = fs.readFileSync(gameDataPath, 'utf8');
    
    missingProducts.forEach(product => {
        const filepath = path.join(ASSETS_DIR, product.filename);
        if (fs.existsSync(filepath)) {
            // Remplacer le placeholder par le chemin local
            const placeholder = `https://placehold.co/800x600/2E3440/81A1C1/png?text=${encodeURIComponent(product.name.replace(/ /g, '%20'))}`;
            const localPath = `assets/products/${product.filename}`;
            
            content = content.replace(placeholder, localPath);
            
            // Variations possibles du placeholder
            const variations = [
                `https://placehold.co/800x600/2E3440/81A1C1/png?text=${product.name.replace(/ /g, '%20')}`,
                `https://placehold.co/800x600/2E3440/81A1C1/png?text=${product.name.replace(/ /g, '+')}`,
            ];
            
            variations.forEach(v => {
                content = content.replace(v, localPath);
            });
        }
    });
    
    fs.writeFileSync(gameDataPath, content);
    console.log('✅ game_data.js mis à jour!\n');
}

// Fonction principale
async function main() {
    console.log('🎨 Récupération des images manquantes en mode WALLPAPER...\n');
    
    let successCount = 0;
    
    for (let i = 0; i < missingProducts.length; i++) {
        const success = await fetchWallpaper(missingProducts[i], i);
        if (success) successCount++;
        
        // Pause entre les requêtes
        if (i < missingProducts.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    
    console.log(`\n📊 Résultat: ${successCount}/5 images récupérées`);
    
    if (successCount > 0) {
        updateGameData();
    }
    
    console.log('🎉 Terminé!\n');
}

main().catch(console.error);
