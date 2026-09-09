Sim. Analisei o site que você enviou e a ideia faz bastante sentido como **PWA focado em velocidade, simplicidade e uso durante cultos**, especialmente porque o site original concentra muito material, mas a navegação não foi desenhada com a experiência de um aplicativo moderno em mente.

Há um detalhe importante: o próprio projeto informa que existem **581 hinos, além de 3 variações**, e oferece muito mais que letras: partituras em diferentes afinações, cifragens, MP3/MIDI, kits de voz, vídeos, slides, partituras para piano etc. ([sites.google.com][1])

Minha recomendação é, portanto, não criar apenas um "site mais bonito". Dá para construir um **Cantor Cristão PWA de verdade**, extremamente rápido, offline e preparado para futuramente ir para a Play Store.

# Roadmap — PWA Cantor Cristão

## 1. Objetivo do produto

O aplicativo deve ter como princípio:

> **Abrir → encontrar o hino → cantar.**

Nada de menus confusos, telas desnecessárias ou propagandas atrapalhando.

O usuário deverá conseguir:

* abrir o aplicativo em poucos instantes;
* digitar `15` e encontrar o hino 15;
* digitar parte do título;
* digitar uma frase/palavra da letra;
* acessar hinos recentemente utilizados;
* favoritar hinos;
* utilizar sem internet;
* aumentar/diminuir a letra;
* usar modo claro ou escuro;
* navegar entre hino anterior/próximo;
* compartilhar um hino;
* instalar como aplicativo;
* posteriormente baixá-lo pela Google Play.

---

# 2. Um ponto fundamental: não fazer scraping em tempo real

Eu mudaria um pouco a ideia inicial.

Não faça:

```text
Usuário abre o hino
      ↓
Aplicativo acessa Google Sites
      ↓
Scraper procura o conteúdo
      ↓
Retorna para o celular
```

Isso ficaria lento, dependente do Google Sites e vulnerável a qualquer mudança no site.

A arquitetura correta é:

```text
GOOGLE SITES
     ↓
SCRAPER/IMPORTADOR
     ↓
NORMALIZAÇÃO
     ↓
BANCO DE DADOS
     ↓
API
     ↓
PWA
     ↓
CACHE LOCAL/OFFLINE
```

O scraper deve funcionar principalmente como uma ferramenta de **importação/sincronização administrativa**, e não como parte da experiência diária do usuário.

---

# 3. Antes do scraper: direitos e autorização

Esse ponto precisa constar no roadmap do programador.

O site informa expressamente que os materiais do Projeto Coletânea Cantor Cristão **não são destinados à comercialização**. Também solicita que usuários não façam download de todo o conteúdo hospedado no Dropbox de uma só vez, pois isso causa tráfego excessivo e até bloqueio dos links. ([sites.google.com][1])

Além disso, os Termos do Google proíbem acesso automatizado que viole instruções legíveis por máquina, como regras de rastreamento. ([Políticas do Google][2])

Portanto:

**antes de republicar letras, PDFs, áudios ou outros materiais, o ideal é verificar a autorização do mantenedor e os direitos envolvidos.**

Tecnicamente, eu faria o sistema preparado para importar tudo, mas ativaria cada categoria de conteúdo somente quando a utilização estiver juridicamente autorizada.

Principalmente:

```text
Letras
Partituras
Cifras
MP3
MIDI
Slides
Vídeos
PDF
```

É ainda melhor entrar em contato com o mantenedor e explicar que o objetivo é comunitário e sem anúncios. Talvez ele forneça a estrutura original dos dados, o que eliminaria boa parte do scraping.

---

# 4. Stack recomendada

Considerando o tipo de aplicação, eu utilizaria:

### Backend

```text
PHP 8.3+
Laravel
MySQL ou PostgreSQL
Redis
Laravel Scheduler
Laravel Queue
```

### Frontend

Eu escolheria:

```text
Vue 3
TypeScript
Vite
Pinia
Vue Router
PWA / Workbox
```

Outra alternativa excelente seria Nuxt, mas para esse projeto Laravel + Vue já oferece mais que o necessário.

### Infraestrutura

```text
Nginx
PHP-FPM
Redis
MySQL/PostgreSQL
Docker
Cloudflare
HTTPS
GitHub/GitLab CI
```

---

# 5. Estrutura de banco de dados

