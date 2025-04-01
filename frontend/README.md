# LBP Frontend Starter

A minimal frontend starter template designed for LBP (Liquidity Bootstrapping Pool) projects. It includes basic components for displaying token charts, wallet connection, and swap transaction examples.

## 🚀 Features

- Token price chart visualization
- Wallet connect integration
- Swap transaction example
- Easily customizable for your own token and backend

## 🛠 Getting Started

This project is built with [Vite](https://vitejs.dev/).

### Clone and Run Locally

```bash
git clone https://github.com/initia-labs/lbp-frontend-starter
cd lbp-frontend-starter
pnpm install
pnpm dev
```

Open your browser and navigate to `http://localhost:5173`.

## 🔧 Customization

You’ll need to update the following files to tailor the project to your needs:

- **`src/data/constants.ts`**
  Define the token information related to your project here.

- **`src/data/api.ts`**
  Add your LBP backend's `prices` endpoint here to fetch live price data.

- **Styling/Design**
  This project comes with **no UI styling**, so feel free to build your own design system or integrate your preferred UI framework.
