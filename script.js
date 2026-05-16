// ================================================
// DIÁRIO DO TRADER CONSISTENTE - SCRIPT.JS
// Versão otimizada para o novo layout 3 colunas
// ================================================

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
    allCheckboxIds.forEach(id => {
        const cb = document.getElementById(id);
        if (cb) {
            const saved = localStorage.getItem(`chk_${id}`);
            cb.checked = saved === 'true';
            cb.addEventListener('change', () => {
                localStorage.setItem(`chk_${id}`, cb.checked);
            });
        }
    });
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
    if (span) span.textContent = dailyStopCount;
    localStorage.setItem('daily_stop_counter', dailyStopCount);
}

function addStop() {
    if (dailyStopCount >= 2) {
        alert("🔴 Limite de 2 stops diários atingido! Fim do dia.");
        return;
    }
    dailyStopCount++;
    updateStopDisplay();
    enforceStopLimitUI();
    alert(dailyStopCount === 2 ? "🔴 DOIS STOPS: Fim do dia de trading." : "⚠️ Primeiro stop registrado.");
}

function resetStops() {
    dailyStopCount = 0;
    updateStopDisplay();
    enforceStopLimitUI();
}

function enforceStopLimitUI() {
    const duringIds = ["esperar_oportunidade","seguir_estrategia","aceitar_perdas","leitura_anti_impulso","respira_antes_clique","check_emocional_entrada"];
    const blocked = dailyStopCount >= 2;

    duringIds.forEach(id => {
        const cb = document.getElementById(id);
        if (cb) {
            cb.disabled = blocked;
            const label = cb.closest('label');
            if (label) label.style.opacity = blocked ? '0.5' : '1';
        }
    });
}

function fullResetChecklists() {
    allCheckboxIds.forEach(id => {
        const cb = document.getElementById(id);
        if (cb) {
            cb.checked = false;
            localStorage.setItem(`chk_${id}`, 'false');
            cb.disabled = false;
            const label = cb.closest('label');
            if (label) label.style.opacity = '1';
        }
    });
    dailyStopCount = 0;
    updateStopDisplay();
    enforceStopLimitUI();
    alert("✅ Checklists e stops resetados com sucesso.");
}

// ==================== PATRIMÔNIO ====================
let patrimonio = 10000;

function loadPatrimonio() {
    const saved = localStorage.getItem('trader_patrimonio');
    patrimonio = saved ? parseFloat(saved) : 10000;
    updatePatrimonioDisplay();
}

function updatePatrimonioDisplay() {
    const el = document.getElementById('patrimonioValor');
    if (el) el.textContent = `R$ ${patrimonio.toFixed(2)}`;
    localStorage.setItem('trader_patrimonio', patrimonio);
}

function editarPatrimonio() {
    const novo = prompt("Novo valor de patrimônio atual (R$):", patrimonio.toFixed(2));
    if (novo !== null && !isNaN(parseFloat(novo))) {
        patrimonio = parseFloat(novo);
        updatePatrimonioDisplay();
        updatePerformanceChart();
    }
}

// ==================== ATIVOS EDITÁVEIS ====================
let ativosList = ["WINJ26", "INDO26", "PETR4", "VALE3", "ITUB4", "BBDC4", "BBAS3", "B3SA3", "ABEV3"];

function loadAtivos() {
    const saved = localStorage.getItem('trader_ativos_list');
    if (saved) ativosList = JSON.parse(saved);
    updateDatalist();
}

function updateDatalist() {
    const datalist = document.getElementById('ativosList');
    if (!datalist) return;
    datalist.innerHTML = '';
    ativosList.forEach(a => {
        const opt = document.createElement('option');
        opt.value = a;
        datalist.appendChild(opt);
    });
    localStorage.setItem('trader_ativos_list', JSON.stringify(ativosList));
}

