import { StoryState, StorySettings } from '../types';

export interface GenrePreset {
  id: string;
  name: string;
  tagline: string;
  description: string;
  defaultCharacter: {
    name: string;
    role: string;
    visualAnchor: string;
  };
  startingQuest: {
    title: string;
    description: string;
    currentStep: string;
  };
  startingInventory: Array<{
    id: string;
    name: string;
    type: 'weapon' | 'armor' | 'consumable' | 'relic' | 'key' | 'tool' | 'lore';
    quantity: number;
    description: string;
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    effect?: string;
  }>;
  startingPrompt: string;
  suggestedArtStyle: string;
}

export interface ArtStylePreset {
  id: string;
  name: string;
  description: string;
  promptPrefix: string;
  previewColor: string;
}

export const ART_STYLES: ArtStylePreset[] = [
  {
    id: 'grimdark_oil',
    name: 'Grimdark Oil Painting',
    description: 'Chiaroscuro lighting, rich textured brushstrokes, moody earthy palette reminiscent of classical masters.',
    promptPrefix: 'Masterpiece dark fantasy oil painting, heavy impasto textures, dramatic Caravaggio chiaroscuro lighting, muted amber and charcoal palette, atmospheric haze, epic cinematic composition.',
    previewColor: '#78350f',
  },
  {
    id: 'graphic_novel',
    name: 'Gothic Graphic Novel',
    description: 'Crisp ink lines, atmospheric cross-hatching, stylized shadows, and muted watercolor wash.',
    promptPrefix: 'High-contrast dark gothic graphic novel illustration, expressive bold ink linework, cross-hatching, selective moody watercolor tones, dramatic comic panel framing.',
    previewColor: '#1e293b',
  },
  {
    id: 'concept_art',
    name: 'Cinematic Concept Art',
    description: 'High-budget fantasy cinematic visual development art with volumetric lighting and photorealistic textures.',
    promptPrefix: 'Epic cinematic concept art, volumetric fog and god rays, detailed material rendering, hyper-detailed environment, realistic cinematic lighting, film still 8k aesthetic.',
    previewColor: '#0f766e',
  },
  {
    id: 'retro_anime',
    name: 'Retro 90s Dark Anime',
    description: 'Nostalgic cel-shaded cel animation aesthetic with hand-painted watercolor backgrounds and gritty retro grit.',
    promptPrefix: '1990s vintage dark fantasy anime aesthetic, cel-shaded character design, hand-painted watercolor background scenery, film grain, aesthetic retro sci-fi fantasy look.',
    previewColor: '#6b21a8',
  },
  {
    id: 'woodcut',
    name: 'Antique Woodcut & Parchment',
    description: 'Medieval illuminated manuscript woodcut engraving with aged sepia parchment and ornate borders.',
    promptPrefix: 'Intricate 15th-century medieval woodcut engraving, antique parchment texture, detailed linework hatching, antique copperplate illustration style, aged sepia and black ink.',
    previewColor: '#854d0e',
  },
];

