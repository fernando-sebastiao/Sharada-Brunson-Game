/* ══════════════════════════════════════
   jogo.js — Motor do Jogo
   Enigmas, Charadas e Fase Educacional
══════════════════════════════════════ */

const BANCO_PERGUNTAS = {
  charadas: [
    {
      texto: "O que é, o que é: quanto mais se tira, maior fica?",
      opcoes: ["Poço", "Buraco", "Coração", "Bolso"],
      correta: 1,
      dica: "Pense num espaço vazio que cresce.",
      pontos: 30
    },
    {
      texto: "Tenho cidades, mas não há casas. Tenho montanhas, mas não há árvores. Tenho água, mas não há peixes. O que sou?",
      opcoes: ["Sonho", "Mapa", "Pintura", "Espelho"],
      correta: 1,
      dica: "Sou uma representação do mundo real.",
      pontos: 40
    },
    {
      texto: "Ando mas não tenho pernas. Corro mas não tenho pés. O que sou?",
      opcoes: ["Vento", "Rio", "Relógio", "Tempo"],
      correta: 3,
      dica: "Todos temos mas ninguém pode comprar mais.",
      pontos: 35
    },
    {
      texto: "Falo sem boca, ouço sem ouvidos, não tenho corpo mas tomo vida com o vento. O que sou?",
      opcoes: ["Sombra", "Eco", "Fumo", "Nuvem"],
      correta: 1,
      dica: "Nas montanhas vazio-me repete.",
      pontos: 45
    },
    {
      texto: "Quanto mais me enches, mais leve fico. O que sou?",
      opcoes: ["Balão", "Esponja", "Balde", "Saco"],
      correta: 0,
      dica: "O ar é o meu conteúdo favorito.",
      pontos: 25
    }
  ],
  educacional: [
    {
      tema: "Física",
      texto: "Qual é a unidade de medida da força no Sistema Internacional?",
      opcoes: ["Pascal", "Joule", "Newton", "Watt"],
      correta: 2,
      dica: "Nomeada em honra do famoso físico inglês.",
      pontos: 40
    },
    {
      tema: "Matemática",
      texto: "Qual é o valor de π (pi) arredondado a 2 casas decimais?",
      opcoes: ["3.12", "3.14", "3.16", "3.18"],
      correta: 1,
      dica: "Rácio entre o perímetro e o diâmetro de um círculo.",
      pontos: 30
    },
    {
      tema: "Redes",
      texto: "Qual camada do modelo OSI é responsável pelo endereçamento IP?",
      opcoes: ["Física", "Enlace", "Rede", "Transporte"],
      correta: 2,
      dica: "É a camada 3 do modelo OSI.",
      pontos: 50
    },
    {
      tema: "Programação",
      texto: "Qual estrutura de dados segue o princípio LIFO (Last In, First Out)?",
      opcoes: ["Fila", "Pilha", "Árvore", "Grafo"],
      correta: 1,
      dica: "Pense numa pilha de pratos.",
      pontos: 45
    },
    {
      tema: "Sistemas Distribuídos",
      texto: "O teorema CAP afirma que um sistema distribuído não pode garantir simultaneamente:",
      opcoes: [
        "Velocidade, Segurança e Escalabilidade",
        "Consistência, Disponibilidade e Tolerância a Partições",
        "CPU, Memória e Disco",
        "Latência, Throughput e Fiabilidade"
      ],
      correta: 1,
      dica: "Foi formulado por Eric Brewer em 2000.",
      pontos: 60
    }
  ],
  enigmas: [
    {
      texto: "Sou filho dos teus pais, mas não és meu irmão nem minha irmã. Quem sou eu?",
      opcoes: ["Primo", "Tu mesmo", "Padrasto", "Tio"],
      correta: 1,
      dica: "Olha para o espelho.",
      pontos: 50
    },
    {
      texto: "Tenho 13 corações mas não tenho outros órgãos. O que sou?",
      opcoes: ["Hospital", "Baralho de cartas", "Cemitério", "Floresta"],
      correta: 1,
      dica: "Uso-te para jogar.",
      pontos: 55
    },
    {
      texto: "Quanto mais me seques, mais molhado fico. O que sou?",
      opcoes: ["Esponja", "Toalha", "Pano", "Lençol"],
      correta: 1,
      dica: "Usas-me depois do banho.",
      pontos: 40
    }
  ]
};

