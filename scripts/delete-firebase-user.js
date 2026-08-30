const { getApps, initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const fs = require('fs');
const path = require('path');

const keyPath = path.join(__dirname, '..', 'serviceAccountKey.json');
if (!fs.existsSync(keyPath)) {
  console.log('Error: serviceAccountKey.json not found!');
  process.exit(1);
}

const keyData = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

if (getApps().length === 0) {
  initializeApp({
    credential: cert(keyData)
  });
}

async function run() {
  const email = 'kadanmuhumed371@gmail.com';
  console.log(`Checking Firebase Auth for user: ${email}...`);
  try {
    const userRecord = await getAuth().getUserByEmail(email);
    console.log(`Found user: ${userRecord.uid}. Deleting...`);
    await getAuth().deleteUser(userRecord.uid);
    console.log(`Successfully deleted user ${email} from Firebase Auth.`);
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.log(`User ${email} was not found in Firebase Auth (already cleared).`);
    } else {
      console.error('Error deleting user:', error);
    }
  }
}

run();
