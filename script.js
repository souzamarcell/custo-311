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

// Atualizar o mês e ano ao clicar em um botão
let sMesAnoSelecionado = '';
// let sMesAnoSelecionado = getMesAnoAtual(); // Define o mês atual ao iniciar
document.querySelectorAll('.meses button').forEach(button => {
  button.addEventListener('click', function () {
    const mesSelecionado = this.getAttribute('data-mes');
    const anoAtual = new Date().getFullYear();
    sMesAnoSelecionado = `${mesSelecionado}/${anoAtual}`;

    // Remove a classe ativa de todos os botões e destaca o selecionado
    // document.querySelectorAll('.meses button').forEach(btn => btn.classList.remove('active'));
    // this.classList.add('active');
    loadItens(sMesAnoSelecionado); // Carrega apenas os itens do mês selecionado
  });
});

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

// Editar item
function editItem(index) {
  openModal(true, index);
}

// Excluir item
function deleteItem(index) {
  itens.splice(index, 1);
  setItensBD();
  loadItens();
}

// Inserir item na tabela
function insertItem(item, index) {
  let tr = document.createElement('tr');
  const sinal = item.tipo === 'credito' ? '+' : '';
  // ${item.mesAno || ''}
  // <td>${item.tipo === 'credito' ? '💰 Crédito' : '💸 Débito'}</td>

  tr.innerHTML = `
    <td>
    ${item.dia || ''}
    </td>
    <td>${item.nome}</td>
    <td>${item.description || ''}</td>
    <td>${item.funcao}</td>
    <td class="${item.tipo === 'debito' ? 'negativo' : ''}">
    ${sinal}${parseFloat(item.salario).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
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
  totalSalarioElement.textContent = `Saldo: ${total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`;

  totalSalarioElement.style.color = total < 0 ? 'red' : 'blue';
}


// Modificar `loadItens()` para chamar `calcularTotalSalarios()` corretamente
function loadItens(filtro = null) {
  itens = getItensBD();
  tbody.innerHTML = '';

  itens.forEach((item, index) => {
    if (!filtro || (item.mesAno && item.mesAno === filtro)) {
      insertItem(item, index);
    }
  });

  calcularTotalSalarios(filtro); // Agora passa o filtro para calcular apenas os valores do mês selecionado
}

// Carregar itens no DOM
function loadItens(filtro = null) {
  itens = getItensBD();
  tbody.innerHTML = '';

  itens.forEach((item, index) => {
    if (!filtro || item.mesAno === filtro) {
      insertItem(item, index);
    }
  });

  calcularTotalSalarios(filtro); // Agora calcula o saldo APENAS do mês selecionado
}

// Retorna a data atual no formato DD/MM/YYYY
function getDataAtual() {
  let hoje = new Date();
  let dia = hoje.getDate().toString().padStart(2, '0');
  let mes = (hoje.getMonth() + 1).toString().padStart(2, '0'); // Mês começa em 0 (janeiro = 0)
  let ano = hoje.getFullYear();
  return `${dia}/${mes}/${ano}`;
}


document.querySelectorAll('.meses button').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.meses button').forEach(btn => btn.classList.remove('ativo'));
    button.classList.add('ativo');

    const mesSelecionado = button.getAttribute('data-mes');
    const anoAtual = new Date().getFullYear();
    const mesAnoSelecionado = `${mesSelecionado}/${anoAtual}`;

    loadItens(mesAnoSelecionado); // Passa o mês selecionado para carregar os itens corretamente
  });
});


document.addEventListener('DOMContentLoaded', () => {
  const mesAtual = (new Date().getMonth() + 1).toString().padStart(2, '0'); // Obtém o mês atual (01 a 12)
  const anoAtual = new Date().getFullYear(); // Obtém o ano atual

  // Simula um clique no botão do mês atual
  const botaoMesAtual = document.querySelector(`.meses button[data-mes="${mesAtual}"]`);
  if (botaoMesAtual) {
    botaoMesAtual.click();
  }
});


// Salvar item
btnSalvar.onclick = e => {
  if (sDia.value == '' || sDescription.value == '' || sNome.value == '' || sFuncao.value == '' || isNaN(parseFloat(sSalario.value))) {
    alert('Preencha todos os campos corretamente!');
    return;
  }

  e.preventDefault();

  const valor = parseFloat(sSalario.value);
  const tipo = document.querySelector('#m-tipo').value; // Obtém o tipo (crédito ou débito)

  const novoItem = {
    mesAno: sMesAnoSelecionado || getMesAnoAtual(), // Usa o mês selecionado ou o atual
    dia: sDia.value,
    description: sDescription.value,
    nome: sNome.value,
    funcao: sFuncao.value,
    salario: tipo === "debito" ? -Math.abs(valor) : Math.abs(valor), // Garante que débito seja negativo e crédito positivo
    tipo: sTipo.value // Adiciona o tipo (crédito ou débito)
  };

  if (id !== undefined) {
    itens[id] = novoItem;
  } else {
    itens.push(novoItem);
  }

  setItensBD();
  modal.classList.remove('active');
  // loadItens();
  loadItens(sMesAnoSelecionado); // Agora ele mantém o mês selecionado
  id = undefined;
};

document.getElementById('btnCancelar').addEventListener('click', () => {
  document.querySelector('.modal-container').classList.remove('active');
});

// Recuperar do localStorage
function getItensBD() {
  return JSON.parse(localStorage.getItem('dbfunc')) ?? [];
}

// Salvar no localStorage
function setItensBD() {
  localStorage.setItem('dbfunc', JSON.stringify(itens));
}

// Inicializar a lista ao carregar a página
loadItens();
