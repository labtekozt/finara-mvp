import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting database seed...")

  // Create users
  console.log("Creating users...")
  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      nama: "Administrator",
      username: "admin",
      email: "admin@finara.com",
      password: await hash("admin123", 10),
      role: "ADMIN",
    },
  })

  const kasir = await prisma.user.upsert({
    where: { username: "kasir" },
    update: {},
    create: {
      nama: "Kasir Toko",
      username: "kasir",
      email: "kasir@finara.com",
      password: await hash("kasir123", 10),
      role: "KASIR",
    },
  })

  const gudang = await prisma.user.upsert({
    where: { username: "gudang" },
    update: {},
    create: {
      nama: "Petugas Gudang",
      username: "gudang",
      email: "gudang@finara.com",
      password: await hash("gudang123", 10),
      role: "GUDANG",
    },
  })

  const manajer = await prisma.user.upsert({
    where: { username: "manajer" },
    update: {},
    create: {
      nama: "Manajer Toko",
      username: "manajer",
      email: "manajer@finara.com",
      password: await hash("manajer123", 10),
      role: "MANAJER",
    },
  })

  console.log("✓ Users created")

  // Create locations
  console.log("Creating locations...")
  const gudangUtama = await prisma.lokasi.create({
    data: {
      namaLokasi: "Gudang Utama",
      alamat: "Jl. Raya Industri No. 123, Jakarta",
    },
  })

  const gudangCabang = await prisma.lokasi.create({
    data: {
      namaLokasi: "Gudang Cabang Bandung",
      alamat: "Jl. Soekarno Hatta No. 456, Bandung",
    },
  })

  console.log("✓ Locations created")

  // Create products
  console.log("Creating products...")
  const products = [
    {
      nama: "Laptop ASUS ROG",
      sku: "LPT-001",
      kategori: "Elektronik",
      stok: 15,
      stokMinimum: 5,
      hargaBeli: 12000000,
      hargaJual: 15000000,
      satuan: "unit",
      deskripsi: "Laptop gaming high-end",
      lokasiId: gudangUtama.id,
    },
    {
      nama: "Mouse Logitech G502",
      sku: "MSE-001",
      kategori: "Aksesoris",
      stok: 50,
      stokMinimum: 10,
      hargaBeli: 500000,
      hargaJual: 750000,
      satuan: "unit",
      deskripsi: "Mouse gaming wireless",
      lokasiId: gudangUtama.id,
    },
    {
      nama: "Keyboard Mechanical RGB",
      sku: "KBD-001",
      kategori: "Aksesoris",
      stok: 30,
      stokMinimum: 10,
      hargaBeli: 800000,
      hargaJual: 1200000,
      satuan: "unit",
      deskripsi: "Keyboard mechanical dengan RGB",
      lokasiId: gudangUtama.id,
    },
    {
      nama: "Monitor LG 27 inch",
      sku: "MON-001",
      kategori: "Elektronik",
      stok: 20,
      stokMinimum: 5,
      hargaBeli: 2500000,
      hargaJual: 3500000,
      satuan: "unit",
      deskripsi: "Monitor IPS 144Hz",
      lokasiId: gudangUtama.id,
    },
    {
      nama: "Webcam Logitech C920",
      sku: "WBC-001",
      kategori: "Aksesoris",
      stok: 25,
      stokMinimum: 8,
      hargaBeli: 1000000,
      hargaJual: 1500000,
      satuan: "unit",
      deskripsi: "Webcam HD 1080p",
      lokasiId: gudangUtama.id,
    },
    {
      nama: "Headset Gaming HyperX",
      sku: "HDS-001",
      kategori: "Aksesoris",
      stok: 40,
      stokMinimum: 10,
      hargaBeli: 700000,
      hargaJual: 1000000,
      satuan: "unit",
      deskripsi: "Headset gaming 7.1 surround",
      lokasiId: gudangUtama.id,
    },
    {
      nama: "SSD Samsung 1TB",
      sku: "SSD-001",
      kategori: "Storage",
      stok: 35,
      stokMinimum: 15,
      hargaBeli: 1200000,
      hargaJual: 1800000,
      satuan: "unit",
      deskripsi: "SSD NVMe M.2",
      lokasiId: gudangCabang.id,
    },
    {
      nama: "RAM DDR4 16GB",
      sku: "RAM-001",
      kategori: "Komponen",
      stok: 45,
      stokMinimum: 20,
      hargaBeli: 600000,
      hargaJual: 900000,
      satuan: "unit",
      deskripsi: "RAM 3200MHz",
      lokasiId: gudangCabang.id,
    },
    {
      nama: "Mousepad Gaming XL",
      sku: "MPD-001",
      kategori: "Aksesoris",
      stok: 60,
      stokMinimum: 20,
      hargaBeli: 150000,
      hargaJual: 250000,
      satuan: "unit",
      deskripsi: "Mousepad ukuran besar",
      lokasiId: gudangCabang.id,
    },
    {
      nama: "Flashdisk 64GB",
      sku: "FLD-001",
      kategori: "Storage",
      stok: 8,
      stokMinimum: 15,
      hargaBeli: 80000,
      hargaJual: 150000,
      satuan: "unit",
      deskripsi: "USB 3.0 High Speed",
      lokasiId: gudangUtama.id,
    },
  ]

  for (const product of products) {
    await prisma.barang.create({ data: product })
  }

  console.log("✓ Products created")

  console.log("✅ Database seed completed successfully!")
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