function addAsset() {
    const input = document.getElementById('asset');
    const novo = input.value.trim().toUpperCase();
    if (novo && !ativosList.includes(novo)) {
        ativosList.push(novo);
        updateDatalist();
        input.value = novo;
    } else {
        alert("Ativo já existe ou está vazio.");
    }
}

function removeAsset() {
    const input = document.getElementById('asset');
    const rem = input.value.trim().toUpperCase();
    if (rem && ativosList.includes(rem)) {
        ativosList = ativosList.filter(a => a !== rem);
        updateDatalist();
        input.value = '';
    } else {
        alert("Ativo não encontrado na lista.");
    }
}

// ==================== DIÁRIO DE TRADES ====================
let trades = [];

function loadTrades() {
    const stored = localStorage.getItem('trader_diary_trades');
    trades = stored ? JSON.parse(stored) : [];
    renderTrades();
    updatePerformanceChart();
}

function saveTrades() {
    localStorage.setItem('trader_diary_trades', JSON.stringify(trades));
    renderTrades();
    updatePerformanceChart();
}

function calculatePnL(entry, exit, type) {
    if (!entry || !exit) return '';
    const diff = exit - entry;
    return (type === "Compra" ? diff : -diff).toFixed(2);
}

function addTrade(trade) {
    trade.id = Date.now();
    trades.unshift(trade);
    saveTrades();
}

function deleteTrade(id) {
    trades = trades.filter(t => t.id !== id);
    saveTrades();
}

function editTradeById(id) {
    const trade = trades.find(t => t.id === id);
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

    if (confirm("Editar trade? Após alterar os campos, clique em 'Adicionar Trade' novamente.")) {
        deleteTrade(id);
    }
}

function getFormTrade() {
    const data = document.getElementById('tradeDate').value;
    const ativo = document.getElementById('asset').value.trim().toUpperCase();
    const tipo = document.getElementById('tradeType').value;
    const entrada = parseFloat(document.getElementById('entryPrice').value);
    const saida = document.getElementById('exitPrice').value ? parseFloat(document.getElementById('exitPrice').value) : null;
    const stopLoss = document.getElementById('stopLoss').value ? parseFloat(document.getElementById('stopLoss').value) : null;
    const takeProfit = document.getElementById('takeProfit').value ? parseFloat(document.getElementById('takeProfit').value) : null;
    const riscoPercent = document.getElementById('riskPercent').value ? parseFloat(document.getElementById('riskPercent').value) : null;
    const estrategia = document.getElementById('strategy').value.trim();
    const riskRule = document.getElementById('riskRule').value;
    const notas = document.getElementById('notes').value.trim();

    if (!data || !ativo || isNaN(entrada)) {
        alert("❌ Preencha pelo menos Data, Ativo e Preço de Entrada.");
        return null;
    }

    let resultado = '';
    if (saida && !isNaN(saida)) {
        resultado = calculatePnL(entrada, saida, tipo);
    }

    return { 
        data, 
        ativo, 
        tipo, 
        entrada, 
        saida, 
        stopLoss, 
        takeProfit, 
        riscoPercent, 
        estrategia, 
        riskRule, 
        notas, 
        resultado 
    };
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

    if (trades.length === 0) {
        container.innerHTML = `<div class="empty-message">Nenhum trade registrado hoje.</div>`;
        return;
    }

    let html = '';
    trades.forEach(t => {
        const resultClass = t.resultado && parseFloat(t.resultado) > 0 ? 'positive' : t.resultado && parseFloat(t.resultado) < 0 ? 'negative' : '';
        html += `
        <div class="trade-item" data-id="${t.id}">
            <div class="trade-info">
                <strong>${t.data}</strong> • ${t.ativo} • ${t.tipo}<br>
                Entrada: <b>${t.entrada}</b> | Saída: <b>${t.saida || 'aberto'}</b><br>
                Risco: ${t.riscoPercent ? t.riscoPercent + '%' : '-'} | Resultado: <span class="${resultClass}">${t.resultado || 'pendente'}</span><br>
                Estratégia: ${t.estrategia || '-'} | Gestão: ${t.riskRule || '-'}
                ${t.notas ? `<br><small>${t.notas}</small>` : ''}
            </div>
            <div class="trade-actions">
                <button class="btn-edit" data-id="${t.id}">✏️</button>
                <button class="btn-delete" data-id="${t.id}">🗑️</button>
            </div>
        </div>`;
    });

    container.innerHTML = html;

    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => editTradeById(parseInt(btn.dataset.id)));
    });
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm("Excluir este trade permanentemente?")) deleteTrade(parseInt(btn.dataset.id));
        });
    });
}

