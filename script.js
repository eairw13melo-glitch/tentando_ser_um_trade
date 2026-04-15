// ==================== 1. CHECKLIST + STOPS ====================
const allCheckboxIds = [
    "mental_estavel", "mental_sleep", "afirmacao", "respira_pre", "macro_global",
    "analise_tecnica", "setup_definido", "plano_contingencia",
    "risk_por_trade", "daily_stop_cap", "max_trades_day", "stop_loss_fixo",
    "alvo_parcial", "respeitar_limite_stop",
    "esperar_oportunidade", "seguir_estrategia", "aceitar_perdas",
    "leitura_anti_impulso", "respira_antes_clique", "check_emocional_entrada",
    "registrar_trades", "revisar_plano", "diario_emocional", "ritual_encerramento",
    "reflexao_noite", "ajustar_estrategia",
    "nunca_vinganca", "nunca_averagedown", "sem_operar_abalado", "sair_meta_stop",
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
    if (dailyStopCount === 2) alert("🔴 DOIS STOPS: Fim do dia de trading.");
    else if (dailyStopCount === 1) alert("⚠️ Primeiro stop. Pausa de 15 minutos.");
}
function resetStops() {
    dailyStopCount = 0;
    updateStopDisplay();
    enforceStopLimitUI();
}
function enforceStopLimitUI() {
    const during = ["esperar_oportunidade","seguir_estrategia","aceitar_perdas","leitura_anti_impulso","respira_antes_clique","check_emocional_entrada"];
    const hit = dailyStopCount >= 2;
    during.forEach(id => {
        const cb = document.getElementById(id);
        if (cb) {
            cb.disabled = hit;
            cb.parentElement.style.opacity = hit ? "0.6" : "1";
        }
    });
}
function fullResetChecklists() {
    for (let id of allCheckboxIds) {
        const cb = document.getElementById(id);
        if (cb) { cb.checked = false; localStorage.setItem(`chk_${id}`, 'false'); cb.disabled = false; cb.parentElement.style.opacity = "1"; }
    }
    dailyStopCount = 0;
    updateStopDisplay();
    enforceStopLimitUI();
    alert("Checklists e stops resetados. Trades e patrimônio mantidos.");
}

// ==================== 2. PATRIMÔNIO ====================
let patrimonio = 0;
function loadPatrimonio() {
    const saved = localStorage.getItem('trader_patrimonio');
    patrimonio = saved ? parseFloat(saved) : 10000.00; // valor inicial padrão R$10k
    updatePatrimonioDisplay();
}
function updatePatrimonioDisplay() {
    const elem = document.getElementById('patrimonioValor');
    if (elem) elem.innerText = `R$ ${patrimonio.toFixed(2)}`;
    localStorage.setItem('trader_patrimonio', patrimonio);
}
function editarPatrimonio() {
    let novo = prompt("Digite o novo valor do patrimônio (R$):", patrimonio.toFixed(2));
    if (novo !== null && !isNaN(parseFloat(novo))) {
        patrimonio = parseFloat(novo);
        updatePatrimonioDisplay();
    }
}

// ==================== 3. ATIVOS EDITÁVEIS ====================
let ativosList = ["PETR4", "VALE3", "WING25", "WINJ25", "EUR/USD", "BTC/USD"];
function loadAtivos() {
    const saved = localStorage.getItem('trader_ativos_list');
    if (saved) ativosList = JSON.parse(saved);
    else ativosList = ativosList;
    updateDatalist();
}
function updateDatalist() {
    const datalist = document.getElementById('ativosList');
    if (datalist) {
        datalist.innerHTML = '';
        ativosList.forEach(ativo => {
            const option = document.createElement('option');
            option.value = ativo;
            datalist.appendChild(option);
        });
    }
    localStorage.setItem('trader_ativos_list', JSON.stringify(ativosList));
}
function addAsset() {
    const input = document.getElementById('asset');
    const newAsset = input.value.trim();
    if (newAsset && !ativosList.includes(newAsset)) {
        ativosList.push(newAsset);
        updateDatalist();
        input.value = newAsset;
    } else if (newAsset && ativosList.includes(newAsset)) {
        alert("Ativo já existe na lista.");
    } else {
        alert("Digite um nome de ativo válido.");
    }
}
function removeAsset() {
    const input = document.getElementById('asset');
    const assetToRemove = input.value.trim();
    if (assetToRemove && ativosList.includes(assetToRemove)) {
        ativosList = ativosList.filter(a => a !== assetToRemove);
        updateDatalist();
        input.value = "";
    } else {
        alert("Ativo não encontrado na lista para remoção.");
    }
}

