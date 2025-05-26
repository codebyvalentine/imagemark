# ImageMark - Free Online Watermark Tool

A fast, secure, and completely free web-based tool for adding watermarks to your images. Process multiple images with custom text or logo watermarks, all running entirely in your browser for maximum privacy.

## ✨ Features

- **🚀 Lightning Fast** - Process multiple images in seconds
- **🔒 100% Private** - All processing happens in your browser, images never leave your device
- **💰 Always Free** - No limits, no subscriptions, no hidden costs
- **📱 Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **🎨 Customizable Watermarks** - Add text or image watermarks with full control over:
  - Position and rotation
  - Size and opacity
  - Font color (light/dark modes)
  - Advanced positioning controls
- **📦 Batch Processing** - Upload and watermark multiple images at once
- **⬇️ Multiple Download Options** - Download individual images or all as a ZIP file
- **🎯 Smart Brightness Detection** - Automatically suggests optimal watermark color based on image content

## 🚀 Quick Start

1. Visit the application in your web browser
2. Upload your images by clicking "Choose Images" or drag and drop
3. Customize your watermark settings (text, position, opacity, etc.)
4. Download your watermarked images individually or as a ZIP file

## 🛠️ Technology Stack

- **Frontend Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Image Processing**: HTML5 Canvas API
- **File Handling**: Browser File API
- **Archive Creation**: JSZip

## 📋 Supported Formats

- **Input**: JPEG, PNG
- **Output**: PNG (high quality, lossless)

## 🏗️ Installation & Development

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Setup

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/codebyvalentine/imagemark.git
   cd imagemark
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   \`\`\`

3. **Run the development server**
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   \`\`\`

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

\`\`\`bash
npm run build
npm start
\`\`\`

## 📁 Project Structure

\`\`\`
imagemark/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with metadata
│   ├── page.tsx           # Main application component
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
│   └── ui/               # shadcn/ui components
├── public/               # Static assets
│   ├── site.webmanifest  # PWA manifest
│   └── ...               # Icons and images
├── lib/                  # Utility functions
└── hooks/                # Custom React hooks
\`\`\`

## 🎨 Key Components

### WatermarkingTool
The main application component that handles:
- Image upload and processing
- Watermark settings management
- Canvas rendering and manipulation
- File downloads

### Custom Hooks
- `useImageBrightness` - Analyzes image brightness for optimal watermark color
- `useWatermarkCanvas` - Handles canvas operations and watermark rendering

### Utility Functions
- `createImageFromFile` - Converts File objects to HTMLImageElement
- `downloadBlob` - Handles file downloads
- `canvasToBlob` - Converts canvas to downloadable blob

## 🔧 Configuration

### Environment Variables

No environment variables are required for basic functionality. The application runs entirely client-side.

### Customization

You can customize the default watermark settings by modifying the `DEFAULT_SETTINGS` constant in `app/page.tsx`:

\`\`\`typescript
const DEFAULT_SETTINGS: WatermarkSettings = {
  type: "text",
  text: "Your Default Text",
  fontSize: 14,
  fontMode: "light",
  opacity: 10,
  rotation: -45,
  positionX: 50,
  positionY: 50,
  imageSize: 25,
}
\`\`\`

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`npm run test && npm run lint`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style

- We use ESLint and Prettier for code formatting
- Follow TypeScript best practices
- Use semantic commit messages
- Write tests for new features

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Bug Reports & Feature Requests

Please use the [GitHub Issues](https://github.com/codebyvalentine/imagemark/issues) page to report bugs or request features.

### Bug Report Template

\`\`\`markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior.

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g. Windows 10, macOS 12]
- Browser: [e.g. Chrome 96, Firefox 95]
- Version: [e.g. 1.0.0]
\`\`\`

## 🔒 Privacy & Security

- **No Data Collection**: We don't collect, store, or transmit any user data
- **Client-Side Processing**: All image processing happens in your browser
- **No Server Dependencies**: Images never leave your device
- **Open Source**: Full transparency with publicly available source code

## 📊 Performance

- **Optimized Canvas Operations**: Efficient image processing algorithms
- **Memory Management**: Proper cleanup of image objects and canvas elements
- **Responsive Design**: Optimized for all device sizes
- **Progressive Enhancement**: Works without JavaScript for basic functionality

## 🌟 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Lucide](https://lucide.dev/) for the icon set
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Next.js](https://nextjs.org/) for the React framework

## 📈 Roadmap

- [ ] Support for additional image formats (WebP, AVIF)
- [ ] Batch watermark templates
- [ ] Advanced text styling options
- [ ] Watermark presets and saving
- [ ] Image filters and effects
- [ ] API for programmatic access
- [ ] Progressive Web App (PWA) features

---

**Made with ❤️ by the open source community**

If you find this project useful, please consider giving it a ⭐ on GitHub!
