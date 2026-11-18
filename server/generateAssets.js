// Asset generator for HELI platform
const fs = require('fs');
const path = require('path');

const POSTS_DIR = path.join(__dirname, '../client/public/images/posts');
const AVATARS_DIR = path.join(__dirname, '../client/public/images/avatars');

fs.mkdirSync(POSTS_DIR, { recursive: true });
fs.mkdirSync(AVATARS_DIR, { recursive: true });

console.log('Generating SVG image assets...');

// 1. study_desk.svg
const studyDeskSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="100%" height="100%">
  <defs>
    <linearGradient id="nightSky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#070b19" />
      <stop offset="100%" stop-color="#18223c" />
    </linearGradient>
    <linearGradient id="roomWall" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1e2433" />
      <stop offset="100%" stop-color="#0f131d" />
    </linearGradient>
    <radialGradient id="lampGlow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0%" stop-color="#fef08a" stop-opacity="0.9" />
      <stop offset="40%" stop-color="#f59e0b" stop-opacity="0.4" />
      <stop offset="100%" stop-color="#f59e0b" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="deskWood" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#78350f" />
      <stop offset="50%" stop-color="#92400e" />
      <stop offset="100%" stop-color="#78350f" />
    </linearGradient>
    <linearGradient id="laptopScreen" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.8" />
      <stop offset="100%" stop-color="#0284c7" stop-opacity="0.9" />
    </linearGradient>
  </defs>

  <!-- Background Wall -->
  <rect width="800" height="480" fill="url(#roomWall)" />

  <!-- Arched Window -->
  <path d="M 120 80 Q 230 10 340 80 L 340 260 L 120 260 Z" fill="url(#nightSky)" />
  <!-- Stars in Window -->
  <circle cx="160" cy="110" r="1.5" fill="#fff" opacity="0.8" />
  <circle cx="210" cy="70" r="2" fill="#fff" opacity="0.9" />
  <circle cx="270" cy="95" r="1.5" fill="#fff" opacity="0.7" />
  <circle cx="310" cy="140" r="2" fill="#fff" opacity="0.8" />
  <circle cx="180" cy="170" r="1.2" fill="#fff" opacity="0.6" />
  <circle cx="250" cy="190" r="1.8" fill="#fff" opacity="0.9" />
  <!-- Crescent Moon -->
  <path d="M 280 60 A 24 24 0 1 0 300 95 A 20 20 0 1 1 280 60 Z" fill="#fef08a" opacity="0.95" />
  <!-- Window Frame -->
  <path d="M 120 80 Q 230 10 340 80 L 340 260 L 120 260 Z" fill="none" stroke="#334155" stroke-width="6" />
  <line x1="230" y1="45" x2="230" y2="260" stroke="#334155" stroke-width="4" />
  <line x1="120" y1="160" x2="340" y2="160" stroke="#334155" stroke-width="4" />

  <!-- Lamp Light Cone -->
  <polygon points="560,180 340,420 740,420" fill="url(#lampGlow)" opacity="0.65" />

  <!-- Desk Surface -->
  <rect x="0" y="320" width="800" height="160" fill="url(#deskWood)" />
  <rect x="0" y="320" width="800" height="8" fill="#b45309" opacity="0.6" />

  <!-- Laptop -->
  <g transform="translate(380, 260)">
    <!-- Screen -->
    <rect x="0" y="0" width="160" height="100" rx="6" fill="#1e293b" stroke="#475569" stroke-width="2" />
    <rect x="8" y="8" width="144" height="84" rx="3" fill="url(#laptopScreen)" />
    <!-- Code lines on laptop -->
    <rect x="18" y="20" width="60" height="4" rx="2" fill="#ffffff" opacity="0.9" />
    <rect x="18" y="28" width="90" height="4" rx="2" fill="#bae6fd" opacity="0.8" />
    <rect x="28" y="36" width="70" height="4" rx="2" fill="#fef08a" opacity="0.8" />
    <rect x="28" y="44" width="80" height="4" rx="2" fill="#a7f3d0" opacity="0.8" />
    <rect x="18" y="52" width="50" height="4" rx="2" fill="#fbcfe8" opacity="0.8" />
    <rect x="18" y="64" width="100" height="12" rx="3" fill="#0369a1" opacity="0.6" />
    <!-- Base -->
    <polygon points="-16,102 176,102 160,110 0,110" fill="#cbd5e1" />
  </g>

  <!-- Desk Lamp -->
  <g transform="translate(560, 140)">
    <path d="M 30 180 L 30 100 Q 30 40 -10 30" fill="none" stroke="#d97706" stroke-width="6" stroke-linecap="round" />
    <!-- Shade -->
    <path d="M -30 20 L 10 35 L -10 70 Z" fill="#b45309" />
    <circle cx="-5" cy="50" r="10" fill="#fef08a" />
    <!-- Base -->
    <ellipse cx="30" cy="180" rx="25" ry="8" fill="#78350f" stroke="#b45309" stroke-width="2" />
  </g>

  <!-- Coffee Mug with steam -->
  <g transform="translate(300, 310)">
    <rect x="0" y="0" width="36" height="42" rx="4" fill="#f1f5f9" />
    <path d="M 36 8 Q 50 20 36 32" fill="none" stroke="#f1f5f9" stroke-width="4" stroke-linecap="round" />
    <ellipse cx="18" cy="4" rx="16" ry="4" fill="#78350f" />
    <!-- Steam -->
    <path d="M 12 -4 Q 8 -16 14 -24 Q 20 -32 16 -40" fill="none" stroke="#cbd5e1" stroke-width="2" opacity="0.4" stroke-linecap="round" />
    <path d="M 22 -6 Q 26 -18 20 -28 Q 14 -36 22 -44" fill="none" stroke="#cbd5e1" stroke-width="1.8" opacity="0.3" stroke-linecap="round" />
  </g>

  <!-- Open Notebook & Pen -->
  <g transform="translate(200, 335)">
    <polygon points="0,10 70,0 80,45 10,55" fill="#f8fafc" />
    <polygon points="70,0 140,10 130,55 60,45" fill="#f1f5f9" />
    <line x1="70" y1="0" x2="70" y2="45" stroke="#94a3b8" stroke-width="2" />
    <line x1="15" y1="18" x2="55" y2="14" stroke="#cbd5e1" stroke-width="1.5" />
    <line x1="15" y1="26" x2="50" y2="22" stroke="#cbd5e1" stroke-width="1.5" />
    <line x1="15" y1="34" x2="58" y2="30" stroke="#cbd5e1" stroke-width="1.5" />
    <line x1="85" y1="14" x2="125" y2="18" stroke="#cbd5e1" stroke-width="1.5" />
    <line x1="85" y1="22" x2="120" y2="26" stroke="#cbd5e1" stroke-width="1.5" />
    <!-- Pen -->
    <line x1="145" y1="15" x2="165" y2="45" stroke="#0284c7" stroke-width="3" stroke-linecap="round" />
  </g>

  <!-- Small Plant -->
  <g transform="translate(140, 290)">
    <polygon points="5,35 35,35 30,60 10,60" fill="#ea580c" />
    <ellipse cx="20" cy="35" rx="16" ry="5" fill="#7c2d12" />
    <path d="M 20 35 Q 10 15 5 5 Q 20 15 20 35" fill="#22c55e" />
    <path d="M 20 35 Q 30 18 35 10 Q 25 20 20 35" fill="#16a34a" />
    <path d="M 20 35 Q 20 10 20 -2 Q 26 12 20 35" fill="#4ade80" />
  </g>

  <!-- Motivational Tag -->
  <rect x="580" y="30" width="190" height="36" rx="18" fill="#1e293b" stroke="#334155" stroke-width="1" />
  <circle cx="600" cy="48" r="6" fill="#10b981" />
  <text x="616" y="53" fill="#e2e8f0" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="600">DACS4 • Graduation Journey</text>
