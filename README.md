# NAUFAM MART POS & Inventory Management System 🏪

Aplikasi web modern **Sistem Informasi Penjualan Toko (Point of Sale & Inventory)** untuk **NAUFAM MART** yang lengkap, tangguh, dan siap pakai. Dibangun dengan tech stack **Laravel 12 + Inertia.js + React + Tailwind CSS** serta diintegrasikan secara mendalam dengan objek **SQL Lanjutan pada database `db_tokokita` (MySQL / MariaDB)**.

---

## 🌟 Fitur Utama Berdasarkan Role

Aplikasi ini menerapkan pembagian hak akses berbasis peran (*Role-Based Access Control*) yang diproteksi oleh middleware pada backend:

### 1. 🛡️ Role: ADMINISTRATOR (Akses Penuh)
- **Dashboard Toko:**
  - Kartu ringkasan statistik: Total Pendapatan Toko, Total Transaksi, Total Produk Katalog, dan Peringatan Stok Menipis (≤ 10 unit).
  - Grafik tren omset harian (7 hari terakhir).
  - Tabel transaksi penjualan terbaru dan daftar peringatan produk yang perlu segera di-restok.
- **Master Data (CRUD Lengkap):**
  - **Cabang Toko (`tbl_cabang`):** Tambah, lihat, edit, dan hapus data cabang toko ritel operasional.
  - **Kategori Produk (`tbl_kategori`):** Tambah, lihat, edit nama kategori, dan hapus.
  - **Produk, Stok & Barcode (`tbl_produk`):** Tambah produk baru, scan barcode pabrik, tombol **"Generate Barcode Otomatis"** (`PRD-YYYYMMDD-XXXX`), ubah harga, filter kategori, pencarian, dan pembaruan stok.
  - **Cetak Label Barcode Produk:** Halaman khusus untuk memilih produk dan mencetak stiker label barcode (Code128) multi-salinan dengan format grid siap cetak ke printer label/A4.
  - **Pelanggan & Member RFID (`tbl_pelanggan`):** Pendaftaran pelanggan, integrasi **USB RFID Reader (HID/Keyboard Wedge Mode)** dengan penangkapan UID otomatis dan pencegahan submit tak sengaja, pengelolaan poin loyalty, status member, serta fitur **"Cetak Kartu Member"** (tampilan elegan CR80 Biru-Putih siap cetak).
- **Laporan Penjualan Terintegrasi:**
  - Menampilkan data penjualan komprehensif langsung dari database view `view_laporan_penjualan` dan `view_transaksi_pelanggan`.
  - Filter rentang tanggal (`dari_tanggal` dan `sampai_tanggal`), kategori produk, dan pencarian kata kunci.
  - Kartu rekapitulasi: Total Omset Periode, Total Item Terjual, dan Jumlah Faktur Unik.
  - Fitur **Export CSV** untuk analisis spreadsheet dan **Cetak Laporan** (ramah format cetak/print-friendly).
- **Audit Log Aktivitas Terpadu (Database Triggers):**
  - Tab 1: Log Mutasi Stok (`tbl_log` via trigger `after_update_stok_produk`).
  - Tab 2: Log Pendaftaran & Hapus Pelanggan (`log_pelanggan` via trigger `after_insert_pelanggan` & `after_delete_pelanggan`).
  - Tab 3: Log Perubahan Nama Pelanggan (`log_perubahan_pelanggan` via trigger `after_update_pelanggan`).
- **Manajemen Pengguna (`users`):**
  - Kelola akun dengan role `admin` atau `kasir`.
  - Tambah pengguna baru, perbarui profil/role/password, dan hapus akun (dengan proteksi *self-deletion*).

---

### 2. 🛒 Role: KASIR (Operasional Penjualan)
- **Dashboard Kasir:**
  - Ringkasan transaksi kasir hari ini: Transaksi Hari Ini, Pendapatan Hari Ini, dan Status Sisa Stok Barang Siap Jual.
  - Tabel transaksi hari ini dan daftar 5 produk terlaris.
