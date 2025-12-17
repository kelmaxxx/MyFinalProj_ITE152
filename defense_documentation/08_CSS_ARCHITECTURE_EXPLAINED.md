# CSS Architecture - Styling System Explained

## 📄 CSS Organization Strategy

Your project uses a **modular CSS architecture** where styles are split into logical files. This makes the code maintainable and follows the **Single Responsibility Principle**.

---

## 📄 static/css/variables.css - Design System Foundation

### Purpose
Defines **CSS Custom Properties (variables)** used throughout the application. Centralizes design decisions.

### Typical Content
```css
:root {
    /* Colors */
    --primary-color: #2563eb;
    --secondary-color: #64748b;
    --success-color: #10b981;
    --danger-color: #ef4444;
    --warning-color: #f59e0b;
    --info-color: #3b82f6;
    
    /* Background Colors */
    --bg-primary: #ffffff;
    --bg-secondary: #f8fafc;
    --bg-dark: #1e293b;
    
    /* Text Colors */
    --text-primary: #0f172a;
    --text-secondary: #64748b;
    --text-muted: #94a3b8;
    
    /* Spacing */
    --spacing-xs: 0.25rem;
    --spacing-sm: 0.5rem;
    --spacing-md: 1rem;
    --spacing-lg: 1.5rem;
    --spacing-xl: 2rem;
    
    /* Border Radius */
    --radius-sm: 0.25rem;
    --radius-md: 0.5rem;
    --radius-lg: 0.75rem;
    
    /* Shadows */
    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
    
    /* Typography */
    --font-family: system-ui, -apple-system, sans-serif;
    --font-size-sm: 0.875rem;
    --font-size-base: 1rem;
    --font-size-lg: 1.125rem;
    --font-size-xl: 1.25rem;
    --font-size-2xl: 1.5rem;
    
    /* Transitions */
    --transition-fast: 150ms ease;
    --transition-base: 200ms ease;
    --transition-slow: 300ms ease;
}
```

### Why CSS Variables?
1. **Single Source of Truth**: Change color once, updates everywhere
2. **Easy Theming**: Can implement dark mode by changing variables
3. **Consistency**: Ensures same values used throughout
4. **Maintainability**: No magic numbers scattered in code

### Using Variables
```css
/* Define in variables.css */
:root {
    --primary-color: #2563eb;
}

/* Use in other files */
.button {
    background-color: var(--primary-color);
}
```

---

## 📄 static/css/layout.css - Page Structure

### Purpose
Defines overall page layout, grid system, and container styles.

### Key Patterns

#### 1. Container
```css
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--spacing-md);
}
```
- **Centers content** on page
- **max-width**: Prevents content from being too wide
- **margin: 0 auto**: Centers horizontally
- **padding**: Adds breathing room on sides

#### 2. Grid System
```css
.grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: var(--spacing-lg);
}
```
- **display: grid**: CSS Grid layout
- **repeat(auto-fill, ...)**: Creates responsive columns
- **minmax(300px, 1fr)**: Columns min 300px, max equal width
- **gap**: Space between grid items

**How It Works:**
- Automatically fits as many 300px columns as possible
- Columns expand to fill available space
- Responsive without media queries

#### 3. Flexbox Utilities
```css
.flex {
    display: flex;
}

.flex-center {
    display: flex;
    justify-content: center;
    align-items: center;
}

.flex-between {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
```
- Common layout patterns as reusable classes
- **justify-content**: Horizontal alignment
- **align-items**: Vertical alignment

---

## 📄 static/css/components.css - Reusable UI Elements

### Purpose
Styles for buttons, cards, badges, and other reusable components.

### Key Components

#### 1. Buttons
```css
.btn {
    padding: var(--spacing-sm) var(--spacing-md);
    border: none;
    border-radius: var(--radius-md);
    font-size: var(--font-size-base);
    cursor: pointer;
    transition: all var(--transition-base);
    background-color: var(--bg-secondary);
    color: var(--text-primary);
}

.btn:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
}

.btn-primary {
    background-color: var(--primary-color);
    color: white;
}

.btn-danger {
    background-color: var(--danger-color);
    color: white;
}

.btn-sm {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: var(--font-size-sm);
}
```

**BEM-like Naming:**
- `.btn`: Base component
- `.btn-primary`: Modifier (variation)
- `.btn-sm`: Size modifier

