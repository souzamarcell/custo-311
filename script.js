const modal = document.querySelector('.modal-container')
const tbody = document.querySelector('tbody')
const sNome = document.querySelector('#m-nome')
const sFuncao = document.querySelector('#m-funcao')
const sSalario = document.querySelector('#m-salario')
const sDia = document.querySelector('#m-dia')
const sDescription = document.querySelector('#m-description')
const btnSalvar = document.querySelector('#btnSalvar')
const sMesAno = document.querySelector('#m-mesAno'); // Campo oculto para mês e ano
const sTipo = document.querySelector('#m-tipo'); // Captura o select de tipo

let itens = getItensBD();
let id;
let itemToDelete = null;

// Atualizar o mês e ano ao clicar em um botão
let sMesAnoSelecionado = '';
// let sMesAnoSelecionado = getMesAnoAtual(); // Define o mês atual ao iniciar
document.querySelectorAll('.meses button').forEach(button => {
  button.addEventListener('click', function () {
    const mesSelecionado = this.getAttribute('data-mes');
    const anoAtual = new Date().getFullYear();
    sMesAnoSelecionado = `${mesSelecionado}/${anoAtual}`;
    loadItens(sMesAnoSelecionado); // Carrega apenas os itens do mês selecionado
  });
});

document.getElementById('btnVerSaldos').addEventListener('click', () => {
  mostrarSaldosMensais();
});

document.getElementById('btnCancelar').addEventListener('click', () => {
  document.querySelector('.modal-container').classList.remove('active');
});

document.getElementById('btnFecharSaldos').addEventListener('click', () => {
  document.querySelector('.saldo-modal').classList.remove('active');
});

document.querySelectorAll('.meses button').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.meses button').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    const mesSelecionado = button.getAttribute('data-mes');
    const anoAtual = new Date().getFullYear();
    const mesAnoSelecionado = `${mesSelecionado}/${anoAtual}`;

    loadItens(mesAnoSelecionado); // Passa o mês selecionado para carregar os itens corretamente
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const mesAtual = (new Date().getMonth() + 1).toString().padStart(2, '0'); // Obtém o mês atual (01 a 12)
  const anoAtual = new Date().getFullYear(); // Obtém o ano atual
  atualizarSaldoAnual(); // Atualiza o saldo anual assim que a página carrega

  // Simula um clique no botão do mês atual
  const botaoMesAtual = document.querySelector(`.meses button[data-mes="${mesAtual}"]`);
  if (botaoMesAtual) {
    botaoMesAtual.click();
  }
});

// Apagar todo localStorage
document.getElementById("btnLimpar").onclick = function () {
  if (confirm("Tem certeza que deseja apagar todos os dados? Esta ação não pode ser desfeita!")) {
    localStorage.clear(); // Remove todos os dados do localStorage
    alert("Todos os dados foram apagados!");
    location.reload(); // Recarrega a página para aplicar as alterações
  }
};

// Recuperar do localStorage
function getItensBD() {
  return JSON.parse(localStorage.getItem('dbfunc')) ?? [];
}

// Salvar item
btnSalvar.onclick = e => {
  if (sDia.value == '' || sDescription.value == '' || sNome.value == '' || sFuncao.value == '' || isNaN(parseFloat(sSalario.value))) {
    alert('Preencha todos os campos corretamente!');
    return;
  }
  e.preventDefault();
  const valor = parseFloat(sSalario.value);
  const tipo = document.querySelector('#m-tipo').value; // Obtém o tipo (crédito ou débito)
  const totalFuncoes = parseInt(sFuncao.value);

  // Converte o mês/ano selecionado para um objeto Date
  const [mes, ano] = sMesAnoSelecionado.split('/').map(Number);
  let dataBase = new Date(ano, mes - 1, 1); // Define o primeiro dia do mês selecionado

  if (id !== undefined) {
    // Edição: mantém a função original
    itens[id] = {
      ...itens[id],
      dia: sDia.value,
      description: sDescription.value,
      nome: sNome.value,
      salario: tipo === "debito" ? -Math.abs(valor) : Math.abs(valor),
      tipo: sTipo.value
    };
  } else {
    // Criação de novos itens
    for (let i = 1; i <= totalFuncoes; i++) {
      let novaData = new Date(dataBase);
      novaData.setMonth(novaData.getMonth() + (i - 1)); // Avança os meses a partir do selecionado
      const novoItem = {
        mesAno: `${String(novaData.getMonth() + 1).padStart(2, '0')}/${novaData.getFullYear()}`, // Formato MM/YYYY
        dia: sDia.value,
        description: `${sDescription.value}`, // Mantém a descrição
        nome: sNome.value,
        funcao: `${i}x${totalFuncoes}`, // Formato correto das funções
        salario: tipo === "debito" ? -Math.abs(valor) : Math.abs(valor), // Débito negativo, crédito positivo
        tipo: sTipo.value
      };
      itens.push(novoItem);
    }
  }

  setItensBD();
  modal.classList.remove('active');
  loadItens(sMesAnoSelecionado); // Mantém o mês selecionado
  atualizarSaldoAnual();
  id = undefined;
};


