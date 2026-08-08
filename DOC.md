# Documentação — Prospector de Sites + GMB

**Plugin:** `prospector-de-sites`  
**Versão:** 2.4.8  
**Autor:** Cristiano Araujo  
**Atualizado em:** 08/08/2026

---

## O que é

Sistema semi-automático de prospecção e venda de serviços digitais para pequenos negócios. Opera em dois eixos:

- **Prospector de Sites** — encontra negócios com site ruim, redesenha e vende
- **GMB** — encontra negócios com Google Meu Negócio incompleto, otimiza e vende

Ambos funcionam dentro do Claude Code, usando o navegador via Playwright para automação.

---

## Pré-requisitos

- Claude Code instalado
- Plugin `prospector-de-sites` instalado e atualizado
- Playwright MCP ativo (`playwright@claude-plugins-official: true` no settings)
- Node.js instalado
- Pasta de trabalho local (ex: `~/Downloads/teste`)
- VPS Oracle Cloud com Nginx + Traefik configurado
- Conta Gmail conectada ao Claude

---

## Setup inicial (rodar uma vez)

```bash
cd ~/Downloads/teste
/setup
```

Configura: nome, WhatsApp, e-mail, dados da VPS e preferências de nicho/cidade.

---

## Comandos — Prospector de Sites

### `/prospectar [nicho] [cidade]`

Busca leads no Google Maps com site ruim e salva no banco.

**Critério de qualificação:**
- Nota ≥ 4.7 + avaliações ≥ 40
- Site ativo mas ruim (não responsivo, sem CTA, visual antigo)
- E-mail público disponível

**Entrega:**
- Planilha Google Sheets com todos os avaliados
- `leads.md` local com cópia de trabalho
- Dashboard atualizado com os novos leads

**Exemplo:**
```bash
/prospectar advogados em Recife
/prospectar nutricionistas em Fortaleza
/prospectar clínicas estéticas em Natal
```

---

### `/redesenhar [lead]`

Gera o site novo premium para o cliente prospectado.

**O que faz:**
- Acessa o site atual do cliente
- Mantém logo, cores e conteúdo real
- Gera layout premium com hero dark, seções alternadas, FAQ, localização
- Cria `sites/[slug]/[slug].html` + `[slug]-editor.html`
- Atualiza `comparar.html`

**Padrão visual obrigatório:**
- Hero escuro com headline de benefício
- Strip de diferenciais logo abaixo
- Alternância claro/escuro entre seções
- Nota Google em destaque
- WhatsApp flutuante fixo

**Exemplo:**
```bash
/redesenhar blc-advogados
/redesenhar todos
```

---

### `/publicar [cliente] [--gmb]`

Sobe as páginas na VPS via SCP e verifica HTTPS.

**Modos:**
```bash
/publicar vanessa-cavalcante     # site + preview GMB do cliente
/publicar --gmb                  # só previews GMB
/publicar todos                  # sites + previews GMB
```

**O que faz:**
- Gera `sites/[slug]/proposta.html` (capa antes/depois)
- Envia pasta via SCP para a VPS
- Verifica HTTP 200 via curl (bloqueante — não entrega sem confirmar)
- Atualiza status no banco + URL pública
- Para GMB: publica `gmb/preview-[slug].html` em `[dominio]/clientes/[slug]-gmb/`

**URL pública resultante:**
```
https://seudominio.com/clientes/[slug]/
https://seudominio.com/clientes/[slug]-gmb/
```

---

### `/proposta [lead]`

Envia e-mail de apresentação do site novo para o cliente.

**Características:**
- E-mail anti-spam (sem palavras que caem no lixo)
- Apresenta o site novo sem mencionar preço
- Inclui link para a capa antes/depois
- Registra `dataProposta` no banco

**Exemplo:**
```bash
/proposta blc-advogados
/proposta todos
```

---

### `/followup [lead]`

Envia follow-up para leads sem resposta há 4+ dias.

**Exemplo:**
```bash
/followup
/followup frutuoso-advocacia
```

---

### `/contrato [lead]`

