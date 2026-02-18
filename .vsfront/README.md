# VocalScale Documentation Hub

> **VocalScale** - AI-powered voice assistant platform for businesses

## 📚 Documentation Index

This folder contains comprehensive documentation for the VocalScale frontend application.

### 📁 Structure

```
.agent/
├── README.md                 ← You are here - Documentation index
├── commands/                 ← Quick commands & scripts
│   └── update-doc.md
├── system/                   ← System architecture & design
│   ├── architecture.md
│   ├── tech-stack.md
│   └── project-structure.md
├── tasks/                    ← Tasks, PRDs & implementations
│   ├── prd-template.md
│   └── feature-*.md
└── sop/                      ← Standard Operating Procedures
    ├── add-new-page.md
    ├── add-api-endpoint.md
    └── styling-guide.md
```

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test
```

## 🏗️ System Overview

**VocalScale** is a React-based frontend application for an AI voice assistant platform. It allows businesses to:
- Set up AI voice agents
- Manage calls and appointments
- Handle orders and inventory
- Configure business hours and services
- View analytics and reports

### Key Features
- 🤖 AI Voice Agent Setup
- 📞 Call Management
- 📅 Appointment Scheduling
- 📦 Order & Inventory Management
- 📊 Analytics Dashboard
- 🎙️ Voice Agent Customization

## 📖 Documentation Guide

### For New Engineers
1. Start with **[System Architecture](./system/architecture.md)**
2. Read **[Tech Stack](./system/tech-stack.md)**
3. Review **[Project Structure](./system/project-structure.md)**

### For Feature Development
1. Check **[SOP: Add New Page](./sop/add-new-page.md)**
2. Review **[SOP: Add API Endpoint](./sop/add-api-endpoint.md)**
3. Follow **[Styling Guide](./sop/styling-guide.md)**

### For Project Management
1. Use **[PRD Template](./tasks/prd-template.md)** for new features
2. Track implementation in **[Tasks Folder](./tasks/)**

## 🔗 Related Docs

- Main App: `/frontend/src/App.tsx`
- Routes: `/frontend/src/pages/`
- API Layer: `/frontend/src/api/`
- Components: `/frontend/src/components/`
- Context: `/frontend/src/context/`

## 📝 Last Updated

- **Date**: 2026-02-16
- **Version**: 0.0.0
- **Status**: Production Ready

---

*For questions or updates, refer to the [SOP documentation](./sop/).*