// Salvar no localStorage
function setItensBD() {
  localStorage.setItem('dbfunc', JSON.stringify(itens));
}

// Editar item
function editItem(index) {
  openModal(true, index);
}

// Editar Modal
function openModal(edit = false, index = 0) {
  modal.classList.add('active');

  modal.onclick = e => {
    if (e.target.classList.contains('modal-container')) {
      modal.classList.remove('active');
    }
  };

  if (edit) {
    sMesAno.value = itens[index].mesAno || getMesAnoAtual(); // Se não houver, usa o mês e ano atuais
    sDia.value = itens[index].dia || getDiaAtual(); // Se não houver valor, usa o dia atual
    sDescription.value = itens[index].description || '';
    sNome.value = itens[index].nome;
    sFuncao.value = itens[index].funcao;
    sSalario.value = itens[index].salario;
    sTipo.value = itens[index].tipo || 'debito'; // Garante que o tipo seja carregado corretamente
    id = index;
  } else {
    sMesAno.value = getMesAnoAtual(); // Sempre salva o mês e ano ao criar um novo item
    sDia.value = getDiaAtual(); // Sempre preenche com o dia atual ao adicionar novo item
    sDescription.value = '';
    sNome.value = '';
    sFuncao.value = '';
    sSalario.value = '';
    sTipo.value = 'debito'; // Agora o modal sempre abre com Débito como padrão
    id = undefined;
  }
}

// Carregar itens no DOM
function loadItens(filtro = null) {
  itens = getItensBD();

  itens.sort((a, b) => parseInt(a.dia) - parseInt(b.dia));

  tbody.innerHTML = '';

  itens.forEach((item, index) => {
    if (!filtro || item.mesAno === filtro) {
      insertItem(item, index);
    }
  });
  calcularTotalSalarios(filtro); // Agora calcula o saldo APENAS do mês selecionado
}

function getMesAnoAtual() {
  let hoje = new Date();
  let ano = hoje.getFullYear();
  let mes = (hoje.getMonth() + 1).toString().padStart(2, '0'); // Garante dois dígitos no mês
  return `${mes}/${ano}`;
}

// Retorna o dia atual no formato "02", "23", "31", "01"
function getDiaAtual() {
  let hoje = new Date().getDate();
  return hoje.toString().padStart(2, '0'); // Garante dois dígitos
}

function deleteItem(index) {
  itemToDelete = index;
  document.getElementById("confirmModal").style.display = "flex";
}
function confirmDelete() {
  if (itemToDelete !== null) {
    itens.splice(itemToDelete, 1);
    setItensBD();
    loadItens(sMesAnoSelecionado);
    atualizarSaldoAnual();
  }
  closeModal();
}
function closeModal() {
  document.getElementById("confirmModal").style.display = "none";
}

// <td> Inserir item na tabela
function insertItem(item, index) {
  let tr = document.createElement('tr');

  tr.innerHTML = `
    <td>
    ${item.dia || ''}
    </td>
    <td>${item.nome}</td>
    <td>${item.description || ''}</td>
    <td>${item.funcao}</td>

    <td class="${item.tipo === 'debito' ? 'negativo' : ''}" style="color: ${parseFloat(item.salario) < 0 ? 'red' : 'blue'};">
      ${parseFloat(item.salario).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
    </td>  

    <td class="acao">
      <span class="btn-group">
        <button onclick="editItem(${index})" title="Editar"><i class='bx bx-edit'></i></button>
        <button onclick="deleteItem(${index})" title="Deletar"><i class='bx bx-trash'></i></button>
      </span>
    </td>
  `;
  tbody.appendChild(tr);
}

