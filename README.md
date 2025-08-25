# Smart Charter Party Generator

A sophisticated AI-powered web application for generating, analyzing, and managing Charter Party Contracts (shipping agreements between shipowners and charterers).

## 🚀 Features

### Core Functionality
- **AI-Powered Contract Generation**: Intelligently merges fixture recaps, base contracts, and negotiated clauses
- **Risk Analysis**: Identifies potential issues, conflicts, and inconsistencies in contracts
- **Compliance Checking**: Verifies mandatory charter party clauses with scoring system
- **Redlining/Track Changes**: Visual comparison between base and negotiated clauses
- **Vessel Data Integration**: Pre-populate fixture recaps with vessel information from external APIs
- **Real-time Collaboration**: Multi-user editing with live cursor tracking and comments

### AI Enhancements
- **Clause Recommendations**: AI suggests additional clauses based on fixture analysis
- **Interactive Accept/Reject**: Users can accept or reject AI-recommended clauses
- **Coverage Scoring**: Overall contract coverage assessment (0-100%)
- **Explainable AI (XAI)**: Detailed explanations for clause recommendations and risk assessments

### UI/UX Features
- **Dark Mode Toggle**: Complete dark/light theme support
- **Sidebar Navigation**: Quick jump to contract sections
- **Interactive Charts**: Risk distribution and compliance analytics using Recharts
- **Smooth Animations**: Framer Motion-powered micro-animations
- **Responsive Design**: Mobile-friendly interface

### Export & Sharing
- **PDF Export**: High-quality PDF generation with proper formatting
- **Email Integration**: One-click contract sharing via email
- **File Upload Support**: DOCX, TXT, and HTML file processing

## 🛠️ Tech Stack

- **Framework**: Next.js 15.3.3 with TypeScript
- **AI Integration**: Google AI (Genkit) for contract processing
- **UI Components**: Tailwind CSS + Radix UI
- **Charts**: Recharts for data visualization
- **Animations**: Framer Motion
- **File Processing**: Mammoth.js for DOCX handling, Puppeteer for PDF generation
- **Form Handling**: React Hook Form with Zod validation
- **Real-time Communication**: Pusher for collaboration features
- **External APIs**: Integration with maritime vessel databases

## 🎨 Design System

- **Primary Color**: Navy blue (#2E3A87) - Trust and reliability
- **Background**: Light gray (#F0F2F5) - Neutral, readable
- **Accent Color**: Teal (#26A69A) - Modern, professional
- **Typography**: Inter (sans-serif) for UI, Source Code Pro for code
- **Dark Mode**: Complete theme support with CSS variables

## 📁 Project Structure

```
src/
├── ai/flows/                    # AI processing flows
│   ├── clause-risk-analyzer.ts  # Risk analysis
│   ├── compliance-checker.ts    # Compliance verification
│   ├── merge-charter-party-contract.ts  # Contract merging
│   ├── recommend-clauses.ts     # Clause recommendations
│   ├── redline-generator.ts     # Redline generation
│   ├── convert-to-docx.ts       # DOCX conversion
│   └── convert-to-pdf.ts        # PDF conversion
├── components/app/              # Main application components
│   ├── AIRecommendations.tsx    # AI clause suggestions
│   ├── AnimatedWrapper.tsx      # Animation components
│   ├── ClauseExplanation.tsx    # XAI explanations
│   ├── CollaborativeEditor.tsx  # Real-time collaboration
│   ├── ContractPreview.tsx      # Contract display
│   ├── DarkModeToggle.tsx       # Theme toggle
│   ├── InputForm.tsx            # Input form
│   ├── RedlineView.tsx          # Redline display
│   ├── RiskAnalysis.tsx         # Risk & compliance analysis
│   ├── SidebarNavigator.tsx     # Section navigation
│   ├── VesselLookup.tsx         # Vessel data integration
│   └── Header.tsx               # App header
└── app/                         # Next.js app directory
    ├── actions.ts               # Server actions
    ├── page.tsx                 # Main page
    └── layout.tsx               # App layout
```

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   # Google AI Configuration
   GOOGLE_AI_API_KEY=your_google_ai_api_key_here
   
   # Pusher Configuration (for real-time collaboration)
   PUSHER_APP_ID=your_pusher_app_id_here
   PUSHER_KEY=your_pusher_key_here
   PUSHER_SECRET=your_pusher_secret_here
   NEXT_PUBLIC_PUSHER_KEY=your_pusher_key_here
   NEXT_PUBLIC_PUSHER_CLUSTER=your_pusher_cluster_here
   
   # Email Configuration (optional)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password_here
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Access the Application**
   - Open [http://localhost:9002](http://localhost:9002)
   - The app will be available on port 9002

## 🔧 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## 🎯 Hackathon Ready Features

### Scalability
- **Modular AI Flows**: Easily adaptable for other contract domains
- **Component Architecture**: Reusable components for different use cases
- **Type Safety**: Full TypeScript coverage across all features

### Performance
- **Optimized AI Calls**: Efficient processing pipeline
- **Responsive Layout**: Mobile-first design approach
- **Fast Loading**: Optimized bundle size and lazy loading

### Demo Features
- **Interactive Elements**: Real-time clause acceptance/rejection
- **Visual Analytics**: Charts and progress indicators
- **Export Capabilities**: PDF format support
- **Professional UI**: Enterprise-grade design system

## 🔮 Future Enhancements

- **Multi-language Support**: International contract templates
- **Advanced Analytics**: Machine learning insights
- **Enhanced Collaboration**: Advanced commenting and version control
- **Integration APIs**: Connect with external maritime systems
- **Blockchain Integration**: Smart contract capabilities
- **Mobile App**: Native mobile application
- **AI Training**: Custom model training for specific contract types

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

**Built with ❤️ for the maritime industry**
