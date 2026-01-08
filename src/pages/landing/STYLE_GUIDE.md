# Vocal Scale Landing Page Style Guide

## 1. Typography
- **Primary Font**: Inter (Sans-serif)
- **Scale**:
  - **Display (Hero)**: 8xl (72px+), Tracking-tight, Slate-900
  - **Heading 1**: 6xl (60px), Tracking-tight, Slate-900
  - **Heading 2**: 5xl (48px), Tracking-tight, Slate-900
  - **Heading 3**: 2xl (24px), Tracking-tight, Slate-900
  - **Body (Large)**: xl (20px), Slate-600, Leading-relaxed
  - **Body (Regular)**: [15px], Slate-600, Leading-relaxed
  - **Small/Label**: sm (14px), Slate-500, Medium weight

## 2. Color Palette
- **Primary**: Indigo-600 (#4f46e5)
- **Primary Hover**: Indigo-700 (#4338ca)
- **Accents**: 
  - Purple-600 (#9333ea)
  - Pink-600 (#db2777)
- **Neutrals**:
  - Background: White (#ffffff)
  - Section Background: Slate-50/50 (#f8fafc)
  - Text Primary: Slate-900 (#0f172a)
  - Text Secondary: Slate-600 (#475569)
  - Text Muted: Slate-500 (#64748b)
  - Borders: Slate-200 (#e2e8f0)

## 3. Spacing & Grid (8px System)
- **Section Padding**: `py-32` (128px)
- **Component Padding**: `p-8` (32px) or `p-6` (24px)
- **Gaps**: `gap-8` (32px), `gap-6` (24px), `gap-4` (16px)
- **Container**: `max-w-7xl` (1280px), `px-6` (24px) horizontal padding

## 4. Components & Interactive States
- **Buttons**:
  - **Primary**: Indigo-600, Rounded-lg/xl, Hover: Shadow-indigo-600/30, Scale-105 (for Hero)
  - **Secondary**: White/80 with border, Backdrop-blur, Hover: Bg-white
- **Cards**:
  - Background: White
  - Border: Slate-200
  - Corners: Rounded-3xl (24px)
  - Hover: -Translate-y-2, Shadow-xl
- **Links**:
  - Hover: Slate-900, Transition-colors

## 5. Visual Motifs
- **Gradients**: Indigo-600 to Purple-600 for emphasis
- **Background Blobs**: Subtle, blurred radial gradients (indigo-100/40, purple-100/40)
- **Shadows**: Soft, multi-layered shadows for depth (shadow-2xl)
- **Glassmorphism**: `backdrop-blur-xl` and `bg-white/60` for overlays (Navbar)

## 6. Accessibility
- **Contrast**: Maintain WCAG AA compliance (4.5:1 for body text)
- **Interactive**: Focus rings for keyboard navigation
- **Semantics**: Proper use of `nav`, `main`, `section`, `h1-h4`, `footer`