export const GENRE_PRESETS: GenrePreset[] = [
  {
    id: 'eldritch_fantasy',
    name: 'The Sunken Cathedral of Yogg-Mar',
    tagline: 'Grimdark Eldritch Fantasy',
    description: 'Ancient bells toll beneath black tidal waters. Forbidden runes flare in drowned crypts as forgotten leviathans stir.',
    defaultCharacter: {
      name: 'Kaelen Vane',
      role: 'Exiled Tide-Caster',
      visualAnchor: 'Weathered pale wanderer with silver-streaked raven hair tied back in a leather thong, scarred left temple, glowing aqua runic brand on right forearm, dressed in a salt-stained dark teal hooded coat with brass buckles and worn leather bracers.',
    },
    startingQuest: {
      title: 'Echoes of the Deep Bells',
      description: 'Investigate the submerged narthex of Yogg-Mar and locate the Coral Sigil before the spring tide swallows the causeway.',
      currentStep: 'Breach the barnacle-encrusted bronze portcullis without rousing the brine-drowned husks.',
    },
    startingInventory: [
      {
        id: 'item-1',
        name: 'Runic Coral Dagger',
        type: 'weapon',
        quantity: 1,
        description: 'Forged from petrified abyssal coral. Glows with a faint azure pulse when ancient magic is near.',
        rarity: 'rare',
        effect: '+2 Arcane Resonance in submerged ruins',
      },
      {
        id: 'item-2',
        name: 'Phosphor Oil Flask',
        type: 'consumable',
        quantity: 3,
        description: 'A viscous bioluminescent oil that burns underwater for thirty minutes without smoke.',
        rarity: 'common',
        effect: 'Provides steady light underwater or ignites brine creatures',
      },
      {
        id: 'item-3',
        name: 'Tattered Sea-Wanderer Map',
        type: 'lore',
        quantity: 1,
        description: 'Vellum chart detailing high-tide contours and treacherous subterranean siphons.',
        rarity: 'uncommon',
      },
    ],
    startingPrompt: 'The black tide recedes just enough to reveal the slime-slick basalt stairway descending into the sunken cathedral of Yogg-Mar. A bell rings once from thirty fathoms beneath.',
    suggestedArtStyle: 'grimdark_oil',
  },
  {
    id: 'cyberpunk_neon',
    name: 'Neon Underbelly: Sector 09',
    tagline: 'Gritty Cyberpunk Thriller',
    description: 'Rain-slicked skyscrapers pierce smoggy skies while mega-corporation enforcers hunt down rogue bio-hackers in the alleys.',
    defaultCharacter: {
      name: 'Vesper Thorne',
      role: 'Rogue Neural Splicer',
      visualAnchor: 'Lean street runner with an asymmetrical undercut featuring luminous cyan fiber-optic braids, a chrome cybernetic ocular implant over right eye glowing amber, wearing an oversized matte-black weatherproof tactical trench coat with glowing purple interior wiring.',
    },
    startingQuest: {
      title: 'The Ghost Chip Heist',
      description: 'Extract the encrypted NeuroDyn prototype drive from the clandestine black clinic in Lower Shibuya.',
      currentStep: 'Bypass the biometric gate guards or hack the ventilation system on the 4th sublevel.',
    },
    startingInventory: [
      {
        id: 'item-cyber-1',
        name: 'Overclocked Cyber-Deck',
        type: 'tool',
        quantity: 1,
        description: 'Modified military-grade deck with spliced thermal sinks and brute-force protocol chips.',
        rarity: 'epic',
        effect: 'Allows neural breach of civilian subnets',
      },
      {
        id: 'item-cyber-2',
        name: 'Silenced Monofilament Stinger',
        type: 'weapon',
        quantity: 1,
        description: 'A micro-caliber kinetic pistol tuned for whisper-quiet armor penetration.',
        rarity: 'uncommon',
      },
      {
        id: 'item-cyber-3',
        name: 'Neuro-Stim Inhaler',
        type: 'consumable',
        quantity: 2,
        description: 'Quick-release adrenal stimulant that boosts reflexes and cognitive speed for 20 seconds.',
        rarity: 'common',
      },
    ],
    startingPrompt: 'Heavy acid rain hisses against the neon signs of the noodle market. Your holowatch vibrates with an encrypted ping: the target courier has just entered the back alley.',
    suggestedArtStyle: 'retro_anime',
  },
  {
    id: 'gothic_horror',
    name: 'Curse of the Blood Raven Estate',
    tagline: 'Victorian Gothic Mystery',
    description: 'An isolated manor perched over mist-shrouded moors harbors a dynasty that never died—and an inheritance steeped in red.',
    defaultCharacter: {
      name: 'Lady Evelina Cross',
      role: 'Occult Inquisitor',
      visualAnchor: 'Austere woman with sharp aristocratic features, striking auburn hair coiled in an intricate braided chignon, piercing emerald eyes, wearing a dark velvet traveling coat with silver filigree buttons and charcoal-stained kidskin leather gloves.',
    },
    startingQuest: {
      title: 'The Seven Locked Doors',
      description: 'Discover the fate of Lord Ravenshire and cleanse the ancestral crypt before the stroke of midnight.',
      currentStep: 'Uncover why the grandfather clock in the grand parlor has stopped ticking at 11:47 PM.',
    },
    startingInventory: [
      {
        id: 'item-goth-1',
        name: 'Silver Inquisitor Rapier',
        type: 'weapon',
        quantity: 1,
        description: 'Slender dueling blade etched with Latin psalm verses, tempered in holy oil.',
        rarity: 'rare',
      },
      {
        id: 'item-goth-2',
        name: 'Brass Spirit Lantern',
        type: 'tool',
        quantity: 1,
        description: 'Its pale violet flame bends toward unseen specters and supernatural cold spots.',
        rarity: 'uncommon',
      },
      {
        id: 'item-goth-3',
        name: 'Bloodhound Scent Salve',
        type: 'consumable',
        quantity: 2,
        description: 'Herbal balm that heightens human perception to track ethereal footprints.',
        rarity: 'common',
      },
    ],
    startingPrompt: 'Thunder rumbles across the desolate moors as the iron gates of Blackwood Manor swing open in the gale. Through the fog, candlelight flickers in a single attic window.',
    suggestedArtStyle: 'graphic_novel',
  },
];

