// Script de uso único: crea en Firebase Authentication una cuenta por cada persona
// listada en usuarios-PRIVADO-passwords-no-subir.json (email + password + name).
// No forma parte de la app (no se importa desde src/), solo se corre manualmente con Node.
//
// Uso:
//   1. Coloca el archivo de la clave de administrador (Service Account) en la raíz del proyecto.
//   2. node bulk-create-users.cjs
//
// Es seguro correrlo varias veces: si un correo ya existe, simplemente se salta.

const fs = require('fs');
const path = require('path');

const SERVICE_ACCOUNT_PATTERN = /firebase-adminsdk.*\.json$|^serviceAccountKey\.json$/i;
const USERS_FILE = path.join(__dirname, 'usuarios-PRIVADO-passwords-no-subir.json');

function findServiceAccountFile() {
  const candidates = fs.readdirSync(__dirname).filter(f => SERVICE_ACCOUNT_PATTERN.test(f));
  if (candidates.length === 0) {
    console.error('No encontré el archivo de la clave de administrador (Service Account) en la raíz del proyecto.');
    console.error('Descárgalo desde Firebase Console -> Project settings -> Service accounts -> Generate new private key,');
    console.error('y colócalo en:', __dirname);
    process.exit(1);
  }
  if (candidates.length > 1) {
    console.error('Encontré varios archivos que parecen claves de administrador:', candidates);
    console.error('Deja solo uno en la carpeta y vuelve a correr el script.');
    process.exit(1);
  }
  return path.join(__dirname, candidates[0]);
}

async function main() {
  const serviceAccountPath = findServiceAccountFile();
  console.log('Usando clave de administrador:', path.basename(serviceAccountPath));

  const admin = require('firebase-admin');
  admin.initializeApp({
    credential: admin.credential.cert(require(serviceAccountPath)),
  });

  const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
  console.log(`Creando cuentas para ${users.length} personas...`);

  let created = 0;
  let alreadyExisted = 0;
  let failed = 0;

  for (const user of users) {
    try {
      await admin.auth().createUser({
        email: user.email,
        password: user.password,
        displayName: user.name,
      });
      created++;
      console.log('✓ Creada:', user.email);
    } catch (err) {
      if (err.code === 'auth/email-already-exists') {
        alreadyExisted++;
      } else {
        failed++;
        console.error('✗ Error con', user.email, ':', err.message);
      }
    }
  }

  console.log('\n--- Resumen ---');
  console.log('Creadas ahora:', created);
  console.log('Ya existían:', alreadyExisted);
  console.log('Fallaron:', failed);
  console.log('Total procesadas:', users.length);
}

main().catch(err => {
  console.error('Error general:', err);
  process.exit(1);
});
