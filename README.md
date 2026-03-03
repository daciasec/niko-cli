# @daciasec/niko-cli

A developer ops toolkit that makes your workflow smoother. Built by DaciaSec.

## Installation

```bash
# Install globally
npm install -g @daciasec/niko-cli

# Or use with npx
npx @daciasec/niko-cli
```

## First Time Setup

When you run `niko` for the first time, you'll see a welcome banner and interactive setup wizard:

```bash
$ niko

╔═══════════════════════════════════════════════════╗
║                                                   ║
║   ███╗   ██╗██╗██╗  ██╗ ██████╗     ██████╗██╗     ║
║   ████╗  ██║██║██║ ██╔╝██╔═══██╗   ██╔════╝██║     ║
║   ██╔██╗ ██║██║█████╔╝ ██║   ██║   ██║     ██║     ║
║   ██║╚██╗██║██║██╔═██╗ ██║   ██║   ██║     ██║     ║
║   ██║ ╚████║██║██║  ██╗╚██████╔╝   ╚██████╗███████╗║
║   ╚═╝  ╚═══╝╚═╝╚═╝  ╚═╝ ╚═════╝     ╚═════╝╚══════╝║
║                                                   ║
║         Developer Ops Toolkit v0.1.0              ║
║              by DaciaSec                          ║
║                                                   ║
╚═══════════════════════════════════════════════════╝

👋 Welcome to Niko CLI!

Let's get you set up in just a few questions...

? Which shell do you use? (Use arrow keys)
❯ Bash (detected)
  Zsh (detected)

? Preferred code editor? (Use arrow keys)
❯ VS Code
  Vim
  Nano
  Other (specify)

🤖 AI API Keys (Optional)
Configure API keys for AI-powered features. You can skip this and add later.

? Would you like to configure AI API keys now? (Y/n)

? Configure OpenAI (ChatGPT)? (y/N)
? Configure Anthropic (Claude)? (y/N)
? Configure Moonshot AI? (y/N)

📝 Git Commit Configuration (Optional)
Customize how Niko generates commit messages.

? Would you like to configure git commit settings now? (Y/n)

? Commit message style: (Use arrow keys)
❯ Conventional Commits (feat:, fix:, docs:, etc.)
  Angular Style (build:, ci:, docs:, etc.)
  Custom (define your own types)

? Maximum commit message length: (72)

? Require scope in commit messages? (y/N)

✅ Setup complete!

Your configuration:
  Shell: zsh
  Editor: code
  AI Keys: 2 configured
  Git Style: conventional

Quick start:
  niko commit     → Make a smart git commit
  niko bashrc     → Edit your shell config
  niko doctor     → Check system health
  niko --help     → See all commands

? Run a quick system health check now? (Y/n)
```

## Commands

### Git (with AI analysis & customizable style)

```bash
niko commit              # Smart commit - analyzes changes & suggests message
niko commit -m "message" # Quick commit with your message
niko commit -a           # Stage all and commit
niko commit --no-ai      # Skip AI analysis, manual mode
niko undo                # Safely undo last commit
```

The AI analysis looks at your staged changes and suggests:
- Commit type (feat, fix, docs, etc.) based on your configured style
- Commit message based on changed files
- Enforces max character limits

### Shell Config (auto-detects bash/zsh)

```bash
niko bashrc              # Open shell config (auto-detects bash/zsh)
niko source              # Source config to apply changes
niko alias               # List all aliases
niko alias deploy "npm run build && npm run deploy"  # Add alias
niko env                 # List environment variables
niko env EDITOR vim      # Set environment variable
```

### AI Integration

```bash
niko config --get apiKeys     # Show configured API keys
```

API keys are stored as environment variables in your shell config:
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `MOONSHOT_API_KEY`
- `GEMINI_API_KEY`
- `GROQ_API_KEY`

### Utilities

```bash
niko ip                  # Show local/public IP
niko ports               # Show common dev ports status
niko kill-port 3000      # Kill process on port 3000
niko doctor              # System health check
niko workspace           # Quick directory bookmarks
```

### Config

```bash
niko config --list       # Show config
niko config --get shell  # Get specific value
niko config --set editor vim  # Set value
niko onboarding          # Run setup wizard again
```

## Smart Features

### 🔮 AI Commit Analysis
Analyzes your staged changes and suggests the perfect commit message:
- Detects commit type based on your configured style (conventional/angular/custom)
- Generates message from file names
- Enforces max character limits
- Shows file preview before committing

### 🐚 Auto Shell Detection
Automatically detects and remembers whether you use bash or zsh:
- No need to specify every time
- Config saved to `~/.config/niko/config.json`
- Works across sessions

### 🤖 AI API Key Management
Configure API keys for multiple AI platforms during onboarding:
- OpenAI (ChatGPT)
- Anthropic (Claude)
- Moonshot AI
- Google (Gemini)
- Groq

All keys are stored securely as environment variables in your shell config.

### 📝 Customizable Git Commits
Choose your commit style:
- **Conventional Commits**: feat, fix, docs, style, refactor, perf, test, chore
- **Angular Style**: feat, fix, docs, style, refactor, perf, test, chore, build, ci
- **Custom**: Define your own types

Set max message length and scope requirements.

### 🎨 Cool Banner
ASCII art welcome banner on first run and help.

## Configuration

Config is stored at `~/.config/niko/config.json`:

```json
{
  "shell": "zsh",
  "editor": "code",
  "onboardingComplete": true,
  "apiKeys": {
    "openai": "OPENAI_API_KEY",
    "anthropic": "ANTHROPIC_API_KEY"
  },
  "gitConfig": {
    "commitStyle": "conventional",
    "maxLength": 72,
    "requireScope": false
  }
}
```

## Development

```bash
npm install
npm run build
npm run dev      # Watch mode
npm test         # Run tests
```

## Publishing

```bash
npm run build
npm publish --access public
```

## License

MIT - DaciaSec