/* ─── Estado do Jogo ─── */
const GameState = {
  modo: 'charadas',
  perguntas: [],
  indice: 0,
  pontos: 0,
  respostas: [],
  temporizador: null,
  tempoRestante: 30,

  init(modo) {
    this.modo = modo || new URLSearchParams(window.location.search).get('modo') || 'charadas';
    this.perguntas = [...(BANCO_PERGUNTAS[this.modo] || BANCO_PERGUNTAS.charadas)];
    this.indice = 0;
    this.pontos = 0;
    this.respostas = [];
  },

  perguntaActual() {
    return this.perguntas[this.indice];
  },

  total() {
    return this.perguntas.length;
  },

  isUltima() {
    return this.indice >= this.perguntas.length - 1;
  }
};

/* ─── Motor de renderização ─── */
const GameUI = (() => {

  function render() {
    const p = GameState.perguntaActual();
    if (!p) return;

    // Progresso
    const pct = ((GameState.indice) / GameState.total()) * 100;
    document.querySelector('.progress-bar-fill').style.width = pct + '%';
    document.querySelector('.question-count').textContent =
      `Questão ${GameState.indice + 1} de ${GameState.total()}`;
    document.querySelector('.game-pts').textContent = `⭐ ${GameState.pontos} pts`;

    // Tema (educacional)
    const themeTag = document.querySelector('.game-mode-tag');
    if (themeTag) themeTag.textContent = p.tema ? `📚 ${p.tema}` : '🃏 Charada';

    // Texto do enigma
    document.querySelector('.riddle-text').textContent = p.texto;

    // Oculta dica
    const hint = document.querySelector('.hint-area');
    if (hint) { hint.style.display = 'none'; hint.textContent = ''; }

    // Feedback
    const fb = document.querySelector('.feedback-msg');
    if (fb) { fb.style.display = 'none'; fb.className = 'feedback-msg'; }

    // Opções
    const list = document.querySelector('.options-list');
    list.innerHTML = '';
    p.opcoes.forEach((op, i) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.innerHTML = `<span class="option-letter">${String.fromCharCode(65+i)}</span>${op}`;
      btn.addEventListener('click', () => selectOption(btn, i));
      list.appendChild(btn);
    });

    // Botão próximo
    document.querySelector('.btn-next').style.display = 'none';

    // Temporizador
    startTimer();
  }

  function selectOption(btn, idx) {
    // Bloqueia mais cliques
    document.querySelectorAll('.option-btn').forEach(b => b.disabled = true);
    stopTimer();

    const p = GameState.perguntaActual();
    const correct = idx === p.correta;

    // Marca visual
    document.querySelectorAll('.option-btn').forEach((b, i) => {
      if (i === p.correta) b.classList.add('correct');
      else if (i === idx && !correct) b.classList.add('wrong');
    });

    // Feedback
    const fb = document.querySelector('.feedback-msg');
    if (correct) {
      GameState.pontos += p.pontos;
      fb.className = 'feedback-msg correct-msg';
      fb.textContent = `✅ Correcto! +${p.pontos} pontos`;
    } else {
      fb.className = 'feedback-msg wrong-msg';
      fb.textContent = `❌ Errado. A resposta era: ${p.opcoes[p.correta]}`;
    }
    fb.style.display = 'block';

    GameState.respostas.push({ correcto: correct, pontos: correct ? p.pontos : 0 });
    document.querySelector('.game-pts').textContent = `⭐ ${GameState.pontos} pts`;

    // Botão próximo
    const btnNext = document.querySelector('.btn-next');
    btnNext.style.display = 'inline-flex';
    btnNext.textContent = GameState.isUltima() ? 'Ver Resultado 🏆' : 'Próximo →';
  }

  function startTimer() {
    GameState.tempoRestante = 30;
    const el = document.querySelector('.q-timer');
    stopTimer();
    updateTimerUI(el);
    GameState.temporizador = setInterval(() => {
      GameState.tempoRestante--;
      updateTimerUI(el);
      if (GameState.tempoRestante <= 0) {
        stopTimer();
        autoTimeOut();
      }
    }, 1000);
  }

  function updateTimerUI(el) {
    if (!el) return;
    el.textContent = `⏱ ${GameState.tempoRestante}s`;
    el.style.color = GameState.tempoRestante <= 10 ? 'var(--danger)' : 'var(--muted)';
  }

  function stopTimer() {
    if (GameState.temporizador) {
      clearInterval(GameState.temporizador);
      GameState.temporizador = null;
    }
  }

  function autoTimeOut() {
    document.querySelectorAll('.option-btn').forEach(b => b.disabled = true);
    const fb = document.querySelector('.feedback-msg');
    fb.className = 'feedback-msg wrong-msg';
    fb.textContent = '⏰ Tempo esgotado!';
    fb.style.display = 'block';
    GameState.respostas.push({ correcto: false, pontos: 0 });
    const btnNext = document.querySelector('.btn-next');
    btnNext.style.display = 'inline-flex';
    btnNext.textContent = GameState.isUltima() ? 'Ver Resultado 🏆' : 'Próximo →';
  }

  function nextQuestion() {
    if (GameState.isUltima()) {
      // Guarda resultado e vai para resultado
      sessionStorage.setItem('resultado', JSON.stringify({
        pontos: GameState.pontos,
        total: GameState.total(),
        corretos: GameState.respostas.filter(r => r.correcto).length,
        modo: GameState.modo
      }));
      window.location.href = 'resultado.html';
    } else {
      GameState.indice++;
      render();
    }
  }

  function showHint() {
    const p = GameState.perguntaActual();
    const hint = document.querySelector('.hint-area');
    if (hint && p.dica) {
      hint.textContent = '💡 ' + p.dica;
      hint.style.display = 'block';
      GameState.pontos = Math.max(0, GameState.pontos - 5);
      document.querySelector('.game-pts').textContent = `⭐ ${GameState.pontos} pts`;
    }
  }

  return { render, nextQuestion, showHint };
})();

