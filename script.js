// ==================== CHECKLIST + STOPS (original, adaptado) ====================
const allCheckboxIds = [
    "mental_estavel", "mental_sleep", "afirmacao", "respira_pre", "macro_global",
    "analise_tecnica", "setup_definido", "plano_contingencia",
    "risk_por_trade", "daily_stop_cap", "max_trades_day", "stop_loss_fixo",
    "alvo_parcial", "respeitar_limite_stop",
    "esperar_oportunidade", "seguir_estrategia", "aceitar_perdas",
    "leitura_anti_impulso", "respira_antes_clique", "check_emocional_entrada",
    "registrar_trades", "revisar_plano", "diario_emocional", "ritual_encerramento",
    "reflexao_noite", "ajustar_estrategia", "revisao_semanal",
    "nunca_vinganca", "nunca_averagedown", "sem_operar_abalado", "sair_meta_stop",
    "consistencia_mensal"
];

function loadCheckboxes() {
    for (let id of allCheckboxIds) {
        const cb = document.getElementById(id);
        if (cb) {
            const saved = localStorage.getItem(`chk_${id}`);
            if (saved !== null) cb.checked = saved === 'true';
            else cb.checked = false;
            cb.addEventListener('change', function() {
                localStorage.setItem(`chk_${id}`, cb.checked);
            });
        }
    }
}

let dailyStopCount = 0;
const STORAGE_STOP_KEY = 'daily_stop_counter';

function loadStopCount() {
    const saved = localStorage.getItem(STORAGE_STOP_KEY);
    dailyStopCount = (saved !== null && !isNaN(parseInt(saved))) ? parseInt(saved) : 0;
    updateStopDisplay();
    enforceStopLimitUI();
}

function updateStopDisplay() {
    const displaySpan = document.getElementById('stopCounterDisplay');
    if (displaySpan) displaySpan.innerText = dailyStopCount;
    localStorage.setItem(STORAGE_STOP_KEY, dailyStopCount);
}

function addStop() {
    if (dailyStopCount >= 2) {
        alert("⚠️ Limite de 2 stops diários atingido! Dia encerrado.");
        return;
    }
    dailyStopCount++;
    updateStopDisplay();
    enforceStopLimitUI();
    if (dailyStopCount === 2) alert("🔴 DOIS STOPS ATINGIDOS: Fim do dia de trading.");
    else if (dailyStopCount === 1) alert("⚠️ Primeiro stop registrado. Pausa de 15 minutos.");
}

function resetStops() {
    dailyStopCount = 0;
    updateStopDisplay();
    enforceStopLimitUI();
    enableDuringTradingItems(true);
}

function enforceStopLimitUI() {
    const itemsDuring = ["esperar_oportunidade", "seguir_estrategia", "aceitar_perdas", "leitura_anti_impulso", "respira_antes_clique", "check_emocional_entrada"];
    const isLimitHit = (dailyStopCount >= 2);
    for (let id of itemsDuring) {
        const cb = document.getElementById(id);
        if (cb) {
            cb.disabled = isLimitHit;
            cb.parentElement.style.opacity = isLimitHit ? "0.6" : "1";
        }
    }
}

function enableDuringTradingItems(enable) {
    const itemsDuring = ["esperar_oportunidade", "seguir_estrategia", "aceitar_perdas", "leitura_anti_impulso", "respira_antes_clique", "check_emocional_entrada"];
    for (let id of itemsDuring) {
        const cb = document.getElementById(id);
        if (cb) {
            cb.disabled = !enable;
            cb.parentElement.style.opacity = enable ? "1" : "0.6";
        }
    }
}

function fullResetChecklists() {
    for (let id of allCheckboxIds) {
        const cb = document.getElementById(id);
        if (cb) {
            cb.checked = false;
            localStorage.setItem(`chk_${id}`, 'false');
            cb.disabled = false;
            cb.parentElement.style.opacity = "1";
        }
    }
    dailyStopCount = 0;
    updateStopDisplay();
    enforceStopLimitUI();
    enableDuringTradingItems(true);
    alert("✅ Checklists e stops resetados. Os trades salvos permanecem.");
}

