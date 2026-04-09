const apiBase = 'http://localhost:3000/api/projects';

function qS(params){
  return Object.keys(params)
    .filter(k=>params[k]!==undefined && params[k]!==null && params[k]!=="")
    .map(k=>encodeURIComponent(k)+"="+encodeURIComponent(params[k]))
    .join('&');
}

async function doSearch(){
  const q = document.getElementById('q').value.trim();
  const category = document.getElementById('category').value;
  const difficulty = document.getElementById('difficulty').value;
  const department = document.getElementById('department').value;
  const status = document.getElementById('status').value;

  const params = {};
  if(q) params.q = q;
  if(category) params.category = category;
  if(difficulty) params.difficulty = difficulty;
  if(department) params.department = department;
  if(status) params.status = status;

  const url = apiBase + '/search' + (Object.keys(params).length?('?'+qS(params)):'');

  const resultsEl = document.getElementById('results');
  resultsEl.innerHTML = '<p class="muted">Loading…</p>';

  try{
    const res = await fetch(url);
    if(!res.ok) throw new Error(res.statusText);
    const data = await res.json();
    renderResults(data.results);
  }catch(err){
    resultsEl.innerHTML = `<p class="muted">Error: ${err.message}</p>`;
  }
}

function renderResults(list){
  const resultsEl = document.getElementById('results');
  if(!list || !list.length){
    resultsEl.innerHTML = '<p class="muted">No results found.</p>';
    return;
  }

  resultsEl.innerHTML = list.map(p=>{
    return `
      <article class="project">
        <strong>${escapeHtml(p.title)}</strong>
        <div class="meta">${escapeHtml(p.description)}<br/>Category: ${p.category} • Difficulty: ${p.difficulty} • Department: ${p.department} • Status: ${p.status}</div>
      </article>
    `;
  }).join('');
}

function escapeHtml(s){
  if(!s) return '';
  return String(s).replace(/[&<>"']/g, c=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"
  })[c]);
}

document.getElementById('searchBtn').addEventListener('click', doSearch);
document.getElementById('clearBtn').addEventListener('click', ()=>{
  document.getElementById('q').value='';
  document.getElementById('category').value='';
  document.getElementById('difficulty').value='';
  document.getElementById('department').value='';
  document.getElementById('status').value='';
  document.getElementById('results').innerHTML = '<p class="muted">No search performed yet.</p>';
});
