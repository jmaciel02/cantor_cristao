# Cantor Cristão — Aplicativo PWA Oficial

[![Vue 3](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vue.js&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![PWA](https://img.shields.io/badge/PWA-100%25_Offline-5A0FC8?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

Plataforma digital do tradicional hinário **Cantor Cristão** desenvolvida como Progressive Web App (PWA) de alta performance, voltada especificamente para uso em cultos, congregações e devoção pessoal.

---

## 🌟 Principais Recursos

- **⚡ 100% Offline:** Todas as 581 letras, estrofes e refrões ficam disponíveis instantaneamente no celular via IndexedDB e Workbox Service Worker.
- **🔍 Busca Instantânea (<10ms):**
  - Digite o número do hino (ex: `15`, `212`) para abrir imediatamente.
  - Busca sem acentos (ex: `graca` encontra `graça`).
  - Busca tolerante a pequenos erros de digitação (*fuzzy search* via Fuse.js).
  - Busca pela primeira frase cantada.
- **🔢 Salto Rápido ("Ir para o Hino"):** Teclado numérico virtual e físico para ir de 1 a 581 em menos de 1 segundo.
- **⛪ Modo Culto:** Tela cheia imersiva sem menus ou botões e integração com `Screen Wake Lock API` (a tela do celular não apaga durante o hino).
- **♿ Acessibilidade WCAG 200%:**
  - 3 temas: **🌙 Escuro (AMOLED)**, **☀️ Claro** e **📖 Sépia**.
  - Escalonamento contínuo de fonte (14px a 36px) com persistência no dispositivo.
  - Modo Leitura Facilitada para pessoas idosas com botões táteis ampliados.
- **❤️ Favoritos e Histórico:** Salve hinos com 1 toque e veja os hinos cantados recentemente sem necessidade de cadastro ou login.
- **📱 PWA Instalável & Play Store Ready:** Totalmente compatível com Trusted Web Activities (TWA / Bubblewrap) para publicação como aplicativo Android nativo.

---

## 🏗️ Arquitetura do Projeto

```
cantor_cristao/
├── docker-compose.yml              # Orquestração Nginx, PHP-FPM, MySQL e Redis
├── nginx/default.conf              # Servidor reverso com Gzip, cache estrito e SPA
├── docs/deployment.md              # Guia para configuração de DNS, SSL e deploy
├── scripts/
│   ├── normalize-hymns.js         # Normalizador dos 581 hinos em formato canônico JSON
│   └── generate-icons.js          # Gerador dos ícones PWA 192x192, 512x512
├── backend/
│   ├── public/index.php           # API REST v1 (/hymns, /search, /categories, /version)
│   ├── app/Services/HymnImporter/ # Módulo com Normalizer, Parser e Validator
│   └── database/seeders/data/     # Dataset canônico dos 581 hinos
└── frontend/
    ├── public/icons/              # Ícones PWA (192x192, 512x512, maskable, favicon)
    ├── src/
    │   ├── assets/main.css        # Design System Vanilla CSS
    │   ├── components/            # BottomNav, QuickJumpModal, InstallPrompt
    │   ├── composables/           # useWakeLock, useSwipe
    │   ├── data/                  # hymns-canonical.json e hymns-summary.json
    │   ├── services/              # db.ts (IndexedDB), search.ts (Fuse.js)
    │   ├── stores/                # hymnStore, favoritesStore, historyStore, settingsStore
    │   ├── views/                 # HomeView, HymnDetailView, SearchView, FavoritesView, SettingsView
    │   └── router/index.ts
    └── vite.config.ts             # Configuração VitePWA e Service Worker
```

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- Node.js 18+ e npm
- PHP 8.2+ (opcional para o backend local)
- Docker & Docker Compose (para ambiente completo de produção)

### 1. Frontend PWA

```bash
cd frontend
npm install
npm run dev
```

Acesse no navegador: `http://localhost:5173/`

Para compilar o pacote de produção otimizado:
```bash
npm run build
```

### 2. Backend API Local

```bash
php -S localhost:8000 -t backend/public
```

Acesse os endpoints:
- `http://localhost:8000/api/v1/content/version`
- `http://localhost:8000/api/v1/hymns/15`
- `http://localhost:8000/api/v1/search?q=graca`

---

## 🐳 Deploy em Produção com Docker

Consulte o guia completo em [docs/deployment.md](docs/deployment.md) para apontar seu domínio e ativar SSL gratuito.

Para iniciar todos os serviços:
```bash
docker compose up -d --build
```

---

## 📜 Licença e Propósito

Os textos e melodias originais do **Cantor Cristão** estão em **domínio público**. Este projeto tem finalidade comunitária e de utilidade para igrejas, ministérios e cristãos em geral, sem exibição de anúncios publicitários.