- **Halaman Transaksi Kasir (POS - Multi-Item Cart & Hardware Integration):**
  - **Integrasi Hardware RFID Member:** Kotak scan kartu member USB RFID Reader (Keyboard Wedge / HID Mode). Men-tap kartu otomatis mengidentifikasi member, memunculkan badge *"Member Terverifikasi"*, memutar bunyi chime sukses, dan otomatis mengaktifkan diskon member 5%.
  - **Integrasi Hardware Scanner Barcode & Kamera:** Input scan barcode yang selalu siap menerima tembakan scanner USB (`autoFocus`), ditambah tombol **"Scan via Kamera"** (`html5-qrcode`) untuk laptop/HP. Dilengkapi bunyi *beep* autentik POS via Web Audio API saat barang berhasil di-scan.
  - **Keranjang Belanja Multi-Item:** Kasir dapat menambahkan banyak produk sekaligus ke dalam satu transaksi penjualan.
  - Pemilihan pelanggan dengan modal cepat (*Quick Add Customer*) yang memanggil stored procedure `TambahPelanggan` dan mendukung tap RFID langsung.
  - Katalog produk interaktif dengan filter kategori, pencarian cepat, scan barcode (tombol `Enter`), informasi harga satuan, dan indikator sisa stok secara *real-time*. Produk habis tetap tampil dan memunculkan modal peringatan saat diklik.
  - Pengaturan kuantitas per item dengan tombol `+` / `-`, input angka manual, dan tombol hapus item dari keranjang.
  - Pilihan metode pembayaran: **Tunai**, **QRIS**, **Transfer Bank**, dan **Kartu Debit**.
  - Input uang diterima/bayar dengan tombol cepat nominal (`[Uang Pas]`, `[50rb]`, `[100rb]`, `[200rb]`, `[500rb]`).
  - Kalkulasi *real-time* di antarmuka React: Subtotal Kotor, Nilai Potongan Diskon, Total Bayar Bersih, dan Uang Kembalian.
  - Tombol **"PROSES TRANSAKSI (X Barang)"** dengan proteksi transaksi database atomic (ACID) dan pembaruan mutasi stok otomatis via trigger `after_update_stok_produk`.
  - Notifikasi modal status transaksi berhasil dengan rincian pembayaran dan tombol langsung cetak struk belanja thermal roll (`76mm auto`).
- **Riwayat Transaksi Penjualan:**
  - Melihat riwayat transaksi penjualan kasir dengan filter pencarian dan tanggal.
  - Modal detail rincian produk yang dibeli.
  - Tombol cetak ulang lembar struk transaksi.
- **Data Pelanggan & Member RFID:**
  - Melihat dan mendaftarkan pelanggan baru saat transaksi kasir berlangsung dengan input tap RFID, serta tombol cetak kartu member.
- **Monitoring Pesanan Online Pelanggan & Antar Pesanan:**
  - Tab khusus "Pesanan Online Pelanggan" pada riwayat transaksi.
  - Tampilan nomor WhatsApp pembeli dengan tombol direct chat `https://wa.me/...`.
  - Preview alamat pengiriman dan tombol navigasi GPS langsung **"Buka di Google Maps"** (`https://www.google.com/maps?q={lat},{lng}`).
  - Pengecekan foto bukti pembayaran dan tombol update status pesanan (`Diproses` -> `Dikirim` -> `Selesai`).
- **Cetak Lembar Struk / Nota Kasir:**
  - Tampilan struk belanja dengan layout *thermal paper* standar kasir (`76mm auto`, mepet ke atas tanpa sisa kertas kosong, hari/tanggal/jam real-time ticking clock, rincian diskon, dan metode pembayaran).

---

### 3. 🛍️ Role: PELANGGAN (Customer Portal / Online Ordering)
- **Autentikasi Fleksibel:**
  - **Pendaftaran Publik (Register Pelanggan):** Membuat akun `users` (`role = 'pelanggan'`) sekaligus otomatis membuat record di `tbl_pelanggan` (nama, kontak HP/WhatsApp, kota, alamat lengkap) yang langsung terhubung.
  - **Login Cepat via Tap Kartu Member RFID:** Tab khusus di halaman Login untuk pelanggan yang memiliki kartu RFID. Menempelkan kartu ke USB RFID Reader langsung membaca UID dan otomatis login (jika kartu baru dibuatkan di toko kasir, akun pengguna otomatis di-*generate* seketika).
