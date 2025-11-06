# FINARA - Sistem Manajemen Ritel & Gudang Terpadu

Sistem manajemen terpadu untuk operasional retail dan gudang yang mencakup Point of Sale (POS), manajemen inventaris, dan tracking barang masuk/keluar.

## 🚀 Fitur Utama

### 1. **Modul Kasir (POS)**
- Transaksi penjualan real-time
- Keranjang belanja interaktif
- Multiple metode pembayaran (Tunai, Kartu)
- Cetak struk otomatis
- Perhitungan pajak dan diskon
- Update stok otomatis

### 2. **Modul Inventaris**
- CRUD barang lengkap
- Filter berdasarkan kategori dan lokasi
- Notifikasi stok rendah
- Multi-lokasi gudang
- Tracking harga beli dan jual
- SKU management

### 3. **Modul Transaksi Barang**
- Pencatatan barang masuk
- Pencatatan barang keluar
- Histori transaksi lengkap
- Update stok real-time
- Filter berdasarkan tanggal dan lokasi

### 4. **Dashboard & Reporting**
- Statistik penjualan harian
- Monitoring stok rendah
- Transaksi barang masuk/keluar
- Ringkasan aktivitas
- Visualisasi data

### 5. **Manajemen User & Role**
- Role-based access control (RBAC)
- 4 role: Admin, Kasir, Gudang, Manajer
- Audit trail lengkap
- Session management dengan NextAuth

## 🛠️ Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript
- **UI Library:** shadcn/ui, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth.js
- **Form Handling:** React Hook Form + Zod
- **State Management:** React Hooks

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm atau yarn

## 🔧 Installation

1. **Clone repository**
```bash
git clone <repository-url>
cd finara
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
cp .env.example .env
```

Edit `.env` file:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/finara_db?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"
```

4. **Setup database**
```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database with initial data
npm run db:seed
```

5. **Run development server**
```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## 👥 Default User Credentials

Setelah seeding, gunakan credentials berikut untuk login:

| Role    | Username | Password   | Akses                                      |
|---------|----------|------------|--------------------------------------------|
| Admin   | admin    | admin123   | Full access (semua modul + manajemen user) |
| Kasir   | kasir    | kasir123   | Kasir + Dashboard                          |
| Gudang  | gudang   | gudang123  | Inventaris + Transaksi Barang + Dashboard  |
| Manajer | manajer  | manajer123 | View-only semua modul                      |

## 📁 Project Structure

```
finara/
├── app/
│   ├── (dashboard)/        # Protected dashboard routes
│   │   ├── dashboard/      # Dashboard page
│   │   ├── kasir/          # Cashier/POS module
│   │   ├── inventaris/     # Inventory module
│   │   └── transaksi/      # Goods transaction module
│   ├── api/                # API routes
│   │   ├── auth/           # NextAuth configuration
│   │   ├── barang/         # Inventory API
│   │   ├── lokasi/         # Location API
│   │   ├── transaksi-kasir/    # Cashier transaction API
│   │   ├── transaksi-masuk/    # Incoming goods API
│   │   └── transaksi-keluar/   # Outgoing goods API
│   ├── login/              # Login page
│   └── layout.tsx          # Root layout
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── app-sidebar.tsx     # Navigation sidebar
│   ├── header.tsx          # Page header
│   └── providers.tsx       # App providers
├── lib/
│   ├── prisma.ts           # Prisma client
│   ├── auth-options.ts     # NextAuth configuration
│   ├── permissions.ts      # RBAC permissions
│   └── transaction-number.ts # Transaction ID generator
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Database seeder
├── types/
│   ├── index.ts            # Type definitions
│   └── next-auth.d.ts      # NextAuth type extensions
└── middleware.ts           # Route protection middleware
```

## 🔐 Role-Based Access Control

### Admin (ADMIN)
- ✅ Dashboard
- ✅ Kasir
- ✅ Inventaris (CRUD)
- ✅ Transaksi Barang (CRUD)
- ✅ Manajemen User

