---
description: Publica as páginas redesenhadas na VPS e retorna as URLs públicas
argument-hint: "[nome do cliente ou todos]"
---
Publique páginas na VPS seguindo a skill `deploy-vps`.

## Passos

1. Leia `prospector-config.json`. Se os dados da VPS (chave `vps`) não estiverem preenchidos, colete-os agora (ip, usuario, dominio, pasta_remota — e oriente o usuário a informar o caminho local da chave SSH diretamente no config, nunca no chat) — não prossiga sem eles.
2. Determine o que publicar: `$ARGUMENTS` (um cliente ou "todos"), ou liste as páginas com status `redesenhado` em `leads.md` e pergunte.
3. **Gere a página-capa de cada cliente**: preencha `references/capa-proposta-template.html` (skill `proposta-email`) com os dados do lead + assinatura do config e salve como `sites/[slug]/proposta.html`. É ela que vai no e-mail de proposta.
4. **Publique seguindo a skill `deploy-vps`**: para cada cliente, envie a pasta `sites/[slug]` inteira via `scp` (chave SSH do config) para `[pasta_remota]/[slug]` na VPS. Repita por cliente — não existe "todos" nativo do scp, itere a lista.
5. **Verificação HTTPS (bloqueante)**: para cada URL publicada (`https://[dominio]/clientes/[slug]/` e `.../proposta.html`), confirme HTTP 200 via `curl`. Se não vier 200, siga a seção "Verificação" da skill `deploy-vps` (checar propagação, container `clientes-prospector` rodando, permissões) antes de considerar publicado — link que não responde 200 NUNCA vai para cliente.
6. Atualize `leads.md` e o banco do dashboard: status `publicado` + URL pública nova.

## Saída

Liste, por cliente: URL da página nova e URL da capa (`.../proposta.html`), ambas testadas em https. Sugira o próximo passo: `/proposta` para enviar os e-mails.