Não salve simplesmente uma página HTML inteira.

Normalize os hinos.

Exemplo conceitual:

```text
hymns
---------------------------------
id
number
variant
title
subtitle
first_line
lyrics
lyrics_normalized
author
translator
composer
meter
tone
category
source_url
source_updated_at
content_hash
created_at
updated_at
```

Outras tabelas:

```text
hymn_verses
hymn_choruses
hymn_categories
hymn_authors
hymn_resources
hymn_versions
hymn_search_terms
sync_logs
```

A tabela `hymn_resources` poderia guardar:

```text
hymn_id
resource_type
title
url
tone
instrument
voice
metadata
```

Tipos:

```text
PDF
MP3
MIDI
VIDEO
SLIDE
CIFRA
PARTITURA
PLAYBACK
KIT_VOZ
MUSICXML
ABC
```

Isso deixa o projeto preparado para crescer muito além das letras.

---

# 6. Scraper inteligente

Criar um módulo separado:

```text
app/
└── Services/
    └── HymnImporter/
        ├── SiteCrawler.php
        ├── HymnParser.php
        ├── HymnNormalizer.php
        ├── HymnValidator.php
        └── HymnSynchronizer.php
```

Comando:

```bash
php artisan hymns:sync
```

Fluxo:

```text
Descobrir páginas
      ↓
Baixar página
      ↓
Identificar número
      ↓
Identificar título
      ↓
Extrair conteúdo permitido
      ↓
Extrair metadados
      ↓
Extrair recursos
      ↓
Normalizar
      ↓
Validar
      ↓
Comparar hash
      ↓
Salvar somente alterações
```

Nunca sobrescrever silenciosamente conteúdo antigo.

Guardar:

```text
hash_anterior
hash_atual
data_importação
URL_origem
status
erro
```

---

# 7. Limitar agressividade do crawler

Muito importante.

O crawler deverá possuir:

```text
Rate limiting
Retry exponencial
Timeout
User-Agent identificável
Logs
Fila de processamento
Detecção de HTTP 429
Detecção de HTTP 403
Pause automático
```

Nada de centenas de conexões simultâneas.

Exemplo:

```text
Crawler
  ↓
Queue
  ↓
1-3 requisições simultâneas
  ↓
delay
  ↓
parser
```

Depois que os 581 hinos estiverem importados, praticamente não haverá motivo para ficar acessando o Google constantemente.

---

# 8. Detecção automática de alterações

Aqui podemos deixar o projeto bastante inteligente.

Cada hino recebe:

```text
SHA-256(normalized_content)
```

Exemplo:

```text
Hino 15

Banco:
54bc902...

Site:
54bc902...
```

Nada mudou:

```text
IGNORAR
```

Se:

```text
Banco:
54bc902...

Site:
8af4521...
```

Então:

```text
CRIAR NOVA VERSÃO
```

Isso evita processamento desnecessário.

---

# 9. Pesquisa — uma das partes mais importantes

A pesquisa precisa parecer instantânea.

Exemplo:

```text
Pesquisar hino
┌───────────────────────────────┐
│ 🔍 Número, título ou palavra  │
└───────────────────────────────┘
```

Se escrever:

```text
15
```

retorna:

```text
15 — ...
```

Se escrever:

```text
graça
```

retorna hinos contendo "graça".

Se escrever:

```text
firme
```

procura em:

```text
título
primeira linha
letra
categoria
```

---

# 10. Busca sem acentos

Isso é essencial.

A pesquisa:

```text
coracao
```

precisa encontrar:

```text
coração
```

E:

```text
salvacao
```

deve encontrar:

```text
salvação
```

Normalizar:

```text
lowercase
remoção de acentos
remoção de pontuação
espaços normalizados
```

---

# 11. Busca tolerante a pequenos erros

Também colocaria fuzzy search.

Por exemplo:

```text
salvasao
```

poderia sugerir:

```text
salvação
```

Bibliotecas como Fuse.js podem funcionar muito bem para o índice local.

Como são apenas cerca de 581 hinos, dá para manter um **índice extremamente rápido no próprio aparelho**.

Resultado:

```text
internet = desnecessária para pesquisar.
```

---

# 12. Estratégia offline

Aqui está um dos maiores diferenciais do aplicativo.

Depois de instalado, o usuário deve poder entrar numa igreja sem internet e continuar utilizando normalmente.

