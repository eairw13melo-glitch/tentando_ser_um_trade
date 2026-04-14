// Lista de todos os IDs de checkbox usados no HTML
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

// ---------- 1. Carregar/salvar checkboxes no localStorage ----------
function loadCheckboxes() {
    for (let id of allCheckboxIds) {
        const cb = document.getElementById(id);
        if (cb) {
            const saved = localStorage.getItem(`chk_${id}`);
            if (saved !== null) {
                cb.checked = saved === 'true';
            } else {
                cb.checked = false;
            }
            cb.addEventListener('change', function() {
                localStorage.setItem(`chk_${id}`, cb.checked);
            });
        }
    }
}

// ---------- 2. Gerenciamento de stops diários ----------
let dailyStopCount = 0;
const STORAGE_STOP_KEY = 'daily_stop_counter';

function loadStopCount() {
    const saved = localStorage.getItem(STORAGE_STOP_KEY);
    if (saved !== null && !isNaN(parseInt(saved))) {
        dailyStopCount = parseInt(saved);
    } else {
        dailyStopCount = 0;
    }
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
        alert("⚠️ Limite de 2 stops diários atingido! Dia encerrado. Não opere mais. Respeite o plano.");
        return;
    }
    dailyStopCount++;
    updateStopDisplay();
    enforceStopLimitUI();
    if (dailyStopCount === 2) {
        alert("🔴 DOIS STOPS ATINGIDOS: Fim do dia de trading. Levante da mesa, desligue os gráficos. Só amanhã.");
    } else if (dailyStopCount === 1) {
        alert("⚠️ Primeiro stop registrado. Cuidado: pausa de 15 minutos, respire e reavalie. Um stop a mais encerra o dia.");
    }
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
            if (isLimitHit) {
                cb.disabled = true;
                cb.parentElement.style.opacity = "0.6";
            } else {
                cb.disabled = false;
                cb.parentElement.style.opacity = "1";
            }
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

// ---------- 3. Reset completo do dia ----------
function fullReset() {
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
    alert("✅ Reset completo realizado! Um novo dia de trading começa. Respeite os limites e execute o plano.");
}

// ---------- 4. Data atual ----------
function displayCurrentDate() {
    const dateSpan = document.getElementById('currentDate');
    if (dateSpan) {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateSpan.innerText = now.toLocaleDateString('pt-BR', options);
    }
}

// ---------- 5. Bind dos botões ----------
function bindButtons() {
    const addBtn = document.getElementById('addStopBtn');
    if (addBtn) addBtn.addEventListener('click', addStop);
    const resetStopsBtn = document.getElementById('resetStopsBtn');
    if (resetStopsBtn) resetStopsBtn.addEventListener('click', resetStops);
    const fullResetBtn = document.getElementById('fullResetDay');
    if (fullResetBtn) fullResetBtn.addEventListener('click', fullReset);
}

// ---------- 6. Inicialização ----------
function init() {
    loadCheckboxes();
    loadStopCount();
    bindButtons();
    displayCurrentDate();
    // Sincroniza o estado dos items "during" com a contagem inicial
    if (dailyStopCount >= 2) {
        enableDuringTradingItems(false);
    } else {
        enableDuringTradingItems(true);
    }
    enforceStopLimitUI();
}

init();
