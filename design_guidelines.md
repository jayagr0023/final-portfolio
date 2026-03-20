# Design Guidelines: Modern Personal Portfolio Website

## Design Approach
**Reference-Based Design** inspired by the provided dark purple theme template. This is a visually-rich, experience-focused portfolio with emphasis on smooth animations, gradient effects, and immersive dark aesthetics.

## Core Design Principles
- **Dark Immersive Experience**: Deep purple backgrounds with glowing gradient accents
- **Smooth Interactivity**: Gentle hover effects, scroll animations, and transitions
- **Visual Hierarchy**: Strategic use of gradients, glows, and scale to guide attention
- **Professional Polish**: Card-based layouts with subtle borders and elevation effects

---

## Color Palette
- **Primary Background**: `#1a0b2e` (deep purple)
- **Secondary Background**: `#16213e` (dark blue-purple)
- **Card Backgrounds**: `rgba(255, 255, 255, 0.05)` with gradient borders
- **Gradient Accents**: Purple-to-pink (`#8b5cf6` → `#ec4899`), blue-to-purple (`#3b82f6` → `#8b5cf6`)
- **Text Primary**: `#ffffff`
- **Text Secondary**: `rgba(255, 255, 255, 0.7)`
- **Glow Effects**: Purple/pink radial gradients with blur

---

## Typography
**Primary Font**: Inter or Poppins (Google Fonts)
**Secondary Font**: Space Grotesk or DM Sans

**Hierarchy**:
- **Hero Title**: 4xl to 6xl, font-weight 700, white
- **Section Headings**: 3xl to 4xl, font-weight 700, gradient text effect
- **Subheadings**: xl to 2xl, font-weight 600
- **Body Text**: base to lg, font-weight 400, white with 0.7 opacity
- **Quotes**: 2xl to 3xl, italic, font-weight 300, gradient or glow effect
- **Navigation**: base, font-weight 500, uppercase tracking

---

## Layout System
**Spacing Units**: Tailwind units of 4, 8, 12, 16, 20, 24, 32
**Container**: max-w-7xl with px-6 to px-12
**Section Padding**: py-20 to py-32 for desktop, py-12 to py-16 for mobile
**Grid System**: 12-column responsive grid

---

## Component Library

### Navigation Bar
- Fixed top position with backdrop blur (`backdrop-blur-md`)
- Semi-transparent background: `rgba(26, 11, 46, 0.8)`
- Smooth scroll links to Home, About, Skills, Contact
- Hover effect: gradient underline animation
- Logo/name on left, nav links on right
- Mobile: Hamburger menu with slide-in drawer

### Hero Section (Home)
**Layout**: Full viewport height (min-h-screen), centered content
**Structure**:
- Left: Text content with animated typing effect for profession titles ("Web Developer", "UI/UX Designer", etc.)
- Right: Animated character illustration or abstract gradient shape
- Background: Radial gradient glow effect emanating from character
- CTA buttons with gradient backgrounds and subtle glow
- Inspiring quote below main content in elegant italic typography

**Character Illustration**: Use SVG or high-quality PNG of professional character with purple/pink gradient lighting, floating animation

### About Section
**Layout**: Two-column (desktop), stacked (mobile)
**Structure**:
- Professional bio paragraph with highlighted current role
- Work experience cards in grid (2 columns on desktop)
- Each card: gradient border (`border-image: linear-gradient`), glass morphism background, hover lift effect
- Inspiring quote at section top or bottom with gradient text
- Section heading with gradient underline animation

### Skills Section
**Layout**: Multi-column grid (3-4 columns desktop, 2 tablet, 1 mobile)
**Structure**:
- Skill category cards with icons (use Heroicons or Font Awesome)
- Each card: dark background, gradient border on hover, scale transform
- Skill items with proficiency indicators (gradient progress bars or star ratings)
- Icon + title + description format
- Inspiring quote centered above or below skills grid
- Subtle stagger animation on scroll

### Contact Section
**Layout**: Centered content, max-w-2xl
**Structure**:
- Contact form with gradient-bordered inputs
- Input fields: dark background, white text, purple focus glow
- Submit button: gradient background, hover glow effect
- Social media links with icon buttons (gradient on hover)
- Email/phone display with copy-to-clipboard functionality
- Inspiring quote above form
- Form fields: Name, Email, Message (textarea)

### Quotes Design
**Placement**: Each section prominently features a quote
**Styling**:
- Large italic text (2xl to 3xl)
- Gradient text effect or subtle glow
- Quotation marks styled with gradient
- Author attribution in smaller, secondary text
- Center-aligned or left-aligned based on section layout

---

## Animations & Interactions

### Page Load
- Hero text: Fade-in from bottom with stagger
- Character: Gentle floating animation (transform: translateY)
- Sections: Fade-in on scroll with intersection observer

### Hover Effects
- Cards: Scale(1.05), gradient border intensity increase, subtle shadow glow
- Buttons: Brightness increase, glow expansion
- Links: Gradient underline slide animation
- Skill cards: Border color shift, slight lift

### Scroll Animations
- Parallax effect on hero background glow
- Stagger animations for card grids
- Smooth scroll behavior for navigation links
- Progress indicator for scroll depth

---

## Responsive Breakpoints
- **Mobile**: < 640px (single column, stacked layouts)
- **Tablet**: 640px - 1024px (2 columns where applicable)
- **Desktop**: > 1024px (multi-column, full layouts)

---

## Images

### Hero Section
**Large Hero Image**: Yes - Animated character illustration
- **Description**: Professional character illustration with purple/pink gradient lighting effect, standing or working pose
- **Placement**: Right side of hero section (desktop), below text (mobile)
- **Style**: Modern vector art or 3D render with gradient overlays matching color palette
- **Effect**: Floating animation, radial glow emanating around character

### About Section
Optional: Professional headshot or workspace photo with purple gradient overlay

---

## Accessibility
- Minimum contrast ratio 4.5:1 for all text
- Focus states with visible purple glow outline
- Keyboard navigation support
- ARIA labels for interactive elements
- Semantic HTML structure

---

## Special Effects
- **Gradient Borders**: `border-image` or pseudo-elements with linear-gradient
- **Glass Morphism**: `backdrop-filter: blur(10px)` with semi-transparent backgrounds
- **Glow Effects**: `box-shadow` with purple/pink colors and large blur radius
- **Text Gradients**: `background-clip: text` with linear-gradient backgrounds