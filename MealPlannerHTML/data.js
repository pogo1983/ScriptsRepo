// ---------- BAZA DAŃ ----------
const dania = {
  "śniadanie": [
    {
      nazwa: "Owsianka z bananem i orzechami",
      kalorie: 420,
      skladniki: {'Płatki owsiane': [40,70],'Mleko 2%': [120,200],'Banan': [60,100],'Orzechy włoskie':[5,10],'Izolat białka':[0,20]}
    },
    {
      nazwa: "Jajecznica z papryką i pomidorami",
      kalorie: 390,
      skladniki: {'Jajka': [2,3],'Papryka':[40,80],'Pomidor':[40,80],'Pieczywo pełnoziarniste':[40,80],'Masło':[5,10]}
    },
    {
      nazwa: "Musli z jogurtem greckim i jagodami",
      kalorie: 410,
      skladniki: {'Musli': [40,70],'Jogurt grecki': [100,200],'Maliny/jagody mrożone': [50,100]}
    },
    {
      nazwa: "Kanapka z kurczakiem i awokado",
      kalorie: 420,
      skladniki: {'Kurczak gotowany':[40,70],'Awokado':[30,50],'Sałata':[20,40],'Pomidor':[40,80],'Pieczywo pełnoziarniste':[40,80]}
    },
    {
      nazwa: "Musli z jogurtem i jabłkiem",
      kalorie: 400,
      skladniki: {'Musli': [40,70],'Jogurt naturalny': [100,200],'Jabłko/gruszka': [60,120]}
    },
    {
      nazwa: "Jajecznica ze szczypiorkiem i pomidorami",
      kalorie: 410,
      skladniki: {'Jajka': [2,3],'Szczypiorek':[5,10],'Pomidor':[40,80],'Pieczywo pełnoziarniste':[40,80],'Masło':[5,10]}
    },
    {
      nazwa: "Kasza jaglana z jogurtem i owocami",
      kalorie: 430,
      skladniki: {'Kasza jaglana': [40,70],'Jogurt naturalny': [100,200],'Jabłko/gruszka': [50,100],'Orzechy włoskie':[5,10]}
    },
    {
      nazwa: "Omlet z papryką, pomidorami i szpinakiem",
      kalorie: 380,
      skladniki: {'Jajka': [2,3],'Papryka':[30,60],'Pomidor':[30,60],'Szpinak świeży':[30,50],'Pieczywo pełnoziarniste':[40,80],'Oliwa':[5,10]}
    },
    {
      nazwa: "Tosty z awokado i jajkiem",
      kalorie: 400,
      skladniki: {'Pieczywo pełnoziarniste':[50,80],'Awokado':[50,80],'Jajka':[1,2],'Pomidor':[30,50],'Rukola':[10,20]}
    },
    {
      nazwa: "Jajka gotowane z warzywami",
      kalorie: 350,
      skladniki: {'Jajka gotowane': [2,3],'Papryka':[40,80],'Pomidor':[40,80],'Ogórek':[40,80],'Pieczywo pełnoziarniste':[40,80]}
    },
    {
      nazwa: "Kanapka z pastą jajeczną i warzywami",
      kalorie: 380,
      skladniki: {'Pieczywo pełnoziarniste':[50,80],'Jajka gotowane':[2,2],'Sałata':[20,40],'Pomidor':[40,80],'Papryka':[30,50],'Jogurt naturalny':[20,30]}
    },
    {
      nazwa: "Wrap śniadaniowy z jajkiem i warzywami",
      kalorie: 390,
      skladniki: {'Tortilla pełnoziarnista':[50,70],'Jajecznica (jajka)':[2,2],'Papryka':[30,50],'Pomidor':[30,50],'Awokado':[30,40]}
    }
  ],
  "obiad": [
    {
      nazwa: "Kurczak pieczony z batatami i warzywami",
      kalorie: 580,
      skladniki: {'Pierś kurczaka':[120,170],'Bataty':[100,200],'Brokuły':[60,100],'Papryka':[40,80],'Oliwa':[5,10]}
    },
    {
      nazwa: "Indyk z kaszą bulgur i warzywami",
      kalorie: 560,
      skladniki: {'Filet z indyka':[120,170],'Kasza bulgur':[40,80],'Marchew':[40,70],'Brokuł':[60,100],'Oliwa':[5,10]}
    },
    {
      nazwa: "Kurczak z makaronem pełnoziarnistym i warzywami",
      kalorie: 570,
      skladniki: {'Pierś kurczaka':[120,170],'Makaron pełnoziarnisty':[40,80],'Cukinia':[40,80],'Papryka':[40,80],'Passata pomidorowa':[100,150]}
    },
    {
      nazwa: "Kurczak z kaszą jaglaną i marchewką",
      kalorie: 550,
      skladniki: {'Pierś kurczaka':[120,170],'Kasza jaglana':[40,80],'Marchew':[40,80],'Passata pomidorowa':[80,120]}
    },
    {
      nazwa: "Kurczak z fasolką szparagową i ryżem",
      kalorie: 540,
      skladniki: {'Pierś kurczaka':[120,170],'Fasolka szparagowa':[80,130],'Ryż':[40,80],'Olej rzepakowy':[5,10]}
    },
    {
      nazwa: "Indyk pieczony z warzywami",
      kalorie: 565,
      skladniki: {'Indyk (pieczony filet)':[120,170],'Marchew':[40,80],'Cukinia/papryka':[40,80],'Ziemniaki':[80,150],'Oliwa':[5,10]}
    },
    {
      nazwa: "Pulpeciki z indyka z ryżem i warzywami",
      kalorie: 555,
      skladniki: {'Kulki/pulpeciki z indyka':[120,170],'Ryż':[40,80],'Cukinia':[40,80],'Marchew':[40,70],'Oliwa':[5,10]}
    },
    {
      nazwa: "Rosół z kurczaka z makaronem i warzywami",
      kalorie: 450,
      skladniki: {'Rosół z kurczaka': [300,400],'Makaron pełnoziarnisty': [30,50],'Marchew': [50,80],'Pietruszka (korzeń)':[30,50],'Seler (korzeń)':[30,50],'Kurczak gotowany':[80,120]}
    },
    {
      nazwa: "Zupa pomidorowa z ryżem",
      kalorie: 480,
      skladniki: {'Passata pomidorowa': [200,300],'Ryż biały': [30,50],'Marchew': [40,60],'Seler (korzeń)':[30,50],'Śmietana 18%':[20,40]}
    },
    {
      nazwa: "Makaron pełnoziarnisty z kurczakiem i brokułami",
      kalorie: 640,
      skladniki: {'Makaron pełnoziarnisty (penne)': [50,80],'Pierś z kurczaka': [120,160],'Brokuły': [80,120],'Papryka':[50,80],'Pomidor':[50,80],'Oliwa':[5,10]}
    },
    {
      nazwa: "Makaron z sosem pomidorowym i warzywami",
      kalorie: 580,
      skladniki: {'Makaron pełnoziarnisty (spaghetti)': [50,80],'Passata pomidorowa': [150,200],'Cukinia':[80,120],'Bakłażan':[60,100],'Papryka':[50,80],'Oliwa':[5,10]}
    },
    {
      nazwa: "Łosoś z kaszą jaglaną i warzywami",
      kalorie: 660,
      skladniki: {'Łosoś': [100,150],'Kasza jaglana': [40,80],'Szpinak świeży':[80,120],'Pomidor':[60,100],'Cukinia':[50,80],'Oliwa':[5,10]}
    },
    {
      nazwa: "Makaron z indykiem i papryką",
      kalorie: 630,
      skladniki: {'Makaron pełnoziarnisty (fusilli)': [50,80],'Filet z indyka': [120,160],'Papryka':[80,120],'Cukinia':[60,100],'Pomidor':[50,80],'Oliwa':[5,10]}
    },
    {
      nazwa: "Tortilla z kurczakiem i warzywami",
      kalorie: 590,
      skladniki: {'Tortilla pełnoziarnista':[70,100],'Pierś z kurczaka': [100,150],'Papryka':[60,100],'Pomidor':[50,80],'Sałata':[30,50],'Awokado':[30,50]}
    },
    {
      nazwa: "Dorsz z kaszą kuskus i szpinakiem",
      kalorie: 610,
      skladniki: {'Dorsz': [120,180],'Kasza kuskus': [40,80],'Szpinak świeży':[80,120],'Pomidor':[60,100],'Papryka':[50,80],'Oliwa':[5,10]}
    },
    {
      nazwa: "Makaron pełnoziarnisty z warzywami",
      kalorie: 550,
      skladniki: {'Makaron pełnoziarnisty (penne)': [60,100],'Brokuły': [80,120],'Papryka':[60,100],'Pomidor':[60,100],'Szpinak':[40,80],'Oliwa':[5,10],'Czosnek':[5,10]}
    }
  ],
  "kolacja": [
    {
      nazwa: "Sałatka z tuńczykiem i warzywami",
      kalorie: 350,
      skladniki: {'Tuńczyk w wodzie':[50,100],'Kukurydza':[25,50],'Papryka':[30,60],'Ogórek':[30,60],'Sałata':[30,50],'Pomidor':[30,50],'Pieczywo pełnoziarniste':[40,80]}
    },
    {
      nazwa: "Twarożek ze szczypiorkiem i warzywami",
      kalorie: 260,
      skladniki: {'Twarożek półtłusty':[80,150],'Szczypiorek':[5,10],'Rzodkiewka':[30,50],'Pomidor':[30,50],'Pieczywo żytnie':[40,80]}
    },
    {
      nazwa: "Sałatka z fetą i warzywami",
      kalorie: 240,
      skladniki: {'Sałata rzymska':[40,80],'Feta':[20,40],'Pomidor':[40,80],'Ogórek':[40,80],'Papryka':[30,60],'Pestki dyni':[5,10]}
    },
    {
      nazwa: "Stir fry warzywny z tofu",
      kalorie: 280,
      skladniki: {'Stir fry warzywny (warzywa mrożone)':[120,200],'Tofu naturalne':[60,120],'Oliwa':[5,10]}
    },
    {
      nazwa: "Wrap z pastą jajeczną i warzywami",
      kalorie: 300,
      skladniki: {'Wrap pszenny pełnoziarnisty':[40,80],'Pasta jajeczna (jajka)':[2,2],'Sałata':[30,50],'Pomidor':[40,80],'Papryka':[30,50]}
    },
    {
      nazwa: "Wędzony łosoś z sałatką",
      kalorie: 330,
      skladniki: {'Wędzony łosoś':[40,80],'Sałata':[30,50],'Kukurydza':[25,50],'Pomidor':[30,50],'Ogórek':[30,50],'Pieczywo pełnoziarniste':[40,80]}
    },
    {
      nazwa: "Hummus z warzywami",
      kalorie: 310,
      skladniki: {'Hummus':[40,80],'Pomidor':[40,80],'Papryka':[40,80],'Ogórek':[40,80],'Pieczywo chrupkie':[20,40]}
    },
    {
      nazwa: "Tortilla z warzywami i awokado",
      kalorie: 340,
      skladniki: {'Tortilla pełnoziarnista':[50,70],'Awokado':[40,60],'Pomidor':[40,80],'Papryka':[30,60],'Sałata':[30,50],'Kukurydza':[20,40]}
    },
    {
      nazwa: "Jajka gotowane z sałatką",
      kalorie: 300,
      skladniki: {'Jajka gotowane': [2,3],'Sałata':[40,80],'Pomidor':[50,100],'Ogórek':[50,100],'Papryka':[40,80],'Pieczywo pełnoziarniste':[40,80]}
    },
    {
      nazwa: "Twarożek z rzodkiewką i papryką",
      kalorie: 280,
      skladniki: {'Twarożek półtłusty':[80,150],'Rzodkiewka':[40,80],'Papryka':[40,80],'Szczypiorek':[5,10],'Pieczywo żytnie':[40,80]}
    },
    {
      nazwa: "Sałatka z kurczakiem i awokado",
      kalorie: 360,
      skladniki: {'Kurczak gotowany':[60,100],'Awokado':[40,60],'Sałata':[40,80],'Pomidor':[40,80],'Papryka':[30,60],'Pieczywo pełnoziarniste':[30,60]}
    }
  ],
  "podwieczorek": [
    {
      nazwa: "Owoce z orzechami",
      kalorie: 180,
      skladniki: {'Jabłko/gruszka': [80,120],'Orzechy włoskie':[10,20]}
    },
    {
      nazwa: "Jogurt skyr z owocami",
      kalorie: 180,
      skladniki: {'Jogurt Skyr': [150,200],'Maliny/jagody mrożone':[50,80],'Miód':[5,10]}
    },
    {
      nazwa: "Jogurt grecki z orzechami i miodem",
      kalorie: 220,
      skladniki: {'Jogurt grecki': [150,200],'Orzechy włoskie/migdały':[10,20],'Miód':[5,10]}
    },
    {
      nazwa: "Kanapka z masłem orzechowym i bananem",
      kalorie: 280,
      skladniki: {'Pieczywo pełnoziarniste':[40,60],'Masło orzechowe':[15,25],'Banan':[60,100]}
    },
    {
      nazwa: "Twarożek z rzodkiewką i szczypiorkiem",
      kalorie: 200,
      skladniki: {'Twarożek półtłusty':[100,150],'Rzodkiewka':[30,50],'Szczypiorek':[5,10],'Pieczywo żytnie':[30,50]}
    },
    {
      nazwa: "Batony proteinowe",
      kalorie: 200,
      skladniki: {'Baton proteinowy': [1,1]}
    },
    {
      nazwa: "Jajka na twardo z warzywami",
      kalorie: 170,
      skladniki: {'Jajka': [2,2],'Pomidor/papryka':[50,80],'Sól/pieprz':[1,1]}
    },
    {
      nazwa: "Shake proteinowy z owocami",
      kalorie: 190,
      skladniki: {'Izolat białka':[20,30],'Mleko/woda':[200,300],'Banan/jagody':[50,80]}
    },
    {
      nazwa: "Kanapka z awokado i jajkiem",
      kalorie: 260,
      skladniki: {'Pieczywo pełnoziarniste':[40,60],'Awokado':[40,60],'Jajka':[1,1]}
    },
    {
      nazwa: "Cottage cheese z pomidorkami koktajlowymi",
      kalorie: 150,
      skladniki: {'Cottage cheese':[120,180],'Pomidorki koktajlowe':[50,80],'Szczypiorek':[5,10]}
    },
    {
      nazwa: "Hummus z warzywami do maczania",
      kalorie: 180,
      skladniki: {'Hummus':[40,80],'Marchewka/papryka/ogórek':[80,120]}
    },
    {
      nazwa: "Jogurt skyr z granolą",
      kalorie: 230,
      skladniki: {'Jogurt Skyr': [150,200],'Granola':[20,30],'Jagody mrożone':[30,50]}
    },
    {
      nazwa: "Kanapka z serem białym i pomidorem",
      kalorie: 210,
      skladniki: {'Pieczywo żytnie':[40,60],'Ser biały/feta':[40,60],'Pomidor':[40,60],'Oliwa':[5,10]}
    },
    {
      nazwa: "Smoothie owocowo-białkowe",
      kalorie: 200,
      skladniki: {'Jogurt naturalny':[100,150],'Szpinak (garść)':[20,30],'Banan':[60,100],'Jagody mrożone':[30,50],'Izolat białka':[10,20]}
    },
    {
      nazwa: "Mini wrapy z kurczakiem",
      kalorie: 250,
      skladniki: {'Tortilla pełnoziarnista (mała)':[30,50],'Kurczak gotowany':[50,80],'Sałata':[20,30],'Jogurt naturalny':[20,30]}
    }
  ]
};