- **Katalog Belanja Online & Keranjang Interaktif:**
  - Menampilkan katalog produk lengkap dengan foto barang, status stok, kategori, dan harga.
  - Keranjang belanja real-time (tersimpan di *localStorage*) dengan kontrol jumlah item `+` / `-`.
- **Form Pengiriman & Peta Interaktif (Leaflet + OpenStreetMap / GPS Geolocation):**
  - Pemilihan titik pengantaran akurat menggunakan peta interaktif tanpa wajib API key berbayar (fallback mulus Leaflet OSM & Geolocation browser).
  - Tombol *"📍 Gunakan Lokasi Saya Saat Ini"* yang otomatis mendeteksi koordinat GPS dan mengisi alamat.
  - Form alamat lengkap dan nomor HP / WhatsApp aktif untuk konfirmasi kurir.
- **Pembayaran Non-Tunai Wajib (100% Cashless) & Simulator Dinamis:**
  - Khusus pesanan online **TIDAK TERSEDIA opsi Tunai/COD** demi keamanan dan efisiensi.
  - **Simulator Pembayaran Interaktif Real-time:**
    1. **`QRIS`**: Render QR Code SVG dinamis via `qrcode.react`, merchant **TOKO KITA OFFICIAL**, NMID nasional, dan tombol simulasi scan & bayar sukses (disertai Web Audio chime).
    2. **`Transfer Bank`**: Pilihan bank terkemuka (BCA, BRI, Mandiri, BNI), nomor Virtual Account dummy (`8801 0812 3456 7890`), tombol *copy-to-clipboard*, countdown timer 15 menit, panduan transfer, dan tombol konfirmasi mutasi bank.
    3. **`Kartu Debit`**: Visualisasi kartu debit virtual 3D interaktif yang nomor, nama, dan masa berlakunya ikut berubah secara *live* saat diketik, deteksi otomatis brand (Visa/Mastercard/GPN), input CVV, serta simulasi otorisasi EDC online.
- **Pelacakan Status Pesanan Real-Time:**
  - Progress tracker tahapan: `Menunggu Pembayaran` ➔ `Diproses` ➔ `Dikirim` ➔ `Selesai`.
  - Rincian item belanja dan struk transaksi digital.
  - Tombol konfirmasi **"Pesanan Diterima ✅"** saat barang tiba di tujuan.

---

## 🗄️ Arsitektur Database `db_tokokita` & Objek SQL Lanjutan

Database aplikasi menggunakan **`db_tokokita`** (MySQL / MariaDB) yang disesuaikan secara presisi dengan struktur existing:

### 1. Struktur Tabel
| Nama Tabel | Kolom Utama | Deskripsi |
|---|---|---|
| `tbl_pelanggan` | `id_pelanggan` (PK), `nama_pelanggan`, `kota`, `no_hp`, `alamat_lengkap`, `latitude`, `longitude`, `kode_rfid`, `poin`, `status_member` | Data pelanggan toko, koordinat GPS, & integrasi kartu RFID Member |
| `tbl_cabang` | `id_cabang` (PK), `nama_cabang`, `kota` | Data cabang toko (Pusat, Timur, Selatan) |
| `tbl_transaksi` | `id_transaksi` (PK), `tanggal`, `id_pelanggan` (FK), `total_belanja`, `metode_pembayaran`, `bayar`, `kembalian`, `diskon`, `no_hp_penerima`, `alamat_pengiriman`, `latitude`, `longitude`, `bukti_pembayaran`, `status_pesanan`, `sumber_transaksi` | Master faktur penjualan toko POS Kasir & Pesanan Online |
| `tbl_detail_transaksi` | `id_detail` (PK), `id_transaksi` (FK), `id_produk`, `nama_produk`, `jumlah`, `harga`, `subtotal` | Rincian item per faktur |
| `tbl_kategori` | `id_kategori` (PK), `nama_kategori` | Klasifikasi kategori produk |
| `tbl_produk` | `id_produk` (PK), `id_kategori` (FK), `nama_produk`, `kode_barcode`, `harga`, `stok`, `foto` | Data katalog barang, barcode Code128, foto produk, harga & stok |
| `log_pelanggan` | `id_log` (PK), `aktivitas`, `id_pelanggan`, `waktu` | Log otomatis trigger pendaftaran/penghapusan pelanggan |
| `log_perubahan_pelanggan` | `id_log` (PK), `id_pelanggan`, `nama_lama`, `nama_baru`, `waktu` | Log otomatis trigger perubahan nama pelanggan |
| `tbl_log` | `id_log` (PK), `tabel_terkait`, `aksi`, `deskripsi`, `waktu` | Log mutasi stok otomatis dari trigger `after_update_stok_produk` |
| `users` | `id` (PK), `name`, `email`, `role`, `id_pelanggan` (FK), `password`, `created_at`, `updated_at` | Autentikasi dan otorisasi multi-role (`admin`, `kasir`, `pelanggan`) |

