/* global */
const DEFAULT_DATA = {
  infosRevealed: false,

  /* Liste des pseudos autorisés — configurée via admin, vide = personne ne peut accéder */
  allowedPseudos: [],

  /* Pseudo admin — exclu du classement */
  adminPseudo: "",

  /* Countdown target — ISO 8601, modifiable via admin */
  countdownISO: "2026-06-12T16:00:00",

  /* 20 codes de révélation — à distribuer via les posts de la Gazette */
  revealCodes: [
    "athos", "porthos", "aramis",
    "dartagan", "rochefort", "buckingham",
    "richelieu", "milady", "constance",
    "treville", "planchet", "grimaud",
    "bazin", "mousqueton", "bonacieux",
    "mazarin", "felton", "chevreuse",
    "laporte", "jussac"
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
        { h: "12h30", t: "Pique·nique des chevaliers · sur les douves" },
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

  /* 27 indices des jeux — 3 par énigme — configurables via admin */
  jeuxIndices: {
    "memoire-1":    "",
    "memoire-2":    "",
    "memoire-3":    "",
    "suite-1":      "",
    "suite-2":      "",
    "suite-3":      "",
    "anagrammes-1": "",
    "anagrammes-2": "",
    "anagrammes-3": "",
    "reflexes-1":   "",
    "reflexes-2":   "",
    "reflexes-3":   "",
    "cible-1":      "",
    "cible-2":      "",
    "cible-3":      "",
    "tempo-1":      "",
    "tempo-2":      "",
    "tempo-3":      "",
    "drapeaux-1":   "",
    "drapeaux-2":   "",
    "drapeaux-3":   "",
    "capitales-1":  "",
    "capitales-2":  "",
    "capitales-3":  "",
    "annee-1":      "",
    "annee-2":      "",
    "annee-3":      "",
  },
};

window.DEFAULT_DATA = DEFAULT_DATA;
