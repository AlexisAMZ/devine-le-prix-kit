// Script pour télécharger automatiquement les images des produits via SerpApi
// Utilisation : node fetch_images.js

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const API_KEY = "b406419352caf72aac67a6e4b2b7980e6e93967ee7f1529b061a447be27b7bdc";
const BASE_URL = "https://serpapi.com/search.json";
const ASSETS_DIR = path.join(__dirname, '..', 'assets', 'products');

// Créer le dossier assets s'il n'existe pas
if (!fs.existsSync(ASSETS_DIR)) {
    fs.mkdirSync(ASSETS_DIR, { recursive: true });
    console.log(`📁 Dossier créé: ${ASSETS_DIR}\n`);
}

// Produits du jeu avec prix
const products = [
    { name: "PlayStation 5 Pro Digital", query: "PlayStation 5 Pro console", price: 799.99 },
    { name: "Setup PC Gamer RTX 4080", query: "gaming PC RTX 4080", price: 2850.00 },
    { name: "NVIDIA GeForce RTX 5090", query: "NVIDIA RTX 5090 graphics card", price: 2490.00 },
    { name: "iPhone 16 Pro Max 256Go", query: "iPhone 16 Pro Max", price: 1479.00 },
    { name: "Apple Vision Pro", query: "Apple Vision Pro headset", price: 3999.00 },
    { name: "Samsung Galaxy S25 Ultra", query: "Samsung Galaxy S25 Ultra", price: 1469.00 },
    { name: "MacBook Pro M4 Max 16\"", query: "MacBook Pro M4 Max", price: 4249.00 },
    { name: "iPad Pro M4 13\"", query: "iPad Pro M4 13 inch", price: 1569.00 },
    { name: "Micro Shure SM7B", query: "Shure SM7B microphone", price: 389.00 },
    { name: "Elgato Stream Deck XL", query: "Elgato Stream Deck XL", price: 249.99 },
    { name: "Caméra Sony Alpha 7 IV", query: "Sony Alpha 7 IV camera", price: 2799.00 },
    { name: "Siège Herman Miller Aeron", query: "Herman Miller Aeron chair", price: 1565.00 },
    { name: "Elgato Key Light Air", query: "Elgato Key Light Air", price: 299.00 },
    { name: "GoXLR Mixer Audio", query: "GoXLR mixer", price: 349.00 },
    { name: "Steam Deck OLED 1To", query: "Steam Deck OLED", price: 679.00 },
    { name: "Nintendo Switch 2", query: "Nintendo Switch OLED", price: 449.99 },
    { name: "Casque Sony WH-1000XM5", query: "Sony WH-1000XM5 headphones", price: 349.00 },
    { name: "AirPods Max 2", query: "Apple AirPods Max", price: 579.00 },
    { name: "GoPro Hero 13 Black", query: "GoPro Hero 13 Black", price: 449.00 },
    { name: "Volant Logitech G29", query: "Logitech G29 racing wheel", price: 269.00 },
    { name: "Yamaha TMAX 560", query: "Yamaha TMAX 560 scooter", price: 15599.00 },
    { name: "Tesla Model Y", query: "Tesla Model Y", price: 49990.00 },
    { name: "Renault Clio 5 E-Tech", query: "Renault Clio 5 E-Tech", price: 23600.00 },
    { name: "Lamborghini Revuelto", query: "Lamborghini Revuelto", price: 650000.00 },
    { name: "Fiat 500e Cabriolet", query: "Fiat 500e electric convertible", price: 34900.00 },
    { name: "Trottinette Xiaomi Electric 4 Pro", query: "Xiaomi Electric Scooter 4 Pro", price: 699.00 },
    { name: "Vélo Cargo Électrique", query: "electric cargo bike", price: 4200.00 },
    { name: "Nike Air Jordan 1 Chicago", query: "Air Jordan 1 Chicago", price: 1600.00 },
    { name: "Travis Scott Jordan 1 Low Olive", query: "Travis Scott Jordan 1 Low Olive", price: 950.00 },
    { name: "Sac Hermès Birkin 25", query: "Hermes Birkin 25 bag", price: 22000.00 },
    { name: "Rolex GMT-Master II Pepsi", query: "Rolex GMT Master II Pepsi", price: 11200.00 },
    { name: "Doudoune The North Face Nuptse", query: "North Face Nuptse jacket", price: 350.00 },
    { name: "Casquette Gucci GG", query: "Gucci GG cap", price: 420.00 },
    { name: "Menu Big Mac", query: "Big Mac McDonald's", price: 11.50 },
    { name: "Kebab Complet", query: "kebab sandwich", price: 12.00 },
    { name: "Tacos 3 Viandes", query: "french tacos 3 meats", price: 16.50 },
    { name: "Panier Courses", query: "grocery shopping cart", price: 135.00 },
    { name: "Plein Essence", query: "gas station pump", price: 98.50 },
    { name: "Abonnement Netflix Premium", query: "Netflix logo", price: 239.00 },
    { name: "Abonnement Spotify Duo", query: "Spotify logo", price: 179.00 },
    { name: "Ticket Métro Paris", query: "Paris metro ticket", price: 17.35 },
    { name: "Pack Eau Cristaline", query: "Cristaline water bottles", price: 4.20 },
    { name: "Pot Nutella 1kg", query: "Nutella 1kg jar", price: 6.90 },
    { name: "Place Cinéma IMAX", query: "IMAX cinema screen", price: 22.00 },
    { name: "Aspirateur Dyson V15", query: "Dyson V15 Detect vacuum", price: 799.00 },
    { name: "Robot Thermomix TM6", query: "Thermomix TM6", price: 1499.00 },
    { name: "TV Samsung Odyssey Ark", query: "Samsung Odyssey Ark monitor", price: 2499.00 },
    { name: "LEGO Faucon Millenium UCS", query: "LEGO Millennium Falcon 75192", price: 849.99 },
    { name: "Machine Café Jura E8", query: "Jura E8 coffee machine", price: 1290.00 },
    { name: "Lingot Or 1kg", query: "1kg gold bar", price: 76500.00 },
    { name: "Voyage Japon 2 Semaines", query: "Tokyo Japan travel", price: 4500.00 },
    { name: "Nuit Ritz Paris", query: "Ritz Paris hotel", price: 3200.00 },
    { name: "Vol Jet Privé", query: "private jet interior", price: 6500.00 },
    { name: "Bitcoin 1 BTC", query: "Bitcoin cryptocurrency", price: 95000.00 }
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
                // Redirection
                downloadImage(response.headers.location, filepath).then(resolve).catch(reject);
            } else {
                reject(new Error(`Status: ${response.statusCode}`));
            }
        }).on('error', reject);
    });
}

