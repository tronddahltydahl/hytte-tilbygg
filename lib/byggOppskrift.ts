// Trinn-for-trinn byggeoppskrift fra fundament til ferdig. Bygger på
// modellens geometri og lavbudsjett-spec'en i `byggBeregninger.ts`.

export type Trinn = {
  nr: number;
  tittel: string;
  beskrivelse: string;
  tips?: string;
  advarsel?: string;
};

export type Fase = {
  nr: number;
  tittel: string;
  ingress: string;
  estVarighet: string;
  trinn: Trinn[];
};

export const OPPSKRIFT: Fase[] = [
  {
    nr: 1,
    tittel: "Planlegging og oppmåling",
    ingress:
      "Før noe spadetak: avklar søknadsplikt, plassering på tomta, og mål opp grunnrisset på terrenget. Sjekk avstand til nabogrense og at det ikke er rør/kabler i bakken.",
    estVarighet: "1–2 dager",
    trinn: [
      {
        nr: 1,
        tittel: "Sjekk søknadsplikt hos kommunen",
        beskrivelse:
          "Tilbygg under 50 m² på fritidsbolig er normalt søknadspliktig (med eller uten ansvarsrett — avhengig av størrelse, nabogrense og lokal plan). Send forespørsel til kommunen via byggesak, eller bruk Direktoratets veileder.",
        advarsel:
          "Ikke bygg før du har avklart. Risikerer pålegg om riving og dagbøter.",
      },
      {
        nr: 2,
        tittel: "Sjekk avstand til nabogrense og brannvern",
        beskrivelse:
          "Hovedregel er minst 4 m fra nabogrense uten samtykke. Brannmurplate bak vedovn må også vurderes i denne fasen — det er enkelt nå, men dyrt å fikse senere.",
      },
      {
        nr: 3,
        tittel: "Mål opp grunnrisset på tomta",
        beskrivelse:
          "Sett ut 4 hjørnestolper, bruk snor og laser/passere. Kontroller diagonalmål (hjørne til hjørne): de skal være like. Dimensjonene fra modellen: 5,40 × 2,70 m langs hyttens kortvegg.",
        tips: "Diagonal for 5,40×2,70 = 6,04 m. Begge diagonalene må stemme — da vet du at det er rettvinklet.",
      },
      {
        nr: 4,
        tittel: "Bestill materialer",
        beskrivelse:
          "Bruk materiallisten på Byggeplan-siden. Bestill stender, bjelker og kledning i én leveranse for å spare frakt. Vinduer, dører og vedovn bestilles tidlig — leveringstid kan være 4–8 uker.",
      },
    ],
  },
  {
    nr: 2,
    tittel: "Fundament — 8 betongpilarer",
    ingress:
      "Lavbudsjett-løsning: støpte betongpilarer i papp-søyleform (Ø250 mm) med justerbart fundamentbeslag på toppen. Gir ventilert kryperom og er enklere enn ringmur.",
    estVarighet: "1 helg (henging av betong + herding)",
    trinn: [
      {
        nr: 1,
        tittel: "Grav ut 8 pilarhull",
        beskrivelse:
          "Fire pilarer per langside (z=0 og z=2,70) med 1,80 m mellomrom: x = 0,00 / 1,80 / 3,60 / 5,40. Grav under telefri dybde — på Sjusjøen typisk 1,2–1,5 m. Skift gjerne ut bløt jord med pukk i bunn.",
        tips: "Grav litt bredere enn pilaren — du trenger plass til å rette opp formen.",
      },
      {
        nr: 2,
        tittel: "Sett søyleform i hullet og rett opp",
        beskrivelse:
          "Sett papp-søyleformen (Ø250 mm) loddrett i hullet. Stiv av med staver/lekter. Mål topphøyden på alle pilarer med laser — de SKAL stå på samme høyde (innenfor 5 mm).",
        advarsel: "Hvis pilarene ikke står i samme høyde blir gulvet skjevt. Ta deg tid på dette.",
      },
      {
        nr: 3,
        tittel: "Bland og hell betong, sett innstøpningsbolt",
        beskrivelse:
          "Standard B25-betong holder. Fyll formen, banke ut luftbobler med en pinne. Sett innstøpningsbolt M16 sentrisk i toppen mens betongen er fersk.",
        tips: "Ferdigbetong i sekk er enklest for så små mengder. Du trenger ~30 liter per pilar (8 sekker à 25 kg).",
      },
      {
        nr: 4,
        tittel: "La betongen herde",
        beskrivelse:
          "Minst 24 timer før du fjerner pappformen, helst 3–7 dager før belastning. Hvis det er minusgrader: dekk til med presenning og frosttepper.",
      },
      {
        nr: 5,
        tittel: "Skru på justerbart fundamentbeslag",
        beskrivelse:
          "Galvanisert beslag med M16-gjenger til boltet. Justér slik at alle topplater ligger nøyaktig i samme høyde — bruk laser på tvers og langs.",
      },
    ],
  },
  {
    nr: 3,
    tittel: "Gulvkonstruksjon",
    ingress:
      "Svill langs pilarene, gulvbjelker på tvers, isolasjon og dampsperre, og OSB-gulvplate. Sørg for tett vindsperre under — mus elsker iso.",
    estVarighet: "2–3 dager",
    trinn: [
      {
        nr: 1,
        tittel: "Legg svill 48×148 langs hver langside",
        beskrivelse:
          "To svill-linjer (z=0 og z=2,70), bolt fast i fundamentbeslagene. Bruk impregnert virke i nederste lag mot betong/fukt.",
      },
      {
        nr: 2,
        tittel: "Sett gulvbjelker 48×148 c/c 600 mm",
        beskrivelse:
          "10 bjelker à 2,70 m på tvers (z-retning), spikret eller skrudd til svillen med bjelkesko. Spennvidde 2,70 m er innenfor for 48×148 C24 med god margin.",
      },
      {
        nr: 3,
        tittel: "Stift vindsperre under bjelkene",
        beskrivelse:
          "Vindsperre eller musnett på undersiden. Strammes opp så den ikke flagrer i vind. Dette holder mus, fugler og pollen ute av gulvisolasjonen.",
        tips: "Hammer-stiftepistol gjør jobben på minutter.",
      },
      {
        nr: 4,
        tittel: "Legg isolasjon 200 mm mineralull mellom bjelkene",
        beskrivelse:
          "Klem inn tette plater mellom bjelkene. Ingen luftspalter — det kalles \"kuldebroer\" og lekker varme.",
      },
      {
        nr: 5,
        tittel: "Dampsperre over bjelkene",
        beskrivelse:
          "PE-folie 0,2 mm i Relax og Smørebod. Aluminiumsfolie i badstu-arealet (mot fukt fra varme i båstuen). Tett alle skjøter med dampsperreteip.",
        advarsel:
          "Aluminiumsfolien MÅ være på badstu-arealet — vanlig PE-folie tåler ikke 90 °C+ over tid.",
      },
      {
        nr: 6,
        tittel: "Skru ned OSB 22 mm gulvplate",
        beskrivelse:
          "Plater 2440×1220, legges med skjøtene over bjelker. Bruk 4×60 mm gulvskruer c/c 200 mm.",
      },
    ],
  },
  {
    nr: 4,
    tittel: "Yttervegger og mellomvegger",
    ingress:
      "Bindingsverk 48×98 C24, c/c 600 mm. Bare 3 NYE yttervegger — venstre gavl er hyttas eksisterende vegg. Mellomveggene reises samtidig — da bæres taket tryggere.",
    estVarighet: "1 uke",
    trinn: [
      {
        nr: 1,
        tittel: "Forberede hyttas kortvegg (= ny venstre gavl)",
        beskrivelse:
          "Fjern hyttas overligger/lister på den siden tilbygget møter, slik at innepanel kan festes flatt utenpå hyttas eksisterende ytterpanel senere. Marker hvor topp-svillen til tilbyggets bak- og front-vegg skal koble seg på hyttas stenderverk — der vil tilbyggets vegger festes fast.",
        tips: "Bruk en stiftefinder eller bare bank for å finne hyttas stendere bak panelet — det er der du må feste.",
        advarsel: "Ikke skjær gjennom hyttas vindsperre eller dampsperre — bare ytterpanelet/listene.",
      },
      {
        nr: 2,
        tittel: "Lag rammeverket for bakvegg (z=0)",
        beskrivelse:
          "5,40 m bred × 2,60 m høy. Topp- og bunnsvill, stender c/c 600 mm. Ingen åpninger i bakveggen.",
      },
      {
        nr: 3,
        tittel: "Lag rammeverket for frontvegg (z=2,70)",
        beskrivelse:
          "Samme størrelse, men husk åpningene: terrassedør (avstand 0,30 m fra venstre, 0,80×2,00 m), badstuvindu (avstand 2,40 m, 1,60×0,80 m), smørebodsdør (avstand 4,45 m, 0,70×2,05 m). Sett ekstra stendere som karmtreverk på sidene av hver åpning + overliggende.",
        tips: "Lag åpningen ca 1 cm større enn vindusrammens utvendige mål — du trenger luft for å justere vinduet i lodd.",
      },
      {
        nr: 4,
        tittel: "Lag rammeverket for HØYRE gavl",
        beskrivelse:
          "2,70 m bred × 2,60 m høy + en topptrekant på 0,63 m for saltakvinkelen 25°. Sentrale stenderpar opp i mønet. Ingen venstre gavl å bygge — den er hyttas vegg.",
      },
      {
        nr: 5,
        tittel: "Reis de tre nye ytterveggene og fest til hytta",
        beskrivelse:
          "Reis bak-vegg, høyre gavl og front-vegg. Fest bak- og front-veggens venstre ende inn i hyttas eksisterende stenderverk med vinkelbeslag eller utbørede skruer. Bolt sammen i hjørnene. Avstiv med diagonal-bord til alt står i lodd.",
        tips: "Få med deg en eller to personer. Bruk vater og kontroller diagonalmål FØR du slår inn alle skruene.",
        advarsel: "Ikke spiker rett inn i hyttas panel — du må treffe hyttas stenderverk. Bruk skikkelige festemidler (vinkelbeslag, gjennomgående skruer).",
      },
      {
        nr: 6,
        tittel: "Reis innerveggene Relax/Badstue og Badstue/Smørebod",
        beskrivelse:
          "Plassering ved x=2,20 og x=4,20 (fra modellen). 48×98 C24 c/c 600 mm. Glassdør-åpning i Relax/Badstue-veggen: 0,70×2,00 m, 1,75 m fra z=0 (mot benkene). Innerveggens venstre ende festes også inn i hyttas vegg.",
      },
      {
        nr: 7,
        tittel: "Topp-svill langs de tre nye veggene",
        beskrivelse:
          "Sammenhengende 48×98 over ytterveggens topp — binder veggene sammen og gir takstolen et fast festepunkt. På venstre side fortsetter svillen som beslag/lekt på hyttas vegg, som takstolene festes inn i.",
      },
    ],
  },
  {
    nr: 5,
    tittel: "Takstoler, taktekking og lufting",
    ingress:
      "Selvbygde takstoler — én per c/c 600 mm langs bygget (10 stk). Saltak 25°. Bygges på bakken og løftes opp.",
    estVarighet: "1–2 uker",
    trinn: [
      {
        nr: 1,
        tittel: "Lag mal for én takstol",
        beskrivelse:
          "Tegn på bakken (eller en plate): bindebjelke 2,70 m + 2 sperrer som møtes i mønet med 25° vinkel. Sperr-lengde fra raft til møne: 1,49 m. Bruk denne malen for alle 10.",
        tips: "Knip av sperr-toppen i 25° vinkel + knip raften så den hviler flatt på vegg-toppen.",
      },
      {
        nr: 2,
        tittel: "Bygg 10 takstoler",
        beskrivelse:
          "48×148 C24 både i sperrer og bindebjelke. Knytteplate (galvanisert) eller utbørede skruer i møtepunktene. Diagonal-avstiver kan settes inn ved behov.",
      },
      {
        nr: 3,
        tittel: "Løft takstolene opp på toppsvillen",
        beskrivelse:
          "Med 2–3 personer, eller bruk en enkel rull-rampe. Plasser c/c 600 mm langs bygget og fest med bjelkesko/vinkler.",
      },
      {
        nr: 4,
        tittel: "Sett gjennomgående mønebjelke",
        beskrivelse:
          "48×148 C24, 6,20 m lengde (inkl. 2 × 0,40 m raft på gavlene). Festes i mønet på hver takstol for stabilitet.",
      },
      {
        nr: 5,
        tittel: "Legg taktro OSB 15 mm",
        beskrivelse:
          "Plater festes direkte på sperrene med korte skjøter over sperr. Bruk 3,5×35 mm skruer c/c 150 mm i kanten, c/c 300 mm midt.",
      },
      {
        nr: 6,
        tittel: "Undertaksduk + sløyfer + lekter",
        beskrivelse:
          "Undertaksduk legges fra raft til møne, overlappes 10 cm. Sløyfer 23×48 oppå sperrene over duken — så lekter i passende c/c for takpapp shingel.",
      },
      {
        nr: 7,
        tittel: "Legg takpapp shingel light",
        beskrivelse:
          "Begynn ved raften og legg overlappende oppover. Selvklebende eller mekanisk festet med pappspiker.",
      },
      {
        nr: 8,
        tittel: "Monter raft- og gavlventiler",
        beskrivelse:
          "4 raftventiler (2 per langside) og 2 gavlventiler (1 per gavl). Gir luftgjennomstrømning over himling-isolasjonen og forhindrer kondens på undertakduken.",
      },
    ],
  },
  {
    nr: 6,
    tittel: "Vinduer og dører",
    ingress:
      "Monteres mens veggene står tørre og før kledningen kommer på. Terrassedøren (gjenbruk) sjekkes for mål — kan kreve litt tilpasning av åpningen.",
    estVarighet: "2–3 dager",
    trinn: [
      {
        nr: 1,
        tittel: "Sett terrassedøren (gjenbruk, 80×200 glass)",
        beskrivelse:
          "Plasseres 0,30 m fra venstre i frontveggen. Sjekk lodd og vater. Tett rundt med drevdytt (komprimert mineralull) og dampsperreteip på innsiden.",
      },
      {
        nr: 2,
        tittel: "Sett badstuvinduet (160×80 herdet)",
        beskrivelse:
          "Liggende vindu, midtstilt i badstuen (avstand 2,40 m). Bunn på y=1,32 m, topp 2,12 m. MÅ være herdet glass eller godkjent badstuglass — vanlig 4 mm tåler ikke 80–90 °C uten å sprekke.",
        advarsel:
          "Sjekk avstand fra vedovnen — minimum 35 cm til glass er en god tommelfingerregel. Sjekk ovnens FDV-blad for konkret avstand.",
      },
      {
        nr: 3,
        tittel: "Sett smørebodsdøren (70×205 fast boddør)",
        beskrivelse:
          "Plassert 4,45 m fra venstre. Fast trefylling, ingen sprosser, beises i samme sorte tone som veggene utvendig.",
      },
      {
        nr: 4,
        tittel: "Sett innerdøren Relax/Badstue (70×200 glassdør)",
        beskrivelse:
          "I mellomveggen ved x=2,20, sentrert 1,75 m fra bakveggen (mot benkene). Glassfylling for å slippe gjennom lys mellom rommene.",
      },
    ],
  },
  {
    nr: 7,
    tittel: "Isolasjon, dampsperre og innepanel",
    ingress:
      "Yttervegg, mellomvegger og himling isoleres og dampsperres før innepanelet kommer på. Aluminiumsfolie i alle flater som vender mot badstuen.",
    estVarighet: "1 uke",
    trinn: [
      {
        nr: 1,
        tittel: "Iso 98 mm i ytterveggene",
        beskrivelse:
          "Klem inn mellom stendere. Skjær jevnt med en lang skarp kniv. Ikke press hardt — det reduserer isolasjonsevnen.",
      },
      {
        nr: 2,
        tittel: "Iso 98 mm i mellomveggene",
        beskrivelse:
          "Begge mellomvegger. Demper også lyd mellom rom — særlig nyttig mellom badstu og smørebod.",
      },
      {
        nr: 3,
        tittel: "Iso 200 mm i himlingen (mellom bindebjelker)",
        beskrivelse:
          "Legges OPPÅ bindebjelkene fra loftet. Klem inn i to lag (100+100 mm) med forskutte skjøter. Bygg en lett gangbro av plank for å unngå å tråkke på iso.",
      },
      {
        nr: 4,
        tittel: "Vindsperre på utsiden av ytterveggene",
        beskrivelse:
          "Strammes opp og stifter, overlapping 10 cm med teip på skjøter. Skjær åpninger for vinduer/dører — brett innover mot karmen.",
      },
      {
        nr: 5,
        tittel: "Klimaspalte 23 mm (lekter) og glattkantpanel utvendig",
        beskrivelse:
          "Vertikale lekter 23×48 på utsiden av vindsperren c/c 600 mm. Deretter glattkantpanel stående eller liggende. Bei eller mal etter montering.",
      },
      {
        nr: 6,
        tittel: "Dampsperre PE i Relax og Smørebod (vegger + himling)",
        beskrivelse:
          "På INNSIDEN av iso, før innepanel. Tett alle skjøter med dampsperreteip. Brett rundt vindusåpninger og rør.",
      },
      {
        nr: 7,
        tittel: "Dampsperre aluminium i badstuen (vegger + himling)",
        beskrivelse:
          "MÅ være alu — tåler 100°C+. Tett alle skjøter med aluminiumsteip. Vær særlig nøye rundt ovnsplasseringen og pipegjennomføringen.",
        advarsel:
          "Hvis du bruker vanlig PE-folie i badstuen vil den smelte og slippe gjennom fukt — råteskader innen få år.",
      },
      {
        nr: 8,
        tittel: "Innepanel furu i Relax og Smørebod (vegger + himling)",
        beskrivelse:
          "Festes på vertikale lekter (10×30 mm) over dampsperren — gir en luftspalte. Beises eller såpebehandles. På Relax-rommets VENSTRE vegg festes innepanelet direkte UTENPÅ hyttas eksisterende ytterpanel (hvor du fjernet overligger/lister i fase 4). Da blir det sømløs trefinish hele veien rundt.",
        tips: "Sjekk at hyttas eksisterende ytterpanel er tørt og fritt for mose/sopp før du legger innepanel utenpå. Eventuelt impregneres først.",
      },
      {
        nr: 9,
        tittel: "Badstuepanel osp i badstuen (vegger + himling)",
        beskrivelse:
          "Osp blir ikke svart av varme og avgir lite kvae. Festes som innepanelet med lekter. La være ubehandlet — eller bruk badstuvoks/-olje hvis ønsket.",
        tips:
          "Spar de breieste planken til synlige flater. Smale brett bak benkene og over hodet.",
      },
    ],
  },
  {
    nr: 8,
    tittel: "Badstu, pipe og ferdigstilling",
    ingress:
      "Til slutt: gulv, ovn, pipe og benker. Brannmurplate bak ovnen er kritisk. Pipa skal gjennom himlingen og kaldt loft før den når taket — bruk godkjent gjennomføring.",
    estVarighet: "1–2 uker",
    trinn: [
      {
        nr: 1,
        tittel: "Legg innegulv",
        beskrivelse:
          "I Relax og Smørebod: gulvbord (furu/gran, eventuelt brukt) eller laminat. I badstuen: vannfast — gulvbord behandlet, eller flis med sluk.",
        tips:
          "Hvis du har gamle gulvbord fra låven: pen oppfrisking og det blir et koselig hyttegulv.",
      },
      {
        nr: 2,
        tittel: "Monter brannmurplate bak/under vedovnen",
        beskrivelse:
          "Sement-/silikatplate i et område som dekker minst halvmeter rundt ovnen i alle retninger. Følg ovnens FDV-dokumentasjon nøye.",
        advarsel:
          "DETTE er det viktigste sikkerhetstiltaket. Sjekk minimum-avstander fra ovnen til brennbart materiale før du setter ovnen.",
      },
      {
        nr: 3,
        tittel: "Sett opp stålpipe gjennom himling og tak",
        beskrivelse:
          "Modul-pipe Ø150 (eller etter ovnens spec). Tett gjennomføring både i himlingen (lufttett) og i taktekkingen (vanntett). Bruk godkjent gjennomføringssett.",
        advarsel:
          "Pipa skal stikke minst 80 cm over møne eller 1 m over takflate, hva som er høyest. Innen 8 m radius må intet brennbart ligge høyere enn pipas topp.",
      },
      {
        nr: 4,
        tittel: "Sett vedovnen på plass",
        beskrivelse:
          "Posisjon ifølge modellen: x=3,55, z=1,85 (15 cm fra innervegg mot smørebod, 35 cm fra fronten). Koble til pipa, tett med pakning. Test fyring sakte for å la ovnen \"røke inn\".",
      },
      {
        nr: 5,
        tittel: "Bygg badstubenkene",
        beskrivelse:
          "Underramme av 48×48 furu mot bakveggen. Nedre benk: 2,00 m × 1,20 m × 45 cm. Øvre benk: 2,00 m × 0,60 m × 85 cm (på toppen av nedre). Spiler av osp eller alm med 1 cm mellomrom — la varmen sirkulere.",
        tips:
          "Spiler skal være lett demonterbare for vasking. Skru fra undersiden så ingen skrue-hoder møter huden.",
      },
      {
        nr: 6,
        tittel: "Lister og finish utvendig",
        beskrivelse:
          "Hjørnelister, vindusbeslag, vannbrett under vinduene. Beis utvendig glattkantpanel i samme sorte tone som hyttens hovedhus.",
      },
      {
        nr: 7,
        tittel: "Eltilkobling (om aktuelt)",
        beskrivelse:
          "Hvis du vil ha lys i Relax/Smørebod: forhåndsbestilt elektriker. Vedovn-only behøver ingenting. Sjekk om kommunen krever ferdigattest med el-anlegg.",
      },
      {
        nr: 8,
        tittel: "Tørr-/test-fyring og innvielse",
        beskrivelse:
          "Fyr forsiktig opp gradvis over noen dager, slik at konstruksjonen får tørket ut og badstu-veggene får \"sette seg\". Etter en uke kan du ta første ekte badstu.",
      },
    ],
  },
];

export const totalEstimertTid = "3–6 måneder i deltidsarbeid, eller ca 6 uker fulltid";
