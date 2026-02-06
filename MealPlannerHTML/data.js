// ---------- BAZA DAŃ ----------
const dania = {
  "śniadanie": [
    {
      nazwa: "Owsianka z bananem i orzechami",
      skladniki: {'Płatki owsiane': [40,70],'Mleko 2%': [120,200],'Banan': [60,100],'Orzechy włoskie':[5,10],'Izolat białka':[0,20]}
    },
    {
      nazwa: "Jajecznica z papryką",
      skladniki: {'Jajka': [2,3],'Papryka':[40,80],'Chleb pełnoziarnisty':[40,80],'Masło':[5,10]}
    },
    {
      nazwa: "Musli z jogurtem greckim i jagodami",
      skladniki: {'Musli': [40,70],'Jogurt grecki': [100,200],'Maliny/jagody mrożone': [50,100]}
    },
    {
      nazwa: "Kanapka z kurczakiem",
      skladniki: {'Kurczak gotowany':[40,70],'Sałata':[20,40],'Pomidor':[40,80],'Pieczywo pełnoziarniste':[40,80]}
    },
    {
      nazwa: "Musli z jogurtem i jabłkiem",
      skladniki: {'Musli': [40,70],'Jogurt naturalny': [100,200],'Jabłko': [60,120]}
    },
    {
      nazwa: "Jajecznica ze szczypiorkiem",
      skladniki: {'Jajka': [2,3],'Szczypiorek':[5,10],'Chleb pełnoziarnisty':[40,80],'Masło':[5,10]}
    },
    {
      nazwa: "Kasza jaglana z jogurtem i owocami",
      skladniki: {'Kasza jaglana': [40,70],'Jogurt naturalny': [100,200],'Śliwka/jabłko': [50,100],'Orzechy włoskie':[5,10]}
    }
  ],
  "obiad": [
    {
      nazwa: "Kurczak pieczony z batatami",
      skladniki: {'Pierś kurczaka':[120,170],'Bataty':[100,200],'Warzywa (mix)':[100,200],'Oliwa':[5,10]}
    },
    {
      nazwa: "Indyk z kaszą bulgur",
      skladniki: {'Filet z indyka':[120,170],'Kasza bulgur':[40,80],'Marchew':[40,70],'Brokuł':[60,100],'Oliwa':[5,10]}
    },
    {
      nazwa: "Kurczak z makaronem w passacie",
      skladniki: {'Pierś kurczaka':[120,170],'Makaron pełnoziarnisty':[40,80],'Cukinia':[40,80],'Papryka':[40,80],'Passata pomidorowa':[100,150]}
    },
    {
      nazwa: "Kurczak z kaszą jaglaną i marchewką",
      skladniki: {'Pierś z kurczaka':[120,170],'Kasza jaglana':[40,80],'Marchew':[40,80],'Passata pomidorowa':[80,120]}
    },
    {
      nazwa: "Kurczak z fasolką szparagową",
      skladniki: {'Pierś z kurczaka':[120,170],'Fasolka szparagowa':[80,130],'Ryż brązowy':[40,80],'Olej rzepakowy':[5,10]}
    },
    {
      nazwa: "Indyk pieczony z warzywami",
      skladniki: {'Indyk (pieczony filet)':[120,170],'Marchewka':[40,80],'Cukinia/papryka':[40,80],'Ziemniaki':[80,150],'Oliwa':[5,10]}
    },
    {
      nazwa: "Pulpeciki z indyka z ryżem",
      skladniki: {'Kulki/pulpeciki z indyka':[120,170],'Ryż':[40,80],'Warzywa do pieczenia (cukinia, marchew)':[80,150],'Oliwa':[5,10]}
    }
  ],
  "kolacja": [
    {
      nazwa: "Sałatka z tuńczykiem",
      skladniki: {'Tuńczyk w wodzie':[50,100],'Kukurydza':[25,50],'Papryka/ogórek':[50,100],'Sałata':[30,50],'Pieczywo pełnoziarniste':[40,80]}
    },
    {
      nazwa: "Twarożek ze szczypiorkiem",
      skladniki: {'Twarożek półtłusty':[80,150],'Szczypiorek':[5,10],'Rzodkiewka':[30,50],'Pieczywo żytnie':[40,80]}
    },
    {
      nazwa: "Sałatka z fetą",
      skladniki: {'Sałata rzymska':[40,80],'Feta':[20,40],'Pomidor':[40,80],'Pestki dyni':[5,10]}
    },
    {
      nazwa: "Stir fry warzywny z tofu",
      skladniki: {'Stir fry warzywny (warzywa mrożone)':[120,200],'Tofu naturalne':[60,120],'Oliwa':[5,10]}
    },
    {
      nazwa: "Wrap z pastą jajeczną",
      skladniki: {'Wrap pszenny pełnoziarnisty':[40,80],'Warzywa pokrojone':[60,120],'Pasta jajeczna':[60,120]}
    },
    {
      nazwa: "Wędzony łosoś z sałatką",
      skladniki: {'Wędzony łosoś':[40,80],'Sałata':[30,50],'Kukurydza':[25,50],'Pieczywo pełnoziarniste':[40,80]}
    },
    {
      nazwa: "Hummus z warzywami",
      skladniki: {'Hummus':[40,80],'Pomidor':[40,80],'Pieczywo chrupkie':[20,40]}
    }
  ],
  "podwieczorek": [
    {
      nazwa: "Owoce z orzechami",
      skladniki: {'Jabłko/gruszka': [80,120],'Orzechy włoskie':[10,20]}
    },
    {
      nazwa: "Jogurt z owocami",
      skladniki: {'Jogurt naturalny': [100,150],'Maliny/jagody':[50,80]}
    },
    {
      nazwa: "Batony proteinowe",
      skladniki: {'Baton proteinowy': [1,1]}
    }
  ]
};
