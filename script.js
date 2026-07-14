// ==========================================
// 1. STATE & INITIALIZATION
// ==========================================
let halamanAktif = 'Produktif'; 
let hariAktif = dapatkanHariSekarang(); 

const matapelajaran = document.getElementById('mataPelajaran');
const namaguru = document.getElementById('nama-guru');
const jampertama = document.getElementById('jam-pertama');
const jamkedua = document.getElementById('jam-kedua');
const inputhari = document.getElementById('hari');
const editIdInput = document.getElementById('edit-id');
const tombolSimpan = document.getElementById('btn-simpan');
const tombolBatal = document.getElementById('btn-batal');
const daftarJadwalUl = document.getElementById('daftar-jadwal-ul');
const subHeader = document.getElementById('sub-header');

// Inisialisasi Data Dummy (Tetap aman tersimpan di localStorage saat offline)
function inisialisasiDataAwal() {
    if (!localStorage.getItem('jadwalProduktif')) {
        const dummyProduktif = [
            { id: 1, hari: 'Senin', mataPelajaran: 'Pemrograman Web', namaGuru: 'Pak Budi', jamMulai: '07:00', jamSelesai: '09:00' },
            { id: 2, hari: 'Senin', mataPelajaran: 'Basis Data', namaGuru: 'Bu Ani', jamMulai: '09:00', jamSelesai: '11:00' }
        ];
        localStorage.setItem('jadwalProduktif', JSON.stringify(dummyProduktif));
    }
    
    if (!localStorage.getItem('jadwalTeori')) {
        const dummyTeori = [
            { id: 3, hari: 'Selasa', mataPelajaran: 'Matematika', namaGuru: 'Bu Sri', jamMulai: '07:30', jamSelesai: '09:40' }
        ];
        localStorage.setItem('jadwalTeori', JSON.stringify(dummyTeori));
    }
}

function dapatkanHariSekarang() {
    const hariInggris = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const indexHari = new Date().getDay();
    return (indexHari === 0 || indexHari === 6) ? 'Senin' : hariInggris[indexHari];
}

// ==========================================
// 2. LOGIKA STORAGE & CRUD
// ==========================================
function getStorageKey() {
    return halamanAktif === 'Produktif' ? 'jadwalProduktif' : 'jadwalTeori';
}

function ambilSemuaJadwal() {
    const key = getStorageKey();
    return JSON.parse(localStorage.getItem(key)) || [];
}

function simpanJadwal() {
    const key = getStorageKey();
    let daftarJadwal = ambilSemuaJadwal();
    
    const idValue = editIdInput.value;
    const mapel = matapelajaran.value.trim();
    const namaGuru = namaguru.value.trim();
    const jamMulai = jampertama.value.trim();
    const jamSelesai = jamkedua.value.trim();
    const namaHari = inputhari.value;

    if (!mapel || !namaGuru || !jamMulai || !jamSelesai) {
        alert('Mohon isi seluruh form jadwal!');
        return;
    }

    if (idValue) {
        // UPDATE
        daftarJadwal = daftarJadwal.map(jadwal => {
            if (jadwal.id === parseInt(idValue)) {
                return { ...jadwal, hari: namaHari, mataPelajaran: mapel, namaGuru: namaGuru, jamMulai: jamMulai, jamSelesai: jamSelesai };
            }
            return jadwal;
        });
    } else {
        // CREATE
        let jadwalBaru = {
            id: Date.now(),
            hari: namaHari,
            mataPelajaran: mapel,
            namaGuru: namaGuru,
            jamMulai: jamMulai,
            jamSelesai: jamSelesai
        };
        daftarJadwal.push(jadwalBaru);
    }

    localStorage.setItem(key, JSON.stringify(daftarJadwal));
    resetForm();
    renderTampilan();
}

function hapusJadwal(id) {
    if (confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) {
        const key = getStorageKey();
        let daftarJadwal = ambilSemuaJadwal();
        daftarJadwal = daftarJadwal.filter(jadwal => jadwal.id !== id);
        localStorage.setItem(key, JSON.stringify(daftarJadwal));
        renderTampilan();
    }
}

