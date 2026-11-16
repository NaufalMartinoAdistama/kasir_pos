USE `db_tokokita`;

-- 1. Ensure tbl_kategori exists
CREATE TABLE IF NOT EXISTS `tbl_kategori` (
  `id_kategori` INT(11) NOT NULL AUTO_INCREMENT,
  `nama_kategori` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id_kategori`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `tbl_kategori` (`id_kategori`, `nama_kategori`) VALUES
(1, 'Elektronik & Gadget'),
(2, 'Aksesoris Komputer'),
(3, 'Peralatan Kantor'),
(4, 'Makanan & Minuman'),
(5, 'Kebutuhan Harian')
ON DUPLICATE KEY UPDATE `nama_kategori` = VALUES(`nama_kategori`);

-- 2. Ensure tbl_produk exists
CREATE TABLE IF NOT EXISTS `tbl_produk` (
  `id_produk` INT(11) NOT NULL AUTO_INCREMENT,
  `id_kategori` INT(11) NOT NULL DEFAULT 1,
  `nama_produk` VARCHAR(150) NOT NULL,
  `harga` DECIMAL(12,2) NOT NULL,
  `stok` INT(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id_produk`),
  KEY `fk_produk_kategori` (`id_kategori`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `tbl_produk` (`id_produk`, `id_kategori`, `nama_produk`, `harga`, `stok`) VALUES
(1, 2, 'Mouse Wireless', 250000.00, 25),
(2, 2, 'Keyboard Mechanical', 350000.00, 15),
(3, 2, 'Mousepad Gaming', 50000.00, 30),
(4, 2, 'Headset Gaming', 500000.00, 8),
(5, 2, 'Flashdisk 64GB', 140000.00, 40),
(6, 1, 'Monitor LED 24 Inch IPS 75Hz', 1250000.00, 5),
(7, 3, 'Kertas HVS A4 80gr 1 Rim', 55000.00, 50),
(8, 4, 'Kopi Arabika Premium 250gr', 65000.00, 30),
(9, 2, 'Webcam Full HD 1080P with Mic', 220000.00, 12),
(10, 1, 'Speaker Bluetooth Portable Bass', 180000.00, 4)
ON DUPLICATE KEY UPDATE `nama_produk` = VALUES(`nama_produk`), `harga` = VALUES(`harga`);

-- 3. In tbl_detail_transaksi, add subtotal column if not exists
ALTER TABLE `tbl_detail_transaksi` ADD COLUMN IF NOT EXISTS `subtotal` DECIMAL(12,2) NULL;
ALTER TABLE `tbl_detail_transaksi` ADD COLUMN IF NOT EXISTS `id_produk` INT(11) NULL;
UPDATE `tbl_detail_transaksi` SET `subtotal` = `jumlah` * `harga` WHERE `subtotal` IS NULL;

-- 4. Ensure tbl_log exists
CREATE TABLE IF NOT EXISTS `tbl_log` (
  `id_log` INT(11) NOT NULL AUTO_INCREMENT,
  `tabel_terkait` VARCHAR(50) NOT NULL,
  `aksi` VARCHAR(50) NOT NULL,
  `deskripsi` TEXT NOT NULL,
  `waktu` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_log`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `tbl_log` (`id_log`, `tabel_terkait`, `aksi`, `deskripsi`, `waktu`) VALUES
(1, 'tbl_produk', 'INIT', 'Inisialisasi sistem inventaris toko db_tokokita.', NOW())
ON DUPLICATE KEY UPDATE `id_log` = VALUES(`id_log`);

-- 5. Stored Function: HitungTotalBersih
DROP FUNCTION IF EXISTS `HitungTotalBersih`;
DELIMITER //
CREATE FUNCTION `HitungTotalBersih`(
    p_harga DECIMAL(12,2),
    p_jumlah INT,
    p_diskon_persen DECIMAL(5,2)
) RETURNS DECIMAL(12,2)
DETERMINISTIC
BEGIN
    DECLARE v_kotor DECIMAL(12,2);
    DECLARE v_potongan DECIMAL(12,2);
    DECLARE v_bersih DECIMAL(12,2);

    SET v_kotor = p_harga * p_jumlah;
    SET v_potongan = v_kotor * (IFNULL(p_diskon_persen, 0) / 100);
    SET v_bersih = v_kotor - v_potongan;

    RETURN v_bersih;
END //
DELIMITER ;

-- 6. Stored Procedure: TambahTransaksiTerintegrasi
DROP PROCEDURE IF EXISTS `TambahTransaksiTerintegrasi`;
DELIMITER //
CREATE PROCEDURE `TambahTransaksiTerintegrasi`(
    IN p_id_pelanggan INT,
    IN p_id_produk INT,
    IN p_jumlah INT,
    IN p_diskon DECIMAL(5,2)
)
BEGIN
    DECLARE v_stok INT DEFAULT 0;
    DECLARE v_harga DECIMAL(12,2) DEFAULT 0;
    DECLARE v_nama_produk VARCHAR(150) DEFAULT '';
    DECLARE v_total_bersih DECIMAL(12,2) DEFAULT 0;
    DECLARE v_id_transaksi INT DEFAULT 0;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SELECT 'GAGAL' AS status, 'Terjadi kesalahan sistem saat memproses transaksi.' AS pesan, 0 AS id_transaksi;
    END;

    IF p_jumlah <= 0 THEN
        SELECT 'GAGAL' AS status, 'Jumlah barang harus lebih dari 0!' AS pesan, 0 AS id_transaksi;
    ELSE
        -- Mulai transaksi
        START TRANSACTION;

        -- Ambil data produk
        SELECT stok, harga, nama_produk INTO v_stok, v_harga, v_nama_produk 
        FROM tbl_produk 
        WHERE id_produk = p_id_produk 
        FOR UPDATE;

        IF v_harga IS NULL OR v_harga = 0 THEN
            ROLLBACK;
            SELECT 'GAGAL' AS status, 'Produk tidak ditemukan!' AS pesan, 0 AS id_transaksi;
        ELSEIF v_stok < p_jumlah THEN
            ROLLBACK;
            SELECT 'GAGAL' AS status, CONCAT('Stok tidak mencukupi! Sisa stok hanya ', v_stok) AS pesan, 0 AS id_transaksi;
        ELSE
            -- Hitung total bersih melalui Stored Function HitungTotalBersih
            SET v_total_bersih = HitungTotalBersih(v_harga, p_jumlah, p_diskon);

            -- Simpan ke tabel master transaksi
            INSERT INTO tbl_transaksi (tanggal, id_pelanggan, total_belanja)
            VALUES (NOW(), p_id_pelanggan, v_total_bersih);

            SET v_id_transaksi = LAST_INSERT_ID();

            -- Simpan detail transaksi (kompatibel penuh dengan tbl_detail_transaksi db_tokokita)
            INSERT INTO tbl_detail_transaksi (id_transaksi, id_produk, nama_produk, jumlah, harga, subtotal)
            VALUES (v_id_transaksi, p_id_produk, v_nama_produk, p_jumlah, v_harga, v_total_bersih);

            -- Kurangi stok produk
            UPDATE tbl_produk 
            SET stok = stok - p_jumlah 
            WHERE id_produk = p_id_produk;

            COMMIT;

            SELECT 'SUKSES' AS status, 'Transaksi berhasil diproses dan stok berhasil diperbarui.' AS pesan, v_id_transaksi AS id_transaksi;
        END IF;
    END IF;
END //
DELIMITER ;

-- 7. Trigger: after_update_stok_produk
DROP TRIGGER IF EXISTS `after_update_stok_produk`;
DELIMITER //
CREATE TRIGGER `after_update_stok_produk`
AFTER UPDATE ON `tbl_produk`
FOR EACH ROW
BEGIN
    IF OLD.stok <> NEW.stok THEN
        INSERT INTO `tbl_log` (`tabel_terkait`, `aksi`, `deskripsi`, `waktu`)
        VALUES (
            'tbl_produk',
            'UPDATE_STOK',
            CONCAT('Perubahan stok produk "', NEW.nama_produk, '" (ID: ', NEW.id_produk, ') dari ', OLD.stok, ' menjadi ', NEW.stok),
            NOW()
        );
    END IF;
END //
DELIMITER ;

-- 8. View: view_laporan_penjualan (kompatibel penuh dengan db_tokokita)
CREATE OR REPLACE VIEW `view_laporan_penjualan` AS
SELECT 
    t.id_transaksi,
    t.tanggal,
    p.id_pelanggan,
    p.nama_pelanggan,
    p.kota,
    COALESCE(pr.id_kategori, 1) AS id_kategori,
    COALESCE(k.nama_kategori, 'Aksesoris Komputer') AS nama_kategori,
    dt.id_detail,
    COALESCE(dt.id_produk, pr.id_produk, 1) AS id_produk,
    dt.nama_produk,
    dt.harga,
    dt.jumlah,
    COALESCE(dt.subtotal, dt.harga * dt.jumlah) AS subtotal,
    t.total_belanja
FROM tbl_transaksi t
JOIN tbl_pelanggan p ON t.id_pelanggan = p.id_pelanggan
JOIN tbl_detail_transaksi dt ON t.id_transaksi = dt.id_transaksi
LEFT JOIN tbl_produk pr ON dt.nama_produk = pr.nama_produk OR dt.id_produk = pr.id_produk
LEFT JOIN tbl_kategori k ON pr.id_kategori = k.id_kategori;
