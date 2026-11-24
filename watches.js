/* =========================================================
   PRIMETICK — EDIT THIS FILE TO UPDATE THE SITE
   ---------------------------------------------------------
   whatsapp : number in international format, digits only (no +, no spaces)
   deck     : the playing cards in "The Deck" (rank/suit are just for the card face)
   cutout   : transparent product image used on the playing cards and hero
   watches  : add a watch = drop photo in assets/watches/ and add a line
              tags: "casio" | "sport" | "dress"  (used by the filters)
   ========================================================= */
window.PRIMETICK = {
  whatsapp: "2348144871471", // +234 814 487 1471

  // "The Deck" — swipeable playing cards (second section)
  deck: [
    { id: "013", rank: "A",  suit: "♠", line: "The gold digital everyone recognises, with a light for after dark." },
    { id: "008", rank: "K",  suit: "♣", line: "Green waffle dial, with the day and date at three o'clock." },
    { id: "011", rank: "Q",  suit: "♥", line: "Oval gold case, deep green dial, dark leather strap." },
    { id: "022", rank: "J",  suit: "♦", line: "Teal sunray dial: hands up top, a digital display below." },
    { id: "001", rank: "10", suit: "♥", line: "Rose tone all over, analogue and digital in one small square." },
  ],

  watches: [
    { id: "014", img: "w14", name: "Scottie Oval — Silver",       meta: "Leather strap · Dress",  tags: ["dress"] },
    { id: "013", img: "w13", cutout: "assets/cutouts/w13.png", name: "Casio Illuminator — Gold",    meta: "Metal bracelet · Backlit digital",  tags: ["casio"] },
    { id: "008", img: "w8",  cutout: "assets/cutouts/w8.png", name: "Poedagar Green Waffle",       meta: "Metal bracelet · Day-date",       tags: ["dress"] },
    { id: "020", img: "w20", name: "Skmei 2728 Jelly Series",     meta: "Eight colours · Digital",    tags: ["sport"] },
    { id: "022", img: "w22", cutout: "assets/cutouts/w22.png", name: "Casio Ana-Digi — Teal",       meta: "Metal bracelet · Analogue + digital",       tags: ["casio"] },
    { id: "011", img: "w11", cutout: "assets/cutouts/w11.png", name: "Scottie Oval — Gold/Emerald", meta: "Leather strap · Dress",        tags: ["dress"] },
    { id: "006", img: "w6",  name: "G-Shock Gloss Duo",           meta: "Resin · Shock-resistant",   tags: ["casio", "sport"] },
    { id: "001", img: "w1",  cutout: "assets/cutouts/w1.png", name: "Casio Ana-Digi — Rose",       meta: "Metal bracelet · Analogue + digital",        tags: ["casio"] },
    { id: "023", img: "w23", name: "Curren Two-Tone Roman",       meta: "Metal bracelet · Date",           tags: ["dress"] },
    { id: "010", img: "w10", name: "Casio Illuminator — Stealth", meta: "Black metal · Backlit digital",  tags: ["casio"] },
    { id: "005", img: "w5",  name: "Casio Sunburst — Lime",       meta: "Black metal · Date",     tags: ["casio", "dress"] },
    { id: "003", img: "w3",  name: "Casio Illuminator — Steel",   meta: "Metal bracelet · Backlit digital",  tags: ["casio"] },
    { id: "017", img: "w17", name: "Casio Ana-Digi — Midnight",   meta: "Black metal · Analogue + digital", tags: ["casio"] },
    { id: "012", img: "w12", name: "Casio Ana-Digi — Classic",    meta: "Metal bracelet · Analogue + digital",       tags: ["casio"] },
  ],
};