</svg>`;

// 2. rain_night.svg
const rainNightSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="100%" height="100%">
  <defs>
    <linearGradient id="rainBg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#090d16" />
      <stop offset="50%" stop-color="#111827" />
      <stop offset="100%" stop-color="#1e1b4b" />
    </linearGradient>
    <radialGradient id="bokehAmber" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.6" />
      <stop offset="100%" stop-color="#fbbf24" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="bokehCyan" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.5" />
      <stop offset="100%" stop-color="#38bdf8" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="bokehRose" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0%" stop-color="#f43f5e" stop-opacity="0.5" />
      <stop offset="100%" stop-color="#f43f5e" stop-opacity="0" />
    </radialGradient>
  </defs>

  <!-- Deep Night Sky -->
  <rect width="800" height="480" fill="url(#rainBg)" />

  <!-- Distant City Skyline Silhouettes -->
  <rect x="40" y="240" width="70" height="180" fill="#0b0f19" opacity="0.8" />
  <rect x="130" y="200" width="90" height="220" fill="#0f172a" opacity="0.8" />
  <polygon points="175,170 140,200 210,200" fill="#0f172a" opacity="0.8" />
  <rect x="240" y="270" width="80" height="150" fill="#0b0f19" opacity="0.8" />
  <rect x="350" y="220" width="110" height="200" fill="#0f172a" opacity="0.8" />
  <rect x="480" y="250" width="75" height="170" fill="#0b0f19" opacity="0.8" />
  <rect x="580" y="190" width="100" height="230" fill="#0f172a" opacity="0.8" />
  <rect x="700" y="230" width="80" height="190" fill="#0b0f19" opacity="0.8" />

  <!-- Out-of-focus Bokeh Circles (Streetlights) -->
  <circle cx="160" cy="310" r="45" fill="url(#bokehAmber)" />
  <circle cx="280" cy="330" r="35" fill="url(#bokehCyan)" />
  <circle cx="390" cy="280" r="55" fill="url(#bokehAmber)" />
  <circle cx="510" cy="320" r="40" fill="url(#bokehRose)" />
  <circle cx="630" cy="290" r="50" fill="url(#bokehAmber)" />
  <circle cx="720" cy="340" r="38" fill="url(#bokehCyan)" />
  <circle cx="90" cy="350" r="30" fill="url(#bokehAmber)" />

  <!-- Glass Raindrop Overlay (diagonal rain trails & droplets) -->
  <g opacity="0.55" stroke="#bae6fd" stroke-linecap="round">
    <!-- Stream streaks -->
    <path d="M 120 40 Q 124 120 122 180" stroke-width="2" fill="none" />
    <path d="M 230 60 Q 232 150 228 240" stroke-width="1.8" fill="none" />
    <path d="M 370 20 Q 374 130 371 210" stroke-width="2.2" fill="none" />
    <path d="M 480 80 Q 482 170 481 260" stroke-width="1.5" fill="none" />
    <path d="M 610 30 Q 612 140 609 230" stroke-width="2" fill="none" />
    <path d="M 710 70 Q 714 180 711 280" stroke-width="1.7" fill="none" />
  </g>

  <!-- Raindrop beads on glass -->
  <g fill="#e0f2fe" opacity="0.85">
    <ellipse cx="122" cy="180" rx="3.5" ry="5" />
    <ellipse cx="228" cy="240" rx="4" ry="5.5" />
    <ellipse cx="371" cy="210" rx="4.5" ry="6" />
    <ellipse cx="481" cy="260" rx="3" ry="4.5" />
    <ellipse cx="609" cy="230" rx="4" ry="5.5" />
    <ellipse cx="711" cy="280" rx="3.8" ry="5" />
    
    <circle cx="80" cy="110" r="2.5" />
    <circle cx="150" cy="90" r="2" />
    <circle cx="190" cy="160" r="3" />
    <circle cx="290" cy="120" r="2" />
    <circle cx="340" cy="80" r="2.8" />
    <circle cx="430" cy="150" r="3.2" />
    <circle cx="530" cy="110" r="2.4" />
    <circle cx="560" cy="190" r="3" />
    <circle cx="660" cy="130" r="2.5" />
    <circle cx="750" cy="100" r="2" />
    <circle cx="260" cy="280" r="3" />
    <circle cx="410" cy="310" r="2.2" />
    <circle cx="500" cy="330" r="2.6" />
    <circle cx="670" cy="320" r="3" />
  </g>

  <!-- Window Sill with Warm Solace Tea -->
  <rect x="0" y="420" width="800" height="60" fill="#0a0e17" />
  <rect x="0" y="420" width="800" height="4" fill="#334155" opacity="0.6" />
  
  <g transform="translate(680, 385)">
    <rect x="0" y="0" width="40" height="38" rx="6" fill="#f8fafc" opacity="0.95" />
    <path d="M 40 8 Q 52 18 40 28" fill="none" stroke="#f8fafc" stroke-width="3.5" opacity="0.95" />
    <ellipse cx="20" cy="4" rx="16" ry="4" fill="#d97706" />
  </g>

  <!-- Emotional Mood Badge -->
  <rect x="32" y="32" width="165" height="34" rx="17" fill="rgba(15,23,42,0.8)" stroke="rgba(255,255,255,0.15)" />
  <circle cx="50" cy="49" r="5" fill="#38bdf8" />
  <text x="64" y="54" fill="#e2e8f0" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="600">Mưa Đêm • Lắng Đọng</text>
</svg>`;