// ==================== 4. DIÁRIO DE TRADES ====================
let trades = [];
function loadTrades() {
    const stored = localStorage.getItem('trader_diary_trades');
    trades = stored ? JSON.parse(stored) : [];
    renderTrades();
}
function saveTrades() {
    localStorage.setItem('trader_diary_trades', JSON.stringify(trades));
    renderTrades();
}
function calculatePnL(entry, exit, type) {
    if (!entry || !exit) return "";
    const diff = exit - entry;
    const result = type === "Compra" ? diff : -diff;
    return result.toFixed(2);
}
function addTrade(trade) {
    trade.id = Date.now();
    trades.unshift(trade);
    saveTrades();
}
function deleteTrade(id) {
    trades = trades.filter(t => t.id != id);
    saveTrades();
}
function editTradeById(id) {
    const trade = trades.find(t => t.id == id);
    if (!trade) return;
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
    if (confirm("Editar este trade? Após alterar, clique em 'Adicionar Trade' para salvar.")) {
        deleteTrade(id);
    }
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
    const today = new Date().toISOString().slice(0,10);
    if(document.getElementById('tradeDate')) document.getElementById('tradeDate').value = today;
    document.getElementById('addTradeBtn')?.addEventListener('click', ()=>{ const t=getFormTrade(); if(t){ addTrade(t); clearForm(); } });
    document.getElementById('clearFormBtn')?.addEventListener('click', clearForm);
    document.getElementById('exportTradesBtn')?.addEventListener('click', exportToCSV);
    // P&L automático
    const exitInput = document.getElementById('exitPrice'), entryInput = document.getElementById('entryPrice'), typeSelect = document.getElementById('tradeType'), pnlField = document.getElementById('pnl');
    const updatePnL = () => { const entry=parseFloat(entryInput.value), exit=parseFloat(exitInput.value), type=typeSelect.value; if(!isNaN(entry) && !isNaN(exit)) pnlField.value = calculatePnL(entry, exit, type); else pnlField.value = ''; };
    entryInput.addEventListener('input', updatePnL);
    exitInput.addEventListener('input', updatePnL);
    typeSelect.addEventListener('change', updatePnL);
}

// ==================== 5. ACCORDION (checklists dinâmicos) ====================
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
        // Inicialmente, todos abertos? Pode deixar o primeiro aberto, mas vamos manter todos abertos por padrão? O CSS active já deixa o primeiro? Vamos deixar todos fechados por padrão exceto o primeiro? Para ficar mais clean, vou deixar todos fechados. Mas o HTML já tem class="active" no primeiro? Sim, no checklist1 está active. Ajustei.
        const icon = header.querySelector('.accordion-icon');
        if (icon && header.getAttribute('data-target') !== 'checklist1') icon.style.transform = 'rotate(-90deg)';
    });
}

// ==================== 6. DATA ATUAL ====================
function displayCurrentDate() {
    const span = document.getElementById('currentDate');
    if(span){
        const now = new Date();
        span.innerText = now.toLocaleDateString('pt-BR', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
    }
}

// ==================== 7. INICIALIZAÇÃO ====================
function init() {
    loadCheckboxes();
    loadStopCount();
    loadPatrimonio();
    loadAtivos();
    initDiary();
    displayCurrentDate();
    initAccordion();
    document.getElementById('editarPatrimonioBtn')?.addEventListener('click', editarPatrimonio);
    document.getElementById('addStopBtn')?.addEventListener('click', addStop);
    document.getElementById('resetStopsBtn')?.addEventListener('click', resetStops);
    document.getElementById('fullResetDay')?.addEventListener('click', fullResetChecklists);
    document.getElementById('addAssetBtn')?.addEventListener('click', addAsset);
    document.getElementById('removeAssetBtn')?.addEventListener('click', removeAsset);
}
init();
