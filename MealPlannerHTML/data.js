// ---------- BAZA DAŃ ----------
const dania = {
  "śniadanie": [
    {
      nazwa: "Owsianka z bananem i orzechami",
      kalorie: 420,
      skladniki: {'Płatki owsiane': [40,70],'Mleko 2%': [120,200],'Banan': [60,100],'Orzechy włoskie':[5,10],'Izolat białka':[0,20]}
    },
    {
      nazwa: "Jajecznica z papryką",
      kalorie: 390,
      skladniki: {'Jajka': [2,3],'Papryka':[40,80],'Pieczywo pełnoziarniste':[40,80],'Masło':[5,10]}
    },
    {
      nazwa: "Musli z jogurtem greckim i jagodami",
      kalorie: 410,
      skladniki: {'Musli': [40,70],'Jogurt grecki': [100,200],'Maliny/jagody mrożone': [50,100]}
    },
    {
      nazwa: "Kanapka z kurczakiem",
      kalorie: 380,
      skladniki: {'Kurczak gotowany':[40,70],'Sałata':[20,40],'Pomidor':[40,80],'Pieczywo pełnoziarniste':[40,80]}
    },
    {
      nazwa: "Musli z jogurtem i jabłkiem",
      kalorie: 400,
      skladniki: {'Musli': [40,70],'Jogurt naturalny': [100,200],'Jabłko/gruszka': [60,120]}
    },
    {
      nazwa: "Jajecznica ze szczypiorkiem",
      kalorie: 390,
      skladniki: {'Jajka': [2,3],'Szczypiorek':[5,10],'Pieczywo pełnoziarniste':[40,80],'Masło':[5,10]}
    },
    {
      nazwa: "Kasza jaglana z jogurtem i owocami",
      kalorie: 430,
      skladniki: {'Kasza jaglana': [40,70],'Jogurt naturalny': [100,200],'Jabłko/gruszka': [50,100],'Orzechy włoskie':[5,10]}
    }
  ],
  "obiad": [
    {
      nazwa: "Kurczak pieczony z batatami",
      kalorie: 580,
      skladniki: {'Pierś kurczaka':[120,170],'Bataty':[100,200],'Warzywa (mix)':[100,200],'Oliwa':[5,10]}
    },
    {
      nazwa: "Indyk z kaszą bulgur",
      kalorie: 560,
      skladniki: {'Filet z indyka':[120,170],'Kasza bulgur':[40,80],'Marchew':[40,70],'Brokuł':[60,100],'Oliwa':[5,10]}
    },
    {
      nazwa: "Kurczak z makaronem w passacie",
      kalorie: 570,
      skladniki: {'Pierś kurczaka':[120,170],'Makaron pełnoziarnisty':[40,80],'Cukinia':[40,80],'Papryka':[40,80],'Passata pomidorowa':[100,150]}
    },
    {
      nazwa: "Kurczak z kaszą jaglaną i marchewką",
      kalorie: 550,
      skladniki: {'Pierś kurczaka':[120,170],'Kasza jaglana':[40,80],'Marchew':[40,80],'Passata pomidorowa':[80,120]}
    },
    {
      nazwa: "Kurczak z fasolką szparagową",
      kalorie: 540,
      skladniki: {'Pierś kurczaka':[120,170],'Fasolka szparagowa':[80,130],'Ryż':[40,80],'Olej rzepakowy':[5,10]}
    },
    {
      nazwa: "Indyk pieczony z warzywami",
      kalorie: 565,
      skladniki: {'Indyk (pieczony filet)':[120,170],'Marchew':[40,80],'Cukinia/papryka':[40,80],'Ziemniaki':[80,150],'Oliwa':[5,10]}
    },
    {
      nazwa: "Pulpeciki z indyka z ryżem",
      kalorie: 555,
      skladniki: {'Kulki/pulpeciki z indyka':[120,170],'Ryż':[40,80],'Warzywa do pieczenia (cukinia, marchew)':[80,150],'Oliwa':[5,10]}
    }
  ],
  "kolacja": [
    {
      nazwa: "Sałatka z tuńczykiem",
      kalorie: 350,
      skladniki: {'Tuńczyk w wodzie':[50,100],'Kukurydza':[25,50],'Papryka/ogórek':[50,100],'Sałata':[30,50],'Pieczywo pełnoziarniste':[40,80]}
    },
    {
      nazwa: "Twarożek ze szczypiorkiem",
      kalorie: 260,
      skladniki: {'Twarożek półtłusty':[80,150],'Szczypiorek':[5,10],'Rzodkiewka':[30,50],'Pieczywo żytnie':[40,80]}
    },
    {
      nazwa: "Sałatka z fetą",
      kalorie: 240,
      skladniki: {'Sałata rzymska':[40,80],'Feta':[20,40],'Pomidor':[40,80],'Pestki dyni':[5,10]}
    },
    {
      nazwa: "Stir fry warzywny z tofu",
      kalorie: 280,
      skladniki: {'Stir fry warzywny (warzywa mrożone)':[120,200],'Tofu naturalne':[60,120],'Oliwa':[5,10]}
    },
    {
      nazwa: "Wrap z pastą jajeczną",
      kalorie: 300,
      skladniki: {'Wrap pszenny pełnoziarnisty':[40,80],'Warzywa pokrojone':[60,120],'Pasta jajeczna':[60,120]}
    },
    {
      nazwa: "Wędzony łosoś z sałatką",
      kalorie: 330,
      skladniki: {'Wędzony łosoś':[40,80],'Sałata':[30,50],'Kukurydza':[25,50],'Pieczywo pełnoziarniste':[40,80]}
    },
    {
      nazwa: "Hummus z warzywami",
      kalorie: 310,
      skladniki: {'Hummus':[40,80],'Pomidor':[40,80],'Pieczywo chrupkie':[20,40]}
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
