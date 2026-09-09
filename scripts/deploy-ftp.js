const ftp = require('basic-ftp');
const path = require('path');

async function deploy() {
  const client = new ftp.Client();
  client.ftp.verbose = false;

  console.log('Iniciando conexão com ftpupload.net...');
  await client.access({
    host: 'ftpupload.net',
    user: 'ezyro_42877105',
    password: 'fe7c6f',
    secure: false
  });
  console.log('✓ Conectado ao servidor FTP!');

  // Navigate to htdocs
  await client.cd('htdocs');
  console.log('✓ Acessado diretório htdocs');

  // Remove default placeholder file if exists
  try {
    await client.remove('index2.html');
    console.log('✓ Removido index2.html padrão');
  } catch (e) {
    // Ignore if already removed
  }

  try {
    await client.remove('files for your website should be uploaded here!');
  } catch (e) {
    // Ignore
  }

  // Upload the entire frontend/dist directory
  const localDist = path.join(__dirname, '../frontend/dist');
  console.log(`Enviando arquivos de ${localDist} para htdocs...`);

  await client.uploadFromDir(localDist);

  console.log('✓ Todos os arquivos enviados com sucesso!');

  const remoteFiles = await client.list();
  console.log('\nArquivos no htdocs remoto:');
  for (const f of remoteFiles) {
    console.log(`- ${f.name} (${f.isDirectory ? 'DIR' : 'FILE'}, ${(f.size / 1024).toFixed(1)} KB)`);
  }

  client.close();
  console.log('\nDeploy via FTP concluído com 100% de sucesso!');
}

deploy().catch((err) => {
  console.error('Erro durante o deploy:', err);
  process.exit(1);
});
