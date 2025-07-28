require('dotenv').config();
const fs   = require('fs');
const path = require('path');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const OUTPUT_DIR = path.join(__dirname, 'ofuscated');
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: true, args: ['--no-sandbox'] }
});

client.on('qr', qr => {
    console.log('➡️  Escanea este QR:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', async () => {
    console.log('✅ WhatsApp Web cargado. Extrayendo <script> tags…');

    // 1) Recopilar todos los src de <script>
    const scriptUrls = await client.pupPage.evaluate(() =>
        Array.from(document.querySelectorAll('script[src]'))
             .map(s => s.src)
             .filter(src => src.includes('static.whatsapp.net') && src.endsWith('.js'))
    );

    console.log(`🗒️ Encontrados ${scriptUrls.length} bundles:`);

    for (const url of scriptUrls) {
        console.log('  •', url);

        try {
            const urlObj = new URL(url);
            // recrear estructura de carpetas dentro de OUTPUT_DIR
            const relPath = urlObj.pathname.replace(/^\//, '') + (urlObj.search || '');
            const filePath = path.join(OUTPUT_DIR, relPath);
            const dir = path.dirname(filePath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

            // si ya existe, saltar
            if (fs.existsSync(filePath)) {
                console.log(`  ↪️  Ya existe ${relPath}, saltando.`);
                continue;
            }

            console.log(`⬇️  Descargando ${relPath}…`);
            // usar fetch global de Node.js
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const text = await res.text();
            fs.writeFileSync(filePath, text, 'utf8');
            console.log(`✅ Guardado ${relPath}`);
        } catch (e) {
            console.error(`❌ Error descargando ${url}:`, e.message);
        }
    }

    console.log(`🎉 Todos los bundles se han guardado en ${OUTPUT_DIR}`);
    process.exit(0);
});

client.on('auth_failure', e => console.error('❌ Auth fallida:', e));
client.on('disconnected',   e => console.warn ('⚠️ Desconectado:', e));

client.initialize();
