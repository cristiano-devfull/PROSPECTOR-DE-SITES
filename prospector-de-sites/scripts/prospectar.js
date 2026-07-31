#!/usr/bin/env node
/**
 * prospectar.js v3 — Substituto do Claude in Chrome para o PROSPECTOR-DE-SITES
 * Uso: node prospectar.js "nutricionistas" "Fortaleza" 5
 */

const { chromium } = require('playwright');
const fs = require('fs');

const NICHO  = process.argv[2] || 'nutricionistas';
const CIDADE = process.argv[3] || 'Fortaleza';
const META   = parseInt(process.argv[4]) || 5;

const NOTA_MIN = 4.7;
const AVAL_MIN = 20; // reduzido de 40 para 20
const MAX_AVAL = 40;

async function avaliarSite(context, url) {
  const page = await context.newPage();
  try {
    await page.goto(url, { timeout: 15000, waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const motivos = [];

    if (/wix\.com|sites\.google|linktr\.ee|linktree|localtreino|acheio/i.test(url)) {
      motivos.push('domínio em plataforma gratuita/diretório');
    }

    const temCTA = await page.evaluate(() => {
      const html = document.body.innerHTML.toLowerCase();
      return html.includes('whatsapp') || html.includes('wa.me') || html.includes('agendar') || html.includes('agenda');
    });
    if (!temCTA) motivos.push('sem CTA de agendamento ou WhatsApp');

    const temProva = await page.evaluate(() => {
      const html = document.body.innerHTML.toLowerCase();
      return html.includes('depoimento') || html.includes('avaliação') || html.includes('resultado') || html.includes('paciente');
    });
    if (!temProva) motivos.push('sem prova social');

    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(800);
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    if (scrollWidth > 420) motivos.push('não responsivo no mobile');

    await page.setViewportSize({ width: 1280, height: 800 });
    const email = await page.evaluate(() => {
      const match = document.body.innerHTML.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
      return match ? match[0] : '';
    });

    return { eRuim: motivos.length >= 2, motivos, email };
  } catch {
    return { eRuim: false, motivos: ['site inacessível'], email: '' };
  } finally {
    await page.close();
  }
}

async function coletarLinks(page) {
  return page.evaluate(() => {
    return [...document.querySelectorAll('[role="feed"] a[href*="/maps/place/"]')]
      .map(a => a.href)
      .filter((v, i, arr) => arr.indexOf(v) === i);
  });
}

async function scrollFeed(page, vezes = 3) {
  for (let i = 0; i < vezes; i++) {
    await page.evaluate(() => {
      const feed = document.querySelector('[role="feed"]');
      if (feed) feed.scrollTop += 1000;
    });
    await page.waitForTimeout(1200);
  }
}

async function main() {
  console.log(`\n🔍 Prospectando: ${NICHO} em ${CIDADE} — meta: ${META} leads\n`);

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  const leads = [];
  const descartados = [];
  let avaliados = 0;
  const jaVistos = new Set();
  const filaLinks = [];

  try {
    // Abre feed e coleta links iniciais
    await page.goto(`https://www.google.com/maps/search/${encodeURIComponent(NICHO + ' em ' + CIDADE)}`);
    await page.waitForTimeout(4000);

    try { await page.click('button[aria-label*="Aceitar"]', { timeout: 3000 }); } catch {}

    await page.waitForSelector('[role="feed"]', { timeout: 15000 });
    console.log('✓ Feed encontrado — coletando links...\n');

    // Coleta links scrollando o feed SEM sair da página
    for (let rodada = 0; rodada < 8; rodada++) {
      await scrollFeed(page, 2);
      const links = await coletarLinks(page);
      let novos = 0;
      for (const href of links) {
        if (!jaVistos.has(href)) {
          jaVistos.add(href);
          filaLinks.push(href);
          novos++;
        }
      }
      console.log(`   Rodada ${rodada + 1}: ${novos} links novos (total: ${filaLinks.length})`);
      if (novos === 0 && rodada > 1) break; // sem mais resultados
    }

    console.log(`\n📋 ${filaLinks.length} estabelecimentos para avaliar\n`);

    // Avalia cada link
    for (const href of filaLinks) {
      if (leads.length >= META || avaliados >= MAX_AVAL) break;

      await page.goto(href);
      await page.waitForTimeout(2500);

      const nome = await page.$eval('h1', el => el.textContent.trim()).catch(() => null);
      if (!nome) continue;

      avaliados++;
      console.log(`[${avaliados}] ${nome}`);

      const notaText = await page.evaluate(() => {
        const el = document.querySelector('[role="img"][aria-label*="estrela"], [role="img"][aria-label*="star"]');
        return el ? el.getAttribute('aria-label') : null;
      });
      const nota = notaText ? parseFloat(notaText.match(/[\d,\.]+/)?.[0]?.replace(',', '.')) : 0;

      const avalText = await page.evaluate(() => {
        const el = document.querySelector('button[jsaction*="review"], [aria-label*="avaliações"], [aria-label*="reviews"]');
        return el ? el.textContent : '0';
      });
      const aval = parseInt(avalText.replace(/\D/g, '')) || 0;

      console.log(`   Nota: ${nota} | Avaliações: ${aval}`);

      if (nota < NOTA_MIN || aval < AVAL_MIN) {
        descartados.push({ nome, nota, aval, motivo: `nota ${nota} / ${aval} avaliações` });
        console.log(`   ✗ Abaixo do mínimo (nota ≥${NOTA_MIN}, aval ≥${AVAL_MIN})`);
        continue;
      }

      const siteUrl = await page.evaluate(() => {
        const a = document.querySelector('a[data-item-id="authority"]');
        return a ? a.href : null;
      });

      if (!siteUrl || siteUrl.includes('google.com') || siteUrl.includes('wa.me')) {
        descartados.push({ nome, nota, aval, motivo: siteUrl?.includes('wa.me') ? 'site é só WhatsApp' : 'sem site próprio' });
        console.log(`   ✗ Sem site próprio`);
        continue;
      }

      const tel = await page.evaluate(() => {
        const el = document.querySelector('[data-item-id*="phone"]');
        return el ? el.textContent.trim() : '';
      });

      console.log(`   Site: ${siteUrl}`);

      const { eRuim, motivos, email } = await avaliarSite(context, siteUrl);

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

      const whatsapp = tel.replace(/\D/g, '').length >= 10 ? `55${tel.replace(/\D/g, '')}` : '';
      leads.push({ nome, nota, aval, email, tel, whatsapp, site: siteUrl, motivo: motivos.join('; ') });
      console.log(`   ✓ LEAD: ${email} | ${motivos.join(', ')}`);
    }

  } finally {
    await browser.close();
  }

  const resultado = { nicho: NICHO, cidade: CIDADE, leads, descartados, avaliados, geradoEm: new Date().toISOString() };

  console.log('\n\n=== RESULTADO ===');
  console.log(`✅ Leads qualificados: ${leads.length} / Meta: ${META}`);
  leads.forEach((l, i) => console.log(`  ${i + 1}. ${l.nome} — ${l.email}`));

  const saida = `prospector-resultado-${Date.now()}.json`;
  fs.writeFileSync(saida, JSON.stringify(resultado, null, 2));
  console.log(`\n📄 Salvo em: ${saida}`);
}

main().catch(err => {
  console.error('Erro:', err.message);
  process.exit(1);
});