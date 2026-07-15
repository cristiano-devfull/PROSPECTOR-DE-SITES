# 🎯 Prospector de Sites — v2.1.0 (fork VPS)

**Plugin para Claude (Cowork) que roda o ciclo completo de prospecção e venda de sites — com CRM local incluso:**

**Achou → Refez → Publicou → Ofertou → Acompanhou → Fechou → Contrato.**

De graça, rodando no seu computador, sem mensalidade. Este é um fork adaptado para publicar em VPS própria (Nginx + Traefik) via SSH, no lugar da HostGator/cPanel do plugin original.

## O que a v2 faz

| Comando | O que acontece |
|---|---|
| `/setup` | Configura tudo uma vez (pasta, assinatura, nichos, dados da VPS) e entrega o manual + dashboard |
| `/prospectar` | Varre o Google Maps: negócios nota ≥ 4.7 com site fraco E e-mail público → planilha no Google Sheets + CRM |
| `/redesenhar` | Recria as páginas com estética premium (fotos/logo/conteúdo REAIS) + editor visual + comparador antes/depois |
| `/editor` | Edita texto e imagem da página no navegador, sem código |
| `/publicar` | Publica na VPS via SSH (`scp`, sob demanda) + página-capa da proposta + HTTPS validado |
| `/proposta` | E-mail com rapport real, checklist anti-spam e a capa personalizada como link |
| `/respostas` | Lê seu Gmail e move o card sozinho quando o cliente responde (agende diário!) |
| `/followup` | 3+ dias sem resposta? Gera o lembrete gentil — 1 por lead, nunca repete |
| `/contrato` | Fechou? Folha A4 imprimível + Word TRAVADO (cliente só preenche onde você deixar) |

## 📊 CRM local (dashboard)

Kanban com drag & drop, funil, clientes, sites, comparador, follow-ups, contratos e painel financeiro (recebido, a receber, MRR e projeção 12 meses) — tudo num banco SQLite **na sua pasta**. Duplo clique no `iniciar-dashboard.bat` (Windows) ou `iniciar-dashboard.command` (Mac). Requisito: [Python](https://www.python.org/downloads/) (marque "Add to PATH").

## Como instalar

**No Claude Cowork:** Plugins → Gerenciar plugins → Adicionar marketplace → cole a URL deste repositório (fork) → instale o **prospector-de-sites** → rode `/setup`.

**No Claude Code:**
/plugin marketplace add cristiano-devfull/PROSPECTOR-DE-SITES
/plugin install prospector-de-sites@cristiano-devfull-plugins

## Requisitos

Claude Cowork · extensão Claude in Chrome · conectores Gmail e Google Drive · uma VPS própria com Nginx + Traefik configurados e acesso SSH com chave · Python (para o dashboard) · Windows ou Mac.

## Manual

O `/setup` entrega o [manual completo](prospector-de-sites/manual.html) na sua pasta — passo a passo de tudo, incluindo a seção "E no Mac?" e os problemas comuns.

---

Baseado no plugin original de **Helio Arreche** · [YouTube](https://youtube.com/@helioarreche) · [Instagram @helioarreche](https://instagram.com/helioarreche) — este fork adapta a publicação para VPS própria via SSH, no lugar da HostGator/cPanel.