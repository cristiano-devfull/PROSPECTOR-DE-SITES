#!/usr/bin/env node
/**
 * prospectar.js — Substituto do Claude in Chrome para o PROSPECTOR-DE-SITES
 * Uso: node prospectar.js "nutricionistas" "Fortaleza" 5
 */

const { chromium } = require('playwright');

const NICHO  = process.argv[2] || 'nutricionistas';
const CIDADE = process.argv[3] || 'Fortaleza';
const META   = parseInt(process.argv[4]) || 5;

// Critérios do plugin (espelha SKILL.md)
const NOTA_MIN  = 4.7;
const AVAL_MIN  = 40;
const MAX_AVAL  = 25; // máximo de estabelecimentos a visitar

const MOTIVOS_RUINS = [
  'layout datado',
  'sem CTA de agendamento',
  'domínio gratuito',
  'não responsivo',
  'conteúdo desorganizado',
  'sem prova social',
];

async function avaliarSite(page, url) {
  try {
    await page.goto(url, { timeout: 15000, waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const motivos = [];

    // Domínio gratuito / plataforma alheia
    if (/wix\.com|google\.com\/site|sites\.google|linktr\.ee|linktree|localtreino|acheio/i.test(url)) {
      motivos.push('domínio em plataforma gratuita/diretório de terceiros');
    }

    // Sem botão WhatsApp / CTA na primeira dobra
    const temCTA = await page.evaluate(() => {
      const html = document.body.innerHTML.toLowerCase();
      return html.includes('whatsapp') || html.includes('wa.me') || html.includes('agendar') || html.includes('agenda');
    });
    if (!temCTA) motivos.push('sem CTA de agendamento ou WhatsApp visível');

    // Sem prova social
    const temDepoimento = await page.evaluate(() => {
      const html = document.body.innerHTML.toLowerCase();
      return html.includes('depoimento') || html.includes('avaliação') || html.includes('cliente') || html.includes('resultado');
    });
    if (!temDepoimento) motivos.push('sem prova social ou depoimentos');

    // Verifica se é responsivo (viewport mobile)
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(1000);
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    if (scrollWidth > 420) motivos.push('não responsivo no mobile');
    await page.setViewportSize({ width: 1280, height: 800 });

    const eRuim = motivos.length >= 2;
    return { eRuim, motivos };
  } catch {
    return { eRuim: false, motivos: ['site inacessível'] };
  }
}

async function main() {
  console.log(`\n🔍 Prospectando: ${NICHO} em ${CIDADE} — meta: ${META} leads\n`);

  const browser = await chromium.launch({ headless: false }); // headless: true para rodar em background
  const context = await browser.newContext();
  const page    = await context.newPage();

  const leads       = [];
  const descartados = [];
  let   avaliados   = 0;

  try {
    // 1. Abre Google Maps
    await page.goto(`https://www.google.com/maps/search/${encodeURIComponent(NICHO + ' em ' + CIDADE)}`);
    await page.waitForTimeout(3000);

    // Fecha popup de cookies se aparecer
    try {
      await page.click('button[aria-label*="Aceitar"]', { timeout: 3000 });
    } catch {}

    // 2. Pega lista de resultados
    await page.waitForSelector('[role="feed"]', { timeout: 10000 });

    while (leads.length < META && avaliados < MAX_AVAL) {
      // Pega todos os cards visíveis
      const cards = await page.$$('[role="feed"] > div');

      for (const card of cards) {
        if (leads.length >= META || avaliados >= MAX_AVAL) break;

        try {
          await card.click();
          await page.waitForTimeout(2000);

          // Lê nome
          const nome = await page.$eval('h1', el => el.textContent.trim()).catch(() => null);
          if (!nome) continue;

          // Verifica se já avaliado
          if ([...leads, ...descartados].some(l => l.nome === nome)) continue;

          avaliados++;
          console.log(`[${avaliados}] ${nome}`);

          // Lê nota
          const notaText = await page.$eval('[role="img"][aria-label*="estrela"]', el => el.getAttribute('aria-label')).catch(() => null);
          const nota = notaText ? parseFloat(notaText.replace(',', '.')) : 0;

          // Lê nº de avaliações
          const avalText = await page.$eval('button[jsaction*="review"]', el => el.textContent).catch(() => '0');
          const aval = parseInt(avalText.replace(/\D/g, '')) || 0;

          // Filtro 1 — potencial financeiro
          if (nota < NOTA_MIN || aval < AVAL_MIN) {
            descartados.push({ nome, nota, aval, motivo: `nota ${nota} / ${aval} avaliações (abaixo do mínimo)` });
            console.log(`   ✗ Reprovado: nota ${nota}, ${aval} avaliações`);
            continue;
          }

          // Lê site
          const siteUrl = await page.$eval('a[data-item-id="authority"]', el => el.href).catch(() => null);
          if (!siteUrl) {
            descartados.push({ nome, nota, aval, motivo: 'sem site próprio' });
            console.log(`   ✗ Sem site`);
            continue;
          }

          // Lê telefone
          const tel = await page.$eval('[data-item-id*="phone"]', el => el.textContent.trim()).catch(() => '');

          // Filtro 2+3 — avalia o site
          const sitePage = await context.newPage();
          const { eRuim, motivos } = await avaliarSite(sitePage, siteUrl);
          await sitePage.close();

          // Tenta achar e-mail no site
          const emailPage = await context.newPage();
          let email = '';
          try {
            await emailPage.goto(siteUrl, { timeout: 10000, waitUntil: 'domcontentloaded' });
            email = await emailPage.evaluate(() => {
              const match = document.body.innerHTML.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
              return match ? match[0] : '';
            });
          } catch {}
          await emailPage.close();

          if (!eRuim) {
            descartados.push({ nome, nota, aval, motivo: 'site bom' });
            console.log(`   ✗ Site bom`);
            continue;
          }

          if (!email) {
            descartados.push({ nome, nota, aval, motivo: 'sem e-mail público', site: siteUrl });
            console.log(`   ✗ Sem e-mail`);
            continue;
          }

          // WhatsApp: prefere link wa.me, senão usa telefone celular
          const whatsapp = tel.replace(/\D/g, '').length === 11
            ? `55${tel.replace(/\D/g, '')}`
            : '';

          leads.push({ nome, nota, aval, email, tel, whatsapp, site: siteUrl, motivo: motivos.join('; ') });
          console.log(`   ✓ LEAD: ${email} | ${motivos.join(', ')}`);

        } catch (e) {
          // card sem dados suficientes, pula
        }
      }

      // Scroll para carregar mais resultados
      await page.evaluate(() => {
        const feed = document.querySelector('[role="feed"]');
        if (feed) feed.scrollTop += 600;
      });
      await page.waitForTimeout(2000);
    }

  } finally {
    await browser.close();
  }

  // 3. Saída — imprime JSON para o Claude Code processar
  const resultado = {
    nicho: NICHO,
    cidade: CIDADE,
    leads,
    descartados,
    avaliados,
    geradoEm: new Date().toISOString(),
  };

  console.log('\n\n=== RESULTADO JSON ===');
  console.log(JSON.stringify(resultado, null, 2));

  // Salva também em arquivo para o plugin ler
  const fs = require('fs');
  const saida = `prospector-resultado-${Date.now()}.json`;
  fs.writeFileSync(saida, JSON.stringify(resultado, null, 2));
  console.log(`\n✅ Salvo em: ${saida}`);
  console.log(`📊 Leads qualificados: ${leads.length} / Meta: ${META}`);
}

main().catch(err => {
  console.error('Erro:', err.message);
  process.exit(1);
});