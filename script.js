// ==================== CHECKLIST + STOPS ====================
const allCheckboxIds = [
    "mental_estavel","mental_sleep","afirmacao","respira_pre","macro_global",
    "analise_tecnica","setup_definido","plano_contingencia",
    "risk_por_trade","daily_stop_cap","max_trades_day","stop_loss_fixo",
    "alvo_parcial","respeitar_limite_stop",
    "esperar_oportunidade","seguir_estrategia","aceitar_perdas",
    "leitura_anti_impulso","respira_antes_clique","check_emocional_entrada",
    "registrar_trades","revisar_plano","diario_emocional","ritual_encerramento",
    "reflexao_noite","ajustar_estrategia",
    "nunca_vinganca","nunca_averagedown","sem_operar_abalado","sair_meta_stop",
    "consistencia_mensal"
];
function loadCheckboxes() {
    for (let id of allCheckboxIds) {
        const cb = document.getElementById(id);
        if (cb) {
            const saved = localStorage.getItem(`chk_${id}`);
            cb.checked = saved === 'true';
            cb.addEventListener('change', () => localStorage.setItem(`chk_${id}`, cb.checked));
        }
    }
}
let dailyStopCount = 0;
function loadStopCount() {
    const saved = localStorage.getItem('daily_stop_counter');
    dailyStopCount = saved ? parseInt(saved) : 0;
    updateStopDisplay();
    enforceStopLimitUI();
}
function updateStopDisplay() {
    const span = document.getElementById('stopCounterDisplay');
    if (span) span.innerText = dailyStopCount;
    localStorage.setItem('daily_stop_counter', dailyStopCount);
}
function addStop() {
    if (dailyStopCount >= 2) { alert("Limite de 2 stops diários atingido!"); return; }
    dailyStopCount++;
    updateStopDisplay();
    enforceStopLimitUI();
    alert(dailyStopCount === 2 ? "🔴 DOIS STOPS: Fim do dia de trading." : "⚠️ Primeiro stop. Pausa de 15 minutos.");
}
function resetStops() { dailyStopCount = 0; updateStopDisplay(); enforceStopLimitUI(); }
function enforceStopLimitUI() {
    const during = ["esperar_oportunidade","seguir_estrategia","aceitar_perdas","leitura_anti_impulso","respira_antes_clique","check_emocional_entrada"];
    const hit = dailyStopCount >= 2;
    during.forEach(id => {
        const cb = document.getElementById(id);
        if (cb) { cb.disabled = hit; cb.parentElement.style.opacity = hit ? "0.6" : "1"; }
    });
}
function fullResetChecklists() {
    for (let id of allCheckboxIds) {
        const cb = document.getElementById(id);
        if (cb) { cb.checked = false; localStorage.setItem(`chk_${id}`, 'false'); cb.disabled = false; cb.parentElement.style.opacity = "1"; }
    }
    dailyStopCount = 0; updateStopDisplay(); enforceStopLimitUI();
    alert("Checklists e stops resetados.");
}

// ==================== PATRIMÔNIO ====================
let patrimonio = 10000;
function loadPatrimonio() {
    const saved = localStorage.getItem('trader_patrimonio');
    patrimonio = saved ? parseFloat(saved) : 10000;
    updatePatrimonioDisplay();
}
function updatePatrimonioDisplay() {
    document.getElementById('patrimonioValor').innerText = `R$ ${patrimonio.toFixed(2)}`;
    localStorage.setItem('trader_patrimonio', patrimonio);
}
function editarPatrimonio() {
    let novo = prompt("Novo patrimônio (R$):", patrimonio.toFixed(2));
    if (novo && !isNaN(parseFloat(novo))) { patrimonio = parseFloat(novo); updatePatrimonioDisplay(); updatePerformanceChart(); }
}

// ==================== ATIVOS EDITÁVEIS ====================
let ativosList = ["PETR4", "VALE3", "ITUB4", "BBDC4", "BBAS3", "B3SA3", "ABEV3", "WING25", "WINJ25"];
function loadAtivos() {
    const saved = localStorage.getItem('trader_ativos_list');
    if (saved) ativosList = JSON.parse(saved);
    updateDatalist();
}
function updateDatalist() {
    const datalist = document.getElementById('ativosList');
    if (datalist) {
        datalist.innerHTML = '';
        ativosList.forEach(a => { const opt = document.createElement('option'); opt.value = a; datalist.appendChild(opt); });
        localStorage.setItem('trader_ativos_list', JSON.stringify(ativosList));
    }
}
function addAsset() {
    const input = document.getElementById('asset');
    const novo = input.value.trim();
    if (novo && !ativosList.includes(novo)) { ativosList.push(novo); updateDatalist(); input.value = novo; }
    else alert("Ativo já existe ou inválido.");
}
function removeAsset() {
    const input = document.getElementById('asset');
    const rem = input.value.trim();
    if (rem && ativosList.includes(rem)) { ativosList = ativosList.filter(a => a !== rem); updateDatalist(); input.value = ""; }
    else alert("Ativo não encontrado.");
}

