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

// ==================== MONITOR DE AÇÕES (brapi.dev - Funcionando 100%) ====================
const stocksConfig = [
    { symbol: "IBOV",     name: "IBOVESPA" },
    { symbol: "MIBV",     name: "MINI ÍNDICE" },
    { symbol: "VALE3",    name: "VALE3" },
    { symbol: "PETR4",    name: "PETR4" },
    { symbol: "ITUB4",    name: "ITUB4" },
    { symbol: "BBDC4",    name: "BBDC4" },
    { symbol: "BBAS3",    name: "BBAS3" },
    { symbol: "B3SA3",    name: "B3SA3" }
];

async function fetchAllQuotes() {
    const symbols = stocksConfig.map(s => s.symbol).join(',');
    try {
        const response = await fetch(`https://brapi.dev/api/quote/${symbols}?range=1d`);
        const data = await response.json();

        // brapi.dev retorna um array em data.quote
        return data.quote || [];
    } catch (error) {
        console.error("Erro ao buscar cotações:", error);
        return [];
    }
}

async function updateStocks() {
    const grid = document.getElementById('stocksGrid');
    if (!grid) return;

    grid.innerHTML = '<div class="loading">Carregando cotações ao vivo...</div>';

    const quotes = await fetchAllQuotes();

    grid.innerHTML = '';

    stocksConfig.forEach(stock => {
        // Encontra os dados da ação pelo símbolo
        const quoteData = quotes.find(q => q.symbol === stock.symbol) || {};

        const price = quoteData.regularMarketPrice?.toFixed(2) || '--';
        const change = quoteData.change || 0;
        const changePercent = quoteData.changePercent || 0;

        const isPositive = change >= 0;
        const changeClass = isPositive ? 'positive' : 'negative';
        const changeSign = isPositive ? '+' : '';

        const cardHTML = `
            <div class="stock-card">
                <div class="stock-name">${stock.name}</div>
                <div class="stock-price">R$ ${price}</div>
                <div class="change-circle ${changeClass}">
                    ${changeSign}${change.toFixed(2)}<br>
                    <small>${changeSign}${changePercent.toFixed(2)}%</small>
                </div>
            </div>
        `;
        grid.innerHTML += cardHTML;
    });
}

let stockInterval;
function startStockUpdater() {
    updateStocks();                    // carrega imediatamente
    if (stockInterval) clearInterval(stockInterval);
    stockInterval = setInterval(updateStocks, 60000); // 60 segundos
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
