/* =========================================================================
   1. AMBIENT ROMANTIC SOUND SYNTHESIZER
   ========================================================================= */
class RomanticMelodySynthesizer {
    constructor() {
        this.ctx = null;
        this.isPlaying = false;
        this.timer = null;
        this.noteIndex = 0;
        this.notes = [
            261.63, 329.63, 392.00, 523.25, // C4, E4, G4, C5
            293.66, 349.23, 440.00, 587.33, // D4, F4, A4, D5
            220.00, 261.63, 329.63, 440.00, // A3, C4, E4, A4
            349.23, 440.00, 523.25, 659.25  // F4, A4, C5, E5
        ];
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playChime(freq, duration = 2.4, volume = 0.22) {
        if (!this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

            gain.gain.setValueAtTime(0, this.ctx.currentTime);
            gain.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + 0.08);
            gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) {
            console.debug(e);
        }
    }

    playChord() {
        if (!this.isPlaying) return;
        const base = this.notes[this.noteIndex % this.notes.length];
        const third = this.notes[(this.noteIndex + 2) % this.notes.length];
        const fifth = this.notes[(this.noteIndex + 4) % this.notes.length];

        this.playChime(base, 2.8, 0.22);
        setTimeout(() => { if (this.isPlaying) this.playChime(third, 2.5, 0.18); }, 180);
        setTimeout(() => { if (this.isPlaying) this.playChime(fifth * 1.5, 3.0, 0.14); }, 380);

        this.noteIndex = (this.noteIndex + 1) % this.notes.length;
    }

    start() {
        this.init();
        this.isPlaying = true;
        this.playChord();
        this.timer = setInterval(() => {
            this.playChord();
        }, 1600);
    }

    stop() {
        this.isPlaying = false;
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    toggle() {
        if (this.isPlaying) {
            this.stop();
            return false;
        } else {
            this.start();
            return true;
        }
    }

    triggerSparkle() {
        this.init();
        this.playChime(783.99, 1.4, 0.18); // G5
        setTimeout(() => this.playChime(1046.50, 1.6, 0.15), 100); // C6
    }
}

const melody = new RomanticMelodySynthesizer();

/* =========================================================================
   2. HIGH-PERFORMANCE CANVAS VISUAL EFFECTS
   ========================================================================= */
const canvas = document.getElementById('fxCanvas');
const ctx = canvas.getContext('2d');
let width, height;
let particles = [];
let petals = [];
let heartSparkles = [];
let explosions = [];

function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const rand = (min, max) => Math.random() * (max - min) + min;

class AmbientParticle {
    constructor() {
        this.reset();
    }
    reset() {
        this.x = rand(0, width);
        this.y = rand(0, height);
        this.size = rand(0.8, 2.5);
        this.vx = rand(-0.25, 0.25);
        this.vy = rand(-0.4, -0.1);
        this.alpha = rand(0.2, 0.7);
        this.glow = rand(4, 10);
        this.color = Math.random() > 0.4 ? 'rgba(255, 120, 160,' : 'rgba(255, 230, 200,';
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.y < -10 || this.x < -10 || this.x > width + 10) {
            this.reset();
            this.y = height + 5;
        }
    }
    draw() {
        ctx.save();
        ctx.fillStyle = `${this.color} ${this.alpha})`;
        ctx.shadowBlur = this.glow;
        ctx.shadowColor = '#ff3366';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class RosePetal {
    constructor() {
        this.init(true);
    }
    init(scatter = false) {
        this.x = rand(0, width);
        this.y = scatter ? rand(-50, height) : rand(-70, -20);
        this.size = rand(9, 17);
        this.speedY = rand(1.1, 2.3);
        this.speedX = rand(-0.8, 0.8);
        this.rotation = rand(0, 360);
        this.rotationSpeed = rand(-1.8, 1.8);
        this.oscillation = rand(0, Math.PI * 2);
        this.oscillationSpeed = rand(0.015, 0.035);
        this.colorGrad = Math.random() > 0.5 ? '#d81159' : '#ff2a6d';
    }
    update() {
        this.oscillation += this.oscillationSpeed;
        this.y += this.speedY;
        this.x += Math.sin(this.oscillation) * 1.5 + this.speedX;
        this.rotation += this.rotationSpeed;

        if (this.y > height + 40) {
            this.init(false);
        }
    }
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);

        const flip = Math.sin(this.oscillation);
        ctx.scale(1, flip);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(this.size * 0.8, -this.size * 0.8, this.size * 1.2, this.size * 0.5, 0, this.size * 1.2);
        ctx.bezierCurveTo(-this.size * 1.2, this.size * 0.5, -this.size * 0.8, -this.size * 0.8, 0, 0);

        const grad = ctx.createLinearGradient(-this.size / 2, -this.size / 2, this.size / 2, this.size);
        grad.addColorStop(0, '#ff6e8a');
        grad.addColorStop(0.5, this.colorGrad);
        grad.addColorStop(1, '#82052b');

        ctx.fillStyle = grad;
        ctx.shadowColor = 'rgba(255, 45, 96, 0.4)';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.restore();
    }
}