// 3. sunset_bridge.svg
const sunsetBridgeSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="100%" height="100%">
  <defs>
    <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#311042" />
      <stop offset="30%" stop-color="#701a75" />
      <stop offset="60%" stop-color="#c2410c" />
      <stop offset="85%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#fef08a" />
    </linearGradient>
    <linearGradient id="riverGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#b45309" />
      <stop offset="40%" stop-color="#581c87" />
      <stop offset="100%" stop-color="#1e1b4b" />
    </linearGradient>
  </defs>

  <!-- Sky -->
  <rect width="800" height="310" fill="url(#skyGrad)" />

  <!-- Setting Sun Glow -->
  <circle cx="480" cy="270" r="65" fill="#fff" opacity="0.9" />
  <circle cx="480" cy="270" r="110" fill="#fef08a" opacity="0.4" />
  <circle cx="480" cy="270" r="180" fill="#f59e0b" opacity="0.2" />

  <!-- Distant Mountains -->
  <polygon points="0,310 80,240 180,310" fill="#4a044e" opacity="0.7" />
  <polygon points="120,310 240,210 380,310" fill="#581c87" opacity="0.6" />
  <polygon points="320,310 440,230 540,310" fill="#701a75" opacity="0.5" />
  <polygon points="620,310 720,250 800,310" fill="#4a044e" opacity="0.7" />

  <!-- River Water -->
  <rect y="310" width="800" height="170" fill="url(#riverGrad)" />

  <!-- Water Reflections -->
  <g opacity="0.7" stroke="#fef08a" stroke-linecap="round">
    <line x1="440" y1="320" x2="520" y2="320" stroke-width="4" />
    <line x1="420" y1="332" x2="540" y2="332" stroke-width="3.5" />
    <line x1="450" y1="346" x2="510" y2="346" stroke-width="3" />
    <line x1="410" y1="362" x2="550" y2="362" stroke-width="2.5" />
    <line x1="430" y1="380" x2="530" y2="380" stroke-width="2" />
    <line x1="400" y1="402" x2="560" y2="402" stroke-width="1.8" />
  </g>

  <!-- Suspension Bridge Silhouette -->
  <g fill="#18181b">
    <!-- Main Tower -->
    <polygon points="260,110 272,110 276,330 256,330" />
    <polygon points="250,150 282,150 280,160 252,160" />
    <polygon points="248,220 284,220 282,230 250,230" />
    
    <!-- Bridge Deck -->
    <rect x="0" y="295" width="800" height="18" fill="#18181b" />
    <!-- Pillars -->
    <rect x="80" y="313" width="22" height="60" fill="#18181b" />
    <rect x="620" y="313" width="22" height="60" fill="#18181b" />
  </g>

  <!-- Cables -->
  <g stroke="#18181b" stroke-width="2" fill="none">
    <path d="M 0 170 Q 130 270 266 115" />
    <path d="M 266 115 Q 480 270 800 240" />
    <!-- Vertical stay ropes -->
    <line x1="120" y1="230" x2="120" y2="295" stroke-width="1.2" />
    <line x1="180" y1="200" x2="180" y2="295" stroke-width="1.2" />
    <line x1="330" y1="180" x2="330" y2="295" stroke-width="1.2" />
    <line x1="390" y1="210" x2="390" y2="295" stroke-width="1.2" />
    <line x1="450" y1="230" x2="450" y2="295" stroke-width="1.2" />
    <line x1="510" y1="240" x2="510" y2="295" stroke-width="1.2" />
    <line x1="570" y1="245" x2="570" y2="295" stroke-width="1.2" />
  </g>

  <!-- Solitary Person Leaning on Railing -->
  <g transform="translate(185, 268)" fill="#18181b">
    <circle cx="5" cy="4" r="4.5" />
    <rect x="2" y="9" width="7" height="18" rx="2" />
  </g>

  <!-- Flying Birds -->
  <g stroke="#3b0764" stroke-width="2" fill="none">
    <path d="M 640 100 Q 648 92 656 100 Q 664 92 672 100" />
    <path d="M 670 120 Q 676 114 682 120 Q 688 114 694 120" />
    <path d="M 620 135 Q 625 130 630 135 Q 635 130 640 135" />
  </g>

  <!-- Tag -->
  <rect x="32" y="32" width="180" height="34" rx="17" fill="rgba(24,24,27,0.75)" stroke="rgba(255,255,255,0.2)" />
  <circle cx="50" cy="49" r="5" fill="#f59e0b" />
  <text x="64" y="54" fill="#fef3c7" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="600">Hoàng Hôn • Bước Ngoặt</text>
