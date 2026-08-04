#!/usr/bin/env node
/**
 * rascunho-gmail.js — Cria rascunhos no Gmail via API do Google
 * Uso: node rascunho-gmail.js "destinatario@email.com" "Assunto" "Corpo do email"
 * Ou:  node rascunho-gmail.js --arquivo propostas.json
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { exec } = require('child_process');

const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');
const TOKEN_PATH = path.join(process.cwd(), 'gmail-token.json');
const SCOPES = ['https://www.googleapis.com/auth/gmail.compose'];

async function autenticar() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
  const { client_id, client_secret, redirect_uris } = credentials.installed || credentials.web;

  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, 'http://localhost:3000');

  // Token já existe?
  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
    oAuth2Client.setCredentials(token);
    return oAuth2Client;
  }

  // Primeira vez — abre browser para autorizar
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('\nAbrindo browser para autorizar o Gmail...');
  exec(`open "${authUrl}"`);

  // Aguarda o callback com o código
  const code = await new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url, 'http://localhost:3000');
      const code = url.searchParams.get('code');
      if (code) {
        res.end('<h1>Autorizado! Pode fechar esta aba.</h1>');
        server.close();
        resolve(code);
      }
    });
    server.listen(3000, () => console.log('Aguardando autorização em http://localhost:3000...'));
  });

  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
  console.log('Token salvo em gmail-token.json\n');

  return oAuth2Client;
}

function criarMensagemBase64(para, assunto, corpo) {
  const mensagem = [
    `To: ${para}`,
    `Subject: =?UTF-8?B?${Buffer.from(assunto).toString('base64')}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=utf-8',
    'Content-Transfer-Encoding: base64',
    '',
    Buffer.from(corpo).toString('base64'),
  ].join('\n');

  return Buffer.from(mensagem).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function criarRascunho(auth, para, assunto, corpo) {
  const gmail = google.gmail({ version: 'v1', auth });
  const raw = criarMensagemBase64(para, assunto, corpo);

  const res = await gmail.users.drafts.create({
    userId: 'me',
    requestBody: {
      message: { raw },
    },
  });

  return res.data;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Uso:');
    console.log('  node rascunho-gmail.js "email@dest.com" "Assunto" "Corpo"');
    console.log('  node rascunho-gmail.js --arquivo propostas.json');
    process.exit(1);
  }

  const auth = await autenticar();

  // Modo arquivo JSON com múltiplos rascunhos
  if (args[0] === '--arquivo') {
    const arquivo = args[1];
    if (!fs.existsSync(arquivo)) {
      console.error(`Arquivo não encontrado: ${arquivo}`);
      process.exit(1);
    }

    const propostas = JSON.parse(fs.readFileSync(arquivo));
    console.log(`\nCriando ${propostas.length} rascunhos...\n`);

    for (const p of propostas) {
      try {
        const rascunho = await criarRascunho(auth, p.para, p.assunto, p.corpo);
        console.log(`✓ Rascunho criado: ${p.para} — ID: ${rascunho.id}`);
      } catch (e) {
        console.error(`✗ Erro para ${p.para}: ${e.message}`);
      }
    }

    console.log('\nVerifique os rascunhos no Gmail antes de enviar.');
    return;
  }

  // Modo direto: 3 argumentos
  const [para, assunto, corpo] = args;
  if (!para || !assunto || !corpo) {
    console.error('Forneça: destinatário, assunto e corpo');
    process.exit(1);
  }

  try {
    const rascunho = await criarRascunho(auth, para, assunto, corpo);
    console.log(`\n✓ Rascunho criado com sucesso!`);
    console.log(`  Para: ${para}`);
    console.log(`  Assunto: ${assunto}`);
    console.log(`  ID: ${rascunho.id}`);
    console.log('\nAbra o Gmail para revisar e enviar.');
  } catch (e) {
    console.error('Erro ao criar rascunho:', e.message);
    process.exit(1);
  }
}

main();
