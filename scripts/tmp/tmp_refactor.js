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

    // --- AUTH PAGES ---
    // Background gradient for auth pages
    content = content.replace(/bg-gradient-to-br from-violet-950 via-indigo-900 to-pink-900/g, 'bg-[#FFF8F3]');
    
    // Auth blobs
    content = content.replace(/bg-purple-600\/20/g, 'bg-[#FFCBA4]/40');
    content = content.replace(/bg-pink-600\/20/g, 'bg-[#0F0F0F]/5');
    
    // Card in auth
    content = content.replace(/bg-white\/10 backdrop-blur-xl border border-white\/20 rounded-2xl shadow-2xl p-6/g, 'bg-white border border-[#FFCBA4]/30 rounded-2xl shadow-2xl p-6');
    content = content.replace(/bg-white\/10 backdrop-blur-xl border border-white\/20 rounded-2xl shadow-2xl p-8/g, 'bg-white border border-[#FFCBA4]/30 rounded-2xl shadow-2xl p-8');
    
    // Labels & Text in Auth
    content = content.replace(/text-white\/80/g, 'text-[#0F0F0F]/80');
    content = content.replace(/text-white\/60 text-sm font-normal/g, 'text-[#0F0F0F]/60 text-sm font-normal');
    content = content.replace(/text-white\/60/g, 'text-[#0F0F0F]/60');
    content = content.replace(/text-white\/50/g, 'text-[#0F0F0F]/50');
    content = content.replace(/text-white\/40/g, 'text-[#0F0F0F]/40');
    content = content.replace(/text-white\/30/g, 'text-[#0F0F0F]/30');
    content = content.replace(/text-white/g, 'text-[#0F0F0F]');
    content = content.replace(/bg-white\/10 border-white\/20 text-white placeholder:text-white\/30/g, 'bg-transparent border-[#FFCBA4]/40 text-[#0F0F0F] placeholder:text-[#0F0F0F]/30');
    
    // Welcome backs / headers in auth
    content = content.replace(/text-3xl font-bold text-[#0F0F0F] tracking-tight/g, 'text-3xl font-poppins font-black text-[#0F0F0F] tracking-tight');
    content = content.replace(/text-2xl font-bold text-[#0F0F0F]/g, 'text-2xl font-poppins font-black text-[#0F0F0F]');

    // Logos in auth
    content = content.replace(/bg-gradient-to-br from-violet-500 to-pink-500 shadow-lg shadow-violet-500\/30/g, 'bg-[#0F0F0F] shadow-md');
    content = content.replace(/text-[#0F0F0F] font-bold text-xl/g, 'text-[#FFCBA4] font-poppins font-bold text-lg');

    // Buttons
    content = content.replace(/bg-gradient-to-r from-violet-600 to-pink-600 text-[#0F0F0F] font-semibold text-sm hover:from-violet-500 hover:to-pink-500 transition-all duration-200 shadow-lg shadow-violet-500\/30/g, 'bg-[#FFCBA4] text-[#0F0F0F] font-poppins font-bold text-sm hover:bg-[#F5A97F] transition-all duration-200 shadow-lg shadow-[#FFCBA4]/40');
    content = content.replace(/focus:border-violet-400 focus:ring-2 focus:ring-violet-400\/30/g, 'focus:border-[#FFCBA4] focus:ring-2 focus:ring-[#FFCBA4]/30');
    content = content.replace(/text-violet-300 hover:text-[#0F0F0F]/g, 'text-[#0F0F0F] hover:text-[#0F0F0F]/70');
    content = content.replace(/text-violet-500 focus:ring-violet-400\/40/g, 'text-[#0F0F0F] focus:ring-[#0F0F0F]/40');

    // Email Verify icons
    content = content.replace(/bg-white\/5 border border-white\/10/g, 'bg-[#FFF8F3] border border-[#FFCBA4]/30');
    content = content.replace(/stroke="rgba\(255,255,255,0.1\)"/g, 'stroke="rgba(15,15,15,0.1)"');
    // Wait, let's fix the white text back if we replaced too broadly in some specific cases, but text-[#0F0F0F] works well.

    // --- DASHBOARD HEROES ---
    // Hero welcome
    content = content.replace(/bg-gradient-to-br from-violet-600 via-indigo-600 to-pink-500 p-8 text-[#0F0F0F]/g, 'bg-[#0F0F0F] border border-white/10 p-8 text-white');
    content = content.replace(/bg-gradient-to-br from-violet-600 via-indigo-600 to-pink-500 p-8 text-white/g, 'bg-[#0F0F0F] border border-white/10 p-8 text-white');
    content = content.replace(/bg-white\/15 border border-white\/25 backdrop-blur-sm px-4 py-2 text-sm font-semibold text-[#0F0F0F]/g, 'bg-white/15 border border-white/25 backdrop-blur-sm px-4 py-2 text-sm font-semibold text-white');
    
    // Let's protect text-white inside black components
    // If the component has hero, maybe it's fine.

    // Dashboard Cards bg-gradients
    content = content.replace(/from-violet-50 to-indigo-50/g, 'from-white to-white');
    content = content.replace(/from-slate-50 to-violet-50/g, 'from-white to-white');
    content = content.replace(/from-slate-50 to-indigo-50/g, 'from-white to-white');
    content = content.replace(/from-slate-50 to-pink-50/g, 'from-white to-white');
    content = content.replace(/from-indigo-50 to-violet-50/g, 'from-white to-white');
    content = content.replace(/from-pink-50 to-rose-50/g, 'from-white to-white');
    
    // Stats cards
    content = content.replace(/from-violet-50 to-purple-50/g, 'from-white to-white');
    content = content.replace(/from-violet-500 to-purple-600/g, 'from-[#0F0F0F] to-[#1A1A2E]');
    content = content.replace(/text-violet-700/g, 'text-[#0F0F0F]');
    content = content.replace(/border-violet-200/g, 'border-[#FFCBA4]/30');
    content = content.replace(/border-indigo-100/g, 'border-[#FFCBA4]/30');
    content = content.replace(/border-violet-100/g, 'border-[#FFCBA4]/30');
    content = content.replace(/border-pink-100/g, 'border-[#FFCBA4]/30');
    content = content.replace(/from-indigo-500 to-violet-600/g, 'from-[#0F0F0F] to-[#1A1A2E]');
    content = content.replace(/from-pink-500 to-rose-600/g, 'from-[#FFCBA4] to-[#F5A97F]');
    
    // Text and icons
    content = content.replace(/text-violet-600/g, 'text-[#0F0F0F]');
    content = content.replace(/text-indigo-600/g, 'text-[#0F0F0F]');
    content = content.replace(/text-pink-500/g, 'text-[#F5A97F]');
    content = content.replace(/from-violet-100 to-indigo-100/g, 'from-[#FFCBA4]/20 to-[#FFCBA4]/20');
    content = content.replace(/from-violet-600 to-indigo-600/g, 'from-[#0F0F0F] to-[#1A1A2E]');
    content = content.replace(/focus:ring-violet-400/g, 'focus:ring-[#FFCBA4]');

    if (content !== original) {
        fs.writeFileSync(file, content);
        console.log("Updated", file);
    }
}

files.forEach(refactorFile);
