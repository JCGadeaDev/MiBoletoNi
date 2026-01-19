const { initializeApp, cert } = require('firebase-admin/app');
const { getStorage } = require('firebase-admin/storage');
const fs = require('fs');
const path = require('path');

// Load Env
function loadEnv() {
  try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (!fs.existsSync(envPath)) return;
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        let value = match[2].trim();
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (match[1].trim() === 'FIREBASE_PRIVATE_KEY') value = value.replace(/\\n/g, '\n');
        process.env[match[1].trim()] = value;
      }
    });
  } catch (e) {}
}
loadEnv();

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
  })
});

console.log('Listing buckets for project:', process.env.FIREBASE_PROJECT_ID);

// We use a dummy name just to get the GCS client reference
const storageClient = getStorage().bucket('dummy-bucket').storage;

storageClient.getBuckets().then(([buckets]) => {
    console.log('Buckets found:');
    if (buckets.length === 0) {
        console.log('(No buckets found)');
    }
    buckets.forEach(bucket => {
        console.log(`- ${bucket.name}`);
    });
}).catch(err => {
    console.error('Error listing buckets:', err.message);
    if (err.code === 403) {
        console.error('PERMISSION DENIED: Service Account likely missing "Storage Admin" or "Viewer" role.');
    }
});