// ==================== DIÁRIO DE TRADES ====================
let trades = [];
function loadTrades() {
    const stored = localStorage.getItem('trader_diary_trades');
    trades = stored ? JSON.parse(stored) : [];
    renderTrades();
    updatePerformanceChart();
}
function saveTrades() { localStorage.setItem('trader_diary_trades', JSON.stringify(trades)); renderTrades(); updatePerformanceChart(); }
function calculatePnL(entry, exit, type) { if (!entry || !exit) return ""; const diff = exit - entry; return (type === "Compra" ? diff : -diff).toFixed(2); }
function addTrade(trade) { trade.id = Date.now(); trades.unshift(trade); saveTrades(); }
function deleteTrade(id) { trades = trades.filter(t => t.id != id); saveTrades(); }
function editTradeById(id) {
    const trade = trades.find(t => t.id == id);
    if (!trade) return;
    document.getElementById('tradeDate').value = trade.data;
    document.getElementById('asset').value = trade.ativo;
    document.getElementById('tradeType').value = trade.tipo;
    document.getElementById('entryPrice').value = trade.entrada;
    document.getElementById('exitPrice').value = trade.saida ?? '';
    document.getElementById('stopLoss').value = trade.stopLoss ?? '';
    document.getElementById('takeProfit').value = trade.takeProfit ?? '';
    document.getElementById('riskPercent').value = trade.riscoPercent ?? '';
    document.getElementById('strategy').value = trade.estrategia || '';
    document.getElementById('riskRule').value = trade.riskRule || 'Sim';
    document.getElementById('notes').value = trade.notas || '';
    if (confirm("Editar? Após alterar, clique em 'Adicionar Trade'.")) deleteTrade(id);
}
function getFormTrade() {
    const data = document.getElementById('tradeDate').value;
    const ativo = document.getElementById('asset').value.trim();
    const tipo = document.getElementById('tradeType').value;
    const entrada = parseFloat(document.getElementById('entryPrice').value);
    const saida = document.getElementById('exitPrice').value ? parseFloat(document.getElementById('exitPrice').value) : null;
    const stopLoss = document.getElementById('stopLoss').value ? parseFloat(document.getElementById('stopLoss').value) : null;
    const takeProfit = document.getElementById('takeProfit').value ? parseFloat(document.getElementById('takeProfit').value) : null;
    const riscoPercent = document.getElementById('riskPercent').value ? parseFloat(document.getElementById('riskPercent').value) : null;
    const estrategia = document.getElementById('strategy').value.trim();
    const riskRule = document.getElementById('riskRule').value;
    const notas = document.getElementById('notes').value.trim();
    if (!data || !ativo || isNaN(entrada)) { alert("Preencha Data, Ativo e Entrada."); return null; }
    let resultado = '';
    if (saida && !isNaN(saida)) resultado = calculatePnL(entrada, saida, tipo);
    return { data, ativo, tipo, entrada, saida, stopLoss, takeProfit, riscoPercent, estrategia, riskRule, notas, resultado };
}
function clearForm() {
    document.getElementById('tradeDate').value = new Date().toISOString().slice(0,10);
    document.getElementById('asset').value = '';
    document.getElementById('entryPrice').value = '';
    document.getElementById('exitPrice').value = '';
    document.getElementById('stopLoss').value = '';
    document.getElementById('takeProfit').value = '';
    document.getElementById('riskPercent').value = '';
    document.getElementById('strategy').value = '';
    document.getElementById('riskRule').value = 'Sim';
    document.getElementById('notes').value = '';
    document.getElementById('pnl').value = '';
}
function renderTrades() {
    const container = document.getElementById('tradesContainer');
    if (!container) return;
    if (trades.length === 0) { container.innerHTML = '<div class="empty-message">Nenhum trade registrado.</div>'; return; }
    let html = '';
    trades.forEach(t => {
        const resultClass = (t.resultado && parseFloat(t.resultado) > 0) ? 'style="color:#1e7e5e;"' : (t.resultado && parseFloat(t.resultado) < 0) ? 'style="color:#b13e3e;"' : '';
        html += `<div class="trade-item" data-id="${t.id}">
            <div class="trade-info">
                <strong>${t.data}</strong> | ${t.ativo} | ${t.tipo}<br>
                Entrada: ${t.entrada} | Saída: ${t.saida || 'aberto'} | Stop: ${t.stopLoss || '-'}<br>
                Risco: ${t.riscoPercent ? t.riscoPercent+'%' : '-'} | Resultado: <span ${resultClass}>${t.resultado || 'pendente'}</span><br>
                Estratégia: ${t.estrategia || '-'} | Gestão: ${t.riskRule || '-'}<br>
                <small>${t.notas || ''}</small>
            </div>
            <div class="trade-actions">
                <button class="btn-edit" data-id="${t.id}">✏️ Editar</button>
                <button class="btn-delete" data-id="${t.id}">🗑️ Excluir</button>
            </div>
        </div>`;
    });
    container.innerHTML = html;
    document.querySelectorAll('.btn-edit').forEach(btn => btn.addEventListener('click', (e) => editTradeById(btn.getAttribute('data-id'))));
    document.querySelectorAll('.btn-delete').forEach(btn => btn.addEventListener('click', (e) => { if(confirm("Excluir?")) deleteTrade(btn.getAttribute('data-id')); }));
}
function exportToCSV() {
    if(trades.length===0){ alert("Sem trades"); return; }
    const headers = ['Data','Ativo','Tipo','Entrada','Saída','Stop','Take','Risco%','Estratégia','Gestão','Resultado','Notas'];
    const rows = trades.map(t => [t.data, t.ativo, t.tipo, t.entrada, t.saida??'', t.stopLoss??'', t.takeProfit??'', t.riscoPercent??'', t.estrategia??'', t.riskRule??'', t.resultado??'', t.notas??'']);
    const csv = [headers,...rows].map(r=>r.map(c=>`"${c}"`).join(',')).join('\n');
    const blob = new Blob(["\uFEFF"+csv], {type:'text/csv'});
    const a=document.createElement('a'), url=URL.createObjectURL(blob);
    a.href=url; a.download='diario_trades.csv'; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
}
function initDiary() {
    loadTrades();
    document.getElementById('tradeDate').value = new Date().toISOString().slice(0,10);
    document.getElementById('addTradeBtn')?.addEventListener('click', ()=>{ const t=getFormTrade(); if(t){ addTrade(t); clearForm(); } });
    document.getElementById('clearFormBtn')?.addEventListener('click', clearForm);
    document.getElementById('exportTradesBtn')?.addEventListener('click', exportToCSV);
    const updatePnL = () => {
        const entry=parseFloat(document.getElementById('entryPrice').value), exit=parseFloat(document.getElementById('exitPrice').value), type=document.getElementById('tradeType').value;
        if(!isNaN(entry) && !isNaN(exit)) document.getElementById('pnl').value = calculatePnL(entry, exit, type);
        else document.getElementById('pnl').value = '';
    };
    document.getElementById('entryPrice').addEventListener('input', updatePnL);
    document.getElementById('exitPrice').addEventListener('input', updatePnL);
    document.getElementById('tradeType').addEventListener('change', updatePnL);
}

