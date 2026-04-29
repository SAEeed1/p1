# I Stand With Iran - Campaign Website

A professional, high-impact campaign website built with the **Huashu Design** framework. This site supports a global movement in solidarity with the Iranian people.

## Features

- **Multi-language Support**: 5 languages (English, Arabic, Spanish, French, Chinese)
- **Responsive Design**: Fully responsive for all device sizes
- **RTL Support**: Full right-to-left support for Arabic
- **Interactive Components**:
  - Language switcher with persistent preferences
  - Animated supporter counter
  - Sign-up form with validation
- **Modern Aesthetic**: Minimalist, authoritative design with smooth animations

## Project Structure

```
istandwithiran/
├── index.html              # Main landing page
├── styles/
│   └── main.css           # All styles and responsive breakpoints
├── components/
│   ├── lang-switcher.js   # Language switching component
│   ├── support-counter.js # Supporter counter with animation
│   └── signup-form.js     # Form handling and validation
├── locales/
│   └── translations.json  # Translation strings (reference)
└── assets/                # Images and media (placeholder)
```

## Quick Start

1. Open `index.html` in any modern web browser
2. No build step required - pure HTML/CSS/JavaScript

## Huashu Design Integration

This project implements the Huashu Design framework principles:

- **HTML-native UI**: Single-file components with inline scripts
- **Professional aesthetics**: Clean typography, thoughtful spacing
- **Component-based architecture**: Modular JavaScript components
- **Animation polish**: Smooth transitions and micro-interactions

## Supported Languages

| Code | Language | Native Name |
|------|----------|-------------|
| en   | English  | English     |
| ar   | Arabic   | العربية     |
| es   | Spanish  | Español     |
| fr   | French   | Français    |
| zh   | Chinese  | 中文        |

## Color Palette

- **Background**: `#0a0a0a` (Primary), `#141414` (Secondary)
- **Text**: `#ffffff` (Primary), `#b8b8b8` (Secondary)
- **Accent**: `#c41e3a` (Deep red - authority and passion)

## Customization

### Adding New Languages

1. Add translations to the `<script id="translations-data">` block in `index.html`
2. Add the language code to the `supportedLangs` array in `lang-switcher.js`
3. Add the language abbreviation in `langNames` object

### Modifying Styles

Edit `styles/main.css`. Key sections:
- `:root` - CSS custom properties (colors, spacing, fonts)
- `.hero` - Hero section styles
- `.about` - About section styles
- `.counter-section` - Sign-up form styles
- `.footer` - Footer styles
- Media queries - Responsive breakpoints at 768px and 480px

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

This project is open source and available for campaign use.

---

Built with ❤️ using Huashu Design framework
