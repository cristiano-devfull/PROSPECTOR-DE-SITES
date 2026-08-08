---
description: Publica as páginas redesenhadas e previews GMB na VPS e retorna as URLs públicas
argument-hint: "[nome do cliente ou todos] [--gmb para publicar só previews GMB]"
---
Publique páginas na VPS seguindo a skill `deploy-vps`.

## Passos

1. Leia `prospector-config.json`. Se os dados da VPS (chave `vps`) não estiverem preenchidos, colete-os agora (ip, usuario, dominio, pasta_remota — e oriente o usuário a informar o caminho local da chave SSH diretamente no config, nunca no chat) — não prossiga sem eles.
2. Determine o que publicar com base nos argumentos `$ARGUMENTS`:
   - **`--gmb`** → publicar apenas os previews GMB da pasta `gmb/`
   - **nome do cliente** → publicar site + preview GMB do cliente (se existir)
   - **"todos"** → publicar sites redesenhados + todos os previews GMB disponíveis
   - Sem argumento → listar páginas com status `redesenhado` em `leads.md` + previews GMB não publicados e perguntar

## Publicação de sites redesenhados (fluxo normal)

3. **Gere a página-capa de cada cliente**: preencha `references/capa-proposta-template.html` (skill `proposta-email`) com os dados do lead + assinatura do config e salve como `sites/[slug]/proposta.html`.
4. **Publique seguindo a skill `deploy-vps`**: para cada cliente, envie a pasta `sites/[slug]` inteira via `scp` para `[pasta_remota]/[slug]` na VPS.
5. **Verificação HTTPS (bloqueante)**: confirme HTTP 200 via `curl` para cada URL. Link que não responde 200 NUNCA vai para cliente.
6. Atualize `leads.md` e o banco: status `publicado` + URL pública.

## Publicação de previews GMB (novo)

3. Verificar quais arquivos `gmb/preview-[slug].html` existem na pasta conectada e ainda não foram publicados (checar `urlPreview` no banco via `GET /api/leads-gmb`).
4. Para cada preview GMB, publicar via `scp`:
   - Arquivo local: `gmb/preview-[slug].html`
   - Destino na VPS: `[pasta_remota]/[slug]-gmb/index.html`
   - URL pública: `https://[dominio]/clientes/[slug]-gmb/`
5. **Verificação HTTPS (bloqueante)**: confirme HTTP 200 via `curl`. Mesmo critério dos sites.
6. Atualizar o banco via `PUT /api/leads-gmb/[slug]` com `{"urlPreview": "https://[dominio]/clientes/[slug]-gmb/"}`.

## Saída

Liste por cliente/lead:
- **Sites**: URL da página nova + URL da capa (`.../proposta.html`), ambas testadas em https
- **GMB**: URL do preview GMB (`https://[dominio]/clientes/[slug]-gmb/`), testada em https

Sugira o próximo passo:
- Para sites → `/proposta` para enviar os e-mails
- Para GMB → copiar o link e enviar pelo WhatsApp do dashboard (aba GMB)