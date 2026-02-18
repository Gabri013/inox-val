import fs from 'fs';
import path from 'path';
import { ValidatorResult } from '../types';

export async function validateEnvironment(): Promise<ValidatorResult> {
  const start = Date.now();
  
  try {
    // Validate environment variables
    const requiredEnvVars = [
      'VITE_FIREBASE_API_KEY',
      'VITE_FIREBASE_PROJECT_ID', 
      'VITE_FIREBASE_APP_ID',
      'NODE_ENV'
    ];

    const missingVars = [];
    const invalidVars = [];

    requiredEnvVars.forEach(varName => {
      const value = process.env[varName];
      if (!value || value.trim() === '') {
        missingVars.push(varName);
      } else if (varName === 'VITE_FIREBASE_API_KEY' && value.length < 30) {
        invalidVars.push(`${varName} (muito curta)`);
      } else if (varName === 'VITE_FIREBASE_PROJECT_ID' && !value.includes(' ')) {
        // Basic project ID validation (no spaces)
      } else if (varName === 'VITE_FIREBASE_APP_ID' && value.length < 10) {
        invalidVars.push(`${varName} (muito curta)`);
      }
    });

    if (missingVars.length > 0) {
      throw new Error(`Variáveis de ambiente faltando: ${missingVars.join(', ')}`);
    }

    if (invalidVars.length > 0) {
      throw new Error(`Variáveis de ambiente inválidas: ${invalidVars.join(', ')}`);
    }

    const duration = Date.now() - start;
    return {
      status: 'passed',
      duration,
      details: {
        environment: process.env.NODE_ENV,
        projectId: process.env.VITE_FIREBASE_PROJECT_ID
      }
    };
  } catch (error) {
    const duration = Date.now() - start;
    return {
      status: 'failed',
      duration,
      error: error.message
    };
  }
}

export async function validateBuild(): Promise<ValidatorResult> {
  const start = Date.now();
  
  try {
    const buildDir = path.join(process.cwd(), 'dist');
    
    // Check if build directory exists
    if (!fs.existsSync(buildDir)) {
      throw new Error('Diretório de build (dist/) não encontrado');
    }

    // Check if main files are present
    const indexHtmlPath = path.join(buildDir, 'index.html');
    if (!fs.existsSync(indexHtmlPath)) {
      throw new Error('Arquivo index.html não encontrado no build');
    }

    const assetsDir = path.join(buildDir, 'assets');
    if (!fs.existsSync(assetsDir)) {
      throw new Error('Diretório assets/ não encontrado no build');
    }

    const assets = fs.readdirSync(assetsDir);
    if (assets.length === 0) {
      throw new Error('Diretório assets/ está vazio');
    }

    const duration = Date.now() - start;
    return {
      status: 'passed',
      duration,
      details: {
        buildDirSize: getDirectorySize(buildDir),
        assetsCount: assets.length
      }
    };
  } catch (error) {
    const duration = Date.now() - start;
    return {
      status: 'failed',
      duration,
      error: error.message
    };
  }
}

function getDirectorySize(dir: string): string {
  let totalSize = 0;
  
  try {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        totalSize += getDirectorySize(filePath);
      } else {
        totalSize += stat.size;
      }
    });
  } catch (error) {
    console.error(`Erro ao ler diretório ${dir}:`, error);
  }

  return formatBytes(totalSize);
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  
  // Handle cases where bytes might be NaN or negative
  if (isNaN(bytes) || bytes < 0) {
    return '0 Bytes';
  }
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  const value = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
  const unit = sizes[i] || 'GB';
  
  return `${value} ${unit}`;
}
