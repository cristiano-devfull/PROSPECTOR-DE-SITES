---
name: gmb
description: Esta skill deve ser usada ao fazer diagnóstico e otimização do Google Meu Negócio de um cliente prospectado — analisa o concorrente líder, gera categorias, serviços, descrição e posts prontos para copiar e colar no painel do GMB. Acione quando o usuário disser "otimizar GMB", "Google Meu Negócio", "perfil do Google", "diagnóstico GMB" ou rodar /gmb.
---

# /gmb — Diagnóstico e Otimização do Google Meu Negócio

O `/gmb` entrega um **documento de implementação completo**: o cliente (ou você) só precisa logar no painel do GMB e copiar e colar. O valor está na análise, estratégia e conteúdo pronto — não no clique manual.

> ⚠️ O Google não tem API pública para editar GMB automaticamente. Todo o conteúdo gerado aqui é para implementação manual no painel do Google Meu Negócio.

---

## Quando usar

- Cliente prospectado com GMB fraco ou inexistente
- Cliente que já tem site mas não aparece no Maps
- Usar sozinho ou em conjunto com `/redesenhar` (pacote completo)
- Para qualquer nicho: advogados, clínicas, restaurantes, salões, etc.

---

## O que o /gmb entrega

O comando tem **dois modos**. O usuário escolhe qual quer:

---

### Modo 1 — `/gmb diagnóstico [nicho] em [cidade]`
Só o diagnóstico do concorrente líder. Útil para entender o mercado antes de vender o serviço ao cliente.

Entrega:
- Dados extraídos do 1º concorrente orgânico
- Análise de pontos fortes e fracos
- Oportunidades de superá-lo

---

### Modo 2 — `/gmb [nicho] em [cidade]` ← padrão completo
Diagnóstico + tudo pronto para copiar e colar no GMB do cliente.

Entrega:
1. **Diagnóstico do concorrente líder** — 1º orgânico do Maps (nunca patrocinado)
2. **Plano de ação** — o que copiar, o que superar
3. **Categoria principal + até 9 secundárias** — prontas para aplicar
4. **Descrição otimizada** — 750 caracteres com palavras-chave, pronta para colar
5. **15 a 30 serviços** — nome + descrição curta com palavra-chave de busca
6. **Áreas de atendimento** — lista pronta
7. **Orientação de fotos** — lista do que pedir ao cliente (nunca banco de imagens)
8. **4 posts mensais prontos** — para subir 1 por semana no GMB
9. **Checklist de implementação** — passo a passo para o cliente aplicar
10. **Arquivo salvo** como `gmb-[slug-cliente].md`

> O cliente (ou você) só precisa logar no painel do GMB em business.google.com e copiar e colar. Zero trabalho intelectual na implementação.

---

## Regras invioláveis

1. **Nunca analisar resultado patrocinado/anúncio** — sempre o 1º orgânico do Map Pack
2. **Confirmar o nome do concorrente** com o usuário antes de extrair qualquer dado
3. **Nunca inventar dados** — se uma aba não estiver acessível, avisar
4. **Teste do "isso é real?"** — só sugerir categorias e serviços que o cliente realmente entrega. GMB que parece spam é suspenso pelo Google
5. **Fotos reais** — nunca sugerir banco de imagens. Orientar o cliente a tirar fotos reais do negócio

---

## Passo a passo de execução

### PASSO 1 — Coletar dados do cliente

Perguntar ao usuário (se não informado):
- Nome do negócio do cliente
- Tipo de serviço (ex: advogado trabalhista, clínica estética, restaurante)
- Cidade principal
- WhatsApp do cliente
- Site do cliente (se tiver)
- O cliente vai até o cliente OU o cliente vem até ele? (define alcance das áreas de atendimento)

### PASSO 2 — Identificar o concorrente líder

Buscar no Google Maps: `[tipo de serviço] em [cidade]`

- **IGNORAR** qualquer resultado com selo "Patrocinado", "Anúncio" ou "Ad"
- Pegar a **1ª empresa ORGÂNICA** do Map Pack (os 3 primeiros sem anúncio)
- **PARAR e confirmar**: "O concorrente que vou analisar é [NOME]. Confirma?"
- Só continuar após confirmação do usuário

### PASSO 3 — Extrair dados do concorrente

Abrir o perfil completo e navegar por TODAS as abas (Sobre, Serviços, Produtos, Avaliações, Fotos). Extrair:

| Campo | O que coletar |
|-------|--------------|
| Categorias | Principal + todas as secundárias |
| Serviços | Lista completa com descrição |
| Áreas de atendimento | Todas as cidades/regiões |
| Produtos | Nome, preço e descrição |
| Avaliações | Nota, total e os 5 temas mais elogiados |
| Atributos | Horário, identidade, destaques |
| Fotos | Quantidade aproximada e tipos |

### PASSO 4 — Gerar o documento de implementação

