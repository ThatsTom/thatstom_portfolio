# Dependências

GSAP e ScrollTrigger são incluídos no pacote para funcionar sem CDN. Os ícones são SVGs locais. As fontes VT323 e Space Grotesk são solicitadas ao Google Fonts e têm alternativas do sistema para uso offline.

Os símbolos de Node.js, TypeScript, React, Angular, Python, OpenAI, Docker, AWS e WhatsApp usados em `../index.html` vêm do conjunto [Simple Icons 14.15.0](https://github.com/simple-icons/simple-icons/tree/14.15.0/icons). O projeto Simple Icons é distribuído sob [CC0 1.0](https://github.com/simple-icons/simple-icons/blob/14.15.0/LICENSE.md); nomes e marcas pertencem a seus respectivos titulares. Os vetores foram incorporados ao HTML para funcionar também ao abrir `index.html` diretamente.

## JavaScript

| Dependência | Versão | Arquivo local | Origem |
| --- | --- | --- | --- |
| GSAP | 3.13.0 | `vendor/gsap.min.js` | https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js |
| GSAP ScrollTrigger | 3.13.0 | `vendor/ScrollTrigger.min.js` | https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js |

A licença do GSAP está em `../licenses/GSAP-LICENSE.txt`. Os avisos originais nos arquivos distribuídos foram preservados. O texto foi obtido em https://gsap.com/standard-license/ em 03/11/2026; a página informa vigência em 30/04/2025.

## Fontes web

O HTML carrega **VT323** e **Space Grotesk** pelo endereço oficial do Google Fonts:

- https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&family=VT323&display=swap

Os arquivos das fontes não acompanham o ZIP. Se não houver conexão, a página é apresentada com fontes alternativas; as larguras móveis foram testadas sem depender do carregamento das fontes.

Referências e licenças das famílias: `../licenses/VT323-OFL.txt` e `../licenses/SPACE-GROTESK-OFL.txt`.

## Atualizações

O GSAP é utilizado na versão 3.13.0. Para atualizar, substitua o core e o ScrollTrigger juntos, preservando os avisos e a licença. Para mudar as fontes, edite o link do Google Fonts no início de `index.html` e as variáveis de família em `css/site.css`.
