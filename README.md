# 📋📓 Diário do Trader Consistente

Ferramenta web completa para traders que desejam unir **checklist de disciplina diária** com um **diário de trades** detalhado.  
Baseada nos melhores materiais sobre psicologia do trading, gestão de risco e planos de trade.

![Status](https://img.shields.io/badge/status-ativo-brightgreen)
![Licença](https://img.shields.io/badge/licença-MIT-blue)

## 🚀 Funcionalidades

### ✅ Checklist de Disciplina (5 áreas)
- Mental e Pré-Abertura
- Gestão de Risco e Limites Diários
- Durante o Pregão e Controle de Impulso
- Pós-Mercado e Melhoria Contínua
- Disciplina e Regras de Ouro

### 📔 Diário de Trades
- Registro completo de cada operação:
  - Data, Ativo, Tipo (Compra/Venda)
  - Preços de Entrada, Saída, Stop Loss, Take Profit
  - Risco percentual do capital
  - Estratégia utilizada
  - Avaliação da gestão de risco (seguiu ou não o plano)
  - Observações pessoais e emocionais
- **Cálculo automático** do resultado (P&L) quando a saída é informada
- **Edição e exclusão** de trades registrados
- **Exportação para CSV** – mantenha um backup ou analise em planilhas
- Persistência total no `localStorage` – os dados não se perdem ao fechar o navegador

### 🛑 Controle de Stops Diários
- Limite de **2 stops** por dia (configurável via botões)
- Ao atingir o limite, os checklists operacionais são bloqueados – reforço do fim do dia

### 🔄 Reset seletivo
- **Reset Completo do Dia** limpa apenas checklists e contador de stops (os trades permanecem salvos)

## 🛠️ Tecnologias
- HTML5, CSS3 (Grid, Flex, responsivo)
- JavaScript Vanilla
- LocalStorage

## 📁 Estrutura