class FloatingHeart {
    constructor() {
        this.reset(true);
    }
    reset(randomY = false) {
        this.x = rand(0, width);
        this.y = randomY ? rand(0, height) : height + rand(20, 80);
        this.size = rand(7, 16);
        this.vy = rand(-1.2, -0.6);
        this.vx = rand(-0.4, 0.4);
        this.alpha = rand(0.3, 0.85);
        this.wobble = rand(0, Math.PI * 2);
        this.wobbleSpeed = rand(0.02, 0.04);
    }
    update() {
        this.y += this.vy;
        this.wobble += this.wobbleSpeed;
        this.x += Math.cos(this.wobble) * 0.6 + this.vx;

        if (this.y < -30) {
            this.reset(false);
        }
    }
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = '#ff3366';
        ctx.shadowColor = '#ff2a6d';
        ctx.shadowBlur = 10;

        const s = this.size;
        ctx.beginPath();
        ctx.moveTo(0, s * 0.3);
        ctx.bezierCurveTo(-s * 0.6, -s * 0.4, -s, s * 0.2, 0, s);
        ctx.bezierCurveTo(s, s * 0.2, s * 0.6, -s * 0.4, 0, s * 0.3);
        ctx.fill();
        ctx.restore();
    }
}

class BurstParticle {
    constructor(x, y, isHeartShape = false) {
        this.x = x;
        this.y = y;
        this.isHeartShape = isHeartShape;
        const angle = rand(0, Math.PI * 2);
        const velocity = rand(2.5, 9);
        this.vx = Math.cos(angle) * velocity;
        this.vy = Math.sin(angle) * velocity;
        this.alpha = 1;
        this.decay = rand(0.012, 0.025);
        this.size = rand(3, 8);
        this.color = ['#ff2a6d', '#ff7597', '#ffd0dc', '#f7d070'][Math.floor(Math.random() * 4)];
        this.gravity = 0.08;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.vx *= 0.98;
        this.alpha -= this.decay;
    }
    draw() {
        if (this.alpha <= 0) return;
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.translate(this.x, this.y);

        if (this.isHeartShape && this.size > 4) {
            ctx.fillStyle = this.color;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 8;
            const s = this.size;
            ctx.beginPath();
            ctx.moveTo(0, s * 0.3);
            ctx.bezierCurveTo(-s * 0.6, -s * 0.4, -s, s * 0.2, 0, s);
            ctx.bezierCurveTo(s, s * 0.2, s * 0.6, -s * 0.4, 0, s * 0.3);
            ctx.fill();
        } else {
            ctx.fillStyle = this.color;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
}

const isMobile = window.innerWidth < 768;
const particleCount = isMobile ? 35 : 65;
const petalCount = isMobile ? 18 : 32;
const heartCount = isMobile ? 12 : 22;

for (let i = 0; i < particleCount; i++) particles.push(new AmbientParticle());
for (let i = 0; i < petalCount; i++) petals.push(new RosePetal());
for (let i = 0; i < heartCount; i++) heartSparkles.push(new FloatingHeart());

function triggerHeartExplosion(x, y, count = 70) {
    for (let i = 0; i < count; i++) {
        explosions.push(new BurstParticle(x, y, Math.random() > 0.4));
    }
}

function renderLoop() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
    }

    for (let i = 0; i < heartSparkles.length; i++) {
        heartSparkles[i].update();
        heartSparkles[i].draw();
    }

    for (let i = 0; i < petals.length; i++) {
        petals[i].update();
        petals[i].draw();
    }

    for (let i = explosions.length - 1; i >= 0; i--) {
        explosions[i].update();
        explosions[i].draw();
        if (explosions[i].alpha <= 0) {
            explosions.splice(i, 1);
        }
    }

    requestAnimationFrame(renderLoop);
}

window.onload = function() {
    renderLoop();
};

