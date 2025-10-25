# 🎨 Quick Component Reference Guide

## Import Statement
```typescript
import {
  Container,
  PageHeader,
  Card,
  CardBody,
  Button,
  Input,
  Textarea,
  Select,
  Badge,
  LoadingSpinner,
  CircularProgress,
  Spinner,
} from '@/components/ui';
```

---

## 📦 Component Usage Examples

### Container
```tsx
<Container>
  <PageHeader 
    title="Page Title" 
    description="Page description"
    action={<Button variant="primary">Action</Button>}
  />
  {/* Your content */}
</Container>
```

### Card
```tsx
<Card hover>
  <CardBody>
    <h3 className="text-white font-bold">Card Title</h3>
    <p className="text-gray-300">Card content</p>
  </CardBody>
</Card>
```

### Button Variants
```tsx
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="danger">Danger</Button>
<Button variant="success">Success</Button>

{/* With icon and loading */}
<Button variant="primary" icon={Save} loading={saving}>
  Save Changes
</Button>
```

### Input
```tsx
<Input
  label="Email"
  name="email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  placeholder="Enter email"
  required
  helperText="We'll never share your email"
/>
```

### Textarea
```tsx
<Textarea
  label="Description"
  name="description"
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  rows={4}
  required
/>
```

### Select
```tsx
<Select
  label="Category"
  name="category"
  value={category}
  onChange={(e) => setCategory(e.target.value)}
  required
  options={[
    { value: 'cleanup', label: 'Cleanup' },
    { value: 'planting', label: 'Planting' },
  ]}
/>
```

### Badge
```tsx
<Badge variant="primary">Primary</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="danger">Danger</Badge>
```

### LoadingSpinner
```tsx
<LoadingSpinner 
  size="lg" 
  color="primary" 
  label="Loading data..." 
/>
```

### CircularProgress
```tsx
<CircularProgress 
  value={75} 
  size="md" 
  color="primary" 
  showValue 
  label="Progress" 
/>
```

---

## 🎭 Framer Motion Examples

### Stagger Animation (Lists)
```tsx
{items.map((item, index) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: index * 0.05 }}
  >
    {/* Item content */}
  </motion.div>
))}
```

### Fade In
```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.5 }}
>
  {/* Content */}
</motion.div>
```

### Scale Animation
```tsx
<motion.div
  initial={{ scale: 0 }}
  animate={{ scale: 1 }}
  transition={{ duration: 0.4 }}
>
  {/* Content */}
</motion.div>
```

### Hover Effects
```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Click Me
</motion.button>
```

### Animated Progress Bar
```tsx
<motion.div
  initial={{ width: 0 }}
  animate={{ width: `${progress}%` }}
  transition={{ duration: 1, ease: "easeOut" }}
  className="h-4 bg-gradient-to-r from-[#FA2FB5] to-[#FFC23C] rounded-full"
/>
```

### AnimatePresence (Enter/Exit)
```tsx
<AnimatePresence mode="wait">
  {showModal && (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      {/* Modal content */}
    </motion.div>
  )}
</AnimatePresence>
```

---

## 🎨 Color Classes

### Backgrounds
```css
bg-[#100720]  /* Primary background */
bg-[#31087B]  /* Secondary background */
bg-[#FA2FB5]  /* Primary accent */
bg-[#FFC23C]  /* Secondary accent */
```

### Gradients
```css
bg-gradient-to-r from-[#FA2FB5] to-[#FFC23C]
bg-gradient-to-br from-[#100720] via-[#31087B] to-[#100720]
```

### Text Colors
```css
text-white       /* Primary text */
text-gray-300    /* Secondary text */
text-gray-400    /* Tertiary text */
text-[#FA2FB5]   /* Accent text */
text-[#FFC23C]   /* Secondary accent text */
```

### Borders
```css
border-[#FA2FB5]/30
border-[#FFC23C]/50
border-2 border-[#FA2FB5]
```

---

## 📱 Responsive Utilities

### Grid Layouts
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Grid items */}
</div>
```

### Show/Hide
```tsx
<div className="hidden md:block">Desktop only</div>
<div className="md:hidden">Mobile only</div>
```

### Spacing
```tsx
<div className="p-4 md:p-6 lg:p-8">
  {/* Responsive padding */}
</div>
```

### Text Sizing
```tsx
<h1 className="text-xl md:text-2xl lg:text-3xl">
  Responsive Heading
</h1>
```

---

## 🔧 Common Patterns

### Loading State
```tsx
{loading ? (
  <Card>
    <CardBody className="py-12 text-center">
      <LoadingSpinner size="lg" color="primary" label="Loading..." />
    </CardBody>
  </Card>
) : (
  <div>{/* Content */}</div>
)}
```

### Empty State
```tsx
<Card>
  <CardBody className="py-12 text-center">
    <p className="text-gray-400 mb-4">No items found</p>
    <Button variant="primary" onClick={handleAction}>
      Create New Item
    </Button>
  </CardBody>
</Card>
```

### Form Layout
```tsx
<form onSubmit={handleSubmit} className="space-y-6">
  <Input label="Title" name="title" value={title} onChange={handleChange} required />
  <Textarea label="Description" name="description" value={description} onChange={handleChange} required />
  
  <div className="grid md:grid-cols-2 gap-6">
    <Select label="Category" name="category" value={category} onChange={handleChange} options={options} />
    <Input label="Points" name="points" type="number" value={points} onChange={handleChange} />
  </div>
  
  <div className="flex gap-3">
    <Button type="submit" variant="primary" loading={saving}>
      Save
    </Button>
    <Button type="button" variant="outline" onClick={handleCancel}>
      Cancel
    </Button>
  </div>
</form>
```

### Success/Error Messages
```tsx
<motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-4"
>
  <p className="text-green-400">Success message!</p>
</motion.div>
```

---

## 🎯 Category Colors

```typescript
const getCategoryColor = (category: string) => {
  const colors: Record<string, 'primary' | 'success' | 'secondary' | 'warning'> = {
    cleanup: 'primary',
    planting: 'success',
    recycling: 'secondary',
    education: 'warning',
    other: 'primary',
  };
  return colors[category] || 'primary';
};

<Badge variant={getCategoryColor(category)} className="capitalize">
  {category}
</Badge>
```

---

## 📚 Complete Component API

### Button Props
- `variant`: 'primary' | 'secondary' | 'outline' | 'danger' | 'success'
- `size`: 'sm' | 'md' | 'lg'
- `icon`: LucideIcon component
- `loading`: boolean
- `disabled`: boolean
- `fullWidth`: boolean
- `children`: ReactNode

### Input Props
- `label`: string
- `name`: string
- `type`: string
- `value`: string
- `onChange`: ChangeEventHandler
- `placeholder`: string
- `required`: boolean
- `disabled`: boolean
- `helperText`: string

### LoadingSpinner Props
- `size`: 'sm' | 'md' | 'lg'
- `color`: 'primary' | 'secondary' | 'warning'
- `label`: string (optional)

### CircularProgress Props
- `value`: number (0-100)
- `size`: 'sm' | 'md' | 'lg'
- `color`: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
- `showValue`: boolean
- `label`: string
- `animated`: boolean

---

**Quick Tip**: All components are TypeScript-ready with full IntelliSense support! 🚀
