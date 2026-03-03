# @daciasec/niko-cli

> Your developer ops companion — git commits, shell management, and automation made simple.

[![npm version](https://badge.fury.io/js/@daciasec%2Fniko-cli.svg)](https://www.npmjs.com/package/@daciasec/niko-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- 🧠 **AI-Powered Commits** — Smart commit message suggestions based on your changes
- 🐚 **Shell Management** — Auto-detect bash/zsh, manage aliases, env vars
- 🔑 **API Key Management** — Securely configure OpenAI, Claude, Moonshot, Gemini, Groq
- 📁 **Workspaces** — Quick directory bookmarks for rapid navigation
- 🌐 **Network Tools** — Port checker, IP info, process killer
- 🩺 **System Doctor** — Health checks for your dev environment

## 🚀 Installation

```bash
npm install -g @daciasec/niko-cli
```

## 🎯 Quick Start

Run `niko` for the first time to complete interactive setup:

```bash
niko
```

This will guide you through:
1. Shell selection (bash/zsh)
2. Preferred editor
3. AI API keys (optional, skippable)
4. Git commit style preferences (optional, skippable)

## 📖 Usage

### Git Commands

```bash
# Smart commit with AI analysis
niko commit

# Quick commit with specific message
niko commit -t feat -m "add user authentication"

# Stage all and commit
niko commit -a

# Undo last commit (preserves changes)
niko undo

# Hard undo (discards changes)
niko undo --hard
```

### Shell Management

```bash
# Open shell config in editor (auto-detects bash/zsh)
niko bashrc

# Print config to stdout
niko bashrc --cat

# Apply shell changes
niko source

# Manage aliases
niko alias deploy "npm run build && npm run deploy"
niko alias --list
niko alias --remove deploy

# Manage environment variables
niko env EDITOR vim
niko env --list
niko env --path
```

### Workspace Bookmarks

```bash
# Add current directory as workspace
niko workspace --add frontend

# List all workspaces
niko workspace --list

# Show navigation command
niko workspace frontend
# Output: cd /path/to/frontend
```

### Network & Ports

```bash
# Check all common dev ports
niko ports

# Check specific port
niko ports 3000

# Kill process on port
niko kill-port 3000

# Force kill
niko kill-port 3000 --force

# Show network info
niko ip
```

### System Health

```bash
# Run system health check
niko doctor

# View configuration
niko config --list

# Re-run setup wizard
niko onboarding
```

## ⚙️ Configuration

Configuration is stored in `~/.config/niko/config.json`:

```json
{
  "shell": "zsh",
  "editor": "code",
  "onboardingComplete": true,
  "apiKeys": {
    "openai": "OPENAI_API_KEY"
  },
  "gitConfig": {
    "commitStyle": "conventional",
    "maxLength": 72,
    "requireScope": false
  },
  "workspaces": {
    "frontend": "/home/user/projects/frontend"
  }
}
```

## 🎨 Commit Styles

Niko supports three commit styles:

- **Conventional**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`
- **Angular**: Conventional + `build`, `ci`
- **Custom**: Define your own types

Example commits:
```
feat(auth): add login functionality
fix(api): resolve timeout issue
docs: update README
```

## 🔒 API Key Security

API keys are stored as environment variables in your shell config:

```bash
# Added to ~/.bashrc or ~/.zshrc
export OPENAI_API_KEY="your-key-here"
export ANTHROPIC_API_KEY="your-key-here"
export MOONSHOT_API_KEY="your-key-here"
export GEMINI_API_KEY="your-key-here"
export GROQ_API_KEY="your-key-here"
```

Keys are never stored in Niko's config file — only the environment variable names are tracked.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🏗️ Development

```bash
# Clone the repository
git clone https://github.com/daciasec/niko-cli.git
cd niko-cli

# Install dependencies
npm install

# Build TypeScript
npm run build

# Run in development mode
npm run dev

# Link locally for testing
npm link
niko --help
```

## 📦 Publishing

```bash
# Build and publish to npm
npm run build
npm publish --access public
```

## 📝 License

MIT © [DaciaSec](https://github.com/daciasec)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`niko commit` 😉)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🐛 Bug Reports

If you find a bug, please [open an issue](https://github.com/daciasec/niko-cli/issues) with:
- A clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Your OS and Node version

## 💡 Feature Requests

Have an idea for a new command or feature? [Open an issue](https://github.com/daciasec/niko-cli/issues) and let's discuss!

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/daciasec">DaciaSec</a>
</p>