**Usage:**
```html
<button class="btn">Default</button>
<button class="btn btn-primary">Primary</button>
<button class="btn btn-primary btn-sm">Small Primary</button>
```

#### 2. Cards
```css
.card {
    background: var(--bg-primary);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    padding: var(--spacing-lg);
    transition: box-shadow var(--transition-base);
}

.card:hover {
    box-shadow: var(--shadow-md);
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--spacing-md);
}

.card-actions {
    display: flex;
    gap: var(--spacing-sm);
}
```

**Card Structure:**
```html
<div class="card">
    <div class="card-header">
        <h3>Title</h3>
        <div class="card-actions">
            <button class="btn btn-sm">Action</button>
        </div>
    </div>
</div>
```

---

## 📄 static/css/tables.css - Table Styling

### Purpose
Styles for data tables with alternating rows and hover effects.

### Example Styles
```css
.data-table {
    width: 100%;
    border-collapse: collapse;
    border-radius: var(--radius-md);
    overflow: hidden;
}

.data-table thead {
    background-color: var(--bg-dark);
    color: white;
}

.data-table th {
    padding: var(--spacing-md);
    text-align: left;
    font-weight: 600;
}

.data-table td {
    padding: var(--spacing-md);
    border-bottom: 1px solid var(--bg-secondary);
}

.data-table tbody tr:hover {
    background-color: var(--bg-secondary);
}

.data-table tbody tr:nth-child(even) {
    background-color: rgba(0, 0, 0, 0.02);
}
```

**Key Features:**
- **border-collapse**: Removes space between cells
- **nth-child(even)**: Zebra striping (alternating rows)
- **hover**: Highlights row on mouse over
- **Responsive**: Can add horizontal scroll for mobile

---

## 📄 static/css/forms.css - Form Elements

### Purpose
Styles for inputs, selects, labels, and form groups.

### Example Styles
```css
.form-group {
    margin-bottom: var(--spacing-lg);
}

.form-group label {
    display: block;
    margin-bottom: var(--spacing-xs);
    font-weight: 500;
    color: var(--text-primary);
}

.form-group input,
.form-group select,
.form-group textarea {
    width: 100%;
    padding: var(--spacing-sm);
    border: 1px solid #cbd5e1;
    border-radius: var(--radius-md);
    font-size: var(--font-size-base);
    transition: border-color var(--transition-base);
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.checkbox-group {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: var(--spacing-sm);
}

.checkbox-group label {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    cursor: pointer;
}
```

**Focus States:**
- **outline: none**: Removes default browser outline
- **box-shadow**: Custom focus indicator (accessibility)
- **border-color**: Visual feedback

---

## 📄 static/css/modals.css - Modal Dialogs

### Purpose
Styles for popup modals with overlay.

### Example Styles
```css
.modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    border-radius: var(--radius-lg);
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: var(--shadow-lg);
}

.modal-large {
    max-width: 800px;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-lg);
    border-bottom: 1px solid var(--bg-secondary);
}

.modal-body {
    padding: var(--spacing-lg);
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--spacing-sm);
    padding: var(--spacing-lg);
    border-top: 1px solid var(--bg-secondary);
}

.close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--text-secondary);
}
```

**Key Properties:**
- **position: fixed**: Stays in place when scrolling
- **z-index: 1000**: Appears above everything else
- **rgba(0, 0, 0, 0.5)**: Semi-transparent black overlay
- **max-height: 90vh**: Prevents modal from being taller than screen

**Showing/Hiding:**
```javascript
// Show modal
modal.style.display = 'flex';

// Hide modal
modal.style.display = 'none';
```

---

## 📄 static/css/toast.css - Notifications

### Purpose
Styles for toast notifications (success, error, info, warning).

### Example Styles
```css
#toast-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 2000;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
}

.toast {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    min-width: 300px;
    background: white;
    transform: translateX(400px);
    transition: transform var(--transition-slow);
}

.toast.show {
    transform: translateX(0);
}

.toast-success {
    border-left: 4px solid var(--success-color);
}

.toast-error {
    border-left: 4px solid var(--danger-color);
}

.toast-info {
    border-left: 4px solid var(--info-color);
}

.toast-warning {
    border-left: 4px solid var(--warning-color);
}

.toast-icon {
    font-size: var(--font-size-xl);
    font-weight: bold;
}

.toast-success .toast-icon {
    color: var(--success-color);
}

.toast-error .toast-icon {
    color: var(--danger-color);
}
```

