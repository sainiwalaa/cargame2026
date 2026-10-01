/**
 * CAR RUSH 3D - 100 LEVEL SYSTEM DATA
 * Progressive 100 levels spanning 10 diverse racing environments.
 */

const ENVIRONMENTS = {
  CITY: {
    id: 'city',
    name: 'Neon City',
    skyColor: '#0b132b',
    horizonColor: '#1c2541',
    groundColor: '#1a1d20',
    roadColor: '#2b2d42',
    curbColor1: '#ef233c',
    curbColor2: '#edf2f4',
    fogColor: '#0b132b',
    hasBuildings: true,
    sceneryType: 'city',
    ambientLight: 0.85
  },
  HIGHWAY: {
    id: 'highway',
    name: 'Sunset Highway',
    skyColor: '#3a0ca3',
    horizonColor: '#f72585',
    groundColor: '#2d3142',
    roadColor: '#343a40',
    curbColor1: '#ffb703',
    curbColor2: '#212529',
    fogColor: '#7209b7',
    hasBuildings: false,
    sceneryType: 'highway',
    ambientLight: 0.95
  },
  DESERT: {
    id: 'desert',
    name: 'Dust Storm Canyon',
    skyColor: '#b56576',
    horizonColor: '#e56b6f',
    groundColor: '#d4a373',
    roadColor: '#6c584c',
    curbColor1: '#bc6c25',
    curbColor2: '#dda15e',
    fogColor: '#ddb892',
    hasBuildings: false,
    sceneryType: 'desert',
    ambientLight: 0.9
  },
  FOREST: {
    id: 'forest',
    name: 'Emerald Forest',
    skyColor: '#1b4332',
    horizonColor: '#2d6a4f',
    groundColor: '#40916c',
    roadColor: '#212529',
    curbColor1: '#52b788',
    curbColor2: '#1b4332',
    fogColor: '#2d6a4f',
    hasBuildings: false,
    sceneryType: 'forest',
    ambientLight: 0.8
  },
  MOUNTAIN: {
    id: 'mountain',
    name: 'Alpine Heights',
    skyColor: '#1e3d59',
    horizonColor: '#17b978',
    groundColor: '#438a5e',
    roadColor: '#2c3539',
    curbColor1: '#ff6e40',
    curbColor2: '#f5f0e1',
    fogColor: '#68829e',
    hasBuildings: false,
    sceneryType: 'mountain',
    ambientLight: 0.92
  },
  SNOW: {
    id: 'snow',
    name: 'Frostbite Pass',
    skyColor: '#4a5568',
    horizonColor: '#a0aec0',
    groundColor: '#e2e8f0',
    roadColor: '#475569',
    curbColor1: '#38bdf8',
    curbColor2: '#ffffff',
    fogColor: '#cbd5e1',
    hasBuildings: false,
    sceneryType: 'snow',
    ambientLight: 0.75
  },
  NIGHT_CITY: {
    id: 'night_city',
    name: 'Cyber Tokyo',
    skyColor: '#050510',
    horizonColor: '#1a0033',
    groundColor: '#0a0a14',
    roadColor: '#151522',
    curbColor1: '#00f0ff',
    curbColor2: '#ff0055',
    fogColor: '#130426',
    hasBuildings: true,
    sceneryType: 'night_city',
    ambientLight: 0.7
  },
  TUNNEL: {
    id: 'tunnel',
    name: 'Hyper Tunnel & Bridge',
    skyColor: '#020205',
    horizonColor: '#0d1b2a',
    groundColor: '#1b263b',
    roadColor: '#212529',
    curbColor1: '#ffd166',
    curbColor2: '#06d6a0',
    fogColor: '#0d1b2a',
    hasBuildings: false,
    sceneryType: 'tunnel',
    ambientLight: 0.8
  },
  EXTREME_HIGHWAY: {
    id: 'extreme_highway',
    name: 'Thunder Highway',
    skyColor: '#16001e',
    horizonColor: '#400235',
    groundColor: '#1f132b',
    roadColor: '#281a38',
    curbColor1: '#e024c3',
    curbColor2: '#10002b',
    fogColor: '#240046',
    hasBuildings: false,
    sceneryType: 'highway',
    ambientLight: 0.8
  },
  CHAMPIONSHIP: {
    id: 'championship',
    name: 'Apex Grand Prix',
    skyColor: '#0d1b2a',
    horizonColor: '#415a77',
    groundColor: '#1b263b',
    roadColor: '#1c1c1c',
    curbColor1: '#ff0055',
    curbColor2: '#ffffff',
    fogColor: '#1f2937',
    hasBuildings: true,
    sceneryType: 'championship',
    ambientLight: 0.95
  }
};

