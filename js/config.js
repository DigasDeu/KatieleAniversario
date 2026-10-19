/* ==========================================================================
   CONFIGURAÇÃO CENTRAL DA HOMENAGEM
   --------------------------------------------------------------------------
   Edite apenas este arquivo para personalizar nomes, textos, fotos, cores,
   música e créditos. Todo o restante do site lê os dados daqui.
   ========================================================================== */
window.SITE_CONFIG = {
  /* ---------------- Aniversariante ---------------- */
  nome: "Katiele",
  tratamento: "Enf.",            // aparece como "Enf. Katiele"

  /* Data de nascimento no formato "AAAA-MM-DD".
     Deixe null para não exibir nenhuma informação de idade.
     A idade só aparece se mostrarIdade também for true (com autorização). */
  dataNascimento: null,
  mostrarIdade: false,

  /* ---------------- Cores principais ---------------- */
  cores: {
    blush: "#F4DDE4",
    rosa: "#EAB9CA",
    vinho: "#783F55",
    dourado: "#D7B779",
    marfim: "#FFF9F2",
    texto: "#382B32"
  },

  /* ---------------- Tela inicial ---------------- */
  intro: {
    convite: "este momento foi preparado especialmente para você",
    botao: "Tenho uma surpresa para você",
    revelacao: "Hoje o dia é todo seu."
  },

  /* ---------------- Seção principal ---------------- */
  hero: {
    titulo: "Feliz aniversário,",
    mensagem:
      "Hoje é dia de celebrar sua vida, sua história, sua dedicação e a pessoa especial que você é. Que este novo ciclo seja repleto de saúde, felicidade, conquistas, amor e motivos para sorrir.",
    foto: "assets/images/retrato-estudio.jpg",
    fotoAlt: "Katiele sorrindo, sentada em uma cadeira, em um ensaio fotográfico"
  },

  /* ---------------- Contador de celebração ---------------- */
  contador: {
    titulo: "Um novo ciclo começa agora",
    palavras: ["saúde", "amor", "paz", "alegria", "conquistas", "realizações"]
  },

  /* ---------------- Carta ---------------- */
  carta: {
    saudacao: "Querida Katiele,",
    paragrafos: [
      "Hoje é um dia especial, uma oportunidade de celebrar não apenas mais um ano de vida, mas também a pessoa que você é e tudo aquilo que representa para as pessoas ao seu redor.",
      "Que nunca faltem saúde para continuar sua caminhada, coragem para enfrentar os desafios, sabedoria para tomar decisões e alegria para aproveitar cada conquista.",
      "A enfermagem é uma profissão que exige responsabilidade, conhecimento, empatia e dedicação. Que você continue encontrando motivos para se orgulhar da sua trajetória e que todo o bem que compartilha com as pessoas também encontre o caminho de volta até você.",
      "Que este novo ciclo seja repleto de portas abertas, sonhos realizados, momentos inesquecíveis e pessoas que tornem sua jornada ainda mais bonita.",
      "Feliz aniversário, Enf. Katiele! Que sua vida seja sempre iluminada por amor, paz, saúde e felicidade."
    ],
    despedida: "Com carinho e votos de um novo ciclo extraordinário."
  },

  /* ---------------- Jardim dos desejos ---------------- */
  desejos: [
    { titulo: "Saúde e bem-estar", mensagem: "Que o corpo tenha força, a mente tenha calma e cada dia comece com disposição para viver o que vale a pena." },
    { titulo: "Amor e boas amizades", mensagem: "Que você esteja sempre cercada de gente que cuida de você com o mesmo carinho com que você cuida dos outros." },
    { titulo: "Paz e tranquilidade", mensagem: "Que existam pausas leves no meio da correria, e que o coração encontre sossego mesmo nos dias cheios." },
    { titulo: "Realizações profissionais", mensagem: "Que o seu trabalho continue sendo reconhecido e que cada passo na carreira traga orgulho e satisfação." },
    { titulo: "Novas oportunidades", mensagem: "Que portas inesperadas se abram e que você tenha coragem de atravessar cada uma delas." },
    { titulo: "Viagens e boas memórias", mensagem: "Que venham novos lugares, novos pores do sol e histórias que você vai adorar contar depois." },
    { titulo: "Coragem para novos desafios", mensagem: "Que nenhum medo seja maior do que a sua vontade de crescer e de tentar outra vez." },
    { titulo: "Felicidade nos pequenos momentos", mensagem: "Que você perceba a alegria escondida no café quente, na risada boa e no abraço demorado." }
  ],

  /* ---------------- Bolo ---------------- */
  bolo: {
    pedido: "Feche os olhos por um instante e mentalize o seu desejo mais bonito.",
    celebracao: "Que seus desejos encontrem caminhos para se realizar!"
  },

  /* ---------------- Cartões misteriosos ---------------- */
  cartoes: [
    "Você merece viver coisas extraordinárias.",
    "Que a saúde e a paz acompanhem seus dias.",
    "Que nunca faltem pessoas verdadeiras ao seu lado.",
    "Que seus sonhos sejam maiores que seus medos.",
    "Que cada desafio traga aprendizado e crescimento.",
    "Que este novo ciclo seja ainda mais bonito que o anterior."
  ],

  /* ---------------- Galeria de memórias ----------------
     orientacao: "vertical" ou "horizontal" (ajuda a montar a grade).
     Remova, reordene ou edite as legendas livremente.            */
  fotos: [
    { src: "assets/images/semana-enfermagem.jpg", legenda: "Celebrando a Semana de Enfermagem Integrada de Maués", alt: "Katiele ao lado de um bolo decorado da Semana de Enfermagem", orientacao: "vertical" },
    { src: "assets/images/premio-mostra-1.jpg", legenda: "Prêmio na I Mostra Maués Aqui Tem SUS", alt: "Katiele e uma colega segurando troféus da Mostra Maués Aqui Tem SUS", orientacao: "horizontal" },
    { src: "assets/images/premio-mostra-2.jpg", legenda: "Um sorriso que diz tudo", alt: "Katiele rindo no palco segurando um troféu", orientacao: "horizontal" },
    { src: "assets/images/retrato.jpg", legenda: "Cachos, batom e alegria", alt: "Retrato de Katiele sorrindo", orientacao: "vertical" },
    { src: "assets/images/equipe-semsa.jpg", legenda: "Juntos com a equipe da SEMSA", alt: "Grupo de profissionais com camisas da SEMSA segurando a bandeira de Maués", orientacao: "horizontal" },
    { src: "assets/images/por-do-sol.jpg", legenda: "Olhos no horizonte", alt: "Katiele de perfil olhando o mar ao pôr do sol", orientacao: "vertical" },
    { src: "assets/images/mostra-amazonas.jpg", legenda: "VII Mostra Amazonas Aqui Tem SUS", alt: "Grupo segurando a bandeira de Maués diante do painel da Mostra Amazonas Aqui Tem SUS", orientacao: "horizontal" },
    { src: "assets/images/natal.jpg", legenda: "Brilho de fim de ano", alt: "Katiele de vestido vermelho em um cenário de Natal", orientacao: "vertical" },
    { src: "assets/images/selfie-colega.jpg", legenda: "Sorrisos que se completam", alt: "Selfie de Katiele com uma colega", orientacao: "horizontal" },
    { src: "assets/images/rio.jpg", legenda: "Natureza que renova", alt: "Katiele de costas acenando diante de um rio de águas verdes", orientacao: "vertical" },
    { src: "assets/images/festa.jpg", legenda: "Noite de diversão", alt: "Katiele com as mãos no rosto rindo, em ambiente com luz neon", orientacao: "horizontal" },
    { src: "assets/images/momento-1.jpg", legenda: "Momentos especiais", alt: "Selfie de Katiele com um rapaz", orientacao: "vertical" },
    { src: "assets/images/cachoeira.jpg", legenda: "Abraço na cachoeira", alt: "Katiele abraçando uma mulher diante de uma cachoeira", orientacao: "vertical" },
    { src: "assets/images/mirante.jpg", legenda: "Com quem faz a vida mais bonita", alt: "Katiele com pessoas queridas em um mirante sobre a floresta", orientacao: "horizontal" },
    { src: "assets/images/momento-2.jpg", legenda: "Carinho em forma de foto", alt: "Katiele dando um beijo no rosto de um rapaz", orientacao: "vertical" },
    { src: "assets/images/momento-3.jpg", legenda: "Dia de sol e água", alt: "Selfie de Katiele à beira d'água com um rapaz", orientacao: "vertical" },
    { src: "assets/images/sorrisos.jpg", legenda: "Abraço apertado", alt: "Selfie de Katiele abraçada a dois meninos", orientacao: "vertical" },
    { src: "assets/images/amigos.jpg", legenda: "Gente querida reunida", alt: "Grupo grande de amigos segurando sacolas de presente", orientacao: "horizontal" },
    { src: "assets/images/retrato-estudio.jpg", legenda: "Leveza de quem sabe sorrir", alt: "Katiele sentada em uma cadeira, olhando para cima e sorrindo", orientacao: "vertical" }
  ],

  /* ---------------- Trilha sonora ----------------
     Para usar uma faixa própria (licenciada), coloque o arquivo em
     assets/audio/ e informe o caminho, ex.: "assets/audio/trilha.mp3".
     Com null, o site toca "Parabéns a você" em som de caixinha de música,
     gerado no próprio navegador (melodia de domínio público).  */
  musica: {
    arquivo: null,
    titulo: "Parabéns a você"
  },

  /* ---------------- Celebração final ---------------- */
  final: {
    titulo: "Que a vida continue surpreendendo você com motivos para sorrir!",
    desejosFinais: ["Saúde todos os dias", "Amor por perto", "Paz no coração", "Sonhos realizados"]
  },

  /* ---------------- Créditos ---------------- */
  creditos: {
    titulo: "Uma homenagem criada com carinho.",
    paragrafos: [
      "Cada detalhe desta experiência foi pensado para transformar uma data especial em uma lembrança ainda mais bonita.",
      "Por trás desta pequena experiência digital está alguém que acredita que a tecnologia também pode transmitir sentimentos, celebrar pessoas e criar momentos inesquecíveis."
    ],
    rotulo: "Desenvolvimento e criação",
    autor: "Diego Fernando",
    equipe: "Mídia da SEMSA",
    /* Caminho de um logotipo oficial fornecido pela SEMSA (opcional). */
    logo: null,
    fechamento: "Uma criação digital desenvolvida com dedicação, criatividade e carinho para celebrar a vida da Enf. Katiele.",
    assinatura: "Porque algumas homenagens merecem ir além das palavras."
  }
};