// Calcular total dos salários
function calcularTotalSalarios(mesAnoFiltro = null) {
  let total = itens
    .filter(item => item.mesAno === mesAnoFiltro) // Filtra apenas os itens do mês selecionado
    .reduce((acc, item) => acc + (parseFloat(item.salario) || 0), 0);

  const totalSalarioElement = document.querySelector('#total-salario');
  totalSalarioElement.innerHTML = `Mensal<br> ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  totalSalarioElement.style.color = total < 0 ? 'red' : 'blue';
}

// Retorna a data atual no formato DD/MM/YYYY
function getDataAtual() {
  let hoje = new Date();
  let dia = hoje.getDate().toString().padStart(2, '0');
  let mes = (hoje.getMonth() + 1).toString().padStart(2, '0'); // Mês começa em 0 (janeiro = 0)
  let ano = hoje.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

function atualizarSaldoAnual() {
  let botaoSaldo = document.getElementById('btnVerSaldos');

  if (!botaoSaldo) {
    console.error("Erro: O botão 'btnVerSaldos' não foi encontrado!");
    return; // Sai da função para evitar erro
  }

  let saldos = calcularSaldosMensais();
  let totalSaldoGeral = Object.values(saldos).reduce((acc, saldo) => acc + saldo, 0);
  let saldoFormatado = totalSaldoGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 });

  // botaoSaldo.textContent = `Anual ${saldoFormatado}`;
  botaoSaldo.innerHTML = `Anual<br> ${saldoFormatado}`;

  botaoSaldo.style.color = totalSaldoGeral < 0 ? 'red' : 'blue';
}

function mostrarSaldosMensais() {
  let saldos = calcularSaldosMensais();
  let listaSaldos = document.getElementById('lista-saldos');
  let totalSaldoGeral = 0;

  listaSaldos.innerHTML = ''; // Limpa a lista antes de exibir os novos dados

  let index = 1;
  Object.keys(saldos).sort().forEach(mesAno => {
    let saldo = saldos[mesAno];
    totalSaldoGeral += saldo;
    // <td>${index++}</td>

    // let sinal = saldo > 0 ? '+' : '';
    let cor = saldo < 0 ? 'red' : 'blue'; // Define a cor baseada no valor

    let tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${mesAno}</td>
      <td style="color: ${cor}; font-weight: bold;">
        ${saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      </td>
    `;
    listaSaldos.appendChild(tr);
  });

  let totalSaldoGeralElemento = document.getElementById('total-saldo-geral');
  totalSaldoGeralElemento.textContent = totalSaldoGeral.toLocaleString(
    'pt-BR', { minimumFractionDigits: 2 }
  );
  // Define a cor do saldo
  totalSaldoGeralElemento.style.color = totalSaldoGeral < 0 ? 'red' : 'blue';

  // Formata o saldo total geral
  let saldoFormatado = totalSaldoGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 });

  // Atualiza o botão com o saldo anual
  // document.getElementById('btnVerSaldos').textContent = `Anual ${saldoFormatado}`;
  document.getElementById('btnVerSaldos').innerHTML = `Anual<br>${saldoFormatado}`;

  document.getElementById('total-saldo-geral').textContent = totalSaldoGeral.toLocaleString(
    'pt-BR', { minimumFractionDigits: 2 }
  );
  document.querySelector('.saldo-modal').classList.add('active');
}

function calcularSaldosMensais() {
  let saldos = {};
  // Lista fixa com todos os meses do ano
  const meses = [
    "01", "02", "03", "04", "05", "06",
    "07", "08", "09", "10", "11", "12"
  ];
  // Preenche com saldo 0 para todos os meses
  const anoAtual = new Date().getFullYear();
  meses.forEach(mes => {
    const mesAno = `${mes}/${anoAtual}`;
    saldos[mesAno] = 0;
  });
  // Soma os valores existentes no banco de dados
  itens.forEach(item => {
    if (!saldos[item.mesAno]) {
      saldos[item.mesAno] = 0;
    }
    saldos[item.mesAno] += parseFloat(item.salario) || 0;
  });
  return saldos;
}

// Inicializar a lista ao carregar a página
loadItens();