Estrutura:

```text
Service Worker
      +
Cache Storage
      +
IndexedDB
```

O Service Worker é justamente uma das tecnologias utilizadas para permitir recursos como funcionamento offline em PWAs. ([Chrome for Developers][3])

---

# 13. Cache em três camadas

Eu criaria:

### L1 — memória

Para dados usados naquela sessão.

```text
Pinia
```

### L2 — navegador

```text
IndexedDB
```

Guardar:

```text
hinos
favoritos
histórico
preferências
índice de busca
```

### L3 — servidor

```text
Redis
```

Cache:

```text
hymn:15
hymn:16
hymns:index
hymns:search:index
categories
```

---

# 14. Estratégias Workbox

O Workbox foi desenvolvido justamente para facilitar Service Workers e estratégias de cache. ([Chrome for Developers][4])

Eu usaria estratégias diferentes.

### App shell

```text
Cache First
```

Para:

```text
CSS
JS
fontes
ícones
logo
```

### API de hinos

```text
Stale While Revalidate
```

Mostra imediatamente o cache e atualiza em segundo plano.

Essa estratégia é oficialmente oferecida pelo Workbox. ([Chrome for Developers][5])

### Recursos que mudam frequentemente

```text
Network First
```

### Hinos baixados offline

```text
Cache First
```

Também é importante não fazer precache indiscriminadamente de arquivos pesados; a própria documentação do Workbox recomenda precache apenas do necessário e runtime caching para outros recursos. ([Chrome for Developers][6])

---

# 15. Estratégia ainda melhor para os hinos

Como são apenas 581 hinos textuais, há uma possibilidade excelente.

Na primeira instalação:

```text
App Shell
+
Índice dos 581 hinos
+
Letras permitidas
```

pode ser armazenado localmente.

O conteúdo textual provavelmente ficará muito pequeno comparado a áudio/imagens.

Depois:

```text
Internet cai
      ↓
581 hinos continuam disponíveis
```

Áudios, PDFs e vídeos seriam baixados sob demanda.

---

# 16. Tela inicial

Eu evitaria banners, carrosséis e excesso de opções.

Algo semelhante a:

```text
        CANTOR CRISTÃO

┌───────────────────────────────┐
│ 🔍 Digite nº, título ou letra │
└───────────────────────────────┘

Acesso rápido

♡ Favoritos
🕘 Recentes
♬ Todos os hinos

Hinos

001 ...
002 ...
003 ...
004 ...
```

Bottom navigation:

```text
⌂ Início    🔍 Buscar    ♡ Favoritos    ⚙ Ajustes
```

Só quatro opções.

---

# 17. Tela do hino

Algo semelhante:

```text
‹                        ♡   ⋮

HINO 15

Título do hino

─────────────────────

1
Texto da primeira estrofe...

2
Texto da segunda estrofe...

CORO
Texto...

─────────────────────

‹ Hino 14              Hino 16 ›

        A−   A   A+
```

Nada deve competir visualmente com a letra.

---

# 18. Controle de tamanho da fonte

Sua ideia é ótima e deve ser requisito obrigatório.

Por exemplo:

```text
A−     A     A+
```

ou:

```text
Pequena
Normal
Grande
Muito grande
```

Salvar em:

```text
localStorage / IndexedDB
```

O usuário escolhe uma vez e o aplicativo lembra.

As recomendações de acessibilidade do W3C estabelecem que o texto deve suportar aumento de até **200% sem perda de conteúdo ou funcionalidade**. ([W3C][7])

---

# 19. Modo para pessoas idosas

Eu acrescentaria um recurso muito bom:

```text
Modo leitura facilitada
```

Ao ativar:

```text
fonte maior
espaçamento maior
botões maiores
menos informações na tela
contraste maior
```

Isso atende muito bem a proposta de uso dos 20 aos 65+ anos.

---

# 20. Tipografia

Evitaria fontes decorativas nas letras.

Usaria algo extremamente legível, como:

```text
Inter
Roboto
Source Sans
Atkinson Hyperlegible
```

O título do aplicativo pode usar uma fonte com mais personalidade.

A letra dos hinos, não.

---

# 21. Temas

Criaria três:

```text
☀ Claro

🌙 Escuro

📖 Sépia
```

O sépia é excelente para leitura prolongada.

E também:

