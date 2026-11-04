import { cp, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const outputDirectory = path.join(projectRoot, 'dist');
const entries = ['index.html', 'assets', 'licenses'];

try {
  for (const entry of entries) {
    const information = await stat(path.join(projectRoot, entry));
    if (entry === 'index.html' ? !information.isFile() : !information.isDirectory()) {
      throw new Error(`A entrada ${entry} não tem o formato esperado.`);
    }
  }

  await rm(outputDirectory, { recursive: true, force: true });
  await mkdir(outputDirectory, { recursive: true });

  for (const entry of entries) {
    await cp(path.join(projectRoot, entry), path.join(outputDirectory, entry), {
      recursive: true
    });
  }

  const sandbox = { window: {} };
  runInNewContext(await readFile(path.join(projectRoot, 'assets/js/data.js'), 'utf8'), sandbox, { timeout: 1000 });
  const { contacts, projects, areas } = sandbox.window.PORTFOLIO;
  const whatsappUrl = `https://wa.me/${contacts.whatsappNumber}`;
  const escapeAttribute = (value) => String(value).replace(/[&"<>]/g, (character) => ({
    '&': '&amp;', '"': '&quot;', '<': '&lt;', '>': '&gt;'
  }[character]));
  const setHref = (tag, href) => tag.replace(/\s+href="[^"]*"/, '').replace(/>$/, ` href="${escapeAttribute(href)}">`);
  const htmlPath = path.join(outputDirectory, 'index.html');
  let html = await readFile(htmlPath, 'utf8');
  html = html.replace(/<a\b[^>]*\bdata-contact="([^"]+)"[^>]*>/g, (tag, kind) => {
    const href = kind === 'phone' ? `tel:+${contacts.whatsappNumber}` : kind === 'whatsapp' ? whatsappUrl : contacts[kind];
    if (!href) throw new Error(`Contato desconhecido: ${kind}`);
    return setHref(tag, href);
  });
  html = html.replace(/(<a\b[^>]*\bdata-contact="phone"[^>]*>)[^<]*(<\/a>)/, (_, open, close) => `${open}${contacts.phoneDisplay}${close}`);
  html = html.replace(/(<small\b[^>]*\bdata-contact-display="phone"[^>]*>)[^<]*(<\/small>)/g,
    (_, open, close) => `${open}${escapeAttribute(contacts.phoneDisplay)}${close}`);
  html = html.replace(/<a\b[^>]*\bdata-contact-message\b[^>]*>/g,
    (tag) => setHref(tag, `${whatsappUrl}?text=${encodeURIComponent(contacts.introMessage)}`));
  html = html.replace(/(<span id="project-count">)[^<]*(<\/span>)/,
    (_, open, close) => `${open}${String(projects.length).padStart(2, '0')}${close}`);
  html = html.replace(/(<span id="area-count"[^>]*>)[^<]*(<\/span>)/,
    (_, open, close) => `${open}${String(Object.keys(areas).length).padStart(2, '0')} ÁREAS${close}`);
  html = html.replace(/(<p id="project-status"[^>]*>)[^<]*(<\/p>)/,
    (_, open, close) => `${open}${projects.length} soluções disponíveis.${close}`);
  html = html.replace(/(<script id="person-structured-data"[^>]*>)([\s\S]*?)(<\/script>)/,
    (_, open, json, close) => {
      const person = JSON.parse(json);
      person.telephone = `+${contacts.whatsappNumber}`;
      person.sameAs = [contacts.github, contacts.linkedin, contacts.instagram];
      return `${open}${JSON.stringify(person)}${close}`;
    });
  await writeFile(htmlPath, html, 'utf8');

  console.log('Build concluído. A pasta dist está pronta para uma hospedagem estática.');
} catch (error) {
  console.error(`Não foi possível gerar o build: ${error.message}`);
  process.exitCode = 1;
}
