-- Database: db_toko_proyek
CREATE DATABASE IF NOT EXISTS `db_toko_proyek` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `db_toko_proyek`;

-- 1. Table tbl_pelanggan
CREATE TABLE IF NOT EXISTS `tbl_pelanggan` (
  `id_pelanggan` INT(11) NOT NULL AUTO_INCREMENT,
  `nama_pelanggan` VARCHAR(100) NOT NULL,
  `kota` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id_pelanggan`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 2. Table tbl_kategori
CREATE TABLE IF NOT EXISTS `tbl_kategori` (
  `id_kategori` INT(11) NOT NULL AUTO_INCREMENT,
  `nama_kategori` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id_kategori`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 3. Table tbl_produk
CREATE TABLE IF NOT EXISTS `tbl_produk` (
  `id_produk` INT(11) NOT NULL AUTO_INCREMENT,
  `id_kategori` INT(11) NOT NULL,
  `nama_produk` VARCHAR(150) NOT NULL,
  `harga` DECIMAL(12,2) NOT NULL,
  `stok` INT(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id_produk`),
  KEY `fk_produk_kategori` (`id_kategori`),
  CONSTRAINT `fk_produk_kategori` FOREIGN KEY (`id_kategori`) REFERENCES `tbl_kategori` (`id_kategori`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 4. Table tbl_transaksi
CREATE TABLE IF NOT EXISTS `tbl_transaksi` (
  `id_transaksi` INT(11) NOT NULL AUTO_INCREMENT,
  `tanggal` DATE NOT NULL,
  `id_pelanggan` INT(11) NOT NULL,
  `total_belanja` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id_transaksi`),
  KEY `fk_transaksi_pelanggan` (`id_pelanggan`),
  CONSTRAINT `fk_transaksi_pelanggan` FOREIGN KEY (`id_pelanggan`) REFERENCES `tbl_pelanggan` (`id_pelanggan`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 5. Table tbl_detail_transaksi
CREATE TABLE IF NOT EXISTS `tbl_detail_transaksi` (
  `id_detail` INT(11) NOT NULL AUTO_INCREMENT,
  `id_transaksi` INT(11) NOT NULL,
  `id_produk` INT(11) NOT NULL,
  `jumlah` INT(11) NOT NULL,
  `subtotal` DECIMAL(12,2) NOT NULL,
  PRIMARY KEY (`id_detail`),
  KEY `fk_detail_transaksi` (`id_transaksi`),
  KEY `fk_detail_produk` (`id_produk`),
  CONSTRAINT `fk_detail_transaksi` FOREIGN KEY (`id_transaksi`) REFERENCES `tbl_transaksi` (`id_transaksi`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_detail_produk` FOREIGN KEY (`id_produk`) REFERENCES `tbl_produk` (`id_produk`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 6. Table tbl_log
CREATE TABLE IF NOT EXISTS `tbl_log` (
  `id_log` INT(11) NOT NULL AUTO_INCREMENT,
  `tabel_terkait` VARCHAR(50) NOT NULL,
  `aksi` VARCHAR(50) NOT NULL,
  `deskripsi` TEXT NOT NULL,
  `waktu` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_log`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- -------------------------------------------------------------
-- Seed Initial Data
-- -------------------------------------------------------------
INSERT INTO `tbl_pelanggan` (`id_pelanggan`, `nama_pelanggan`, `kota`) VALUES
(1, 'Andi Wijaya', 'Surabaya'),
(2, 'Budi Santoso', 'Jakarta'),
(3, 'Citra Lestari', 'Bandung'),
(4, 'Dewi Sartika', 'Semarang'),
(5, 'Eko Prasetyo', 'Yogyakarta')
ON DUPLICATE KEY UPDATE `nama_pelanggan` = VALUES(`nama_pelanggan`);

INSERT INTO `tbl_kategori` (`id_kategori`, `nama_kategori`) VALUES
(1, 'Elektronik & Gadget'),
(2, 'Aksesoris Komputer'),
(3, 'Peralatan Kantor'),
(4, 'Makanan & Minuman'),
(5, 'Kebutuhan Harian')
ON DUPLICATE KEY UPDATE `nama_kategori` = VALUES(`nama_kategori`);

INSERT INTO `tbl_produk` (`id_produk`, `id_kategori`, `nama_produk`, `harga`, `stok`) VALUES
(1, 2, 'Mouse Wireless Silent Click', 150000.00, 25),
(2, 2, 'Keyboard Mechanical RGB Blue Switch', 350000.00, 15),
(3, 2, 'Headset Gaming 7.1 Surround', 450000.00, 8),
(4, 1, 'Monitor LED 24 Inch IPS 75Hz', 1250000.00, 5),
(5, 2, 'Flashdisk 64GB USB 3.0', 75000.00, 40),
(6, 3, 'Kertas HVS A4 80gr 1 Rim', 55000.00, 50),
(7, 4, 'Kopi Arabika Premium 250gr', 65000.00, 30),
(8, 2, 'Webcam Full HD 1080P with Mic', 220000.00, 12),
(9, 2, 'Mousepad Gaming XL Speed', 60000.00, 20),
(10, 1, 'Speaker Bluetooth Portable Bass', 180000.00, 4)
ON DUPLICATE KEY UPDATE `nama_produk` = VALUES(`nama_produk`);

-- Transaksi Awal Contoh
INSERT INTO `tbl_transaksi` (`id_transaksi`, `tanggal`, `id_pelanggan`, `total_belanja`) VALUES
(1, '2026-11-10', 1, 300000.00),
(2, '2026-11-12', 2, 350000.00),
(3, '2026-11-14', 3, 427500.00)
ON DUPLICATE KEY UPDATE `id_transaksi` = VALUES(`id_transaksi`);

INSERT INTO `tbl_detail_transaksi` (`id_detail`, `id_transaksi`, `id_produk`, `jumlah`, `subtotal`) VALUES
(1, 1, 1, 2, 300000.00),
(2, 2, 2, 1, 350000.00),
(3, 3, 3, 1, 427500.00)
ON DUPLICATE KEY UPDATE `id_detail` = VALUES(`id_detail`);

INSERT INTO `tbl_log` (`id_log`, `tabel_terkait`, `aksi`, `deskripsi`, `waktu`) VALUES
(1, 'tbl_produk', 'INIT', 'Inisialisasi sistem inventaris awal toko.', NOW())
ON DUPLICATE KEY UPDATE `id_log` = VALUES(`id_log`);

-- -------------------------------------------------------------
-- Stored Function: HitungTotalBersih
-- -------------------------------------------------------------
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

-- -------------------------------------------------------------
-- Stored Procedure: TambahTransaksiTerintegrasi
-- -------------------------------------------------------------
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

        -- Kunci baris produk untuk konsistensi stok
        SELECT stok, harga INTO v_stok, v_harga 
        FROM tbl_produk 
        WHERE id_produk = p_id_produk 
        FOR UPDATE;

        IF v_harga IS NULL THEN
            ROLLBACK;
            SELECT 'GAGAL' AS status, 'Produk tidak ditemukan!' AS pesan, 0 AS id_transaksi;
        ELSEIF v_stok < p_jumlah THEN
            ROLLBACK;
            SELECT 'GAGAL' AS status, CONCAT('Stok tidak mencukupi! Sisa stok hanya ', v_stok) AS pesan, 0 AS id_transaksi;
        ELSE
            -- Hitung total bersih melalui Stored Function
            SET v_total_bersih = HitungTotalBersih(v_harga, p_jumlah, p_diskon);

            -- Simpan ke tabel master transaksi
            INSERT INTO tbl_transaksi (tanggal, id_pelanggan, total_belanja)
            VALUES (CURDATE(), p_id_pelanggan, v_total_bersih);

            SET v_id_transaksi = LAST_INSERT_ID();

            -- Simpan detail transaksi
            INSERT INTO tbl_detail_transaksi (id_transaksi, id_produk, jumlah, subtotal)
            VALUES (v_id_transaksi, p_id_produk, p_jumlah, v_total_bersih);

            -- Kurangi stok produk (Trigger after_update_stok_produk otomatis jalan)
            UPDATE tbl_produk 
            SET stok = stok - p_jumlah 
            WHERE id_produk = p_id_produk;

            COMMIT;

            SELECT 'SUKSES' AS status, 'Transaksi berhasil diproses dan stok berhasil diperbarui.' AS pesan, v_id_transaksi AS id_transaksi;
        END IF;
    END IF;
END //
DELIMITER ;

-- -------------------------------------------------------------
-- Trigger: after_update_stok_produk
-- -------------------------------------------------------------
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

-- -------------------------------------------------------------
-- View: view_laporan_penjualan
-- -------------------------------------------------------------
CREATE OR REPLACE VIEW `view_laporan_penjualan` AS
SELECT 
    t.id_transaksi,
    t.tanggal,
    p.id_pelanggan,
    p.nama_pelanggan,
    p.kota,
    k.id_kategori,
    k.nama_kategori,
    pr.id_produk,
    pr.nama_produk,
    pr.harga,
    dt.id_detail,
    dt.jumlah,
    dt.subtotal,
    t.total_belanja
FROM tbl_transaksi t
JOIN tbl_pelanggan p ON t.id_pelanggan = p.id_pelanggan
JOIN tbl_detail_transaksi dt ON t.id_transaksi = dt.id_transaksi
JOIN tbl_produk pr ON dt.id_produk = pr.id_produk
JOIN tbl_kategori k ON pr.id_kategori = k.id_kategori;
