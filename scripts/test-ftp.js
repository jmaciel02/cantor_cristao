const ftp = require('basic-ftp');

async function testConnection() {
  const client = new ftp.Client();
  client.ftp.verbose = true;
  try {
    await client.access({
      host: 'ftpupload.net',
      user: 'ezyro_42877105',
      password: 'fe7c6f',
      secure: false
    });
    console.log('FTP Conectado com sucesso!');
    const list = await client.list();
    console.log('Arquivos na raiz do FTP:');
    for (const item of list) {
      console.log(`- ${item.name} (${item.isDirectory ? 'DIR' : 'FILE'}, ${item.size} bytes)`);
    }
  } catch (err) {
    console.error('Erro na conexão FTP:', err);
  } finally {
    client.close();
  }
}

testConnection();
