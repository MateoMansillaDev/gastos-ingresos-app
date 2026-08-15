let appBalance = { income: 0, expense: 0, balance: 0 };
let appTransactions = [];
let appRules = [];

// Theme functions
function setTheme(theme) {
  document.body.className = 'theme-' + theme;
  localStorage.setItem('theme', theme);
  
  // Update active button
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-theme') === theme) {
      btn.classList.add('active');
    }
  });
}

function loadTheme() {
  const savedTheme = localStorage.getItem('theme') || 'purple';
  setTheme(savedTheme);
}

// Modal functions
function showModal(title, message) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalMessage').textContent = message;
  document.getElementById('modal').style.display = 'flex';
}

function hideModal() {
  document.getElementById('modal').style.display = 'none';
}

document.getElementById('modalCloseBtn').addEventListener('click', hideModal);

// Theme button listeners
document.querySelectorAll('.theme-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    setTheme(this.getAttribute('data-theme'));
  });
});

// Load saved theme on startup
loadTheme();

async function fetchData() {
  console.log('Starting to fetch data...');
  try {
    console.log('Fetching balance...');
    const balanceRes = await fetch('http://localhost:3000/api/transactions/balance');
    console.log('Balance response status:', balanceRes.status);
    
    console.log('Fetching transactions...');
    const transRes = await fetch('http://localhost:3000/api/transactions');
    console.log('Transactions response status:', transRes.status);
    
    console.log('Fetching rules...');
    const rulesRes = await fetch('http://localhost:3000/api/automatic-rules');
    console.log('Rules response status:', rulesRes.status);
    
    if (balanceRes.ok) {
      appBalance = await balanceRes.json();
      console.log('Balance data:', appBalance);
      updateBalanceDisplay();
    } else {
      console.error('Balance request failed:', balanceRes.status);
      document.getElementById('balance').innerHTML = 'Error cargando balance';
    }
    
    if (transRes.ok) {
      appTransactions = await transRes.json();
      console.log('Transactions data:', appTransactions);
      updateTransactionsDisplay();
    } else {
      console.error('Transactions request failed:', transRes.status);
      document.getElementById('txList').innerHTML = 'Error cargando transacciones';
    }
    
    if (rulesRes.ok) {
      appRules = await rulesRes.json();
      console.log('Rules data:', appRules);
      updateRulesDisplay();
    } else {
      console.error('Rules request failed:', rulesRes.status);
      document.getElementById('rulesList').innerHTML = 'Error cargando reglas';
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    document.getElementById('balance').innerHTML = 'Error de conexión: ' + error.message;
    document.getElementById('txList').innerHTML = 'Error de conexión';
    document.getElementById('rulesList').innerHTML = 'Error de conexión';
  }
}

function updateBalanceDisplay() {
  document.getElementById('incomeAmount').textContent = '$' + appBalance.income.toFixed(2);
  document.getElementById('expenseAmount').textContent = '$' + appBalance.expense.toFixed(2);
  document.getElementById('balanceAmount').textContent = '$' + appBalance.balance.toFixed(2);
  
  // Update balance card color based on value
  const balanceCard = document.getElementById('balanceCard');
  balanceCard.classList.remove('positive', 'negative');
  if (appBalance.balance > 0) {
    balanceCard.classList.add('positive');
  } else if (appBalance.balance < 0) {
    balanceCard.classList.add('negative');
  }
}

function updateTransactionsDisplay() {
  if (appTransactions.length === 0) {
    document.getElementById('txList').innerHTML = '<p>No hay transacciones</p>';
  } else {
    document.getElementById('txList').innerHTML = appTransactions.map(t => 
      '<div class="tx-item">' +
        '<strong>' + t.category + '</strong>: ' +
        '<span class="' + t.type + '">' + (t.type === 'income' ? '+' : '-') + '$' + t.amount.toFixed(2) + '</span>' +
        '<span style="margin-left: 10px; color: #666">' + t.description + '</span>' +
        (t.isAutomatic ? '<span style="margin-left: 10px; background: #17a2b8; color: white; padding: 2px 8px; border-radius: 3px; font-size: 12px;">Auto</span>' : '') +
        '<button data-id="' + t.id + '" class="delete-tx-btn" ' +
                'style="margin-left: 10px; background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">' +
          'Eliminar' +
        '</button>' +
      '</div>'
    ).join('');
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-tx-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        deleteTransaction(this.getAttribute('data-id'));
      });
    });
  }
}

function updateRulesDisplay() {
  if (appRules.length === 0) {
    document.getElementById('rulesList').innerHTML = '<p>No hay reglas automáticas configuradas</p>';
  } else {
    document.getElementById('rulesList').innerHTML = appRules.map(r => 
      '<div style="margin-bottom: 10px; padding: 10px; background: #e3f2fd; border-radius: 5px;">' +
        '<strong>' + r.category + '</strong> (' + (r.type === 'income' ? 'Ingreso' : 'Gasto') + '): $' + r.amount.toFixed(2) + '<br>' +
        '<small>' + r.description + '</small><br>' +
        '<small>' + (r.frequency === 'weekly' ? 'Cada ' + ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][r.dayOfWeek] : 'El día ' + r.dayOfMonth) + ' de cada mes' + '</small><br>' +
        '<small>Próxima ejecución: ' + new Date(r.nextExecution).toLocaleDateString('es-ES') + '</small>' +
        '<button data-id="' + r.id + '" class="delete-rule-btn" ' +
                'style="margin-left: 10px; background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">' +
          'Eliminar' +
        '</button>' +
      '</div>'
    ).join('');
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-rule-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        deleteRule(this.getAttribute('data-id'));
      });
    });
  }
}