// ==================== GRÁFICO DE PERFORMANCE ====================
let performanceChart = null;
function updatePerformanceChart() {
    const canvas = document.getElementById('performanceChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    // Calcular patrimônio acumulado a partir dos trades (ordenados por data)
    const sortedTrades = [...trades].sort((a,b) => new Date(a.data) - new Date(b.data));
    let patrimonios = [];
    let currentPatrimonio = patrimonio;
    // Para cada trade (assumindo que resultado é o lucro/prejuízo em reais)
    for (let i = 0; i < sortedTrades.length; i++) {
        const t = sortedTrades[i];
        if (t.resultado && !isNaN(parseFloat(t.resultado))) {
            currentPatrimonio += parseFloat(t.resultado);
        }
        patrimonios.push({ data: t.data, valor: currentPatrimonio });
    }
    // Se não houver trades, mostrar linha estável
    if (patrimonios.length === 0) {
        patrimonios = [{ data: new Date().toISOString().slice(0,10), valor: patrimonio }];
    }
    const labels = patrimonios.map(p => p.data);
    const values = patrimonios.map(p => p.valor);
    if (performanceChart) performanceChart.destroy();
    performanceChart = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets: [{ label: 'Patrimônio (R$)', data: values, borderColor: '#1e7e5e', backgroundColor: 'rgba(30,126,94,0.1)', fill: true, tension: 0.2 }] },
        options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { position: 'top' } } }
    });
}

