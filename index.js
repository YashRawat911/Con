const express = require('express');
const expressSession = require('express-session');
const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const fileManager = require('express-file-manager');

const app = express();
const port = 3000;

// Configure express-session middleware
app.use(express.static('public'));
app.use(express.json());
app.use(expressSession({ secret: 'web-terminal-secret', resave: false, saveUninitialized: true }));

// Use the file manager middleware
app.use('/filemanager', (req, res, next) => {
  const sessionID = req.sessionID;
  if (!sessionID) {
    console.error('SessionID not available in the request.');
    return res.status(500).send('Internal Server Error');
  }

  const userFolder = getUserFolder(sessionID);

  // Set the rootPath dynamically based on the user's sessionID
  fileManager({
    startPath: '/',
    rootPath: userFolder,
  })(req, res, next);
});

app.get('/execute', async (req, res) => {
  const command = req.query.command;
  const sessionID = req.sessionID;

  if (!sessionID) {
    console.error('SessionID not available in the request.');
    return res.status(500).send('Internal Server Error');
  }

  const userFolder = getUserFolder(sessionID);

  try {
    await fs.mkdir(userFolder, { recursive: true });
  } catch (error) {
    console.error('Error creating user folder:', error.message);
    return res.status(500).send('Internal Server Error');
  }

  const term = spawn('bash', ['-c', `cd ${userFolder} && ${command}`]);

  let output = '';

  term.stdout.on('data', data => {
    output += data;
  });

  term.stderr.on('data', data => {
    output += data;
  });

  term.on('close', () => {
    res.send(output);
  });
});

app.listen(port, () => {
  console.log(`Web terminal listening at http://localhost:${port}`);
});

// Cleanup: Remove user folders older than 24 hours
setInterval(async () => {
  const mainFolder = path.join(__dirname, 'user_folders');

  try {
    const userFolders = await fs.readdir(mainFolder);
    const currentTime = Date.now();

    for (const userFolder of userFolders) {
      const userFolderPath = path.join(mainFolder, userFolder);
      const stats = await fs.stat(userFolderPath);
      const lastAccessedTime = stats.atime.getTime();

      if (currentTime - lastAccessedTime > 24 * 60 * 60 * 1000) {
        // If the folder hasn't been accessed in the last 24 hours, delete it
        await fs.rmdir(userFolderPath, { recursive: true });
        console.log(`Deleted user folder: ${userFolderPath}`);
      }
    }
  } catch (error) {
    console.error('Error during cleanup:', error.message);
  }
}, 24 * 60 * 60 * 1000); // Run every 24 hours

function getUserFolder(sessionID) {
  return path.join(__dirname, 'user_folders', sessionID);
}
