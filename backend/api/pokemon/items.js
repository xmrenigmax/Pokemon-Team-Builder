import axios from 'axios';

// Battle-relevant held items only
const BATTLE_ITEMS = {
  'mega-stones': [
    'venusaurite', 'charizardite-x', 'charizardite-y', 'blastoisinite',
    'alakazite', 'gengarite', 'kangaskhanite', 'pinsirite',
    'gyaradosite', 'aerodactylite', 'mewtwonite-x', 'mewtwonite-y',
    'ampharosite', 'scizorite', 'heracronite', 'houndoominite',
    'tyranitarite', 'blazikenite', 'gardevoirite', 'mawilite',
    'aggronite', 'medichamite', 'manectite', 'banettite',
    'absolite', 'latiasite', 'latiosite', 'garchompite',
    'lucarionite', 'abomasite', 'galladite', 'audinite',
    'sceptilite', 'sablenite', 'altarianite', 'sharpedonite',
    'slowbronite', 'steelixite', 'pidgeotite', 'glalitite',
    'salamencite', 'metagrossite', 'cameruptite', 'lopunnite',
    'beedrillite', 'swampertite'
  ],
  'z-crystals': [
    'normalium-z', 'firium-z', 'waterium-z', 'electrium-z', 'grassium-z',
    'icium-z', 'fightinium-z', 'poisonium-z', 'groundium-z', 'flyinium-z',
    'psychium-z', 'buginium-z', 'rockium-z', 'ghostium-z', 'dragonium-z',
    'darkinium-z', 'steelium-z', 'fairium-z', 'pikanium-z', 'decidium-z',
    'incinium-z', 'primarium-z', 'tapunium-z', 'marshadium-z', 'aloraichium-z',
    'snorlium-z', 'eevium-z', 'mewnium-z', 'pikashunium-z'
  ],
  'held-items': [
    'leftovers', 'choice-band', 'choice-specs', 'choice-scarf', 'life-orb',
    'focus-sash', 'assault-vest', 'black-glasses', 'charcoal', 'mystic-water',
    'miracle-seed', 'magnet', 'never-melt-ice', 'dragon-fang', 'black-belt',
    'poison-barb', 'soft-sand', 'sharp-beak', 'twisted-spoon', 'hard-stone',
    'silver-powder', 'spell-tag', 'metal-coat', 'silken-scarf', 'shell-bell',
    'muscle-band', 'wise-glasses', 'expert-belt', 'light-clay', 'metronome',
    'quick-claw', 'scope-lens', 'kings-rock', 'razor-claw', 'razor-fang',
    'bright-powder', 'wide-lens', 'zoom-lens', 'lagging-tail', 'iron-ball',
    'ring-target', 'binding-band', 'eject-button', 'red-card', 'air-balloon',
    'float-stone', 'rocky-helmet', 'weakness-policy', 'adrenaline-orb',
    'terrain-extender', 'protective-pads', 'electric-seed', 'psychic-seed',
    'misty-seed', 'grassy-seed', 'luminous-moss', 'snowball', 'safety-goggles',
    'grip-claw', 'shed-shell', 'big-root', 'absorb-bulb', 'cell-battery',
    'luminous-ball', 'thick-club', 'stick', 'soul-dew', 'deep-sea-tooth',
    'deep-sea-scale', 'light-ball', 'luck-punch', 'metal-powder', 'quick-powder'
  ],
  'dynamax': [
    'dynamax-candy', 'max-mushrooms'
  ]
};