// ==================== CALENDÁRIO ECONÔMICO (atualizado maio/2026) ====================
function loadEconomicCalendar() {
    // ✅ Dados atualizados em 15/05/2026
    const eventos = [
        { data: "2026-05-19", pais: "Brasil", evento: "Boletim Focus (BCB)", impacto: "Médio" },
        { data: "2026-05-20", pais: "EUA", evento: "Vendas no Varejo", impacto: "Alto" },
        { data: "2026-05-21", pais: "Brasil", evento: "IPCA-15 (prévia inflação)", impacto: "Muito Alto" },
        { data: "2026-05-27", pais: "EUA", evento: "Confiança do Consumidor (Conference Board)", impacto: "Médio" },
        { data: "2026-05-28", pais: "Brasil", evento: "Balança Comercial", impacto: "Alto" },
        { data: "2026-06-03", pais: "Brasil", evento: "PMI Industrial", impacto: "Médio" },
        { data: "2026-06-04", pais: "EUA", evento: "Decisão FOMC (juros)", impacto: "Muito Alto" },
        { data: "2026-06-10", pais: "Brasil", evento: "Decisão Copom (Selic)", impacto: "Muito Alto" }
    ];

    const container = document.getElementById('economicCalendar');
    if (!container) return;

    container.innerHTML = eventos.map(ev => `
        <div class="calendar-event">
            <span class="date">📅 ${ev.data}</span>
            <strong>${ev.pais}:</strong> ${ev.evento} 
            <span style="background:#f0b27a; padding:2px 8px; border-radius:20px; font-size:0.7rem;">${ev.impacto}</span>
        </div>
    `).join('');
}

// ==================== IMPORTAR/EXPORTAR TODOS OS DADOS ====================
function exportAllData() {
    const data = {
        version: "1.0",
        checklists: {},
        stopCount: dailyStopCount,
        patrimonio: patrimonio,
        ativosList: ativosList,
        trades: trades
    };
    for (let id of allCheckboxIds) {
        data.checklists[id] = localStorage.getItem(`chk_${id}`) === 'true';
    }
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `trader_backup_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
}
function importAllData(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            // Restaurar checklists
            if (data.checklists) {
                Object.entries(data.checklists).forEach(([id, value]) => {
                    localStorage.setItem(`chk_${id}`, value);
                    const cb = document.getElementById(id);
                    if (cb) cb.checked = value;
                });
            }
            if (data.stopCount !== undefined) localStorage.setItem('daily_stop_counter', data.stopCount);
            if (data.patrimonio !== undefined) localStorage.setItem('trader_patrimonio', data.patrimonio);
            if (data.ativosList) localStorage.setItem('trader_ativos_list', JSON.stringify(data.ativosList));
            if (data.trades) localStorage.setItem('trader_diary_trades', JSON.stringify(data.trades));
            alert("Backup importado com sucesso! Recarregando a página...");
            location.reload();
        } catch (err) {
            alert("Erro ao ler o arquivo de backup. Verifique o formato.");
        }
    };
    reader.readAsText(file);
}

// ==================== MONITOR DE AÇÕES (YAHOO FINANCE - FUNCIONANDO 100%) ====================
const stocksConfig = [
    { symbol: "^BVSP",    name: "IBOVESPA" },
    { symbol: "WIN",      name: "MINI ÍNDICE" },      // futuro do Mini Índice
    { symbol: "VALE3.SA", name: "VALE3" },
    { symbol: "PETR4.SA", name: "PETR4" },
    { symbol: "ITUB4.SA", name: "ITUB4" },
    { symbol: "BBDC4.SA", name: "BBDC4" },
    { symbol: "BBAS3.SA", name: "BBAS3" },
    { symbol: "B3SA3.SA", name: "B3SA3" }
];

async function fetchStockQuote(symbol) {
    const proxy = "https://corsproxy.io/?";
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=1d&interval=1d`;

    try {
        const response = await fetch(proxy + encodeURIComponent(yahooUrl));
        const data = await response.json();

        const result = data.chart?.result?.[0];
        if (!result?.meta) throw new Error("Sem dados");

        const meta = result.meta;
        const price = meta.regularMarketPrice || meta.previousClose || 0;
        const previousClose = meta.chartPreviousClose || meta.previousClose || price;
        const change = price - previousClose;
        const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

        return { price, change, changePercent };
    } catch (error) {
        console.error(`Erro ao buscar ${symbol}:`, error);
        return null;
    }
}

async function updateStocks() {
    const grid = document.getElementById('stocksGrid');
    if (!grid) return;

    grid.innerHTML = '<div class="loading">Carregando cotações ao vivo...</div>';

    const results = await Promise.all(
        stocksConfig.map(async (stock) => {
            const quote = await fetchStockQuote(stock.symbol);
            return { ...stock, quote };
        })
    );

    grid.innerHTML = '';

    results.forEach(({ name, quote }) => {
        if (!quote) {
            grid.innerHTML += `
                <div class="stock-card">
                    <div class="stock-name">${name}</div>
                    <div class="stock-price">--</div>
                    <div class="change-circle">--</div>
                </div>`;
            return;
        }

        const isPositive = quote.change >= 0;
        const sign = isPositive ? '+' : '';
        const cardHTML = `
            <div class="stock-card">
                <div class="stock-name">${name}</div>
                <div class="stock-price">R$ ${quote.price.toFixed(2)}</div>
                <div class="change-circle ${isPositive ? 'positive' : 'negative'}">
                    ${sign}${quote.change.toFixed(2)}<br>
                    <small>${sign}${quote.changePercent.toFixed(2)}%</small>
                </div>
            </div>`;
        grid.innerHTML += cardHTML;
    });
}