function exportToCSV() {
    if (trades.length === 0) return alert("Nenhum trade para exportar.");
    const headers = ['Data','Ativo','Tipo','Entrada','Saída','Stop','Take','Risco%','Estratégia','Gestão','Resultado','Notas'];
    const rows = trades.map(t => [
        t.data, t.ativo, t.tipo, t.entrada, t.saida??'', t.stopLoss??'', t.takeProfit??'',
        t.riscoPercent??'', t.estrategia??'', t.riskRule??'', t.resultado??'', t.notas??''
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `trades_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
}

// ==================== GRÁFICO DE PERFORMANCE ====================
let performanceChart = null;

function updatePerformanceChart() {
    const canvas = document.getElementById('performanceChart');
    if (!canvas) return;

    const sorted = [...trades].sort((a, b) => new Date(a.data) - new Date(b.data));
    let current = patrimonio;
    const labels = [];
    const values = [];

    sorted.forEach(t => {
        if (t.resultado && !isNaN(parseFloat(t.resultado))) {
            current += parseFloat(t.resultado);
        }
        labels.push(t.data);
        values.push(current);
    });

    if (labels.length === 0) {
        labels.push(new Date().toISOString().slice(0,10));
        values.push(patrimonio);
    }

    if (performanceChart) performanceChart.destroy();

    performanceChart = new Chart(canvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Patrimônio (R$)',
                data: values,
                borderColor: '#1e7e5e',
                backgroundColor: 'rgba(30, 126, 94, 0.1)',
                borderWidth: 3,
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: false } }
        }
    });
}

// ==================== BACKUP (EXPORT / IMPORT) ====================
function exportAllData() {
    const backup = {
        patrimonio: patrimonio,
        dailyStopCount: dailyStopCount,
        checkboxes: {},
        trades: trades,
        ativosList: ativosList,
        exportDate: new Date().toISOString()
    };

    allCheckboxIds.forEach(id => {
        const cb = document.getElementById(id);
        if (cb) backup.checkboxes[id] = cb.checked;
    });

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `backup_diario_trade_${new Date().toISOString().slice(0,10)}.json`;
    link.click();
}

function importAllData(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const backup = JSON.parse(e.target.result);
            
            if (backup.patrimonio) {
                patrimonio = backup.patrimonio;
                updatePatrimonioDisplay();
            }
            if (backup.dailyStopCount !== undefined) {
                dailyStopCount = backup.dailyStopCount;
                updateStopDisplay();
                enforceStopLimitUI();
            }
            if (backup.trades) {
                trades = backup.trades;
                saveTrades();
            }
            if (backup.ativosList) {
                ativosList = backup.ativosList;
                updateDatalist();
            }
            if (backup.checkboxes) {
                Object.keys(backup.checkboxes).forEach(id => {
                    const cb = document.getElementById(id);
                    if (cb) {
                        cb.checked = backup.checkboxes[id];
                        localStorage.setItem(`chk_${id}`, cb.checked);
                    }
                });
            }
            alert("✅ Backup importado com sucesso!");
        } catch (err) {
            alert("❌ Erro ao importar backup: arquivo inválido.");
        }
    };
    reader.readAsText(file);
}

// ==================== MINI ÍNDICE - COTAÇÕES (Simulado) ====================
async function updateStocks() {
    const grid = document.getElementById('stocksGrid');
    if (!grid) return;
    
    grid.innerHTML = `
        <div class="stock-item">WINJ26 <span class="positive">+0.85%</span></div>
        <div class="stock-item">INDO26 <span class="negative">-0.32%</span></div>
        <div class="stock-item">PETR4 <span class="positive">+1.24%</span></div>
        <div class="stock-item">VALE3 <span class="positive">+0.67%</span></div>
    `;
}

function startStockUpdater() {
    updateStocks();
    setInterval(updateStocks, 30000);
}

// ==================== CALENDÁRIO ECONÔMICO (Simulado) ====================
function loadEconomicCalendar() {
    const container = document.getElementById('economicCalendar');
    if (!container) return;
    
    container.innerHTML = `
        <div class="calendar-item">
            <strong>10:00</strong> - PMI Industrial (USA)
        </div>
        <div class="calendar-item">
            <strong>11:30</strong> - Decisão de Juros (Bacen)
        </div>
    `;
}

// ==================== ACCORDION ====================
function initAccordion() {
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            const targetId = header.getAttribute('data-target');
            const body = document.getElementById(targetId);
            if (!body) return;

            body.classList.toggle('active');
            const icon = header.querySelector('.accordion-icon');
            if (icon) icon.style.transform = body.classList.contains('active') ? 'rotate(180deg)' : 'rotate(0deg)';
        });
    });
}

function displayCurrentDate() {
    const span = document.getElementById('currentDate');
    if (span) {
        span.textContent = new Date().toLocaleDateString('pt-BR', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    }
}

// ==================== INICIALIZAÇÃO ====================
function init() {
    loadCheckboxes();
    loadStopCount();
    loadPatrimonio();
    loadAtivos();
    loadTrades();
    displayCurrentDate();
    initAccordion();
    startStockUpdater();
    loadEconomicCalendar();
    startMarketsUpdater();
    
    // Event listeners
    document.getElementById('editarPatrimonioBtn')?.addEventListener('click', editarPatrimonio);
    document.getElementById('addStopBtn')?.addEventListener('click', addStop);
    document.getElementById('resetStopsBtn')?.addEventListener('click', resetStops);
    document.getElementById('fullResetDay')?.addEventListener('click', fullResetChecklists);
    document.getElementById('addAssetBtn')?.addEventListener('click', addAsset);
    document.getElementById('removeAssetBtn')?.addEventListener('click', removeAsset);
    document.getElementById('refreshStocksBtn')?.addEventListener('click', updateStocks);
    document.getElementById('exportAllBtn')?.addEventListener('click', exportAllData);
    document.getElementById('exportTradesBtn')?.addEventListener('click', exportToCSV);

    // Formulário de trade
    document.getElementById('addTradeBtn')?.addEventListener('click', () => {
        const trade = getFormTrade();
        if (trade) {
            addTrade(trade);
            clearForm();
        }
    });
    document.getElementById('clearFormBtn')?.addEventListener('click', clearForm);

    // P&L em tempo real
    const updatePnL = () => {
        const entry = parseFloat(document.getElementById('entryPrice').value);
        const exit = parseFloat(document.getElementById('exitPrice').value);
        const type = document.getElementById('tradeType').value;
        const pnlEl = document.getElementById('pnl');
        if (!isNaN(entry) && !isNaN(exit)) {
            pnlEl.value = calculatePnL(entry, exit, type);
        } else {
            pnlEl.value = '';
        }
    };
    document.getElementById('entryPrice')?.addEventListener('input', updatePnL);
    document.getElementById('exitPrice')?.addEventListener('input', updatePnL);
    document.getElementById('tradeType')?.addEventListener('change', updatePnL);

    // Import Backup
    const importInput = document.getElementById('importFileInput');
    const importLabel = document.querySelector('.backup-card label');
    if (importLabel) {
        importLabel.addEventListener('click', () => importInput.click());
    }
    importInput?.addEventListener('change', e => {
        if (e.target.files[0]) importAllData(e.target.files[0]);
    });
}

window.onload = init;

// ==================== RELÓGIO CIRCULAR DE MERCADOS (GMT-3) ====================
const marketsClockData = [
    { name: "Sydney",       open: 17, close: 1,   color: "#10b981", flag: "🇦🇺" },
    { name: "Tóquio",       open: 21, close: 6,   color: "#ef4444", flag: "🇯🇵" },
    { name: "Hong Kong",    open: 22, close: 6,   color: "#eab308", flag: "🇭🇰" },
    { name: "Londres",      open: 5,  close: 13.5, color: "#3b82f6", flag: "🇬🇧" },
    { name: "Nova York",    open: 10.5, close: 17, color: "#8b5cf6", flag: "🇺🇸" },
    { name: "B3 Brasil",    open: 10, close: 17.9167, color: "#22c55e", flag: "🇧🇷" }
];

function degreesToRadians(deg) {
    return (deg * Math.PI) / 180;
}

function renderMarketClock() {
    const container = document.getElementById('marketClock');
    if (!container) return;

    const currentHour = getCurrentHourGMT3();
    const currentAngle = (currentHour / 24) * 360;

    let html = `
        <div class="clock-face">
            <div class="clock-hour-marks"></div>
            
            <!-- Arcos dos mercados -->
    `;

    marketsClockData.forEach((market, index) => {
        const startAngle = (market.open / 24) * 360;
        let endAngle = (market.close / 24) * 360;
        if (endAngle < startAngle) endAngle += 360;

        const isOpen = (currentHour >= market.open && currentHour < market.close) ||
                       (market.close < market.open && (currentHour >= market.open || currentHour < market.close));

        const radius = 110 + (index * 28);
        const strokeWidth = 26;

        html += `
            <svg class="market-arc-svg" width="320" height="320" style="position:absolute; left:0; top:0;">
                <circle 
                    cx="160" cy="160" r="${radius}"
                    fill="none"
                    stroke="${market.color}"
                    stroke-width="${strokeWidth}"
                    stroke-dasharray="${(endAngle - startAngle) * 2.8} ${360 * 2.8}"
                    stroke-dashoffset="${-startAngle * 2.8}"
                    stroke-linecap="round"
                    opacity="${isOpen ? '0.95' : '0.35'}"
                />
            </svg>
        `;
    });

    html += `
            <!-- Marcas de hora -->
            ${Array.from({length: 24}, (_, i) => {
                const angle = (i / 24) * 360;
                return `<div class="hour-mark" style="transform: rotate(${angle}deg);"></div>`;
            }).join('')}
            
            <!-- Labels dos mercados -->
    `;

    marketsClockData.forEach((market, index) => {
        const midHour = (market.open + (market.close - market.open) / 2) % 24;
        const angle = (midHour / 24) * 360 - 90;
        const rad = degreesToRadians(angle);
        const x = 160 + Math.cos(rad) * 155;
        const y = 160 + Math.sin(rad) * 155;

        html += `
            <div class="market-name-label" style="left: ${x - 55}px; top: ${y - 18}px;">
                ${market.flag} ${market.name}
            </div>
        `;
    });

    html += `
            <!-- Ponteiro da hora atual -->
            <div class="current-time-hand" style="transform: rotate(${currentAngle}deg);"></div>
            <div class="clock-center"></div>
        </div>
    `;

    container.innerHTML = html;
}

function getCurrentHourGMT3() {
    const now = new Date();
    let hour = now.getUTCHours() - 3;
    if (hour < 0) hour += 24;
    return hour + (now.getUTCMinutes() / 60);
}

function startMarketsUpdater() {
    renderMarketClock();
    setInterval(renderMarketClock, 60000); // Atualiza a cada minuto
}

// Event listener para o botão de refresh
document.getElementById('refreshMarketsBtn')?.addEventListener('click', renderMarketClock);
