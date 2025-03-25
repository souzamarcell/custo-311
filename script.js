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

// contador de visitante
let visitas = localStorage.getItem("contador") || 0;
visitas++;
localStorage.setItem("contador", visitas); // Atualiza o contador no localStorage
document.getElementById("contador").textContent = visitas; // Exibe o contador na página


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
  // LoginSystem()

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
  if (sDia.value == '' || sDescription.value == '' || sNome.value == '' || isNaN(parseFloat(sSalario.value))) {
    alert('Preencha todos os campos corretamente!');
    return;
  }
  e.preventDefault();
  const valor = parseFloat(sSalario.value.replace(',', '.')) || 0; // Converte
  const tipo = document.querySelector('#m-tipo').value; // Obtém o tipo (crédito ou débito)
  // const totalFuncoes = parseInt(sFuncao.value);
  const totalFuncoes = sFuncao.value.trim() === '' ? 1 : parseInt(sFuncao.value); // Define 1 como padrão se estiver vazio

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
    sSalario.value = itens[index].salario.toString().replace('.', ',');
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

function calcularSaldoMesPassado(mesAnoAtual) {
  let itens = getItensBD(); // Recupera os lançamentos do banco de dados local

  // Obtém o ano e mês do filtro
  let [mesAtual, anoAtual] = mesAnoAtual.split('/').map(Number);

  // Define o mês anterior
  let mesAnterior = mesAtual - 1;
  let anoAnterior = anoAtual;

  if (mesAnterior === 0) {
    mesAnterior = 12;
    anoAnterior -= 1;
  }

  let mesAnoAnterior = `${mesAnterior.toString().padStart(2, '0')}/${anoAnterior}`;

  // Filtra os lançamentos do mês anterior
  let lancamentosMesPassado = itens.filter(item => item.mesAno === mesAnoAnterior);

  // Calcula o saldo do mês passado
  let saldo = lancamentosMesPassado.reduce((total, item) => {
    let valor = parseFloat(item.salario) || 0;
    // return item.tipo === 'debito' ? total - valor : total + valor;
    return total + valor;
  }, 0);
  return saldo;
}

function calcularSaldoMesesPassados(mesAnoAtual) {
  let itens = getItensBD(); // Recupera os lançamentos do banco de dados local

  // Obtém o ano e mês do filtro
  let [mesAtual, anoAtual] = mesAnoAtual.split('/').map(Number);

  let saldoAcumulado = 0;

  // Loop de janeiro até o mês anterior ao selecionado
  for (let mes = 1; mes < mesAtual; mes++) {
    let mesAno = `${mes.toString().padStart(2, '0')}/${anoAtual}`;

    // Filtra os lançamentos do mês
    let lancamentosDoMes = itens.filter(item => item.mesAno === mesAno);

    // Soma os valores do mês ao saldo acumulado
    let saldoMes = lancamentosDoMes.reduce((total, item) => {
      let valor = parseFloat(item.salario) || 0;
      return total + valor;
    }, 0);

    saldoAcumulado += saldoMes;
  }

  return saldoAcumulado;
}


