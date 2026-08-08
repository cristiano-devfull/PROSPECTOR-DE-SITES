---
description: Faz diagnóstico do concorrente líder no Google Meu Negócio, gera perfil otimizado completo pronto para copiar e colar, e salva 10 leads abaixo do top 3 com contatos para abordagem
argument-hint: "[nicho] [cidade] — ex: advogado trabalhista Recife"
---

Execute o diagnóstico e otimização do Google Meu Negócio seguindo EXCLUSIVAMENTE a skill `gmb`. NÃO use a skill `prospeccao-maps`.

## Preparação

1. Leia `prospector-config.json` na pasta conectada. Se não existir, oriente a rodar `/setup` primeiro.
2. Determine nicho e cidade: use os argumentos `$ARGUMENTS` se informados; senão, pergunte ao usuário. Se vier de um lead já prospectado, use os dados do lead.
3. Pergunte se o cliente vai até o cliente (encanador, eletricista) OU o cliente vem até ele (clínica, restaurante) — isso define o alcance das áreas de atendimento.
4. **Criar pasta de saída**: antes de qualquer execução, criar a pasta `gmb/` na raiz da pasta conectada (se não existir). Todos os arquivos gerados pelo `/gmb` devem ser salvos dentro de `gmb/`.

## Modo de execução

Verifique os argumentos `$ARGUMENTS`:

- **Se contiver "diagnóstico"** → rode apenas o Modo 1 (só diagnóstico do concorrente)
- **Qualquer outro argumento** → rode o Modo 2 completo (diagnóstico + perfil otimizado + posts + leads)

## Execução — Parte 1: Diagnóstico do líder

Use as ferramentas do Claude in Chrome (carregue via ToolSearch se necessário) para abrir o Google e executar o fluxo completo descrito na skill `gmb`:

1. Buscar `[nicho] em [cidade]` no Google Maps
2. **IGNORAR** qualquer resultado com selo "Patrocinado", "Anúncio" ou "Ad"
3. Identificar a 1ª empresa ORGÂNICA do Map Pack (top 1)
4. **PARAR e confirmar com o usuário**: "O concorrente que vou analisar é [NOME]. Confirma?"
5. Só continuar após confirmação
6. Abrir o perfil completo e navegar por TODAS as abas (Sobre, Serviços, Produtos, Avaliações, Fotos)
7. Extrair os 7 campos: categorias, serviços, áreas de atendimento, produtos, avaliações, atributos e fotos

## Execução — Parte 2: Coleta de leads (posições 4 a 15)

Após o diagnóstico do top 1, voltar à lista de resultados do Maps e coletar **até 10 leads** nas posições 4 a 15 (ignorar top 3 e patrocinados). Para cada lead coletar:

| Campo | Fonte |
|-------|-------|
| slug | gerado: nome em kebab-case |
| nome | Maps |
| nicho | argumento informado |
| cidade | argumento informado |
| nota | Maps |
| avaliacoes | Maps |
| posicao | posição no Maps (4, 5, 6...) |
| telefone | Maps ou site |
| whatsapp | Site ou perfil Maps (formato 55DDDnúmero) |
| email | Site do negócio |
| temSite | "sim", "não" ou "linktree" |
| problemaGmb | ex: "sem descrição, sem serviços", "poucas fotos" |
| statusGmb | sempre "novo" para leads novos |

- Se não encontrar e-mail ou WhatsApp, registrar null e seguir
- Priorizar leads com GMB mais incompleto
- Nunca duplicar lead já existente

## Saída — Parte 1: Arquivos locais

Criar pasta `gmb/` na pasta conectada (se não existir) e salvar dois arquivos:

### `gmb/gmb-[slug-nicho]-[slug-cidade].md`
1. Diagnóstico do concorrente líder + plano de ação
2. Perfil otimizado (categoria, serviços, descrição, áreas, fotos)
3. 4 posts mensais prontos com CTA e WhatsApp
4. Checklist de implementação

### `gmb/leads-gmb-[slug-nicho]-[slug-cidade].md`
Tabela markdown com os 10 leads coletados (posição, nota, contatos, problema GMB)

## Saída — Parte 2: Salvar leads no banco via API

Após gerar os arquivos, tentar salvar cada lead no banco local via API do dashboard.
Para cada lead coletado, fazer POST para `http://localhost:8765/api/leads-gmb`:

```
POST http://localhost:8765/api/leads-gmb
Content-Type: application/json

{
  "slug": "[slug-do-lead]",
  "nome": "[nome]",
  "nicho": "[nicho]",
  "cidade": "[cidade]",
  "nota": [nota],
  "avaliacoes": [numero],
  "posicao": [numero],
  "telefone": "[telefone ou null]",
  "whatsapp": "[55DDDnumero ou null]",
  "email": "[email ou null]",
  "temSite": "sim/não/linktree",
  "problemaGmb": "[descrição do problema]",
  "statusGmb": "novo"
}
```

- Se o servidor não estiver rodando (connection refused), avisar o usuário: "Dashboard offline — leads salvos apenas em gmb/leads-gmb-[slug].md. Rode o iniciar-dashboard para sincronizar depois."
- Se salvar com sucesso, confirmar: "✅ [N] leads salvos no banco — visíveis na aba GMB do dashboard"
- Nunca travar a execução por falha na API — os arquivos .md já garantem os dados

## Entrega final

```
✅ GMB gerado: gmb/gmb-[slug].md
✅ Leads salvos: gmb/leads-gmb-[slug].md — [N] contatos
✅ [N] leads no banco (aba GMB do dashboard)
```

Sugerir próximo passo: abrir o dashboard e na aba GMB clicar em WhatsApp para abordar os leads.