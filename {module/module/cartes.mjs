/**
 * Système de Cartes Événement T&T
 * Deck de 27 cartes, pioche aléatoire, affichage sur la fiche
 */

export const CARTES_EVENEMENT = [
  { id:1,  fichier:"TT01.jpg", titre:"Je suis doué avec ça !",
    effet:"Vous pouvez utiliser un de vos avantages une nouvelle fois au cours de cette partie." },
  { id:2,  fichier:"TT02.jpg", titre:"Je ne jette rien !",
    effet:"Vous pouvez utiliser un des objets de votre besace une nouvelle fois au cours de cette partie." },
  { id:3,  fichier:"TT03.jpg", titre:"Quelle camelote ce truc !",
    effet:"Un objet non-enchanté de votre choix est brisé, cassé ou cesse de fonctionner." },
  { id:4,  fichier:"TT04.jpg", titre:"Bien sûr que je sais faire ça !",
    effet:"Un des traits de l'aventurier a maintenant une valeur de 5 le temps d'un jet de dé." },
  { id:5,  fichier:"TT05.jpg", titre:"Ma grand-mère se bat mieux que toi !",
    effet:"Une attaque réussie est en fait un échec piteux et ridicule. La cible peut être un monstre ou un autre aventurier." },
  { id:6,  fichier:"TT06.jpg", titre:"Dans mon expérience rien n'est dû à la chance !",
    effet:"Utilisez cette carte à la place d'un jet de dés, on considère que vous avez réussi votre action." },
  { id:7,  fichier:"TT07.jpg", titre:"Je double ta paye !",
    effet:"Un des monstres qu'affrontent les aventuriers rejoint leur camp. Ne peut être utilisée sur un Grand Chef ou une Brutasse." },
  { id:8,  fichier:"TT08.jpg", titre:"Tu as tué mon père, prépare-toi à mourir !",
    effet:"Doublez les dégâts d'une de vos attaques. Gardez cette carte pour un adversaire qui en vaut la peine." },
  { id:9,  fichier:"TT09.jpg", titre:"Il va pleuvoir dans ta bouche !",
    effet:"Votre aventurier a droit à une attaque supplémentaire au cours d'un round de combat." },
  { id:10, fichier:"TT10.jpg", titre:"Ma petite sœur tape plus fort que toi !",
    effet:"Montrez cette carte au Maître avec un air supérieur : vous annulez totalement les dégâts provoqués par une attaque adverse." },
  { id:11, fichier:"TT11.jpg", titre:"Plutôt lui que moi !",
    effet:"Vous réussissez automatiquement une de vos actions mais en contrepartie un de vos amis aventuriers échoue lamentablement." },
  { id:12, fichier:"TT12.jpg", titre:"Même pas peur !",
    effet:"À utiliser au début d'un combat. Le niveau des monstres augmente d'un rang. En revanche chaque joueur a droit à une carte supplémentaire." },
  { id:13, fichier:"TT13.jpg", titre:"Je connais son point faible !",
    effet:"La difficulté de votre prochain jet de dés est égale à 0 quelle que soit la difficulté prévue par le Maître." },
  { id:14, fichier:"TT14.jpg", titre:"Je ne sais rien mais je dirai tout !",
    effet:"Un PNJ ou un monstre que vous avez capturé vous dit tout ce qu'il sait sans cacher la moindre information." },
  { id:15, fichier:"TT15.jpg", titre:"Je suis né sous une bonne étoile !",
    effet:"Lorsque vous tombez à 0 point de vie vous ne gagnez pas de point de destin." },
  { id:16, fichier:"TT16.jpg", titre:"On peut la refaire ?",
    effet:"Relancez les dés si votre premier jet vous a déçu." },
  { id:17, fichier:"TT17.jpg", titre:"Poussez-vous de là !",
    effet:"Quelle que soit l'action en cours vous agissez avant tout le monde." },
  { id:18, fichier:"TT18.jpg", titre:"Je crois qu'il respire encore",
    effet:"Utilisez cette carte quand un aventurier vient de mourir. Il reprend connaissance avec 1 point de vie. Il gagne tout de même 1 point de destin." },
  { id:19, fichier:"TT19.jpg", titre:"Je me contenterai des restes !",
    effet:"Vous pouvez reprendre une carte déjà utilisée en échange de celle-ci." },
  { id:20, fichier:"TT20.jpg", titre:"Muahahahahah !",
    effet:"L'adversaire des aventuriers ne peut pas s'empêcher de parler de ses plans diaboliques. Il ne peut pas blesser les aventuriers qui agissent contre lui au cours de ce round." },
  { id:21, fichier:"TT21.jpg", titre:"Notre heureuse petite bande de frères",
    effet:"Trouvez une belle tirade à déclamer. L'ensemble du groupe gagne un +2 à son prochain jet de dés." },
  { id:22, fichier:"TT22.jpg", titre:"L'amour toujours l'amour !",
    effet:"Un PNJ tombe amoureux d'un autre aventurier et est prêt à tout pour l'aider. En cas de refus l'amoureux déçu cherchera à se venger." },
  { id:23, fichier:"TT23.jpg", titre:"Ma thérapie semble fonctionner",
    effet:"Vous pouvez vous débarrasser d'une des faiblesses que vous avez acquises au cours de cette partie." },
  { id:24, fichier:"TT24.jpg", titre:"Je ne crois pas, non !",
    effet:"Vous pouvez empêcher le Maître d'utiliser une de vos faiblesses contre vous." },
  { id:25, fichier:"TT25.jpg", titre:"Regardez ce que j'ai trouvé !",
    effet:"Vous trouvez un nouvel objet pour votre besace sur le dernier monstre que vous avez vaincu. Rien ne vous oblige à le décrire immédiatement." },
  { id:26, fichier:"TT26.jpg", titre:"On appelle ça le talent",
    effet:"Tout avantage que vous gagnez au cours de cette partie voit son niveau augmenter d'un point." },
  { id:27, fichier:"TT27.jpg", titre:"Je fais pareil que lui !",
    effet:"Vous pouvez bénéficier de l'avantage d'un autre aventurier lorsque celui-ci l'utilise. Tâcher d'expliquer pourquoi..." },
];

/**
 * Piocher une carte aléatoire pour un acteur
 * Ajoute la carte à la main du joueur et l'affiche dans le chat
 */
export async function piocherCarte(actor) {
  const idx  = Math.floor(Math.random() * CARTES_EVENEMENT.length);
  const carte = CARTES_EVENEMENT[idx];

  // Sauvegarder la carte active sur l'acteur (pour affichage fiche)
  const carteActuelle = actor.system.carte_active ?? null;
  const main = actor.system.cartes_en_main ? [...actor.system.cartes_en_main] : [];
  main.push(carte.id);

  await actor.update({
    "system.carte_active":   carte.id,
    "system.cartes_en_main": main
  });

  // Message dans le chat avec l'image de la carte
  const imgPath = `systems/tranchons-et-traquons/assets/cartes/${carte.fichier}`;
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `
      <div class="tnt-carte-chat">
        <div class="carte-joueur"><strong>${actor.name}</strong> pioche une carte !</div>
        <img src="${imgPath}" class="carte-img-chat" title="${carte.titre}" />
        <div class="carte-titre">${carte.titre}</div>
        <div class="carte-effet">${carte.effet}</div>
      </div>
    `
  });

  return carte;
}

/**
 * Utiliser (défausser) la carte active
 */
export async function utiliserCarte(actor, carteId) {
  const main = (actor.system.cartes_en_main ?? []).filter(id => id !== carteId);
  const nouvelleActive = main.length > 0 ? main[main.length - 1] : null;

  await actor.update({
    "system.cartes_en_main": main,
    "system.carte_active":   nouvelleActive
  });

  const carte = CARTES_EVENEMENT.find(c => c.id === carteId);
  if (carte) {
    const imgPath = `systems/tranchons-et-traquons/assets/cartes/${carte.fichier}`;
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `
        <div class="tnt-carte-chat utilisee">
          <div class="carte-joueur"><strong>${actor.name}</strong> joue : <em>${carte.titre}</em></div>
          <img src="${imgPath}" class="carte-img-chat" />
          <div class="carte-effet">${carte.effet}</div>
        </div>
      `
    });
  }
}
