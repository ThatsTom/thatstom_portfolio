import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const projectRoot = await realpath(fileURLToPath(new URL('../', import.meta.url)));
const host = '127.0.0.1';
const portInput = process.env.PORT ?? '5173';
const port = Number(portInput);

if (!/^\d+$/.test(portInput) || !Number.isSafeInteger(port) || port < 1 || port > 65535) {
  console.error('PORT deve ser um número inteiro entre 1 e 65535. A porta padrão é 5173.');
  process.exit(1);
}

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/plain; charset=utf-8'
};

function isInsideProject(filePath) {
  const relative = path.relative(projectRoot, filePath);
  return relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
}

function respond(request, response, status, message, extraHeaders = {}) {
  response.writeHead(status, {
    'Content-Type': 'text/plain; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': 'no-store',
    ...extraHeaders
  });
  response.end(request.method === 'HEAD' ? undefined : message);
}

const server = createServer(async (request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    respond(request, response, 405, 'Método não permitido.', { Allow: 'GET, HEAD' });
    return;
  }

  let pathname;

  try {
    const rawPath = (request.url ?? '/').split(/[?#]/, 1)[0];
    if (!rawPath.startsWith('/') || rawPath.startsWith('//')) {
      respond(request, response, 400, 'Endereço inválido.');
      return;
    }
    pathname = decodeURIComponent(rawPath);
  } catch {
    respond(request, response, 400, 'Endereço inválido.');
    return;
  }

  if (
    pathname.includes('\0') ||
    pathname.includes('\\') ||
    pathname.split('/').some(segment => segment === '.' || segment === '..')
  ) {
    respond(request, response, 403, 'Caminho não permitido.');
    return;
  }

  const requestedFile = pathname === '/'
    ? 'index.html'
    : pathname === '/favicon.ico'
      ? 'assets/img/favicon.svg'
      : pathname.slice(1);

  if (
    requestedFile !== 'index.html' &&
    !requestedFile.startsWith('assets/') &&
    !requestedFile.startsWith('licenses/')
  ) {
    respond(request, response, 404, 'Arquivo não encontrado.');
    return;
  }

  const filePath = path.resolve(projectRoot, requestedFile);
  if (!isInsideProject(filePath)) {
    respond(request, response, 403, 'Caminho não permitido.');
    return;
  }

  try {
    const resolvedPath = await realpath(filePath);
    if (!isInsideProject(resolvedPath)) {
      respond(request, response, 403, 'Caminho não permitido.');
      return;
    }
    const information = await stat(resolvedPath);
    if (!information.isFile()) {
      respond(request, response, 404, 'Arquivo não encontrado.');
      return;
    }

    response.writeHead(200, {
      'Content-Type': mimeTypes[path.extname(resolvedPath).toLowerCase()] ?? 'application/octet-stream',
      'Content-Length': information.size,
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-store'
    });

    if (request.method === 'HEAD') {
      response.end();
      return;
    }

    const stream = createReadStream(resolvedPath);
    stream.on('error', error => {
      console.error(`Erro ao ler arquivo: ${error.message}`);
      response.destroy();
    });
    response.on('close', () => stream.destroy());
    stream.pipe(response);
  } catch (error) {
    if (error.code === 'ENOENT' || error.code === 'ENOTDIR') {
      respond(request, response, 404, 'Arquivo não encontrado.');
    } else if (error.code === 'EACCES' || error.code === 'EPERM') {
      respond(request, response, 403, 'Arquivo indisponível.');
    } else {
      console.error(`Erro no servidor: ${error.message}`);
      respond(request, response, 500, 'Não foi possível abrir o arquivo.');
    }
  }
});

server.on('error', error => {
  if (error.code === 'EADDRINUSE') {
    console.error(`A porta ${port} já está em uso. Feche o outro servidor ou configure PORT.`);
  } else {
    console.error(`Não foi possível iniciar o servidor: ${error.message}`);
  }
  process.exitCode = 1;
});

server.listen(port, host, () => {
  const address = `http://${host}:${port}`;
  console.log(`Portfólio disponível em ${address}`);
  console.log('Acesso somente neste computador. Pressione Ctrl+C para encerrar.');
  if (process.argv.includes('--open') && process.platform === 'win32') {
    const browser = spawn('cmd.exe', ['/d', '/c', 'start', '', address], {
      stdio: 'ignore',
      windowsHide: true
    });
    browser.on('error', () => console.log(`Abra ${address} no seu navegador.`));
  }
});
