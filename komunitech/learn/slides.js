/* ============================================================
   Komunitech — Shared Slide Deck Engine
   Reads per-course config from window.DECK (embedded in each HTML).

   DECK shape:
   {
     totalSlides: <int>,
     resultSlideIndex: <int>,          // 0-based index of quiz-result slide
     quizTotal: <int>,
     explanations: [ { correct, wrong } x quizTotal ],
     nextCourse: { url, label },
     reviewSlideIndex: <int>,          // where "review" button jumps on fail
     checklists: [ { id, count, unit, counterId, doneId } ]
   }
============================================================ */

let current = 0;
let quizScore = 0;
let quizAnswered = [];
let quizResults = [];

const D = window.DECK || { totalSlides: 1, quizTotal: 0, explanations: [] };

function selectAnswer(opt, qNum) {
  if (quizAnswered[qNum - 1]) return;
  quizAnswered[qNum - 1] = true;

  const isCorrect = opt.hasAttribute('data-correct');
  quizResults[qNum - 1] = isCorrect;
  if (isCorrect) quizScore++;

  const container = document.getElementById('q' + qNum + '-options');
  if (container) {
    container.querySelectorAll('.quiz-option').forEach(o => {
      o.classList.add('locked');
      if (o.hasAttribute('data-correct')) o.classList.add('correct');
      if (o === opt && !isCorrect) o.classList.add('wrong');
    });
  }

  const fb = document.getElementById('fb-' + qNum);
  const fbText = document.getElementById('fb-text-' + qNum);
  const exp = (D.explanations && D.explanations[qNum - 1]) || { correct: 'Benar!', wrong: 'Belum tepat.' };
  if (fb && fbText) {
    if (isCorrect) {
      fb.className = 'quiz-feedback correct-fb show';
      fbText.innerHTML = '✅ ' + exp.correct;
    } else {
      fb.className = 'quiz-feedback wrong-fb show';
      fbText.innerHTML = '❌ ' + exp.wrong;
    }
  }
}

function buildResult() {
  const total = D.quizTotal || 0;
  const scoreEl = document.getElementById('result-score');
  const emoji = document.getElementById('result-emoji');
  const title = document.getElementById('result-title');
  const msg = document.getElementById('result-msg');
  const dots = document.getElementById('result-dots');
  const cta = document.getElementById('result-cta');
  if (scoreEl) scoreEl.textContent = quizScore + '/' + total;

  if (dots) {
    dots.innerHTML = '';
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('div');
      dot.className = 'result-dot ' + (quizResults[i] ? 'correct-dot' : 'wrong-dot');
      dot.textContent = quizResults[i] ? '✓' : '✗';
      dots.appendChild(dot);
    }
  }

  const pass = quizScore >= Math.ceil(total * 0.6);
  const next = D.nextCourse || { url: '/komunitech/', label: 'Katalog Kursus' };

  if (emoji) emoji.textContent = pass ? '🏆' : '📖';
  if (title) title.textContent = pass ? 'Lulus! Pemahaman Mantap.' : 'Hampir! Perlu Review Dikit.';
  if (msg) msg.innerHTML = pass
    ? 'Pemahaman kamu udah solid. Saatnya naik level ke <strong>' + next.label + '</strong>.'
    : 'Tenang, ini baru awal. Review lagi modul yang masih salah — kamu pasti bisa!';
  if (cta) cta.innerHTML = pass
    ? '<a href="' + next.url + '" style="display:inline-block;background:var(--primary);color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-family:var(--font-display);font-weight:700;font-size:16px;">🔥 Lanjut ke ' + next.label + ' →</a>'
    : '<button onclick="current=' + (D.reviewSlideIndex || 0) + ';updateUI();" style="display:inline-block;background:var(--white);color:var(--heading);padding:14px 32px;border:2px solid var(--border);border-radius:8px;cursor:pointer;font-family:var(--font-display);font-weight:700;font-size:16px;">📖 Review Modul Lagi</button>';
}

function updateChecklist(id) {
  const container = document.getElementById(id);
  if (!container) return;
  const checked = container.querySelectorAll('.icl-item.checked').length;
  const cfg = (D.checklists || []).find(c => c.id === id);
  if (!cfg) return;
  const counter = document.getElementById(cfg.counterId);
  const done = document.getElementById(cfg.doneId);
  if (counter) counter.innerHTML = '✅ <strong>' + checked + '</strong> / ' + cfg.count + ' ' + cfg.unit;
  if (done) done.style.display = (checked === cfg.count) ? 'block' : 'none';
}

function updateUI() {
  document.querySelectorAll('.slide').forEach((s, i) => {
    s.classList.toggle('active', i === current);
  });
  if (current === D.resultSlideIndex) buildResult();
  const counter = document.getElementById('slide-counter');
  const fill = document.getElementById('progressFill');
  if (counter) counter.textContent = (current + 1) + ' / ' + D.totalSlides;
  if (fill) fill.style.width = (((current + 1) / D.totalSlides) * 100) + '%';
  const prev = document.getElementById('btnPrev');
  const next = document.getElementById('btnNext');
  if (prev) prev.disabled = current === 0;
  if (next) next.disabled = current === D.totalSlides - 1;
}

function goSlide(delta) {
  current = Math.max(0, Math.min(D.totalSlides - 1, current + delta));
  updateUI();
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
    e.preventDefault(); goSlide(1);
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    e.preventDefault(); goSlide(-1);
  } else if (e.key === 'Home') {
    e.preventDefault(); current = 0; updateUI();
  } else if (e.key === 'End') {
    e.preventDefault(); current = D.totalSlides - 1; updateUI();
  }
});

let touchStartX = 0;
const deck = document.getElementById('slideDeck');
if (deck) {
  deck.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; });
  deck.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goSlide(diff > 0 ? 1 : -1);
  });
}

// Init
quizAnswered = new Array(D.quizTotal || 0).fill(false);
quizResults = new Array(D.quizTotal || 0).fill(false);
updateUI();
