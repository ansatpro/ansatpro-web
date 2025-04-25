#!/usr/bin/env node

/**
 * This script fixes Radix UI dependency issues.
 * Run with: node patches/fix-radix-ui.js
 */

const fs = require('fs');
const path = require('path');

// The problematic files that need to be fixed
const FILES_TO_FIX = [
  'node_modules/@radix-ui/react-use-effect-event/dist/index.mjs'
];

// Replace problematic import with direct React import
const fixUseLayoutEffectImport = (content) => {
  return content.replace(
    `import { useLayoutEffect } from "@radix-ui/react-use-layout-effect";`,
    `import * as React from "react";\n// Define useLayoutEffect directly to avoid package issues\nconst useLayoutEffect = globalThis?.document ? React.useLayoutEffect : () => {};`
  );
};

// Process each file
const processFiles = () => {
  FILES_TO_FIX.forEach(filePath => {
    const fullPath = path.resolve(process.cwd(), filePath);
    
    if (fs.existsSync(fullPath)) {
      console.log(`Fixing file: ${filePath}`);
      try {
        let content = fs.readFileSync(fullPath, 'utf8');
        
        // Check if the file contains the problematic import
        if (content.includes('@radix-ui/react-use-layout-effect')) {
          // Fix the content
          const fixedContent = fixUseLayoutEffectImport(content);
          
          // Create a backup
          const backupPath = `${fullPath}.backup`;
          if (!fs.existsSync(backupPath)) {
            fs.writeFileSync(backupPath, content);
            console.log(`Created backup at: ${backupPath}`);
          }
          
          // Write the fixed content
          fs.writeFileSync(fullPath, fixedContent);
          console.log(`✅ Fixed: ${filePath}`);
        } else {
          console.log(`⚠️ File doesn't need fixing: ${filePath}`);
        }
      } catch (error) {
        console.error(`❌ Error fixing ${filePath}:`, error);
      }
    } else {
      console.log(`⚠️ File not found: ${filePath}`);
    }
  });
};

// Run the fix
console.log('Fixing Radix UI dependency issues...');
processFiles();
console.log('Done!'); 