</svg>`;

// 4. sunflower.svg
const sunflowerSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="100%" height="100%">
  <defs>
    <linearGradient id="sunBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f0fdf4" />
      <stop offset="50%" stop-color="#fef9c3" />
      <stop offset="100%" stop-color="#ffedd5" />
    </linearGradient>
    <radialGradient id="sunlight" cx="1" cy="0" r="1">
      <stop offset="0%" stop-color="#fef08a" stop-opacity="0.9" />
      <stop offset="50%" stop-color="#fed7aa" stop-opacity="0.4" />
      <stop offset="100%" stop-color="#fff" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="flowerCenter" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0%" stop-color="#451a03" />
      <stop offset="70%" stop-color="#78350f" />
      <stop offset="100%" stop-color="#92400e" />
    </radialGradient>
  </defs>

  <rect width="800" height="480" fill="url(#sunBg)" />
  <rect width="800" height="480" fill="url(#sunlight)" />

  <!-- Gentle hills background -->
  <path d="M 0 420 Q 250 360 500 400 Q 650 420 800 370 L 800 480 L 0 480 Z" fill="#86efac" opacity="0.6" />
  <path d="M 0 440 Q 300 390 600 430 Q 700 440 800 410 L 800 480 L 0 480 Z" fill="#4ade80" opacity="0.7" />

  <!-- Main Sunflower -->
  <g transform="translate(360, 240)">
    <!-- Stem & Leaves -->
    <path d="M 0 70 Q 15 160 30 240" fill="none" stroke="#15803d" stroke-width="14" stroke-linecap="round" />
    <path d="M 12 140 Q 80 120 110 160 Q 60 190 12 150" fill="#16a34a" />
    <path d="M 0 170 Q -70 150 -100 190 Q -50 220 0 180" fill="#15803d" />

    <!-- Petals Ring 1 (Back) -->
    <g fill="#f59e0b">
      <ellipse cx="0" cy="-90" rx="16" ry="45" />
      <ellipse cx="64" cy="-64" rx="16" ry="45" transform="rotate(45, 64, -64)" />
      <ellipse cx="90" cy="0" rx="16" ry="45" transform="rotate(90, 90, 0)" />
      <ellipse cx="64" cy="64" rx="16" ry="45" transform="rotate(135, 64, 64)" />
      <ellipse cx="0" cy="90" rx="16" ry="45" />
      <ellipse cx="-64" cy="64" rx="16" ry="45" transform="rotate(45, -64, 64)" />
      <ellipse cx="-90" cy="0" rx="16" ry="45" transform="rotate(90, -90, 0)" />
      <ellipse cx="-64" cy="-64" rx="16" ry="45" transform="rotate(135, -64, -64)" />
    </g>

    <!-- Petals Ring 2 (Front) -->
    <g fill="#fbbf24">
      <ellipse cx="35" cy="-84" rx="15" ry="42" transform="rotate(22.5, 35, -84)" />
      <ellipse cx="84" cy="-35" rx="15" ry="42" transform="rotate(67.5, 84, -35)" />
      <ellipse cx="84" cy="35" rx="15" ry="42" transform="rotate(112.5, 84, 35)" />
      <ellipse cx="35" cy="84" rx="15" ry="42" transform="rotate(157.5, 35, 84)" />
      <ellipse cx="-35" cy="84" rx="15" ry="42" transform="rotate(202.5, -35, 84)" />
      <ellipse cx="-84" cy="35" rx="15" ry="42" transform="rotate(247.5, -84, 35)" />
      <ellipse cx="-84" cy="-35" rx="15" ry="42" transform="rotate(292.5, -84, -35)" />
      <ellipse cx="-35" cy="-84" rx="15" ry="42" transform="rotate(337.5, -35, -84)" />
    </g>

    <!-- Center Disc -->
    <circle cx="0" cy="0" r="54" fill="url(#flowerCenter)" stroke="#b45309" stroke-width="3" />
    <!-- Seed Dots -->
    <circle cx="-15" cy="-10" r="3" fill="#fef08a" opacity="0.6" />
    <circle cx="10" cy="-20" r="3" fill="#fef08a" opacity="0.5" />
    <circle cx="20" cy="15" r="3" fill="#fef08a" opacity="0.7" />
    <circle cx="-10" cy="20" r="3" fill="#fef08a" opacity="0.6" />
    <circle cx="0" cy="0" r="4" fill="#fef08a" opacity="0.8" />
  </g>

  <!-- Sun Rays & Floating Sparkles -->
  <g fill="#fef08a" opacity="0.8">
    <circle cx="700" cy="60" r="5" />
    <circle cx="630" cy="110" r="3.5" />
    <circle cx="560" cy="80" r="4" />
    <circle cx="490" cy="140" r="3" />
    <circle cx="680" cy="190" r="4.5" />
    <circle cx="210" cy="120" r="4" />
    <circle cx="150" cy="180" r="3" />
  </g>

  <rect x="32" y="32" width="180" height="34" rx="17" fill="rgba(255,255,255,0.85)" stroke="#bbf7d0" />
  <circle cx="50" cy="49" r="5" fill="#16a34a" />
  <text x="64" y="54" fill="#14532d" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="600">Hy Vọng • Tươi Sáng</text>
</svg>`;