// Récupérer l'image depuis Google Images avec timeout
async function fetchAndSaveImage(product, index) {
    // Créer un nom de fichier sécurisé
    const safeFilename = product.name
        .replace(/[^a-z0-9]/gi, '_')
        .toLowerCase()
        .substring(0, 50) + '.jpg';
    
    const filepath = path.join(ASSETS_DIR, safeFilename);
    
    // ✅ VÉRIFIER SI L'IMAGE EXISTE DÉJÀ
    if (fs.existsSync(filepath)) {
        console.log(`⏭️  [${index + 1}/${products.length}] ${product.name} - DÉJÀ TÉLÉCHARGÉ\n`);
        return {
            name: product.name,
            img: `assets/products/${safeFilename}`,
            price: product.price
        };
    }
    
    const url = `${BASE_URL}?engine=google_images&q=${encodeURIComponent(product.query)}&api_key=${API_KEY}&num=1`;
    
    try {
        console.log(`🔍 [${index + 1}/${products.length}] Recherche: ${product.name}...`);
        
        // Timeout de 10 secondes pour la requête API
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);
        
        const data = await response.json();
        
        if (data.images_results && data.images_results.length > 0) {
            const imageUrl = data.images_results[0].original || data.images_results[0].thumbnail;
            
            console.log(`📥 Téléchargement de l'image...`);
            
            // Télécharger l'image avec timeout
            await Promise.race([
                downloadImage(imageUrl, filepath),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Timeout téléchargement')), 10000)
                )
            ]);
            
            console.log(`✅ [${index + 1}/${products.length}] ${product.name} - SAUVEGARDÉ\n`);
            
            return {
                name: product.name,
                img: `assets/products/${safeFilename}`,
                price: product.price
            };
        } else {
            console.warn(`⚠️ [${index + 1}/${products.length}] ${product.name}: Aucune image trouvée\n`);
            return {
                name: product.name,
                img: `https://placehold.co/800x600/2E3440/81A1C1/png?text=${encodeURIComponent(product.name.substring(0, 20))}`,
                price: product.price
            };
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            console.error(`⏱️  [${index + 1}/${products.length}] ${product.name}: TIMEOUT (>10s) - SKIPPÉ\n`);
        } else {
            console.error(`❌ [${index + 1}/${products.length}] ${product.name}: ${error.message}\n`);
        }
        
        // Retourner un placeholder en cas d'erreur
        return {
            name: product.name,
            img: `https://placehold.co/800x600/2E3440/81A1C1/png?text=${encodeURIComponent(product.name.substring(0, 20))}`,
            price: product.price
        };
    }
}

