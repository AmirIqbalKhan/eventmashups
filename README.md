# 🎉 Event Mashups – Unified Event Platform

A powerful web application designed to streamline **event discovery**, **event management**, and **platform governance**, built using **Next.js**, **React**, **Tailwind CSS**, and **PostgreSQL**.

## 🚀 Features

### For Attendees

* **Event Discovery**: Browse events with advanced filters and search
* **Ticket Management**: Easy event registration and ticket transfers
* **Group Payments**: Collaborative payment functionality for shared costs
* **Social Features**: Connect with friends and see their activities
* **Personal Dashboard**: Manage events, payments, and communications

### For Organizers

* **Event Management**: Create, edit, and manage events
* **Ticket Management**: Handle ticket tiers and sales
* **Analytics**: Track event performance and attendee data
* **Payment Processing**: Integrated Stripe payment system
* **CRM Integration**: Manage event customers and communications

### For Administrators

* **Platform Analytics**: KPIs, retention, and ticket sales
* **User Management**: Role permissions and user oversight
* **Content Moderation**: Event approval and content management
* **Security Management**: Audit logs and security monitoring
* **Platform Settings**: Branding and terms management

## 🛠️ Tech Stack

* **Frontend**: Next.js 14, React 18, TypeScript
* **Styling**: Tailwind CSS with custom design system
* **Database**: PostgreSQL with Drizzle ORM
* **Authentication**: Custom JWT-based auth system
* **Payment Processing**: Stripe integration
* **Deployment**: Vercel-ready
* **UI Components**: Custom components with Framer Motion
* **Forms**: React Hook Form with validation

## 📁 Project Structure

```
Event Mashups/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── events/        # Event management
│   │   ├── checkout/      # Payment processing
│   │   ├── webhooks/      # Stripe webhooks
│   │   └── admin/         # Admin endpoints
│   ├── events/            # Event pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   ├── organizer/         # Organizer dashboard
│   ├── admin/             # Admin dashboard
│   └── components/        # Page-specific components
├── components/            # Reusable React components
│   ├── auth/              # Authentication components
│   ├── dashboard/         # Dashboard components
│   ├── events/            # Event-related components
│   └── layout/            # Layout components
├── lib/                   # Utility libraries
│   ├── database/          # Database configuration
│   ├── auth.ts           # Authentication utilities
│   ├── stripe.ts         # Payment processing
│   └── email.ts          # Email utilities
├── drizzle/              # Database migrations
├── public/               # Static assets
└── types/                # TypeScript definitions
```

## 🚀 Getting Started

### Prerequisites

* Node.js 18+
* PostgreSQL database
* Stripe account (for payments)
* npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/event-mashups.git
   cd event-mashups
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   Fill in your environment variables:
   ```
   DATABASE_URL="postgresql://..."
   JWT_SECRET="your-jwt-secret"
   STRIPE_SECRET_KEY="your-stripe-secret"
   STRIPE_PUBLISHABLE_KEY="your-stripe-publishable"
   ```

4. **Set up the database**
   ```bash
   npm run db:generate
   npm run db:push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📝 Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/event-mashups"

# Authentication
JWT_SECRET="your-jwt-secret-key"

# Stripe Payment Processing
STRIPE_SECRET_KEY="your-stripe-secret-key"
STRIPE_PUBLISHABLE_KEY="your-stripe-publishable-key"
STRIPE_WEBHOOK_SECRET="your-stripe-webhook-secret"

# Email (Optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

## 🧪 Available Scripts

* `npm run dev` - Start development server
* `npm run build` - Build for production
* `npm run start` - Start production server
* `npm run lint` - Run ESLint
* `npm run db:generate` - Generate database migrations
* `npm run db:push` - Push database changes
* `npm run db:studio` - Open Drizzle Studio

## 🎯 Key Features

### Event Management
- ✅ Create and edit events with rich details
- ✅ Multiple ticket tiers with pricing
- ✅ Event image management with fallbacks
- ✅ Category-based organization
- ✅ Location and date management

### Payment System
- ✅ Stripe integration for secure payments
- ✅ Group payment functionality
- ✅ Flexible contribution amounts
- ✅ Payment status tracking
- ✅ Webhook handling for payment events

### User Experience
- ✅ Responsive design for all devices
- ✅ Mobile-first approach
- ✅ Smooth animations and transitions
- ✅ Intuitive navigation
- ✅ Professional branding

### Admin Features
- ✅ User role management
- ✅ Event moderation
- ✅ Analytics dashboard
- ✅ Content management
- ✅ Security monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions, please:

1. Check the Issues page
2. Create a new issue with detailed information
3. Contact the development team

## 🙏 Acknowledgments

* Next.js team for the amazing framework
* Vercel for hosting and deployment
* Tailwind CSS for the utility-first styling
* Drizzle ORM for database management
* All contributors and supporters

---

**Live Demo**: [event-mashups.vercel.app](https://event-mashups.vercel.app) 