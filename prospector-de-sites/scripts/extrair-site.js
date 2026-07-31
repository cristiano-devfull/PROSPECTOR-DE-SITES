#!/usr/bin/env node
/**
 * extrair-site.js — Substituto do Claude in Chrome para extração de conteúdo
 * antes do /redesenhar no PROSPECTOR-DE-SITES
 *
 * Uso: node extrair-site.js "https://sitedocliente.com.br" "slug-do-cliente"
 *
 * Gera: sites/[slug]/extracao.json com tudo que o redesign-premium precisa
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const URL_SITE = process.argv[2];
const SLUG     = process.argv[3] || 'cliente';

if (!URL_SITE) {
  console.error('Uso: node extrair-site.js "https://url-do-site.com" "slug"');
  process.exit(1);
}

async function extrair() {
  console.log(`\n🔍 Extraindo conteúdo de: ${URL_SITE}\n`);

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  try {
    await page.goto(URL_SITE, { timeout: 20000, waitUntil: 'networkidle' });

    // Rola até o fim para vencer lazy-load
    await page.evaluate(async () => {
      await new Promise(resolve => {
        let total = 0;
        const dist = 300;
        const delay = 200;
        const timer = setInterval(() => {
          window.scrollBy(0, dist);
          total += dist;
          if (total >= document.body.scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, delay);
      });
    });
    await page.waitForTimeout(2000);

    // Screenshot do site original
    const pastaSlug = path.join('sites', SLUG);
    fs.mkdirSync(pastaSlug, { recursive: true });
    const screenshotPath = path.join(pastaSlug, `${SLUG}-original.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 Screenshot salvo: ${screenshotPath}`);

    // Extrai tudo via evaluate
    const dados = await page.evaluate(() => {
      // Textos principais
      const titulo = document.title || '';
      const h1s = [...document.querySelectorAll('h1')].map(el => el.innerText.trim()).filter(Boolean);
      const h2s = [...document.querySelectorAll('h2')].map(el => el.innerText.trim()).filter(Boolean);
      const h3s = [...document.querySelectorAll('h3')].map(el => el.innerText.trim()).filter(Boolean);
      const paragrafos = [...document.querySelectorAll('p')].map(el => el.innerText.trim()).filter(t => t.length > 20);

      // Contatos
      const emailRegex = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
      const telefoneRegex = /(\(?\d{2}\)?\s?)(\d{4,5}[\-\s]?\d{4})/g;
      const htmlBody = document.body.innerHTML;
      const emails    = [...new Set(htmlBody.match(emailRegex) || [])];
      const telefones = [...new Set(htmlBody.match(telefoneRegex) || [])];

      // WhatsApp
      const waLinks = [...document.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp"]')]
        .map(a => a.href);
      const waNumeros = waLinks.map(l => {
        const m = l.match(/wa\.me\/(\d+)/);
        return m ? m[1] : null;
      }).filter(Boolean);

      // Redes sociais
      const redes = [...document.querySelectorAll('a[href*="instagram"], a[href*="facebook"], a[href*="linkedin"], a[href*="tiktok"]')]
        .map(a => a.href)
        .filter(Boolean);

      // Imagens (currentSrc para pegar lazy-load resolvido)
      const imagens = [...document.querySelectorAll('img')]
        .map(img => ({
          src: img.currentSrc || img.src,
          alt: img.alt || '',
          width: img.naturalWidth,
          height: img.naturalHeight,
        }))
        .filter(img => img.src && !img.src.startsWith('data:') && img.width > 80);

      // Logo (heurística: imagem no header/nav ou com "logo" no src/alt/class)
      const logoEl = document.querySelector('header img, nav img, .logo img, img[class*="logo"], img[src*="logo"], img[alt*="logo"], img[alt*="Logo"]');
      const logoUrl = logoEl ? (logoEl.currentSrc || logoEl.src) : null;

      // Paleta de cores (pega as principais cores do CSS)
      const estilos = [...document.querySelectorAll('[style]')]
        .map(el => el.getAttribute('style'))
        .join(' ');
      const cssTexto = [...document.styleSheets]
        .flatMap(sheet => {
          try { return [...sheet.cssRules].map(r => r.cssText); }
          catch { return []; }
        })
        .join(' ');
      const coresRegex = /#[0-9a-fA-F]{3,6}|rgb\([^)]+\)|rgba\([^)]+\)/g;
      const coresRaw = [...new Set((cssTexto + estilos).match(coresRegex) || [])];

      // Endereço
      const enderecoRegex = /[Rr]ua\s.+?,?\s*\d+|[Aa]v(?:enida)?\s.+?,?\s*\d+|[Ee]strada\s.+?,?\s*\d+/g;
      const enderecos = [...new Set(htmlBody.match(enderecoRegex) || [])];

      // Texto completo limpo
      const textoCompleto = document.body.innerText
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 2)
        .join('\n');

      return {
        titulo,
        h1s, h2s, h3s,
        paragrafos,
        emails,
        telefones,
        whatsapp: waNumeros,
        redesSociais: redes,
        logoUrl,
        imagens,
        cores: coresRaw.slice(0, 20),
        enderecos,
        textoCompleto,
      };
    });

    // Versão mobile — verifica responsividade
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(1500);
    const scrollWidthMobile = await page.evaluate(() => document.documentElement.scrollWidth);
    const eResponsivo = scrollWidthMobile <= 420;
    const screenshotMobilePath = path.join(pastaSlug, `${SLUG}-original-mobile.png`);
    await page.screenshot({ path: screenshotMobilePath, fullPage: false });

    // Monta resultado final
    const resultado = {
      slug: SLUG,
      urlOriginal: URL_SITE,
      geradoEm: new Date().toISOString(),
      responsivo: eResponsivo,
      ...dados,
      screenshots: {
        desktop: screenshotPath,
        mobile: screenshotMobilePath,
      },
    };

    // Salva JSON
    const jsonPath = path.join(pastaSlug, 'extracao.json');
    fs.writeFileSync(jsonPath, JSON.stringify(resultado, null, 2));

    console.log('\n✅ Extração concluída!');
    console.log(`📄 JSON salvo em: ${jsonPath}`);
    console.log(`📸 Screenshots: ${screenshotPath} | ${screenshotMobilePath}`);
    console.log(`\n📊 Resumo:`);
    console.log(`   Título:     ${resultado.titulo}`);
    console.log(`   H1s:        ${resultado.h1s.join(' | ')}`);
    console.log(`   E-mails:    ${resultado.emails.join(', ') || 'nenhum'}`);
    console.log(`   WhatsApp:   ${resultado.whatsapp.join(', ') || 'nenhum'}`);
    console.log(`   Telefones:  ${resultado.telefones.join(', ') || 'nenhum'}`);
    console.log(`   Imagens:    ${resultado.imagens.length} encontradas`);
    console.log(`   Logo:       ${resultado.logoUrl || 'não detectado'}`);
    console.log(`   Responsivo: ${eResponsivo ? '✓ sim' : '✗ não'}`);

    console.log('\n=== DADOS PARA O CLAUDE CODE ===');
    console.log(JSON.stringify(resultado, null, 2));

    return resultado;

  } finally {
    await browser.close();
  }
}

extrair().catch(err => {
  console.error('Erro:', err.message);
  process.exit(1);
});