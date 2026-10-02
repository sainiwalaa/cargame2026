/**
 * CAR RUSH 3D - COMPLETE ARCADE RACING GAME ENGINE
 * HTML5 Canvas Pseudo-3D Road Engine with 100 Progressive Levels,
 * Car Upgrades, Drivers Roster, Missions, Web Audio Synthesizer & LocalStorage Save.
 * Fully compatible with GitHub Pages static hosting & mobile/desktop browsers.
 */

(function () {
  'use strict';

  // Global Error and Promise Rejection Handlers for Live Debugging
  window.onerror = function(msg, url, line, col, error) {
    const text = `${msg} [${line}:${col}]`;
    console.error('Car Rush Runtime Error:', text, error);
    const debugErr = document.getElementById('debug-error');
    if (debugErr) {
      debugErr.textContent = String(msg).slice(0, 32);
      debugErr.parentElement?.classList.add('has-error');
    }
    const errPanel = document.getElementById('car-rush-error-panel');
    if (errPanel) {
      errPanel.classList.remove('hidden');
      const msgEl = document.getElementById('error-panel-msg');
      if (msgEl) msgEl.textContent = String(msg);
      const lineEl = document.getElementById('error-panel-line');
      if (lineEl) lineEl.textContent = `${line}:${col}`;
      const stackEl = document.getElementById('error-panel-stack');
      if (stackEl) stackEl.textContent = error?.stack || 'No stack trace';
    }
  };

  window.onunhandledrejection = function(e) {
    const reason = e.reason?.message || e.reason || 'Promise rejected';
    console.error('Car Rush Unhandled Rejection:', reason);
    const debugErr = document.getElementById('debug-error');
    if (debugErr) {
      debugErr.textContent = String(reason).slice(0, 32);
      debugErr.parentElement?.classList.add('has-error');
    }
  };

  // Cross-browser Canvas safe roundRect helper
  function drawRoundRect(ctx, x, y, width, height, radii) {
    if (typeof ctx.roundRect === 'function') {
      try {
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, radii);
        return;
      } catch (e) {}
    }
    let r = 8;
    if (Array.isArray(radii)) {
      r = radii[0] || 8;
    } else if (typeof radii === 'number') {
      r = radii;
    }
    r = Math.min(r, Math.abs(width) / 2, Math.abs(height) / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function getNow() {
    return (typeof performance !== 'undefined' && typeof performance.now === 'function')
      ? performance.now()
      : Date.now();
  }

  /* ==========================================================================
     1. CONSTANTS, VEHICLES & DRIVERS CONFIGURATION
     ========================================================================== */

  const CARS = [
    {
      id: 'starter_gt',
      name: 'Starter GT',
      desc: 'Balanced rookie coupe with reliable handling.',
      baseSpeed: 210,
      baseAcc: 6.5,
      baseHandling: 7.0,
      baseBraking: 7.0,
      baseNitro: 7.0,
      baseHealth: 100,
      unlockCost: 0,
      unlockLevel: 1,
      color: '#ff0055',
      accent: '#ffffff'
    },
    {
      id: 'street_king',
      name: 'Street King',
      desc: 'Muscle monster tuned for ferocious straight-line torque.',
      baseSpeed: 230,
      baseAcc: 7.5,
      baseHandling: 6.2,
      baseBraking: 6.8,
      baseNitro: 7.5,
      baseHealth: 115,
      unlockCost: 3500,
      unlockLevel: 10,
      color: '#f59e0b',
      accent: '#111827'
    },
    {
      id: 'turbo_x',
      name: 'Turbo X',
      desc: 'Twin-turbo import tuned for razor-sharp street sprints.',
      baseSpeed: 245,
      baseAcc: 8.0,
      baseHandling: 7.8,
      baseBraking: 7.5,
      baseNitro: 8.0,
      baseHealth: 110,
      unlockCost: 12000,
      unlockLevel: 25,
      color: '#06b6d4',
      accent: '#000000'
    },
    {
      id: 'night_runner',
      name: 'Night Runner',
      desc: 'Underground night racer with neon underglow and drift balance.',
      baseSpeed: 260,
      baseAcc: 8.2,
      baseHandling: 8.5,
      baseBraking: 8.0,
      baseNitro: 8.5,
      baseHealth: 120,
      unlockCost: 28000,
      unlockLevel: 40,
      color: '#8b5cf6',
      accent: '#00f0ff'
    },
    {
      id: 'desert_beast',
      name: 'Desert Beast',
      desc: 'Heavy-armored reinforced GT engineered for harsh terrains.',
      baseSpeed: 270,
      baseAcc: 7.8,
      baseHandling: 7.2,
      baseBraking: 8.8,
      baseNitro: 8.0,
      baseHealth: 160,
      unlockCost: 48000,
      unlockLevel: 55,
      color: '#d97706',
      accent: '#fef3c7'
    },
    {
      id: 'mountain_gt',
      name: 'Mountain GT',
      desc: 'Lightweight carbon chassis tuned for treacherous hairpin passes.',
      baseSpeed: 285,
      baseAcc: 8.8,
      baseHandling: 9.2,
      baseBraking: 8.8,
      baseNitro: 8.5,
      baseHealth: 130,
      unlockCost: 80000,
      unlockLevel: 70,
      color: '#10b981',
      accent: '#ffffff'
    },
    {
      id: 'super_racer',
      name: 'Super Racer',
      desc: 'Exotic aerodynamic hypercar with active wing ground effects.',
      baseSpeed: 305,
      baseAcc: 9.4,
      baseHandling: 9.0,
      baseBraking: 9.2,
      baseNitro: 9.2,
      baseHealth: 140,
      unlockCost: 130000,
      unlockLevel: 85,
      color: '#ef4444',
      accent: '#fbbf24'
    },
    {
      id: 'ultimate_x',
      name: 'Ultimate X',
      desc: 'Grand Prix concept rocket. Unrivaled top speed and downforce.',
      baseSpeed: 330,
      baseAcc: 9.8,
      baseHandling: 9.6,
      baseBraking: 9.5,
      baseNitro: 10.0,
      baseHealth: 160,
      unlockCost: 220000,
      unlockLevel: 100,
      color: '#00f0ff',
      accent: '#ff0055'
    }
  ];

  const PAINT_COLORS = [
    '#ff0055', '#00f0ff', '#ffaa00', '#10b981', '#8b5cf6', '#ef4444', '#f8fafc', '#111827'
  ];

  const DRIVERS = [
    {
      id: 'ravi',
      name: 'RAVI',
      title: 'Balanced Prodigy',
      avatar: '🏎️',
      unlockLevel: 1,
      ability: 'Steady Grip',
      desc: '+10% general handling stability and 20% quicker spinout recovery.',
      bonus: { handling: 1.1, recovery: 1.2 }
    },
    {
      id: 'arjun',
      name: 'ARJUN',
      title: 'Drag Specialist',
      avatar: '⚡',
      unlockLevel: 5,
      ability: 'Instant Torque',
      desc: '+25% faster launch acceleration and instant gear shifting.',
      bonus: { acc: 1.25 }
    },
    {
      id: 'kavya',
      name: 'KAVYA',
      title: 'Drift Queen',
      avatar: '👑',
      unlockLevel: 15,
      ability: 'Apex Agility',
      desc: '+30% high-speed turning agility and +50% drift combo points.',
      bonus: { handling: 1.3, scoreBonus: 1.2 }
    },
    {
      id: 'veer',
      name: 'VEER',
      title: 'Mach Speeder',
      avatar: '🚀',
      unlockLevel: 30,
      ability: 'Mach Velocity',
      desc: '+18% maximum top speed ceiling on straightaways.',
      bonus: { topSpeed: 1.18 }
    },
    {
      id: 'meera',
      name: 'MEERA',
      title: 'Nitro Tech Alchemist',
      avatar: '🔮',
      unlockLevel: 50,
      ability: 'Hyper Boost',
      desc: 'Nitro burns 40% slower and recharges +30% on near-misses.',
      bonus: { nitroEfficiency: 1.4, nitroRecharge: 1.3 }
    },
    {
      id: 'rohan',
      name: 'ROHAN',
      title: 'Iron Titan',
      avatar: '🛡️',
      unlockLevel: 75,
      ability: 'Juggernaut Armor',
      desc: 'Vehicle takes 50% less collision impact and cannot be knocked off course.',
      bonus: { armor: 1.5, knockback: 0.5 }
    }
  ];

  const UPGRADE_PARTS = [
    { id: 'engine', name: 'Engine Tuning', icon: '⚙️', stat: 'Top Speed + Acceleration', maxTier: 5, baseCost: 600 },
    { id: 'turbo', name: 'Twin Turbocharger', icon: '🌀', stat: 'Torque & Peak Boost', maxTier: 5, baseCost: 800 },
    { id: 'tires', name: 'Racing Slicks', icon: '🛞', stat: 'Asphalt Grip & Traction', maxTier: 5, baseCost: 500 },
    { id: 'brakes', name: 'Ceramic Brakes', icon: '🛑', stat: 'Braking Deceleration', maxTier: 5, baseCost: 450 },
    { id: 'handling', name: 'Active Suspension', icon: '📐', stat: 'Lateral Steering Agility', maxTier: 5, baseCost: 550 },
    { id: 'nitro', name: 'Nitrous Tank & Injector', icon: '⚡', stat: 'Nitro Capacity & Multiplier', maxTier: 5, baseCost: 750 },
    { id: 'durability', name: 'Carbon-Titanium Chassis', icon: '🛡️', stat: 'Armor Durability Points', maxTier: 5, baseCost: 650 }
  ];

  const CAREER_MISSIONS = [
    { id: 'm_dist', title: 'Highway Voyager', desc: 'Drive a total distance of 15,000 meters in career races.', target: 15000, rewardCoins: 1200, rewardXP: 400, key: 'totalDistance' },
    { id: 'm_overtake', title: 'Traffic Terror', desc: 'Successfully overtake 40 traffic vehicles without collision.', target: 40, rewardCoins: 1500, rewardXP: 500, key: 'totalOvertakes' },
    { id: 'm_nearmiss', title: 'Razor Blade', desc: 'Perform 20 high-speed near misses.', target: 20, rewardCoins: 1800, rewardXP: 600, key: 'totalNearMisses' },
    { id: 'm_nitro', title: 'Nitrous Addict', desc: 'Burn nitro fuel 30 times.', target: 30, rewardCoins: 1000, rewardXP: 350, key: 'totalNitroBurns' },
    { id: 'm_stars', title: 'Gold Standard', desc: 'Earn 3 stars on at least 15 different levels.', target: 15, rewardCoins: 3000, rewardXP: 1000, key: 'threeStarCount' },
    { id: 'm_coins', title: 'Treasure Hunter', desc: 'Collect 200 asphalt gold coins.', target: 200, rewardCoins: 2000, rewardXP: 700, key: 'totalCoinsCollected' }
  ];

  /* ==========================================================================
     2. AUDIO SYSTEM (WEB AUDIO API SYNTHESIZER)
     ========================================================================== */

  class AudioEngine {
    constructor() {
      this.ctx = null;
      this.isSoundOn = true;
      this.isMusicOn = true;
      this.engineOsc = null;
      this.engineGain = null;
      this.isEngineRunning = false;
      this.musicInterval = null;
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    playEngine(rpmRatio) {
      if (!this.isSoundOn || !this.ctx) return;
      try {
        if (!this.isEngineRunning) {
          this.engineOsc = this.ctx.createOscillator();
          this.engineGain = this.ctx.createGain();
          this.engineOsc.type = 'sawtooth';
          this.engineOsc.frequency.setValueAtTime(55, this.ctx.currentTime);
          this.engineGain.gain.setValueAtTime(0.06, this.ctx.currentTime);
          this.engineOsc.connect(this.engineGain);
          this.engineGain.connect(this.ctx.destination);
          this.engineOsc.start();
          this.isEngineRunning = true;
        }
        if (this.engineOsc && this.engineGain) {
          const targetFreq = 50 + rpmRatio * 180;
          this.engineOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.05);
          this.engineGain.gain.setTargetAtTime(0.04 + rpmRatio * 0.04, this.ctx.currentTime, 0.05);
        }
      } catch (e) {}
    }

    stopEngine() {
      if (this.isEngineRunning && this.engineOsc) {
        try {
          this.engineOsc.stop();
          this.engineOsc.disconnect();
        } catch (e) {}
        this.engineOsc = null;
        this.engineGain = null;
        this.isEngineRunning = false;
      }
    }

    playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.1) {
      if (!this.isSoundOn || !this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {}
    }

    playCrash() {
      if (!this.isSoundOn || !this.ctx) return;
      try {
        const bufferSize = this.ctx.sampleRate * 0.35;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(700, this.ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.35);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start();
      } catch (e) {}
    }

    playCoin() {
      this.playTone(987.77, 'triangle', 0.12, 0.15);
      setTimeout(() => this.playTone(1318.51, 'triangle', 0.2, 0.15), 60);
    }

    playCheckpoint() {
      this.playTone(523.25, 'sine', 0.15, 0.2);
      setTimeout(() => this.playTone(659.25, 'sine', 0.15, 0.2), 100);
      setTimeout(() => this.playTone(783.99, 'sine', 0.3, 0.2), 200);
      setTimeout(() => this.playTone(1046.5, 'sine', 0.4, 0.25), 300);
    }

    playNitro() {
      this.playTone(180, 'sawtooth', 0.3, 0.2);
    }

    playClick() {
      this.playTone(600, 'sine', 0.05, 0.08);
    }

    playVictory() {
      const chords = [523.25, 659.25, 783.99, 1046.5];
      chords.forEach((note, idx) => {
        setTimeout(() => this.playTone(note, 'triangle', 0.4, 0.15), idx * 120);
      });
    }

    startMusic() {
      if (!this.isMusicOn || this.musicInterval) return;
      let step = 0;
      const bassLine = [110, 110, 130.81, 146.83, 110, 110, 164.81, 146.83];
      this.musicInterval = setInterval(() => {
        if (!this.isMusicOn || !this.ctx) return;
        const note = bassLine[step % bassLine.length];
        this.playTone(note, 'sawtooth', 0.1, 0.04);
        if (step % 4 === 2) {
          this.playTone(note * 3, 'sine', 0.12, 0.03);
        }
        step++;
      }, 160);
    }

    stopMusic() {
      if (this.musicInterval) {
        clearInterval(this.musicInterval);
        this.musicInterval = null;
      }
    }
  }

  /* ==========================================================================
     3. SAVE & PERSISTENCE SYSTEM (LOCALSTORAGE)
     ========================================================================== */

  class SaveSystem {
    constructor() {
      this.storageKey = 'CAR_RUSH_3D_SAVE_V1';
      this.data = this.getDefaultData();
      this.load();
    }

    getDefaultData() {
      return {
        coins: 1500,
        xp: 150,
        playerLevel: 1,
        selectedCarId: 'starter_gt',
        selectedCarColor: '#ff0055',
        selectedDriverId: 'ravi',
        unlockedCars: ['starter_gt'],
        unlockedDrivers: ['ravi'],
        carUpgrades: {
          starter_gt: { engine: 1, turbo: 1, tires: 1, brakes: 1, handling: 1, nitro: 1, durability: 1 }
        },
        levelProgress: {
          1: { unlocked: true, stars: 0, bestScore: 0, bestTime: 0 }
        },
        stats: {
          totalDistance: 0,
          totalOvertakes: 0,
          totalNearMisses: 0,
          totalNitroBurns: 0,
          totalCoinsCollected: 0,
          threeStarCount: 0,
          highestScore: 0
        },
        claimedMissions: {},
        settings: {
          music: true,
          sound: true,
          vibration: true,
          quality: 'high',
          sensitivity: 1.0
        },
        leaderboard: [
          { rank: 1, name: 'APEX_KING', car: 'Ultimate X', level: 100, score: 285400 },
          { rank: 2, name: 'TURBO_MAX', car: 'Super Racer', level: 92, score: 218200 },
          { rank: 3, name: 'CYBER_VIPER', car: 'Night Runner', level: 80, score: 184500 },
          { rank: 4, name: 'RED_LINE', car: 'Mountain GT', level: 68, score: 142000 },
          { rank: 5, name: 'NEON_DRIFT', car: 'Turbo X', level: 45, score: 98000 }
        ]
      };
    }

    load() {
      try {
        const raw = localStorage.getItem(this.storageKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          this.data = Object.assign(this.getDefaultData(), parsed);
        }
      } catch (e) {
        console.warn('LocalStorage unavailable; fallback to memory storage.');
      }
    }

    save() {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
      } catch (e) {}
    }

    reset() {
      this.data = this.getDefaultData();
      this.save();
    }
  }

  /* ==========================================================================
     4. PSEUDO-3D ROAD SEGMENT & SCENERY SYSTEM
     ========================================================================== */

  class Segment {
    constructor(index) {
      this.index = index;
      this.p1 = { world: { x: 0, y: 0, z: 0 }, camera: { x: 0, y: 0, z: 0 }, screen: { x: 0, y: 0, w: 0, scale: 0 } };
      this.p2 = { world: { x: 0, y: 0, z: 0 }, camera: { x: 0, y: 0, z: 0 }, screen: { x: 0, y: 0, w: 0, scale: 0 } };
      this.curve = 0;
      this.sprites = [];
      this.cars = [];
      this.coins = [];
      this.isCheckpoint = false;
      this.isFinish = false;
      this.color = {
        road: '#2b2d42',
        grass: '#1a1d20',
        rumble: '#ef233c',
        lane: '#ffffff'
      };
    }
  }

  /* ==========================================================================
     5. MAIN GAME CONTROLLER & STATE MACHINE
     ========================================================================== */

  class GameController {
    constructor() {
      this.save = new SaveSystem();
      this.audio = new AudioEngine();

      this.canvas = document.getElementById('game-canvas');
      this.ctx = this.canvas ? this.canvas.getContext('2d', { alpha: false }) : null;

      // Engine parameters
      this.fps = 60;
      this.step = 1 / this.fps;
      this.width = window.innerWidth || 800;
      this.height = window.innerHeight || 600;
      this.roadWidth = 2000;
      this.segmentLength = 200;
      this.rumbleLength = 3;
      this.lanes = 3;
      this.fieldOfView = 100;
      this.cameraHeight = 1000;
      this.cameraDepth = null;
      this.drawDistance = 300;

      // Player racing state
      this.playerX = 0;
      this.position = 0;
      this.speed = 0;
      this.maxSpeed = 220;
      this.accel = 0;
      this.breaking = 0;
      this.nitro = 100;
      this.isNitroActive = false;
      this.health = 100;
      this.maxHealth = 100;

      // Track & Level data
      this.currentLevelId = 1;
      this.currentLevel = null;
      this.trackLength = 0;
      this.segments = [];
      this.trafficCars = [];
      this.trackCoins = [];
      this.weatherParticles = [];

      // Current race scoring metrics
      this.raceScore = 0;
      this.raceCoins = 0;
      this.raceOvertakes = 0;
      this.raceNearMisses = 0;
      this.raceTimeRemaining = 60;
      this.raceElapsedTime = 0;
      this.comboMultiplier = 1;
      this.comboTimer = 0;
      this.isGameOver = false;
      this.isVictory = false;
      this.isPaused = false;
      this.isPlayingRace = false;
      this.gameState = 'MENU';
      this.playerSteer = 0;

      // Menu background track animation
      this.menuPosition = 0;
      this.menuSegments = [];

      // Inputs
      this.keys = {
        left: false,
        right: false,
        faster: false,
        slower: false,
        nitro: false
      };

      this.initDomReferences();
      this.setupEventListeners();
      this.resizeCanvas();
      this.applySavedSettings();
      this.showScreen('menu');
      this.refreshAllUI();
      this.updateDebugBar();

      // Main Loop
      this.mainLoopRunning = false;
      this.startMainLoop();
    }

    get state() {
      return this.gameState;
    }

    set state(val) {
      this.gameState = val;
    }

    get traffic() {
      return this.trafficCars;
    }

    set traffic(val) {
      this.trafficCars = val;
    }

    get player() {
      return {
        x: this.playerX,
        speed: this.speed,
        position: this.position,
        health: this.health,
        maxHealth: this.maxHealth,
        nitro: this.nitro,
        maxNitro: this.maxNitro,
        steer: this.playerSteer
      };
    }

    get score() {
      return this.raceScore;
    }

    set score(val) {
      this.raceScore = val;
    }

    updateDebugBar(extraErr = null) {
      const stateEl = document.getElementById('debug-state');
      if (stateEl) stateEl.textContent = this.gameState || (this.isPlayingRace ? 'RACING' : 'MENU');
      const lvlEl = document.getElementById('debug-level');
      if (lvlEl) lvlEl.textContent = this.currentLevelId || 1;
      const canvasEl = document.getElementById('debug-canvas');
      if (canvasEl) canvasEl.textContent = (this.canvas && this.ctx) ? `${this.canvas.width}x${this.canvas.height}` : 'NO CTX';
      const playerEl = document.getElementById('debug-player');
      if (playerEl) playerEl.textContent = `SPD:${Math.round(this.speed || 0)} POS:${Math.round(this.position || 0)}`;
      const loopEl = document.getElementById('debug-loop');
      if (loopEl) loopEl.textContent = this.mainLoopRunning ? 'ACTIVE' : 'HALTED';
      const errEl = document.getElementById('debug-error');
      if (errEl) {
        if (extraErr) {
          errEl.textContent = String(extraErr).slice(0, 32);
          errEl.parentElement?.classList.add('has-error');
        } else if (!errEl.textContent || errEl.textContent === 'NONE') {
          errEl.textContent = 'NONE';
        }
      }
    }

    initDomReferences() {
      // Screens
      this.screens = {
        menu: document.getElementById('screen-main-menu'),
        levels: document.getElementById('screen-levels'),
        garage: document.getElementById('screen-garage'),
        upgrades: document.getElementById('screen-upgrades'),
        characters: document.getElementById('screen-characters'),
        missions: document.getElementById('screen-missions'),
        leaderboard: document.getElementById('screen-leaderboard'),
        settings: document.getElementById('screen-settings')
      };

      // Modals
      this.modals = {
        briefing: document.getElementById('modal-level-briefing'),
        pause: document.getElementById('modal-pause'),
        complete: document.getElementById('modal-level-complete'),
        gameover: document.getElementById('modal-game-over')
      };

      // HUD
      this.hudOverlay = document.getElementById('hud-overlay');
      this.hudSpeedNum = document.getElementById('hud-speed-num');
      this.hudHealthFill = document.getElementById('hud-health-fill');
      this.hudHealthPct = document.getElementById('hud-health-pct');
      this.hudNitroFill = document.getElementById('hud-nitro-fill');
      this.hudNitroPct = document.getElementById('hud-nitro-pct');
      this.hudScoreVal = document.getElementById('hud-score-val');
      this.hudCoinsVal = document.getElementById('hud-coins-val');
      this.hudTimerVal = document.getElementById('hud-timer-val');
      this.hudObjectiveVal = document.getElementById('hud-objective-val');
      this.hudObjectiveBar = document.getElementById('hud-objective-bar');
      this.hudComboBadge = document.getElementById('hud-combo-badge');
      this.hudPosMarker = document.getElementById('hud-player-progress-marker');
      this.hudPopupsContainer = document.getElementById('hud-popups-container');
    }

    setupEventListeners() {
      window.addEventListener('resize', () => this.resizeCanvas());
      window.addEventListener('orientationchange', () => this.checkOrientation());

      // Keyboard Controls
      window.addEventListener('keydown', (e) => {
        if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
          e.preventDefault();
        }
        if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
          if (this.isPlayingRace && !this.isGameOver && !this.isVictory) {
            this.togglePause();
          }
        }
        this.handleKeyEvent(e.code, true);
      });

      window.addEventListener('keyup', (e) => {
        this.handleKeyEvent(e.code, false);
      });

      // Mobile Touch Controls
      this.bindTouchButton('btn-touch-left', (pressed) => { this.keys.left = pressed; });
      this.bindTouchButton('btn-touch-right', (pressed) => { this.keys.right = pressed; });
      this.bindTouchButton('btn-touch-brake', (pressed) => { this.keys.slower = pressed; });
      this.bindTouchButton('btn-touch-gas', (pressed) => { this.keys.faster = pressed; });
      this.bindTouchButton('btn-touch-nitro', (pressed) => { this.keys.nitro = pressed; });

      // HUD & Pause Buttons
      document.getElementById('btn-hud-pause')?.addEventListener('click', () => {
        this.audio.playClick();
        this.togglePause();
      });

      document.getElementById('btn-pause-resume')?.addEventListener('click', () => {
        this.audio.playClick();
        this.togglePause();
      });

      document.getElementById('btn-pause-restart')?.addEventListener('click', () => {
        this.audio.playClick();
        this.modals.pause?.classList.add('hidden');
        this.startRace(this.currentLevelId);
      });

      document.getElementById('btn-pause-settings')?.addEventListener('click', () => {
        this.audio.playClick();
        this.modals.pause?.classList.add('hidden');
        this.showScreen('settings');
      });

      document.getElementById('btn-pause-quit')?.addEventListener('click', () => {
        this.audio.playClick();
        this.modals.pause?.classList.add('hidden');
        this.endRaceSession();
        this.showScreen('levels');
      });

      // Main Menu Nav Buttons
      document.getElementById('btn-main-play')?.addEventListener('click', () => {
        this.audio.playClick();
        this.audio.init();
        const targetLvl = this.getHighestPlayableLevel();
        this.openLevelBriefing(targetLvl);
      });

      document.getElementById('btn-nav-levels')?.addEventListener('click', () => {
        this.audio.playClick();
        this.showScreen('levels');
      });

      document.getElementById('btn-nav-garage')?.addEventListener('click', () => {
        this.audio.playClick();
        this.showScreen('garage');
      });

      document.getElementById('btn-nav-upgrades')?.addEventListener('click', () => {
        this.audio.playClick();
        this.showScreen('upgrades');
      });

      document.getElementById('btn-nav-characters')?.addEventListener('click', () => {
        this.audio.playClick();
        this.showScreen('characters');
      });

      document.getElementById('btn-nav-missions')?.addEventListener('click', () => {
        this.audio.playClick();
        this.showScreen('missions');
      });

      document.getElementById('btn-nav-leaderboard')?.addEventListener('click', () => {
        this.audio.playClick();
        this.showScreen('leaderboard');
      });

      document.getElementById('btn-nav-settings')?.addEventListener('click', () => {
        this.audio.playClick();
        this.showScreen('settings');
      });

      document.getElementById('btn-header-profile')?.addEventListener('click', () => {
        this.audio.playClick();
        this.showScreen('characters');
      });

      // Back Buttons
      ['levels', 'garage', 'upgrades', 'characters', 'missions', 'leaderboard', 'settings'].forEach((scr) => {
        document.getElementById(`btn-back-from-${scr}`)?.addEventListener('click', () => {
          this.audio.playClick();
          this.showScreen('menu');
        });
      });

      // Briefing Modal Buttons
      document.getElementById('btn-close-briefing')?.addEventListener('click', () => {
        this.audio.playClick();
        this.modals.briefing?.classList.add('hidden');
      });

      document.getElementById('btn-start-level-race')?.addEventListener('click', () => {
        this.audio.playClick();
        this.audio.init();
        this.modals.briefing?.classList.add('hidden');
        this.startRace(this.currentLevelId || 1);
      });

      // Level Complete Buttons
      document.getElementById('btn-complete-next')?.addEventListener('click', () => {
        this.audio.playClick();
        this.modals.complete?.classList.add('hidden');
        const nextId = Math.min(100, this.currentLevelId + 1);
        this.openLevelBriefing(nextId);
      });

      document.getElementById('btn-complete-replay')?.addEventListener('click', () => {
        this.audio.playClick();
        this.modals.complete?.classList.add('hidden');
        this.startRace(this.currentLevelId);
      });

      document.getElementById('btn-complete-map')?.addEventListener('click', () => {
        this.audio.playClick();
        this.modals.complete?.classList.add('hidden');
        this.endRaceSession();
        this.showScreen('levels');
      });

      // Game Over Buttons
      document.getElementById('btn-defeat-retry')?.addEventListener('click', () => {
        this.audio.playClick();
        this.modals.gameover?.classList.add('hidden');
        this.startRace(this.currentLevelId);
      });

      document.getElementById('btn-defeat-garage')?.addEventListener('click', () => {
        this.audio.playClick();
        this.modals.gameover?.classList.add('hidden');
        this.endRaceSession();
        this.showScreen('upgrades');
      });

      document.getElementById('btn-defeat-map')?.addEventListener('click', () => {
        this.audio.playClick();
        this.modals.gameover?.classList.add('hidden');
        this.endRaceSession();
        this.showScreen('levels');
      });

      // Garage Buttons
      document.getElementById('btn-garage-action')?.addEventListener('click', () => {
        this.audio.playClick();
        this.handleGarageAction();
      });

      document.getElementById('btn-garage-to-upgrades')?.addEventListener('click', () => {
        this.audio.playClick();
        this.showScreen('upgrades');
      });

      // Settings Toggles
      document.getElementById('btn-toggle-music')?.addEventListener('click', (e) => {
        this.audio.playClick();
        this.save.data.settings.music = !this.save.data.settings.music;
        this.audio.isMusicOn = this.save.data.settings.music;
        e.target.classList.toggle('active', this.save.data.settings.music);
        e.target.textContent = this.save.data.settings.music ? 'ON' : 'OFF';
        if (this.save.data.settings.music && this.isPlayingRace) this.audio.startMusic();
        else this.audio.stopMusic();
        this.save.save();
      });

      document.getElementById('btn-toggle-sound')?.addEventListener('click', (e) => {
        this.audio.playClick();
        this.save.data.settings.sound = !this.save.data.settings.sound;
        this.audio.isSoundOn = this.save.data.settings.sound;
        e.target.classList.toggle('active', this.save.data.settings.sound);
        e.target.textContent = this.save.data.settings.sound ? 'ON' : 'OFF';
        this.save.save();
      });

      document.getElementById('btn-toggle-vibration')?.addEventListener('click', (e) => {
        this.audio.playClick();
        this.save.data.settings.vibration = !this.save.data.settings.vibration;
        e.target.classList.toggle('active', this.save.data.settings.vibration);
        e.target.textContent = this.save.data.settings.vibration ? 'ON' : 'OFF';
        this.save.save();
      });

      // Quality Selector
      document.querySelectorAll('#quality-selector .seg-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          this.audio.playClick();
          document.querySelectorAll('#quality-selector .seg-btn').forEach(b => b.classList.remove('active'));
          e.target.classList.add('active');
          this.save.data.settings.quality = e.target.dataset.quality;
          this.save.save();
          this.resizeCanvas();
        });
      });

      // Sensitivity
      const sensSlider = document.getElementById('steering-sens-slider');
      sensSlider?.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        const sensLabel = document.getElementById('steering-sens-val');
        if (sensLabel) sensLabel.textContent = `${val.toFixed(1)}x`;
        this.save.data.settings.sensitivity = val;
        this.save.save();
      });

      // Reset Save Data
      document.getElementById('btn-reset-save')?.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all 100 level progress, coins, and car upgrades? This cannot be undone.')) {
          this.save.reset();
          this.refreshAllUI();
          alert('Game progress has been reset.');
          this.showScreen('menu');
        }
      });

      // Fullscreen & Orientation Lock Button
      document.getElementById('btn-force-landscape')?.addEventListener('click', async () => {
        this.audio.playClick();
        try {
          if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
            await document.documentElement.requestFullscreen();
          }
          if (screen.orientation && screen.orientation.lock) {
            await screen.orientation.lock('landscape');
          }
        } catch (e) {
          console.warn('Orientation lock / fullscreen not allowed:', e);
        }
        const overlay = document.getElementById('rotate-screen-overlay');
        overlay?.classList.add('user-dismissed');
        overlay?.classList.add('hidden');
        setTimeout(() => this.resizeCanvas(), 200);
      });

      // Match media orientation change listener
      if (window.matchMedia) {
        try {
          const mql = window.matchMedia("(orientation: portrait)");
          mql.addEventListener('change', () => {
            this.checkOrientation();
            this.resizeCanvas();
          });
        } catch (e) {}
      }

      this.checkOrientation();
    }

    bindTouchButton(id, callback) {
      const btn = document.getElementById(id);
      if (!btn) return;
      const start = (e) => {
        if (e.cancelable) e.preventDefault();
        e.stopPropagation();
        this.audio.init();
        btn.classList.add('active');
        if (this.save.data.settings.vibration && navigator.vibrate) {
          navigator.vibrate(15);
        }
        callback(true);
      };
      const end = (e) => {
        if (e.cancelable) e.preventDefault();
        e.stopPropagation();
        btn.classList.remove('active');
        callback(false);
      };

      btn.addEventListener('pointerdown', start, { passive: false });
      btn.addEventListener('pointerup', end, { passive: false });
      btn.addEventListener('pointercancel', end, { passive: false });
      btn.addEventListener('pointerleave', end, { passive: false });
      btn.addEventListener('touchstart', start, { passive: false });
      btn.addEventListener('touchend', end, { passive: false });
      btn.addEventListener('touchcancel', end, { passive: false });
    }

    handleKeyEvent(code, isDown) {
      switch (code) {
        case 'ArrowLeft':
        case 'KeyA':
          this.keys.left = isDown;
          break;
        case 'ArrowRight':
        case 'KeyD':
          this.keys.right = isDown;
          break;
        case 'ArrowUp':
        case 'KeyW':
          this.keys.faster = isDown;
          break;
        case 'ArrowDown':
        case 'KeyS':
          this.keys.slower = isDown;
          break;
        case 'Space':
        case 'ShiftLeft':
        case 'ShiftRight':
          this.keys.nitro = isDown;
          break;
      }
    }

    checkOrientation() {
      const overlay = document.getElementById('rotate-screen-overlay');
      if (!overlay) return;
      const isPortrait = window.innerHeight > window.innerWidth;
      const isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth < 900);
      if (isMobile && isPortrait && !overlay.classList.contains('user-dismissed')) {
        overlay.classList.remove('hidden');
      } else {
        overlay.classList.add('hidden');
      }
    }

    resizeCanvas() {
      if (!this.canvas) return;
      const dpr = (this.save.data.settings.quality === 'low') ? 1 : Math.min(window.devicePixelRatio || 1, 2);
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.canvas.width = this.width * dpr;
      this.canvas.height = this.height * dpr;
      if (this.ctx) {
        this.ctx.scale(dpr, dpr);
      }
      this.cameraDepth = 1 / Math.tan((this.fieldOfView / 2) * Math.PI / 180);
    }

    applySavedSettings() {
      const s = this.save.data.settings;
      this.audio.isMusicOn = s.music;
      this.audio.isSoundOn = s.sound;
      document.getElementById('btn-toggle-music')?.classList.toggle('active', s.music);
      document.getElementById('btn-toggle-sound')?.classList.toggle('active', s.sound);
      document.getElementById('btn-toggle-vibration')?.classList.toggle('active', s.vibration);
      document.querySelectorAll('#quality-selector .seg-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.quality === s.quality);
      });
      const sensSlider = document.getElementById('steering-sens-slider');
      if (sensSlider) {
        sensSlider.value = s.sensitivity;
        const valLabel = document.getElementById('steering-sens-val');
        if (valLabel) valLabel.textContent = `${s.sensitivity.toFixed(1)}x`;
      }
    }

    /* ==========================================================================
       6. UI NAVIGATION & DYNAMIC SCREEN POPULATION
       ========================================================================== */

    showScreen(screenName) {
      Object.keys(this.screens).forEach(key => {
        if (this.screens[key]) {
          this.screens[key].classList.remove('active');
          this.screens[key].classList.add('hidden');
        }
      });
      if (this.screens[screenName]) {
        this.screens[screenName].classList.remove('hidden');
        this.screens[screenName].classList.add('active');
      }

      if (screenName === 'levels') this.renderLevelsScreen();
      if (screenName === 'garage') this.renderGarageScreen();
      if (screenName === 'upgrades') this.renderUpgradesScreen();
      if (screenName === 'characters') this.renderCharactersScreen();
      if (screenName === 'missions') this.renderMissionsScreen();
      if (screenName === 'leaderboard') this.renderLeaderboardScreen();
      if (screenName === 'menu') this.refreshAllUI();
    }

    refreshAllUI() {
      // Coins and stats in header
      const coinsFormatted = this.save.data.coins.toLocaleString();
      const coinsEl = document.getElementById('menu-coins-val');
      if (coinsEl) coinsEl.textContent = coinsFormatted;
      const xpEl = document.getElementById('menu-xp-val');
      if (xpEl) xpEl.textContent = `XP ${this.save.data.xp}`;
      const bestEl = document.getElementById('menu-best-score');
      if (bestEl) bestEl.textContent = `BEST: ${this.save.data.stats.highestScore.toLocaleString()}`;
      document.querySelectorAll('.global-coins-val').forEach(el => el.textContent = coinsFormatted);

      // Active Driver
      const curDriver = DRIVERS.find(d => d.id === this.save.data.selectedDriverId) || DRIVERS[0];
      const avatarEl = document.getElementById('menu-driver-avatar');
      if (avatarEl) avatarEl.textContent = curDriver.avatar;
      const nameEl = document.getElementById('menu-driver-name');
      if (nameEl) nameEl.textContent = curDriver.name;
      const titleEl = document.getElementById('menu-driver-title');
      if (titleEl) titleEl.textContent = curDriver.title;

      // Active Car in Hero
      const curCar = CARS.find(c => c.id === this.save.data.selectedCarId) || CARS[0];
      const heroCarName = document.getElementById('hero-car-name');
      if (heroCarName) heroCarName.textContent = curCar.name;
      const highestLevel = this.getHighestPlayableLevel();
      const raceLvlSub = document.getElementById('btn-race-lvl-sub');
      if (raceLvlSub) raceLvlSub.textContent = `LEVEL ${highestLevel}`;
      const levelsProgress = document.getElementById('nav-levels-progress');
      if (levelsProgress) levelsProgress.textContent = `${highestLevel} / 100`;

      // Stat mini bars
      const statSpeed = document.getElementById('hero-stat-speed');
      if (statSpeed) statSpeed.style.width = `${Math.min(100, (curCar.baseSpeed / 330) * 100)}%`;
      const statAcc = document.getElementById('hero-stat-acc');
      if (statAcc) statAcc.style.width = `${Math.min(100, (curCar.baseAcc / 10) * 100)}%`;
      const statNitro = document.getElementById('hero-stat-nitro');
      if (statNitro) statNitro.style.width = `${Math.min(100, (curCar.baseNitro / 10) * 100)}%`;
    }

    getHighestPlayableLevel() {
      let maxLvl = 1;
      for (let i = 1; i <= 100; i++) {
        if (this.save.data.levelProgress[i]?.unlocked) maxLvl = i;
      }
      return maxLvl;
    }

    getLevels() {
      if (typeof GAME_LEVELS !== 'undefined') return GAME_LEVELS;
      if (typeof window !== 'undefined' && window.GAME_LEVELS) return window.GAME_LEVELS;
      return [];
    }

    /* 100 Level Map View */
    renderLevelsScreen() {
      const container = document.getElementById('levels-grid-container');
      const tabsContainer = document.getElementById('zone-tabs-container');
      if (!container || !tabsContainer) return;

      container.innerHTML = '';
      tabsContainer.innerHTML = '';

      for (let z = 1; z <= 10; z++) {
        const startLvl = (z - 1) * 10 + 1;
        const endLvl = z * 10;
        const tabBtn = document.createElement('button');
        tabBtn.className = `zone-tab-btn ${z === 1 ? 'active' : ''}`;
        tabBtn.textContent = `Zone ${z} (${startLvl}-${endLvl})`;
        tabBtn.addEventListener('click', () => {
          this.audio.playClick();
          document.querySelectorAll('.zone-tab-btn').forEach(b => b.classList.remove('active'));
          tabBtn.classList.add('active');
          this.filterLevelsByZone(z);
        });
        tabsContainer.appendChild(tabBtn);
      }

      this.filterLevelsByZone(1);
    }

    filterLevelsByZone(zoneNum) {
      const container = document.getElementById('levels-grid-container');
      if (!container) return;
      container.innerHTML = '';
      const start = (zoneNum - 1) * 10 + 1;
      const end = zoneNum * 10;
      const allLevels = this.getLevels();

      for (let i = start; i <= end; i++) {
        const lvlData = allLevels[i - 1];
        if (!lvlData) continue;
        const pData = this.save.data.levelProgress[i] || { unlocked: i === 1, stars: 0 };
        const isCurrent = (i === this.getHighestPlayableLevel());

        const card = document.createElement('div');
        card.className = `level-node-card ${pData.unlocked ? '' : 'locked'} ${isCurrent ? 'current' : ''} ${lvlData.isBoss ? 'boss' : ''}`;

        if (!pData.unlocked) {
          card.innerHTML = `<span class="node-lock-icon">🔒</span><span class="node-num">${i}</span>`;
        } else {
          let starsHtml = '';
          for (let s = 1; s <= 3; s++) {
            starsHtml += (s <= pData.stars) ? '★' : '☆';
          }
          card.innerHTML = `
            <span class="node-num">${i}</span>
            <div class="node-stars">${starsHtml}</div>
            ${lvlData.isBoss ? '<span class="node-boss-tag">BOSS</span>' : ''}
          `;
          card.addEventListener('click', () => {
            this.audio.playClick();
            this.openLevelBriefing(i);
          });
        }
        container.appendChild(card);
      }
    }

    openLevelBriefing(lvlId) {
      this.currentLevelId = lvlId;
      const allLevels = this.getLevels();
      const lvl = allLevels[lvlId - 1];
      if (!lvl) {
        console.error('Level data not found for id:', lvlId);
        return;
      }

      const zoneTag = document.getElementById('brief-zone-tag');
      if (zoneTag) zoneTag.textContent = `ZONE ${lvl.zone}: ${lvl.environment.name.toUpperCase()}`;
      const diffTag = document.getElementById('brief-diff-tag');
      if (diffTag) diffTag.textContent = lvl.difficulty.toUpperCase();
      const titleEl = document.getElementById('brief-level-title');
      if (titleEl) titleEl.textContent = `Level ${lvl.id}: ${lvl.name}`;
      const envEl = document.getElementById('brief-env-name');
      if (envEl) envEl.textContent = `${lvl.environment.name} • ${lvl.weather.toUpperCase()}`;
      const mTitle = document.getElementById('brief-mission-title');
      if (mTitle) mTitle.textContent = lvl.targetLabel;
      const mDesc = document.getElementById('brief-mission-desc');
      if (mDesc) mDesc.textContent = lvl.missionDesc;
      const distEl = document.getElementById('brief-distance');
      if (distEl) distEl.textContent = `${lvl.distance.toLocaleString()} m`;
      const timeEl = document.getElementById('brief-time');
      if (timeEl) timeEl.textContent = `${lvl.timeLimit} s`;
      const scoreEl = document.getElementById('brief-score');
      if (scoreEl) scoreEl.textContent = `${lvl.targetScore.toLocaleString()} pts`;
      const coinsEl = document.getElementById('brief-reward-coins');
      if (coinsEl) coinsEl.textContent = lvl.rewardCoins;
      const xpEl = document.getElementById('brief-reward-xp');
      if (xpEl) xpEl.textContent = lvl.rewardXP;

      this.modals.briefing?.classList.remove('hidden');
    }

    /* Garage Showcase View */
    renderGarageScreen() {
      this.currentGarageCarId = this.save.data.selectedCarId;
      this.updateGarageView();
    }

    updateGarageView() {
      const car = CARS.find(c => c.id === this.currentGarageCarId) || CARS[0];
      const isOwned = this.save.data.unlockedCars.includes(car.id);
      const isEquipped = (this.save.data.selectedCarId === car.id);

      const nameEl = document.getElementById('garage-car-name');
      if (nameEl) nameEl.textContent = car.name;
      const badge = document.getElementById('garage-unlocked-badge');
      if (badge) {
        badge.textContent = isEquipped ? 'EQUIPPED' : (isOwned ? 'OWNED' : `UNLOCK: ${car.unlockCost.toLocaleString()} COINS`);
        badge.style.color = isEquipped ? '#00f0ff' : (isOwned ? '#00ff88' : '#ffaa00');
      }

      // Body paint
      const carBody = document.getElementById('garage-car-paint-body');
      if (carBody) {
        carBody.style.backgroundColor = isEquipped ? this.save.data.selectedCarColor : car.color;
      }

      // Color Palette
      const paletteContainer = document.getElementById('garage-color-options');
      if (paletteContainer) {
        paletteContainer.innerHTML = '';
        PAINT_COLORS.forEach(hex => {
          const dot = document.createElement('div');
          dot.className = `color-dot ${hex === this.save.data.selectedCarColor ? 'active' : ''}`;
          dot.style.backgroundColor = hex;
          dot.addEventListener('click', () => {
            this.audio.playClick();
            this.save.data.selectedCarColor = hex;
            this.save.save();
            if (carBody) carBody.style.backgroundColor = hex;
            document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
          });
          paletteContainer.appendChild(dot);
        });
      }

      // Performance specs with car upgrades applied
      const up = this.save.data.carUpgrades[car.id] || { engine: 1, turbo: 1, tires: 1, brakes: 1, handling: 1, nitro: 1, durability: 1 };
      const speedTotal = Math.round(car.baseSpeed + (up.engine - 1) * 15 + (up.turbo - 1) * 12);
      const accTotal = (car.baseAcc + (up.turbo - 1) * 0.4 + (up.engine - 1) * 0.3).toFixed(1);
      const handTotal = (car.baseHandling + (up.handling - 1) * 0.5 + (up.tires - 1) * 0.3).toFixed(1);
      const brakeTotal = (car.baseBraking + (up.brakes - 1) * 0.5).toFixed(1);
      const nitroTotal = (car.baseNitro + (up.nitro - 1) * 0.5).toFixed(1);
      const duraTotal = Math.round(car.baseHealth + (up.durability - 1) * 15);

      const spdVal = document.getElementById('spec-speed-val');
      if (spdVal) spdVal.textContent = `${speedTotal} km/h`;
      const spdFill = document.getElementById('spec-speed-fill');
      if (spdFill) spdFill.style.width = `${Math.min(100, (speedTotal / 380) * 100)}%`;

      const accVal = document.getElementById('spec-acc-val');
      if (accVal) accVal.textContent = `${accTotal}/10`;
      const accFill = document.getElementById('spec-acc-fill');
      if (accFill) accFill.style.width = `${Math.min(100, (accTotal / 12) * 100)}%`;

      const handVal = document.getElementById('spec-handling-val');
      if (handVal) handVal.textContent = `${handTotal}/10`;
      const handFill = document.getElementById('spec-handling-fill');
      if (handFill) handFill.style.width = `${Math.min(100, (handTotal / 12) * 100)}%`;

      const brkVal = document.getElementById('spec-braking-val');
      if (brkVal) brkVal.textContent = `${brakeTotal}/10`;
      const brkFill = document.getElementById('spec-braking-fill');
      if (brkFill) brkFill.style.width = `${Math.min(100, (brakeTotal / 12) * 100)}%`;

      const ntrVal = document.getElementById('spec-nitro-val');
      if (ntrVal) ntrVal.textContent = `${nitroTotal}/10`;
      const ntrFill = document.getElementById('spec-nitro-fill');
      if (ntrFill) ntrFill.style.width = `${Math.min(100, (nitroTotal / 12) * 100)}%`;

      const durVal = document.getElementById('spec-durability-val');
      if (durVal) durVal.textContent = `${duraTotal} HP`;
      const durFill = document.getElementById('spec-durability-fill');
      if (durFill) durFill.style.width = `${Math.min(100, (duraTotal / 220) * 100)}%`;

      // Equip / Purchase Action Button
      const actionBtn = document.getElementById('btn-garage-action');
      if (actionBtn) {
        if (isEquipped) {
          actionBtn.textContent = 'EQUIPPED (IN USE)';
          actionBtn.disabled = true;
        } else if (isOwned) {
          actionBtn.textContent = 'EQUIP THIS VEHICLE';
          actionBtn.disabled = false;
        } else {
          actionBtn.textContent = `UNLOCK FOR ${car.unlockCost.toLocaleString()} COINS`;
          actionBtn.disabled = (this.save.data.coins < car.unlockCost);
        }
      }

      // Fleet Carousel
      const listContainer = document.getElementById('garage-car-list');
      if (listContainer) {
        listContainer.innerHTML = '';
        CARS.forEach(c => {
          const thumb = document.createElement('div');
          const cOwned = this.save.data.unlockedCars.includes(c.id);
          thumb.className = `car-thumb-card ${c.id === this.currentGarageCarId ? 'active' : ''}`;
          thumb.innerHTML = `
            <span class="thumb-car-icon">${cOwned ? '🏎️' : '🔒'}</span>
            <span class="thumb-car-name">${c.name}</span>
          `;
          thumb.addEventListener('click', () => {
            this.audio.playClick();
            this.currentGarageCarId = c.id;
            this.updateGarageView();
          });
          listContainer.appendChild(thumb);
        });
      }
    }

    handleGarageAction() {
      const car = CARS.find(c => c.id === this.currentGarageCarId);
      if (!car) return;
      const isOwned = this.save.data.unlockedCars.includes(car.id);

      if (isOwned) {
        this.save.data.selectedCarId = car.id;
        this.save.save();
        this.updateGarageView();
        this.refreshAllUI();
      } else {
        if (this.save.data.coins >= car.unlockCost) {
          this.save.data.coins -= car.unlockCost;
          this.save.data.unlockedCars.push(car.id);
          this.save.data.selectedCarId = car.id;
          if (!this.save.data.carUpgrades[car.id]) {
            this.save.data.carUpgrades[car.id] = { engine: 1, turbo: 1, tires: 1, brakes: 1, handling: 1, nitro: 1, durability: 1 };
          }
          this.save.save();
          this.audio.playVictory();
          this.updateGarageView();
          this.refreshAllUI();
        } else {
          alert('Not enough coins to unlock this vehicle!');
        }
      }
    }

    /* Upgrades Screen */
    renderUpgradesScreen() {
      const container = document.getElementById('upgrades-parts-container');
      if (!container) return;
      container.innerHTML = '';

      const carId = this.save.data.selectedCarId;
      const car = CARS.find(c => c.id === carId) || CARS[0];
      if (!this.save.data.carUpgrades[carId]) {
        this.save.data.carUpgrades[carId] = { engine: 1, turbo: 1, tires: 1, brakes: 1, handling: 1, nitro: 1, durability: 1 };
      }
      const currentUpgrades = this.save.data.carUpgrades[carId];

      UPGRADE_PARTS.forEach(part => {
        const tier = currentUpgrades[part.id] || 1;
        const isMax = tier >= part.maxTier;
        const nextCost = Math.round(part.baseCost * Math.pow(1.8, tier - 1));

        const card = document.createElement('div');
        card.className = 'upgrade-part-card';

        let pipsHtml = '';
        for (let i = 1; i <= part.maxTier; i++) {
          pipsHtml += `<div class="tier-pip ${i <= tier ? 'filled' : ''}"></div>`;
        }

        card.innerHTML = `
          <div class="upgrade-part-header">
            <span class="part-icon">${part.icon}</span>
            <div class="part-title-box">
              <div class="part-title">${part.name}</div>
              <div class="part-level-badge">LEVEL ${tier} / ${part.maxTier}</div>
            </div>
          </div>
          <div class="upgrade-tiers">${pipsHtml}</div>
          <div class="part-stat-preview">
            <span>${part.stat}</span>
            <span class="stat-gain">${isMax ? 'MAXED OUT' : `+15% Performance`}</span>
          </div>
          <button class="btn-buy-upgrade" ${isMax || this.save.data.coins < nextCost ? 'disabled' : ''}>
            ${isMax ? 'FULLY TUNED' : `UPGRADE • 🪙 ${nextCost.toLocaleString()}`}
          </button>
        `;

        const buyBtn = card.querySelector('.btn-buy-upgrade');
        if (!isMax && buyBtn) {
          buyBtn.addEventListener('click', () => {
            this.audio.playClick();
            if (this.save.data.coins >= nextCost) {
              this.save.data.coins -= nextCost;
              currentUpgrades[part.id] = tier + 1;
              this.save.save();
              this.audio.playVictory();
              this.renderUpgradesScreen();
              this.refreshAllUI();
            }
          });
        }
        container.appendChild(card);
      });
    }

    /* Drivers Roster */
    renderCharactersScreen() {
      const container = document.getElementById('characters-roster-container');
      if (!container) return;
      container.innerHTML = '';

      DRIVERS.forEach(driver => {
        const isUnlocked = this.save.data.unlockedDrivers.includes(driver.id) || (this.getHighestPlayableLevel() >= driver.unlockLevel);
        const isSelected = (this.save.data.selectedDriverId === driver.id);

        if (isUnlocked && !this.save.data.unlockedDrivers.includes(driver.id)) {
          this.save.data.unlockedDrivers.push(driver.id);
          this.save.save();
        }

        const card = document.createElement('div');
        card.className = `character-card ${isSelected ? 'selected' : ''}`;
        card.innerHTML = `
          <div class="char-header">
            <div class="char-avatar">${driver.avatar}</div>
            <div>
              <div class="char-name">${driver.name}</div>
              <div class="char-trait">${driver.title}</div>
            </div>
          </div>
          <div class="char-ability-box">
            <div class="char-ability-name">⚡ ${driver.ability}</div>
            <p>${driver.desc}</p>
          </div>
          <button class="btn-secondary btn-char-select" ${!isUnlocked || isSelected ? 'disabled' : ''}>
            ${isSelected ? 'CURRENT DRIVER' : (isUnlocked ? 'SELECT DRIVER' : `UNLOCKS AT LEVEL ${driver.unlockLevel}`)}
          </button>
        `;

        if (isUnlocked && !isSelected) {
          card.querySelector('.btn-char-select')?.addEventListener('click', () => {
            this.audio.playClick();
            this.save.data.selectedDriverId = driver.id;
            this.save.save();
            this.renderCharactersScreen();
            this.refreshAllUI();
          });
        }

        container.appendChild(card);
      });
    }

    /* Missions View */
    renderMissionsScreen() {
      const container = document.getElementById('missions-list-container');
      if (!container) return;
      container.innerHTML = '';

      CAREER_MISSIONS.forEach(mission => {
        const curProgress = this.save.data.stats[mission.key] || 0;
        const isClaimed = !!this.save.data.claimedMissions[mission.id];
        const isComplete = curProgress >= mission.target;
        const pct = Math.min(100, Math.round((curProgress / mission.target) * 100));

        const card = document.createElement('div');
        card.className = 'mission-item-card glass-panel';
        card.innerHTML = `
          <div class="mission-details">
            <div class="m-title">${mission.title}</div>
            <div class="m-desc">${mission.desc}</div>
            <div class="m-progress-bar">
              <div class="m-progress-fill" style="width: ${pct}%;"></div>
            </div>
          </div>
          <div>
            <button class="btn-primary-action btn-claim-mission" ${isClaimed || !isComplete ? 'disabled' : ''}>
              ${isClaimed ? 'CLAIMED' : (isComplete ? 'CLAIM REWARD' : `${curProgress}/${mission.target}`)}
            </button>
          </div>
        `;

        const btn = card.querySelector('.btn-claim-mission');
        if (isComplete && !isClaimed && btn) {
          btn.addEventListener('click', () => {
            this.audio.playClick();
            this.save.data.claimedMissions[mission.id] = true;
            this.save.data.coins += mission.rewardCoins;
            this.save.data.xp += mission.rewardXP;
            this.save.save();
            this.audio.playVictory();
            this.renderMissionsScreen();
            this.refreshAllUI();
          });
        }

        container.appendChild(card);
      });
    }

    /* Local Leaderboard View */
    renderLeaderboardScreen() {
      const container = document.getElementById('leaderboard-rows-container');
      if (!container) return;
      container.innerHTML = '';

      const list = [...this.save.data.leaderboard];
      if (this.save.data.stats.highestScore > 0) {
        list.push({
          rank: '-',
          name: 'YOU (PLAYER)',
          car: (CARS.find(c => c.id === this.save.data.selectedCarId) || CARS[0]).name,
          level: this.getHighestPlayableLevel(),
          score: this.save.data.stats.highestScore,
          isPlayer: true
        });
      }

      list.sort((a, b) => b.score - a.score);

      list.slice(0, 10).forEach((entry, idx) => {
        const row = document.createElement('div');
        row.className = `leaderboard-row ${entry.isPlayer ? 'my-row' : ''}`;
        row.innerHTML = `
          <span class="col-rank">#${idx + 1}</span>
          <span class="col-driver">${entry.name}</span>
          <span class="col-car">${entry.car}</span>
          <span class="col-level">LVL ${entry.level}</span>
          <span class="col-score">${entry.score.toLocaleString()}</span>
        `;
        container.appendChild(row);
      });
    }

    /* ==========================================================================
       7. TRACK BUILDER & PROCEDURAL GENERATION
       ========================================================================== */

    buildTrack(levelConfig) {
      this.segments = [];
      const env = levelConfig.environment || (typeof ENVIRONMENTS !== 'undefined' ? ENVIRONMENTS.CITY : null) || {
        roadColor: '#2b2d42',
        groundColor: '#1a1d20',
        curbColor1: '#ef233c',
        curbColor2: '#edf2f4',
        sceneryType: 'city',
        id: 'city'
      };

      // Realistic segment count scaled to level distance (550 - 1500 segments)
      const distanceMeters = Number(levelConfig.distance) || 2200;
      const numSegments = Math.max(350, Math.floor(distanceMeters / 4));
      this.trackLength = numSegments * this.segmentLength;

      let curY = 0;
      let curCurve = 0;

      for (let n = 0; n < numSegments; n++) {
        const segment = new Segment(n);
        segment.p1.world.z = n * this.segmentLength;
        segment.p2.world.z = (n + 1) * this.segmentLength;

        if (n > 25 && n < numSegments - 30) {
          if (n % 40 === 0) {
            curCurve = (Math.sin(n / 25) * 3.5);
            curY = (Math.sin(n / 35) * 800);
          }
        } else {
          curCurve = 0;
          curY = 0;
        }

        segment.p1.world.y = curY;
        segment.p2.world.y = curY;
        segment.curve = curCurve;

        const isRumble = Math.floor(n / this.rumbleLength) % 2 === 0;
        segment.color.road = env.roadColor;
        segment.color.grass = env.groundColor;
        segment.color.rumble = isRumble ? env.curbColor1 : env.curbColor2;
        segment.color.lane = (Math.floor(n / 2) % 2 === 0) ? '#ffffff' : env.roadColor;

        if (n > 50 && n % 80 === 0 && n < numSegments - 40) {
          segment.isCheckpoint = true;
        }

        if (n === numSegments - 1) {
          segment.isFinish = true;
        }

        if (n % 5 === 0) {
          const side = (n % 10 === 0) ? -1 : 1;
          const offset = side * (1.6 + Math.random() * 0.9);
          segment.sprites.push({
            type: env.sceneryType,
            offset: offset,
            scale: 1.0 + Math.random() * 0.4
          });
        }

        if (env.id === 'tunnel' && n > 30 && n < numSegments - 25) {
          segment.isTunnel = true;
        }

        if (n > 15 && n % 12 === 0 && Math.random() > 0.25) {
          segment.coins.push({
            lane: (Math.floor(Math.random() * 3) - 1) * 0.6,
            collected: false
          });
        }

        this.segments.push(segment);
      }

      this.trafficCars = [];
      const density = Number(levelConfig.trafficDensity) || 1.0;
      const trafficCount = Math.max(12, Math.floor(numSegments * 0.04 * density));
      for (let i = 0; i < trafficCount; i++) {
        const segIdx = 25 + Math.floor(Math.random() * (numSegments - 55));
        const laneChoice = [-0.65, 0, 0.65][Math.floor(Math.random() * 3)];
        const carTypeIdx = Math.floor(Math.random() * CARS.length);
        const trafficSpeed = 90 + Math.random() * 80;

        this.trafficCars.push({
          segmentIndex: segIdx,
          z: segIdx * this.segmentLength,
          offset: laneChoice,
          targetOffset: laneChoice,
          speed: trafficSpeed,
          carType: CARS[carTypeIdx],
          color: PAINT_COLORS[Math.floor(Math.random() * PAINT_COLORS.length)],
          overtaken: false
        });
      }
    }

    findSegment(z) {
      if (!this.segments || this.segments.length === 0) return null;
      return this.segments[Math.floor(z / this.segmentLength) % this.segments.length];
    }

    /* ==========================================================================
       8. RACE SESSION MANAGEMENT & LOOP
       ========================================================================== */

    startRace(levelId) {
      const targetId = Number(levelId) || 1;
      this.currentLevelId = targetId;
      const allLevels = this.getLevels();
      this.currentLevel = allLevels[targetId - 1] || allLevels[0];
      if (!this.currentLevel) {
        console.error('Level data missing for ID:', targetId);
        return;
      }

      const car = CARS.find(c => c.id === this.save.data.selectedCarId) || CARS[0];
      const up = this.save.data.carUpgrades[car.id] || { engine: 1, turbo: 1, tires: 1, brakes: 1, handling: 1, nitro: 1, durability: 1 };
      const driver = DRIVERS.find(d => d.id === this.save.data.selectedDriverId) || DRIVERS[0];

      let topSpeed = car.baseSpeed + (up.engine - 1) * 15 + (up.turbo - 1) * 12;
      let accelRate = car.baseAcc + (up.turbo - 1) * 0.4 + (up.engine - 1) * 0.3;
      let maxHealth = car.baseHealth + (up.durability - 1) * 15;

      if (driver.bonus.topSpeed) topSpeed *= driver.bonus.topSpeed;
      if (driver.bonus.acc) accelRate *= driver.bonus.acc;
      if (driver.bonus.armor) maxHealth *= driver.bonus.armor;

      this.maxSpeed = topSpeed;
      this.accelerationFactor = accelRate;
      this.maxHealth = maxHealth;
      this.health = maxHealth;
      this.nitro = 100;
      this.speed = 40; // Immediate rolling start for responsive game feel
      this.position = 0;
      this.playerX = 0;

      this.raceScore = 0;
      this.raceCoins = 0;
      this.raceOvertakes = 0;
      this.raceNearMisses = 0;
      this.raceTimeRemaining = this.currentLevel.timeLimit;
      this.raceElapsedTime = 0;
      this.comboMultiplier = 1;
      this.comboTimer = 0;
      this.isGameOver = false;
      this.isVictory = false;
      this.isPaused = false;

      // Ensure canvas matches screen dimensions
      this.resizeCanvas();

      // Build 3D Track
      this.buildTrack(this.currentLevel);

      // Setup HUD
      this.hudOverlay?.classList.remove('hidden');
      const lvlBadge = document.getElementById('hud-level-badge');
      if (lvlBadge) lvlBadge.textContent = `LVL ${this.currentLevel.id}`;
      const objText = document.getElementById('hud-objective-text');
      if (objText) objText.innerHTML = `${this.currentLevel.targetLabel}: <span id="hud-objective-val">0</span>`;

      // Hide all UI screens
      Object.keys(this.screens).forEach(key => {
        if (this.screens[key]) {
          this.screens[key].classList.add('hidden');
          this.screens[key].classList.remove('active');
        }
      });

      // Start in COUNTDOWN state on the grid
      this.gameState = 'COUNTDOWN';
      this.speed = 0;
      this.isPlayingRace = true;
      this.lastFrameTime = getNow();
      this.updateDebugBar();

      // Countdown visual animation
      const countdownEl = document.getElementById('hud-countdown-overlay');
      const countdownText = document.getElementById('countdown-text');
      if (countdownEl && countdownText) {
        countdownEl.classList.remove('hidden');
        countdownText.textContent = '3';
        this.audio.playTone(440, 'triangle', 0.15, 0.25);

        setTimeout(() => {
          if (!this.isPlayingRace) return;
          countdownText.textContent = '2';
          this.audio.playTone(440, 'triangle', 0.15, 0.25);
        }, 550);

        setTimeout(() => {
          if (!this.isPlayingRace) return;
          countdownText.textContent = '1';
          this.audio.playTone(440, 'triangle', 0.15, 0.25);
        }, 1100);

        setTimeout(() => {
          if (!this.isPlayingRace) return;
          countdownText.textContent = 'GO!';
          this.audio.playTone(880, 'sine', 0.3, 0.35);
          this.gameState = 'RACING';
          this.speed = 45; // Smooth initial roll
          this.updateDebugBar();
          setTimeout(() => {
            countdownEl.classList.add('hidden');
          }, 500);
        }, 1650);
      } else {
        this.gameState = 'RACING';
        this.speed = 45;
        this.updateDebugBar();
      }

      // Audio
      if (this.save.data.settings.music) this.audio.startMusic();
    }

    endRaceSession() {
      this.isPlayingRace = false;
      this.audio.stopEngine();
      this.audio.stopMusic();
      this.hudOverlay?.classList.add('hidden');
      document.getElementById('hud-countdown-overlay')?.classList.add('hidden');
    }

    togglePause() {
      if (!this.isPlayingRace || this.isGameOver || this.isVictory) return;
      this.isPaused = !this.isPaused;
      if (this.isPaused) {
        this.audio.stopEngine();
        this.modals.pause?.classList.remove('hidden');
        const pauseLvlText = document.getElementById('pause-level-text');
        if (pauseLvlText && this.currentLevel) {
          pauseLvlText.textContent = `Level ${this.currentLevel.id} • ${this.currentLevel.name}`;
        }
      } else {
        this.modals.pause?.classList.add('hidden');
        this.lastFrameTime = getNow();
      }
    }

    /* ==========================================================================
       MAIN CONTINUOUS REQUESTANIMATIONFRAME LOOP
       ========================================================================== */

    startMainLoop() {
      if (this.mainLoopRunning) return;
      this.mainLoopRunning = true;
      this.lastFrameTime = getNow();

      const loop = (now) => {
        try {
          const currentTimestamp = now || getNow();
          const dt = Math.min(0.1, (currentTimestamp - (this.lastFrameTime || currentTimestamp)) / 1000);
          this.lastFrameTime = currentTimestamp;

          if (this.isPlayingRace && !this.isPaused && !this.isGameOver && !this.isVictory) {
            this.update(dt);
            this.render();
          } else if (!this.isPlayingRace) {
            this.renderMenuBackground(dt);
          }
        } catch (err) {
          console.error('Car Rush mainLoop frame error:', err);
        }

        requestAnimationFrame(loop);
      };

      requestAnimationFrame(loop);
    }

    /* ==========================================================================
       9. PHYSICS, TRAFFIC & COLLISION UPDATE
       ========================================================================== */

    update(dt) {
      if (this.gameState === 'COUNTDOWN') {
        this.speed = 0;
        this.updateHUD();
        this.updateDebugBar();
        return;
      }

      const driver = DRIVERS.find(d => d.id === this.save.data.selectedDriverId) || DRIVERS[0];
      const sens = this.save.data.settings.sensitivity || 1.0;

      // Handle Acceleration & Nitro
      let targetMaxSpeed = this.maxSpeed;
      if (this.keys.nitro && this.nitro > 0) {
        this.isNitroActive = true;
        targetMaxSpeed *= 1.35;
        const burnRate = 25 / (driver.bonus.nitroEfficiency || 1.0);
        this.nitro = Math.max(0, this.nitro - burnRate * dt);
        this.audio.playNitro();
        this.save.data.stats.totalNitroBurns++;
      } else {
        this.isNitroActive = false;
        this.nitro = Math.min(100, this.nitro + 3.0 * dt);
      }

      const accel = (targetMaxSpeed / 5.0) * (this.accelerationFactor / 7.0);
      const decel = -targetMaxSpeed / 3.0;

      if (this.keys.faster) {
        this.speed = Math.min(targetMaxSpeed, this.speed + accel * dt * 1.5);
      } else if (this.keys.slower) {
        this.speed = Math.max(0, this.speed + decel * dt * 2.2);
      } else {
        // Natural arcade cruising at 60% speed when no pedals held
        const cruiseSpeed = targetMaxSpeed * 0.6;
        if (this.speed < cruiseSpeed) {
          this.speed = Math.min(cruiseSpeed, this.speed + accel * dt * 0.85);
        } else {
          this.speed = Math.max(cruiseSpeed, this.speed - (targetMaxSpeed / 8.0) * dt);
        }
      }

      const playerSegment = this.findSegment(this.position + 1000);
      const speedRatio = this.speed / this.maxSpeed;
      const turnAgility = 2.4 * sens * (driver.bonus.handling || 1.0);

      if (this.keys.left) {
        this.playerSteer = Math.max(-1, (this.playerSteer || 0) - 7.0 * dt);
        this.playerX -= turnAgility * dt * (0.4 + speedRatio * 0.6);
      } else if (this.keys.right) {
        this.playerSteer = Math.min(1, (this.playerSteer || 0) + 7.0 * dt);
        this.playerX += turnAgility * dt * (0.4 + speedRatio * 0.6);
      } else {
        this.playerSteer = (this.playerSteer || 0) * Math.max(0, 1 - 8.0 * dt);
      }

      if (playerSegment) {
        this.playerX -= (playerSegment.curve * speedRatio * 0.015);
      }

      if (Math.abs(this.playerX) > 1.05) {
        this.speed = Math.max(0, this.speed - (this.maxSpeed * 0.6) * dt);
        this.playerX = Math.max(-1.8, Math.min(1.8, this.playerX));
      }

      const moveDistance = (this.speed * 25) * dt;
      this.position += moveDistance;
      this.save.data.stats.totalDistance += Math.round(moveDistance / 10);

      this.audio.playEngine(speedRatio);

      this.raceElapsedTime += dt;
      this.raceTimeRemaining = Math.max(0, this.raceTimeRemaining - dt);
      this.raceScore += Math.round(this.speed * dt * 0.8 * this.comboMultiplier);

      if (this.comboTimer > 0) {
        this.comboTimer -= dt;
        if (this.comboTimer <= 0) {
          this.comboMultiplier = 1;
        }
      }

      if (playerSegment && playerSegment.coins && playerSegment.coins.length > 0) {
        playerSegment.coins.forEach(c => {
          if (!c.collected && Math.abs(this.playerX - c.lane) < 0.45) {
            c.collected = true;
            this.raceCoins += 10;
            this.save.data.coins += 10;
            this.save.data.stats.totalCoinsCollected++;
            this.addScorePopup('+10 COIN', false);
            this.audio.playCoin();
          }
        });
      }

      if (playerSegment && playerSegment.isCheckpoint && !playerSegment.checkpointPassed) {
        playerSegment.checkpointPassed = true;
        this.raceScore += 500 * this.comboMultiplier;
        this.raceTimeRemaining += 15;
        this.addScorePopup('+500 CHECKPOINT!', false);
        this.audio.playCheckpoint();
      }

      this.updateTraffic(dt, playerSegment);
      this.updateHUD();
      this.checkRaceConditions();
    }

    updateTraffic(dt, playerSegment) {
      const driver = DRIVERS.find(d => d.id === this.save.data.selectedDriverId) || DRIVERS[0];

      this.trafficCars.forEach(car => {
        car.z += car.speed * 20 * dt;
        if (car.z >= this.trackLength) car.z -= this.trackLength;

        if (Math.random() < 0.005) {
          car.targetOffset = [-0.65, 0, 0.65][Math.floor(Math.random() * 3)];
        }
        car.offset += (car.targetOffset - car.offset) * 2.0 * dt;

        const relZ = car.z - this.position;
        if (relZ < 0 && relZ > -250 && !car.overtaken) {
          car.overtaken = true;
          this.raceOvertakes++;
          this.save.data.stats.totalOvertakes++;
          this.incrementCombo();
          this.addScorePopup('+150 OVERTAKE', false);
        }

        if (Math.abs(relZ) < 160) {
          const latDist = Math.abs(this.playerX - car.offset);
          if (latDist < 0.38) {
            this.handleCollision(car, driver);
          } else if (latDist < 0.65 && !car.nearMissed && this.speed > 140) {
            car.nearMissed = true;
            this.raceNearMisses++;
            this.save.data.stats.totalNearMisses++;
            this.nitro = Math.min(100, this.nitro + (18 * (driver.bonus.nitroRecharge || 1.0)));
            this.incrementCombo();
            this.addScorePopup('+300 NEAR MISS!', true);
            this.audio.playTone(800, 'sawtooth', 0.1, 0.15);
          }
        }
      });
    }

    handleCollision(car, driver) {
      this.audio.playCrash();
      if (this.save.data.settings.vibration && navigator.vibrate) {
        navigator.vibrate([60, 40, 60]);
      }

      const baseDamage = 22;
      const damage = baseDamage * (driver.bonus.armor ? 1 / driver.bonus.armor : 1.0);
      this.health = Math.max(0, this.health - damage);
      this.speed = Math.max(30, this.speed * 0.4);

      if (this.playerX < car.offset) {
        this.playerX -= 0.3;
        car.offset += 0.3;
      } else {
        this.playerX += 0.3;
        car.offset -= 0.3;
      }

      this.comboMultiplier = 1;
      this.comboTimer = 0;
      this.addScorePopup('CRASH! -HP', true);
    }

    incrementCombo() {
      this.comboMultiplier = Math.min(5, this.comboMultiplier + 1);
      this.comboTimer = 3.5;
    }

    addScorePopup(text, isNearMiss = false) {
      if (!this.hudPopupsContainer || typeof this.hudPopupsContainer.appendChild !== 'function') return;
      try {
        const popup = document.createElement('div');
        popup.className = `score-float-item ${isNearMiss ? 'near-miss' : ''}`;
        popup.textContent = text;
        this.hudPopupsContainer.appendChild(popup);
        setTimeout(() => {
          if (typeof popup.remove === 'function') {
            popup.remove();
          } else if (popup.parentNode) {
            popup.parentNode.removeChild(popup);
          }
        }, 800);
      } catch (e) {}
    }

    updateHUD() {
      if (this.hudSpeedNum) this.hudSpeedNum.textContent = Math.round(this.speed);
      const hpPct = Math.round((this.health / this.maxHealth) * 100);
      if (this.hudHealthFill) this.hudHealthFill.style.width = `${hpPct}%`;
      if (this.hudHealthPct) this.hudHealthPct.textContent = `${hpPct}%`;

      const nitroPct = Math.round(this.nitro);
      if (this.hudNitroFill) this.hudNitroFill.style.width = `${nitroPct}%`;
      if (this.hudNitroPct) this.hudNitroPct.textContent = `${nitroPct}%`;

      if (this.hudScoreVal) this.hudScoreVal.textContent = this.raceScore.toLocaleString();
      if (this.hudCoinsVal) this.hudCoinsVal.textContent = this.raceCoins;
      if (this.hudTimerVal) this.hudTimerVal.textContent = this.raceTimeRemaining.toFixed(1);

      let currentObjVal = 0;
      const targetReq = this.currentLevel.targetRequirement;
      switch (this.currentLevel.missionKey) {
        case 'OVERTAKE': currentObjVal = this.raceOvertakes; break;
        case 'COINS': currentObjVal = this.raceCoins; break;
        case 'SPEED': currentObjVal = Math.round(this.speed); break;
        case 'NEAR_MISS': currentObjVal = this.raceNearMisses; break;
        case 'SURVIVAL': currentObjVal = hpPct; break;
        default: currentObjVal = Math.round(this.position); break;
      }

      const objPct = Math.min(100, Math.round((currentObjVal / targetReq) * 100));
      if (this.hudObjectiveVal) this.hudObjectiveVal.textContent = `${currentObjVal}/${targetReq}`;
      if (this.hudObjectiveBar) this.hudObjectiveBar.style.width = `${objPct}%`;

      if (this.comboMultiplier > 1) {
        this.hudComboBadge?.classList.remove('hidden');
        if (this.hudComboBadge) this.hudComboBadge.textContent = `x${this.comboMultiplier} COMBO!`;
      } else {
        this.hudComboBadge?.classList.add('hidden');
      }

      const trackPct = Math.min(100, Math.max(0, (this.position / this.trackLength) * 100));
      if (this.hudPosMarker) this.hudPosMarker.style.left = `${trackPct}%`;
    }

    checkRaceConditions() {
      if (this.health <= 0) {
        this.triggerGameOver('Your vehicle sustained critical collision damage!');
        return;
      }

      if (this.raceTimeRemaining <= 0) {
        this.triggerGameOver('Time limit expired before reaching the finish line!');
        return;
      }

      if (this.position >= this.trackLength) {
        this.triggerLevelVictory();
      }
    }

    triggerGameOver(reason) {
      this.isGameOver = true;
      this.endRaceSession();
      this.audio.playCrash();

      const headline = document.getElementById('defeat-headline');
      if (headline) headline.textContent = 'RACE FAILED';
      const reasonEl = document.getElementById('defeat-reason-text');
      if (reasonEl) reasonEl.textContent = reason;
      const distEl = document.getElementById('defeat-distance');
      if (distEl) distEl.textContent = `${Math.round(this.position).toLocaleString()} m`;
      const scoreEl = document.getElementById('defeat-score');
      if (scoreEl) scoreEl.textContent = this.raceScore.toLocaleString();

      this.modals.gameover?.classList.remove('hidden');
    }

    triggerLevelVictory() {
      this.isVictory = true;
      this.endRaceSession();
      this.audio.playVictory();

      let stars = 1;
      if (this.raceScore >= this.currentLevel.targetScore * 0.75) stars = 2;
      if (this.raceScore >= this.currentLevel.targetScore && this.health >= this.maxHealth * 0.6) stars = 3;

      const lvlId = this.currentLevel.id;
      if (!this.save.data.levelProgress[lvlId]) {
        this.save.data.levelProgress[lvlId] = { unlocked: true, stars: 0, bestScore: 0, bestTime: 0 };
      }
      const p = this.save.data.levelProgress[lvlId];
      p.stars = Math.max(p.stars, stars);
      p.bestScore = Math.max(p.bestScore, this.raceScore);
      p.bestTime = (p.bestTime === 0) ? this.raceElapsedTime : Math.min(p.bestTime, this.raceElapsedTime);

      if (lvlId < 100) {
        if (!this.save.data.levelProgress[lvlId + 1]) {
          this.save.data.levelProgress[lvlId + 1] = { unlocked: true, stars: 0, bestScore: 0, bestTime: 0 };
        } else {
          this.save.data.levelProgress[lvlId + 1].unlocked = true;
        }
      }

      this.save.data.coins += this.currentLevel.rewardCoins;
      this.save.data.xp += this.currentLevel.rewardXP;
      if (this.raceScore > this.save.data.stats.highestScore) {
        this.save.data.stats.highestScore = this.raceScore;
      }
      if (stars === 3) this.save.data.stats.threeStarCount++;
      this.save.save();

      const completeHeadline = document.getElementById('complete-headline');
      if (completeHeadline) {
        completeHeadline.textContent = (lvlId === 100) ? 'CHAMPIONSHIP COMPLETE!' : 'LEVEL COMPLETE!';
      }

      const starContainer = document.getElementById('complete-stars-container');
      if (starContainer) {
        starContainer.innerHTML = '';
        for (let s = 1; s <= 3; s++) {
          starContainer.innerHTML += `<span class="result-star ${s <= stars ? 'active' : ''}">★</span>`;
        }
      }

      const compScore = document.getElementById('complete-score');
      if (compScore) compScore.textContent = this.raceScore.toLocaleString();
      const compTime = document.getElementById('complete-time');
      if (compTime) compTime.textContent = `${this.raceElapsedTime.toFixed(1)}s`;
      const compOver = document.getElementById('complete-overtakes');
      if (compOver) compOver.textContent = this.raceOvertakes;
      const compNear = document.getElementById('complete-near-misses');
      if (compNear) compNear.textContent = this.raceNearMisses;
      const compCoins = document.getElementById('complete-coins-earned');
      if (compCoins) compCoins.textContent = `+${this.currentLevel.rewardCoins} Coins`;
      const compXp = document.getElementById('complete-xp-earned');
      if (compXp) compXp.textContent = `+${this.currentLevel.rewardXP} XP`;

      const grandBanner = document.getElementById('champ-grand-banner');
      if (grandBanner) {
        if (lvlId === 100) grandBanner.classList.remove('hidden');
        else grandBanner.classList.add('hidden');
      }

      this.modals.complete?.classList.remove('hidden');
    }

    /* ==========================================================================
       10. PSEUDO-3D PROJECTION & CANVAS RENDERING
       ========================================================================== */

    render() {
      if (!this.ctx) return;
      const ctx = this.ctx;
      const width = this.width;
      const height = this.height;
      const env = this.currentLevel ? this.currentLevel.environment : {
        skyColor: '#0b132b',
        horizonColor: '#1c2541',
        groundColor: '#1a1d20',
        roadColor: '#2b2d42',
        hasBuildings: true,
        sceneryType: 'city'
      };

      // 1. Sky & Horizon Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height / 2);
      skyGrad.addColorStop(0, env.skyColor);
      skyGrad.addColorStop(1, env.horizonColor);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height / 2);

      // 2. Horizon Skyline / Mountains / Dunes
      this.renderHorizonScenery(ctx, env, width, height);

      // 3. Ground
      ctx.fillStyle = env.groundColor;
      ctx.fillRect(0, height / 2, width, height / 2);

      if (!this.segments || this.segments.length === 0) return;

      // 4. Render 3D Road Segments
      const baseSegment = this.findSegment(this.position) || this.segments[0];
      const basePercent = (this.position % this.segmentLength) / this.segmentLength;
      let maxY = height;
      let x = 0;
      let dx = - (baseSegment.curve * basePercent);

      for (let n = 0; n < this.drawDistance; n++) {
        const segment = this.segments[(baseSegment.index + n) % this.segments.length];
        const loopZ = (segment.index < baseSegment.index) ? this.trackLength : 0;

        this.project(segment.p1, (this.playerX * this.roadWidth) - x, this.cameraHeight, this.position - loopZ, width, height);
        this.project(segment.p2, (this.playerX * this.roadWidth) - x - dx, this.cameraHeight, this.position - loopZ, width, height);

        x += dx;
        dx += segment.curve;

        if (segment.p1.camera.z <= this.cameraDepth || segment.p2.screen.y >= maxY || segment.p2.screen.y >= segment.p1.screen.y) {
          continue;
        }

        this.renderRoadSegment(ctx, width, segment, maxY);
        maxY = segment.p1.screen.y;
      }

      // 5. Render Sprites, Checkpoint Arches, Coins
      for (let n = this.drawDistance - 1; n > 0; n--) {
        const segment = this.segments[(baseSegment.index + n) % this.segments.length];

        for (let s = 0; s < segment.sprites.length; s++) {
          const sprite = segment.sprites[s];
          this.renderScenerySprite(ctx, segment, sprite, width, height);
        }

        if (segment.isCheckpoint || segment.isFinish) {
          this.renderGateArch(ctx, segment, segment.isFinish, width);
        }

        if (segment.coins) {
          for (let c = 0; c < segment.coins.length; c++) {
            if (!segment.coins[c].collected) {
              this.renderCoin(ctx, segment, segment.coins[c], width);
            }
          }
        }
      }

      // 6. Traffic
      this.renderTrafficVehicles(ctx, width, height);

      // 7. Player Car
      this.renderPlayerCar(ctx, width, height);

      // 8. Weather
      this.renderWeatherParticles(ctx, width, height);
    }

    renderMenuBackground(dt) {
      if (!this.ctx) return;
      const ctx = this.ctx;
      const width = this.width;
      const height = this.height;

      this.menuPosition = (this.menuPosition || 0) + 1400 * dt;

      if (!this.menuSegments || this.menuSegments.length === 0) {
        this.menuSegments = [];
        for (let n = 0; n < 180; n++) {
          const seg = new Segment(n);
          seg.p1.world.z = n * this.segmentLength;
          seg.p2.world.z = (n + 1) * this.segmentLength;
          seg.p1.world.y = Math.sin(n / 20) * 350;
          seg.p2.world.y = Math.sin((n + 1) / 20) * 350;
          seg.curve = Math.sin(n / 18) * 1.8;
          const isRumble = Math.floor(n / this.rumbleLength) % 2 === 0;
          seg.color.road = '#2b2d42';
          seg.color.grass = '#1a1d20';
          seg.color.rumble = isRumble ? '#ff0055' : '#00f0ff';
          seg.color.lane = (Math.floor(n / 2) % 2 === 0) ? '#ffffff' : '#2b2d42';
          this.menuSegments.push(seg);
        }
      }

      // Sky & Horizon
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height / 2);
      skyGrad.addColorStop(0, '#0b132b');
      skyGrad.addColorStop(1, '#1c2541');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height / 2);

      this.renderHorizonScenery(ctx, { hasBuildings: true, sceneryType: 'city' }, width, height);

      ctx.fillStyle = '#1a1d20';
      ctx.fillRect(0, height / 2, width, height / 2);

      const menuTrackLen = this.menuSegments.length * this.segmentLength;
      const baseSegIdx = Math.floor(this.menuPosition / this.segmentLength) % this.menuSegments.length;
      const baseSegment = this.menuSegments[baseSegIdx];
      const basePercent = (this.menuPosition % this.segmentLength) / this.segmentLength;
      let maxY = height;
      let x = 0;
      let dx = -(baseSegment.curve * basePercent);

      const drawDist = Math.min(100, this.drawDistance);
      for (let n = 0; n < drawDist; n++) {
        const seg = this.menuSegments[(baseSegment.index + n) % this.menuSegments.length];
        const loopZ = (seg.index < baseSegment.index) ? menuTrackLen : 0;

        this.project(seg.p1, -x, this.cameraHeight, (this.menuPosition % menuTrackLen) - loopZ, width, height);
        this.project(seg.p2, -x - dx, this.cameraHeight, (this.menuPosition % menuTrackLen) - loopZ, width, height);

        x += dx;
        dx += seg.curve;

        if (seg.p1.camera.z <= this.cameraDepth || seg.p2.screen.y >= maxY || seg.p2.screen.y >= seg.p1.screen.y) {
          continue;
        }

        this.renderRoadSegment(ctx, width, seg, maxY);
        maxY = seg.p1.screen.y;
      }
    }

    project(p, cameraX, cameraY, cameraZ, width, height) {
      p.camera.x = (p.world.x || 0) - cameraX;
      p.camera.y = (p.world.y || 0) - cameraY;
      p.camera.z = (p.world.z || 0) - cameraZ;
      p.screen.scale = this.cameraDepth / p.camera.z;
      p.screen.x = Math.round((width / 2) + (p.screen.scale * p.camera.x * width / 2));
      p.screen.y = Math.round((height / 2) - (p.screen.scale * p.camera.y * height / 2));
      p.screen.w = Math.round((p.screen.scale * this.roadWidth * width / 2));
    }

    renderRoadSegment(ctx, width, segment, maxY) {
      const p1 = segment.p1.screen;
      const p2 = segment.p2.screen;

      ctx.fillStyle = segment.color.grass;
      ctx.fillRect(0, p2.y, width, p1.y - p2.y);

      const r1 = p1.w / Math.max(6, 2 * this.lanes);
      const r2 = p2.w / Math.max(6, 2 * this.lanes);
      ctx.fillStyle = segment.color.rumble;
      this.drawPolygon(ctx, p1.x - p1.w - r1, p1.y, p1.x - p1.w, p1.y, p2.x - p2.w, p2.y, p2.x - p2.w - r2, p2.y);
      this.drawPolygon(ctx, p1.x + p1.w + r1, p1.y, p1.x + p1.w, p1.y, p2.x + p2.w, p2.y, p2.x + p2.w + r2, p2.y);

      ctx.fillStyle = segment.color.road;
      this.drawPolygon(ctx, p1.x - p1.w, p1.y, p1.x + p1.w, p1.y, p2.x + p2.w, p2.y, p2.x - p2.w, p2.y);

      if (segment.color.lane) {
        const l1 = p1.w / 32;
        const l2 = p2.w / 32;
        const laneW1 = (p1.w * 2) / this.lanes;
        const laneW2 = (p2.w * 2) / this.lanes;
        for (let l = 1; l < this.lanes; l++) {
          const laneX1 = p1.x - p1.w + (laneW1 * l);
          const laneX2 = p2.x - p2.w + (laneW2 * l);
          ctx.fillStyle = segment.color.lane;
          this.drawPolygon(ctx, laneX1 - l1, p1.y, laneX1 + l1, p1.y, laneX2 + l2, p2.y, laneX2 - l2, p2.y);
        }
      }
    }

    drawPolygon(ctx, x1, y1, x2, y2, x3, y3, x4, y4) {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x3, y3);
      ctx.lineTo(x4, y4);
      ctx.closePath();
      ctx.fill();
    }

    renderHorizonScenery(ctx, env, width, height) {
      const horizonY = height / 2;
      ctx.save();
      if (env.hasBuildings) {
        ctx.fillStyle = '#0a0d18';
        for (let i = 0; i < width; i += 50) {
          const bH = 40 + (Math.sin(i * 13) * 35 + 35);
          ctx.fillRect(i, horizonY - bH, 44, bH);
          ctx.fillStyle = '#00f0ff';
          if (i % 3 === 0) ctx.fillRect(i + 10, horizonY - bH + 10, 4, 4);
          ctx.fillStyle = '#0a0d18';
        }
      } else if (env.sceneryType === 'desert') {
        ctx.fillStyle = '#5c3d2e';
        ctx.beginPath();
        ctx.moveTo(0, horizonY);
        for (let x = 0; x <= width; x += 60) {
          ctx.lineTo(x, horizonY - 25 - Math.sin(x * 0.015) * 20);
        }
        ctx.lineTo(width, horizonY);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.moveTo(0, horizonY);
        for (let x = 0; x <= width; x += 80) {
          ctx.lineTo(x, horizonY - 45 - Math.abs(Math.sin(x * 0.02)) * 50);
        }
        ctx.lineTo(width, horizonY);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    renderScenerySprite(ctx, segment, sprite, width, height) {
      const scale = segment.p1.screen.scale;
      const spriteX = segment.p1.screen.x + (scale * sprite.offset * this.roadWidth * width / 2);
      const spriteY = segment.p1.screen.y;
      const spriteW = Math.round(180 * scale * width / 2 * sprite.scale);
      const spriteH = Math.round(240 * scale * width / 2 * sprite.scale);

      if (spriteW < 4 || spriteY > height || spriteX < -spriteW || spriteX > width + spriteW) return;

      ctx.save();
      if (sprite.type === 'city' || sprite.type === 'night_city') {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(spriteX - spriteW / 6, spriteY - spriteH, spriteW / 3, spriteH);
        ctx.fillStyle = (segment.index % 2 === 0) ? '#ff0055' : '#00f0ff';
        ctx.fillRect(spriteX - spriteW / 2, spriteY - spriteH, spriteW, spriteH / 3);
      } else if (sprite.type === 'desert') {
        ctx.fillStyle = '#3f6212';
        ctx.fillRect(spriteX - spriteW / 8, spriteY - spriteH, spriteW / 4, spriteH);
      } else if (sprite.type === 'snow') {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(spriteX, spriteY - spriteH);
        ctx.lineTo(spriteX - spriteW / 2, spriteY);
        ctx.lineTo(spriteX + spriteW / 2, spriteY);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillStyle = '#78350f';
        ctx.fillRect(spriteX - spriteW / 10, spriteY - spriteH / 2, spriteW / 5, spriteH / 2);
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.arc(spriteX, spriteY - spriteH / 2, spriteW / 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    renderGateArch(ctx, segment, isFinish, width) {
      const scale = segment.p1.screen.scale;
      const gateX = segment.p1.screen.x;
      const gateY = segment.p1.screen.y;
      const gateW = segment.p1.screen.w * 2.2;
      const gateH = Math.round(220 * scale * width / 2);

      if (gateW < 10) return;

      ctx.save();
      ctx.fillStyle = '#334155';
      ctx.fillRect(gateX - gateW / 2, gateY - gateH, gateW * 0.08, gateH);
      ctx.fillRect(gateX + gateW / 2 - gateW * 0.08, gateY - gateH, gateW * 0.08, gateH);

      ctx.fillStyle = isFinish ? '#ffd700' : '#00f0ff';
      ctx.fillRect(gateX - gateW / 2, gateY - gateH, gateW, gateH * 0.35);

      ctx.fillStyle = '#000000';
      ctx.font = `bold ${Math.max(10, Math.round(gateH * 0.22))}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(isFinish ? '★ FINISH LINE ★' : '⚡ CHECKPOINT ⚡', gateX, gateY - gateH * 0.82);
      ctx.restore();
    }

    renderCoin(ctx, segment, coin, width) {
      const scale = segment.p1.screen.scale;
      const coinX = segment.p1.screen.x + (scale * coin.lane * this.roadWidth * width / 2);
      const coinY = segment.p1.screen.y - (30 * scale * width / 2);
      const coinR = Math.max(3, Math.round(18 * scale * width / 2));

      ctx.save();
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(coinX, coinY, coinR, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }

    renderTrafficVehicles(ctx, width, height) {
      this.trafficCars.forEach(car => {
        const seg = this.findSegment(car.z);
        if (!seg) return;
        const relZ = car.z - this.position;
        if (relZ <= 0 || relZ > this.drawDistance * this.segmentLength) return;

        const scale = this.cameraDepth / relZ;
        const carX = Math.round((width / 2) + (scale * (car.offset * this.roadWidth - (this.playerX * this.roadWidth)) * width / 2));
        const carY = Math.round((height / 2) - (scale * (seg.p1.world.y - this.cameraHeight) * height / 2));
        const carW = Math.round(130 * scale * width / 2);
        const carH = Math.round(75 * scale * width / 2);

        if (carW < 6 || carY > height) return;

        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(carX - carW / 2, carY - carH * 0.1, carW, carH * 0.2);

        ctx.fillStyle = car.color;
        ctx.fillRect(carX - carW / 2, carY - carH, carW, carH * 0.85);

        ctx.fillStyle = '#1e293b';
        ctx.fillRect(carX - carW * 0.35, carY - carH * 0.95, carW * 0.7, carH * 0.5);

        ctx.fillStyle = '#ef4444';
        ctx.fillRect(carX - carW * 0.45, carY - carH * 0.4, carW * 0.2, carH * 0.2);
        ctx.fillRect(carX + carW * 0.25, carY - carH * 0.4, carW * 0.2, carH * 0.2);
        ctx.restore();
      });
    }

    renderPlayerCar(ctx, width, height) {
      const car = CARS.find(c => c.id === this.save.data.selectedCarId) || CARS[0];
      const carColor = this.save.data.selectedCarColor || car.color;

      const carW = Math.round(width * 0.26);
      const carH = Math.round(carW * 0.52);
      const carX = width / 2;
      
      // Dynamic vertical suspension bounce based on track movement
      const suspensionBounce = (this.speed > 5) ? Math.sin(this.position / 35) * Math.min(3.5, this.speed * 0.02) : 0;
      const carY = height - 20 + suspensionBounce;

      ctx.save();

      // Dynamic steering angle and chassis tilt
      let steerAngle = 0;
      if (this.keys.left) steerAngle = -0.07;
      if (this.keys.right) steerAngle = 0.07;

      // 1. Ground contact shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      if (typeof ctx.ellipse === 'function') {
        ctx.ellipse(carX, height - 14, carW * 0.56, carH * 0.16, 0, 0, Math.PI * 2);
      } else {
        ctx.save();
        ctx.translate(carX, height - 14);
        ctx.scale(carW * 0.56, carH * 0.16);
        ctx.arc(0, 0, 1, 0, Math.PI * 2);
        ctx.restore();
      }
      ctx.fill();

      ctx.translate(carX, carY);
      ctx.rotate(steerAngle);

      // 2. Dual Animated Nitro Flames
      if (this.isNitroActive && this.nitro > 0) {
        const flameLen = Math.random() * 26 + 18;
        ctx.fillStyle = '#00f0ff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 20;

        // Left exhaust flame
        ctx.beginPath();
        ctx.moveTo(-carW * 0.32, carH * 0.02);
        ctx.lineTo(-carW * 0.22, carH * 0.02);
        ctx.lineTo(-carW * 0.27, carH * 0.02 + flameLen);
        ctx.closePath();
        ctx.fill();

        // Right exhaust flame
        ctx.beginPath();
        ctx.moveTo(carW * 0.22, carH * 0.02);
        ctx.lineTo(carW * 0.32, carH * 0.02);
        ctx.lineTo(carW * 0.27, carH * 0.02 + flameLen);
        ctx.closePath();
        ctx.fill();

        // Inner white hot core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(-carW * 0.29, carH * 0.02);
        ctx.lineTo(-carW * 0.25, carH * 0.02);
        ctx.lineTo(-carW * 0.27, carH * 0.02 + flameLen * 0.5);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(carW * 0.25, carH * 0.02);
        ctx.lineTo(carW * 0.29, carH * 0.02);
        ctx.lineTo(carW * 0.27, carH * 0.02 + flameLen * 0.5);
        ctx.closePath();
        ctx.fill();

        ctx.shadowBlur = 0;
      }

      // 3. Rotating Tires with Rim Spokes
      const wheelRotation = (this.position / 18) % (Math.PI * 2);
      ctx.fillStyle = '#111827';
      // Left tire
      ctx.fillRect(-carW * 0.52, -carH * 0.28, carW * 0.12, carH * 0.38);
      // Right tire
      ctx.fillRect(carW * 0.4, -carH * 0.28, carW * 0.12, carH * 0.38);

      // Rotating rim treads
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.5;
      [-carW * 0.46, carW * 0.46].forEach(wx => {
        ctx.beginPath();
        ctx.arc(wx, -carH * 0.09, 7, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(wx + Math.cos(wheelRotation) * 6, -carH * 0.09 + Math.sin(wheelRotation) * 6);
        ctx.lineTo(wx - Math.cos(wheelRotation) * 6, -carH * 0.09 - Math.sin(wheelRotation) * 6);
        ctx.stroke();
      });

      // 4. Main Aerodynamic Chassis Body
      ctx.fillStyle = carColor;
      drawRoundRect(ctx, -carW / 2, -carH, carW, carH * 0.85, [14, 14, 6, 6]);
      ctx.fill();

      // Cockpit / Windshield Glass
      ctx.fillStyle = '#0f172a';
      drawRoundRect(ctx, -carW * 0.35, -carH * 0.9, carW * 0.7, carH * 0.45, [10, 10, 4, 4]);
      ctx.fill();

      // Racing Stripes / Livery Accent
      ctx.fillStyle = car.accent || '#ffffff';
      ctx.fillRect(-carW * 0.08, -carH, carW * 0.16, carH * 0.85);

      // 5. Reactive Tail Lights
      const isBraking = this.keys.slower;
      ctx.fillStyle = isBraking ? '#ff0033' : '#ef4444';
      ctx.shadowColor = isBraking ? '#ff0033' : '#ff0055';
      ctx.shadowBlur = isBraking ? 20 : 12;
      ctx.fillRect(-carW * 0.44, -carH * 0.35, carW * 0.22, carH * (isBraking ? 0.22 : 0.18));
      ctx.fillRect(carW * 0.22, -carH * 0.35, carW * 0.22, carH * (isBraking ? 0.22 : 0.18));
      ctx.shadowBlur = 0;

      // 6. High Speed Wind Blur Lines
      if (this.speed > 175) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 3; i++) {
          const sx = (Math.random() - 0.5) * carW * 1.2;
          const sy = -carH * (0.3 + Math.random() * 0.6);
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx, sy - (Math.random() * 25 + 15));
          ctx.stroke();
        }
      }

      ctx.restore();
    }

    renderWeatherParticles(ctx, width, height) {
      if (!this.currentLevel) return;
      const weather = this.currentLevel.weather;

      if (weather === 'rain' || weather === 'storm') {
        ctx.strokeStyle = 'rgba(180, 220, 255, 0.4)';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 40; i++) {
          const rx = Math.random() * width;
          const ry = Math.random() * height;
          ctx.beginPath();
          ctx.moveTo(rx, ry);
          ctx.lineTo(rx - 8, ry + 16);
          ctx.stroke();
        }
      } else if (weather === 'snow') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (let i = 0; i < 35; i++) {
          const sx = Math.random() * width;
          const sy = Math.random() * height;
          ctx.beginPath();
          ctx.arc(sx, sy, Math.random() * 2.5 + 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (this.isNitroActive && this.speed > 160) {
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 15; i++) {
          const lx = Math.random() * width;
          const ly = Math.random() * height;
          ctx.beginPath();
          ctx.moveTo(lx, ly);
          ctx.lineTo(lx, ly + 60);
          ctx.stroke();
        }
      }
    }
  }

  /* ==========================================================================
     GLOBAL INITIALIZATION & SAFE STARTUP
     ========================================================================== */

  function initGame() {
    if (window.__carGameInitialized) return;
    window.__carGameInitialized = true;

    try {
      const controller = new GameController();
      window.gameController = controller;
      window.gameInstance = controller;
      console.log('Car Rush 3D GameController initialized successfully!');
    } catch (err) {
      console.error('Failed to initialize GameController:', err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
  } else {
    initGame();
  }

  window.addEventListener('load', initGame);

})();