---

### 2. Objek SQL Lanjutan yang Digunakan di Backend

#### A. Database Views
- **`view_laporan_penjualan`:** Menghubungkan transaksi, pelanggan, dan rincian produk untuk laporan penjualan.
- **`view_transaksi_pelanggan`:** Rekap transaksi per pelanggan yang menampilkan tanggal dan total belanja.
- **`view_total_belanja`:** Agregasi total belanja dan jumlah transaksi per pelanggan.
- **`view_pelanggan`:** View proyeksi data pelanggan.

#### B. Stored Functions
- **`HitungTotal(harga, jumlah)`:** Menghitung total kotor `harga * jumlah`.
- **`HitungDiskon(harga, diskon)`:** Menghitung potongan diskon `harga * (diskon / 100)`.
- **`HitungPajak(harga)`:** Menghitung nilai PPN 11% `harga * 0.11`.
- **`KategoriBelanja(total)`:** Klasifikasi otomatis pelanggan:
  - `>= 1.000.000` ➔ `'Pelanggan Gold'`
  - `>= 500.000` ➔ `'Pelanggan Silver'`
  - Lainnya ➔ `'Pelanggan Reguler'`
- **`HitungTotalBersih(harga, jumlah, diskon)`:** Menghitung nilai bersih akhir setelah diskon.

#### C. Stored Procedures & TCL
- **`TambahTransaksiTerintegrasi(p_id_pelanggan, p_id_produk, p_jumlah, p_diskon)`:** Memproses checkout kasir dengan transaksi aman:
  - `START TRANSACTION` dan `SELECT ... FOR UPDATE` (mengunci baris stok produk).
  - Validasi stok: `ROLLBACK` dan hasilkan status `GAGAL` jika sisa stok tidak cukup.
  - Perhitungan total bersih, `INSERT` ke `tbl_transaksi` & `tbl_detail_transaksi`, pengurangan stok produk, dan `COMMIT`.
- **`TambahPelanggan(p_nama, p_kota)`:** Menyisipkan pelanggan baru ke `tbl_pelanggan`.
- **`LaporanTransaksi(p_id_pelanggan)`:** Menampilkan riwayat transaksi per pelanggan.
- **`CariPelanggan(p_id)`** & **`TampilPelanggan()`** & **`HitungPelanggan(OUT jumlah)`**.

#### D. Database Triggers
- **`after_insert_pelanggan`:** Otomatis mengisi `log_pelanggan` saat ada pelanggan baru.
- **`after_update_pelanggan`:** Otomatis mencatat perubahan nama ke `log_perubahan_pelanggan`.
- **`after_delete_pelanggan`:** Otomatis mencatat penghapusan ke `log_pelanggan`.
- **`before_insert_transaksi`:** Mencegah total belanja bernilai negatif.
- **`after_update_stok_produk`:** Otomatis mencatat mutasi stok ke `tbl_log`.

---

## 🚀 Panduan Instalasi & Menjalankan Aplikasi