```text
Usar tema do aparelho
```

---

# 22. Favoritos

Botão:

```text
♡
```

vira:

```text
♥
```

Os favoritos precisam funcionar offline.

Versão inicial:

```text
IndexedDB
```

Não exige cadastro.

---

# 23. Histórico

Criaria:

```text
Hinos recentes
```

Por exemplo:

```text
15
212
422
187
```

É extremamente útil em culto.

---

# 24. "Ir para o hino"

Um recurso simples que fará muita diferença.

Botão flutuante:

```text
Nº
```

Abre:

```text
Digite o hino

[____]

      IR
```

Digita:

```text
187
```

Enter.

Abre imediatamente.

---

# 25. Navegação por gestos

Opcionalmente:

```text
← swipe
Hino anterior

→ swipe
Próximo hino
```

Mas os botões também devem permanecer.

Não podemos depender exclusivamente de gestos por causa dos usuários mais velhos.

---

# 26. Tela cheia para culto

Uma funcionalidade muito interessante:

```text
Modo Culto
```

Quando ativada:

```text
remove cabeçalho
remove menus
remove botões
mantém somente letra
mantém título/número
impede tela de desligar quando permitido
```

Toque na tela:

```text
controles aparecem.
```

---

# 27. Compartilhamento

Botão:

```text
Compartilhar hino
```

Utilizando Web Share API quando disponível.

Pode compartilhar:

```text
Hino 187 — Nome
app.com/hino/187
```

Eu evitaria compartilhar automaticamente a letra inteira.

---

# 28. Deep links

Cada hino deve ter sua própria URL:

```text
cantorcristao.app/hino/15
cantorcristao.app/hino/187
cantorcristao.app/hino/581
```

Então alguém manda pelo WhatsApp:

```text
cantorcristao.app/hino/212
```

Clicou → abre diretamente no hino.

Se o PWA estiver instalado, poderá abrir como aplicativo conforme a plataforma/suporte.

---

# 29. Favoritos sem obrigar cadastro

Para a primeira versão:

**não coloque login.**

É uma barreira desnecessária.

O aplicativo deve abrir imediatamente.

Posteriormente pode haver:

```text
Login opcional
```

para sincronizar:

```text
Favoritos
Preferências
Listas
Histórico
```

---

# 30. Recurso que eu acrescentaria: Listas

Isso seria excelente para igrejas.

Exemplo:

```text
Culto de domingo

15
212
301
422
```

Outra:

```text
Culto de jovens

187
323
400
```

O usuário cria:

```text
+ Nova lista
```

Isso transforma o aplicativo numa ferramenta muito mais útil.

---

# 31. Ordem de culto

Evolução futura das listas:

```text
Culto 13/09/2026

Abertura
Hino 15

Louvor
Hino 212

Ofertório
Hino 301

Encerramento
Hino 422
```

Um líder poderia preparar tudo antes.

---

# 32. QR Code

Outra funcionalidade interessante.

O líder cria uma lista:

```text
Culto de Jovens
```

O aplicativo gera QR Code.

Os jovens apontam o celular:

```text
Abrir lista
```

Não considero essencial para o MVP, mas é uma excelente evolução.

---

# 33. Busca por categorias

Se os dados permitirem:

```text
Adoração
Evangelização
Oração
Santa Ceia
Batismo
Natal
Ressurreição
Missões
Consagração
```

Não inventar categorias automaticamente sem revisão.

---

# 34. Recursos musicais

Como o site já reúne recursos como partituras, cifras, áudio, vídeos e kits de voz, a arquitetura pode desde agora comportar uma área:

```text
Recursos do hino
```

Exemplo:

```text
Hino 212

📖 Letra
🎸 Cifra
🎼 Partitura
🎹 Piano
🎧 Playback
🎤 Voz soprano
🎤 Contralto
🎤 Tenor
🎤 Baixo
▶ Vídeo
```

O site de origem realmente disponibiliza diversos desses tipos de material. ([sites.google.com][1])

Mas só habilite aquilo cuja reutilização estiver autorizada.

---

# 35. Atualizações do conteúdo

O PWA precisa detectar:

```text
content_version: 2026.09.01
```

Servidor:

```text
content_version: 2026.09.05
```

Então:

```text
Nova atualização disponível

[Atualizar]
```

Atualiza somente os registros modificados.