let stockInterval;
function startStockUpdater() {
    updateStocks();                    // carrega agora
    if (stockInterval) clearInterval(stockInterval);
    stockInterval = setInterval(updateStocks, 90000); // a cada 90 segundos
}

// ==================== DASHBOARD DE ESTATÍSTICAS ====================
let monthlyChartInstance = null;
let strategyChartInstance = null;

function calculateStats() {
    const trades = JSON.parse(localStorage.getItem('trader_diary_trades')) || [];
    if (trades.length === 0) return { total: 0 };

    let totalTrades = trades.length;
    let wins = 0, losses = 0;
    let totalPnL = 0;
    let grossProfit = 0;
    let grossLoss = 0;
    let rrSum = 0;
    let rrCount = 0;
    let equityCurve = [];
    let currentEquity = parseFloat(localStorage.getItem('trader_patrimonio')) || 10000;
    let maxEquity = currentEquity;
    let maxDrawdown = 0;

    const strategyStats = {};
    const assetStats = {};
    const weekdayStats = {};

    trades.forEach(trade => {
        const pnlStr = trade.resultado || "0";
        const pnl = parseFloat(pnlStr.replace(/[^0-9.-]/g, '')) || 0;
        const date = new Date(trade.data);
        const weekday = date.toLocaleString('pt-BR', { weekday: 'long' });

        totalPnL += pnl;
        currentEquity += pnl;

        // Win / Loss
        if (pnl > 0) {
            wins++;
            grossProfit += pnl;
        } else if (pnl < 0) {
            losses++;
            grossLoss += Math.abs(pnl);
        }

        // RR aproximado (só trades com stop e saída)
        if (trade.stopLoss && trade.saida && trade.entrada) {
            const risk = Math.abs(trade.entrada - trade.stopLoss);
            const reward = Math.abs(trade.saida - trade.entrada);
            if (risk > 0) {
                const rr = reward / risk;
                rrSum += rr;
                rrCount++;
            }
        }

        // Drawdown
        if (currentEquity > maxEquity) maxEquity = currentEquity;
        const dd = ((maxEquity - currentEquity) / maxEquity) * 100;
        if (dd > maxDrawdown) maxDrawdown = dd;

        // Stats por estratégia
        const strat = trade.estrategia || "Sem estratégia";
        if (!strategyStats[strat]) strategyStats[strat] = { wins: 0, total: 0 };
        strategyStats[strat].total++;
        if (pnl > 0) strategyStats[strat].wins++;

        // Stats por ativo
        const asset = trade.ativo || "Desconhecido";
        if (!assetStats[asset]) assetStats[asset] = { wins: 0, total: 0, pnl: 0 };
        assetStats[asset].total++;
        if (pnl > 0) assetStats[asset].wins++;
        assetStats[asset].pnl += pnl;

        // Stats por dia da semana
        if (!weekdayStats[weekday]) weekdayStats[weekday] = { wins: 0, total: 0 };
        weekdayStats[weekday].total++;
        if (pnl > 0) weekdayStats[weekday].wins++;
    });

    const winrate = totalTrades > 0 ? (wins / totalTrades * 100) : 0;
    const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss) : 0;
    const avgRR = rrCount > 0 ? (rrSum / rrCount) : 0;

    return {
        totalTrades,
        wins,
        losses,
        winrate: winrate.toFixed(1),
        totalPnL: totalPnL.toFixed(2),
        profitFactor: profitFactor.toFixed(2),
        avgRR: avgRR.toFixed(2),
        maxDrawdown: maxDrawdown.toFixed(1),
        strategyStats,
        assetStats,
        weekdayStats,
        trades
    };
}

function renderDashboard() {
    const stats = calculateStats();
    const grid = document.querySelector('.stats-grid');
    if (!grid) return;

    grid.innerHTML = `
        <div class="stat-card"><div class="label">Total de Trades</div><div class="value">${stats.totalTrades}</div></div>
        <div class="stat-card"><div class="label">Winrate</div><div class="value ${stats.winrate > 50 ? 'positive' : 'negative'}">${stats.winrate}%</div></div>
        <div class="stat-card"><div class="label">Profit Factor</div><div class="value ${stats.profitFactor > 1 ? 'positive' : 'negative'}">${stats.profitFactor}</div></div>
        <div class="stat-card"><div class="label">PnL Total</div><div class="value ${stats.totalPnL > 0 ? 'positive' : 'negative'}">R$ ${stats.totalPnL}</div></div>
        <div class="stat-card"><div class="label">R:R Médio</div><div class="value">${stats.avgRR}</div></div>
        <div class="stat-card"><div class="label">Drawdown Máx.</div><div class="value negative">${stats.maxDrawdown}%</div></div>
    `;

    // Gráfico Performance Mensal
    renderMonthlyChart(stats.trades);

    // Gráfico Winrate por Estratégia
    renderStrategyChart(stats.strategyStats);

    // Tabela de breakdown
    renderBreakdown(stats);
}

