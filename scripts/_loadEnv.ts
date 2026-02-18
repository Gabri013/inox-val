import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

const envFiles = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '.env.local')
];

export function loadEnv() {
  const loadedFiles: string[] = [];
  
  envFiles.forEach(envFile => {
    if (fs.existsSync(envFile)) {
      const result = dotenv.config({ 
        path: envFile,
        override: false // Do not override existing environment variables
      });
      
      if (result.error) {
        console.error(`Error loading ${envFile}:`, result.error);
      } else {
        loadedFiles.push(envFile);
      }
    }
  });
  
  if (loadedFiles.length > 0) {
    console.log(`Loaded environment variables from: ${loadedFiles.join(', ')}`);
  } else {
    console.warn('No .env files loaded');
  }
  
  return loadedFiles;
}
