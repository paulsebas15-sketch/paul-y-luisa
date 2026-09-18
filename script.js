/* ============ SOBRE: se desdobla y revela la carta ============ */
function initEnvelope(){
  const seal = document.getElementById('wax-seal');
  const wrap = document.getElementById('letter-card');
  const shell = document.getElementById('envelope-shell');
  const overlay = document.getElementById('envelope-overlay');
  const content = document.getElementById('letter-content');

  function closedHeight(){
    return shell.clientWidth * 0.65;
  }

  function measure(){
    const h = closedHeight();
    overlay.style.height = h + 'px';
    content.style.paddingTop = h + 'px';
    if(!wrap.classList.contains('opened')){
      shell.style.maxHeight = h + 'px';
    }
  }
  measure();
  window.addEventListener('resize', measure);

  seal.addEventListener('click', () => {
    wrap.classList.add('opened');
    // deja que el flap empiece a abrirse antes de desdoblar el cuerpo
    setTimeout(() => {
      shell.style.maxHeight = content.scrollHeight + 'px';
    }, 20);
  });

  shell.addEventListener('transitionend', (e) => {
    if(e.propertyName === 'max-height' && wrap.classList.contains('opened')){
      shell.style.maxHeight = 'none';
    }
  });
}
initEnvelope();

/* ============ CONTADOR: nuevo comienzo (fecha fija) ============ */
const startDate = new Date('2026-08-23T18:20:00-05:00'); // hora de Colombia (Bogotá/Cali, UTC-5)

function formatDiff(diffMs){
  if(diffMs < 0) diffMs = 0;
  const seconds = Math.floor(diffMs / 1000) % 60;
  const minutes = Math.floor(diffMs / (1000*60)) % 60;
  const hours = Math.floor(diffMs / (1000*60*60)) % 24;
  const days = Math.floor(diffMs / (1000*60*60*24));
  return { days, hours, minutes, seconds };
}

function updateMainCounter(){
  const diff = formatDiff(new Date() - startDate);
  document.getElementById('days').textContent = String(diff.days).padStart(2,'0');
  document.getElementById('hours').textContent = String(diff.hours).padStart(2,'0');
  document.getElementById('minutes').textContent = String(diff.minutes).padStart(2,'0');
  document.getElementById('seconds').textContent = String(diff.seconds).padStart(2,'0');
}
updateMainCounter();
setInterval(updateMainCounter, 1000);

/* ============ CONTADOR: propuesta (se activa al decir que sí) ============ */
const PROPOSAL_KEY = 'paulYLuisa_propuestaFecha_v2';

function renderProposalCounter(dateIso){
  const proposalDate = new Date(dateIso);
  const block = document.getElementById('proposal-counter-block');
  block.innerHTML = `
    <div class="counter-block-title">Desde que dijiste que sí</div>
    <div class="counter">
      <div class="counter-unit"><div class="counter-number" id="p-days">00</div><div class="counter-label">Días</div></div>
      <div class="counter-unit"><div class="counter-number" id="p-hours">00</div><div class="counter-label">Horas</div></div>
      <div class="counter-unit"><div class="counter-number" id="p-minutes">00</div><div class="counter-label">Minutos</div></div>
      <div class="counter-unit"><div class="counter-number" id="p-seconds">00</div><div class="counter-label">Segundos</div></div>
    </div>
    <div class="counter-since">Desde el ${proposalDate.toLocaleString('es-ES', { day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' })}</div>
  `;
  function tick(){
    const diff = formatDiff(new Date() - proposalDate);
    document.getElementById('p-days').textContent = String(diff.days).padStart(2,'0');
    document.getElementById('p-hours').textContent = String(diff.hours).padStart(2,'0');
    document.getElementById('p-minutes').textContent = String(diff.minutes).padStart(2,'0');
    document.getElementById('p-seconds').textContent = String(diff.seconds).padStart(2,'0');
  }
  tick();
  setInterval(tick, 1000);
}

function initProposal(){
  const saved = localStorage.getItem(PROPOSAL_KEY);
  const btn = document.getElementById('proposal-btn');
  const answer = document.getElementById('proposal-answer');
  const question = document.getElementById('proposal-question');

  if(saved){
    question.style.display = 'none';
    btn.style.display = 'none';
    answer.textContent = 'Dijiste que sí ✦';
    answer.classList.add('visible');
    renderProposalCounter(saved);
    return;
  }

  document.getElementById('proposal-counter-block').innerHTML = `
    <div class="counter-block-title">Desde que dijiste que sí</div>
    <div class="counter-pending">Este contador empezará a correr en el momento en que ella diga que sí ✦</div>
  `;

  btn.addEventListener('click', () => {
    const now = new Date().toISOString();
    localStorage.setItem(PROPOSAL_KEY, now);
    question.style.display = 'none';
    btn.style.display = 'none';
    answer.textContent = 'Dijiste que sí ✦';
    answer.classList.add('visible');
    renderProposalCounter(now);
  });
}
initProposal();

