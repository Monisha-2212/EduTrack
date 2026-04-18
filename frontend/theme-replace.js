import fs from 'fs';
import path from 'path';

const baseDir = path.resolve('frontend/src');
const extensions = ['.js', '.jsx', '.css'];

const replacements = [
  [/\bbg-slate-50\b/g, 'bg-[#FAF8F5]'],
  [/\bbg-slate-100\b/g, 'bg-[#EDE8DF]'],
  [/\bbg-slate-200\b/g, 'bg-[#E8E4DC]'],
  [/\bbg-slate-900\b/g, 'bg-[#1C1A17]'],
  [/\bbg-white\b/g, 'bg-[#FFFDF9]'],
  [/\bbg-indigo-600\b/g, 'bg-[#2C2A26]'],
  [/\bbg-indigo-700\b/g, 'bg-[#3A3830]'],
  [/\bbg-indigo-800\b/g, 'bg-[#1C1A17]'],
  [/\bbg-indigo-50\b/g, 'bg-[#FAF8F5]'],
  [/\bhover:bg-slate-50\b/g, 'hover:bg-[#FAF8F5]'],
  [/\bborder-slate-100\b/g, 'border-[#EDE8DF]'],
  [/\bborder-slate-200\b/g, 'border-[#E8E4DC]'],
  [/\bborder-slate-800\b/g, 'border-[#2C2A26]'],
  [/\bborder-indigo-600\b/g, 'border-[#C9A96E]'],
  [/\bborder-indigo-200\b/g, 'border-[#EDE8DF]'],
  [/\bring-indigo-500\b/g, 'ring-[#C9A96E]'],
  [/\btext-slate-400\b/g, 'text-[#9A9288]'],
  [/\btext-slate-500\b/g, 'text-[#6B6660]'],
  [/\btext-slate-600\b/g, 'text-[#4A4640]'],
  [/\btext-slate-700\b/g, 'text-[#3A3830]'],
  [/\btext-slate-800\b/g, 'text-[#2C2A26]'],
  [/\btext-slate-100\b/g, 'text-[#F5F0E8]'],
  [/\btext-indigo-600\b/g, 'text-[#8B6914]'],
  [/\btext-indigo-700\b/g, 'text-[#8B6914]'],
  [/\btext-indigo-800\b/g, 'text-[#8B6914]'],
  [/\bbg-indigo-100\b/g, 'bg-[#FAF8F5]'],
  [/\btext-indigo-300\b/g, 'text-[#F5F0E8]'],
  [/\bdark:bg-slate-800\b/g, 'dark:bg-[#1C1A17]'],
  [/\bdark:bg-slate-900\b/g, 'dark:bg-[#1C1A17]'],
  [/\bdark:border-slate-800\b/g, 'dark:border-[#2C2A26]'],
  [/\bdark:hover:bg-slate-800\/50\b/g, 'dark:hover:bg-[#1C1A17]/50'],
  [/\bdark:hover:bg-slate-800\b/g, 'dark:hover:bg-[#1C1A17]'],
  [/\bdark:bg-slate-800\/30\b/g, 'dark:bg-[#1C1A17]/30'],
  [/\bdark:bg-slate-800\/50\b/g, 'dark:bg-[#1C1A17]/50'],
  [/\btext-slate-900\b/g, 'text-[#2C2A26]'],
  [/\bdark:text-white\b/g, 'dark:text-[#F5F0E8]'],
  [/\bborder-slate-300\b/g, 'border-[#E8E4DC]'],
  [/\btext-slate-300\b/g, 'text-[#D8D4CC]'],
  [/\bbg-slate-950\b/g, 'bg-[#1C1A17]'],
  [/\bdark:border-slate-700\b/g, 'dark:border-[#2C2A26]'],
  [/\bhover:text-slate-600\b/g, 'hover:text-[#4A4640]'],
  [/\bbg-red-500\b/g, 'bg-[#8B6914]'],
  [/\btext-white\b/g, 'text-[#F0EBE0]'],
  [/\bdark:text-slate-400\b/g, 'dark:text-[#9A9288]'],
  [/\bdark:text-slate-300\b/g, 'dark:text-[#D8D4CC]'],
  [/\bdark:text-slate-200\b/g, 'dark:text-[#D8D4CC]'],
  [/\bdark:text-slate-500\b/g, 'dark:text-[#9A9288]'],
  [/\btext-amber-800\b/g, 'text-[#7A5A10]'],
  [/\btext-amber-600\b/g, 'text-[#7A5A10]'],
  [/\btext-amber-400\b/g, 'text-[#9A9288]'],
  [/\bbg-amber-50\b/g, 'bg-[#FDF5E4]'],
  [/\bdark:bg-amber-900\/20\b/g, 'dark:bg-[#1C1A17]/20'],
  [/\btext-green-800\b/g, 'text-[#3A5C28]'],
  [/\btext-green-400\b/g, 'text-[#3A5C28]'],
  [/\bbg-green-50\b/g, 'bg-[#EDF4E8]'],
  [/\bbg-teal-50\b/g, 'bg-[#E8F5F1]'],
  [/\btext-teal-800\b/g, 'text-[#2A5C4A]'],
  [/\btext-teal-600\b/g, 'text-[#2A5C4A]'],
  [/\bbg-red-50\b/g, 'bg-[#FBF0ED]'],
  [/\btext-red-800\b/g, 'text-[#8B3A22]'],
  [/\bbg-indigo-400\b/g, 'bg-[#C9A96E]'],
  [/\bborder-indigo-400\b/g, 'border-[#C9A96E]'],
  [/\bbg-indigo-900\/40\b/g, 'bg-[#1C1A17]/40'],
  [/\bbg-indigo-900\/10\b/g, 'bg-[#1C1A17]/10'],
  [/\bhover:border-slate-300\b/g, 'hover:border-[#E8E4DC]'],
  [/\bdivide-slate-100\b/g, 'divide-[#EDE8DF]'],
  [/\bdivide-slate-800\b/g, 'divide-[#2C2A26]'],
  [/\bdark:bg-slate-700\b/g, 'dark:bg-[#1C1A17]'],
  [/\bdark:bg-indigo-900\/40\b/g, 'dark:bg-[#1C1A17]/40'],
  [/\bdark:bg-indigo-900\/10\b/g, 'dark:bg-[#1C1A17]/10'],
  [/\bdark:border-indigo-800\b/g, 'dark:border-[#2C2A26]'],
  [/\btext-slate-200\b/g, 'text-[#D8D4CC]'],
];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (extensions.includes(path.extname(entry.name))) {
      let text = fs.readFileSync(fullPath, 'utf8');
      let updated = text;
      for (const [pattern, replacement] of replacements) {
        updated = updated.replace(pattern, replacement);
      }
      if (updated !== text) {
        fs.writeFileSync(fullPath, updated, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

walk(baseDir);
console.log('Theme replacement complete.');