// Générer le fichier game_data.js
function generateGameDataFile(results) {
    const content = `const GAME_DATA = [
    // --- TECH & GAMING (High Budget) ---
${results.slice(0, 8).map(item => `    {
        name: "${item.name}",
        img: "${item.img}",
        price: ${item.price}
    }`).join(',\n')},

    // --- STREAMING & SETUP ---
${results.slice(8, 14).map(item => `    {
        name: "${item.name}",
        img: "${item.img}",
        price: ${item.price}
    }`).join(',\n')},

    // --- TECH (Mid Budget) ---
${results.slice(14, 20).map(item => `    {
        name: "${item.name}",
        img: "${item.img}",
        price: ${item.price}
    }`).join(',\n')},

    // --- VÉHICULES ---
${results.slice(20, 27).map(item => `    {
        name: "${item.name}",
        img: "${item.img}",
        price: ${item.price}
    }`).join(',\n')},

    // --- MODE & SNEAKERS ---
${results.slice(27, 33).map(item => `    {
        name: "${item.name}",
        img: "${item.img}",
        price: ${item.price}
    }`).join(',\n')},

    // --- VIE QUOTIDIENNE ---
${results.slice(33, 44).map(item => `    {
        name: "${item.name}",
        img: "${item.img}",
        price: ${item.price}
    }`).join(',\n')},

    // --- MAISON & LOISIRS ---
${results.slice(44, 49).map(item => `    {
        name: "${item.name}",
        img: "${item.img}",
        price: ${item.price}
    }`).join(',\n')},

    // --- INSOLITE & RÊVES ---
${results.slice(49).map(item => `    {
        name: "${item.name}",
        img: "${item.img}",
        price: ${item.price}
    }`).join(',\n')}
];`;

    fs.writeFileSync(path.join(__dirname, 'js', 'game_data.js'), content);
    console.log('\n✅ Fichier game_data.js mis à jour!\n');
}

// Fonction principale
async function main() {
    console.log('🚀 Téléchargement des images des produits...\n');
    
    const results = [];
    
    for (let i = 0; i < products.length; i++) {
        const result = await fetchAndSaveImage(products[i], i);
        results.push(result);
        
        // Pause de 1 seconde entre les requêtes
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`\n📊 ${results.filter(r => r.img.startsWith('assets')).length}/${products.length} images téléchargées`);
    
    // Générer le fichier game_data.js
    generateGameDataFile(results);
    
    console.log('🎉 Terminé! Les images sont dans assets/products/');
    console.log('📝 Le fichier game_data.js a été mis à jour automatiquement\n');
}

// Lancer le script
main().catch(console.error);
