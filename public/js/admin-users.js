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

/* =======================
   NAVIGATION
======================= */
document.querySelectorAll(".nav").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".nav").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));

    btn.classList.add("active");

    const pageId = btn.dataset.page;
    const pageEl = document.getElementById(pageId);

    if (!pageEl) {
      console.error("PAGE TIDAK DITEMUKAN:", pageId);
      return;
    }

    pageEl.classList.add("active");

    if (pageId === "users") loadUsers();
    if (pageId === "apikey") loadUsers();
    if (pageId === "history") loadHistory();
  };
});


/* =======================
   USERS
======================= */
function loadUsers() {
  fetch(BASE + "/users")
    .then(r => r.json())
    .then(d => {
      if (!Array.isArray(d)) {
        console.error("Response /admin/users bukan array:", d);
        return;
      }

      userTable.innerHTML = "";
      userSelect.innerHTML = "";

      d.forEach(u => {
        userTable.innerHTML += `
          <tr>
            <td>${u.id}</td>
            <td>${u.nama ?? "-"}</td>
            <td>${u.instansi ?? "-"}</td>
            <td>${u.email}</td>
            <td>${u.api_key_count ?? 0}</td>
            <td>
              <button class="btn btn-edit"
                onclick="editUser(${u.id}, '${u.nama ?? ""}', '${u.instansi ?? ""}', '${u.email}')">
                Edit
              </button>
              <button class="btn btn-delete"
                onclick="deleteUser(${u.id})">
                Hapus
              </button>
            </td>
          </tr>
        `;

        userSelect.innerHTML += `
          <option value="${u.id}">${u.email}</option>
        `;
      });
    })
    .catch(err => console.error("loadUsers error:", err));
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
  fetch(BASE + "/history")
    .then(r => r.json())
    .then(d => {
      if (!Array.isArray(d)) return;

      historyTable.innerHTML = "";
      d.forEach(h => {
        historyTable.innerHTML += `
          <tr>
            <td>${h.email}</td>
            <td>${h.endpoint}</td>
            <td>${h.created_at}</td>
          </tr>
        `;
      });
    });
}

/* =======================
   WILAYAH
======================= */
function insertWilayah(e) {
  e.preventDefault();

  fetch(BASE + "/wilayah", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prov: prov.value,
      kab: kab.value,
      kec: kec.value,
      desa: desa.value,
      kodepos: kodepos.value
    })
  }).then(() => {
    alert("Wilayah berhasil ditambahkan");
    e.target.reset();
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
   INIT
======================= */
document.addEventListener("DOMContentLoaded", () => {
  loadUsers();
});