// Carregar itens no DOM
function loadItens(filtro = null) {
  itens = getItensBD();
  itens.sort((a, b) => parseInt(a.dia) - parseInt(b.dia));
  tbody.innerHTML = '';

  // Calcula o saldo do mês passado
  // let saldoMesPassado = filtro ? calcularSaldoMesPassado(filtro) : 0;
  let saldoMesPassado = filtro ? calcularSaldoMesesPassados(filtro) : 0;

  // Cria um lançamento fictício representando o saldo do mês passado
  let lancamentoSaldoPassado = {
    dia: "1", // Deixe em branco para indicar que não tem dia específico
    nome: "Mês passado",
    description: "",
    funcao: "",
    tipo: saldoMesPassado < 0 ? "debito" : "credito",
    salario: saldoMesPassado
  };

  // Adiciona o saldo do mês passado + lançamento do mes atual + os meses passados
  insertItem(lancamentoSaldoPassado, -1); // Usa -1 pois não faz parte do índice real

  let saldoAcumulado = saldoMesPassado; // Começa com o saldo do mês passado

  // Carrega os lançamentos normais do mês atual
  itens.forEach((item, index) => {
    if (!filtro || item.mesAno === filtro) {
      saldoAcumulado = insertItem(item, index, saldoAcumulado);
    }
  });

  calcularTotalSalarios(filtro);
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

// Calcular total dos salários
function calcularTotalSalarios(mesAnoFiltro = null) {
  let saldoMesPassado = mesAnoFiltro ? calcularSaldoMesPassado(mesAnoFiltro) : 0;
  let saldoMesesPassados = mesAnoFiltro ? calcularSaldoMesesPassados(mesAnoFiltro) : 0;

  let total = itens
    .filter(item => item.mesAno === mesAnoFiltro) // Filtra apenas os itens do mês selecionado
    .reduce((acc, item) => acc + (parseFloat(item.salario) || 0), 0); // Soma apenas os valores do mês atual

  // Soma o saldo acumulado dos meses anteriores
  // total += saldoMesPassado + saldoMesesPassados;
  total += saldoMesesPassados;

  const totalSalarioElement = document.querySelector('#total-salario');
  totalSalarioElement.innerHTML = `Mensal<br> ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  totalSalarioElement.style.color = total < 0 ? 'red' : 'blue';
}


// <td> Inserir item na tabela
function insertItem(item, index) {
  let tr = document.createElement('tr');

  tr.innerHTML = `
    <td>
    ${item.dia || ''}
    </td>
    <td>${item.nome === "Mês passado" ? `<span style="color: blue; font-weight: bold;">${item.nome}</span>` : item.nome}</td>
    <td>${item.description || ''}</td>
    <td>${item.funcao}</td>

    <td class="${item.tipo === 'debito' ? 'negativo' : ''}" style="color: ${parseFloat(item.salario) < 0 ? 'red' : 'blue'};">
      ${parseFloat(item.salario).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
    </td>  

       ${item.nome === "Mês passado" ? "" : `
    <td class="acao">
      <span class="btn-group">
        <button onclick="editItem(${index})" title="Editar"><i class='bx bx-edit'></i></button>
        <button onclick="deleteItem(${index})" title="Deletar"><i class='bx bx-trash'></i></button>
      </span>
    </td>`}
  `;

  // Recupera os índices das linhas selecionadas do localStorage
  let linhasSelecionadas = JSON.parse(localStorage.getItem('linhasSelecionadas')) || [];

  // Se a linha estiver no localStorage, adiciona a classe 'selecionado'
  if (linhasSelecionadas.includes(index)) {
    tr.classList.add('selecionado');
  }

  // Evento de clique para alternar a seleção e armazenar no localStorage
  tr.addEventListener('click', function () {
    this.classList.toggle('selecionado');

    let linhasSelecionadas = JSON.parse(localStorage.getItem('linhasSelecionadas')) || [];

    if (this.classList.contains('selecionado')) {
      linhasSelecionadas.push(index); // Adiciona ao armazenamento
    } else {
      linhasSelecionadas = linhasSelecionadas.filter(i => i !== index); // Remove do armazenamento
    }

    localStorage.setItem('linhasSelecionadas', JSON.stringify(linhasSelecionadas));
  });
  tbody.appendChild(tr);
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

function LoginSystem() {
  const loginContainer = document.getElementById("login-container");
  const loginBtn = document.getElementById("login-btn");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const loginError = document.getElementById("login-error");

  // Simulação de usuário cadastrado
  const users = [
    { username: "admin", password: "1" },
    { username: "marcell", password: "3" }
  ];

  // Verifica se o usuário já está logado
  if (localStorage.getItem("loggedIn") === "true") {
    loginContainer.style.display = "none";
  } else {
    loginContainer.style.display = "block";
  }


  loginBtn.addEventListener("click", function () {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    // Verifica se o usuário existe
    const userExists = users.find(user => user.username === username && user.password === password);

    if (userExists) {
      localStorage.setItem("loggedIn", "true");
      loginContainer.style.display = "none";
    } else {
      loginError.style.display = "block";
    }
  });
}

function mostrarSaldosMensais() {
  let saldos = calcularSaldosMensais();
  let listaSaldos = document.getElementById('lista-saldos');
  let totalSaldoGeral = 0;

  listaSaldos.innerHTML = ''; // Limpa a lista antes de exibir os novos dados

  let index = 0; // Começa do índice 0
  Object.keys(saldos).sort().forEach(mesAno => {
    let saldo = saldos[mesAno];
    totalSaldoGeral += saldo;

    let cor = saldo < 0 ? 'red' : 'blue'; // Define a cor baseada no valor
    let tr = document.createElement('tr');

    // Adiciona uma classe para alternar as cores
    tr.classList.add(index % 2 === 0 ? 'linha-par' : 'linha-impar');

    tr.innerHTML = `
      <td>${mesAno}</td>
      <td style="color: ${cor}; font-weight: bold;">
        ${saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      </td>
    `;
    listaSaldos.appendChild(tr);
    index++; // Incrementa o índice
  });

  let totalSaldoGeralElemento = document.getElementById('total-saldo-geral');
  totalSaldoGeralElemento.textContent = totalSaldoGeral.toLocaleString(
    'pt-BR', { minimumFractionDigits: 2 }
  );
  totalSaldoGeralElemento.style.color = totalSaldoGeral < 0 ? 'red' : 'blue';

  let saldoFormatado = totalSaldoGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  document.getElementById('btnVerSaldos').innerHTML = `Anual<br>${saldoFormatado}`;

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
