# 🔐 Arm VPN Bot

A production-ready Telegram bot for automated VPN access management, built with **NestJS** and **grammY**. Designed to handle user onboarding, VPN key distribution, and subscription management entirely through Telegram — no web interface needed.

![TypeScript](https://img.shields.io/badge/TypeScript-96%25-3178c6?logo=typescript&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-Framework-ea2845?logo=nestjs&logoColor=white)
![grammY](https://img.shields.io/badge/grammY-Telegram%20Bot-2CA5E0?logo=telegram&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)

---

## ✨ Features

- 🤖 **Telegram-native UX** — users request VPN access directly in chat, no external forms
- 🔑 **VPN key distribution** — automatically issues and delivers access credentials
- 📦 **Subscription management** — tracks active users and access expiry
- 🏗️ **Modular NestJS architecture** — clean separation of concerns with services, modules, and guards
- ⚙️ **CI/CD ready** — GitHub Actions workflow included
- 🔧 **Configurable via environment** — all secrets and settings kept in `.env`

---

## 🛠️ Tech Stack

| Layer        | Technology                  |
| ------------ | --------------------------- |
| Framework    | NestJS                      |
| Telegram SDK | grammY (`@grammyjs/nestjs`) |
| CI/CD        | GitHub Actions              |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A Telegram Bot token from [@BotFather](https://t.me/BotFather)
- VPN Service API url and credentials

### Installation

```bash
git clone https://github.com/rockyatoyan/arm-vpn-bot.git
cd arm-vpn-bot
npm install
```

### Configuration

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

| Variable                             | Description                   |
| ------------------------------------ | ----------------------------- |
| `TELEGRAM_BOT_TOKEN`                 | Your bot token from BotFather |
| _(see `.env.example` for full list)_ |                               |

### Running the Bot

```bash
# Development
npm run start:dev

# Production
npm run start:prod
```

---

## 📁 Project Structure

```
src/
├── bot/          # Telegram update handlers & scenes
├── vpn/          # VPN key issuance and management logic
├── users/        # User registration and subscription tracking
└── config/       # Environment configuration module
```
