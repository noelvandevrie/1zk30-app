// =============================================================
//  INHOUD VAN DE APP — dit bestand mag je vrij aanpassen.
//  Je hoeft de app-code (app.js) niet aan te raken.
//
//  - Data van activiteiten zijn relatief aan vandaag:
//      days: 0 = vandaag, 1 = morgen, 7 = over een week
//  - Hulpberichten en nieuws hebben "daysAgo": 0 = vandaag, 2 = eergisteren
//  - Alle buren zijn VERZONNEN. Geen echte personen zonder toestemming.
//  - Na het aanpassen: open de app met ?reset achter de URL
//    om de nieuwe inhoud te zien.
// =============================================================

window.DATA = {
  appName: "Samen",
  neighbourhood: "Oude Gracht-West",

  // PLACEHOLDER: verzonnen straatnamen. Vervang door echte als we dat willen.
  streets: [
    "Lindelaan",
    "Kastanjestraat",
    "Molenkade",
    "Wilgenhof",
    "Graanpad",
    "Sluiswachtersstraat",
  ],

  // Icoon per categorie. Nieuwe categorie? Voeg hier een regel toe.
  categories: {
    borrel: { icon: "🥂", label: "Gezellig samen" },
    eten: { icon: "🍲", label: "Eten" },
    klussen: { icon: "🔧", label: "Klussen & repareren" },
    kinderen: { icon: "🧸", label: "Kinderen" },
    natuur: { icon: "🌱", label: "Tuin & natuur" },
    cultuur: { icon: "🎭", label: "Cultuur & verhalen" },
    spelletjes: { icon: "🃏", label: "Spelletjes" },
    vervoer: { icon: "🚗", label: "Vervoer & lift" },
    boodschappen: { icon: "🛒", label: "Boodschappen" },
    dieren: { icon: "🐾", label: "Dieren" },
    computer: { icon: "💻", label: "Computer & telefoon" },
    lenen: { icon: "📦", label: "Spullen lenen" },
    overig: { icon: "💬", label: "Overig" },
  },

  events: [
    {
      id: "e1",
      title: "Burenborrel op het pleintje",
      days: 2,
      time: "17:00",
      place: "Pleintje Wilgenhof", // PLACEHOLDER
      cat: "borrel",
      host: "Bewonersvereniging",
      text: "Gewoon even bijpraten met de buren. Wij zorgen voor koffie, thee en iets lekkers. Neem gerust een stoel mee.",
      going: ["Petra", "Joost", "Ria", "Sem", "Fatima", "Henk", "Lotte", "Ahmed", "Gerda", "Bram", "Yvonne"],
    },
    {
      id: "e2",
      title: "Klaverjasmiddag",
      days: 4,
      time: "14:00",
      place: "Buurthuis De Schakel", // PLACEHOLDER
      cat: "spelletjes",
      host: "Henk",
      text: "Elke week klaverjassen. Beginners zijn ook welkom, we leggen het rustig uit.",
      going: ["Henk", "Gerda", "Wim", "Ria", "Annie"],
    },
    {
      id: "e3",
      title: "Repair Café",
      days: 5,
      time: "10:00",
      place: "Buurthuis De Schakel", // PLACEHOLDER
      cat: "klussen",
      host: "Joost",
      text: "Kapotte lamp, broek of broodrooster? Samen proberen we het te maken. Gratis, een vrijwillige bijdrage mag.",
      going: ["Joost", "Bram", "Fatima", "Kees", "Lotte", "Mehmet", "Sanne", "Wim"],
    },
    {
      id: "e4",
      title: "Wandeling: verhalen langs de gracht",
      days: 7,
      time: "14:30",
      place: "Start bij de Molenbrug", // PLACEHOLDER
      cat: "cultuur",
      host: "Gerda",
      text: "Gerda woont hier al 60 jaar en vertelt over hoe de buurt vroeger was. Rustig tempo, ongeveer een uur.",
      going: ["Gerda", "Yvonne", "Petra", "Annie", "Kees", "Sanne"],
    },
    {
      id: "e5",
      title: "Kinderspeelmiddag",
      days: 9,
      time: "13:00",
      place: "Speeltuin Kastanjestraat", // PLACEHOLDER
      cat: "kinderen",
      host: "Fatima",
      text: "Stoepkrijt, zeepbellen en spelletjes voor kinderen tot 10 jaar. Ouders en grootouders zijn welkom.",
      going: ["Fatima", "Lotte", "Ahmed", "Sanne"],
    },
    {
      id: "e6",
      title: "Buurtmaaltijd",
      days: 12,
      time: "18:00",
      place: "Buurthuis De Schakel", // PLACEHOLDER
      cat: "eten",
      host: "Bewonersvereniging",
      text: "Samen koken en samen eten. Iedereen neemt een klein gerecht mee om te delen.",
      going: ["Ria", "Mehmet", "Petra", "Sem", "Yvonne", "Bram", "Henk"],
    },
    {
      id: "e7",
      title: "Plantjesruil",
      days: 16,
      time: "11:00",
      place: "Graanpad, bij de bankjes", // PLACEHOLDER
      cat: "natuur",
      host: "Lotte",
      text: "Neem stekjes, zaadjes of een plant mee en ruil met de buren.",
      going: ["Lotte", "Annie", "Kees"],
    },
  ],

  // type: "vraag" (hulpvraag) of "aanbod" (hulpaanbod)
  help: [
    {
      id: "h1",
      type: "vraag",
      title: "Wie kan mijn ladder lenen?",
      text: "Ik wil de dakgoot schoonmaken. Heb voor één middag een lange ladder nodig.",
      cat: "lenen",
      author: "Petra",
      street: "Lindelaan",
      daysAgo: 0,
      reactions: 0,
    },
    {
      id: "h2",
      type: "aanbod",
      title: "Ik kan zaterdag boodschappen doen",
      text: "Ik ga zaterdagochtend naar de supermarkt. Wil je dat ik iets meeneem? Laat het weten.",
      cat: "boodschappen",
      author: "Joost",
      street: "Molenkade",
      daysAgo: 1,
      reactions: 2,
    },
    {
      id: "h3",
      type: "vraag",
      title: "Lift naar het ziekenhuis donderdag",
      text: "Ik heb donderdag om 10:00 een afspraak. Kan iemand mij brengen? Terug lukt met de bus.",
      cat: "vervoer",
      author: "Ria",
      street: "Kastanjestraat",
      daysAgo: 1,
      reactions: 1,
    },
    {
      id: "h4",
      type: "aanbod",
      title: "Hulp met je telefoon of computer",
      text: "Lukt videobellen of internetbankieren niet? Ik kom graag even langs om het uit te leggen.",
      cat: "computer",
      author: "Sem",
      street: "Graanpad",
      daysAgo: 3,
      reactions: 4,
    },
    {
      id: "h5",
      type: "vraag",
      title: "Wie past op onze kat?",
      text: "Wij zijn volgende week vijf dagen weg. Eén keer per dag eten geven en de bak schoonmaken.",
      cat: "dieren",
      author: "Ahmed",
      street: "Wilgenhof",
      daysAgo: 4,
      reactions: 1,
    },
    {
      id: "h6",
      type: "aanbod",
      title: "Boormachine en gereedschap te leen",
      text: "Ik heb een boormachine, waterpas en trapje. Leen het gerust.",
      cat: "klussen",
      author: "Bram",
      street: "Sluiswachtersstraat",
      daysAgo: 6,
      reactions: 3,
    },
  ],

  // Nieuws komt alleen van de bewonersvereniging of de gemeente.
  // "story" is optioneel: een langer verhaal dat in de kaart uitklapt.
  // Lege regel in story = nieuwe alinea.
  news: [
    {
      id: "n1",
      source: "Bewonersvereniging",
      title: "Nieuwe bankjes langs de gracht",
      text: "Er staan vanaf deze week drie nieuwe bankjes langs het water. Een idee van bewoners uit de vorige nieuwsbrief.",
      daysAgo: 1,
    },
    {
      id: "n2",
      source: "Gemeente",
      title: "Werkzaamheden riolering Molenkade",
      text: "Vanaf maandag wordt de riolering vervangen. De Molenkade is twee weken afgesloten voor auto's. Voetgangers kunnen er wel langs.",
      daysAgo: 2,
    },
    {
      id: "n3",
      source: "Bewonersvereniging",
      title: "Buurtportret: Gerda (84) woont al 60 jaar aan de gracht",
      text: "Gerda kwam in 1966 naar Oude Gracht-West. Ze zag de buurt veranderen, maar één ding bleef hetzelfde.",
      story: "\"Vroeger kende iedereen elkaar,\" vertelt Gerda. \"Je liep zo bij de buren naar binnen voor een kop koffie.\"\n\nTegenwoordig gaat dat anders, maar Gerda vindt dat het nog steeds kan. \"Je moet gewoon gedag zeggen. Dan begint het vanzelf.\"\n\nVolgende week neemt Gerda buren mee op een wandeling langs de gracht. Kijk in de Agenda.",
      daysAgo: 4,
    },
    {
      id: "n4",
      source: "Bewonersvereniging",
      title: "Bakkerij Van Dam bestaat 50 jaar",
      text: "De bakker op de hoek viert feest. Iedereen uit de buurt krijgt deze maand een gratis krentenbol.",
      story: "Bakkerij Van Dam begon in 1976 als klein winkeltje. Inmiddels staat de derde generatie achter de toonbank.\n\n\"Onze klanten zijn eigenlijk buren,\" zegt bakker Marco. \"We weten wie welk brood wil.\"",
      daysAgo: 6,
    },
    {
      id: "n5",
      source: "Bewonersvereniging",
      title: "Uit de geschiedenis: de oude graanmolen",
      text: "Waar nu het Graanpad loopt, stond tot 1912 een graanmolen. Daar komt de naam vandaan.",
      story: "De molen malde graan voor de bakkers in de hele stad. Schepen legden aan in de gracht om meel op te halen.\n\nIn 1912 brandde de molen af. De stenen fundering ligt nog onder het pad.",
      daysAgo: 9,
    },
  ],
};
