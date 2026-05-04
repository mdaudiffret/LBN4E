/* global */
const DEFAULT_DATA = {
  infosRevealed: false,

  /* Countdown target — ISO 8601, modifiable via admin */
  countdownISO: "2026-06-12T16:00:00",

  /* 9 codes de révélation — à distribuer via les posts de la Gazette */
  revealCodes: [
    "athos", "porthos", "aramis",
    "dartagan", "rochefort", "buckingham",
    "richelieu", "milady", "constance"
  ],

  chateau: "Chasteau de Beaumesnil",
  dateLabel: "Été · Anno MMXXVI",
  adresse: "2 Rue des Forges · 27410 Beaumesnil · Normandie",
  dateDebut: "Vendredi · XII Juin · MMXXVI",
  dateFin: "Lundi · XV Juin · MMXXVI",
  heureArrivee: "16h00 (par·delà la herse)",
  heureDepart: "11h00 (avant l'angelus)",
  routeCaleche: "A13 · sortie 18 · 1h45 depuis Paris·Centre",
  routeTrain: "Évreux · puis cocher loué · 25min",
  gps: "49.0231° N · 0.7752° E",
  contactEmail: "intendance@lbn4e.royal",
  contactTel: "+33 ⚜ 06 ⚜ 4·MOUSQUET",

  equipement: [
    { cat: "I",   titre: "Coffre & Linge",    desc: "Une malle, vostre nécessaire de toilette, & des draps point n'avez besoin — ils sont fournis par la maison." },
    { cat: "II",  titre: "Habit du Soir",     desc: "Un costume pour le bal du samedi : pourpoint, dentelles, plumes au chapeau ou veste·smoking·néon." },
    { cat: "III", titre: "Lame & Bouclier",   desc: "Espée·factice·en·mousse fournies sur place. Mais si vous avez vostre fleuret personnel, qu'il soit le bienvenu." },
    { cat: "IV",  titre: "Chaussons",         desc: "Pavés du chasteau, sentiers de fougère & sols de marbre : prévoyez bottes & escarpins." },
    { cat: "V",   titre: "Engeance",          desc: "Vos enfants. Bagages réduits : un doudou, une cape, un sourire. Tout le reste est sur place." },
    { cat: "VI",  titre: "Vivres",            desc: "Tout est compté. N'apportez rien — sauf une bouteille pour la cave commune si le cœur vous en dit." },
  ],

  agenda: [
    {
      roman: "I", code: "DAY·00", label: "Vendredi soir",
      titre: "Arrivée & Adoubement",
      evts: [
        { h: "16h00", t: "Levée du pont·levis · accueil aux écuries" },
        { h: "17h30", t: "Distribution des chambres & des panaches" },
        { h: "19h00", t: "Apéritif sous la voûte · vin de Loire & beats synthwave" },
        { h: "20h30", t: "Souper du Cardinal · pâté en croûte & confidences" },
        { h: "23h00", t: "Veillée · contes des trois à la cheminée·plasma" },
      ]
    },
    {
      roman: "II", code: "DAY·01", label: "Samedi",
      titre: "Joustes & Jeux",
      evts: [
        { h: "09h00", t: "Petit·desjeuner royal · viennoiseries & matcha" },
        { h: "10h30", t: "Tournoi des escrimeurs · cour pavée · enfants & parents" },
        { h: "12h30", t: "Pique·nique des mousquetaires · sur les douves" },
        { h: "15h00", t: "Course au trésor : la rançon de Buckingham (jeune lignée)" },
        { h: "17h00", t: "Goûter · chocolat chaud · macarons" },
        { h: "20h00", t: "Bal du Cardinal · costumé · DJ et clavecin · jusqu'à plus·d'heure" },
      ]
    },
    {
      roman: "III", code: "DAY·02", label: "Dimanche",
      titre: "Repos & Ripailles",
      evts: [
        { h: "10h00", t: "Brunch grasse·matinée · œufs bénédictins" },
        { h: "12h00", t: "Promenade aux jardins à la française" },
        { h: "14h30", t: "Atelier escrime·laser pour les enfants · arène de la chapelle" },
        { h: "16h30", t: "Thé·glacé & énigmes du Père Joseph" },
        { h: "20h00", t: "Banquet final · cinq services · feu d'artifice" },
        { h: "22h30", t: "Cinéma de plein air · projection des trois (1973) sur les remparts" },
      ]
    },
    {
      roman: "IV", code: "DAY·03", label: "Lundi matin",
      titre: "Adieux",
      evts: [
        { h: "08h00", t: "Petit·desjeuner libre · café fort & restes glorieux" },
        { h: "10h00", t: "Photo de groupe sur le perron · drone & dague croisée" },
        { h: "11h00", t: "Bercement vers la sortie · dernières embrassades" },
      ]
    },
  ],

  posts: [
    {
      id: "post-2026-04-28",
      iso: "2026-04-28",
      dateShort: "28·IV·MMXXVI",
      dateLong: "Mardi 28 d'Avril · MMXXVI",
      titre: "Les Lettres sont parties · La compaignie est constituée",
      author: "Intendance · LBN4E",
      imageKind: "manuscrit",
      tags: ["Convocation", "Lignée", "Calendrier"],
      paragraphes: [
        "Oyez, oyez, mes très·honorez compaignons : ce jour, à la pointe de l'aube, vingt·et·trois pigeons messagers ont esté lâchez vers les quatre coings du royaume, portant en leur bec la convocation officielle au Weekend LBN4E.",
        "La liste des conviez est close. Vingt·deux familles ont respondu présent, soit cinquante·et·une âmes au total — dont seize de la jeune lignée, qui constitueront la cohorte des cadets·mousquetaires. Le Cardinal lui·mesme n'aurait su rassembler plus brillante assemblée.",
        "Les chambres sont attribuées par tirage au sort équitable. Le détail vous parviendra par messager dédié dès que les lettres auront esté ouvertes — patience, donc, jusqu'à ce que le sceau soit rompu sur la page d'infos pratiques."
      ]
    },
    {
      id: "post-2026-03-15",
      iso: "2026-03-15",
      dateShort: "15·III·MMXXVI",
      dateLong: "Dimanche 15 de Mars · MMXXVI",
      titre: "Le Chasteau a esté trouvé · Reconnaissance du terrain",
      author: "Athos · Éclaireur",
      imageKind: "chateau",
      tags: ["Repérage", "Chasteau", "Logistique"],
      paragraphes: [
        "Au terme de quatre weekends d'errance par les routes de Normandie & de Brie, l'éclaireur·chef rapporte avoir mis la main sur la place·forte idéale : douves remplies, voûtes en ogive, & — ô surprise — fibre optique tirée jusqu'aux combles.",
        "Le maistre des lieux nous accueille dès la mi·juin. Il dispose de seize chambres principales, d'une grange aménagée, & d'un dortoir pour la jeune lignée — soit de quoi loger toute la compaignie sous un mesme toit.",
        "Photos & plans seront communiquez en temps utile. Pour l'heure, retenez seulement ceci : il y a une cour pavée, un jardin à la française, & un escalier d'honneur en colimaçon qui appelle indubitablement le duel à l'épée·néon."
      ]
    },
    {
      id: "post-2026-02-02",
      iso: "2026-02-02",
      dateShort: "02·II·MMXXVI",
      dateLong: "Lundi 02 de Febvrier · MMXXVI",
      titre: "Le projet est lancé · Les trois (et la quatrième) jurent fidélité",
      author: "Aramis · Scribe",
      imageKind: "duel",
      tags: ["Lancement", "Manifeste", "Trois mousquetaires"],
      paragraphes: [
        "Hier soir, autour d'une table fort garnie & d'une cave fort éprouvée, les quatre intendants ont juré sur leur lame de mener à bien ce projet : un weekend entre amis, avec leurs enfants, dans un chasteau, sous le thème des trois mousquetaires — touche cyber·baroque obligatoire.",
        "La devise est arrestée : Tous pour un · un pour tous·exe. Le budget par famille a esté validé à l'unanimité. Le calendrier vise un weekend de juin MMXXVI.",
        "Trois rôles de mousquetaires sont distribuez (Athos · logistique, Porthos · tabula, Aramis · scribe). D'Artagnan reste vacant — peut·estre l'un d'entre vous le revendiquera·t·il sur place ?"
      ]
    },
  ],
};

window.DEFAULT_DATA = DEFAULT_DATA;