// ==================== DIÁRIO DE TRADES ====================
let trades = []; // array de objetos

const STORAGE_TRADES_KEY = 'trader_diary_trades';

function loadTrades() {
    const stored = localStorage.getItem(STORAGE_TRADES_KEY);
    if (stored) {
        trades = JSON.parse(stored);
    } else {
        trades = [];
    }
    renderTrades();
}

function saveTrades() {
    localStorage.setItem(STORAGE_TRADES_KEY, JSON.stringify(trades));
    renderTrades();
}

function addTrade(trade) {
    trade.id = Date.now(); // ID único
    trades.unshift(trade); // mais recente no topo
    saveTrades();
}

function updateTrade(id, updatedTrade) {
    const index = trades.findIndex(t => t.id == id);
    if (index !== -1) {
        trades[index] = { ...updatedTrade, id: parseInt(id) };
        saveTrades();
    }
}

function deleteTrade(id) {
    trades = trades.filter(t => t.id != id);
    saveTrades();
}

// Função para calcular P&L com base nos preços
function calculatePnL(entry, exit, type) {
    if (!entry || !exit) return "";
    const diff = exit - entry;
    const result = type === "Compra" ? diff : -diff;
    return result.toFixed(2);
}

// Renderizar lista de trades
function renderTrades() {
    const container = document.getElementById('tradesContainer');
    if (!container) return;
    if (trades.length === 0) {
        container.innerHTML = '<div class="empty-message">Nenhum trade registrado ainda. Adicione seus trades acima.</div>';
        return;
    }
    let html = '';
    for (let t of trades) {
        const resultClass = (t.resultado && parseFloat(t.resultado) > 0) ? 'style="color:#1e7e5e;"' : (t.resultado && parseFloat(t.resultado) < 0) ? 'style="color:#b13e3e;"' : '';
        html += `
            <div class="trade-item" data-id="${t.id}">
                <div class="trade-info">
                    <strong>${t.data}</strong> | ${t.ativo} | ${t.tipo}<br>
                    Entrada: ${t.entrada} | Saída: ${t.saida || 'aberto'} | Stop: ${t.stopLoss || '-'}<br>
                    Risco: ${t.riscoPercent ? t.riscoPercent+'%' : '-'} | Resultado: <span ${resultClass}>${t.resultado || 'pendente'}</span><br>
                    Estratégia: ${t.estrategia || '-'} | Gestão de Risco: ${t.riskRule || '-'}<br>
                    <small>${t.notas || ''}</small>
                </div>
                <div class="trade-actions">
                    <button class="btn-edit" data-id="${t.id}">✏️ Editar</button>
                    <button class="btn-delete" data-id="${t.id}">🗑️ Excluir</button>
                </div>
            </div>
        `;
    }
    container.innerHTML = html;
    // Adicionar eventos
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = btn.getAttribute('data-id');
            editTradeById(id);
        });
    });
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = btn.getAttribute('data-id');
            if (confirm('Tem certeza que deseja excluir este trade?')) deleteTrade(id);
        });
    });
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

    if (!data || !ativo || isNaN(entrada)) {
        alert('Por favor, preencha Data, Ativo e Preço de Entrada.');
        return null;
    }
    let resultado = '';
    if (saida && !isNaN(saida)) {
        resultado = calculatePnL(entrada, saida, tipo);
    }
    return {
        data, ativo, tipo, entrada, saida, stopLoss, takeProfit,
        riscoPercent, estrategia, riskRule, notas, resultado
    };
}

function clearForm() {
    document.getElementById('tradeDate').value = new Date().toISOString().slice(0,10);
    document.getElementById('asset').value = '';
    document.getElementById('tradeType').value = 'Compra';
    document.getElementById('entryPrice').value = '';
    document.getElementById('exitPrice').value = '';
    document.getElementById('stopLoss').value = '';
    document.getElementById('takeProfit').value = '';
    document.getElementById('riskPercent').value = '';
    document.getElementById('strategy').value = '';
    document.getElementById('riskRule').value = 'Sim';
    document.getElementById('notes').value = '';
}