export const INITIAL_STORY: StoryState = {
  id: 'story-init-001',
  title: 'The Sunken Cathedral of Yogg-Mar',
  genre: 'Eldritch Grimdark Fantasy',
  startedAt: Date.now(),
  settings: {
    genre: 'Eldritch Grimdark Fantasy',
    artStyleName: 'Grimdark Oil Painting',
    artStylePrefix: 'Masterpiece dark fantasy oil painting, heavy impasto textures, dramatic Caravaggio chiaroscuro lighting, muted amber and charcoal palette, atmospheric haze, epic cinematic composition.',
    preferredImageSize: '1K',
    autoGenerateImages: true,
    storyMode: 'standard',
  },
  character: {
    name: 'Kaelen Vane',
    role: 'Exiled Tide-Caster',
    visualAnchor: 'Weathered pale wanderer with silver-streaked raven hair tied back in a leather thong, scarred left temple, glowing aqua runic brand on right forearm, dressed in a salt-stained dark teal hooded coat with brass buckles and worn leather bracers.',
    health: 95,
    maxHealth: 100,
    resolve: 80,
    maxResolve: 100,
    statusEffects: ['Salt-Stained', 'Sea-Whisper'],
    title: 'The Exile of Oakhaven',
  },
  quest: {
    id: 'quest-001',
    title: 'Echoes of the Deep Bells',
    description: 'Investigate the submerged narthex of Yogg-Mar and locate the Coral Sigil before the spring tide swallows the causeway.',
    progressPercentage: 15,
    currentStep: 'Breach the barnacle-encrusted bronze portcullis without rousing the brine-drowned husks.',
    completedSteps: ['Crossed the slippery low-tide basalt causeway'],
    recentMilestone: 'Discovered the hidden threshold beneath the black cliffs.',
  },
  inventory: [
    {
      id: 'item-1',
      name: 'Runic Coral Dagger',
      type: 'weapon',
      quantity: 1,
      description: 'Forged from petrified abyssal coral. Glows with a faint azure pulse when ancient magic is near.',
      rarity: 'rare',
      effect: '+2 Arcane Resonance in submerged ruins',
      isEquipped: true,
    },
    {
      id: 'item-2',
      name: 'Phosphor Oil Flask',
      type: 'consumable',
      quantity: 3,
      description: 'A viscous bioluminescent oil that burns underwater for thirty minutes without smoke.',
      rarity: 'common',
      effect: 'Provides steady light underwater or ignites brine creatures',
    },
    {
      id: 'item-3',
      name: 'Tattered Sea-Wanderer Map',
      type: 'lore',
      quantity: 1,
      description: 'Vellum chart detailing high-tide contours and treacherous subterranean siphons.',
      rarity: 'uncommon',
    },
  ],
  charactersMet: [
    {
      id: 'npc-1',
      name: 'Barnaby the Blind Ferryman',
      role: 'Sole survivor of the 3rd Abyssal Expedition',
      attitude: 'neutral',
      visualAnchor: 'Old hunched boatman with milky white blind eyes, tattered oilskin poncho, holding an iron-shod oar carved with warding symbols.',
      notes: 'Warned that when the bronze bell strikes thrice, the water will rise within heartbeats.',
      lastSeenChapter: 1,
    },
  ],
  chapters: [
    {
      id: 'chap-1',
      chapterNumber: 1,
      title: 'The Threshold of Salt and Bronze',
      narrativeText: `The black tide recedes with a dying gasp, exposing the barnacle-studded basalt spine connecting the mainland to the sunken narthex of Yogg-Mar. Three centuries under the crushing weight of the sea have not softened the cathedral’s cruel geometry; jagged spires protrude from the froth like the ribcage of an ancient leviathan.

You step onto the slippery causeway, your boots crunching against broken whelk shells and brittle star-stones. The runic brand on your right forearm flares with cold, prickling heat as the great bronze bell deep within the submerged depths tolls once. The vibration shudders through the rock beneath your feet, sending ripples racing across tide pools.

Ahead, the colossal bronze gates stand ajar by barely two feet. Thick kelp curtains the gap, and from within the gloom drifts the scent of ancient incense blended with rotting ambergris. Somewhere in that dripping darkness lies the Coral Sigil—the only key to dispelling the curse consuming your bloodline. But the water is already lapping at your heels, and shadows shift beneath the surface of the drowned cloister.`,
      choiceTaken: 'Approached the sunken threshold at low tide',
      choicesAvailable: [
        {
          id: 'opt-1',
          text: 'Coat your blade in Phosphor Oil and squeeze silently through the kelp-draped bronze gates.',
          riskLevel: 'safe',
          hint: 'Ensures immediate illumination and readiness if husks lurk behind the portal.',
        },
        {
          id: 'opt-2',
          text: 'Channel your runic brand into the basalt threshold to scry for movement in the drowned cloister.',
          riskLevel: 'moderate',
          hint: 'May reveal enemy positions and hidden traps, but drains resolve and emits a visible arcane glow.',
        },
        {
          id: 'opt-3',
          text: 'Scale the crumbling gargoyle buttress to enter through the shattered rose window above.',
          riskLevel: 'perilous',
          hint: 'Bypasses the flooded ground floor entirely, but the sea-worn masonry could shear away.',
        },
      ],
      visualSceneDescription: 'A lone weathered adventurer standing on a wet black stone causeway at dusk, facing massive submerged gothic cathedral gates covered in sea barnacles and dripping kelp, ocean spray crashing against dark basalt cliffs.',
      timestamp: Date.now() - 1000 * 60 * 5,
    },
  ],
  activeChapterIndex: 0,
  isGeneratingTurn: false,
  turnError: null,
};
