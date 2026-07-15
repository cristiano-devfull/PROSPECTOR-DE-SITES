---
name: deploy-vps
description: Esta skill deve ser usada ao publicar páginas na VPS Oracle Cloud (Nginx + Traefik) — upload via scp, criação de pastas por cliente, verificação da URL pública. Acione quando o usuário disser "publicar", "subir o site", "colocar no ar", "deploy", "vps" ou rodar /publicar ou o teste de conexão do /setup.
---

# Deploy na VPS Oracle Cloud

Publicar cada página do cliente em `~/clientes-prospector/[slug]/index.html` na VPS, acessível em `https://[dominio]/clientes/[slug]/`.

Credenciais: ler de `prospector-config.json` (chave `vps`: `ip`, `usuario` — geralmente `ubuntu` —, `chave_ssh` com o caminho local do arquivo `.key`/`.pem`, `dominio`, `pasta_remota` — padrão `~/clientes-prospector`). Se faltar algum campo, pedir ao usuário. A chave SSH nunca é lida/exibida em texto — só referenciada pelo caminho no `-i` dos comandos.

## Pré-requisito único (fazer uma vez, documentar no /setup)

Na VPS, garantir que existe o container Nginx compartilhado apontando pra pasta de clientes, com o label do Traefik:

```yaml
  clientes-prospector:
    image: nginx:alpine
    container_name: clientes-prospector
    restart: unless-stopped
    volumes:
      - ~/clientes-prospector:/usr/share/nginx/html/clientes:ro
    networks:
      - r2c-network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.clientes.rule=Host(`[DOMINIO]`) && PathPrefix(`/clientes`)"
      - "traefik.http.routers.clientes.entrypoints=websecure"
      - "traefik.http.routers.clientes.tls.certresolver=letsencrypt"
      - "traefik.http.services.clientes.loadbalancer.server.port=80"
```

Se esse container ainda não existir, adicionar ao `docker-compose.yml` da VPS (via SSH) e rodar `docker compose up -d clientes-prospector` uma única vez. Nas publicações seguintes não é preciso mexer nisso de novo — só copiar arquivos pra pasta.

## Publicação (via scp)

```bash
scp -i "CHAVE_SSH" -r "./sites/SLUG" USUARIO@IP:"PASTA_REMOTA/SLUG"
```

- `-r` copia a pasta inteira (HTML + eventuais imagens locais).
- Se o slug já existir na pasta remota, `scp` sobrescreve o conteúdo — nunca criar pasta com nome duplicado de outro cliente.
- Para publicar vários leads em lote, repetir o comando por slug (não existe flag de "todos" nativa do scp — iterar a lista de `leads.md` com status `redesenhado`).

## Verificação (sempre)

Após o upload, buscar `https://[DOMINIO]/clientes/[SLUG]/` e confirmar HTTP 200 + conteúdo correto (título do cliente presente):

```bash
curl -sS -o /dev/null -w "%{http_code}" "https://DOMINIO/clientes/SLUG/"
```

Se não vier 200, checar: propagação (raro, domínio já ativo), permissões da pasta (ficam como estavam no scp, geralmente ok), se o container `clientes-prospector` está rodando (`docker ps` na VPS).

## Organização

- 1 pasta por cliente em `~/clientes-prospector/`, slug em kebab-case sem acentos (ex.: `jessica-nutri`).
- Nunca sobrescrever a pasta de outro cliente.
- Página de teste do setup: `~/clientes-prospector/teste/index.html` com um "Funcionou!" simples, publicada com o mesmo comando `scp`, verificando em `https://[DOMINIO]/clientes/teste/`.