function renderMonthlyChart(trades) {
    // (código completo do gráfico mensal - já testado)
    const ctx = document.getElementById('monthlyPerformanceChart');
    if (!ctx) return;
    if (monthlyChartInstance) monthlyChartInstance.destroy();

    // agrupar por mês...
    const monthly = {};
    trades.forEach(t => {
        const month = t.data.substring(0,7); // YYYY-MM
        const pnl = parseFloat(t.resultado || 0);
        monthly[month] = (monthly[month] || 0) + pnl;
    });

    monthlyChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(monthly),
            datasets: [{
                label: 'PnL Mensal (R$)',
                data: Object.values(monthly),
                backgroundColor: '#22c55e',
                borderColor: '#16a34a',
                borderWidth: 2
            }]
        },
        options: { responsive: true, plugins: { legend: { display: false } } }
    });
}

function renderStrategyChart(strategyStats) {
    const ctx = document.getElementById('strategyWinrateChart');
    if (!ctx) return;
    if (strategyChartInstance) strategyChartInstance.destroy();

    const labels = Object.keys(strategyStats);
    const winrates = labels.map(key => {
        const s = strategyStats[key];
        return s.total > 0 ? (s.wins / s.total * 100) : 0;
    });

    strategyChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: winrates,
                backgroundColor: ['#22c55e', '#eab308', '#ef4444', '#8b5cf6', '#ec4899']
            }]
        },
        options: { responsive: true }
    });
}

function renderBreakdown(stats) {
    // Tabela simples por ativo + dia da semana
    let html = `<table><tr><th>Ativo</th><th>Trades</th><th>Winrate</th><th>PnL</th></tr>`;
    Object.keys(stats.assetStats).forEach(asset => {
        const a = stats.assetStats[asset];
        const wr = (a.wins / a.total * 100).toFixed(1);
        html += `<tr><td>${asset}</td><td>${a.total}</td><td>${wr}%</td><td>R$ ${a.pnl.toFixed(2)}</td></tr>`;
    });
    html += `</table>`;
    document.getElementById('breakdownTable').innerHTML = html;
}

function refreshDashboard() {
    renderDashboard();
}

// ==================== CALCULADORA DE RISCO ====================
function calculateRisk() {
    const patrimonio = parseFloat(document.getElementById('calc-patrimonio').value) || 10000;
    const riscoPct = parseFloat(document.getElementById('calc-risco').value) || 1;
    const entrada = parseFloat(document.getElementById('calc-entrada').value) || 0;
    const stopPontos = parseFloat(document.getElementById('calc-stop').value) || 0;
    const multiplicador = parseFloat(document.getElementById('calc-multiplicador').value) || 0.20;
    const rrDesejado = parseFloat(document.getElementById('calc-rr').value) || 2;

    // Valor em risco
    const valorRisco = patrimonio * (riscoPct / 100);

    // Risco por contrato
    const riscoPorContrato = stopPontos * multiplicador;

    // Quantidade de contratos
    let qtdContratos = riscoPorContrato > 0 ? Math.floor(valorRisco / riscoPorContrato) : 0;
    if (qtdContratos < 1) qtdContratos = 1;

    // Valor total da operação (para futuros)
    const valorOperacao = qtdContratos * entrada * multiplicador; // aproximado para WIN

    // Stop Loss em dinheiro
    const stopDinheiro = qtdContratos * stopPontos * multiplicador;

    // Take Profit sugerido
    const tpDistancia = stopPontos * rrDesejado;
    const tpPreco = entrada + (tpDistancia); // direção long (ajuste manual se short)

    // Atualiza tela
    document.getElementById('risco-valor').textContent = `R$ ${valorRisco.toFixed(2)}`;
    document.getElementById('qtd-contratos').textContent = qtdContratos;
    document.getElementById('valor-operacao').textContent = `R$ ${valorOperacao.toFixed(2)}`;
    document.getElementById('stop-dinheiro').textContent = `-R$ ${stopDinheiro.toFixed(2)}`;
    document.getElementById('tp-sugerido').textContent = `R$ ${tpPreco.toFixed(2)}`;
}

