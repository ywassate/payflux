# PayFlux 💼

**PayFlux** is a modern, full-featured invoice management platform built with Next.js 15. It provides a comprehensive solution for businesses to create, manage, and track invoices while offering seamless communication between administrators and clients.

![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Prisma](https://img.shields.io/badge/Prisma-6.16.2-2D3748)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### 📊 Invoice Management
- **Complete invoice lifecycle management** - Draft, send, track, and mark invoices as paid
- **Multi-status tracking** - Draft, Sent, Partial, Paid, Overdue, Cancelled, and more
- **PDF generation** - Automatic PDF generation for professional invoices
- **Invoice categorization** - Organize invoices by custom categories
- **VAT/Tax management** - Flexible VAT rates and calculations
- **Invoice numbering** - Automatic invoice number generation

### 👥 User Roles & Permissions
- **Admin role** - Full access to create, edit, delete invoices and manage users
- **Client role** - View paid invoices, track payment status, and communicate with support
- **Role-based access control** - Different views and permissions based on user role

### 💬 Real-time Communication
- **Built-in chat system** - Direct communication between admins and clients
- **Invoice-specific conversations** - Link conversations to specific invoices
- **Real-time messaging** - Powered by Pusher for instant message delivery
- **Read receipts** - Track message read status
- **Conversation subjects** - Organize discussions with customizable subjects
- **Auto-generated subjects** - Automatic conversation subjects when discussing invoices

### 📈 Analytics & Reporting
- **Invoice status charts** - Visual representation of invoice distribution by status
- **Category pie charts** - Breakdown of invoices by category
- **Filtered views** - Filter invoices by status, category, and search terms
- **Dashboard overview** - Quick insights for administrators

### 🎨 UI/UX
- **Dark/Light mode** - Theme switching with system preference detection
- **Responsive design** - Optimized for desktop, tablet, and mobile devices
- **Modern interface** - Clean, professional design with Tailwind CSS + DaisyUI
- **Accessibility** - Built with accessibility best practices

## 🚀 Tech Stack

### Frontend
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[DaisyUI](https://daisyui.com/)** - Tailwind CSS component library
- **[Lucide React](https://lucide.dev/)** - Beautiful icon library

### Backend & Database
- **[Prisma](https://www.prisma.io/)** - Next-generation ORM
- **SQLite** - Lightweight, serverless database (easily swappable)
- **Server Actions** - Next.js server-side operations

### Authentication
- **[Clerk](https://clerk.com/)** - Complete authentication solution
- **User management** - Built-in user management and profiles
- **Avatar support** - Automatic avatar fetching and display

### Real-time & PDF
- **[Pusher](https://pusher.com/)** - Real-time WebSocket communication
- **[@react-pdf/renderer](https://react-pdf.org/)** - PDF generation
- **[jsPDF](https://github.com/parallax/jsPDF)** - Client-side PDF utilities

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn** or **pnpm**
- **Git**

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/payflux.git
cd payflux
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="file:./dev.db"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Pusher (Real-time messaging)
PUSHER_APP_ID=your_pusher_app_id
PUSHER_KEY=your_pusher_key
PUSHER_SECRET=your_pusher_secret
PUSHER_CLUSTER=your_pusher_cluster
NEXT_PUBLIC_PUSHER_KEY=your_pusher_key
NEXT_PUBLIC_PUSHER_CLUSTER=your_pusher_cluster
```

### 4. Set up the database

```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database (optional - adds test data)
npm run seed
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 🗄️ Database Schema

### Models

#### User
- Authentication and authorization
- Roles: ADMIN, CLIENT
- Linked to invoices, messages, and conversations

#### Invoice
- Complete invoice information
- Status tracking (DRAFT, SENT, PAID, OVERDUE, etc.)
- VAT/Tax calculations
- Client and issuer details
- Invoice lines

#### Category
- Organize invoices by category
- Custom categories management

#### Conversation
- Link between users for messaging
- Optional invoice reference
- Subject tracking

#### Message
- Real-time messaging
- Read receipts
- Sender/Receiver tracking

## 📁 Project Structure

```
payflux/
├── app/
│   ├── actions.ts              # Server actions
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home/Dashboard
│   ├── components/             # React components
│   │   ├── ChatInterface.tsx   # Chat UI
│   │   ├── InvoiceTable.tsx    # Invoice list
│   │   ├── InvoiceDashboard.tsx
│   │   ├── Navbar.tsx          # Navigation
│   │   └── ...
│   ├── invoices/               # Invoice pages
│   │   ├── page.tsx            # Invoice list
│   │   ├── new/                # Create invoice
│   │   └── [id]/               # View/Edit invoice
│   ├── chat/                   # Chat page
│   ├── admin/                  # Admin pages
│   │   ├── categories/         # Category management
│   │   └── users/              # User management
│   ├── sign-in/                # Authentication
│   ├── sign-up/
│   └── lib/                    # Utilities
│       ├── types.ts            # TypeScript types
│       ├── chatActions.ts      # Chat server actions
│       ├── prisma.ts           # Prisma client
│       └── pusher.ts           # Pusher configuration
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Database seeding
├── public/                     # Static assets
├── middleware.ts               # Next.js middleware (Auth)
└── package.json
```

## 🎯 Usage

### For Administrators

1. **Create Invoices**
   - Navigate to Invoices → New Invoice
   - Fill in client details, line items, and pricing
   - Choose a category and set due date
   - Save as draft or send directly

2. **Manage Invoices**
   - View all invoices with filtering options
   - Update invoice status (Draft → Sent → Paid)
   - Download invoices as PDF
   - Delete or modify existing invoices

3. **Communicate with Clients**
   - Access the Chat page
   - Select a client or existing conversation
   - Send messages with real-time delivery
   - Link conversations to specific invoices

4. **Manage Categories & Users**
   - Create custom invoice categories
   - View and manage user accounts
   - Monitor user activity

### For Clients

1. **View Invoices**
   - Access only PAID, OVERDUE, and CANCELLED invoices
   - Download invoices as PDF
   - View invoice details

2. **Contact Support**
   - Click "Contact Admin" from invoice page
   - Start invoice-specific conversations
   - Modify conversation subjects
   - Real-time chat with support team

3. **Track Payments**
   - View payment status
   - See invoice history
   - Access invoice analytics

## 🔧 Configuration

### Database Migration

To change the database provider (e.g., PostgreSQL, MySQL):

1. Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"  // or "mysql"
  url      = env("DATABASE_URL")
}
```

2. Update `.env` with the new connection string
3. Run migrations:
```bash
npx prisma migrate dev
```

### Theme Customization

Edit `tailwind.config.js` and `app/globals.css` to customize colors and themes.

## 📝 Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm start          # Start production server
npm run lint       # Run ESLint
npm run seed       # Seed database with test data
```

## 🐛 Troubleshooting

### Common Issues

**Issue: Prisma Client not found**
```bash
npx prisma generate
```

**Issue: Database connection error**
- Check your `DATABASE_URL` in `.env`
- Ensure database file has correct permissions

**Issue: Clerk authentication not working**
- Verify Clerk API keys in `.env`
- Check that sign-in/sign-up URLs are correct

**Issue: Pusher real-time not working**
- Verify Pusher credentials in `.env`
- Check Pusher cluster configuration

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project to Vercel
3. Add environment variables
4. Deploy

### Other Platforms

PayFlux can be deployed to any platform that supports Next.js:
- **Netlify**
- **AWS Amplify**
- **Railway**
- **Render**

**Note:** Remember to:
- Set up environment variables
- Configure database (use PostgreSQL/MySQL for production)
- Run migrations on production database




