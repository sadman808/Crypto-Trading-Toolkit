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

export const calculateSummaryStats = (strategy: BacktestStrategy) => {
    const trades = strategy.trades || [];
    const totalTrades = calculateTotalTrades(trades);
    const winRate = calculateWinRate(trades);
    const avgRR = calculateAvgRR(trades);
    const netProfit = calculateNetProfit(trades);
    const avgReturnPerTrade = totalTrades > 0 ? netProfit / totalTrades : 0;

    const dailyPnl: { [date: string]: number } = {};
    const sessionPnl: { [session: string]: { total: number, count: number } } = {};

    trades.forEach(trade => {
        const date = new Date(trade.date).toISOString().split('T')[0];
        dailyPnl[date] = (dailyPnl[date] || 0) + trade.result;
        sessionPnl[trade.session] = {
            total: (sessionPnl[trade.session]?.total || 0) + trade.result,
            count: (sessionPnl[trade.session]?.count || 0) + 1,
        }
    });

    const bestDay = Object.keys(dailyPnl).reduce((a, b) => dailyPnl[a] > dailyPnl[b] ? a : b, 'N/A');
    const worstDay = Object.keys(dailyPnl).reduce((a, b) => dailyPnl[a] < dailyPnl[b] ? a : b, 'N/A');

    const mostProfitableSession = Object.keys(sessionPnl).reduce((a, b) => {
        const avgA = sessionPnl[a].total / sessionPnl[a].count;
        const avgB = sessionPnl[b].total / sessionPnl[b].count;
        return avgA > avgB ? a : b;
    }, 'N/A');


    return {
        totalTrades,
        winRate,
        avgRR,
        avgReturnPerTrade,
        bestDay: bestDay === 'N/A' ? 'N/A' : `${bestDay} (${dailyPnl[bestDay].toFixed(2)}$)`,
        worstDay: worstDay === 'N/A' ? 'N/A' : `${worstDay} (${dailyPnl[worstDay].toFixed(2)}$)`,
        mostProfitableSession,
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
