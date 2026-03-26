# Project Context for PWA Migration

## Overview
This project is an offline-first stock trading simulation application. It allows users to deposit virtual money, maintain a portfolio of stocks, place "time-travel" orders (buying or selling on past dates based on historical price data), and view their realized Profit & Loss (PnL). 

The original project was built using **React Native** (Expo) and SQLite. 
The new goal is to **rebuild this exact application as a modern Progressive Web Application (PWA)** using web technologies (React/Next.js/Vite, etc.), while retaining all of its core logic, UI aesthetic, and features.

## Core Mechanics
1. **Time-Travel Trading Logic:**
   - Users place orders (MUA/BÁN) for a specific stock (e.g., "HPG"), specifying price, quantity, and a target date (can be today or a past date).
   - The system calls a real public API (`histdatafeed.vps.com.vn`) to get the high/low (OHLC) points of that stock on the target date.
   - If the user's requested price rests within the high/low range of that day, the order is immediately "Khớp hết" (Matched). If outside the range, it is "Từ chối" (Rejected due to trượt biên độ).

2. **Portfolio & Balances (Sổ quỹ & Danh mục):**
   - The user has a virtual VND cash balance.
   - Matched BUY orders deduct cash, increase portfolio quantities, and recalculate the weighted Average Price.
   - Matched SELL orders decrease portfolio quantities, increase cash, and lock in the Realized PnL (calculating the difference between the filled sell price and the average buy price).

3. **Offline & State Management:**
   - In the React Native app, this was entirely handled via `expo-sqlite`. 
   - For the PWA, this should be handled using `IndexedDB` or standard local storage solutions to keep it running entirely in the client browser without a backend.

## Design Aesthetic
- **Theme:** Strict adherence to the provided mockups and new icons in the transfer directory. Do not use the old color scheme.

## Available Assets
The original SVG icons and images have been copied to the `assets` folder in this transfer directory. Please use them to keep the UI as 1-to-1 as possible.
