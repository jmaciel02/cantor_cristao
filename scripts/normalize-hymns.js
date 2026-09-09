const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const rawDataPath = path.join(__dirname, '../frontend/src/data/raw_cantor_cristao.json');
const rawData = JSON.parse(fs.readFileSync(rawDataPath, 'utf8'));

function removeDiacritics(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function normalizeSearchText(str) {
  return removeDiacritics(str)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function toTitleCase(str) {
  const smallWords = new Set(['de', 'da', 'do', 'das', 'dos', 'em', 'no', 'na', 'nos', 'nas', 'a', 'o', 'as', 'os', 'e', 'ou', 'por', 'com', 'sem', 'pra', 'para', 'se', 'ao', 'aos', 'à', 'às']);
  const words = str.trim().split(/\s+/);
  return words
    .map((word, idx) => {
      const lower = word.toLowerCase();
      if (idx > 0 && smallWords.has(lower)) {
        return lower;
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

function getCategory(num) {
  if (num >= 1 && num <= 27) return 'Adoração e Louvor';
  if (num >= 28 && num <= 52) return 'Deus o Pai';
  if (num >= 53 && num <= 130) return 'Jesus Cristo Nosso Senhor';
  if (num >= 131 && num <= 144) return 'O Espírito Santo';
  if (num >= 145 && num <= 160) return 'As Sagradas Escrituras';
  if (num >= 161 && num <= 270) return 'O Evangelho e Salvação';
  if (num >= 271 && num <= 380) return 'Vida Cristã e Consagração';
  if (num >= 381 && num <= 430) return 'Serviço e Missões';
  if (num >= 431 && num <= 470) return 'A Igreja e Ordenanças';
  if (num >= 471 && num <= 500) return 'Família e Ocasiões Especiais';
  return 'Esperança Eterna e Glória';
}

const normalizedHymns = [];

for (let i = 1; i <= 581; i++) {
  const item = rawData[String(i)] || rawData[i];
  if (!item) {
    console.warn(`Hino ${i} não encontrado!`);
    continue;
  }

  // Extract clean title
  const rawTitle = item.title || '';
  let title = rawTitle.replace(/^\d+\s*[-–—.]\s*/, '').trim();
  title = toTitleCase(title);

  const rawHino = (item.hino || '').trim();

  // Check for author/composer at the end:
  // Usually lines with (18xx-19xx) or similar patterns at the end of the text
  let lyricsText = rawHino;
  let author = '';
  let composer = '';

  // Look for trailing author pattern: e.g. "Fanny Jane Crosby (1820-1915) William Howard Doane (1832-1915)"
  const authorMatch = lyricsText.match(/(?:[A-Z][a-zA-Z\s.,'-]+(?:\(\d{4}[-–]?\d{0,4}\)))+$/);
  if (authorMatch) {
    const authorBlob = authorMatch[0].trim();
    lyricsText = lyricsText.slice(0, authorMatch.index).trim();
    
    // Split potential multiple credits
    const credits = authorBlob.split(/(?<=\))\s+(?=[A-Z])/);
    if (credits.length >= 2) {
      author = credits[0].trim();
      composer = credits[1].trim();
    } else if (credits.length === 1) {
      author = credits[0].trim();
    }
  }

  // Split into stanzas: split on [coro], double-newlines, or 2+ consecutive spaces followed by capital letter
  // First, normalize coro markers
  const rawBlocks = lyricsText
    .replace(/\[coro\]/gi, '\n\n[CORO]\n')
    .replace(/Coro:/gi, '\n\n[CORO]\n')
    .split(/\n{2,}|\s{3,}(?=[A-Z0-9\[])/g)
    .map(b => b.trim())
    .filter(Boolean);

  const stanzas = [];
  let verseCounter = 1;

  for (const block of rawBlocks) {
    const isChorus = block.startsWith('[CORO]') || /^[\[(]coro[\])]/i.test(block);
    let cleanBlock = block.replace(/^[\[(]coro[\])]\s*/i, '').trim();

    // Split block into lines
    let lines = cleanBlock.split(/\n+/).map(l => l.trim()).filter(Boolean);
    if (lines.length === 1 && lines[0].includes('  ')) {
      lines = lines[0].split(/\s{2,}/).map(l => l.trim()).filter(Boolean);
    }

    if (lines.length > 0) {
      stanzas.push({
        number: isChorus ? null : verseCounter++,
        is_chorus: isChorus,
        text: lines.join('\n'),
        lines: lines
      });
    }
  }

  // If no stanzas detected cleanly, wrap whole text as 1 stanza
  if (stanzas.length === 0) {
    stanzas.push({
      number: 1,
      is_chorus: false,
      text: lyricsText,
      lines: lyricsText.split(/\n+/).map(l => l.trim()).filter(Boolean)
    });
  }

  // Determine first line
  let firstLine = '';
  for (const s of stanzas) {
    if (s.lines.length > 0) {
      firstLine = s.lines[0];
      break;
    }
  }

  const fullLyricsFormatted = stanzas
    .map(s => (s.is_chorus ? `[CORO]\n${s.text}` : `${s.number}.\n${s.text}`))
    .join('\n\n');

  const lyricsNormalized = normalizeSearchText(`${i} ${title} ${firstLine} ${lyricsText} ${author} ${composer}`);

  const contentHash = crypto.createHash('sha256').update(lyricsNormalized).digest('hex');

  normalizedHymns.push({
    id: i,
    number: i,
    title: title,
    raw_title: rawTitle,
    first_line: firstLine,
    author: author || null,
    composer: composer || null,
    category: getCategory(i),
    stanzas: stanzas,
    lyrics: fullLyricsFormatted,
    lyrics_normalized: lyricsNormalized,
    content_hash: contentHash
  });
}

console.log(`Normalizados com sucesso: ${normalizedHymns.length} hinos!`);

// Save full canonical file to frontend
const outputPathFrontend = path.join(__dirname, '../frontend/src/data/hymns-canonical.json');
fs.writeFileSync(outputPathFrontend, JSON.stringify(normalizedHymns, null, 2), 'utf8');
console.log(`Arquivo canônico salvo em: ${outputPathFrontend} (${(fs.statSync(outputPathFrontend).size / 1024).toFixed(1)} KB)`);

// Save summary for instant initial search and fast listing (< 70KB)
const summaryHymns = normalizedHymns.map(h => ({
  id: h.id,
  number: h.number,
  title: h.title,
  first_line: h.first_line,
  category: h.category,
  author: h.author,
  search_key: `${h.number} ${normalizeSearchText(h.title)} ${normalizeSearchText(h.first_line)}`
}));
const summaryPathFrontend = path.join(__dirname, '../frontend/src/data/hymns-summary.json');
fs.writeFileSync(summaryPathFrontend, JSON.stringify(summaryHymns), 'utf8');
console.log(`Índice resumido salvo em: ${summaryPathFrontend} (${(fs.statSync(summaryPathFrontend).size / 1024).toFixed(1)} KB)`);

// Save also to backend seed directory
const backendDir = path.join(__dirname, '../backend/database/seeders/data');
fs.mkdirSync(backendDir, { recursive: true });
const outputPathBackend = path.join(backendDir, 'hymns-canonical.json');
fs.writeFileSync(outputPathBackend, JSON.stringify(normalizedHymns, null, 2), 'utf8');
console.log(`Arquivo backend salvo em: ${outputPathBackend}`);