// 5. coffee_quiet.svg
const coffeeQuietSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="100%" height="100%">
  <defs>
    <linearGradient id="cafeWall" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f5f5f4" />
      <stop offset="100%" stop-color="#e7e5e4" />
    </linearGradient>
    <linearGradient id="tableWood" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#d6d3d1" />
      <stop offset="15%" stop-color="#a8a29e" />
      <stop offset="100%" stop-color="#78716c" />
    </linearGradient>
  </defs>

  <rect width="800" height="480" fill="url(#cafeWall)" />

  <!-- Window Blind Shadow Lines -->
  <g opacity="0.08" fill="#1c1917">
    <polygon points="0,40 800,90 800,120 0,70" />
    <polygon points="0,110 800,160 800,190 0,140" />
    <polygon points="0,180 800,230 800,260 0,210" />
    <polygon points="0,250 800,300 800,330 0,280" />
  </g>

  <!-- Table -->
  <rect y="310" width="800" height="170" fill="url(#tableWood)" />
  <line x1="0" y1="310" x2="800" y2="310" stroke="#57534e" stroke-width="3" />

  <!-- Ceramic Coffee Saucer & Cup -->
  <g transform="translate(420, 260)">
    <!-- Saucer -->
    <ellipse cx="60" cy="110" rx="90" ry="22" fill="#fafaf9" stroke="#d6d3d1" stroke-width="2" />
    <ellipse cx="60" cy="108" rx="60" ry="14" fill="#e7e5e4" />

    <!-- Cup Body -->
    <path d="M 15 40 L 25 100 Q 60 115 95 100 L 105 40 Z" fill="#fafaf9" stroke="#d6d3d1" stroke-width="2" />
    <!-- Handle -->
    <path d="M 103 50 Q 135 68 100 88" fill="none" stroke="#fafaf9" stroke-width="8" stroke-linecap="round" />
    <path d="M 103 50 Q 135 68 100 88" fill="none" stroke="#d6d3d1" stroke-width="2" stroke-linecap="round" />

    <!-- Coffee Liquid -->
    <ellipse cx="60" cy="40" rx="45" ry="16" fill="#5c2d16" stroke="#451a03" stroke-width="2" />
    <!-- Latte Art Heart -->
    <path d="M 60 38 Q 45 28 45 35 Q 45 44 60 50 Q 75 44 75 35 Q 75 28 60 38 Z" fill="#fef3c7" opacity="0.9" />

    <!-- Rising Steam -->
    <path d="M 50 15 Q 40 -10 55 -25 Q 70 -40 55 -60" fill="none" stroke="#a8a29e" stroke-width="2.5" opacity="0.4" stroke-linecap="round" />
    <path d="M 70 12 Q 80 -12 65 -28 Q 50 -44 70 -65" fill="none" stroke="#a8a29e" stroke-width="2" opacity="0.3" stroke-linecap="round" />
  </g>

  <!-- Vintage Book with Bookmark -->
  <g transform="translate(160, 320)">
    <rect x="0" y="0" width="180" height="40" rx="3" fill="#1e3a5f" />
    <rect x="4" y="4" width="172" height="32" rx="2" fill="#0f172a" />
    <rect x="180" y="5" width="12" height="30" fill="#f8fafc" />
    <!-- Red ribbon bookmark -->
    <path d="M 130 18 L 195 24 L 190 32 L 125 26 Z" fill="#dc2626" />
  </g>

  <!-- Dried Eucalyptus Vase -->
  <g transform="translate(100, 190)">
    <rect x="25" y="60" width="30" height="70" rx="10" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="2" />
    <path d="M 40 60 Q 30 10 15 -30" fill="none" stroke="#57534e" stroke-width="2" />
    <circle cx="20" cy="-10" r="10" fill="#99f6e4" opacity="0.7" />
    <circle cx="15" cy="-25" r="8" fill="#5eead4" opacity="0.8" />
  </g>

  <rect x="32" y="32" width="180" height="34" rx="17" fill="rgba(255,255,255,0.9)" stroke="#e7e5e4" />
  <circle cx="50" cy="49" r="5" fill="#78716c" />
  <text x="64" y="54" fill="#44403c" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="600">Bình Yên • Biết Ơn</text>
