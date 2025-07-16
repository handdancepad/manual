// Flechas PIU animadas: usan varias imágenes PNG, todas se mueven, aún más transparencia general y en el blur
const FLECHA_URLS = ["img/image.png", "img/image2.png", "img/image3.png", "img/image4.png"];
const N = 5;
const cont = document.getElementById('piu-flechas');

let flechas = [];

function randomBetween(a, b) {
  return Math.random() * (b - a) + a;
}
function randomInt(a, b) {
  return Math.floor(Math.random() * (b - a + 1)) + a;
}

// Direcciones posibles, cada una tiene un ángulo base (punta)
const DIRS = [
  {x: 1,   y: 0,   angle: 0},    // derecha
  {x: -1,  y: 0,   angle: 180},  // izquierda
  {x: 0,   y: 1,   angle: 90},   // abajo
  {x: 0,   y: -1,  angle: -90},  // arriba
  {x: 0.7, y: 0.7, angle: 45},   // diagonal abajo derecha
  {x: -0.7,y: 0.7, angle: 135},  // diagonal abajo izquierda
  {x: 0.7, y: -0.7,angle: -45},  // diagonal arriba derecha
  {x: -0.7,y: -0.7,angle: -135}, // diagonal arriba izquierda
];

function creaFlechaObj() {
  // Selecciona imagen aleatoria
  const img = document.createElement('img');
  img.src = FLECHA_URLS[randomInt(0, FLECHA_URLS.length - 1)];
  img.className = 'flecha-movil flecha-fadein';

  let size = randomBetween(15, 32);
  if(window.innerWidth >= 900) size = randomBetween(24, 36);
  img.style.width = img.style.height = size + 'px';

  // Posición inicial aleatoria
  let x = randomBetween(5, 95); // vw
  let y = randomBetween(8, 85); // vh

  // Dirección inicial aleatoria
  let dirObj = DIRS[randomInt(0, DIRS.length - 1)];
  let dir = {x: dirObj.x, y: dirObj.y};
  let angle = dirObj.angle;

  let flecha = {
    img, x, y, dir, angle,
    life: randomBetween(2.8, 6.0), // segundos
    t: 0,
    size,
    id: Math.random() + Date.now()
  };

  // Estilo inicial
  img.style.left = flecha.x + 'vw';
  img.style.top = flecha.y + 'vh';
  img.style.filter = "drop-shadow(0 0 10px #fa1e9a99) drop-shadow(0 0 6px #fff17688) drop-shadow(0 0 10px #1e90ff88)";
  img.style.opacity = "0.27"; // Más transparente
  img.style.position = "absolute";
  img.style.zIndex = "11";
  img.style.pointerEvents = "none";
  img.style.transform = `rotate(${angle}deg) scale(${randomBetween(0.85, 1.07)}) perspective(160px)`;
  if (cont) cont.appendChild(img);

  flechas.push(flecha);
}

// Actualiza cada flecha, mueve y controla lógica inteligente
function actualizaFlechas(dt) {
  for (let i = flechas.length - 1; i >= 0; i--) {
    let f = flechas[i];
    f.t += dt;

    // Todas se mueven SIEMPRE
    // De vez en cuando cambia de dirección aleatoriamente
    if (Math.random() < 0.01) {
      let dirObj = DIRS[randomInt(0, DIRS.length - 1)];
      f.dir = {x: dirObj.x, y: dirObj.y};
      f.angle = dirObj.angle;
    }
    // Movimiento
    f.x += f.dir.x * randomBetween(0.5, 1.1) * f.size/32;
    f.y += f.dir.y * randomBetween(0.5, 1.1) * f.size/32;

    // Rebote en los bordes
    if (f.x < 1 || f.x > 99) { f.dir.x *= -1; f.angle = -f.angle; }
    if (f.y < 1 || f.y > 97) { f.dir.y *= -1; f.angle = -f.angle; }

    // Chequea colisiones y reacciona
    for (let j = 0; j < flechas.length; j++) {
      if (i !== j) {
        let fx = flechas[j];
        let dx = fx.x - f.x;
        let dy = fx.y - f.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        // Si chocan, cambian de dirección opuesta y rotan
        if (dist < (f.size / 10 + fx.size / 10)) {
          f.dir.x *= -1; f.dir.y *= -1;
          f.angle += randomBetween(-80, 80);
        }
      }
    }

    // Aplica posición y transformación (punta = dirección)
    f.img.style.left = f.x + 'vw';
    f.img.style.top = f.y + 'vh';
    f.img.style.transform = `rotate(${f.angle}deg) scale(1) perspective(160px)`;

    // Fadeout y blur al final de vida
    if (f.t > f.life - 0.5) {
      f.img.classList.remove('flecha-float');
      f.img.classList.add('flecha-fadeout');
      f.img.style.filter = "drop-shadow(0 0 32px #fa1e9a55) drop-shadow(0 0 20px #fff17644) drop-shadow(0 0 32px #1e90ff44) blur(7px)";
      f.img.style.opacity = String(Math.max(0, (f.life - f.t) / 0.5 * 0.16)); // Más transparente al desvanecer
    }
    // Remueve flecha al terminar
    if (f.t > f.life) {
      if (f.img.parentNode) f.img.parentNode.removeChild(f.img);
      flechas.splice(i, 1);
      setTimeout(creaFlechaObj, randomBetween(500, 1800));
    }
  }
}

// Inicializa flechas
for (let i = 0; i < N; i++) setTimeout(creaFlechaObj, randomInt(0, 3000));

// Animación "inteligente"
let ultimo = Date.now();
function loop() {
  let ahora = Date.now();
  let dt = Math.min(0.033, (ahora - ultimo) / 1000); // máximo 33ms/frame
  ultimo = ahora;
  actualizaFlechas(dt);
  requestAnimationFrame(loop);
}
loop();