Não baixa tudo novamente.

---

# 36. API

Endpoints possíveis:

```text
GET /api/v1/hymns
GET /api/v1/hymns/15
GET /api/v1/hymns/15/resources
GET /api/v1/hymns/search?q=graca
GET /api/v1/categories
GET /api/v1/content/version
```

Evitar:

```text
/api/getHino.php?id=...
```

Fazer API versionada desde o início.

---

# 37. Performance

Metas:

```text
App Shell:
quase instantâneo após primeiro carregamento

Pesquisa local:
< 100 ms idealmente

Troca entre hinos:
imediata

Offline:
100% das funções principais

API:
cacheada
```

Usar:

```text
Brotli
HTTP/2 ou HTTP/3
CDN
Redis
lazy loading
code splitting
tree shaking
compressão
ETag
Cache-Control
```

---

# 38. Não carregar fontes de terceiros desnecessariamente

Para um aplicativo que precisa funcionar dentro de igreja com internet fraca:

melhor:

```text
/fonts/inter.woff2
```

do que depender toda vez de terceiros.

Mesma regra para ícones.

---

# 39. PWA Manifest

Ter:

```text
manifest.webmanifest
```

com:

```text
name
short_name
description
icons
start_url
scope
display
theme_color
background_color
screenshots
```

Para a experiência de instalação no Chrome, HTTPS e um Web App Manifest com informações como nome, ícones 192/512, `start_url` e modo de exibição continuam fazendo parte dos critérios relevantes. ([web.dev][8])

---

# 40. Instalação amigável

Depois de algumas interações:

```text
Instale o Cantor Cristão

Tenha seus hinos disponíveis
mesmo sem internet.

[Agora não]     [Instalar]
```

Nunca mostrar assim que a pessoa entra pela primeira vez.

---

# 41. Transformação em aplicativo Android

Aqui sua ideia também é perfeitamente viável.

Depois do PWA estar funcionando perfeitamente:

```text
PWA
 ↓
Trusted Web Activity
 ↓
Bubblewrap
 ↓
Android App
 ↓
Google Play
```

A documentação oficial do Android mantém a **Trusted Web Activity (TWA)** como forma de executar uma PWA em experiência Android de tela cheia, utilizando Digital Asset Links para comprovar que aplicativo e domínio pertencem ao mesmo desenvolvedor. ([Android Developers][9])

Portanto não precisamos criar dois aplicativos diferentes.

Teremos:

```text
1 código principal
       ↓
Web
PWA
Android
```

---

# 42. Não publicar simplesmente um "site embrulhado"

Isso é importante para a Play Store.

O Google exige que aplicativos tenham funcionalidade adequada e experiência útil; apps muito limitados ou essencialmente estáticos podem enfrentar problemas de política. ([Google Suporte][10])

O nosso não seria limitado, porque terá:

```text
busca avançada
offline
favoritos
histórico
configuração de leitura
listas
deep linking
PWA
sincronização
modo culto
```

Isso fortalece muito a proposta de aplicativo.

---

# 43. Administração

Também criaria:

```text
/admin
```

Somente para administradores.

Dashboard:

```text
581 hinos encontrados

581 importados

0 com erro

Última sincronização
09/09/2026

Conteúdo alterado
3

Falhas
0
```

Botões:

```text
Sincronizar
Validar
Ver alterações
Publicar atualização
```

---

# 44. Não publicar automaticamente alterações do scraper

Fluxo ideal:

```text
Site mudou
    ↓
Scraper detectou
    ↓
Importação temporária
    ↓
Diff
    ↓
Administrador revisa
    ↓
Aprovar
    ↓
Produção
```

Exemplo:

```diff
Hino 212

- antiga linha
+ nova linha
```

Evita que uma mudança acidental do site destrua nosso conteúdo.

---

# 45. Logs

Guardar:

```text
data
URL
status HTTP
hino
hash
tempo
erro
tentativas
```

Exemplo:

```text
09/09/2026 18:22
Hino 212
UPDATED
OLD: a123...
NEW: f872...
```

---

# 46. Segurança

Mesmo sendo um app simples:

```text
HTTPS obrigatório
CSP
HSTS
CSRF
XSS protection
SQL injection protection
Rate limiting
validação de entrada
sanitização do HTML importado
logs administrativos
backup
```

Principalmente:

**nunca renderizar HTML raspado diretamente.**

