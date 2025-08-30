# Lumora – AI-Powered Journaling & Goal Tracking Platform

<div align="center">

![React](https://img.shields.io/badge/React-19.1.0-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-6.17.0-green.svg)
![Express](https://img.shields.io/badge/Express-5.1.0-gray.svg)
![License](https://img.shields.io/badge/License-ISC-yellow.svg)

**An intelligent, AI-powered platform for personal journaling, mood tracking, and goal management**

[🚀 Quick Start](#quick-start) • [📚 Features](#-features) • [🏗️ Architecture](#️-architecture) • [🛠️ Development](#️-development)

</div>

---

## 📖 Overview

Lumora is an end-to-end, AI-powered journaling and goal tracking platform that combines modern React frontend, **LangGraph workflow orchestration**, machine learning sentiment analysis, and conversational AI assistance to deliver personalized insights and guidance for personal growth and mental wellness.

### ✨ Key Features

- **🔐 User Authentication & Session Management**: Secure registration, login, and session handling with JWT and bcrypt-hashed passwords
- **📝 Intelligent Journaling**: Rich text editor with AI-powered sentiment analysis and mood tracking
- **🤖 ML-Powered Insights**: Automatic mood detection and sentiment analysis using advanced AI models
- **🔍 Explainable AI**: Transparent, personalized explanations for mood patterns and trends
- **💡 Goal Management**: AI-assisted goal creation, progress tracking, and streak monitoring
- **💬 Conversational AI Assistant**: LangChain-powered chat assistant for journaling guidance
- **📈 Analysis & Trends**: Weekly mood trends, writing patterns, and personalized insights
- **🔄 LangGraph Workflows**: Advanced workflow orchestration for seamless AI processing
- **🔒 Secure Data Isolation**: User data isolation using MongoDB and session validation

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- MongoDB 6.0 or higher
- Git
- 8GB+ RAM recommended

### 1. Clone & Setup
```bash
git clone <your-repo-url>
cd lumora
npm install
```

### 2. Environment Configuration
```bash
# Backend environment
cd server
cp .env.example .env
# Add your API keys and database configuration

# Frontend environment
cd ../client
cp .env.example .env
# Configure API endpoints
```

### 3. Install Dependencies
```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### 4. Start Development Servers
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

**🎯 The app will open at `http://localhost:5173`**

---

## 🏗️ Architecture

### System Overview
```
┌─────────────────┐    ┌──────────────────────┐    ┌─────────────────┐
│   React         │◄──►│  LangGraph Workflow  │◄──►│  Node.js        │
│    Frontend     │    │      Engine          │    │     Backend     │
└─────────────────┘    └──────────────────────┘    └─────────────────┘
         │                       │                           │
         │                       │                           │
         ▼                       ▼                           ▼
┌─────────────────┐    ┌──────────────────────┐    ┌─────────────────┐
│  User Interface │    │  Workflow Nodes      │    │  ML Models      │
│  (Journal, Chat)│    │  (State Management)  │    │  (Sentiment)    │
└─────────────────┘    └──────────────────────┘    └─────────────────┘
         │                       │                           │
         │                       │                           │
         ▼                       ▼                           ▼
┌─────────────────┐    ┌──────────────────────┐    ┌─────────────────┐
│  Authentication │    │  Error Handling      │    │  AI Services    │
│  (JWT, bcrypt)  │    │  (Recovery, Logging) │    │  (LangChain)    │
└─────────────────┘    └──────────────────────┘    └─────────────────┘
```

### LangGraph Workflow
```
user_input → sentiment_analysis → mood_detection → generate_insights → format_response
```

**Benefits:**
- **🔄 Better State Management**: Proper data flow between workflow nodes
- **🛡️ Improved Error Handling**: Better error management and recovery
- **🔧 Easy Extensibility**: Simple to add new workflow steps
- **📊 Better Monitoring**: Visibility into workflow execution

---

## 🛠️ Tech Stack

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| **Frontend** | React | 19.1.0 | Modern web interface |
| **Build Tool** | Vite | 7.0.4 | Fast development server |
| **Styling** | Tailwind CSS | 3.4.17 | Utility-first CSS |
| **UI Components** | Radix UI | Latest | Accessible primitives |
| **Backend Engine** | Express.js | 5.1.0 | Web framework |
| **Database** | MongoDB + Mongoose | 6.17.0 | Data persistence |
| **AI Framework** | LangChain + LangGraph | Latest | AI orchestration |
| **ML Services** | OpenAI + Cohere | Latest | Language models |
| **Authentication** | JWT + bcrypt | Latest | Security & sessions |
| **Data Processing** | Date-fns + Moment | Latest | Date manipulation |

---

## 📁 Project Structure

```
lumora/
├── 📁 client/                      # React frontend application
│   ├── 🔐 src/components/          # React components
│   │   ├── AuthForm.jsx           # Authentication forms
│   │   ├── ChatPage.jsx           # AI chat interface
│   │   ├── JournalEntryModal.jsx  # Journal entry editor
│   │   ├── GoalModal.jsx          # Goal management
│   │   └── ui/                    # Reusable UI components
│   ├── 🎯 src/hooks/              # Custom React hooks
│   │   ├── useGoal.js            # Goal management logic
│   │   ├── useStreakData.js      # Streak tracking
│   │   └── useTodayMood.js       # Mood analysis
│   ├── 🤖 src/api/                # API integration
│   │   └── chat.js               # Chat API endpoints
│   └── 📱 public/                 # Static assets
├── ⚙️ server/                      # Node.js backend application
│   ├── 🔧 controllers/            # Route controllers
│   │   ├── authController.js     # Authentication logic
│   │   ├── journalController.js  # Journal management
│   │   ├── goalController.js     # Goal operations
│   │   └── chatController.js     # AI chat handling
│   ├── 🗄️ models/                # MongoDB models
│   │   ├── User.js              # User data model
│   │   ├── JournalEntry.js      # Journal entries
│   │   ├── ChatSession.js       # Chat history
│   │   └── MemorySnapshot.js    # AI memory storage
│   ├── 🔄 ai/                    # AI integration modules
│   │   ├── langgraph/           # LangGraph workflows
│   │   ├── cohere.js            # Cohere API integration
│   │   ├── llm.js               # LLM utilities
│   │   └── pinecone.js          # Vector database
│   ├── 🚀 routes/                # API route definitions
│   ├── 🛡️ middleware/            # Express middleware
│   └── 🧰 utils/                 # Backend utilities
├── 📚 documentation/              # Project documentation
├── 📋 package.json                # Root dependencies
└── 📖 README.md                   # This file
```

---

## 🔧 Development Setup

### Local Development
```bash
# 1. Clone repository
git clone <repo-url>
cd lumora

# 2. Install dependencies
npm install

# 3. Install client dependencies
cd client
npm install

# 4. Install server dependencies
cd ../server
npm install

# 5. Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# 6. Initialize database
# Ensure MongoDB is running

# 7. Start development servers
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

### Environment Variables
Create a `.env` file in the `server/` directory:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/lumora

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Email Configuration
SENDGRID_API_KEY=your_sendgrid_api_key
EMAIL_FROM=noreply@lumora.com

# AI Services
OPENAI_API_KEY=your_openai_api_key
COHERE_API_KEY=your_cohere_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=your_pinecone_environment
```

Create a `.env` file in the `client/` directory:
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Lumora
```

---

## 🧪 Testing

### Running Tests
```bash
# Frontend tests
cd client
npm test

# Backend tests
cd server
npm test

# Run with coverage
npm run test:coverage
```

### Test Structure
```
tests/
├── unit/                    # Unit tests
├── integration/             # Integration tests
├── fixtures/                # Test fixtures
└── conftest.js             # Test configuration
```

---

## 🚀 Deployment

### Production Deployment
```bash
# 1. Set production environment
export NODE_ENV=production
export DEBUG=false

# 2. Build frontend
cd client
npm run build

# 3. Install production dependencies
cd ../server
npm install --production

# 4. Start production server
npm start
```

### Docker Deployment
```dockerfile
# Frontend
FROM node:18-alpine as client
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci --only=production
COPY client/ ./
RUN npm run build

# Backend
FROM node:18-alpine
WORKDIR /app
COPY server/package*.json ./
RUN npm ci --only=production
COPY server/ ./
COPY --from=client /app/client/dist ./public

EXPOSE 5000
CMD ["npm", "start"]
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Errors
```bash
# Solution: Check MongoDB service
mongod --version
# Ensure MongoDB is running on port 27017
```

#### 2. Import Errors
```bash
# Solution: Ensure you're in the project root
cd lumora
export PYTHONPATH=$PYTHONPATH:$(pwd)
```

#### 3. Port Already in Use
```bash
# Solution: Use different ports
# Backend: PORT=5001 npm run dev
# Frontend: npm run dev -- --port 5174
```

#### 4. Memory Issues
```bash
# Solution: Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
```

### Debug Mode
```bash
# Enable debug logging
export DEBUG=true
export LOG_LEVEL=DEBUG
```

---

## 📚 Documentation

- **[Architecture Guide](documentation/ARCHITECTURE.md)** - Detailed system architecture
- **[LangGraph Setup](documentation/LANGGRAPH_SETUP.md)** - LangGraph configuration guide
- **[API Documentation](documentation/API.md)** - Backend API details
- **[Frontend Guide](documentation/FRONTEND.md)** - React component documentation

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Standards
- Follow ESLint configuration
- Use Prettier for formatting
- Write meaningful commit messages
- Include tests for new functionality
- Update documentation as needed

---

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements

- **[React Team](https://reactjs.org/)** - For the amazing React framework
- **[Vite Team](https://vitejs.dev/)** - For the fast build tool
- **[Tailwind CSS](https://tailwindcss.com/)** - For the utility-first CSS framework
- **[OpenAI](https://openai.com/)** - For GPT language models
- **[Cohere](https://cohere.ai/)** - For advanced language processing
- **[MongoDB](https://mongodb.com/)** - For the flexible database solution
- **[LangChain](https://langchain.com/)** - For AI application framework

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/lumora/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/lumora/discussions)
- **Documentation**: [Project Wiki](https://github.com/yourusername/lumora/wiki)

---

<div align="center">

**Made with ❤️ by the Lumora Team**

[⬆️ Back to Top](#lumora--ai-powered-journaling--goal-tracking-platform)

</div> 