// Item effects descriptions
const ITEM_EFFECTS = {
  'leftovers': 'Restores 1/16 of max HP at the end of each turn.',
  'choice-band': 'Boosts Attack by 50%, but restricts the holder to one move.',
  'choice-specs': 'Boosts Special Attack by 50%, but restricts the holder to one move.',
  'choice-scarf': 'Boosts Speed by 50%, but restricts the holder to one move.',
  'life-orb': 'Boosts damage by 30%, but holder loses 10% HP per attack.',
  'focus-sash': 'Allows the holder to survive one fatal blow with 1 HP.',
  'assault-vest': 'Boosts Special Defense by 50%, but prevents status moves.',
  'weakness-policy': 'Boosts Attack and Special Attack by 2 stages when hit by a super-effective move.',
  'rocky-helmet': 'Damages attacking Pokémon for 1/6 of their max HP when they use a contact move.',
  'air-balloon': 'Makes the holder immune to Ground-type moves until hit.',
  'expert-belt': 'Boosts super-effective moves by 20%.',
  'muscle-band': 'Boosts physical moves by 10%.',
  'wise-glasses': 'Boosts special moves by 10%.',
  'black-glasses': 'Boosts Dark-type moves by 20%.',
  'charcoal': 'Boosts Fire-type moves by 20%.',
  'mystic-water': 'Boosts Water-type moves by 20%.',
  'magnet': 'Boosts Electric-type moves by 20%.',
  'miracle-seed': 'Boosts Grass-type moves by 20%.',
  'never-melt-ice': 'Boosts Ice-type moves by 20%.',
  'dragon-fang': 'Boosts Dragon-type moves by 20%.',
  'black-belt': 'Boosts Fighting-type moves by 20%.',
  'poison-barb': 'Boosts Poison-type moves by 20%.',
  'soft-sand': 'Boosts Ground-type moves by 20%.',
  'sharp-beak': 'Boosts Flying-type moves by 20%.',
  'twisted-spoon': 'Boosts Psychic-type moves by 20%.',
  'hard-stone': 'Boosts Rock-type moves by 20%.',
  'silver-powder': 'Boosts Bug-type moves by 20%.',
  'spell-tag': 'Boosts Ghost-type moves by 20%.',
  'metal-coat': 'Boosts Steel-type moves by 20%.',
  'silken-scarf': 'Boosts Normal-type moves by 20%.',
  'shell-bell': 'Restores HP equal to 1/8 of damage dealt.',
  'quick-claw': 'Gives a 20% chance to move first.',
  'scope-lens': 'Increases critical hit ratio by one stage.',
  'kings-rock': 'May cause the target to flinch when hit.',
  'bright-powder': 'Lowers the accuracy of attacks against the holder by 10%.'
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { category } = req.query;

  try {
    let items = [];

    if (category && BATTLE_ITEMS[category]) {
      // Return items for specific category
      items = BATTLE_ITEMS[category].map(itemName => ({
        name: itemName,
        category: category,
        effect: ITEM_EFFECTS[itemName] || getDefaultEffect(itemName, category),
        displayName: formatItemName(itemName)
      }));
    } else {
      // Return all battle items
      Object.keys(BATTLE_ITEMS).forEach(cat => {
        BATTLE_ITEMS[cat].forEach(itemName => {
          items.push({
            name: itemName,
            category: cat,
            effect: ITEM_EFFECTS[itemName] || getDefaultEffect(itemName, cat),
            displayName: formatItemName(itemName)
          });
        });
      });
    }

    // Sort items by category and name
    items.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return a.displayName.localeCompare(b.displayName);
    });

    res.status(200).json({
      items: items,
      total: items.length
    });

  } catch (error) {
    console.error('Error in items API:', error.message);
    
    // Fallback to static items
    const fallbackItems = [];
    Object.keys(BATTLE_ITEMS).forEach(cat => {
      BATTLE_ITEMS[cat].forEach(itemName => {
        fallbackItems.push({
          name: itemName,
          category: cat,
          effect: ITEM_EFFECTS[itemName] || getDefaultEffect(itemName, cat),
          displayName: formatItemName(itemName)
        });
      });
    });
    
    res.status(200).json({
      items: fallbackItems,
      total: fallbackItems.length
    });
  }
}

function getDefaultEffect(itemName, category) {
  if (category === 'mega-stones') {
    return 'Allows the corresponding Pokémon to Mega Evolve during battle.';
  } else if (category === 'z-crystals') {
    return 'Allows the use of Z-Moves of the corresponding type.';
  } else if (category === 'dynamax') {
    return 'Used for Dynamaxing and Gigantamaxing in battle.';
  } else {
    return 'A useful held item for battle.';
  }
}

function formatItemName(itemName) {
  return itemName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .replace('ite', 'ite')
    .replace('Z', ' Z')
    .replace('X', ' X')
    .replace('Y', ' Y');
}