/* ─── Inicialização na página de jogo ─── */
document.addEventListener('DOMContentLoaded', () => {
  if (!document.querySelector('.game-wrap')) return;

  const modo = new URLSearchParams(window.location.search).get('modo') || 'charadas';
  GameState.init(modo);
  GameUI.render();

  document.querySelector('.btn-next')?.addEventListener('click', GameUI.nextQuestion);
  document.querySelector('.btn-hint')?.addEventListener('click', GameUI.showHint);
});

/* ─── Página de Resultado ─── */
document.addEventListener('DOMContentLoaded', () => {
  if (!document.querySelector('.result-wrap')) return;
  const data = JSON.parse(sessionStorage.getItem('resultado') || 'null');
  if (!data) return;

  const pct = Math.round((data.corretos / data.total) * 100);
  document.querySelector('.result-score').textContent = `${data.pontos} pts`;

  let medal = '🥉', msg = 'Continue a treinar!';
  if (pct >= 80) { medal = '🥇'; msg = 'Excelente! És um mestre!'; }
  else if (pct >= 60) { medal = '🥈'; msg = 'Muito bom! Quase lá!'; }

  document.querySelector('.result-msg').textContent =
    `${medal} ${msg} (${data.corretos}/${data.total} correcto${data.corretos !== 1 ? 's' : ''})`;
});
