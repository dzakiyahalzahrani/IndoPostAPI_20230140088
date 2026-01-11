const token = localStorage.getItem('token');
if (!token) location.href = 'login.html';

const API = 'http://localhost:5000/dashboard/api-keys';
const tbody = document.querySelector('#apiKeyTable tbody');

async function loadKeys(){
  const res = await fetch(API,{
    headers:{ Authorization:`Bearer ${token}` }
  });
  const data = await res.json();

  if (!data.length){
    tbody.innerHTML = `
      <tr><td colspan="5" class="empty">Belum ada API Key</td></tr>
    `;
    return;
  }

  tbody.innerHTML = data.map(k=>`
    <tr>
      <td>${k.name}</td>
      <td><code>${k.key}</code></td>
      <td>${k.is_active ? 'Active' : 'Revoked'}</td>
      <td>${new Date(k.created_at).toLocaleString()}</td>
      <td>
  <div class="actions">
    <button class="icon-btn" onclick="copyKey('${k.key}')" title="Copy API Key">
      Copy
    </button>
    <button class="icon-btn danger" onclick="deleteKey(${k.id})" title="Delete API Key">
      Delete
    </button>
  </div>
</td>

    </tr>
  `).join('');
}

function copyKey(key){
  navigator.clipboard.writeText(key);

  const toast = document.createElement('div');
  toast.textContent = 'API Key disalin';
  toast.style.position = 'fixed';
  toast.style.bottom = '20px';
  toast.style.right = '20px';
  toast.style.background = '#111827';
  toast.style.color = '#fff';
  toast.style.padding = '10px 14px';
  toast.style.borderRadius = '8px';
  toast.style.fontSize = '14px';
  toast.style.zIndex = 9999;

  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 1500);
}



async function deleteKey(id){
  const ok = confirm('Yakin ingin hapus API Key ini?');
  if (!ok) return;

  const res = await fetch(`${API}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    const err = await res.json();
    alert(err.message || 'Gagal menghapus API key');
    return;
  }

  loadKeys();
}



async function createKey(){
  const name = prompt('Nama API Key');
  if (!name) return;

  const res = await fetch(API,{
    method:'POST',
    headers:{
      'Content-Type':'application/json',
      Authorization:`Bearer ${token}`
    },
    body:JSON.stringify({ name })
  });

  const data = await res.json();
  alert('API Key dibuat:\n' + data.api_key);
  loadKeys();
}

loadKeys();