**Animation:**
```css
.toast {
    transform: translateX(400px);  /* Start off-screen */
}

.toast.show {
    transform: translateX(0);  /* Slide in */
}
```

**JavaScript adds 'show' class:**
```javascript
toast.classList.add('show');  // Slides in
toast.classList.remove('show');  // Slides out
```

---

## 📄 static/css/footer.css - Footer Styling

### Purpose
Styles for page footer.

### Example Styles
```css
footer {
    background-color: var(--bg-dark);
    color: white;
    text-align: center;
    padding: var(--spacing-xl) 0;
    margin-top: var(--spacing-xl);
}

footer p {
    margin: 0;
    color: var(--text-muted);
}
```

---

## 📄 static/css/responsive.css - Mobile Optimization

### Purpose
Media queries for different screen sizes. **Loaded last** to override other styles.

### Example Styles
```css
/* Tablet and below */
@media (max-width: 768px) {
    .container {
        padding: 0 var(--spacing-sm);
    }
    
    .grid {
        grid-template-columns: 1fr;
    }
    
    .card-header {
        flex-direction: column;
        align-items: flex-start;
    }
    
    .card-actions {
        width: 100%;
        margin-top: var(--spacing-sm);
    }
    
    .stats-overview {
        flex-direction: column;
    }
    
    .modal-content {
        width: 95%;
    }
}

/* Mobile */
@media (max-width: 480px) {
    .btn {
        width: 100%;
        text-align: center;
    }
    
    .tab-button {
        font-size: var(--font-size-sm);
        padding: var(--spacing-sm);
    }
    
    h1 {
        font-size: var(--font-size-xl);
    }
    
    .checkbox-group {
        grid-template-columns: 1fr;
    }
}
```

**Mobile-First Approach:**
- Base styles for mobile
- Media queries enhance for larger screens
- **max-width: 768px**: Tablets and below
- **max-width: 480px**: Phones only

---

## 🔑 CSS Concepts Used

### 1. CSS Custom Properties
```css
:root {
    --primary-color: #2563eb;
}

.button {
    background: var(--primary-color);
}
```

### 2. CSS Grid
```css
.grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
}
```

### 3. Flexbox
```css
.flex {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
```

### 4. Transitions
```css
.button {
    transition: all 200ms ease;
}

.button:hover {
    transform: translateY(-2px);
}
```

### 5. Pseudo-classes
```css
.button:hover { }
.button:focus { }
.row:nth-child(even) { }
```

### 6. Media Queries
```css
@media (max-width: 768px) {
    .grid {
        grid-template-columns: 1fr;
    }
}
```

### 7. Box Shadow
```css
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
```

---

## 🎨 Design Principles

### 1. **Consistency**
- Same spacing, colors, border-radius throughout
- Variables ensure consistency

### 2. **Modularity**
- Each CSS file has single responsibility
- Easy to find and modify styles

### 3. **Reusability**
- Component classes (.btn, .card)
- Utility classes (.flex, .text-center)

### 4. **Responsive**
- Mobile-first approach
- Grid auto-adapts to screen size

### 5. **Accessibility**
- Focus states for keyboard navigation
- Good color contrast
- Proper hover states

---

## ❓ Defense Questions

**Q: Why split CSS into multiple files?**
A: Modularity and maintainability. Each file has a specific purpose, making it easier to find and modify styles.

**Q: What are CSS variables and why use them?**
A: CSS Custom Properties that store values like colors and spacing. Using them ensures consistency and makes theme changes easy.

**Q: How does the grid system work?**
A: Uses CSS Grid with `repeat(auto-fill, minmax(300px, 1fr))`. Automatically creates responsive columns without media queries.

**Q: What's mobile-first design?**
A: Start with mobile styles, then use media queries to enhance for larger screens. More maintainable than desktop-first.

**Q: How do modals appear on top?**
A: Using `position: fixed` and `z-index: 1000` to appear above other content.

**Q: How are toasts animated?**
A: Start with `transform: translateX(400px)` (off-screen), then JavaScript adds 'show' class which animates to `translateX(0)`.
