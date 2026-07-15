# Prospector de Sites — v2.1.0 (VPS)

Prospecção semi-automática de clientes com sites ruins: acha, redesenha, publica e oferta.

## O ciclo

1. `/setup` — roda uma vez: assinatura, nichos padrão, dados da VPS (IP, chave SSH, domínio, com teste de publicação).
2. `/prospectar [nicho] [cidade]` — busca no Google Maps negócios nota ≥ 4.7 com site fraco e gera `leads.md` com e-mail, motivo e ranking (padrão: 10 leads).
3. `/redesenhar` — recria as páginas dos 5+ melhores leads com estética premium, mantendo o conteúdo, logo e paleta reais do cliente.
4. `/editor [cliente]` — gera versão editável no navegador (textos e imagens) com exportação da página final.
5. `/publicar [cliente|todos]` — sobe na VPS via SSH em `dominio.com/clientes/[slug]/`, gera a página-capa de apresentação (antes/depois personalizado, `proposta.html`) e só conclui com HTTPS validado.
6. `/proposta [cliente|todos]` — escreve o e-mail (rapport, sem preço), passa pela checklist anti-spam e cria o rascunho no Gmail com a página-capa como único link.
7. `/respostas` — verifica no Gmail quem respondeu e atualiza o dashboard sozinho (dica: agende a verificação diária).
8. `/followup [cliente]` — 3+ dias sem resposta? Gera o follow-up gentil (1 por lead, nunca repete) já checando quem respondeu antes.
9. `/contrato [cliente]` — cliente fechou? Gera a minuta do contrato (pronta pra PDF) com os dados do negócio e deixa o rascunho no Gmail.

## Manual e publicação

O pacote inclui `manual.html` — o manual completo do usuário, copiado pra pasta no `/setup` e **atualizado a cada versão do plugin**. A publicação na VPS é feita via `scp`/SSH com chave (skill `deploy-vps`), sob demanda a cada `/publicar` — sem tarefa agendada, sem processo de fundo, sem senha em texto puro.

## Dashboard local

O plugin mantém um painel de controle na sua pasta: `prospector.db` (banco SQLite) + `dashboard.html`. Duplo clique em `iniciar-dashboard.bat` (Windows) ou `iniciar-dashboard.command` (Mac) (requer Python) abre o painel completo em http://localhost:8765 — kanban com drag & drop, edição, exclusão, funil, comparador antes/depois integrado, follow-ups, controle de contratos (pendente/enviado/assinado) e painel financeiro (recebido, a receber e MRR das manutenções), tudo salvo no banco.

## Requisitos

- Extensão Claude in Chrome conectada (prospecção no Maps)
- Conector do Gmail (rascunhos de proposta)
- Pasta conectada no Cowork (armazena config, leads e sites)
- Uma VPS própria com Nginx + Traefik configurados, domínio apontando pro IP e acesso SSH com chave

## Onde ficam os dados

Tudo na pasta conectada: `prospector-config.json` (preferências e dados da VPS — a chave SSH é referenciada só pelo caminho, nunca copiada pro arquivo), `leads.md` (pipeline) e `sites/[slug]/` (páginas criadas).

## Como atualizar

Como este é um fork próprio, atualize direto no seu repositório GitHub — edite os arquivos pela interface web ou faça `git pull` do fork se estiver sincronizando com o original.