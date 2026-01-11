# 🇮🇩 IndoPost API

Platform Open API yang menyediakan akses terstruktur ke data wilayah administratif Indonesia (Provinsi, Kota/Kabupaten, Kecamatan, Kelurahan) beserta kode posnya.

## 📋 Features

- ✅ RESTful API untuk data wilayah Indonesia
- ✅ Developer Portal dengan Dashboard
- ✅ API Key Management
- ✅ Rate Limiting (100 req/hour)
- ✅ Request Logging & Analytics
- ✅ Search & Filter wilayah
- ✅ Dokumentasi API lengkap
- ✅ Authentication & Authorization

## 🛠️ Tech Stack

**Backend:**
- Node.js + Express.js
- PostgreSQL
- JWT Authentication
- bcrypt untuk password hashing

**Frontend:**
- HTML, CSS, JavaScript (Vanilla)
- Responsive Design

## 📁 Project Structure

```
indopost-api/
├── config/
│   └── database.js          # Database connection
├── middleware/
│   └── auth.js              # Authentication middleware
├── routes/
│   ├── auth.js              # Auth endpoints
│   ├── api.js               # Public API endpoints
│   └── dashboard.js         # Dashboard endpoints
├── public/
│   ├── index.html           # Landing page
│   ├── login.html           # Login page
│   ├── register.html        # Register page
│   ├── dashboard.html       # Dashboard
│   └── docs.html            # API Documentation
├── .env                     # Environment variables
├── package.json
└── server.js                # Main server file
```

## 🚀 Installation

### 1. Prerequisites

Pastikan sudah terinstall:
- Node.js (v14+)
- PostgreSQL (v14+)
- npm atau yarn

### 2. Clone & Install Dependencies

```bash
# Clone repository (atau buat folder baru)
mkdir indopost-api
cd indopost-api

# Install dependencies
npm install
```

### 3. Setup Database

**a. Buat database PostgreSQL:**

```bash
# Masuk ke PostgreSQL
psql -U postgres

# Buat database
CREATE DATABASE indopost_api;

# Keluar dari PostgreSQL
\q
```

**b. Import schema database:**

```bash
# Import schema SQL yang sudah dibuat
psql -U postgres -d indopost_api -f database_schema.sql
```

Atau copy-paste isi file `database_schema.sql` ke PostgreSQL client.

### 4. Setup Environment Variables

Buat file `.env` di root project:

```bash
cp .env.example .env
```

Edit `.env` sesuai konfigurasi:

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=indopost_api
DB_USER=postgres
DB_PASSWORD=your_postgres_password

JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=24h

RATE_LIMIT_WINDOW_MS=3600000
RATE_LIMIT_MAX_REQUESTS=100

CORS_ORIGIN=http://localhost:3000
```

### 5. Run Server

```bash
# Development mode (dengan nodemon)
npm run dev

# Production mode
npm start
```

Server akan berjalan di `http://localhost:5000`

## 📚 API Documentation

Akses dokumentasi lengkap di: `http://localhost:5000/docs.html`

### Quick Start

1. **Register** akun di `http://localhost:5000/register.html`
2. **Login** dan buat API Key di dashboard
3. **Gunakan** API Key untuk akses endpoint

### Example Request

```bash
curl -H "X-API-Key: your_api_key_here" \
     http://localhost:5000/api/v1/provinces
```

## 🔑 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register user baru
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/me` - Get current user

### Dashboard (Requires JWT)
- `GET /api/v1/dashboard/stats` - Get statistics
- `GET /api/v1/dashboard/api-keys` - Get all API keys
- `POST /api/v1/dashboard/api-keys` - Create new API key
- `DELETE /api/v1/dashboard/api-keys/:id` - Delete API key

### Public API (Requires API Key)
- `GET /api/v1/provinces` - Get all provinces
- `GET /api/v1/provinces/:id` - Get province by ID
- `GET /api/v1/provinces/:id/regencies` - Get regencies in province
- `GET /api/v1/regencies/:id` - Get regency by ID
- `GET /api/v1/regencies/:id/districts` - Get districts in regency
- `GET /api/v1/districts/:id` - Get district by ID
- `GET /api/v1/districts/:id/villages` - Get villages in district
- `GET /api/v1/villages/:id` - Get village by ID
- `GET /api/v1/postal-code/:code` - Search by postal code
- `GET /api/v1/search?q=keyword` - Search all regions

## 🗄️ Database Schema

### Tables
- `users` - User accounts
- `api_keys` - API keys untuk setiap user
- `request_logs` - Log semua API requests
- `provinces` - Data provinsi
- `regencies` - Data kabupaten/kota
- `districts` - Data kecamatan
- `villages` - Data kelurahan/desa (dengan kode pos)

## 🔐 Security Features

- Password hashing dengan bcrypt
- JWT token authentication
- API Key authentication
- Rate limiting (100 req/hour)
- Request logging
- CORS protection
- Helmet.js security headers

## 📊 Sample Data

Database sudah include sample data:
- ✅ 34 Provinsi (lengkap)
- ✅ 9 Kabupaten/Kota (Jawa Tengah)
- ✅ 16 Kecamatan (Kota Semarang)
- ✅ 12 Kelurahan (Tembalang)

Untuk data lengkap, import dari sumber seperti:
- [Kode Wilayah Kemendagri](https://www.kemendagri.go.id/)
- [Data Indonesia GitHub](https://github.com/cahyadsn/wilayah)

## 🧪 Testing

### Test dengan cURL

```bash
# Health check
curl http://localhost:5000/health

# Get provinces (perlu API key)
curl -H "X-API-Key: your_key" http://localhost:5000/api/v1/provinces

# Search by postal code
curl -H "X-API-Key: your_key" http://localhost:5000/api/v1/postal-code/50275
```

### Test dengan Postman

1. Import collection dari dokumentasi
2. Set environment variable untuk `API_KEY`
3. Test semua endpoints

## 📝 Development Tips

### Menambah Data Wilayah

```sql
-- Insert provinsi baru
INSERT INTO provinces (code, name) VALUES ('99', 'PROVINSI BARU');

-- Insert kabupaten/kota
INSERT INTO regencies (province_id, code, name, type) 
VALUES (1, '9901', 'KABUPATEN BARU', 'KABUPATEN');
```

### Custom Rate Limiting

Edit di `middleware/auth.js`:

```javascript
const rateLimit = (maxRequests = 100, windowMs = 3600000)
```

### Menambah Field Baru

1. Alter table di PostgreSQL
2. Update routes untuk include field baru
3. Update dokumentasi

## 🐛 Troubleshooting

### Error: "Database connection failed"
- Pastikan PostgreSQL running
- Check credentials di `.env`
- Verify database exists

### Error: "Port already in use"
- Change PORT di `.env`
- Kill process: `lsof -ti:5000 | xargs kill -9`

### API Key tidak work
- Pastikan header: `X-API-Key: your_key`
- Check API key masih active di dashboard

## 📈 Future Enhancements

- [ ] WebSocket untuk real-time updates
- [ ] GraphQL endpoint
- [ ] Bulk data export
- [ ] Advanced search filters
- [ ] OAuth2 integration
- [ ] Mobile app
- [ ] Docker containerization
- [ ] CI/CD pipeline

## 📄 License

MIT License - bebas digunakan untuk project apapun

## 👨‍💻 Author

Tugas Akhir - [Your Name]

## 🙏 Credits

- Data wilayah: Kemendagri
- Icons: Emoji
- Inspiration: Indonesia API projects

---

**Made with ❤️ for Indonesian Developers**

Untuk pertanyaan atau bantuan, silakan buat issue di repository ini.