# GITTE Sewing Machines - E-commerce Platform

A full-stack e-commerce website built with Next.js 15, featuring user authentication, product catalog, shopping cart, and order management for GITTE sewing machines.

## 🚀 Features

- **User Authentication**: Complete login/register system with better-auth
- **Product Catalog**: Browse 12+ sewing machines across multiple categories
- **Shopping Cart**: Add products to cart and manage quantities
- **Order Management**: Place orders and track order history
- **Responsive Design**: Mobile-first design that works on all devices
- **Real Product Images**: Professional product photography for all items

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: SQLite3 with Drizzle ORM
- **Authentication**: better-auth
- **UI Components**: Shadcn/UI, Radix UI
- **Icons**: Lucide React

## 📦 Docker Setup

### Prerequisites
- Docker
- Docker Compose

### Quick Start with Docker

1. **Clone the repository**:
```bash
git clone https://github.com/yourusername/demo-gitte-website.git
cd demo-gitte-website
```

2. **Create environment file**:
```bash
cp .env.example .env
```

Edit `.env` and add your environment variables:
```env
TURSO_CONNECTION_URL=your_turso_url
TURSO_AUTH_TOKEN=your_turso_token
BETTER_AUTH_SECRET=your_secret_key
BETTER_AUTH_URL=http://localhost:3000
```

3. **Build and run with Docker Compose**:
```bash
docker-compose up --build
```

The application will be available at `http://localhost:3000`

4. **Stop the application**:
```bash
docker-compose down
```

### Docker Commands

**Build the image**:
```bash
docker build -t demo-gitte-website .
```

**Run the container**:
```bash
docker run -p 3000:3000 --env-file .env demo-gitte-website
```

**View running containers**:
```bash
docker ps
```

**View logs**:
```bash
docker-compose logs -f
```

**Rebuild after changes**:
```bash
docker-compose up --build --force-recreate
```

## 💻 Local Development (Without Docker)

1. **Install dependencies**:
```bash
npm install
```

2. **Set up environment variables**:
Create a `.env` file with the required variables (see Docker Setup section)

3. **Run database migrations**:
```bash
npm run db:push
```

4. **Seed the database** (optional):
```bash
npm run db:seed
```

5. **Run development server**:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📊 Database Management

The project includes:
- **Products**: 12 sewing machines with images, prices, and features
- **Users**: User authentication and profiles
- **Cart**: Shopping cart functionality
- **Orders**: Order tracking and history

**Seed the database**:
```bash
npm run db:seed
```

## 🔒 Authentication

The app uses better-auth for secure authentication:
- Email/password registration
- Secure login with session management
- Protected routes for cart and orders
- User profile management

## 📁 Project Structure

```
demo-gitte-website/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── api/          # API routes
│   │   ├── login/        # Login page
│   │   ├── register/     # Register page
│   │   ├── products/     # Product pages
│   │   └── page.tsx      # Homepage
│   ├── components/       # React components
│   ├── db/               # Database schema and seeds
│   └── lib/              # Utility functions
├── public/               # Static assets
├── Dockerfile            # Docker configuration
├── docker-compose.yml    # Docker Compose configuration
└── package.json          # Dependencies
```

## 🌐 Deployment

### Deploy with Docker

1. **Build production image**:
```bash
docker build -t demo-gitte-website:latest .
```

2. **Push to container registry** (Docker Hub, AWS ECR, etc.):
```bash
docker tag demo-gitte-website:latest your-registry/demo-gitte-website:latest
docker push your-registry/demo-gitte-website:latest
```

3. **Deploy to your server**:
```bash
docker pull your-registry/demo-gitte-website:latest
docker run -d -p 3000:3000 --env-file .env your-registry/demo-gitte-website:latest
```

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `TURSO_CONNECTION_URL` | Turso database connection URL | Yes |
| `TURSO_AUTH_TOKEN` | Turso authentication token | Yes |
| `BETTER_AUTH_SECRET` | Secret key for authentication | Yes |
| `BETTER_AUTH_URL` | Base URL for auth callbacks | Yes |
| `NODE_ENV` | Environment (production/development) | No |

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push database schema changes
- `npm run db:seed` - Seed database with sample data

## 🐛 Troubleshooting

**Database issues**:
- Ensure `.env` file has correct database credentials
- Run `npm run db:push` to sync schema
- Check if `giveaway.db` file has correct permissions

**Docker issues**:
- Clear Docker cache: `docker system prune -a`
- Rebuild images: `docker-compose up --build --force-recreate`
- Check logs: `docker-compose logs -f`

**Port already in use**:
```bash
# Change port in docker-compose.yml
ports:
  - "3001:3000"  # Use 3001 instead of 3000
```

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ using Next.js 15