const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getStorage } = require('firebase-admin/storage');
const fs = require('fs');
const path = require('path');

// Function to load .env.local manually since we don't have dotenv installed in dependencies
function loadEnv() {
  try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (!fs.existsSync(envPath)) return;
    
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        // Remove quotes if present
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        // Handle newlines in private key
        if (key === 'FIREBASE_PRIVATE_KEY') {
             value = value.replace(/\\n/g, '\n');
        }
        process.env[key] = value;
      }
    });
  } catch (e) {
    console.error('Error loading .env.local', e);
  }
}

loadEnv();

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

if (!projectId || !clientEmail || !privateKey || !storageBucket) {
  console.error('Missing required environment variables.');
  console.log('Project ID:', projectId);
  console.log('Client Email:', clientEmail);
  console.log('Private Key Present:', !!privateKey);
  console.log('Storage Bucket:', storageBucket);
  process.exit(1);
}

try {
  const app = initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
    storageBucket: storageBucket
  });

  console.log(`Attempting to set CORS for bucket: ${storageBucket}`);
  const bucket = getStorage().bucket(storageBucket);
  
  const corsConfiguration = [
    {
      origin: ["http://localhost:3000", "https://miboletoni.com", "http://localhost:9002"],
      method: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"],
      maxAgeSeconds: 3600
    }
  ];

  // Verify bucket exists first (optional check, but good for debug)
  bucket.exists().then(([exists]) => {
      if (exists) {
          console.log(`Bucket ${storageBucket} exists.`);
          return bucket.setMetadata({
            cors: corsConfiguration
          });
      } else {
          console.error(`Bucket ${storageBucket} does NOT exist according to Admin SDK.`);
          console.error('Check your project ID and permissions.');
          process.exit(1);
      }
  }).then(() => {
    console.log(`SUCCESS: CORS configuration applied to bucket ${storageBucket}`);
    console.log('You may need to clear your browser cache or wait a few minutes.');
  }).catch(err => {
    console.error('FAILED to set CORS:', err.message);
    if (err.code === 404) {
        console.error('Error 404: Bucket not found. Ensure the Service Account has "Storage Admin" role and the bucket name is correct.');
    }
  });

} catch (error) {
  console.error('Initialization Error:', error);
}
