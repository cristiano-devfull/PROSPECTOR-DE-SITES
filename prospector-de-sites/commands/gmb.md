---
description: Faz diagnóstico do concorrente líder no Google Meu Negócio e gera perfil otimizado completo pronto para copiar e colar
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
- **Qualquer outro argumento** → rode o Modo 2 completo (diagnóstico + perfil otimizado + posts)

## Execução

Use as ferramentas do Claude in Chrome (carregue via ToolSearch se necessário) para abrir o Google e executar o fluxo completo descrito na skill `gmb`:

1. Buscar `[nicho] em [cidade]` no Google Maps
2. **IGNORAR** qualquer resultado com selo "Patrocinado", "Anúncio" ou "Ad"
3. Identificar a 1ª empresa ORGÂNICA do Map Pack
4. **PARAR e confirmar com o usuário**: "O concorrente que vou analisar é [NOME]. Confirma?"
5. Só continuar após confirmação
6. Abrir o perfil completo e navegar por TODAS as abas (Sobre, Serviços, Produtos, Avaliações, Fotos)
7. Extrair os 7 campos: categorias, serviços, áreas de atendimento, produtos, avaliações, atributos e fotos

## Saída

Criar pasta `gmb/` na pasta conectada (se não existir) e salvar o arquivo `gmb/gmb-[slug-cliente].md` com:

1. **Diagnóstico do concorrente** — dados extraídos + pontos fortes e fracos
2. **Plano de ação** — o que copiar, o que superar
3. **Perfil otimizado pronto para copiar e colar**:
   - Categoria principal + até 9 secundárias
   - Descrição otimizada (750 caracteres, palavra-chave na 1ª frase)
   - 15 a 30 serviços com descrição curta
   - Áreas de atendimento
   - Orientação de fotos (o que pedir ao cliente)
4. **4 posts mensais prontos** — 1 por semana, com CTA e WhatsApp do cliente
5. **Checklist de implementação** — passo a passo para aplicar no painel do GMB

A entrega final DEVE incluir confirmação "GMB gerado: gmb/gmb-[slug-cliente].md" e sugerir o próximo passo: `/proposta` para vender o pacote site + GMB ao cliente.