/* =========================================================================
   3. CINEMATIC SCENE FLOW & INTERACTION
   ========================================================================= */
const sceneWelcome = document.getElementById('sceneWelcome');
const sceneCinematic = document.getElementById('sceneCinematic');
const sceneFinal = document.getElementById('sceneFinal');

const stepMsg1 = document.getElementById('stepMsg1');
const stepMsg2 = document.getElementById('stepMsg2');

const btnOpenSurprise = document.getElementById('btnOpenSurprise');
const envelopeGraphic = document.getElementById('envelopeGraphic');
const btnReplay = document.getElementById('btnReplay');
const btnHeartBurst = document.getElementById('btnHeartBurst');
const btnEmailReply = document.getElementById('btnEmailReply');

const replyModal = document.getElementById('replyModal');
const btnCloseModal = document.getElementById('btnCloseModal');
const btnSendGmail = document.getElementById('btnSendGmail');
const btnSendMailto = document.getElementById('btnSendMailto');
const btnCopyEmail = document.getElementById('btnCopyEmail');
const copyText = document.getElementById('copyText');
const replyMessageText = document.getElementById('replyMessageText');

const TARGET_EMAIL = 'www.nerujan.lk@gmail.com';
const EMAIL_SUBJECT = 'My Answer to Your Love Proposal ❤️';

function openReplyModal() {
    melody.triggerSparkle();
    replyModal.classList.remove('hidden');
    replyModal.classList.add('flex');
    requestAnimationFrame(() => {
        replyModal.classList.remove('opacity-0', 'pointer-events-none');
        replyModal.classList.add('opacity-100', 'pointer-events-auto');
        const card = replyModal.querySelector('.glass-card');
        if (card) {
            card.classList.remove('scale-95');
            card.classList.add('scale-100');
        }
    });
}

function closeReplyModal() {
    replyModal.classList.remove('opacity-100', 'pointer-events-auto');
    replyModal.classList.add('opacity-0', 'pointer-events-none');
    const card = replyModal.querySelector('.glass-card');
    if (card) {
        card.classList.remove('scale-100');
        card.classList.add('scale-95');
    }
    setTimeout(() => {
        replyModal.classList.remove('flex');
        replyModal.classList.add('hidden');
    }, 300);
}

if (btnEmailReply) {
    btnEmailReply.addEventListener('click', () => {
        const rect = btnEmailReply.getBoundingClientRect();
        triggerHeartExplosion(rect.left + rect.width / 2, rect.top + rect.height / 2, 45);
        openReplyModal();
    });
}

if (btnCloseModal) {
    btnCloseModal.addEventListener('click', closeReplyModal);
}

if (replyModal) {
    replyModal.addEventListener('click', (e) => {
        if (e.target === replyModal) {
            closeReplyModal();
        }
    });
}

