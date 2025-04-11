// deploy-hostinger.js
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Colores para console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

console.log(`${colors.blue}=== Iniciando proceso de build para Hostinger ===${colors.reset}`);

// Paso 1: Generar build optimizado
try {
  console.log(`${colors.yellow}Generando build de producción...${colors.reset}`);
  execSync('npm run build', { stdio: 'inherit' });
  console.log(`${colors.green}✓ Build generado con éxito${colors.reset}`);
} catch (error) {
  console.error(`${colors.red}✗ Error al generar el build: ${error.message}${colors.reset}`);
  process.exit(1);
}

// Paso 2: Copiar .htaccess al directorio de dist
try {
  console.log(`${colors.yellow}Copiando .htaccess al directorio dist...${colors.reset}`);
  if (fs.existsSync('./public/.htaccess')) {
    fs.copyFileSync('./public/.htaccess', './dist/.htaccess');
    console.log(`${colors.green}✓ Archivo .htaccess copiado con éxito${colors.reset}`);
  } else {
    console.log(`${colors.yellow}⚠ No se encontró el archivo .htaccess en /public${colors.reset}`);
  }
} catch (error) {
  console.error(`${colors.red}✗ Error al copiar .htaccess: ${error.message}${colors.reset}`);
}

// Paso 3: Verificar que el archivo index.html tenga rutas relativas
try {
  console.log(`${colors.yellow}Verificando rutas en index.html...${colors.reset}`);
  const indexPath = path.join('./dist', 'index.html');
  let indexContent = fs.readFileSync(indexPath, 'utf8');
  
  // Asegurar que las rutas sean relativas
  if (indexContent.includes('href="/') || indexContent.includes('src="/')) {
    indexContent = indexContent.replace(/href="\//g, 'href="./');
    indexContent = indexContent.replace(/src="\//g, 'src="./');
    fs.writeFileSync(indexPath, indexContent);
    console.log(`${colors.green}✓ Rutas en index.html actualizadas para ser relativas${colors.reset}`);
  } else {
    console.log(`${colors.green}✓ Las rutas en index.html ya son relativas${colors.reset}`);
  }
} catch (error) {
  console.error(`${colors.red}✗ Error al verificar index.html: ${error.message}${colors.reset}`);
}

console.log(`${colors.blue}=== Build completado para Hostinger ===${colors.reset}`);
console.log(`${colors.green}Tu aplicación está lista para ser subida a Hostinger.${colors.reset}`);
console.log(`${colors.yellow}Instrucciones:${colors.reset}`);
console.log(`1. Sube todo el contenido de la carpeta "${colors.green}dist${colors.reset}" a la carpeta raíz de tu hosting.`);
console.log(`2. Asegúrate de que el dominio apunte al archivo ${colors.green}index.html${colors.reset}.`);
console.log(`3. Si tu aplicación muestra 404 en rutas distintas a la raíz, verifica que el archivo ${colors.green}.htaccess${colors.reset} se haya subido correctamente.`);
