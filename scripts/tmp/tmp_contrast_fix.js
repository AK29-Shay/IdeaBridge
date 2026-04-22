const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            results.push(file);
        }
    });
    return results;
}

const files = [...walk('./app'), ...walk('./components')];

function refactorFile(file) {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Fix contrast issues on dark buttons
    content = content.replace(/from-\[#0F0F0F\] to-\[#1A1A2E\] px-([^ ]+) py-([^ ]+) text-([^ ]+) font-semibold text-\[#0F0F0F\]/g, 'from-[#0F0F0F] to-[#1A1A2E] px-$1 py-$2 text-$3 font-semibold text-[#FFCBA4]');

    content = content.replace(/text-\[#0F0F0F\] shadow-sm hover:brightness/g, 'text-[#FFCBA4] shadow-sm hover:brightness');
    
    // Check if there are other cases of dark text on dark bg
    content = content.replace(/bg-gradient-to-r from-\[#0F0F0F\] to-\[#1A1A2E\] px-6 py-3 text-sm font-semibold text-\[#0F0F0F\]/g, 'bg-gradient-to-r from-[#0F0F0F] to-[#1A1A2E] px-6 py-3 text-sm font-semibold text-[#FFCBA4]');
    
    // Re-check dashboard cards
    content = content.replace(/text-\[#0F0F0F\] text-white/g, 'text-white');
    
    // Let's also check for from-[#0F0F0F] and text-[#0F0F0F] on the same line.
    
    if (content !== original) {
        fs.writeFileSync(file, content);
        console.log("Updated", file);
    }
}

files.forEach(refactorFile);
