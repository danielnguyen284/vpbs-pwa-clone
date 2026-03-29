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
      let closestIdx = -1;
      for (let i = data.t.length - 1; i >= 0; i--) {
        if (data.t[i] <= targetTs) {
          closestIdx = i;
          break;
        }
      }
      
      if (closestIdx !== -1) {
        return {
          h: data.h[closestIdx],
          l: data.l[closestIdx],
          c: data.c[closestIdx],
          ref: closestIdx > 0 ? data.c[closestIdx - 1] : data.c[closestIdx]
        };
      }
    }
    
    return null;
  } catch (err) {
    console.error('Failed to fetch from VPS:', err);
    return null;
  }
}
