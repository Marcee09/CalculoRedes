function validarIP(ip) {
  const octetos = ip.split(".");
  if (octetos.length !== 4) return false;
  return octetos.every(octeto => {
    const numero = parseInt(octeto, 10);
    return numero >= 0 && numero <= 255;
  });
}

function bitsRedes(mascara) {
  if (!validarIP(mascara)) {
    alert("La máscara de subred no es válida.");
    return 0;
  }
  let bitRedes = 0;
  const octetos = mascara.split(".");
  for (let octeto of octetos) {
    const binario = parseInt(octeto, 10).toString(2).padStart(8, '0');
    for (let bit of binario) {
      if (bit === "1") bitRedes++;
    }
  }
  return bitRedes;
}

function nuevoBloque(subredes, bitRedes) {
  let bitNecesarios = 1;
  while (2 ** bitNecesarios < subredes) bitNecesarios++;
  return bitRedes + bitNecesarios;
}

function calcularMascara(cidr) {
  let bits = '1'.repeat(cidr) + '0'.repeat(32 - cidr);
  const octetos = [];
  for (let i = 0; i < 32; i += 8) {
    octetos.push(parseInt(bits.slice(i, i + 8), 2));
  }
  return octetos.join(".");
}

function redSuficiente(bitsHost, PCs) {
  const maxHosts = (2 ** bitsHost) - 2;
  return maxHosts >= PCs;
}

function obtenerRangoSubred(ip_base, subnet_size, offset) {
  if (!validarIP(ip_base)) {
    alert("La IP base no es válida.");
    return {};
  }
  let base_num = ip_base.split('.').reduce((sum, oct, i) => sum + (parseInt(oct) << (8 * (3 - i))), 0);
  let network_id = base_num + (offset * subnet_size);
  let broadcast = network_id + subnet_size - 1;
  let first_host = network_id + 1;
  let last_host = broadcast - 1;

  const convertirIp = (num) => [24, 16, 8, 0].map(shift => (num >> shift) & 255).join('.');
  return {
    idRed: convertirIp(network_id),
    primerHost: convertirIp(first_host),
    ultimoHost: convertirIp(last_host),
    broadcast: convertirIp(broadcast)
  };
}

function subredes(routers, ip_base, cidr) {
  const subnet_size = 2 ** (32 - cidr);
  let resultado = "";
  for (let i = 0; i < routers; i++) {
    const { idRed, primerHost, ultimoHost, broadcast } = obtenerRangoSubred(ip_base, subnet_size, i);
    if (!idRed) continue; // Si la IP base es inválida, omitimos la subred
    resultado += `Router ${i + 1}\n`;
    resultado += `ID: ${idRed}/${cidr}\n`;
    resultado += `Primer host: ${primerHost}/${cidr}\n`;
    resultado += `Último host: ${ultimoHost}/${cidr}\n`;
    resultado += `Broadcast: ${broadcast}/${cidr}\n\n`;
  }
  return resultado;
}

function calcularSubred() {
  const ip = document.getElementById("ip").value;
  const mascara = document.getElementById("mascara").value;
  const subredesDeseadas = parseInt(document.getElementById("subredes").value);
  const PCs = parseInt(document.getElementById("pcs").value);
  const routers = parseInt(document.getElementById("routers").value);

  if (!validarIP(ip) || !validarIP(mascara)) {
    alert("Por favor, introduce una IP y máscara válidas en formato x.x.x.x");
    return;
  }

  const bitsRedesIniciales = bitsRedes(mascara);
  const nuevoCidr = nuevoBloque(subredesDeseadas, bitsRedesIniciales);
  const nuevaMascara = calcularMascara(nuevoCidr);
  const bitsHost = 32 - nuevoCidr;
  const esSuficiente = redSuficiente(bitsHost, PCs);
  const infoSubredes = subredes(routers, ip, nuevoCidr);

  const resultados = document.getElementById("resultados");
  resultados.innerText = `Bloque de direcciones: ${ip}/${nuevoCidr}\n`;
  resultados.innerText += `Nueva máscara: ${nuevaMascara}\n`;
  resultados.innerText += `Bits para host: ${bitsHost}\n`;
  resultados.innerText += esSuficiente ? "Suficientes bits para los hosts.\n" : "No es suficiente para los hosts.\n";
  resultados.innerText += infoSubredes;
}
