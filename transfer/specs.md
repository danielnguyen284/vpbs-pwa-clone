# Project Specifications

## 1. Database Schema
To accurately reproduce the core functionality in the browser (e.g. via IndexedDB/Dexie.js), implement the following data modeling:

- **Accounts**:
  - `id` (PK)
  - `cash_balance` (REAL)
- **CashTransactions**:
  - `id` (PK)
  - `type` (TEXT: DEPOSIT, TRADE_BUY, TRADE_SELL)
  - `amount` (REAL: positive or negative)
  - `description` (TEXT)
  - `created_at` (DATETIME)
- **Orders**:
  - `id` (PK)
  - `symbol` (TEXT)
  - `side` (TEXT: 'M' for Buy, 'B' for Sell)
  - `price` (REAL)
  - `quantity` (INTEGER)
  - `order_date` (DATE)
  - `status` (TEXT: 'Khớp hết', 'Từ chối')
  - `filled_price` (REAL)
- **Portfolio**:
  - `id` (PK)
  - `symbol` (TEXT)
  - `avg_price` (REAL)
  - `available_qty` (INTEGER)
- **RealizedPnL**:
  - `id` (PK)
  - `symbol` (TEXT)
  - `sell_date` (DATE)
  - `quantity` (INTEGER)
  - `buy_price` (REAL)
  - `sell_price` (REAL)
  - `pnl_value` (REAL)
  - `pnl_percent` (REAL)

## 2. API Integration
**VPS Historical API (Public TradingView Feed)**
Endpoint used to fetch OHLC (Open, High, Low, Close) to match orders and to get the latest close price for the Portfolio screen.
- **URL**: `https://histdatafeed.vps.com.vn/tradingview/history`
- **Params**: 
  - `symbol`: e.g., "FPT"
  - `resolution`: "D" (Daily)
  - `from`: Unix timestamp (UTC seconds). IMPORTANT: Convert Vietnamese midnight to UTC.
  - `to`: Unix timestamp (UTC seconds).
- **Response Format**: `{ s: "ok", t: [...], o: [...], h: [...], l: [...], c: [...], v: [...] }`
- **Fallback**: Add a mock fallback generator that fluctuates price by ±7% if the API fails or no data exists (e.g., weekends/holidays / invalid symbols).

## 3. Screens & UI Mapping

### 3.1. Main Tab Navigation
Bottom navigation bar with 5 items:
1. **Bảng giá (HomeScreen)**: Currently a placeholder.
2. **Danh mục (PortfolioScreen)**: Shows total market value vs capital. Lists active portfolio stocks. Real-time PnL calculation against current market price. Opens `RealizedPnLScreen` from a "Sao kê" button in the header.
3. **Đặt lệnh (OrderScreen FAB)**: A Floating Action Button centered over the tab bar. Opens a modal/drawer.
4. **Sổ lệnh (OrderBookScreen)**: List of all placed orders, filtering by order status, highlighting 'Khớp hết' in green.
5. **Tiện ích (UtilityScreen)**: Developer utility to deposit fake cash (e.g. 10m, 50m, 100m VND) and a Red button to "Reset/Wipe Data".

### 3.2. Order Screen Logic (Modal)
- Inputs: Symbol (string), Side (MUA/BÁN), Quantity (number), Price (number), Order Date (YYYY-MM-DD).
- Validation: End-of-Day order checking. Cannot place orders for future dates. Checks cash balance before executing Buy orders. Checks portfolio quantity before executing Sell orders. Total transaction volumes are computed as `price * quantity * 1000`.

### 3.3. Realized PnL (Sao kê)
- List of closed trades, displaying the locked-in PnL Value & %.
- Grouped by `sell_date`.
- Green for profit >= 0, Red for loss < 0.

## 4. PWA Specific Requirements
1. **Manifest & Service Worker**: Standard PWA installability requirements must be met (Web App Manifest, custom icons, standalone display mode).
2. **Local Data Persistence**: Ensure data survives browser reloads.
3. **Responsive**: It should feel exactly like a mobile application. Fix viewport width/scale, disable text-selection, provide momentum scrolling for lists, and hide scrollbars.
