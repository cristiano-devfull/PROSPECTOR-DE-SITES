---
description: Escreve e envia (ou cria rascunho) da proposta por e-mail via Gmail
argument-hint: "[nome do cliente ou todos]"
---

Envie propostas para os leads com página publicada, seguindo a skill `proposta-email`.

## Passos

1. Leia `prospector-config.json` (assinatura e modo de envio) e `leads.md`.
2. Determine os destinatários: `$ARGUMENTS`, ou todos os leads com status `publicado` que ainda não receberam proposta. Somente leads com e-mail confirmado — para os demais, informe que a abordagem fica manual via WhatsApp (ofereça o texto adaptado).
3. Para cada cliente, escreva o e-mail seguindo a skill `proposta-email` na íntegra, usando os dados reais do lead: elogio baseado nas avaliações do Google, o defeito específico apontado na prospecção e — como ÚNICO link — a página-capa publicada (`https://[dominio]/[pastaBase]/[slug]/proposta.html`). Se a capa não foi publicada, gere e publique-a agora (template na skill `proposta-email`, upload pela skill `deploy-vps`) antes de criar o rascunho. NUNCA mencione preço.
4. **Checklist anti-spam (bloqueante)**: valide o e-mail contra a checklist da skill `proposta-email` (1 link, sem palavras-gatilho, sem anexo, assunto-pergunta ≤ 60 caracteres, primeira linha personalizada). Reescreva até passar em todos os itens.
5. **Criação do rascunho via script local** (substitui o conector do Gmail e o Claude in Chrome):
   - Verifique se `scripts/rascunho-gmail.js` existe na pasta conectada.
   - Verifique se `credentials.json` existe na pasta conectada. Se não existir, oriente o usuário a copiar o arquivo do Google Cloud Console para a pasta e rode novamente.
   - Para cada lead, monte um arquivo `propostas.json` com o array de rascunhos:
     ```json
     [
       {
         "para": "email@cliente.com.br",
         "assunto": "Assunto personalizado <= 60 chars",
         "corpo": "Corpo do e-mail em texto puro"
       }
     ]
     ```
   - Execute: `node scripts/rascunho-gmail.js --arquivo propostas.json`
   - Na primeira execução o browser abrirá para autenticação OAuth — oriente o usuário a escolher a conta `r2csolucoes@gmail.com` e autorizar. O token fica salvo em `gmail-token.json` e não será pedido novamente.
   - Após a execução, oriente o usuário a revisar os rascunhos no Gmail antes de enviar.
6. Atualize `leads.md` e o banco do dashboard: status `proposta` + data de envio.

## Saída

Resuma: quantas propostas criadas e para quem, com o link da capa de cada uma. Lembre o usuário: `/respostas` verifica quem respondeu (dá pra agendar diário) e `/followup` cuida de quem está 3+ dias sem responder.
