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

## Áudio (audiobook)

O Módulo I tem narração completa: **7 aulas, 30 minutos**, geradas a partir de roteiros
escritos para ouvido (em `audio/roteiros/`) — os gráficos são descritos em palavras e as
tabelas viradas em frases.

- Player com velocidade **1× · 1,25× · 1,5× · 1,75× · 2×**, ±15 s e barra arrastável
- Continua de onde você parou, por aula
- Toca com a tela desligada e aparece no painel do carro (Media Session API): nome da aula
  e botões do volante funcionam
- Emenda automática entre aulas
- Botão "baixar áudio" na tela do módulo, para ouvir sem internet

Para regerar com outra voz ou outro ritmo:

```bash
say -v '?' | grep pt_BR     # vozes disponíveis
audio/gerar.sh Reed 165     # voz, palavras por minuto (padrão: Luciana 172)
```

Depois de regerar, confira as durações com `audio/gerar.sh --manifesto` e atualize o
campo `aud:` de cada aula em `conteudo.js`.

## Recursos

- Modo claro/escuro com preferência salva
- Progresso por aula e por módulo
- Busca em todo o conteúdo e no glossário
- Navegação anterior/próxima entre as 52 aulas
- Offline completo via service worker
- **Módulo I:** 10 gráficos SVG com tooltip · simulador da árvore de receita · calculadora de amostra de teste A/B · simulação de "espiar o teste" · autodiagnóstico de maturidade · ficha de métrica
- **Módulo II:** 9 gráficos SVG · triagem regra/ML/generativa · simulação de treino passo a passo · sorteio da próxima palavra com temperatura · contador de tokens e custo mensal · calculadora do custo do erro · comparador comprar/alugar/construir · avaliador dos seis filtros
- Vídeos do YouTube com capa e fallback quando estiver sem internet

## Estrutura

```
index.html    estrutura da página
app.css       estilos e temas
conteudo.js   todo o material de estudo (dados)
widgets.js    gráficos dinâmicos, simuladores, vídeo
player.js     player de áudio (velocidade, fila, painel do carro)
audio/        MP3 das aulas + roteiros de narração + gerar.sh
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