const MISSION_TYPES = {
  FINISH: { id: 'FINISH', title: 'Finish Race', desc: 'Reach the finish line before time expires.' },
  SPEED: { id: 'SPEED', title: 'Speed Trap', desc: 'Reach and hold the target top speed.' },
  OVERTAKE: { id: 'OVERTAKE', title: 'Speed Hunter', desc: 'Overtake the required number of traffic vehicles.' },
  COINS: { id: 'COINS', title: 'Coin Rush', desc: 'Collect target gold coins on the asphalt.' },
  NEAR_MISS: { id: 'NEAR_MISS', title: 'Daredevil', desc: 'Perform razor-thin near-misses without crashing.' },
  CHECKPOINTS: { id: 'CHECKPOINTS', title: 'Checkpoint Dash', desc: 'Pass all intermediate gates before timer zeroes.' },
  SURVIVAL: { id: 'SURVIVAL', title: 'No Crash Run', desc: 'Finish the race with at least 80% vehicle health.' },
  CHAMPION: { id: 'CHAMPION', title: 'Grand Finale', desc: 'Defeat the master circuit and claim the Golden Cup!' }
};

// Generate 100 balanced, progressive levels
const GAME_LEVELS = (function generate100Levels() {
  const levels = [];

  const zoneConfigs = [
    { zone: 1, start: 1, end: 10, env: ENVIRONMENTS.CITY, namePrefix: 'City Rush', baseLen: 2200, baseTraffic: 1.0, weather: 'clear' },
    { zone: 2, start: 11, end: 20, env: ENVIRONMENTS.HIGHWAY, namePrefix: 'Sunset Coast', baseLen: 2600, baseTraffic: 1.2, weather: 'sunset' },
    { zone: 3, start: 21, end: 30, env: ENVIRONMENTS.DESERT, namePrefix: 'Dune Sprint', baseLen: 3000, baseTraffic: 1.4, weather: 'clear' },
    { zone: 4, start: 31, end: 40, env: ENVIRONMENTS.FOREST, namePrefix: 'Forest Ridge', baseLen: 3400, baseTraffic: 1.6, weather: 'rain' },
    { zone: 5, start: 41, end: 50, env: ENVIRONMENTS.MOUNTAIN, namePrefix: 'Alpine Drift', baseLen: 3800, baseTraffic: 1.8, weather: 'fog' },
    { zone: 6, start: 51, end: 60, env: ENVIRONMENTS.SNOW, namePrefix: 'Blizzard Pass', baseLen: 4200, baseTraffic: 2.0, weather: 'snow' },
    { zone: 7, start: 61, end: 70, env: ENVIRONMENTS.NIGHT_CITY, namePrefix: 'Cyber Midnight', baseLen: 4600, baseTraffic: 2.2, weather: 'night' },
    { zone: 8, start: 71, end: 80, env: ENVIRONMENTS.TUNNEL, namePrefix: 'Tunnel Blitz', baseLen: 5000, baseTraffic: 2.4, weather: 'night' },
    { zone: 9, start: 81, end: 90, env: ENVIRONMENTS.EXTREME_HIGHWAY, namePrefix: 'Thunder Rush', baseLen: 5500, baseTraffic: 2.7, weather: 'storm' },
    { zone: 10, start: 91, end: 100, env: ENVIRONMENTS.CHAMPIONSHIP, namePrefix: 'Apex Circuit', baseLen: 6000, baseTraffic: 3.0, weather: 'night' }
  ];

  const missionCycle = [
    'FINISH', 'OVERTAKE', 'COINS', 'SPEED', 'NEAR_MISS',
    'CHECKPOINTS', 'SURVIVAL', 'OVERTAKE', 'COINS', 'BOSS'
  ];

  for (let i = 1; i <= 100; i++) {
    const zoneIndex = Math.min(9, Math.floor((i - 1) / 10));
    const zConfig = zoneConfigs[zoneIndex];
    const localIndex = (i - 1) % 10;
    const missionKey = (i === 100) ? 'CHAMPION' : missionCycle[localIndex];
    const isBoss = (localIndex === 9 || i === 100);

    const distance = Math.round(zConfig.baseLen + localIndex * 120 + i * 25);
    const speedFactor = 1 + (i / 100) * 0.4;
    const timeLimit = Math.round((distance / 65) * 1.35);

    let missionType = MISSION_TYPES[missionKey] || MISSION_TYPES.FINISH;
    let targetRequirement = 0;
    let targetLabel = '';

    switch (missionKey) {
      case 'OVERTAKE':
        targetRequirement = 5 + Math.floor(i * 0.4);
        targetLabel = `Overtake ${targetRequirement} Cars`;
        break;
      case 'COINS':
        targetRequirement = 15 + Math.floor(i * 0.6);
        targetLabel = `Collect ${targetRequirement} Coins`;
        break;
      case 'SPEED':
        targetRequirement = Math.min(320, 160 + Math.floor(i * 1.4));
        targetLabel = `Hit ${targetRequirement} km/h`;
        break;
      case 'NEAR_MISS':
        targetRequirement = 3 + Math.floor(i * 0.2);
        targetLabel = `Perform ${targetRequirement} Near Misses`;
        break;
      case 'CHECKPOINTS':
        targetRequirement = 2 + Math.floor(distance / 1200);
        targetLabel = `Pass ${targetRequirement} Checkpoints`;
        break;
      case 'SURVIVAL':
        targetRequirement = 80;
        targetLabel = `Finish with ≥ 80% Health`;
        break;
      case 'BOSS':
      case 'CHAMPION':
        targetRequirement = 1;
        targetLabel = i === 100 ? 'WIN THE GRAND CHAMPIONSHIP' : 'Defeat Zone Champion (1st Place)';
        break;
      default:
        targetRequirement = distance;
        targetLabel = `Finish Course in ${timeLimit}s`;
    }

    const rewardCoins = 250 + i * 95 + (isBoss ? 1500 : 0);
    const rewardXP = 150 + i * 45 + (isBoss ? 500 : 0);
    const targetScore = 2000 + i * 650 + (isBoss ? 4000 : 0);

    let difficulty = 'Easy';
    if (i > 15) difficulty = 'Medium';
    if (i > 40) difficulty = 'Hard';
    if (i > 70) difficulty = 'Expert';
    if (i > 90) difficulty = 'Master';
    if (i === 100) difficulty = 'LEGENDARY';

    levels.push({
      id: i,
      name: i === 100 ? 'THE GRAND FINALE CHAMPIONSHIP' : `${zConfig.namePrefix} ${localIndex + 1}`,
      zone: zConfig.zone,
      environment: zConfig.env,
      weather: zConfig.weather,
      distance: distance,
      timeLimit: timeLimit,
      targetScore: targetScore,
      missionKey: missionKey,
      missionTitle: missionType.title,
      missionDesc: missionType.desc,
      targetRequirement: targetRequirement,
      targetLabel: targetLabel,
      trafficDensity: parseFloat((zConfig.baseTraffic + (localIndex * 0.08)).toFixed(2)),
      rewardCoins: rewardCoins,
      rewardXP: rewardXP,
      difficulty: difficulty,
      isBoss: isBoss
    });
  }

  return levels;
})();

if (typeof window !== 'undefined') {
  window.GAME_LEVELS = GAME_LEVELS;
  window.ENVIRONMENTS = ENVIRONMENTS;
  window.MISSION_TYPES = MISSION_TYPES;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GAME_LEVELS, ENVIRONMENTS, MISSION_TYPES };
}
