/* =======================
   BASE
======================= */
const BASE = "/admin";

/* =======================
   ELEMENTS
======================= */
const userTable = document.getElementById("userTable");
const userSelect = document.getElementById("userSelect");
const historyTable = document.getElementById("historyTable");
const apiKeyResult = document.getElementById("apiKeyResult");

const prov = document.getElementById("prov");
const kab = document.getElementById("kab");
const kec = document.getElementById("kec");
const desa = document.getElementById("desa");
const kodepos = document.getElementById("kodepos");

const apiKeyTable = document.getElementById("apiKeyTable");

/* =======================
   NAVIGATION
======================= */
document.querySelectorAll(".nav").forEach(btn => {
  btn.onclick = () => {
    const pageId = btn.dataset.page;
    const page = document.getElementById(pageId);

    // ⛔ kalau page ga ada, STOP (biar JS lain tetap jalan)
    if (!page) return;

    document.querySelectorAll(".nav").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));

    btn.classList.add("active");
    page.classList.add("active");

    if (pageId === "users") loadUsers();
    if (pageId === "apikey") loadApiKeys();
    if (pageId === "history") loadHistory();
  };
});


/* =======================
   USERS
======================= */
function loadUsers() {
  const userTable = document.getElementById("userTable");
  const userSelect = document.getElementById("userSelect");

  if (!userTable) return; // ⛔ stop kalau bukan di page users

  fetch(BASE + "/users")
    .then(r => r.json())
    .then(d => {
      userTable.innerHTML = "";
      if (userSelect) userSelect.innerHTML = "";

      d.forEach(u => {
        userTable.innerHTML += `
<tr>
  <td>${u.id}</td>
  <td>${u.full_name}</td>
  <td>${u.organization ?? "-"}</td>
  <td>${u.email}</td>
  <td>${u.api_key_count ?? 0}</td>
  <td class="action-cell">
    <div class="action-actions">
      <button class="btn-edit btn-action"
        onclick="editUser(${u.id}, '${u.full_name}', '${u.organization}', '${u.email}')">
        Edit
      </button>
      <button class="btn-delete btn-action"
        onclick="deleteUser(${u.id})">
        Delete
      </button>
    </div>
  </td>
</tr>
`;

      });
    });
}



function editUser(id, namaLama, instansiLama, emailLama) {
  const nama = prompt("Nama Lengkap", namaLama);
  const instansi = prompt("Instansi", instansiLama);
  const email = prompt("Email", emailLama);

  if (!nama || !instansi || !email) return;

  fetch(BASE + "/users/" + id, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nama, instansi, email })
  }).then(() => loadUsers());
}

function deleteUser(id) {
  if (!confirm("Yakin hapus user ini?")) return;

  fetch(BASE + "/users/" + id, {
    method: "DELETE"
  }).then(() => loadUsers());
}

/* =======================
   API KEY
======================= */
function generateKey() {
  fetch(BASE + "/apikey", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userSelect.value })
  })
    .then(r => r.json())
    .then(d => {
      apiKeyResult.textContent = d.api_key;
    });
}

/* =======================
   HISTORY
======================= */
function loadHistory() {
  fetch("/admin/history")
    .then(r => r.json())
    .then(d => {
      historyTable.innerHTML = "";

      d.forEach(h => {
        console.log(h); // ⬅️ PENTING buat debug

        historyTable.innerHTML += `
          <tr>
            <td>${h.email ?? "-"}</td>
            <td>${h.endpoint}</td>
            <td>${h.created_at}</td>
            <td>
              <button
                class="btn-delete btn-action"
                onclick="deleteHistory(${h.id})"
              >
                Delete
              </button>
            </td>
          </tr>
        `;
      });
    });
}



/* =======================
   WILAYAH
======================= */



function loadApiKeys() {
  const table = document.getElementById("apiKeyTable");
  if (!table) return;

  fetch("/admin/apikeys")
    .then(r => r.json())
    .then(d => {
      table.innerHTML = "";

      d.forEach(k => {
        table.innerHTML += `
          <tr>
            <td>${k.email}</td>
            <td>${maskKey(k.key)}</td>
            <td>${k.is_active ? "Aktif" : "Nonaktif"}</td>
            <td>${k.usage_count}</td>
            <td>${k.last_used_at ?? "-"}</td>
            <td>
              <div class="action-actions">
                <button class="btn-edit btn-action"
                  onclick="toggleKey(${k.id})">
                  ${k.is_active ? "Disable" : "Enable"}
                </button>
                <button class="btn-delete btn-action"
                  onclick="revokeKey(${k.id})">
                  Delete
                </button>
              </div>
            </td>
          </tr>
        `;
      });
    });
}

function maskKey(key) {
  return key.slice(0, 6) + "••••••••" + key.slice(-4);
}


function toggleKey(id) {
  fetch(`/admin/apikey/${id}/toggle`, {
    method: "PATCH",
    headers: {
      "Authorization": "Bearer ADMIN123"
    }
  }).then(() => loadApiKeys());
}


function revokeKey(id) {
  if (!confirm("Yakin hapus API key ini?")) return;

  fetch(`/admin/apikey/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": "Bearer ADMIN123"
    }
  }).then(() => loadApiKeys());
}

function deleteHistory(id) {
  if (!confirm("Hapus history ini?")) return;

  fetch(`/admin/history/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": "Bearer ADMIN123"
    }
  }).then(() => loadHistory());
}

function runPlayground() {
  const type = document.getElementById("playType").value;
  const param = document.getElementById("playParam").value.trim();
  const apiKey = document.getElementById("playApiKey").value.trim();
  const result = document.getElementById("playResult");

  if (!apiKey) {
    result.textContent = "API Key wajib diisi";
    return;
  }

  let url = `/api/${type}`;

  if (param) {
    if (type === "regencies") url += `?province_code=${param}`;
    if (type === "districts") url += `?regency_code=${param}`;
    if (type === "villages") url += `?district_code=${param}`;
  }

  result.textContent = "Loading...";

  fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}` // 🔥 INI PENTING
    }
  })
    .then(res => res.json())
    .then(data => {
      result.textContent = JSON.stringify(data, null, 2);
    })
    .catch(err => {
      result.textContent = err.message;
    });
}




/* =======================
   LOGOUT
======================= */
function logout() {
  localStorage.clear();
  sessionStorage.clear();
  window.location.href = "/login.html";
}

/* =======================
   LOAD DEFAULT
======================= */
loadUsers();