### Kasir (KASIR)
- ✅ Dashboard
- ✅ Kasir (POS)
- ❌ Inventaris
- ❌ Transaksi Barang
- ❌ Manajemen User

### Petugas Gudang (GUDANG)
- ✅ Dashboard
- ❌ Kasir
- ✅ Inventaris
- ✅ Transaksi Barang
- ❌ Manajemen User

### Manajer (MANAJER)
- ✅ Dashboard (View-only)
- ✅ Kasir (View-only)
- ✅ Inventaris (View-only)
- ✅ Transaksi Barang (View-only)
- ❌ Manajemen User

## 🗄️ Database Schema

### Entities
- **User** - User management with roles
- **Lokasi** - Warehouse locations
- **Barang** - Product/inventory items
- **TransaksiKasir** - Cashier transactions
- **ItemTransaksi** - Transaction line items
- **TransaksiMasuk** - Incoming goods
- **TransaksiKeluar** - Outgoing goods
- **ActivityLog** - Audit trail

Lihat `prisma/schema.prisma` untuk detail lengkap.

## 📊 API Endpoints

### Authentication
- `POST /api/auth/signin` - Login
- `POST /api/auth/signout` - Logout

### Inventory (Barang)
- `GET /api/barang` - List all items
- `POST /api/barang` - Create item
- `GET /api/barang/[id]` - Get item detail
- `PUT /api/barang/[id]` - Update item
- `DELETE /api/barang/[id]` - Delete item

### Locations (Lokasi)
- `GET /api/lokasi` - List all locations
- `POST /api/lokasi` - Create location

### Cashier Transactions
- `GET /api/transaksi-kasir` - List transactions
- `POST /api/transaksi-kasir` - Create transaction

### Incoming Goods
- `GET /api/transaksi-masuk` - List incoming transactions
- `POST /api/transaksi-masuk` - Create incoming transaction

### Outgoing Goods
- `GET /api/transaksi-keluar` - List outgoing transactions
- `POST /api/transaksi-keluar` - Create outgoing transaction

## 🎨 UI/UX Features

- **Responsive Design** - Mobile-friendly interface
- **Modern UI** - Clean and intuitive design with shadcn/ui
- **Dark Mode Ready** - Theme support built-in
- **Toast Notifications** - Real-time feedback
- **Loading States** - Better user experience
- **Form Validation** - Client and server-side validation
- **Error Handling** - Graceful error messages

## 🧪 Development

### Useful Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Database commands
npm run db:generate    # Generate Prisma Client
npm run db:push        # Push schema to database
npm run db:seed        # Seed database
npm run db:studio      # Open Prisma Studio
```

### Adding New Components

```bash
# Add shadcn/ui component
npx shadcn@latest add [component-name]
```

## 📈 Future Enhancements

- [ ] Multi-store/multi-warehouse support
- [ ] Barcode scanning integration
- [ ] Advanced reporting with charts
- [ ] Export to Excel/PDF
- [ ] Digital payment integration (QRIS, E-wallet)
- [ ] Stock forecasting with ML
- [ ] Mobile app (React Native)
- [ ] Email notifications
- [ ] Batch operations
- [ ] Advanced filtering and search

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is for educational/demonstration purposes.

## 🐛 Known Issues

- Printer integration requires additional setup
- Bulk upload via Excel not yet implemented
- Advanced reporting features in development

## 💡 Tips

1. **First Time Setup**: Always run `npm run db:seed` after pushing schema
2. **Production**: Change `NEXTAUTH_SECRET` to a strong random string
3. **Database**: Use PostgreSQL for best performance
4. **Backup**: Regular database backups recommended
5. **Security**: Never commit `.env` file

## 📞 Support

For issues and questions, please create an issue in the repository.

---

Built with ❤️ using Next.js, Prisma, and shadcn/ui