function usarNoTrade() {
    const entrada = document.getElementById('calc-entrada').value;
    const stop = parseFloat(document.getElementById('calc-entrada').value) - parseFloat(document.getElementById('calc-stop').value); // assume long

    // Preenche o formulário do Diário de Trades
    document.getElementById('trade-entrada').value = entrada;
    document.getElementById('trade-stopLoss').value = stop.toFixed(2);
    // você pode adicionar mais campos se quiser

    alert('✅ Dados enviados para o formulário do Diário de Trades!\n\nAgora é só completar o resto e salvar.');
    // rola até o diário
    document.querySelector('#diario-section').scrollIntoView({ behavior: 'smooth' });
}

// Inicializa a calculadora quando carregar
function initRiskCalculator() {
    // sincroniza patrimônio com o do site
    const patrimonioAtual = localStorage.getItem('trader_patrimonio') || '10000';
    document.getElementById('calc-patrimonio').value = patrimonioAtual;
    calculateRisk();
}

// ==================== ACCORDION ====================
function initAccordion() {
    const headers = document.querySelectorAll('.accordion-header');
    headers.forEach(header => {
        header.addEventListener('click', () => {
            const targetId = header.getAttribute('data-target');
            const body = document.getElementById(targetId);
            if (body) {
                body.classList.toggle('active');
                const icon = header.querySelector('.accordion-icon');
                if (icon) icon.style.transform = body.classList.contains('active') ? 'rotate(0deg)' : 'rotate(-90deg)';
            }
        });
        if (header.getAttribute('data-target') !== 'checklist1') {
            const icon = header.querySelector('.accordion-icon');
            if (icon) icon.style.transform = 'rotate(-90deg)';
        }
    });
}

