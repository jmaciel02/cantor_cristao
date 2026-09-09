# Guia de Publicação e Deploy em Produção — Cantor Cristão PWA

Este guia descreve o passo a passo completo para apontar seu domínio próprio, configurar SSL/HTTPS gratuito e colocar o **Cantor Cristão PWA** no ar usando Docker e Nginx.

---

## 1. Configuração do Domínio (DNS)

No painel onde você registrou seu domínio (ex: Registro.br, Hostinger, GoDaddy, Cloudflare):

1. Crie uma entrada do tipo **A**:
   - **Nome / Host:** `@` (ou subdomínio como `app` ou `hinos`)
   - **Tipo:** `A`
   - **Valor / IP:** O endereço IP público do seu servidor VPS (ex: `123.45.67.89`)
   - **TTL:** Automático ou 3600

2. Crie uma entrada **CNAME** para www (opcional):
   - **Nome:** `www`
   - **Valor:** `seudominio.com.br`

---

## 2. Opção A — Utilizando Cloudflare (Recomendado pela simplicidade e velocidade)

1. Adicione seu domínio no Cloudflare (plano gratuito).
2. Deixe a nuvem de proxy **ligada (Laranja)**.
3. Em **SSL/TLS**, selecione o modo **Full** (ou Flexível).
4. O Cloudflare fornecerá HTTPS/SSL automaticamente com compressão Brotli e CDN global para os hinos.

---

## 3. Opção B — Utilizando Certbot / Let's Encrypt no Próprio Servidor

Se preferir emitir o certificado SSL diretamente no servidor Linux:

```bash
# 1. Instalar Certbot
sudo apt update
sudo apt install -y certbot

# 2. Gerar certificado para o domínio
sudo certbot certonly --standalone -d seudominio.com.br -d www.seudominio.com.br

# Os certificados ficarão em:
# /etc/letsencrypt/live/seudominio.com.br/fullchain.pem
# /etc/letsencrypt/live/seudominio.com.br/privkey.pem
```

---

## 4. Subindo a Aplicação com Docker Compose

No servidor, clone ou copie o projeto:

```bash
cd /caminho/para/aplicativo-cantor-cristao

# 1. Compilar o frontend PWA otimizado para produção
cd frontend
npm install
npm run build
cd ..

# 2. Iniciar os contêineres em segundo plano
docker compose up -d --build
```

O comando acima inicializará:
- **Nginx (porta 80/443):** Servindo os assets do PWA com cache estrito, compressão Gzip e roteamento SPA.
- **Backend PHP-FPM (porta 9000):** API REST versionada dos hinos.
- **MySQL 8.0:** Banco de dados relacional normalizado.
- **Redis:** Cache de alta velocidade para respostas da API.

---

## 5. Verificação da Instalação do PWA

1. Abra o site no navegador do celular (Chrome ou Safari) usando HTTPS.
2. Você verá o aplicativo carregando os 581 hinos instantaneamente.
3. Teste abrir o menu do navegador: a opção **"Instalar aplicativo"** ou **"Adicionar à tela de início"** estará disponível.
4. Ao instalar, o ícone oficial do Cantor Cristão aparecerá na grade de aplicativos do celular e funcionará em tela cheia (standalone) mesmo com Wi-Fi e dados móveis desligados.

---

## 6. Publicação na Google Play Store via TWA (Bubblewrap)

Para transformar o PWA em um APK / AAB para a Google Play:

1. Instale o Bubblewrap CLI:
   ```bash
   npm install -g @bubblewrap/cli
   ```
2. Inicialize o projeto apontando para o seu domínio:
   ```bash
   bubblewrap init --manifest=https://seudominio.com.br/manifest.webmanifest
   ```
3. Gere o pacote de publicação:
   ```bash
   bubblewrap build
   ```
4. O arquivo `app-release-signed.aab` gerado está pronto para ser enviado ao Google Play Console.
