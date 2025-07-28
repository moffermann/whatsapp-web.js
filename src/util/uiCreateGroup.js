/**
 * Automatiza la UI de WhatsApp Web para crear un grupo
 * page: Puppeteer Page
 * title: nombre del grupo
 * participants: array de JIDs (strings)
 */
module.exports = async function uiCreateGroup(page, title, participants) {
    // 1) Abrir menú de opciones (tres puntitos)
    await page.waitForSelector('span[data-icon="menu"]');
    await page.click('span[data-icon="menu"]');

    // 2) Clic en “Nuevo grupo”
    await page.waitForSelector('li[role="menuitem"] div[title="Nuevo grupo"]');
    await page.click('li[role="menuitem"] div[title="Nuevo grupo"]');

    // 3) Rellenar el nombre
    await page.waitForSelector('div[contenteditable="true"][data-tab="6"]');
    const titleBox = await page.$('div[contenteditable="true"][data-tab="6"]');
    await titleBox.focus();
    await page.keyboard.type(title);

    // 4) Pulsar “Siguiente” (icono arrow-forward)
    await page.waitForSelector('span[data-icon="arrow-forward"]');
    await page.click('span[data-icon="arrow-forward"]');

    // 5) Añadir cada participante
    for (const jid of participants) {
        // abrir búsqueda
        await page.waitForSelector('div[contenteditable="true"][data-tab="3"]');
        const searchBox = await page.$('div[contenteditable="true"][data-tab="3"]');
        await searchBox.click({ clickCount: 3 });
        await searchBox.type(jid.split('@')[0]);
        // seleccionar primer resultado
        await page.waitForSelector('div._3K4-L');
        await page.click('div._3K4-L');
        await page.waitForTimeout(300);
    }

    // 6) Crear grupo (checkmark)
    await page.waitForSelector('span[data-icon="checkmark"]');
    await page.click('span[data-icon="checkmark"]');

    // 7) Esperar unos instantes para que se cree
    await page.waitForTimeout(2000);

    // 8) Leer el chat recién creado
    const chats = await page.evaluate(() =>
        window.Store.Chat.models.map(c => ({ id: c.id._serialized, name: c.name }))
    );
    const match = chats.find(c => c.name === title);
    return match ? match.id : null;
};