import { BacktestStrategy, BacktestTrade } from '../types';

export const calculateWinRate = (trades: BacktestTrade[]) => {
    if (trades.length === 0) return 0;
    const wins = trades.filter(t => t.win).length;
    return (wins / trades.length) * 100;
};

export const calculateAvgRR = (trades: BacktestTrade[]) => {
    if (trades.length === 0) return 0;
    const totalRR = trades.reduce((sum, t) => sum + t.rr, 0);
    return totalRR / trades.length;
};

export const calculateNetProfit = (trades: BacktestTrade[]) => {
    return trades.reduce((sum, t) => sum + t.result, 0);
};

export const calculateTotalTrades = (trades: BacktestTrade[]) => {
    return trades.length;
};

const getPnlStats = (pnlObject: { [key: string]: { total: number, count: number } }, keyFormatter?: (key: string) => string) => {
    if (Object.keys(pnlObject).length === 0) return { best: 'N/A', worst: 'N/A' };

    const avgPnl = Object.entries(pnlObject).map(([key, { total, count }]) => ({
        key,
        avg: total / count,
    }));

    const best = avgPnl.reduce((a, b) => a.avg > b.avg ? a : b);
    const worst = avgPnl.reduce((a, b) => a.avg < b.avg ? a : b);
    
    const format = keyFormatter || ((key: string) => key);

    return {
        best: `${format(best.key)} (${best.avg.toFixed(2)}$)`,
        worst: `${format(worst.key)} (${worst.avg.toFixed(2)}$)`,
    };
};

export const calculateSummaryStats = (strategy: BacktestStrategy) => {
    const trades = strategy.trades || [];
    const totalTrades = calculateTotalTrades(trades);
    const winRate = calculateWinRate(trades);
    const avgRR = calculateAvgRR(trades);
    const netProfit = calculateNetProfit(trades);
    const avgReturnPerTrade = totalTrades > 0 ? netProfit / totalTrades : 0;

    const dailyPnl: { [date: string]: number } = {};
    const sessionPnl: { [session: string]: { total: number, count: number } } = {};
    const dayPnl: { [day: string]: { total: number, count: number } } = {};
    const timePnl: { [hour: string]: { total: number, count: number } } = {};

    trades.forEach(trade => {
        const date = new Date(trade.date).toISOString().split('T')[0];
        dailyPnl[date] = (dailyPnl[date] || 0) + trade.result;
        
        sessionPnl[trade.session] = {
            total: (sessionPnl[trade.session]?.total || 0) + trade.result,
            count: (sessionPnl[trade.session]?.count || 0) + 1,
        };
        
        dayPnl[trade.day] = {
            total: (dayPnl[trade.day]?.total || 0) + trade.result,
            count: (dayPnl[trade.day]?.count || 0) + 1,
        };

        if (trade.time) {
            const hour = trade.time.split(':')[0];
            timePnl[hour] = {
                total: (timePnl[hour]?.total || 0) + trade.result,
                count: (timePnl[hour]?.count || 0) + 1,
            };
        }
    });

    const bestDay = Object.keys(dailyPnl).reduce((a, b) => dailyPnl[a] > dailyPnl[b] ? a : b, 'N/A');
    const worstDay = Object.keys(dailyPnl).reduce((a, b) => dailyPnl[a] < dailyPnl[b] ? a : b, 'N/A');

    const sessionStats = getPnlStats(sessionPnl);
    const dayStats = getPnlStats(dayPnl);
    const timeStats = getPnlStats(timePnl, hour => `${hour.padStart(2, '0')}:00`);


    return {
        totalTrades,
        winRate,
        avgRR,
        avgReturnPerTrade,
        bestDay: bestDay === 'N/A' ? 'N/A' : `${bestDay} (${dailyPnl[bestDay].toFixed(2)}$)`,
        worstDay: worstDay === 'N/A' ? 'N/A' : `${worstDay} (${dailyPnl[worstDay].toFixed(2)}$)`,
        mostProfitableSession: sessionStats.best,
        mostProfitableDay: dayStats.best,
        leastProfitableDay: dayStats.worst,
        mostProfitableTime: timeStats.best,
        leastProfitableTime: timeStats.worst,
    };
};

export const calculateDetailedMetrics = (strategy: BacktestStrategy) => {
    const trades = strategy.trades || [];
    const summary = calculateSummaryStats(strategy);
    
    const initialCapital = strategy.initial_capital;
    const netProfit = calculateNetProfit(trades);
    const netProfitPercent = initialCapital > 0 ? (netProfit / initialCapital) * 100 : 0;

    const grossProfit = trades.filter(t => t.win).reduce((sum, t) => sum + t.result, 0);
    const grossLoss = Math.abs(trades.filter(t => !t.win).reduce((sum, t) => sum + t.result, 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : Infinity;

    // Calculate Equity Curve and Max Drawdown
    let equity = initialCapital;
    let peakEquity = initialCapital;
    let maxDrawdown = 0;
    const equityCurve = [{ trade: 0, balance: initialCapital }];

    trades.forEach((trade, index) => {
        equity += trade.result;
        equityCurve.push({ trade: index + 1, balance: equity });
        if (equity > peakEquity) {
            peakEquity = equity;
        }
        const drawdown = ((peakEquity - equity) / peakEquity) * 100;
        if (drawdown > maxDrawdown) {
            maxDrawdown = drawdown;
        }
    });

    return {
        ...summary,
        netProfit,
        netProfitPercent,
        maxDrawdown,
        profitFactor,
        equityCurve,
        wins: trades.filter(t => t.win).length,
        losses: trades.filter(t => !t.win).length,
    };
};