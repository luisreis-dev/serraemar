/* Pousada Serra e Mar */

// Número do WhatsApp da pousada: 55 + DDD + número, só dígitos. Troque pelo número real.
const WHATSAPP = '5500000000000';

const movimentoReduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function linkWhatsApp(mensagem) {
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensagem)}`;
}

/* Links de WhatsApp
   ========================================================================== */

document.querySelectorAll('[data-whatsapp]').forEach((link) => {
  link.href = linkWhatsApp('Olá! Gostaria de saber mais sobre a Pousada Serra e Mar.');
  link.target = '_blank';
  link.rel = 'noopener';
});

/* Topo: fundo sólido ao rolar a página
   ========================================================================== */

const topo = document.getElementById('topo');

function atualizarTopo() {
  topo.classList.toggle('rolado', window.scrollY > 40);
}

atualizarTopo();
window.addEventListener('scroll', atualizarTopo, { passive: true });

/* Menu em tela cheia
   ========================================================================== */

const menu = document.getElementById('menu');
const menuBotao = document.querySelector('.menu-botao');

function alternarMenu(abrir) {
  menu.classList.toggle('aberto', abrir);
  topo.classList.toggle('menu-ativo', abrir);
  document.body.classList.toggle('menu-aberto', abrir);
  menuBotao.setAttribute('aria-expanded', String(abrir));
  menuBotao.setAttribute('aria-label', abrir ? 'Fechar menu' : 'Abrir menu');
}

menuBotao.addEventListener('click', () => {
  alternarMenu(!menu.classList.contains('aberto'));
});

menu.addEventListener('click', (evento) => {
  if (evento.target.closest('a')) alternarMenu(false);
});

document.addEventListener('keydown', (evento) => {
  if (evento.key === 'Escape' && menu.classList.contains('aberto')) {
    alternarMenu(false);
    menuBotao.focus();
  }
});

window.matchMedia('(min-width: 1001px)').addEventListener('change', (consulta) => {
  if (consulta.matches) alternarMenu(false);
});

/* Formulário de reserva: abre o WhatsApp com a mensagem pronta
   ========================================================================== */

const form = document.getElementById('form-reserva');
const entrada = document.getElementById('entrada');
const saida = document.getElementById('saida');
const aviso = document.getElementById('reserva-aviso');

function dataIso(data) {
  const local = new Date(data.getTime() - data.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function dataBr(iso) {
  return iso.split('-').reverse().join('/');
}

function diaSeguinte(iso) {
  const [ano, mes, dia] = iso.split('-').map(Number);
  return dataIso(new Date(ano, mes - 1, dia + 1));
}

entrada.min = dataIso(new Date());
saida.min = diaSeguinte(entrada.min);

entrada.addEventListener('change', () => {
  if (!entrada.value) return;
  saida.min = diaSeguinte(entrada.value);
  if (saida.value && saida.value < saida.min) saida.value = '';
});

form.addEventListener('submit', (evento) => {
  evento.preventDefault();

  if (!entrada.value || !saida.value) {
    aviso.textContent = 'Escolha as datas de entrada e saída.';
    (entrada.value ? saida : entrada).focus();
    return;
  }

  if (entrada.value < entrada.min) {
    aviso.textContent = 'A data de entrada não pode estar no passado.';
    entrada.focus();
    return;
  }

  if (saida.value <= entrada.value) {
    aviso.textContent = 'A data de saída precisa ser depois da entrada.';
    saida.focus();
    return;
  }

  aviso.textContent = '';
  const hospedes = form.hospedes.options[form.hospedes.selectedIndex].text;
  const mensagem = `Olá! Gostaria de consultar a disponibilidade na Pousada Serra e Mar.\n`
    + `Entrada: ${dataBr(entrada.value)}\nSaída: ${dataBr(saida.value)}\nPara: ${hospedes}`;
  window.open(linkWhatsApp(mensagem), '_blank', 'noopener');
});

/* Carrossel de acomodações
   ========================================================================== */

document.querySelectorAll('[data-carrossel]').forEach((carrossel) => {
  const faixa = carrossel.querySelector('[data-faixa]');
  const itens = [...faixa.children];
  const anterior = carrossel.querySelector('[data-anterior]');
  const proximo = carrossel.querySelector('[data-proximo]');
  const contador = carrossel.querySelector('[data-contador]');
  let atual = -1;

  function posicaoDe(indice) {
    const item = itens[indice];
    return item.offsetLeft - (faixa.clientWidth - item.offsetWidth) / 2;
  }

  function marcar(indice) {
    if (indice === atual) return;
    atual = indice;
    itens.forEach((item, i) => item.classList.toggle('ativo', i === indice));
    anterior.disabled = indice === 0;
    proximo.disabled = indice === itens.length - 1;
    contador.textContent = `${indice + 1} / ${itens.length}`;
  }

  function irPara(indice, suave = true) {
    faixa.scrollTo({
      left: posicaoDe(indice),
      behavior: suave && !movimentoReduzido ? 'smooth' : 'auto',
    });
  }

  function itemMaisProximo() {
    let melhor = 0;
    let menorDistancia = Infinity;
    itens.forEach((_, i) => {
      const distancia = Math.abs(posicaoDe(i) - faixa.scrollLeft);
      if (distancia < menorDistancia) {
        menorDistancia = distancia;
        melhor = i;
      }
    });
    return melhor;
  }

  let quadro = 0;
  faixa.addEventListener('scroll', () => {
    cancelAnimationFrame(quadro);
    quadro = requestAnimationFrame(() => marcar(itemMaisProximo()));
  }, { passive: true });

  anterior.addEventListener('click', () => irPara(atual - 1));
  proximo.addEventListener('click', () => irPara(atual + 1));
  window.addEventListener('resize', () => irPara(atual, false));

  // Começa no segundo item para mostrar as fotos vizinhas dos dois lados
  marcar(1);
  irPara(1, false);
});

/* Revelar conteúdo ao rolar
   ========================================================================== */

const revelaveis = document.querySelectorAll('.revelar');

if ('IntersectionObserver' in window && !movimentoReduzido) {
  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((item) => {
      if (item.isIntersecting) {
        item.target.classList.add('visivel');
        observador.unobserve(item.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px' });

  revelaveis.forEach((elemento) => observador.observe(elemento));
} else {
  revelaveis.forEach((elemento) => elemento.classList.add('visivel'));
}

/* Ano no rodapé
   ========================================================================== */

document.getElementById('ano').textContent = new Date().getFullYear();