async function addTransaction() {
  try {
    const type = document.getElementById('txType').value;
    const amount = parseFloat(document.getElementById('txAmount').value);
    const category = document.getElementById('txCategory').value;
    const description = document.getElementById('txDescription').value;
    
    if (!amount || !category) {
      showModal('Validación', 'Por favor ingresa monto y categoría');
      return;
    }

    console.log('Adding transaction:', { type, amount, category, description });
    
    const response = await fetch('http://localhost:3000/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, amount, category, description })
    });
    
    console.log('Response status:', response.status);
    
    if (response.ok) {
      document.getElementById('txAmount').value = '';
      document.getElementById('txCategory').value = '';
      document.getElementById('txDescription').value = '';
      console.log('Transaction added successfully');
      fetchData();
    } else {
      const errorData = await response.json();
      console.error('Error adding transaction:', errorData);
      showModal('Error', 'Error al agregar transacción: ' + (errorData.error || 'Error desconocido'));
    }
  } catch (error) {
    console.error('Error adding transaction:', error);
    showModal('Error', 'Error al agregar transacción: ' + error.message);
  }
}

async function deleteTransaction(id) {
  try {
    const response = await fetch('http://localhost:3000/api/transactions/' + id, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      fetchData();
    } else {
      showModal('Error', 'Error al eliminar transacción');
    }
  } catch (error) {
    console.error('Error deleting transaction:', error);
    showModal('Error', 'Error al eliminar transacción');
  }
}

function showRuleForm() {
  document.getElementById('ruleForm').style.display = 'block';
  document.getElementById('ruleFrequency').addEventListener('change', function() {
    if (this.value === 'weekly') {
      document.getElementById('dayOfWeekContainer').style.display = 'block';
      document.getElementById('dayOfMonthContainer').style.display = 'none';
    } else {
      document.getElementById('dayOfWeekContainer').style.display = 'none';
      document.getElementById('dayOfMonthContainer').style.display = 'block';
    }
  });
}

function hideRuleForm() {
  document.getElementById('ruleForm').style.display = 'none';
}

async function addAutomaticRule() {
  try {
    const type = document.getElementById('ruleType').value;
    const frequency = document.getElementById('ruleFrequency').value;
    const amount = parseFloat(document.getElementById('ruleAmount').value);
    const category = document.getElementById('ruleCategory').value;
    const description = document.getElementById('ruleDescription').value;
    const dayOfWeek = frequency === 'weekly' ? parseInt(document.getElementById('ruleDayOfWeek').value) : undefined;
    const dayOfMonth = frequency === 'monthly' ? parseInt(document.getElementById('ruleDayOfMonth').value) : undefined;
    
    if (!amount || !category) {
      showModal('Validación', 'Por favor ingresa monto y categoría');
      return;
    }

    if (frequency === 'weekly' && dayOfWeek === undefined) {
      showModal('Validación', 'Por favor selecciona el día de la semana');
      return;
    }

    if (frequency === 'monthly' && dayOfMonth === undefined) {
      showModal('Validación', 'Por favor selecciona el día del mes');
      return;
    }

    const response = await fetch('http://localhost:3000/api/automatic-rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, amount, category, description, frequency, dayOfWeek, dayOfMonth })
    });
    
    if (response.ok) {
      document.getElementById('ruleAmount').value = '';
      document.getElementById('ruleCategory').value = '';
      document.getElementById('ruleDescription').value = '';
      hideRuleForm();
      fetchData();
    } else {
      showModal('Error', 'Error al crear regla automática');
    }
  } catch (error) {
    console.error('Error adding automatic rule:', error);
    showModal('Error', 'Error al crear regla automática');
  }
}

async function deleteRule(id) {
  try {
    const response = await fetch('http://localhost:3000/api/automatic-rules/' + id, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      fetchData();
    } else {
      showModal('Error', 'Error al eliminar regla');
    }
  } catch (error) {
    console.error('Error deleting rule:', error);
    showModal('Error', 'Error al eliminar regla');
  }
}

async function executeRules() {
  try {
    const response = await fetch('http://localhost:3000/api/automatic-rules/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.ok) {
      const result = await response.json();
      showModal('Éxito', result.message);
      fetchData();
    } else {
      showModal('Error', 'Error al ejecutar reglas');
    }
  } catch (error) {
    console.error('Error executing rules:', error);
    showModal('Error', 'Error al ejecutar reglas');
  }
}

// Event listeners
document.getElementById('addTxBtn').addEventListener('click', addTransaction);
document.getElementById('newRuleBtn').addEventListener('click', showRuleForm);
document.getElementById('createRuleBtn').addEventListener('click', addAutomaticRule);
document.getElementById('cancelRuleBtn').addEventListener('click', hideRuleForm);
document.getElementById('executeRulesBtn').addEventListener('click', executeRules);

// Load data on page load
fetchData();