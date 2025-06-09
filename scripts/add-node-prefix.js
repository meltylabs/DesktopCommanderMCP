#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// List of Node.js built-in modules to prepend with 'node:'
const nodeModules = [
  'os',
  'path',
  'fs',
  'url',
  'fs/promises',
  'child_process',
  'util',
  'https',
  'crypto'
];

// Function to process a single file
function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Process each module
  nodeModules.forEach(module => {
    // Skip if already has node: prefix in the import statement
    const hasNodePrefix = new RegExp(
      `(import\\s+(?:.*?\\s+from\\s+|))(['"])node:${module.replace('/', '\\/')}\\2`
    ).test(content);
    if (hasNodePrefix) continue;
    
    // Match import statements with single or double quotes
    // This handles both: import ... from "module" and import { ... } from "module"
    const importRegex = new RegExp(
      `(import\\s+(?:[^'"]+\\s+from\\s+))(['"])${module.replace('/', '\\/')}\\2`,
      'g'
    );
    
    // Replace with node: prefix
    const newContent = content.replace(importRegex, (match, prefix, quote) => {
      modified = true;
      return `${prefix}${quote}node:${module}${quote}`;
    });
    
    content = newContent;
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Updated: ${filePath}`);
  }
}

// Main function
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node add-node-prefix.js <file-or-directory> [file-or-directory...]');
    console.log('');
    console.log('Examples:');
    console.log('  node add-node-prefix.js src/');
    console.log('  node add-node-prefix.js file1.ts file2.js');
    console.log('  node add-node-prefix.js .');
    process.exit(1);
  }

  args.forEach(arg => {
    const fullPath = path.resolve(arg);
    
    if (!fs.existsSync(fullPath)) {
      console.error(`Error: ${fullPath} does not exist`);
      return;
    }

    const stats = fs.statSync(fullPath);
    
    if (stats.isFile()) {
      processFile(fullPath);
    } else if (stats.isDirectory()) {
      processDirectory(fullPath);
    }
  });
}

// Function to recursively process a directory
function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    const stats = fs.statSync(fullPath);
    
    if (stats.isDirectory()) {
      // Skip node_modules and other common directories
      if (!['node_modules', '.git', 'dist', 'build'].includes(file)) {
        processDirectory(fullPath);
      }
    } else if (stats.isFile()) {
      // Process TypeScript and JavaScript files
      if (/\.(ts|js|mjs|cjs|tsx|jsx)$/.test(file)) {
        processFile(fullPath);
      }
    }
  });
}

// Run the script
main();