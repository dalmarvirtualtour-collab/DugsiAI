const fs = require('fs');
const path = require('path');

function fixDirectory(basePath) {
  // We map the URL-encoded folder names to literal bracket dynamic params
  const level1Src = path.join(basePath, '%5Bgrade%5D');
  const level1Dest = path.join(basePath, '[grade]');

  if (fs.existsSync(level1Src)) {
    const level2Src = path.join(level1Src, '%5Bsubject%5D');
    const level2Dest = path.join(level1Src, '[subject]');

    if (fs.existsSync(level2Src)) {
      const level3Src = path.join(level2Src, '%5BlabId%5D');
      const level3Dest = path.join(level2Src, '[labId]');

      if (fs.existsSync(level3Src)) {
        if (fs.existsSync(level3Dest)) {
          fs.rmSync(level3Dest, { recursive: true, force: true });
        }
        fs.renameSync(level3Src, level3Dest);
        console.log(`Renamed level 3: ${level3Src} -> ${level3Dest}`);
      }

      if (fs.existsSync(level2Dest)) {
        fs.rmSync(level2Dest, { recursive: true, force: true });
      }
      fs.renameSync(level2Src, level2Dest);
      console.log(`Renamed level 2: ${level2Src} -> ${level2Dest}`);
    }

    if (fs.existsSync(level1Dest)) {
      fs.rmSync(level1Dest, { recursive: true, force: true });
    }
    fs.renameSync(level1Src, level1Dest);
    console.log(`Renamed level 1: ${level1Src} -> ${level1Dest}`);
  } else {
    console.log(`Path not found, already renamed? ${level1Src}`);
  }
}

// Execute renames
fixDirectory(path.join(__dirname, '../app/api/labs'));
fixDirectory(path.join(__dirname, '../app/labs'));
console.log('Folders renaming check completed.');
