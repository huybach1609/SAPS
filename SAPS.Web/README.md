# SAPS - Smart Automated Parking System

A comprehensive web-based parking management platform that provides automated license plate recognition, real-time monitoring, and comprehensive analytics for parking lot operations.

![SAPS Logo](src/assets/Logo/logo.webp)

## 🚀 Features

### For Parking Lot Owners
- **Dashboard & Analytics**: Real-time overview of parking operations and revenue
- **Staff Management**: Complete staff roster management with detailed profiles
- **Staff Shift Management**: Schedule and manage staff shifts with conflict detection
- **Parking Fee Management**: Configure flexible pricing schedules and fee structures
- **Parking History**: Detailed records of all parking sessions with search and filtering
- **Incident Reports**: Track and manage parking-related incidents and violations
- **Whitelist Management**: Manage authorized vehicles and special access
- **Subscription Management**: Handle subscription plans and payments
- **File Upload**: Bulk import functionality for data management

### For Administrators
- **User Account Management**: Manage admin and user accounts
- **Parking Lot Owner Management**: Oversee all registered parking lot owners
- **Request Management**: Handle and process system requests
- **Subscription Oversight**: Monitor and manage subscription plans
- **System Analytics**: Comprehensive system-wide analytics and reporting

### Core System Features
- **Role-Based Access Control**: Secure authentication with different permission levels
- **Real-Time Monitoring**: Live updates on parking lot status and operations
- **QR Code Integration**: Generate and manage QR codes for payments
- **Responsive Design**: Mobile-friendly interface for all devices
- **Dark/Light Theme**: Customizable user interface themes

## 🛠️ Technologies Used

### Frontend
- [React 18](https://reactjs.org/) - Modern React with hooks and functional components
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript development
- [Vite](https://vitejs.dev/) - Fast build tool and development server
- [HeroUI](https://heroui.com/) - Modern React component library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Framer Motion](https://www.framer.com/motion) - Animation library
- [React Router DOM](https://reactrouter.com/) - Client-side routing

### Development Tools
- [ESLint](https://eslint.org/) - Code linting and formatting
- [Prettier](https://prettier.io/) - Code formatter
- [Vitest](https://vitest.dev/) - Unit testing framework
- [Jest](https://jestjs.io/) - Testing framework
- [PostCSS](https://postcss.org/) - CSS processing

### Additional Libraries
- [Axios](https://axios-http.com/) - HTTP client for API calls
- [Date-fns](https://date-fns.org/) - Date utility library
- [Lucide React](https://lucide.dev/) - Icon library
- [QRCode.react](https://github.com/zpao/qrcode.react) - QR code generation
- [File-saver](https://github.com/eligrey/FileSaver.js/) - File download functionality

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm, yarn, pnpm, or bun package manager

### Clone the Repository
```bash
git clone <repository-url>
cd SAPS.Web
```

### Install Dependencies
```bash
# Using npm
npm install

# Using yarn
yarn install

# Using pnpm
pnpm install

# Using bun
bun install
```

### Environment Setup
Create a `.env` file in the root directory and configure your environment variables:

```env
VITE_API_BASE_URL=your_api_base_url
VITE_APP_NAME=SAPS
```

### Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Run Tests with Coverage
```bash
npm run coverage
```

### Linting
```bash
npm run lint
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── layout/         # Layout components (sidebar, navbar)
│   ├── ui/            # UI primitives and components
│   └── utils/         # Utility components
├── config/            # Configuration files
├── contexts/          # React contexts (Auth, ParkingLot)
├── hooks/             # Custom React hooks
├── layouts/           # Page layouts
├── pages/             # Application pages
│   ├── Admin/         # Admin-specific pages
│   ├── Auth/          # Authentication pages
│   └── ParkingLotOwner/ # Owner-specific pages
├── services/          # API services and utilities
├── styles/            # Global styles
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
```

## 🔐 Authentication & Authorization

The system supports role-based access control with two main user types:

- **Administrators**: Full system access with user management capabilities
- **Parking Lot Owners**: Access to their specific parking lot operations

### Protected Routes
- Admin routes require `admin` role
- Owner routes require `parkinglotowner` role
- Subscription status affects feature availability for owners

## 🚗 Key Features Explained

### Parking Fee Management
- Configure hourly, daily, and weekly rates
- Set special rates for different vehicle types
- Manage peak and off-peak pricing
- Generate fee reports and analytics

### Staff Management
- Complete staff profiles with contact information
- Shift scheduling with conflict detection
- Performance tracking and reporting
- Role-based staff permissions

### Incident Reports
- Track parking violations and incidents
- Generate detailed reports
- Manage incident resolution workflow
- Export incident data for analysis

### Whitelist System
- Manage authorized vehicles
- Special access permissions
- Bulk import/export functionality
- Search and filter capabilities

## 🔧 Configuration

### HeroUI Configuration
If using `pnpm`, add the following to your `.npmrc` file:

```bash
public-hoist-pattern[]=*@heroui/*
```

### Tailwind Configuration
The project uses Tailwind CSS with custom configuration for consistent styling across components.

## 📱 Mobile Support

The application is fully responsive and optimized for mobile devices, providing a seamless experience across all screen sizes.

## 🚀 Deployment

### Vercel Deployment
The project includes `vercel.json` configuration for easy deployment on Vercel.

### Build Optimization
- Code splitting for better performance
- Optimized bundle sizes
- Lazy loading for routes
- Image optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation in the `/docs` folder

## 🔄 Version History

- **v1.0.0** - Initial release with core parking management features
- **v1.1.0** - Added staff shift management and incident reporting
- **v1.2.0** - Enhanced analytics and reporting capabilities
- **v1.3.0** - Mobile optimization and performance improvements

---

**SAPS** - Making parking management smarter, one lot at a time. 🚗💡