function picuEditJadwal(id) {
    const daftarJadwal = ambilSemuaJadwal();
    const jadwal = daftarJadwal.find(item => item.id === id);

    if (jadwal) {
        editIdInput.value = jadwal.id;
        matapelajaran.value = jadwal.mataPelajaran;
        namaguru.value = jadwal.namaGuru;
        jampertama.value = jadwal.jamMulai;
        jamkedua.value = jadwal.jamSelesai;
        inputhari.value = jadwal.hari;

        tombolSimpan.innerText = 'Simpan Perubahan';
        tombolBatal.style.display = 'inline-block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function resetForm() {
    editIdInput.value = '';
    matapelajaran.value = '';
    namaguru.value = '';
    jampertama.value = '';
    jamkedua.value = '';
    tombolSimpan.innerText = 'Tambahkan Jadwal';
    tombolBatal.style.display = 'none';
}

// ==========================================
// 3. RENDER TAMPILAN WIDGET
// ==========================================
function renderTampilan() {
    const semuaJadwal = ambilSemuaJadwal();
    daftarJadwalUl.innerHTML = '';

    let jadwalHariIni = semuaJadwal.filter(jadwal => jadwal.hari.toLowerCase() === hariAktif.toLowerCase());
    jadwalHariIni.sort((a, b) => a.jamMulai.localeCompare(b.jamMulai));

    if (jadwalHariIni.length === 0) {
        daftarJadwalUl.innerHTML = `
            <div class="jadwal-kosong">
                <h3>Belum ada jadwal ${halamanAktif}</h3>
                <p>Tidak ada jadwal pelajaran di hari <strong>${hariAktif}</strong>. Tambahkan jadwal baru melalui form di atas.</p>
            </div>
        `;
        updateIndikatorAktif();
        return;
    }

    jadwalHariIni.forEach(jadwal => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="penjelasan-kiri">
                <h3>${jadwal.mataPelajaran}</h3>
                <p class="guru">👨‍🏫 Guru: ${jadwal.namaGuru}</p>
            </div>
            <div class="penjelasan-kanan">
                <p class="jam-pelajaran">⏰ ${jadwal.jamMulai} - ${jadwal.jamSelesai}</p>
                <div class="edit-hapus">
                    <button style="background: white; color: var(--konten);" onclick="picuEditJadwal(${jadwal.id})">Edit</button>
                    <button style="background: #ff4d4d; color: white;" onclick="hapusJadwal(${jadwal.id})">Hapus</button>
                </div>
            </div>
        `;
        daftarJadwalUl.appendChild(li);
    });

    updateIndikatorAktif();
}

function updateIndikatorAktif() {
    subHeader.innerText = halamanAktif;
    
    document.querySelectorAll('#nav-hari button').forEach(btn => {
        if (btn.getAttribute('data-hari').toLowerCase() === hariAktif.toLowerCase()) {
            btn.classList.add('hari-aktif');
        } else {
            btn.classList.remove('hari-aktif');
        }
    });

    if (halamanAktif === 'Produktif') {
        document.getElementById('btn-produktif').classList.add('halaman-aktif');
        document.getElementById('btn-teori').classList.remove('halaman-aktif');
    } else {
        document.getElementById('btn-teori').classList.add('halaman-aktif');
        document.getElementById('btn-produktif').classList.remove('halaman-aktif');
    }
    
    inputhari.value = hariAktif;
}

// ==========================================
// 4. EVENT LISTENERS
// ==========================================
tombolSimpan.addEventListener('click', (e) => {
    e.preventDefault();
    simpanJadwal();
});

tombolBatal.addEventListener('click', (e) => {
    e.preventDefault();
    resetForm();
});

document.querySelectorAll('#nav-hari button').forEach(btn => {
    btn.addEventListener('click', () => {
        hariAktif = btn.getAttribute('data-hari');
        resetForm();
        renderTampilan();
    });
});

document.getElementById('btn-produktif').addEventListener('click', () => {
    halamanAktif = 'Produktif';
    resetForm();
    renderTampilan();
});

document.getElementById('btn-teori').addEventListener('click', () => {
    halamanAktif = 'Teori';
    resetForm();
    renderTampilan();
});

window.onload = () => {
    inisialisasiDataAwal();
    renderTampilan();
};

// ==========================================
// 5. REGISTRASI SERVICE WORKER (Fitur PWA Baru)
// ==========================================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Registrasi sw.js dengan scope path relative
    navigator.serviceWorker.register('./sw.js')
      .then((registration) => {
        console.log('PWA Service Worker berhasil diregistrasi dengan scope:', registration.scope);
      })
      .catch((error) => {
        console.error('Registrasi Service Worker gagal:', error);
      });
  });
}