if (btnSendGmail) {
    btnSendGmail.addEventListener('click', () => {
        melody.triggerSparkle();
        const bodyText = encodeURIComponent(replyMessageText.value || 'Yes! I saw your beautiful message... ❤️');
        const subjectText = encodeURIComponent(EMAIL_SUBJECT);
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(TARGET_EMAIL)}&su=${subjectText}&body=${bodyText}`;
        window.open(gmailUrl, '_blank');
    });
}

if (btnSendMailto) {
    btnSendMailto.addEventListener('click', () => {
        melody.triggerSparkle();
        const bodyText = encodeURIComponent(replyMessageText.value || 'Yes! I saw your beautiful message... ❤️');
        const subjectText = encodeURIComponent(EMAIL_SUBJECT);
        const mailtoUrl = `mailto:${TARGET_EMAIL}?subject=${subjectText}&body=${bodyText}`;
        window.location.href = mailtoUrl;
    });
}

if (btnCopyEmail) {
    btnCopyEmail.addEventListener('click', () => {
        melody.triggerSparkle();
        const tempInput = document.createElement('input');
        tempInput.value = TARGET_EMAIL;
        document.body.appendChild(tempInput);
        tempInput.select();
        try {
            document.execCommand('copy');
            copyText.textContent = 'Copied! ✨';
            setTimeout(() => {
                copyText.textContent = 'Copy Email Address';
            }, 2500);
        } catch (err) {
            copyText.textContent = TARGET_EMAIL;
        }
        document.body.removeChild(tempInput);
    });
}

const musicToggleBtn = document.getElementById('musicToggleBtn');
const musicText = document.getElementById('musicText');

musicToggleBtn.addEventListener('click', () => {
    const active = melody.toggle();
    musicText.textContent = active ? 'Melody: On' : 'Melody: Off';
    musicToggleBtn.classList.toggle('border-pink-500', active);
    if (active) melody.triggerSparkle();
});

function startCinematicExperience() {
    if (!melody.isPlaying) {
        melody.start();
        musicText.textContent = 'Melody: On';
        musicToggleBtn.classList.add('border-pink-500');
    }
    melody.triggerSparkle();

    const rect = envelopeGraphic.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    triggerHeartExplosion(centerX, centerY, 100);

    for (let i = 0; i < 15; i++) {
        petals.push(new RosePetal());
    }

    sceneWelcome.style.opacity = '0';
    sceneWelcome.style.transform = 'scale(0.92)';
    sceneWelcome.style.pointerEvents = 'none';

    setTimeout(() => {
        sceneWelcome.classList.add('hidden');
        sceneCinematic.classList.remove('hidden');
        sceneCinematic.style.display = 'flex';

        setTimeout(() => {
            stepMsg1.classList.add('active');
            triggerHeartExplosion(window.innerWidth / 2, window.innerHeight * 0.4, 25);
        }, 100);

        setTimeout(() => {
            stepMsg1.classList.remove('active');
            stepMsg1.classList.add('exit');

            setTimeout(() => {
                stepMsg1.classList.add('hidden');
                stepMsg2.classList.remove('hidden');
                stepMsg2.style.display = 'flex';

                setTimeout(() => {
                    stepMsg2.classList.add('active');
                    triggerHeartExplosion(window.innerWidth / 2, window.innerHeight * 0.45, 30);
                    melody.triggerSparkle();
                }, 50);
            }, 900);

        }, 4000);

        setTimeout(() => {
            stepMsg2.classList.remove('active');
            stepMsg2.classList.add('exit');

            setTimeout(() => {
                sceneCinematic.classList.add('hidden');
                sceneCinematic.style.display = 'none';

                sceneFinal.classList.remove('hidden');
                sceneFinal.style.display = 'flex';
                sceneFinal.style.opacity = '0';
                sceneFinal.style.transform = 'scale(0.85)';
                sceneFinal.style.transition = 'all 1.6s cubic-bezier(0.16, 1, 0.3, 1)';

                requestAnimationFrame(() => {
                    sceneFinal.style.opacity = '1';
                    sceneFinal.style.transform = 'scale(1)';

                    const fxX = window.innerWidth / 2;
                    const fxY = window.innerHeight * 0.35;
                    triggerHeartExplosion(fxX, fxY, 120);
                    setTimeout(() => triggerHeartExplosion(fxX - 120, fxY + 40, 60), 250);
                    setTimeout(() => triggerHeartExplosion(fxX + 120, fxY + 40, 60), 500);

                    melody.triggerSparkle();
                });

            }, 1000);

        }, 8500);

    }, 800);
}

btnOpenSurprise.addEventListener('click', startCinematicExperience);
envelopeGraphic.addEventListener('click', startCinematicExperience);

btnHeartBurst.addEventListener('click', (e) => {
    const rect = e.target.getBoundingClientRect();
    triggerHeartExplosion(rect.left + rect.width / 2, rect.top, 50);
    melody.triggerSparkle();
});

btnReplay.addEventListener('click', () => {
    melody.triggerSparkle();

    sceneFinal.style.opacity = '0';
    sceneFinal.style.transform = 'scale(0.9)';

    setTimeout(() => {
        sceneFinal.classList.add('hidden');
        sceneFinal.style.display = 'none';

        stepMsg1.classList.remove('exit', 'active');
        stepMsg1.classList.remove('hidden');
        stepMsg1.style.display = '';

        stepMsg2.classList.remove('exit', 'active');
        stepMsg2.classList.add('hidden');
        stepMsg2.style.display = 'none';

        sceneCinematic.classList.add('hidden');
        sceneCinematic.style.display = 'none';

        sceneWelcome.classList.remove('hidden');
        sceneWelcome.style.pointerEvents = 'auto';

        requestAnimationFrame(() => {
            sceneWelcome.style.opacity = '1';
            sceneWelcome.style.transform = 'scale(1)';
            triggerHeartExplosion(window.innerWidth / 2, window.innerHeight * 0.45, 35);
        });

    }, 800);
});

window.addEventListener('pointerdown', (e) => {
    triggerHeartExplosion(e.clientX, e.clientY, 15);
});