Entregar em arquivo `gmb-[slug-cliente].md` com as seções abaixo:

---

## Estrutura do documento de implementação

### 📊 Diagnóstico do concorrente
- Nome, nota, total de avaliações
- Categorias que usa
- Serviços cadastrados
- Pontos fortes e fracos

### 🎯 Análise de oportunidade
- O que ele faz bem → copiar
- Onde está fraco → superar
- Campos que ele não preencheu → sua vantagem

### ✅ Perfil otimizado — pronto para copiar e colar

**Categoria principal:** (a mais específica possível para o nicho)

**Categorias secundárias:** (até 9, do mais específico ao mais geral)

**Descrição do perfil** (750 caracteres máximo, com palavras-chave naturais):
```
[Escrever descrição otimizada com:
- Palavra-chave principal na 1ª frase
- Especialidades reais do cliente
- Diferenciais verificáveis
- CTA com link do WhatsApp no final]
```

**Serviços sugeridos** (validar volume no Semrush antes de aplicar):
```
1. [Nome do serviço] — [Descrição curta com palavra-chave]
2. ...
(gerar de 15 a 30 serviços relevantes)
```

**Áreas de atendimento:**
```
[Listar cidades/bairros relevantes — máx 20]
(Se cliente vai até o cliente: cidade inteira + região)
(Se cliente vem até ele: raio de 5km do endereço)
```

**Atributos recomendados:**
```
[Listar atributos disponíveis para o nicho que fazem sentido]
```

**Orientação de fotos** (nunca banco de imagens):
```
Pedir ao cliente:
- Fachada do estabelecimento (exterior)
- Recepção / sala de espera
- Profissional em atendimento (sem rosto do paciente/cliente)
- Equipe (se houver)
- Detalhe de produto/serviço
- Logo em fundo limpo
Meta: 30+ fotos reais para começar, chegar a 100+
Salvar com nome descritivo: "advogado-trabalhista-recife-escritorio.jpg"
```

### 📅 4 Posts prontos para o mês

Gerar 4 posts para subir 1 por semana no GMB. Cada post:
- 150-300 caracteres
- Palavra-chave principal + cidade
- CTA com link do WhatsApp
- Tom natural, sem parecer propaganda

```
POST 1 — Semana 1:
[Texto do post]
👉 WhatsApp: wa.me/55[DDD][NUMERO]

POST 2 — Semana 2:
[Texto sobre um serviço específico]
...

POST 3 — Semana 3:
[Texto com dúvida frequente respondida]
...

POST 4 — Semana 4:
[Texto com prova social / resultado]
...
```

### 📋 Checklist de implementação

Para o cliente (ou para você aplicar na conta do cliente):

- [ ] Acessar Google Meu Negócio (business.google.com)
- [ ] Atualizar categoria principal
- [ ] Adicionar categorias secundárias
- [ ] Colar a descrição otimizada
- [ ] Cadastrar todos os serviços validados
- [ ] Configurar áreas de atendimento
- [ ] Marcar atributos relevantes
- [ ] Fazer upload das fotos (mínimo 30 fotos reais)
- [ ] Subir o Post 1 (e agendar os demais se possível)
- [ ] Verificar horário de funcionamento atualizado
- [ ] Conferir número de telefone e site cadastrados

---

## Copywriting dos posts e descrição

- **Descrição**: palavra-chave principal na 1ª frase, diferenciais reais, CTA com WhatsApp no final
- **Posts**: tom humano, não publicitário. Falar de um serviço, tirar uma dúvida, mostrar um resultado — nunca "promoção imperdível"
- **Serviços**: nome + descrição curta com a palavra-chave de como o cliente busca no Google
- **Proibido**: superlativos sem prova, serviços que o cliente não oferece, fotos de banco de imagens, copiar a descrição do concorrente palavra por palavra

---

## Integração com o Prospector

O `/gmb` pode ser usado:

- **Isolado** → só GMB, cliente que não precisa de site novo
- **Junto com `/redesenhar`** → pacote site + GMB (ticket maior)
- **Sequência completa**:
  ```
  /prospectar → /redesenhar → /gmb → /publicar → /proposta
  ```

Ao usar junto com `/proposta`, mencionar no e-mail que o pacote inclui tanto o site novo quanto o perfil GMB otimizado — aumenta o valor percebido sem aumentar muito o esforço.

---

## Checklist final antes de entregar

- [ ] Concorrente confirmado pelo usuário (1º orgânico, sem anúncio)
- [ ] Todos os 7 campos extraídos (ou avisado quando inacessível)
- [ ] Descrição com palavra-chave + cidade na 1ª frase
- [ ] Serviços: mínimo 15, máximo 30
- [ ] 4 posts gerados com CTA e WhatsApp do cliente
- [ ] Teste do "isso é real?" aplicado em tudo
- [ ] Checklist de implementação incluído no documento
- [ ] Arquivo salvo como `gmb-[slug-cliente].md`
