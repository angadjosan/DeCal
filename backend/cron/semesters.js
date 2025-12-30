import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Secret Manager helper functions
const sm = new SecretManagerServiceClient();

async function accessSecret(projectId, name, version = 'latest') {
  const [res] = await sm.accessSecretVersion({
    name: `projects/${projectId}/secrets/${name}/versions/${version}`,
  });
  return res.payload.data.toString('utf8');
}

async function loadSecrets() {
  // Only load from Secret Manager in production
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  // On App Engine, these are available automatically:
  const projectId = process.env.GCP_PROJECT;

  if (!projectId) {
    console.warn('Warning: GCP_PROJECT not set, skipping Secret Manager loading');
    return;
  }

  // Load once at startup (cache in memory):
  if (!process.env.SUPABASE_URL || process.env.SUPABASE_URL.startsWith('${')) {
    process.env.SUPABASE_URL = await accessSecret(projectId, 'SUPABASE_URL');
  }
  if (
    !process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY.startsWith('${')
  ) {
    process.env.SUPABASE_SERVICE_ROLE_KEY = await accessSecret(
      projectId,
      'SUPABASE_SERVICE_ROLE_KEY'
    );
  }
}

// Load secrets before creating Supabase client
await loadSecrets();

async function semestersCron() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // getMonth() is zero-based
    var sem = '';

    if (month === 7) {
        sem = 'Fall ' + String(year);
    } else if (month === 12) {
        sem = 'Spring ' + String(year + 1);
    }
    console.log(sem);
    
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    await supabase.from('semesters').insert(
        { semester: sem}
    );
}

semestersCron();