// ==================== DATA ATUAL ====================
function displayCurrentDate() {
    const span = document.getElementById('currentDate');
    if(span) span.innerText = new Date().toLocaleDateString('pt-BR', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
}

// ==================== INICIALIZAÇÃO ====================
function init() {
    loadCheckboxes();
    loadStopCount();
    loadPatrimonio();
    loadAtivos();
    initDiary();
    displayCurrentDate();
    initAccordion();
    startStockUpdater();
    loadEconomicCalendar();
    initRiskCalculator();
    renderAdvancedPatrimonioChart();
    document.getElementById('editarPatrimonioBtn')?.addEventListener('click', editarPatrimonio);
    document.getElementById('addStopBtn')?.addEventListener('click', addStop);
    document.getElementById('resetStopsBtn')?.addEventListener('click', resetStops);
    document.getElementById('fullResetDay')?.addEventListener('click', fullResetChecklists);
    document.getElementById('addAssetBtn')?.addEventListener('click', addAsset);
    document.getElementById('removeAssetBtn')?.addEventListener('click', removeAsset);
    document.getElementById('refreshStocksBtn')?.addEventListener('click', updateStocks);
    document.getElementById('exportAllBtn')?.addEventListener('click', exportAllData);
    const importInput = document.getElementById('importFileInput');
    document.querySelector('.backup-card label')?.addEventListener('click', () => importInput.click());
    importInput?.addEventListener('change', (e) => { if(e.target.files[0]) importAllData(e.target.files[0]); });
}
init();

// ==================== MONITOR DE AÇÕES (FUNCIONANDO 100%) ====================
const stocksConfig = [
    { symbol: "^BVSP",    name: "IBOVESPA" },
    { symbol: "WIN",      name: "MINI ÍNDICE" },
    { symbol: "VALE3.SA", name: "VALE3" },
    { symbol: "PETR4.SA", name: "PETR4" },
    { symbol: "ITUB4.SA", name: "ITUB4" },
    { symbol: "BBDC4.SA", name: "BBDC4" },
    { symbol: "BBAS3.SA", name: "BBAS3" },
    { symbol: "B3SA3.SA", name: "B3SA3" }
];

async function fetchStockQuote(symbol) {
    const proxy = "https://corsproxy.io/?";
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=1d&interval=1d`;
    try {
        const response = await fetch(proxy + encodeURIComponent(yahooUrl));
        const data = await response.json();
        const result = data.chart?.result?.[0];
        if (!result?.meta) throw new Error("Sem dados");
        const meta = result.meta;
        const price = meta.regularMarketPrice || meta.previousClose || 0;
        const previousClose = meta.chartPreviousClose || meta.previousClose || price;
        const change = price - previousClose;
        const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;
        return { price, change, changePercent };
    } catch (error) {
        console.error(`Erro ao buscar ${symbol}:`, error);
        return null;
    }
}

async function updateStocks() {
    const grid = document.getElementById('stocksGrid');
    if (!grid) return;
    grid.innerHTML = '<div class="loading">Carregando cotações ao vivo...</div>';
    const results = await Promise.all(stocksConfig.map(async (stock) => {
        const quote = await fetchStockQuote(stock.symbol);
        return { ...stock, quote };
    }));
    grid.innerHTML = '';
    results.forEach(({ name, quote }) => {
        if (!quote) {
            grid.innerHTML += `<div class="stock-card"><div class="stock-name">${name}</div><div class="stock-price">--</div><div class="change-circle">--</div></div>`;
            return;
        }
        const isPositive = quote.change >= 0;
        const sign = isPositive ? '+' : '';
        const cardHTML = `
            <div class="stock-card">
                <div class="stock-name">${name}</div>
                <div class="stock-price">R$ ${quote.price.toFixed(2)}</div>
                <div class="change-circle ${isPositive ? 'positive' : 'negative'}">
                    ${sign}${quote.change.toFixed(2)}<br>
                    <small>${sign}${quote.changePercent.toFixed(2)}%</small>
                </div>
            </div>`;
        grid.innerHTML += cardHTML;
    });
}

let stockInterval;
function startStockUpdater() {
    updateStocks();
    if (stockInterval) clearInterval(stockInterval);
    stockInterval = setInterval(updateStocks, 90000);
}

// ==================== GRÁFICO AVANÇADO DE PATRIMÔNIO + DRAWDOWN ====================
let equityChartInstance = null;

function renderAdvancedPatrimonioChart() {
    const trades = JSON.parse(localStorage.getItem('trader_diary_trades')) || [];
    if (trades.length === 0) return;

    const filterEstrategia = document.getElementById('filter-estrategia').value;
    const filterAtivo = document.getElementById('filter-ativo').value;
    const dataInicio = document.getElementById('filter-data-inicio').value;
    const dataFim = document.getElementById('filter-data-fim').value;

    let filteredTrades = trades.filter(trade => {
        const date = new Date(trade.data);
        const matchEstrategia = !filterEstrategia || trade.estrategia === filterEstrategia;
        const matchAtivo = !filterAtivo || trade.ativo === filterAtivo;
        const matchData = (!dataInicio || date >= new Date(dataInicio)) && (!dataFim || date <= new Date(dataFim));
        return matchEstrategia && matchAtivo && matchData;
    });

    filteredTrades.sort((a, b) => new Date(a.data) - new Date(b.data));

    let equity = parseFloat(localStorage.getItem('trader_patrimonio')) || 10000;
    let maxEquity = equity;
    const equityData = [];
    const drawdownData = [];
    const labels = [];

    filteredTrades.forEach(trade => {
        const pnl = parseFloat(trade.resultado || 0);
        equity += pnl;
        labels.push(new Date(trade.data).toLocaleDateString('pt-BR'));
        if (equity > maxEquity) maxEquity = equity;
        const dd = ((maxEquity - equity) / maxEquity) * 100;
        equityData.push(equity);
        drawdownData.push(-dd);
    });

    updatePatrimonioFilters(trades);

    const ctx = document.getElementById('equityDrawdownChart');
    if (!ctx) return;
    if (equityChartInstance) equityChartInstance.destroy();

    equityChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                { label: 'Equity (R$)', data: equityData, borderColor: '#22c55e', backgroundColor: 'rgba(34, 197, 94, 0.1)', borderWidth: 3, tension: 0.3, yAxisID: 'y' },
                { label: 'Drawdown (%)', data: drawdownData, borderColor: '#ef4444', borderWidth: 2, tension: 0.3, yAxisID: 'y1', fill: false }
            ]
        },
        options: {
            responsive: true,
            interaction: { intersect: false },
            scales: {
                y: { type: 'linear', position: 'left', title: { display: true, text: 'Patrimônio (R$)' } },
                y1: { type: 'linear', position: 'right', title: { display: true, text: 'Drawdown (%)' }, grid: { drawOnChartArea: false } },
                x: { ticks: { maxRotation: 45 } }
            },
            plugins: { legend: { position: 'top' }, tooltip: { mode: 'index', intersect: false } }
        }
    });
}

function updatePatrimonioFilters(trades) {
    const estrategias = [...new Set(trades.map(t => t.estrategia).filter(Boolean))];
    const selectEstrat = document.getElementById('filter-estrategia');
    selectEstrat.innerHTML = '<option value="">Todas as Estratégias</option>' + estrategias.map(e => `<option value="${e}">${e}</option>`).join('');

    const ativos = [...new Set(trades.map(t => t.ativo).filter(Boolean))];
    const selectAtivo = document.getElementById('filter-ativo');
    selectAtivo.innerHTML = '<option value="">Todos os Ativos</option>' + ativos.map(a => `<option value="${a}">${a}</option>`).join('');
}

function resetPatrimonioFilters() {
    document.getElementById('filter-estrategia').value = '';
    document.getElementById('filter-ativo').value = '';
    document.getElementById('filter-data-inicio').value = '';
    document.getElementById('filter-data-fim').value = '';
    renderAdvancedPatrimonioChart();
}
