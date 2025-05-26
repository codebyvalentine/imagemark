# ImageMark

ImageMark is a command-line tool for adding watermarks to images.

## Features

*   Add text watermarks to images
*   Customize font, color, and size of the watermark
*   Adjust watermark position and opacity
*   Supports multiple image formats (JPEG, PNG, GIF, etc.)
*   Batch processing of images

## Installation

\`\`\`bash
npm install -g imagemark
\`\`\`

## Usage

\`\`\`bash
imagemark --text "My Watermark" --image input.jpg --output output.jpg
\`\`\`

### Options

*   `--text`: The text to use as the watermark.
*   `--image`: The input image file.
*   `--output`: The output image file.
*   `--font`: The font to use for the watermark (default: Arial).
*   `--color`: The color of the watermark (default: white).
*   `--size`: The size of the watermark (default: 20).
*   `--position`: The position of the watermark (default: bottom-right).  Possible values: top-left, top-right, bottom-left, bottom-right, center.
*   `--opacity`: The opacity of the watermark (default: 0.5).

## Examples

\`\`\`bash
imagemark --text "Copyright 2023" --image input.png --output output.png --color black --position bottom-left
\`\`\`

\`\`\`bash
imagemark --text "Confidential" --image input.jpg --output output.jpg --font "Times New Roman" --size 30 --opacity 0.8
\`\`\`

## Clone the repository

\`\`\`bash
git clone https://github.com/codebyvalentine/imagemark.git
cd imagemark
\`\`\`

## Development Workflow

1.  Fork the repository on GitHub.
2.  Clone your fork to your local machine:

    \`\`\`bash
    git clone https://github.com/<your-username>/imagemark.git
    \`\`\`
3.  Create a new branch for your changes:

    \`\`\`bash
    git checkout -b feature/my-new-feature
    \`\`\`
4.  Make your changes and commit them:

    \`\`\`bash
    git add .
    git commit -m "Add my new feature"
    \`\`\`
5.  Push your branch to GitHub:

    \`\`\`bash
    git push origin feature/my-new-feature
    \`\`\`
6.  Create a pull request on GitHub.

## Bug Reports & Feature Requests

Please use the [GitHub Issues](https://github.com/codebyvalentine/imagemark/issues) page to report bugs or request features.

## License

MIT
