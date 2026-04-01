export interface OHLCData {
  s: string;
  t: number[];
  o: number[];
  h: number[];
  l: number[];
  c: number[];
  v: number[];
}

export interface OHLCPoint {
  h: number;
  l: number;
  c: number;
  ref?: number;
}

export interface RealtimeStock {
  sym: string;
  c: number; // Ceiling
  f: number; // Floor
  r: number; // Reference
  lastPrice: number; // Current/Last price
}

export async function fetchRealtimeStocks(symbols: string[]): Promise<Record<string, RealtimeStock>> {
  if (symbols.length === 0) return {};
  const url = `https://bgapidatafeed.vps.com.vn/getliststockdata/${symbols.join(',')}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return {};
    const data = await res.json();
    const result: Record<string, RealtimeStock> = {};
    if (Array.isArray(data)) {
      data.forEach((item: any) => {
        result[item.sym] = {
          sym: item.sym,
          c: item.c,
          f: item.f,
          r: item.r,
          lastPrice: item.lastPrice
        };
      });
    }
    return result;
  } catch (err) {
    console.error('Failed to fetch realtime from VPS:', err);
    return {};
  }
}

export async function fetchDailyOHLC(symbol: string, date: Date): Promise<OHLCPoint | null> {
  const targetTs = Math.floor(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0) / 1000);
  const fromTs = targetTs - (7 * 24 * 3600);
  const toTs = targetTs + (1 * 24 * 3600);

  const url = `https://histdatafeed.vps.com.vn/tradingview/history?symbol=${symbol}&resolution=D&from=${fromTs}&to=${toTs}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    
    if (data.s === 'ok' && data.t && data.t.length > 0) {
      let exactIdx = -1;
      for (let i = data.t.length - 1; i >= 0; i--) {
        if (data.t[i] === targetTs) {
          exactIdx = i;
          break;
        }
      }
      
      if (exactIdx !== -1) {
        return {
          h: data.h[exactIdx],
          l: data.l[exactIdx],
          c: data.c[exactIdx],
          ref: exactIdx > 0 ? data.c[exactIdx - 1] : data.c[exactIdx]
        };
      }
    }
    
    return null;
  } catch (err) {
    console.error('Failed to fetch from VPS:', err);
    return null;
  }
}

export async function fetchTradingHistoryDates(symbol: string, fromDate: Date, toDate: Date): Promise<number[]> {
  const fromTs = Math.floor(Date.UTC(fromDate.getUTCFullYear(), fromDate.getUTCMonth(), fromDate.getUTCDate(), 0, 0, 0) / 1000);
  const toTs = Math.floor(Date.UTC(toDate.getUTCFullYear(), toDate.getUTCMonth(), toDate.getUTCDate(), 0, 0, 0) / 1000);

  if (fromTs > toTs) return [];

  const url = `https://histdatafeed.vps.com.vn/tradingview/history?symbol=${symbol}&resolution=D&from=${fromTs}&to=${toTs}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    
    if (data.s === 'ok' && data.t && data.t.length > 0) {
      return data.t;
    }
    
    return [];
  } catch (err) {
    console.error('Failed to fetch trading dates from VPS:', err);
    return [];
  }
}