</svg>`;

// 6. cozy_room.svg
const cozyRoomSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="100%" height="100%">
  <defs>
    <linearGradient id="roomBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1c1917" />
      <stop offset="100%" stop-color="#292524" />
    </linearGradient>
    <radialGradient id="lampWarm" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0%" stop-color="#fef08a" stop-opacity="0.8" />
      <stop offset="40%" stop-color="#f59e0b" stop-opacity="0.25" />
      <stop offset="100%" stop-color="#f59e0b" stop-opacity="0" />
    </radialGradient>
  </defs>

  <rect width="800" height="480" fill="url(#roomBg)" />

  <!-- String Fairy Lights -->
  <path d="M 0 40 Q 200 100 400 50 Q 600 100 800 40" fill="none" stroke="#78716c" stroke-width="1.5" />
  <circle cx="100" cy="65" r="6" fill="#fef08a" />
  <circle cx="200" cy="88" r="6" fill="#fef08a" />
  <circle cx="300" cy="74" r="6" fill="#fef08a" />
  <circle cx="400" cy="50" r="6" fill="#fef08a" />
  <circle cx="500" cy="74" r="6" fill="#fef08a" />
  <circle cx="600" cy="88" r="6" fill="#fef08a" />
  <circle cx="700" cy="65" r="6" fill="#fef08a" />

  <!-- Floor -->
  <rect y="360" width="800" height="120" fill="#1c1917" />
  <ellipse cx="400" cy="410" rx="260" ry="45" fill="#44403c" />

  <!-- Cozy Armchair -->
  <g transform="translate(320, 200)">
    <!-- Backrest -->
    <rect x="30" y="20" width="100" height="110" rx="20" fill="#d97706" />
    <!-- Cushions -->
    <rect x="20" y="90" width="120" height="45" rx="14" fill="#b45309" />
    <!-- Armrests -->
    <rect x="5" y="70" width="30" height="65" rx="15" fill="#b45309" />
    <rect x="125" y="70" width="30" height="65" rx="15" fill="#b45309" />
    <!-- Throw Blanket -->
    <path d="M 40 40 Q 80 50 110 90 L 100 120 L 40 100 Z" fill="#0d9488" opacity="0.9" />
    <!-- Legs -->
    <line x1="25" y1="135" x2="15" y2="175" stroke="#78350f" stroke-width="6" stroke-linecap="round" />
    <line x1="135" y1="135" x2="145" y2="175" stroke="#78350f" stroke-width="6" stroke-linecap="round" />
  </g>

  <!-- Bookshelf -->
  <g transform="translate(100, 160)">
    <rect x="0" y="0" width="120" height="180" rx="4" fill="#44403c" stroke="#57534e" stroke-width="2" />
    <line x1="0" y1="60" x2="120" y2="60" stroke="#57534e" stroke-width="3" />
    <line x1="0" y1="120" x2="120" y2="120" stroke="#57534e" stroke-width="3" />
    <!-- Books -->
    <rect x="15" y="15" width="14" height="45" fill="#e11d48" />
    <rect x="32" y="10" width="18" height="50" fill="#0284c7" />
    <rect x="53" y="20" width="12" height="40" fill="#16a34a" />
    <rect x="70" y="12" width="22" height="48" fill="#d97706" />
    <!-- Small Plant -->
    <ellipse cx="60" cy="115" rx="14" ry="4" fill="#78716c" />
    <circle cx="60" cy="100" r="10" fill="#22c55e" />
  </g>

  <rect x="32" y="32" width="180" height="34" rx="17" fill="rgba(24,24,27,0.85)" stroke="#57534e" />
  <circle cx="50" cy="49" r="5" fill="#f59e0b" />
  <text x="64" y="54" fill="#fef3c7" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="600">Góc Nhỏ • Chữa Lành</text>
</svg>`;

