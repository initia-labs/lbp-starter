# LBP Starter

A comprehensive starter kit for projects utilizing **Liquidity Bootstrapping Pools (LBP)**. This repository provides both backend and frontend solutions to help you get started quickly.

## Features

### Backend

A sample LBP API designed to display **historical** and **estimated** token prices throughout the LBP period.

### Frontend

A minimal frontend template for LBP projects, featuring:

- Token price charts
- Wallet connection integration
- Swap transaction examples

## Project Structure

- **[LBP Backend Starter](backend)** – API for historical & estimated pricing
- **[LBP Frontend Starter](frontend)** – UI template for LBP interactions

## Usage Instructions

> ⚠️ **Run Order Matters**:
> Always start by running the **backend process first**, followed by the **frontend process**. The frontend relies on the backend API to function correctly.

### Deployment

1. **Backend Deployment**
   Deploy the backend (e.g., using **AWS**, **GCP**, or other cloud providers). Ensure that the API endpoints are publicly accessible and properly configured.

2. **Frontend Deployment**
   After the backend is live, deploy the frontend (e.g., using **Vercel**, **Cloudflare Pages**, or similar platforms), and configure it to point to the deployed backend API.