function editTradeById(id) {
    const trade = trades.find(t => t.id == id);
    if (!trade) return;
    // Preencher formulário
    document.getElementById('tradeDate').value = trade.data;
    document.getElementById('asset').value = trade.ativo;
    document.getElementById('tradeType').value = trade.tipo;
    document.getElementById('entryPrice').value = trade.entrada;
    document.getElementById('exitPrice').value = trade.saida !== null ? trade.saida : '';
    document.getElementById('stopLoss').value = trade.stopLoss !== null ? trade.stopLoss : '';
    document.getElementById('takeProfit').value = trade.takeProfit !== null ? trade.takeProfit : '';
    document.getElementById('riskPercent').value = trade.riscoPercent !== null ? trade.riscoPercent : '';
    document.getElementById('strategy').value = trade.estrategia || '';
    document.getElementById('riskRule').value = trade.riskRule || 'Sim';
    document.getElementById('notes').value = trade.notas || '';
    // Remover o antigo e depois adicionar atualizado
    if (confirm('Editar este trade? Após editar, clique em "Adicionar Trade" para salvar as alterações.')) {
        deleteTrade(id);
    }
}

function exportToCSV() {
    if (trades.length === 0) {
        alert('Nenhum trade para exportar.');
        return;
    }
    const headers = ['Data','Ativo','Tipo','Entrada','Saída','Stop Loss','Take Profit','Risco %','Estratégia','Gestão Risco','Resultado','Notas'];
    const rows = trades.map(t => [
        t.data, t.ativo, t.tipo, t.entrada, t.saida ?? '', t.stopLoss ?? '', t.takeProfit ?? '',
        t.riscoPercent ?? '', t.estrategia ?? '', t.riskRule ?? '', t.resultado ?? '', t.notas ?? ''
    ]);
    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'diario_trades.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function initDiary() {
    loadTrades();
    // Data padrão = hoje
    const today = new Date().toISOString().slice(0,10);
    if (document.getElementById('tradeDate')) document.getElementById('tradeDate').value = today;
    document.getElementById('addTradeBtn')?.addEventListener('click', () => {
        const newTrade = getFormTrade();
        if (newTrade) {
            addTrade(newTrade);
            clearForm();
        }
    });
    document.getElementById('clearFormBtn')?.addEventListener('click', clearForm);
    document.getElementById('exportTradesBtn')?.addEventListener('click', exportToCSV);
    // Atualizar P&L dinâmico quando saída mudar
    const exitInput = document.getElementById('exitPrice');
    const entryInput = document.getElementById('entryPrice');
    const typeSelect = document.getElementById('tradeType');
    const pnlField = document.getElementById('pnl');
    function updatePnL() {
        const entry = parseFloat(entryInput.value);
        const exit = parseFloat(exitInput.value);
        const type = typeSelect.value;
        if (!isNaN(entry) && !isNaN(exit)) {
            pnlField.value = calculatePnL(entry, exit, type);
        } else {
            pnlField.value = '';
        }
    }
    entryInput.addEventListener('input', updatePnL);
    exitInput.addEventListener('input', updatePnL);
    typeSelect.addEventListener('change', updatePnL);
}

// ==================== INICIALIZAÇÃO GERAL ====================
function init() {
    loadCheckboxes();
    loadStopCount();
    initDiary();
    displayCurrentDate();
    const fullResetBtn = document.getElementById('fullResetDay');
    if (fullResetBtn) fullResetBtn.addEventListener('click', fullResetChecklists);
    const addStopBtn = document.getElementById('addStopBtn');
    if (addStopBtn) addStopBtn.addEventListener('click', addStop);
    const resetStopsBtn = document.getElementById('resetStopsBtn');
    if (resetStopsBtn) resetStopsBtn.addEventListener('click', resetStops);
}

function displayCurrentDate() {
    const dateSpan = document.getElementById('currentDate');
    if (dateSpan) {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateSpan.innerText = now.toLocaleDateString('pt-BR', options);
    }
}

init();
