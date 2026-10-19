# Feliz Aniversário, Enf. Katiele 💖

Uma experiência digital interativa de aniversário: presente que se abre, carta em envelope, homenagem à enfermagem, jardim dos desejos, bolo com velinhas (inclusive com sopro pelo microfone), cartões misteriosos, galeria de memórias, trilha sonora opcional, chuva de confetes e créditos finais.

**Desenvolvimento e criação:** Diego Fernando — Mídia da SEMSA

---

## Estrutura

```
katiele-aniversario/
├── index.html             estrutura de todas as seções
├── css/style.css          identidade visual, layout, responsividade e animações
├── js/config.js           ⭐ TODOS os textos, fotos, cores, música e créditos
├── js/animations.js       partículas, confetes, pétalas e efeitos de texto
├── js/interactions.js     presente, carta, desejos, bolo, cartões, galeria, música, final
├── js/main.js             inicialização, navegação, progresso e contador
├── assets/images/         fotografias otimizadas (máx. 1400 px)
├── assets/audio/          coloque aqui uma trilha licenciada (opcional)
└── .nojekyll              evita processamento do GitHub Pages
```

Sem frameworks e sem etapas de build: HTML, CSS e JavaScript puros. A única dependência externa são as fontes do Google Fonts (Playfair Display, Inter e Pinyon Script). Se elas não carregarem, o site usa fontes do sistema e continua funcionando.

## Executar localmente

Abra um terminal na pasta do projeto e rode um servidor simples:

```bash
# Python 3
python -m http.server 8000
# ou Node
npx serve .
```

Depois acesse `http://localhost:8000`.

> O microfone (sopro nas velinhas) só funciona em `localhost` ou em endereços `https://`, como o GitHub Pages. Abrir o `index.html` com duplo clique também funciona, mas o microfone pode ficar indisponível.

## Publicar no GitHub Pages

1. Crie um repositório no GitHub (ex.: `aniversario-katiele`).
2. Envie todos os arquivos desta pasta para a raiz do repositório:
   ```bash
   git init
   git add .
   git commit -m "Homenagem de aniversário para a Enf. Katiele"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/aniversario-katiele.git
   git push -u origin main
   ```
3. No repositório, vá em **Settings → Pages**.
4. Em **Build and deployment**, escolha **Deploy from a branch**, branch `main`, pasta `/ (root)` e salve.
5. Em um ou dois minutos o site estará em `https://SEU-USUARIO.github.io/aniversario-katiele/`.

Todos os caminhos do projeto são relativos, então ele funciona dentro da subpasta do repositório sem ajustes.

## Personalizar

Tudo fica em **`js/config.js`**:

| O que mudar | Campo |
|---|---|
| Nome e tratamento | `nome`, `tratamento` |
| Idade (só com autorização) | `dataNascimento: "AAAA-MM-DD"` e `mostrarIdade: true` |
| Cores principais | `cores` |
| Textos do presente, hero e carta | `intro`, `hero`, `carta` |
| Desejos do jardim | `desejos` |
| Mensagens dos cartões | `cartoes` |
| Fotos e legendas | `fotos` (use `orientacao: "vertical"` ou `"horizontal"`) |
| Música | `musica.arquivo` |
| Créditos e logotipo | `creditos` (`logo` aceita o caminho de um logotipo oficial fornecido) |

### Fotos
Coloque as imagens em `assets/images/` e adicione uma entrada em `fotos`. Fotos que não forem encontradas são removidas da grade automaticamente. Se a lista ficar vazia, aparece uma composição elegante avisando que as imagens serão adicionadas depois.

Antes de publicar, confirme que todas as pessoas que aparecem nas fotos concordam com a divulgação. Remova do `config.js` qualquer foto que não deva ficar pública.

### Música
Sem configuração, o botão de música toca "Parabéns a você" em som de caixinha de música, gerado pelo próprio navegador (a melodia é de domínio público). Para usar uma faixa própria, salve um arquivo **licenciado** (por exemplo, da Biblioteca de Áudio do YouTube ou com licença Creative Commons que permita o uso) em `assets/audio/` e informe o caminho:

```js
musica: { arquivo: "assets/audio/trilha.mp3", titulo: "Nome da faixa" }
```

A música nunca toca sozinha: só começa quando a visitante aperta o botão.

## Acessibilidade e desempenho

- Navegável por teclado, com foco visível e nomes acessíveis em todos os controles.
- Lightbox fecha com Esc, botão ou clique fora; setas navegam entre fotos; deslizar funciona no celular.
- Respeita a preferência de **movimento reduzido** do sistema.
- Partículas pausam quando a aba fica em segundo plano; confetes têm duração limitada.
- Não há cadastro, login nem armazenamento de dados pessoais. O microfone só é ativado após permissão e é desligado logo depois do sopro.
