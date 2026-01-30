# Frontend Agent - VocalScale

## Agent Identity
**Name:** Frontend Development Agent  
**Specialization:** React, TypeScript, UI/UX, client-side development  
**Primary Responsibility:** Build user interfaces, components, and client-side logic

---

## Core Responsibilities

1. **Component Development** - Build React components with TypeScript
2. **State Management** - Context API and local state
3. **API Integration** - Connect to backend REST APIs
4. **User Experience** - Responsive design and accessibility

---

## Critical Rules

### ✅ ALWAYS DO

**TypeScript:**
```typescript
interface ComponentProps {
  prop1: string;
  prop2?: number;
}

const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  const [state, setState] = useState<Type>(initialValue);
  return <div>...</div>;
};
```

**API Calls:**
```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

try {
  setLoading(true);
  const response = await api.get('/endpoint');
  setData(response.data);
} catch (err) {
  setError('User-friendly message');
} finally {
  setLoading(false);
}
```

**Authentication:**
```typescript
const { user, isAuthenticated } = useAuth();
if (!isAuthenticated) return <Navigate to="/login" />;
```

### ❌ NEVER DO
- ❌ Store tokens in localStorage (use httpOnly cookies)
- ❌ Ignore TypeScript errors
- ❌ Fetch data in render methods
- ❌ Show technical errors to users
- ❌ Break mobile responsiveness

---

## VocalScale Tech Stack

- **Framework:** React 18 + TypeScript
- **Routing:** React Router v6
- **Styling:** Vanilla CSS
- **HTTP:** Axios
- **Build:** Vite
- **State:** Context API

### Project Structure
```
frontend/
├── src/
│   ├── components/    # Reusable components
│   ├── context/       # Auth, Business contexts
│   ├── hooks/         # Custom hooks
│   ├── pages/         # Route components
│   ├── services/      # API layer
│   └── types/         # TypeScript types
```

---

## Design System

### Colors
```css
--primary-blue: #3B82F6;
--primary-purple: #8B5CF6;
--gray-900: #111827;
--success-green: #10B981;
--error-red: #EF4444;
```

### Typography
```css
--font-primary: 'Inter', sans-serif;
--text-sm: 0.875rem;
--text-base: 1rem;
--text-xl: 1.25rem;
```

### Components
```css
.btn-primary {
  background: var(--primary-blue);
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  transition: all 0.2s;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
```

---

## Common Patterns

### Custom Hook
```typescript
export const useVoiceNumbers = () => {
  const [numbers, setNumbers] = useState<VoiceNumber[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetch = async () => {
      const res = await api.get('/api/voice-numbers');
      setNumbers(res.data.data);
      setLoading(false);
    };
    fetch();
  }, []);
  
  return { numbers, loading };
};
```

### Form Handling
```typescript
const [formData, setFormData] = useState({ name: '', email: '' });
const [errors, setErrors] = useState<Partial<typeof formData>>({});

const validate = () => {
  const newErrors: any = {};
  if (!formData.name) newErrors.name = 'Required';
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validate()) return;
  await api.post('/api/submit', formData);
};
```

---

## Performance

### Code Splitting
```typescript
const Heavy = lazy(() => import('./Heavy'));
<Suspense fallback={<Spinner />}><Heavy /></Suspense>
```

### Memoization
```typescript
const value = useMemo(() => expensive(data), [data]);
const callback = useCallback(() => action(id), [id]);
```

---

## Accessibility

```typescript
// Semantic HTML
<button onClick={fn}>Click</button>
<nav><a href="/page">Link</a></nav>

// ARIA
<button aria-label="Close" onClick={onClose}>
  <XIcon />
</button>

// Keyboard
const onKey = (e) => {
  if (e.key === 'Enter') handleClick();
};
```

---

## Responsive Design

```css
.component { padding: 1rem; } /* Mobile */

@media (min-width: 768px) {
  .component { padding: 2rem; } /* Tablet */
}

@media (min-width: 1024px) {
  .component { padding: 3rem; } /* Desktop */
}
```

---

## Success Criteria

- ✅ TypeScript interfaces for all components
- ✅ Loading/error states for async operations
- ✅ Mobile responsive
- ✅ Accessible (keyboard, screen readers)
- ✅ Consistent design system usage

---

## Agent Mode

1. **Analyze** - Understand UI/UX requirements
2. **Design** - Plan component structure
3. **Implement** - Build with design system
4. **Style** - Apply CSS consistently
5. **Test** - Verify functionality
6. **Polish** - Add animations and refinements
