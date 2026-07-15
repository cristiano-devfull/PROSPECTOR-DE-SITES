---
description: Configura o plugin — assinatura, preferências e conexão com a VPS (roda uma vez)
---

Configure o ambiente do Prospector de Sites. Siga esta ordem:

## 1. Pasta de trabalho

Verifique se há uma pasta do usuário conectada. Se não houver, peça para conectar uma pasta (ex.: "Clientes") usando a ferramenta de solicitação de pasta — tudo (config, leads e sites criados) será salvo nela para persistir entre sessões.

## 2. Verificar config existente

Procure `prospector-config.json` na pasta conectada. Se existir, mostre um resumo (sem exibir a chave SSH) e pergunte o que o usuário quer atualizar. Se não existir, colete os dados abaixo.

## 3. Dados do usuário (perguntar via AskUserQuestion / formulário)

Colete:

- **Assinatura da proposta**: nome completo, como quer se apresentar (ex.: "Designer de páginas de alta conversão") e WhatsApp/telefone de contato.
- **Nichos padrão de prospecção**: sugira nutricionistas, psicólogos, advogados e psiquiatras como ponto de partida, mas deixe o usuário editar livremente.
- **Cidade/região padrão**.
- **Leads qualificados por busca**: padrão 10.
- **Modo de envio da proposta**: padrão "criar rascunho no Gmail para revisão" (recomendado). Alternativa: enviar direto.

## 4. Conexão com a VPS

Pergunte se o usuário já tem uma VPS configurada com Nginx + Traefik para publicar os sites.

- **Se ainda não tem**: explique que ele precisa de uma VPS com Nginx (servindo os arquivos estáticos) e Traefik (proxy reverso com HTTPS automático via Let's Encrypt) já configurados, com um domínio próprio apontando para o IP da VPS. Salve o config parcial e encerre — ao concluir esse setup na VPS, ele deve voltar e rodar `/setup` de novo.
- **Se já tem**: colete diretamente aqui no chat (não é credencial sensível como senha, é infraestrutura do próprio usuário):
  1. IP público da VPS
  2. Usuário SSH (padrão: `ubuntu`)
  3. Caminho local do arquivo de chave SSH (`.pem` ou `.key`) — nunca leia o conteúdo do arquivo, só o caminho
  4. Domínio principal (ex.: `r2csolucoes.com.br`)
  5. Pasta remota onde os sites dos clientes ficam (padrão: `~/clientes-prospector`)

  Nunca exiba, imprima ou registre o conteúdo da chave SSH em nenhuma saída — só o caminho do arquivo.

## 5. Salvar e testar

Salve tudo em `prospector-config.json` na pasta conectada, neste formato:

```json
{
  "assinatura": { "nome": "", "apresentacao": "", "whatsapp": "" },
  "prospeccao": { "nichos": ["nutricionistas", "psicologos", "advogados", "psiquiatras"], "cidade": "", "leadsPorBusca": 10 },
  "envio": { "modo": "rascunho" },
  "vps": { "ip": "", "usuario": "ubuntu", "chave_ssh": "", "dominio": "", "pasta_remota": "~/clientes-prospector" }
}
```

Se os dados da VPS foram informados, teste a conexão seguindo a skill `deploy-vps`: publique uma página `teste.html` simples em `[pasta_remota]/teste/index.html` via `scp`, confirme HTTP 200 em `https://[dominio]/clientes/teste/` e informe a URL ao usuário. Se o teste falhar, diagnostique (chave SSH, IP, container `clientes-prospector` na VPS) antes de concluir.

## 6. Dashboard inicial

Siga a seção "Setup" da skill `dashboard-leads`: copie `dashboard-server.py` e `iniciar-dashboard.bat`/`.command` para a raiz da pasta conectada, crie o banco `prospector.db` (schema da skill) e gere o `dashboard.html` do template. Explique ao usuário: duplo clique em `iniciar-dashboard.bat` (Windows) ou `iniciar-dashboard.command` (Mac) abre o painel completo em http://localhost:8765 com edição/exclusão salvando no banco (requer Python; sem ele, o dashboard.html abre no modo leitura).

## 7. Entregar o manual

Copie da pasta do plugin para a pasta conectada (sobrescrevendo versões antigas): `manual.html` (manual do usuário) e o iniciador do dashboard certo (`iniciar-dashboard.bat` ou `.command`). Apresente o `manual.html` ao usuário com a frase: "Esse é o seu manual — guarda ele que responde 90% das dúvidas."

## 8. Encerrar

Confirme o que foi salvo e explique o ciclo (guiando SEMPRE o próximo passo ao fim de cada comando): `/prospectar` → `/redesenhar` → `/publicar` → `/proposta`, com `/editor` opcional para ajustes manuais e o `dashboard.html` como painel de controle de tudo.