/* ============ MUSICA: reproductor tipo Spotify ============ */
/* Para agregar canciones reales: reemplaza los archivos en /music/
   y actualiza title, artist, note y src de cada pista. */
const playlist = [
  { title: 'honeybee', artist: 'Olivia Rodrigo', note: 'Para ti', src: 'music/cancion6.mp3' },
  { title: 'Es Verdad', artist: 'Daniel, Me Estás Matando', note: 'Para ti', src: 'music/cancion3.mp3' },
  { title: 'M.A.I', artist: 'Milo j', note: 'Para ti', src: 'music/cancion8.mp3' },
  { title: 'Algo Que Se Quede', artist: 'Grupo Niche', note: 'Para ti', src: 'music/cancion4.mp3' },
  { title: 'Corazón Adentro', artist: 'Bomba Estéreo, Rawayana, ASTROPICAL', note: 'Para ti', src: 'music/cancion1.mp3' },
  { title: 'Me Faltabas Tú', artist: 'Cultura Profética', note: 'Para ti', src: 'music/cancion2.mp3' },
  { title: 'Mi Bendición', artist: 'Juan Luis Guerra', note: 'Para ti', src: 'music/cancion5.mp3' },
  { title: 'Carmesí', artist: 'Vicente García', note: 'Para ti', src: 'music/cancion7.mp3' },
];

function initPlayer(){
  const audio = new Audio();
  let currentIndex = 0;

  const titleEl = document.getElementById('player-title');
  const artistEl = document.getElementById('player-artist');
  const noteEl = document.getElementById('player-note');
  const indexEl = document.getElementById('player-index');
  const playBtn = document.getElementById('play-btn');
  const playIcon = document.getElementById('play-icon');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const progress = document.getElementById('player-progress');
  const progressFill = document.getElementById('player-progress-fill');
  const timeCurrent = document.getElementById('player-time-current');
  const timeTotal = document.getElementById('player-time-total');

  const ICON_PLAY = '<path d="M8 5v14l11-7z"/>';
  const ICON_PAUSE = '<path d="M6 5h4v14H6zM14 5h4v14h-4z"/>';

  function formatTime(sec){
    if(!isFinite(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2,'0')}`;
  }

  function loadTrack(i, autoplay){
    currentIndex = (i + playlist.length) % playlist.length;
    const track = playlist[currentIndex];
    titleEl.textContent = track.title;
    artistEl.textContent = track.artist;
    noteEl.textContent = track.note;
    indexEl.textContent = `${currentIndex + 1} / ${playlist.length}`;
    audio.src = track.src;
    progressFill.style.width = '0%';
    timeCurrent.textContent = '0:00';
    timeTotal.textContent = '0:00';
    if(autoplay){
      audio.play().catch(() => {});
    }
  }

  function setPlayingUI(isPlaying){
    playIcon.innerHTML = isPlaying ? ICON_PAUSE : ICON_PLAY;
  }

  playBtn.addEventListener('click', () => {
    if(audio.paused){
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  });

  prevBtn.addEventListener('click', () => {
    loadTrack(currentIndex - 1, !audio.paused);
  });

  nextBtn.addEventListener('click', () => {
    loadTrack(currentIndex + 1, !audio.paused);
  });

  progress.addEventListener('click', (e) => {
    if(!audio.duration) return;
    const rect = progress.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audio.currentTime = ratio * audio.duration;
  });

  audio.addEventListener('play', () => setPlayingUI(true));
  audio.addEventListener('pause', () => setPlayingUI(false));
  audio.addEventListener('timeupdate', () => {
    if(audio.duration){
      progressFill.style.width = (audio.currentTime / audio.duration * 100) + '%';
      timeCurrent.textContent = formatTime(audio.currentTime);
    }
  });
  audio.addEventListener('loadedmetadata', () => {
    timeTotal.textContent = formatTime(audio.duration);
  });
  audio.addEventListener('ended', () => {
    loadTrack(currentIndex + 1, true);
  });

  loadTrack(0, false);
  return audio;
}
const playerAudio = initPlayer();

/* Arranca la música apenas hay la primera interacción en la página
   (los navegadores bloquean el autoplay con sonido hasta ese momento) */
function startMusicOnFirstInteraction(){
  let started = false;
  function tryStart(){
    if(started) return;
    started = true;
    if(playerAudio.paused){
      playerAudio.play().catch(() => { started = false; });
    }
    document.removeEventListener('click', tryStart);
    document.removeEventListener('touchstart', tryStart);
  }
  document.addEventListener('click', tryStart);
  document.addEventListener('touchstart', tryStart);
}
startMusicOnFirstInteraction();

/* ============ Fade-in al hacer scroll ============ */
const observer = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