O scraper deve converter:

```text
HTML externo
   ↓
parser
   ↓
texto estruturado
   ↓
sanitização
   ↓
banco
```

---

# 47. Privacidade

Uma das vantagens do projeto pode ser justamente:

```text
Sem anúncios
Sem rastreamento invasivo
Sem cadastro obrigatório
Sem venda de informações
```

Isso combina perfeitamente com o propósito comunitário que você descreveu.

---

# 48. Analytics

Caso queira saber uso:

prefira analytics com privacidade.

Precisamos saber coisas úteis como:

```text
quantos usuários usam offline
quais funcionalidades são utilizadas
tempo de carregamento
erros
versões instaladas
```

Não precisamos saber identidade religiosa, localização precisa ou coisas semelhantes.

---

# 49. Testes

Obrigatórios:

### Unitários

```text
Parser
Normalizer
Search
HymnService
```

### Integração

```text
Crawler → parser → DB
API → DB
```

### E2E

```text
Playwright
```

Cenários:

```text
Pesquisar "15"
Pesquisar "salvacao"
Favoritar
Fechar aplicativo
Abrir novamente
Favorito continua

Desligar internet
Abrir hino
Pesquisar hino
Trocar hino
Tudo funciona
```

---

# 50. Testes reais que eu exigiria

Testar pelo menos em:

```text
Android barato
Android intermediário
Android moderno
iPhone
tablet
desktop
```

E principalmente:

```text
3G lento
internet instável
offline
```

O verdadeiro teste desse aplicativo não é no Wi-Fi do programador.

É:

> **domingo à noite, igreja cheia, sinal ruim, alguém precisa achar o hino 212 em dois segundos.**

Esse deve ser o cenário de engenharia.

---

# 51. Fases de desenvolvimento

## Fase 0 — Legal e origem

```text
Mapear direitos
Contato com mantenedor
Verificar robots/termos
Definir o que pode ser reutilizado
Mapear 581 + variações
```

## Fase 1 — Importador

```text
Crawler
Parser
Normalizer
Validation
Hash
Logs
Database
```

## Fase 2 — API

```text
Hinos
Busca
Categorias
Recursos
Versionamento
Redis
```

## Fase 3 — Frontend

```text
Início
Busca
Lista
Leitor
Favoritos
Recentes
Ajustes
```

## Fase 4 — PWA

```text
Manifest
Service Worker
Workbox
IndexedDB
Offline
Install
Update
```

## Fase 5 — Acessibilidade

```text
Font size
200% scaling
contraste
dark mode
sepia
modo leitura
touch targets
screen reader
```

## Fase 6 — Recursos avançados

```text
Listas
Modo culto
Compartilhamento
Deep links
Recursos musicais
```

## Fase 7 — Administração

```text
Dashboard
Sincronização
Diff
Aprovação
Logs
```

## Fase 8 — Android

```text
TWA
Bubblewrap
Digital Asset Links
AAB
Play Console
```

## Fase 9 — Qualidade

```text
Playwright
Lighthouse/performance
offline testing
accessibility testing
security testing
```

---

# 52. Estrutura de projeto que eu passaria ao programador

```text
cantor-cristao/
│
├── backend/
│   ├── app/
│   │   ├── Models/
│   │   ├── Services/
│   │   │   ├── HymnService/
│   │   │   ├── SearchService/
│   │   │   └── HymnImporter/
│   │   ├── Jobs/
│   │   ├── Console/
│   │   └── Http/
│   ├── database/
│   └── tests/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── views/
│   │   ├── stores/
│   │   ├── composables/
│   │   ├── services/
│   │   └── offline/
│   ├── public/
│   │   ├── icons/
│   │   └── manifest.webmanifest
│   └── tests/
│
├── docker/
│
├── nginx/
│
├── docs/
│   ├── architecture.md
│   ├── scraping.md
│   ├── api.md
│   ├── pwa.md
│   └── database.md
│
├── docker-compose.yml
└── README.md
```

---

# 53. Arquitetura final

Eu visualizo assim:

```text
                       ┌─────────────────┐
                       │ GOOGLE SITES    │
                       │ Fonte original  │
                       └────────┬────────┘
                                │
                     Importação controlada
                                │
                       ┌────────▼────────┐
                       │ Hymn Importer   │
                       │ crawler/parser  │
                       └────────┬────────┘
                                │
                       Normalização/hash
                                │
                    ┌───────────▼───────────┐
                    │ Laravel Application   │
                    │                       │
                    │ Hymns                 │
                    │ Search                │
                    │ Sync                  │
                    │ Admin                 │
                    └───────┬────────┬──────┘
                            │        │
                      ┌─────▼──┐ ┌──▼─────┐
                      │ DB     │ │ Redis  │
                      └─────┬──┘ └──┬─────┘
                            │        │
                            └───┬────┘
                                │
                           REST API
                                │
                    ┌───────────▼──────────┐
                    │ Vue 3 PWA            │
                    │                      │
                    │ IndexedDB            │
                    │ Workbox              │
                    │ Search local         │
                    │ Offline              │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │ Celular              │
                    │ Tablet               │
                    │ Desktop              │
                    │ Android / Play Store │
                    └──────────────────────┘
```

# O ponto que pode transformar esse projeto

Eu não o trataria como **"um scraper do Cantor Cristão"**.

Esse seria apenas o mecanismo inicial de importação.

Eu o trataria como:

> **uma plataforma digital do Cantor Cristão voltada para cultos e uso pessoal, offline, acessível, sem publicidade invasiva e extremamente simples.**

Esse posicionamento muda completamente o nível do projeto.

E existe uma oportunidade especialmente boa aqui: o site original já reuniu durante anos uma quantidade enorme de recursos — são partituras, cifras, áudio, playback, vozes, vídeos, slides e outros materiais. ([sites.google.com][1]) A gente pode começar com **leitura + pesquisa + favoritos + offline**, deixar isso impecável e construir a arquitetura desde já para futuramente incorporar, com as permissões adequadas, a parte musical.

Para o **MVP**, eu fecharia exatamente nestes recursos: **581 hinos + variações autorizadas, busca por número/título/palavra, funcionamento 100% offline para texto, favoritos, recentes, tamanho de fonte, claro/escuro/sépia, anterior/próximo, compartilhamento por link, PWA instalável e painel de sincronização**. Todo o restante entra depois.

Isso já daria ao programador uma especificação muito sólida e, principalmente, evita que ele cometa o erro de construir simplesmente um scraper acoplado ao Google Sites. A fonte externa deve alimentar o sistema; **o aplicativo jamais deve depender dela para funcionar no culto**. ([Chrome for Developers][11])

[1]: https://sites.google.com/site/coletaneacantorcristao/ "Coletânea Cantor Cristão"
[2]: https://policies.google.com/terms/embedded?hl=pt-BR&utm_source=chatgpt.com "Termos de Serviço do Google – Privacidade & Termos – Google"
[3]: https://developer.chrome.com/docs/lighthouse/pwa/service-worker/?utm_source=chatgpt.com "Does not register a service worker that controls page and start_url  |  Lighthouse  |  Chrome for Developers"
[4]: https://developer.chrome.com/docs/workbox/what-is-workbox?utm_source=chatgpt.com "What is Workbox?  |  Chrome for Developers"
[5]: https://developer.chrome.com/docs/workbox/modules/workbox-strategies?hl=en&utm_source=chatgpt.com "workbox-strategies  |  Modules  |  Chrome for Developers"
[6]: https://developer.chrome.com/docs/workbox/precaching-dos-and-donts/?utm_source=chatgpt.com "Precaching dos and don'ts  |  Workbox  |  Chrome for Developers"
[7]: https://www.w3.org/WAI/WCAG20/Understanding/resize-text.html?utm_source=chatgpt.com "Understanding Success Criterion 1.4.4: Resize text"
[8]: https://web.dev/articles/install-criteria?authuser=9&utm_source=chatgpt.com "What does it take to be installable?  |  web.dev"
[9]: https://developer.android.com/develop/ui/views/layout/webapps/trusted-web-activities?hl=en&utm_source=chatgpt.com "Overview of Trusted Web Activities  |  Views  |  Android Developers"
[10]: https://support.google.com/googleplay/android-developer/answer/9898783?hl=en&utm_source=chatgpt.com "Functionality, Content, and User Experience - Play Console Help"
[11]: https://developer.chrome.com/docs/workbox/service-worker-overview?hl=en&utm_source=chatgpt.com "Service worker overview  |  Workbox  |  Chrome for Developers"
