# IA Aplicada aos Negócios — curso de estudo

Aplicativo web (PWA) de leitura offline com material de estudo sobre inteligência
artificial aplicada a decisões de negócio: **8 módulos, 52 aulas, ~6h20 de leitura**.

**App:** https://alexmiromi.github.io/curso-ia-negocios/

## Módulos

| # | Módulo | Aulas |
|---|---|---|
| I | Estratégia Baseada em Dados | 7 |
| II | Fundamentos de IA para Líderes | 6 |
| III | Governança, Ética, Segurança e Risco | 7 |
| IV | IA em Finanças, Risco e Performance | 6 |
| V | IA Aplicada aos Processos | 6 |
| VI | IA Estratégica e Transformação | 6 |
| VII | IA Generativa, LLMs e o Trabalho | 7 |
| VIII | Machine Learning para Decisão | 7 |

Mais um glossário com 43 termos.

## Instalar como app no celular

**iPhone (Safari):** abrir o link → botão Compartilhar → *Adicionar à Tela de Início*.
**Android (Chrome):** abrir o link → menu ⋮ → *Instalar aplicativo* / *Adicionar à tela inicial*.

Depois de instalado funciona sem internet. O progresso de leitura fica salvo no aparelho.

## Recursos

- Modo claro/escuro com preferência salva
- Progresso por aula e por módulo
- Busca em todo o conteúdo e no glossário
- Navegação anterior/próxima entre as 52 aulas
- Offline completo via service worker
- Gráficos SVG com tooltip, simuladores interativos (árvore de receita, amostra de teste A/B, simulação de "espiar o teste"), autodiagnóstico e ficha de métrica salvos no aparelho (Módulo I)
- Vídeos do YouTube com capa e fallback quando estiver sem internet

## Estrutura

```
index.html    estrutura da página
app.css       estilos e temas
conteudo.js   todo o material de estudo (dados)
widgets.js    gráficos dinâmicos, simuladores, vídeo
app.js        roteador, progresso, busca
sw.js         cache offline
manifest.webmanifest
icons/
```

Para editar o conteúdo, mexa apenas em `conteudo.js`. Ao publicar uma alteração,
suba o número da versão em `sw.js` (`var CACHE = 'ia-negocios-v2'`) para invalidar
o cache dos aparelhos já instalados.

## Origem do material

Conteúdo autoral, escrito a partir da estrutura curricular pública do
*Programa de Inteligência Artificial Aplicada aos Negócios* (Fundação Dom Cabral /
CEDEM). **Não é material oficial da instituição**, não reproduz material dela,
não substitui o programa e não tem qualquer vínculo com ela.