### 1. Konfigurasi Database (`.env`)
Pastikan file `.env` mengarah ke database `db_tokokita`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=db_tokokita
DB_USERNAME=root
DB_PASSWORD=
```

---

### 2. Migrasi Tabel Pengguna & Seeding
Jalankan migrasi untuk tabel `users` (tidak akan menghapus atau mengubah tabel existing di `db_tokokita`):
```bash
php artisan migrate
php artisan db:seed
```

---

### 3. Instalasi Paket Tambahan & Kompilasi Frontend
Aplikasi menggunakan pustaka `react-barcode` untuk render label Code128 dan `html5-qrcode` untuk kamera:
```bash
npm install react-barcode html5-qrcode qrcode.react
npm run build
```

---

### 4. Perangkat Keras yang Didukung (Hardware Compatibility)
1. **USB RFID Reader (Keyboard Wedge / HID Mode):**
   - Kompatibel dengan semua USB RFID Reader standar (13.56 MHz Mifare / 125 kHz Proximity).
   - Reader otomatis mengetikkan UID kartu diikuti penekanan `Enter`.
   - Dilengkapi pencegahan submit tak sengaja pada form dan bunyi *chime* konfirmasi.
2. **USB Barcode Scanner & Kamera:**
   - Kompatibel dengan Barcode Scanner USB (1D/2D) mode keyboard wedge.
   - Kamera laptop / kamera smartphone (`html5-qrcode`) untuk memindai barcode fisik barang.
   - Dilengkapi efek suara *beep* autentik POS berbasis Web Audio API.
3. **Printer Stiker & Printer Struk:**
   - Format standar stiker label barcode produk (grid siap cetak).
   - Format standar kartu member CR80 (85.6mm x 54mm).
   - Format roll kertas thermal kasir (76mm auto, mepet atas tanpa buang kertas).

---

### 5. Konfigurasi Payment Gateway Duitku POP (Mode Sandbox)
Aplikasi terintegrasi dengan Payment Gateway **Duitku POP** untuk transaksi non-tunai (Online Pelanggan & POS Kasir).
Tambahkan variabel berikut ke file `.env`:
```env
DUITKU_MERCHANT_CODE=DS_ISI_KODE_MERCHANT_ANDA
DUITKU_API_KEY=0cb262188382a3affb1013e80358f1fa
DUITKU_IS_PRODUCTION=false
DUITKU_CALLBACK_URL="${APP_URL}/duitku/callback"
DUITKU_RETURN_URL="${APP_URL}/pelanggan/pesanan"
```

- **Halaman Pelanggan (Online Ordering):** Wajib non-tunai (100% Cashless) via Duitku POP (QRIS, VA Bank, E-Wallet, Kartu Debit).
- **Halaman Kasir (POS):** Dual payment option:
  1. **Tunai / Cash:** Input nominal diterima, kalkulator kembalian otomatis, dan cetak struk kasir.
  2. **Non-Tunai (Duitku POP):** Menampilkan modal popup Duitku POP di layar kasir, sinkronisasi otomatis status lunas, dan langsung membuka struk nota belanja.

---

### 6. Menjalankan Server Aplikasi
Jalankan server pengembangan Laravel:
```bash
php artisan serve
```

Buka browser dan akses: **`http://localhost:8000`**

---

## 🔑 Kredensial Login Default

Gunakan akun default berikut untuk pengujian hak akses:

| Peran (Role) | Alamat Email | Password | Hak Akses Utama |
|---|---|---|---|
| **ADMINISTRATOR** | `admin@toko.com` | `password` | Akses penuh (Dashboard Admin, Master Cabang, Kategori, Produk, Pelanggan, Cetak Label Barcode, Laporan Penjualan, Audit Log Triggers, User Management) |
| **KASIR** | `kasir@toko.com` | `password` | Operasional kasir (Dashboard Kasir, Transaksi POS, Tap RFID Member, Scan Barcode / Kamera, Cetak Struk, Riwayat Kasir, Data Pelanggan) |
| **PELANGGAN** | `pelanggan@toko.com` | `password` | Portal pelanggan (Katalog Belanja, Keranjang, Pin Peta GPS Leaflet OSM, Simulator Pembayaran QRIS/VA/Debit, Tracking Pesanan) |

> 💡 **Tip:** Halaman login juga dilengkapi tombol *shortcut* demo untuk mengisi kredensial Admin, Kasir, atau Pelanggan dengan 1 kali klik, serta mendukung Login Tap Kartu RFID Member instan.