Gera contrato de prestação de serviço para cliente que fechou.

**Exemplo:**
```bash
/contrato blc-advogados
```

---

### `/editor`

Abre o editor visual para ajustes no site redesenhado (cores, textos, imagens).

---

### `/respostas`

Gerencia respostas dos clientes — atualiza status no kanban conforme retorno recebido.

---

## Comandos — GMB

### `/gmb [nicho] [cidade]`

Fluxo completo de diagnóstico + otimização do Google Meu Negócio.

**O que faz:**

**Parte 1 — Diagnóstico do líder:**
- Busca `[nicho] em [cidade]` no Google Maps
- Ignora patrocinados — pega só o 1º orgânico
- Confirma o concorrente antes de analisar
- Extrai: categorias, serviços, áreas, avaliações, atributos, fotos

**Parte 2 — Coleta de leads (posições 4-15):**
- Coleta até 10 leads abaixo do top 3
- Para cada lead: nome, posição, nota, telefone, WhatsApp, e-mail, problema do GMB
- Salva no banco → aparece na aba GMB do dashboard

**Parte 3 — Geração de arquivos:**
- `gmb/gmb-[slug].md` — perfil otimizado completo
- `gmb/leads-gmb-[slug].md` — tabela com os 10 leads
- `gmb/preview-[slug].html` — página de proposta individual por lead

**Exemplo:**
```bash
/gmb advogados em Recife
/gmb nutricionistas em Fortaleza
/gmb clínicas estéticas em Natal
```

---

### `/gmb diagnóstico [nicho] [cidade]`

Só o diagnóstico do concorrente líder, sem coletar leads nem gerar perfil.

**Útil para:** entender o mercado antes de prospectar.

**Exemplo:**
```bash
/gmb diagnóstico dentistas em Fortaleza
```

---

## O que o `/gmb` entrega por cliente

### `gmb/gmb-[slug].md`

1. **Diagnóstico do concorrente** — dados extraídos, pontos fortes e fracos
2. **Plano de ação** — o que copiar, o que superar
3. **Perfil otimizado pronto para copiar e colar:**
   - Categoria principal + até 9 secundárias
   - Descrição otimizada (750 chars, palavra-chave na 1ª frase)
   - 15 a 30 serviços com descrição curta
   - Áreas de atendimento (até 20)
   - Orientação de fotos (o que pedir ao cliente)
4. **4 posts mensais prontos** — 1 por semana, com CTA e WhatsApp
5. **Checklist de implementação** — passo a passo para aplicar no painel

### `gmb/preview-[slug].html`

Página de proposta visual individual por lead com:
- Hero com nome do cliente
- Antes/Depois do perfil GMB
- Perfil otimizado completo
- 4 posts mensais
- CTA com preço (R$ 900 GMB / R$ 2.000 pacote completo)

---

## Dashboard

Acesse em `http://localhost:8765` após rodar `iniciar-dashboard.command`.

### Abas disponíveis

| Aba | O que mostra |
|-----|-------------|
| 🏠 Visão geral | Funil do pipeline + follow-ups pendentes |
| 📋 Pipeline | Kanban: Novo → Redesenhado → Publicado → Proposta → Respondeu → Fechado |
| 👥 Clientes | Tabela com todos os leads |
| 🌐 Sites | Leads com site gerado |
| ↔ Comparador | Antes/depois de cada cliente |
| 🔔 Follow-ups | Leads com proposta há 4+ dias sem resposta |
| 📄 Contratos | Clientes que fecharam |
| 📍 GMB | Kanban de leads GMB: Novo → Abordado → Respondeu → Fechado |
| 💰 Financeiro | Receita fechada e potencial |
| ⚙️ Configurações | Dados do contratante + VPS |

### Aba GMB — como usar

1. Leads aparecem automaticamente após `/gmb`
2. Clique em **📱 WhatsApp** → abre WhatsApp com mensagem personalizada + muda para "Abordado"
3. Arraste o card entre colunas para atualizar o status
4. Use o botão **"→ Abordado/Respondeu/Fechado"** como alternativa ao arrasto

