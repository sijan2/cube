// Rollback script for calendar dark mode changes
// Run this script with Node.js if you need to revert to original colors

const fs = require('fs');
const path = require('path');

const ORIGINAL_DARK_MODE = `
.dark {
  --background: oklch(0.256 0.006 286.033);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.21 0.006 285.885);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.256 0.006 286.033);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.92 0.004 286.32);
  --primary-foreground: oklch(0.21 0.006 285.885);
  --secondary: oklch(0.37 0.013 285.805);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.37 0.013 285.805);
  --muted-foreground: oklch(0.705 0.015 286.067);
  --accent: oklch(0.37 0.013 285.805);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(0.985 0 0 / 10%);
  --input: oklch(0.985 0 0 / 15%);
  --ring: oklch(0.552 0.016 285.938);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.21 0.006 285.885);
  --sidebar-foreground: oklch(0.967 0.001 286.375);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.256 0.006 286.033);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(0.985 0 0 / 10%);
  --sidebar-ring: oklch(0.442 0.017 285.786);
  --destructive-foreground: oklch(0.704 0.191 22.216);
  --radius: 0.625rem;
}`;

console.log('⚠️  This script will revert the calendar dark mode to original colors');
console.log('📝 To execute rollback, run: node rollback-calendar-dark-mode.js --execute');

if (process.argv.includes('--execute')) {
  try {
    const globalsPath = path.join(__dirname, 'globals.css');
    let content = fs.readFileSync(globalsPath, 'utf8');

    // Find and replace the .dark class definition
    const darkModeRegex = /\.dark\s*\{[^}]*\}/;
    content = content.replace(darkModeRegex, ORIGINAL_DARK_MODE);

    // Remove the custom calendar dark mode styles
    const calendarStylesRegex = /\/\* Calendar Dark Mode - Full Black Theme \*\/[\s\S]*?\.dark \.flex\.flex-col\.rounded-lg \{[^}]*\}/;
    content = content.replace(calendarStylesRegex, '');

    fs.writeFileSync(globalsPath, content);
    console.log('✅ Successfully reverted to original dark mode colors!');
  } catch (error) {
    console.error('❌ Error during rollback:', error.message);
  }
} else {
  console.log('\n📋 Current backup is saved in: globals-backup.css');
}