// 7. starry_sky.svg
const starrySkySvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="100%" height="100%">
  <defs>
    <linearGradient id="cosmicBg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#020617" />
      <stop offset="50%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1e1b4b" />
    </linearGradient>
    <radialGradient id="milkyWay" cx="0.5" cy="0.4" r="0.6">
      <stop offset="0%" stop-color="#c084fc" stop-opacity="0.35" />
      <stop offset="60%" stop-color="#38bdf8" stop-opacity="0.15" />
      <stop offset="100%" stop-color="#020617" stop-opacity="0" />
    </radialGradient>
  </defs>

  <rect width="800" height="480" fill="url(#cosmicBg)" />
  <ellipse cx="400" cy="190" rx="350" ry="120" transform="rotate(-15, 400, 190)" fill="url(#milkyWay)" />

  <!-- Stars Cluster -->
  <g fill="#ffffff">
    <circle cx="120" cy="80" r="1.5" opacity="0.9" />
    <circle cx="180" cy="140" r="1" opacity="0.7" />
    <circle cx="240" cy="60" r="2" opacity="0.95" />
    <circle cx="290" cy="110" r="1.2" opacity="0.8" />
    <circle cx="350" cy="70" r="1.8" opacity="0.9" />
    <circle cx="420" cy="130" r="2.2" opacity="1" />
    <circle cx="480" cy="85" r="1.4" opacity="0.8" />
    <circle cx="530" cy="150" r="1.8" opacity="0.9" />
    <circle cx="610" cy="90" r="2" opacity="0.95" />
    <circle cx="680" cy="130" r="1.2" opacity="0.7" />
    <circle cx="730" cy="70" r="1.6" opacity="0.85" />
    
    <circle cx="80" cy="210" r="1.2" opacity="0.7" />
    <circle cx="150" cy="240" r="1.6" opacity="0.8" />
    <circle cx="270" cy="220" r="1.3" opacity="0.6" />
    <circle cx="390" cy="250" r="2" opacity="0.9" />
    <circle cx="510" cy="230" r="1.5" opacity="0.8" />
    <circle cx="640" cy="210" r="1.7" opacity="0.85" />
    <circle cx="710" cy="250" r="1.2" opacity="0.6" />
  </g>

  <!-- Shooting Star -->
  <line x1="520" y1="40" x2="380" y2="120" stroke="#bae6fd" stroke-width="2" stroke-linecap="round" />
  <circle cx="380" cy="120" r="3.5" fill="#ffffff" />

  <!-- Peaceful Mountain Silhouettes -->
  <polygon points="0,480 0,360 140,290 280,380 430,280 600,410 750,310 800,340 800,480" fill="#020617" />
  <polygon points="0,480 0,400 90,340 210,420 340,330 500,430 680,350 800,390 800,480" fill="#0b0f19" opacity="0.9" />

  <rect x="32" y="32" width="200" height="34" rx="17" fill="rgba(15,23,42,0.85)" stroke="#38bdf8" stroke-opacity="0.4" />
  <circle cx="50" cy="49" r="5" fill="#38bdf8" />
  <text x="64" y="54" fill="#e0f2fe" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="600">Bầu Trời Sao • Chỉ Mình Tôi</text>
</svg>`;

// Write post images
fs.writeFileSync(path.join(POSTS_DIR, 'study_desk.svg'), studyDeskSvg, 'utf8');
fs.writeFileSync(path.join(POSTS_DIR, 'rain_night.svg'), rainNightSvg, 'utf8');
fs.writeFileSync(path.join(POSTS_DIR, 'sunset_bridge.svg'), sunsetBridgeSvg, 'utf8');
fs.writeFileSync(path.join(POSTS_DIR, 'sunflower.svg'), sunflowerSvg, 'utf8');
fs.writeFileSync(path.join(POSTS_DIR, 'coffee_quiet.svg'), coffeeQuietSvg, 'utf8');
fs.writeFileSync(path.join(POSTS_DIR, 'cozy_room.svg'), cozyRoomSvg, 'utf8');
fs.writeFileSync(path.join(POSTS_DIR, 'starry_sky.svg'), starrySkySvg, 'utf8');

// ==========================================
// AVATARS (Cute, clean, high-res 120x120 SVGs)
// ==========================================
function makeAvatar(bgColor, innerSvg) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
    <rect width="120" height="120" rx="60" fill="${bgColor}" />
    ${innerSvg}
  </svg>`;
}