**Mensagem automática do WhatsApp:**
> *Olá [Nome]! Vi seu perfil no Google Maps e percebi que seu negócio tem ótimas avaliações mas seu Google Meu Negócio está incompleto ([problema específico]). Isso faz você perder clientes para concorrentes com perfil mais completo. Posso te entregar tudo otimizado e pronto para aplicar. Posso te mostrar como ficaria?*

Após publicar o preview na VPS, a mensagem inclui o link da página.

---

## Fluxos de trabalho

### Fluxo 1 — Só site

```
/prospectar advogados em Recife
/redesenhar blc-advogados
/publicar blc-advogados
/proposta blc-advogados
```

### Fluxo 2 — Só GMB

```
/gmb advogados em Recife
/publicar --gmb
→ abordar leads pelo WhatsApp do dashboard (aba GMB)
```

### Fluxo 3 — Pacote completo (site + GMB)

```
/prospectar advogados em Recife
/redesenhar blc-advogados
/gmb advogados em Recife
/publicar todos
/proposta blc-advogados
→ abordar leads GMB pelo dashboard
```

---

## Precificação sugerida

| Serviço | Preço | Recorrência |
|---------|-------|-------------|
| Site redesenhado | R$ 1.500 | — |
| GMB otimizado | R$ 900 | — |
| GMB + aplicação pelo cliente | R$ 1.200 | — |
| Pacote site + GMB | R$ 2.000-2.500 | — |
| Posts mensais GMB | R$ 300/mês | Mensal |
| Manutenção site | R$ 200/mês | Mensal |

---

## Estrutura de arquivos

```
~/Downloads/teste/
├── dashboard.html          ← dashboard (modo arquivo)
├── dashboard-server.py     ← servidor local
├── iniciar-dashboard.command
├── prospector-config.json  ← configurações
├── prospector.db           ← banco SQLite
├── leads.md                ← cópia local dos leads
├── sites/
│   └── [slug]/
│       ├── [slug].html         ← site redesenhado
│       ├── [slug]-editor.html  ← editor visual
│       └── proposta.html       ← capa antes/depois
├── gmb/
│   ├── gmb-[slug].md              ← perfil otimizado
│   ├── leads-gmb-[slug].md        ← tabela de leads
│   └── preview-[slug].html        ← página de proposta GMB
└── comparar.html           ← comparador antes/depois
```

---

## Repositório do plugin

```
prospector-de-sites/
├── .claude-plugin/
│   └── plugin.json
├── commands/
│   ├── setup.md
│   ├── prospectar.md
│   ├── redesenhar.md
│   ├── publicar.md
│   ├── proposta.md
│   ├── followup.md
│   ├── contrato.md
│   ├── editor.md
│   ├── respostas.md
│   └── gmb.md              ← novo
├── skills/
│   ├── prospeccao-maps/
│   ├── redesign-premium/
│   ├── dashboard-leads/
│   ├── deploy-vps/
│   ├── proposta-email/
│   ├── contrato-servico/
│   └── gmb/                ← novo
│       ├── SKILL.md
│       └── references/
│           └── gmb-preview-template.html
└── scripts/
```

---

## Atualizar o plugin

```bash
# No Claude Code
/plugin marketplace update cristiano-plugins
/reload-plugins

# Bumpar versão antes de cada atualização (plugin.json)
"version": "2.4.5"
```

---

## Problemas comuns

| Problema | Solução |
|----------|---------|
| `Unknown command: /gmb` | Verificar se `commands/gmb.md` está no repositório e rodar `/plugin marketplace update cristiano-plugins` |
| Playwright não navega | Rodar `npx @playwright/mcp@latest` em terminal separado antes |
| Dashboard não atualiza | Parar e reiniciar `dashboard-server.py` + Ctrl+Shift+R no Chrome |
| VPS não aceita conexão | Verificar se chave SSH está configurada no `prospector-config.json` |
| Link não retorna 200 | Verificar se container `clientes-prospector` está rodando na VPS |