const avatars = {
  'avatar_cat.svg': makeAvatar('#fed7aa', `
    <!-- Cat Ears -->
    <polygon points="30,55 42,22 60,45" fill="#f97316" />
    <polygon points="35,50 43,30 54,45" fill="#fbcfe8" />
    <polygon points="90,55 78,22 60,45" fill="#f97316" />
    <polygon points="85,50 77,30 66,45" fill="#fbcfe8" />
    <!-- Head -->
    <circle cx="60" cy="65" r="32" fill="#fb923c" />
    <!-- Eyes (happy closed) -->
    <path d="M 44 62 Q 50 56 56 62" fill="none" stroke="#431407" stroke-width="3" stroke-linecap="round" />
    <path d="M 64 62 Q 70 56 76 62" fill="none" stroke="#431407" stroke-width="3" stroke-linecap="round" />
    <!-- Nose & Mouth -->
    <polygon points="57,69 63,69 60,73" fill="#f43f5e" />
    <path d="M 55 75 Q 60 79 65 75" fill="none" stroke="#431407" stroke-width="2.5" stroke-linecap="round" />
    <!-- Blushing cheeks -->
    <ellipse cx="42" cy="72" rx="5" ry="3" fill="#f43f5e" opacity="0.4" />
    <ellipse cx="78" cy="72" rx="5" ry="3" fill="#f43f5e" opacity="0.4" />
  `),

  'avatar_bird.svg': makeAvatar('#bae6fd', `
    <!-- Dove Body -->
    <circle cx="60" cy="60" r="28" fill="#ffffff" />
    <!-- Eye -->
    <circle cx="48" cy="56" r="3" fill="#0f172a" />
    <circle cx="47" cy="55" r="1" fill="#ffffff" />
    <!-- Beak -->
    <polygon points="36,60 25,63 36,67" fill="#f59e0b" />
    <!-- Wing -->
    <path d="M 58 58 Q 85 55 82 78 Q 65 78 58 58 Z" fill="#e2e8f0" />
    <!-- Olive sprig in beak -->
    <path d="M 28 64 Q 18 68 15 76" fill="none" stroke="#15803d" stroke-width="2" />
    <ellipse cx="16" cy="70" rx="4" ry="2.5" fill="#22c55e" transform="rotate(-30, 16, 70)" />
  `),

  'avatar_fox.svg': makeAvatar('#fef08a', `
    <!-- Fox Ears -->
    <polygon points="30,55 35,18 58,45" fill="#ea580c" />
    <polygon points="35,48 38,26 52,44" fill="#ffffff" />
    <polygon points="90,55 85,18 62,45" fill="#ea580c" />
    <polygon points="85,48 82,26 68,44" fill="#ffffff" />
    <!-- Fox Head -->
    <polygon points="30,55 90,55 60,95" fill="#ea580c" />
    <!-- White Cheeks -->
    <polygon points="30,55 60,95 45,65" fill="#ffffff" />
    <polygon points="90,55 60,95 75,65" fill="#ffffff" />
    <!-- Nose -->
    <circle cx="60" cy="93" r="4.5" fill="#0f172a" />
    <!-- Eyes -->
    <ellipse cx="48" cy="58" rx="3" ry="4.5" fill="#0f172a" />
    <ellipse cx="72" cy="58" rx="3" ry="4.5" fill="#0f172a" />
  `),

  'avatar_moon.svg': makeAvatar('#1e1b4b', `
    <!-- Crescent Moon -->
    <path d="M 52 24 A 36 36 0 1 0 88 88 A 30 30 0 1 1 52 24 Z" fill="#fef08a" />
    <!-- Sleeping Eye -->
    <path d="M 52 60 Q 56 65 60 60" fill="none" stroke="#854d0e" stroke-width="2" stroke-linecap="round" />
    <!-- Tiny Sparkles -->
    <circle cx="85" cy="35" r="2.5" fill="#ffffff" />
    <circle cx="28" cy="40" r="1.5" fill="#ffffff" />
    <circle cx="78" cy="95" r="2" fill="#ffffff" />
  `),

  'avatar_plant.svg': makeAvatar('#dcfce7', `
    <!-- Pot -->
    <polygon points="45,72 75,72 70,100 50,100" fill="#ea580c" />
    <ellipse cx="60" cy="72" rx="15" ry="3" fill="#9a3412" />
    <!-- Stem -->
    <path d="M 60 72 Q 60 48 58 35" fill="none" stroke="#16a34a" stroke-width="4" stroke-linecap="round" />
    <!-- Leaves -->
    <path d="M 58 45 Q 35 30 30 45 Q 45 55 58 48" fill="#22c55e" />
    <path d="M 58 35 Q 75 18 85 30 Q 75 45 58 38" fill="#4ade80" />
  `),

  'avatar_coffee.svg': makeAvatar('#f5d0fe', `
    <!-- Mug Body -->
    <rect x="36" y="44" width="48" height="48" rx="8" fill="#701a75" />
    <path d="M 84 54 Q 102 68 84 82" fill="none" stroke="#701a75" stroke-width="6" stroke-linecap="round" />
    <!-- Smiling face on mug -->
    <circle cx="50" cy="65" r="2.5" fill="#ffffff" />
    <circle cx="70" cy="65" r="2.5" fill="#ffffff" />
    <path d="M 54 74 Q 60 80 66 74" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" />
    <!-- Steam -->
    <path d="M 50 35 Q 46 25 52 18" fill="none" stroke="#a21caf" stroke-width="2" stroke-linecap="round" />
    <path d="M 66 35 Q 70 25 64 18" fill="none" stroke="#a21caf" stroke-width="2" stroke-linecap="round" />
  `),

  'avatar_whale.svg': makeAvatar('#0f172a', `
    <!-- Ocean Waves -->
    <path d="M 15 90 Q 35 80 60 90 Q 85 100 105 90" fill="none" stroke="#38bdf8" stroke-width="3" stroke-linecap="round" />
    <!-- Whale Body -->
    <path d="M 30 70 Q 50 45 80 50 Q 95 55 100 45 Q 95 62 85 70 Q 60 82 30 70 Z" fill="#0284c7" />
    <!-- Eye -->
    <circle cx="44" cy="64" r="2" fill="#ffffff" />
    <!-- Water Spout -->
    <path d="M 68 50 Q 65 35 55 30" fill="none" stroke="#bae6fd" stroke-width="2" stroke-linecap="round" />
    <path d="M 70 50 Q 72 35 80 30" fill="none" stroke="#bae6fd" stroke-width="2" stroke-linecap="round" />
  `),

  'avatar_star.svg': makeAvatar('#fef3c7', `
    <!-- Star -->
    <polygon points="60,25 70,50 95,60 70,70 60,95 50,70 25,60 50,50" fill="#f59e0b" />
    <circle cx="60" cy="60" r="14" fill="#fbbf24" />
    <!-- Cute Eyes -->
    <circle cx="55" cy="58" r="2" fill="#78350f" />
    <circle cx="65" cy="58" r="2" fill="#78350f" />
    <path d="M 57 65 Q 60 68 63 65" fill="none" stroke="#78350f" stroke-width="2" stroke-linecap="round" />
  `)
};

for (const [filename, content] of Object.entries(avatars)) {
  fs.writeFileSync(path.join(AVATARS_DIR, filename), content, 'utf8');
}

console.log('Successfully generated all image and avatar SVG assets!');
