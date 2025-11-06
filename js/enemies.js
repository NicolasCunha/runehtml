// Enemies Manager - Defines all combat enemies
// 297 total enemies: 99 per combat skill (Melee, Ranged, Defense)

class EnemiesManager {
    constructor() {
        this.enemies = {
            melee: this.getMeleeEnemies(),
            ranged: this.getRangedEnemies(),
            defense: this.getDefenseEnemies()
        };
    }

    /**
     * Get random enemy for a skill based on player level
     * @param {string} skill - Combat skill (melee, ranged, defense)
     * @param {number} level - Player's skill level
     * @returns {Object} - Enemy object with stats and drops
     */
    getRandomEnemy(skill, level) {
        const skillEnemies = this.enemies[skill];
        if (!skillEnemies) return null;

        // Filter enemies within level range (±10 levels)
        const minLevel = Math.max(1, level - 10);
        const maxLevel = Math.min(99, level + 10);
        const availableEnemies = skillEnemies.filter(e => e.level >= minLevel && e.level <= maxLevel);

        if (availableEnemies.length === 0) {
            // Fallback to closest enemy
            return skillEnemies.reduce((prev, curr) => 
                Math.abs(curr.level - level) < Math.abs(prev.level - level) ? curr : prev
            );
        }

        // Random selection
        return availableEnemies[Math.floor(Math.random() * availableEnemies.length)];
    }

    /**
     * Calculate enemy HP based on level
     * @param {number} level - Enemy level
     * @returns {number} - Enemy max HP
     */
    calculateEnemyHP(level) {
        return 50 + (level * 8);
    }

    /**
     * Get all enemies for a skill (for testing/debug)
     */
    getEnemiesForSkill(skill) {
        return this.enemies[skill] || [];
    }

    // ==================== MELEE ENEMIES ====================
    getMeleeEnemies() {
        return [
            // Tier 1 (Levels 1-10)
            { name: 'Rat', level: 1, drops: ['rat_tail', 'rat_fur'] },
            { name: 'Goblin Scout', level: 2, drops: ['goblin_tooth', 'leather_scraps'] },
            { name: 'Imp', level: 3, drops: ['imp_ash', 'lesser_rune'] },
            { name: 'Giant Beetle', level: 4, drops: ['beetle_shell', 'chitin_fragment'] },
            { name: 'Feral Dog', level: 5, drops: ['dog_fang', 'torn_hide'] },
            { name: 'Zombie', level: 6, drops: ['rotting_flesh', 'bone_fragment'] },
            { name: 'Skeleton', level: 7, drops: ['bone_shard', 'skull_piece'] },
            { name: 'Goblin Warrior', level: 8, drops: ['goblin_blade', 'iron_scraps'] },
            { name: 'Wild Boar', level: 9, drops: ['boar_tusk', 'tough_hide'] },
            { name: 'Bandit', level: 10, drops: ['broken_sword', 'copper_coin'] },

            // Tier 2 (Levels 11-20)
            { name: 'Orc Scout', level: 11, drops: ['orc_tooth', 'crude_axe'] },
            { name: 'Giant Spider', level: 12, drops: ['spider_silk', 'venom_sac'] },
            { name: 'Ghoul', level: 13, drops: ['ghoul_claw', 'cursed_bone'] },
            { name: 'Hobgoblin', level: 14, drops: ['hobgoblin_armor', 'iron_blade'] },
            { name: 'Werewolf', level: 15, drops: ['werewolf_fang', 'silver_fur'] },
            { name: 'Troll', level: 16, drops: ['troll_hide', 'regeneration_gland'] },
            { name: 'Orc Warrior', level: 17, drops: ['orc_axe', 'iron_plate'] },
            { name: 'Minotaur', level: 18, drops: ['minotaur_horn', 'battle_axe_head'] },
            { name: 'Dark Elf', level: 19, drops: ['dark_steel', 'shadow_essence'] },
            { name: 'Ogre', level: 20, drops: ['ogre_club', 'thick_bone'] },

            // Tier 3 (Levels 21-30)
            { name: 'Giant Scorpion', level: 21, drops: ['scorpion_tail', 'poison_gland'] },
            { name: 'Berserker', level: 22, drops: ['battle_axe', 'rage_crystal'] },
            { name: 'Wraith', level: 23, drops: ['spectral_essence', 'soul_fragment'] },
            { name: 'Cyclops', level: 24, drops: ['giant_eye', 'massive_club'] },
            { name: 'Wight', level: 25, drops: ['ancient_blade', 'cursed_armor'] },
            { name: 'Hellhound', level: 26, drops: ['hellfire_fang', 'infernal_ash'] },
            { name: 'Orc Chieftain', level: 27, drops: ['chieftain_axe', 'steel_plate'] },
            { name: 'Mummy', level: 28, drops: ['ancient_wrappings', 'preserved_organs'] },
            { name: 'Gargoyle', level: 29, drops: ['stone_wing', 'granite_claw'] },
            { name: 'Banshee', level: 30, drops: ['wail_essence', 'spirit_cloth'] },

            // Tier 4 (Levels 31-40)
            { name: 'Giant', level: 31, drops: ['giant_bone', 'boulder_fragment'] },
            { name: 'Death Knight', level: 32, drops: ['cursed_blade', 'dark_plate'] },
            { name: 'Harpy', level: 33, drops: ['harpy_feather', 'talon_claw'] },
            { name: 'Manticore', level: 34, drops: ['manticore_tail', 'poison_spine'] },
            { name: 'Revenant', level: 35, drops: ['ancient_weapon', 'spectral_armor'] },
            { name: 'Troll Berserker', level: 36, drops: ['berserker_hide', 'rage_gland'] },
            { name: 'Chimera', level: 37, drops: ['chimera_scale', 'tri_elemental_core'] },
            { name: 'Vampire Spawn', level: 38, drops: ['vampire_fang', 'blood_vial'] },
            { name: 'Demon Imp', level: 39, drops: ['demon_claw', 'sulfur_crystal'] },
            { name: 'Ettin', level: 40, drops: ['two_headed_skull', 'giant_club'] },

            // Tier 5 (Levels 41-50)
            { name: 'Vampire', level: 41, drops: ['vampire_blood', 'crimson_cape'] },
            { name: 'Dark Wizard', level: 42, drops: ['cursed_staff', 'dark_orb'] },
            { name: 'Stone Golem', level: 43, drops: ['golem_core', 'enchanted_stone'] },
            { name: 'War Chief', level: 44, drops: ['war_axe', 'chief_helmet'] },
            { name: 'Cave Troll', level: 45, drops: ['troll_regeneration', 'cave_crystal'] },
            { name: 'Demon Warrior', level: 46, drops: ['demon_blade', 'infernal_armor'] },
            { name: 'Frost Giant', level: 47, drops: ['frozen_heart', 'ice_club'] },
            { name: 'Bone Dragon', level: 48, drops: ['dragon_bone', 'necrotic_essence'] },
            { name: 'Black Knight', level: 49, drops: ['black_blade', 'cursed_plate'] },
            { name: 'Abyssal Demon', level: 50, drops: ['abyssal_whip', 'demon_heart'] },

            // Tier 6 (Levels 51-60)
            { name: 'Iron Golem', level: 51, drops: ['golem_heart', 'steel_core'] },
            { name: 'Wyvern', level: 52, drops: ['wyvern_scale', 'dragon_tooth'] },
            { name: 'Lich', level: 53, drops: ['phylactery_shard', 'death_essence'] },
            { name: 'Hydra', level: 54, drops: ['hydra_scale', 'regenerating_head'] },
            { name: 'Fire Elemental', level: 55, drops: ['fire_core', 'molten_essence'] },
            { name: 'Greater Demon', level: 56, drops: ['greater_demon_horn', 'hellfire_shard'] },
            { name: 'War Golem', level: 57, drops: ['war_core', 'mithril_plating'] },
            { name: 'Vampire Lord', level: 58, drops: ['lord_fang', 'ancient_blood'] },
            { name: 'Shadow Beast', level: 59, drops: ['shadow_claw', 'void_essence'] },
            { name: 'Behemoth', level: 60, drops: ['behemoth_horn', 'titan_bone'] },

            // Tier 7 (Levels 61-70)
            { name: 'Dragon Whelp', level: 61, drops: ['dragon_scale', 'flame_gland'] },
            { name: 'Demon Lord', level: 62, drops: ['demon_crown', 'hellfire_core'] },
            { name: 'Adamant Golem', level: 63, drops: ['adamant_core', 'living_metal'] },
            { name: 'Ancient Warrior', level: 64, drops: ['ancient_blade', 'hero_armor'] },
            { name: 'Ice Elemental', level: 65, drops: ['ice_core', 'frozen_essence'] },
            { name: 'Greater Vampire', level: 66, drops: ['pure_blood', 'vampire_lord_fang'] },
            { name: 'Arch Demon', level: 67, drops: ['arch_demon_horn', 'infernal_heart'] },
            { name: 'Crystal Golem', level: 68, drops: ['crystal_heart', 'prismatic_shard'] },
            { name: 'Void Walker', level: 69, drops: ['void_shard', 'dimensional_essence'] },
            { name: 'Young Dragon', level: 70, drops: ['dragon_heart', 'dragonfire_gland'] },

            // Tier 8 (Levels 71-80)
            { name: 'Balrog', level: 71, drops: ['balrog_horn', 'flame_whip'] },
            { name: 'Titan', level: 72, drops: ['titan_heart', 'primordial_stone'] },
            { name: 'Elder Vampire', level: 73, drops: ['elder_blood', 'immortal_essence'] },
            { name: 'Death Incarnate', level: 74, drops: ['death_scythe', 'soul_reaper'] },
            { name: 'Greater Hydra', level: 75, drops: ['hydra_heart', 'eternal_regeneration'] },
            { name: 'War Titan', level: 76, drops: ['titan_blade', 'war_essence'] },
            { name: 'Infernal Dragon', level: 77, drops: ['infernal_scale', 'hellfire_breath'] },
            { name: 'Demon Prince', level: 78, drops: ['prince_crown', 'demon_throne_shard'] },
            { name: 'Runite Golem', level: 79, drops: ['runite_core', 'ancient_mechanism'] },
            { name: 'Shadow Dragon', level: 80, drops: ['shadow_scale', 'void_breath'] },

            // Tier 9 (Levels 81-90)
            { name: 'Ancient Dragon', level: 81, drops: ['ancient_scale', 'dragon_soul'] },
            { name: 'Demon Prince', level: 82, drops: ['demonic_essence', 'hell_crown'] },
            { name: 'Lich King', level: 83, drops: ['lich_phylactery', 'undeath_essence'] },
            { name: 'Titan Warrior', level: 84, drops: ['titan_armor', 'primordial_weapon'] },
            { name: 'Death Knight Commander', level: 85, drops: ['commander_blade', 'death_plate'] },
            { name: 'Greater Balrog', level: 86, drops: ['balrog_heart', 'eternal_flame'] },
            { name: 'Void Dragon', level: 87, drops: ['void_scale', 'dimensional_breath'] },
            { name: 'Arch Lich', level: 88, drops: ['master_phylactery', 'necromancy_tome'] },
            { name: 'War God Avatar', level: 89, drops: ['divine_weapon', 'war_incarnation'] },
            { name: 'Elder Dragon', level: 90, drops: ['elder_scale', 'primordial_flame'] },

            // Tier 10 (Levels 91-99)
            { name: 'Dragon King', level: 91, drops: ['king_scale', 'dragon_throne_shard'] },
            { name: 'Demon Emperor', level: 92, drops: ['emperor_crown', 'hell_scepter'] },
            { name: 'Primordial Titan', level: 93, drops: ['primordial_core', 'creation_essence'] },
            { name: 'Death God', level: 94, drops: ['death_incarnation', 'soul_harvester'] },
            { name: 'Celestial Warrior', level: 95, drops: ['celestial_blade', 'heaven_armor'] },
            { name: 'Ancient Lich Lord', level: 96, drops: ['eternal_phylactery', 'undeath_crown'] },
            { name: 'Infernal Titan', level: 97, drops: ['infernal_core', 'hellfire_heart'] },
            { name: 'Void Emperor', level: 98, drops: ['void_crown', 'dimensional_scepter'] },
            { name: 'God of War', level: 99, drops: ['divine_essence', 'godslayer_blade'] }
        ];
    }

    // ==================== RANGED ENEMIES ====================
    getRangedEnemies() {
        return [
            // Tier 1 (Levels 1-10)
            { name: 'Bat', level: 1, drops: ['bat_wing', 'echo_membrane'] },
            { name: 'Thief', level: 2, drops: ['wooden_arrow', 'rope'] },
            { name: 'Wild Hawk', level: 3, drops: ['hawk_feather', 'sharp_talon'] },
            { name: 'Archer Goblin', level: 4, drops: ['goblin_bow', 'crude_arrow'] },
            { name: 'Scout', level: 5, drops: ['scouting_bow', 'iron_arrow'] },
            { name: 'Pixie', level: 6, drops: ['pixie_dust', 'tiny_bow'] },
            { name: 'Raven', level: 7, drops: ['raven_feather', 'black_plume'] },
            { name: 'Bandit Archer', level: 8, drops: ['bandit_bow', 'steel_arrow'] },
            { name: 'Giant Wasp', level: 9, drops: ['wasp_stinger', 'chitin_wing'] },
            { name: 'Eagle', level: 10, drops: ['eagle_feather', 'predator_talon'] },

            // Tier 2 (Levels 11-20)
            { name: 'Orc Archer', level: 11, drops: ['orc_bow', 'bone_arrow'] },
            { name: 'Fairy', level: 12, drops: ['fairy_wing', 'enchanted_arrow'] },
            { name: 'Vulture', level: 13, drops: ['vulture_feather', 'scavenger_beak'] },
            { name: 'Dark Scout', level: 14, drops: ['shadow_bow', 'dark_arrow'] },
            { name: 'Harpy Scout', level: 15, drops: ['harpy_bow', 'wind_feather'] },
            { name: 'Crossbowman', level: 16, drops: ['iron_crossbow', 'bolt_bundle'] },
            { name: 'Falcon', level: 17, drops: ['falcon_feather', 'hunter_talon'] },
            { name: 'Imp Archer', level: 18, drops: ['imp_bow', 'flame_arrow'] },
            { name: 'Giant Moth', level: 19, drops: ['moth_wing', 'dust_powder'] },
            { name: 'Elven Archer', level: 20, drops: ['elven_bow', 'mithril_arrow'] },

            // Tier 3 (Levels 21-30)
            { name: 'Assassin', level: 21, drops: ['throwing_knife', 'poison_dart'] },
            { name: 'Wyvern Scout', level: 22, drops: ['wyvern_talon', 'scale_arrow'] },
            { name: 'Dark Elf Ranger', level: 23, drops: ['dark_bow', 'shadow_bolt'] },
            { name: 'Giant Dragonfly', level: 24, drops: ['dragonfly_wing', 'compound_eye'] },
            { name: 'Sniper', level: 25, drops: ['sniper_rifle', 'piercing_bolt'] },
            { name: 'Gargoyle Archer', level: 26, drops: ['stone_bow', 'granite_arrow'] },
            { name: 'Wind Spirit', level: 27, drops: ['air_essence', 'gust_arrow'] },
            { name: 'Griffin Scout', level: 28, drops: ['griffin_feather', 'razor_talon'] },
            { name: 'Phantom Archer', level: 29, drops: ['spectral_bow', 'ghost_arrow'] },
            { name: 'Manticore Tail', level: 30, drops: ['tail_spike', 'venom_barb'] },

            // Tier 4 (Levels 31-40)
            { name: 'Dark Ranger', level: 31, drops: ['ranger_bow', 'cursed_arrow'] },
            { name: 'Fire Imp', level: 32, drops: ['flame_bow', 'burning_arrow'] },
            { name: 'Ice Harpy', level: 33, drops: ['frozen_bow', 'ice_shard'] },
            { name: 'Giant Eagle', level: 34, drops: ['giant_feather', 'massive_talon'] },
            { name: 'Shadow Assassin', level: 35, drops: ['shadow_blade', 'void_dart'] },
            { name: 'Elven Sniper', level: 36, drops: ['elven_longbow', 'enchanted_bolt'] },
            { name: 'Storm Raven', level: 37, drops: ['storm_feather', 'lightning_quill'] },
            { name: 'Basilisk', level: 38, drops: ['basilisk_scale', 'petrifying_gaze'] },
            { name: 'Wind Elemental', level: 39, drops: ['wind_core', 'cyclone_essence'] },
            { name: 'Dragon Hawk', level: 40, drops: ['dragon_plume', 'fire_talon'] },

            // Tier 5 (Levels 41-50)
            { name: 'Griffin', level: 41, drops: ['griffin_wing', 'lion_claw'] },
            { name: 'Master Sniper', level: 42, drops: ['master_crossbow', 'adamant_bolt'] },
            { name: 'Wyvern Rider', level: 43, drops: ['wyvern_saddle', 'rider_bow'] },
            { name: 'Eagle Knight', level: 44, drops: ['knight_bow', 'royal_arrow'] },
            { name: 'Wind Elemental Lord', level: 45, drops: ['elemental_bow', 'tempest_arrow'] },
            { name: 'Shadow Drake', level: 46, drops: ['drake_scale', 'shadow_breath'] },
            { name: 'Arch Ranger', level: 47, drops: ['legendary_bow', 'runite_arrow'] },
            { name: 'Thunder Bird', level: 48, drops: ['thunder_feather', 'shock_talon'] },
            { name: 'Dark Phoenix', level: 49, drops: ['dark_plume', 'cursed_flame'] },
            { name: 'Demon Archer', level: 50, drops: ['demon_bow', 'hellfire_arrow'] },

            // Tier 6 (Levels 51-60)
            { name: 'Crystal Archer', level: 51, drops: ['crystal_bow', 'prismatic_arrow'] },
            { name: 'Storm Griffin', level: 52, drops: ['storm_wing', 'lightning_talon'] },
            { name: 'Void Assassin', level: 53, drops: ['void_blade', 'dimensional_dart'] },
            { name: 'Ancient Eagle', level: 54, drops: ['ancient_feather', 'primordial_talon'] },
            { name: 'Fire Drake', level: 55, drops: ['fire_scale', 'flame_breath'] },
            { name: 'Elven Champion', level: 56, drops: ['champion_bow', 'enchanted_quiver'] },
            { name: 'Ice Phoenix', level: 57, drops: ['ice_plume', 'frozen_flame'] },
            { name: 'Shadow Wyvern', level: 58, drops: ['shadow_wing', 'void_scale'] },
            { name: 'Storm Elemental', level: 59, drops: ['storm_core', 'thunder_essence'] },
            { name: 'Dragon Rider', level: 60, drops: ['dragon_saddle', 'rider_lance'] },

            // Tier 7 (Levels 61-70)
            { name: 'Young Phoenix', level: 61, drops: ['phoenix_feather', 'rebirth_ash'] },
            { name: 'Void Ranger', level: 62, drops: ['void_bow', 'dimensional_arrow'] },
            { name: 'Ancient Griffin', level: 63, drops: ['ancient_wing', 'elder_talon'] },
            { name: 'Celestial Archer', level: 64, drops: ['celestial_bow', 'holy_arrow'] },
            { name: 'Storm Dragon', level: 65, drops: ['storm_scale', 'lightning_breath'] },
            { name: 'Shadow Phoenix', level: 66, drops: ['shadow_plume', 'void_flame'] },
            { name: 'Master Assassin', level: 67, drops: ['assassin_bow', 'death_dart'] },
            { name: 'Wind Dragon', level: 68, drops: ['wind_scale', 'cyclone_breath'] },
            { name: 'Elven Lord', level: 69, drops: ['lord_bow', 'divine_arrow'] },
            { name: 'Greater Phoenix', level: 70, drops: ['greater_plume', 'eternal_flame'] },

            // Tier 8 (Levels 71-80)
            { name: 'Celestial Griffin', level: 71, drops: ['celestial_wing', 'divine_talon'] },
            { name: 'Void Dragon', level: 72, drops: ['void_scale', 'dimension_breath'] },
            { name: 'Ancient Phoenix', level: 73, drops: ['ancient_plume', 'primordial_flame'] },
            { name: 'Storm Titan', level: 74, drops: ['titan_bow', 'thunder_titan_arrow'] },
            { name: 'Shadow Dragon Rider', level: 75, drops: ['shadow_saddle', 'void_lance'] },
            { name: 'Arch Phoenix', level: 76, drops: ['arch_plume', 'rebirth_core'] },
            { name: 'Celestial Sniper', level: 77, drops: ['divine_crossbow', 'heaven_bolt'] },
            { name: 'Greater Storm Dragon', level: 78, drops: ['storm_heart', 'tempest_scale'] },
            { name: 'Void Phoenix', level: 79, drops: ['void_plume', 'dimensional_flame'] },
            { name: 'Dragon Lord Rider', level: 80, drops: ['lord_saddle', 'dragon_lance'] },

            // Tier 9 (Levels 81-90)
            { name: 'Phoenix Guardian', level: 81, drops: ['guardian_plume', 'eternal_rebirth'] },
            { name: 'Dragon Rider Commander', level: 82, drops: ['commander_saddle', 'war_lance'] },
            { name: 'Storm Elemental Lord', level: 83, drops: ['elemental_heart', 'thunder_core'] },
            { name: 'Sky Titan', level: 84, drops: ['sky_essence', 'cloud_bow'] },
            { name: 'Celestial Dragon', level: 85, drops: ['celestial_scale', 'divine_breath'] },
            { name: 'Arch Void Ranger', level: 86, drops: ['arch_void_bow', 'dimension_quiver'] },
            { name: 'Ancient Storm Dragon', level: 87, drops: ['ancient_storm_scale', 'primordial_thunder'] },
            { name: 'Greater Celestial Phoenix', level: 88, drops: ['celestial_flame', 'heaven_plume'] },
            { name: 'Void Titan', level: 89, drops: ['void_titan_bow', 'dimension_arrow'] },
            { name: 'Elder Phoenix', level: 90, drops: ['elder_plume', 'immortal_flame'] },

            // Tier 10 (Levels 91-99)
            { name: 'Phoenix King', level: 91, drops: ['king_plume', 'throne_flame'] },
            { name: 'Dragon Emperor Rider', level: 92, drops: ['emperor_saddle', 'imperial_lance'] },
            { name: 'Storm God Avatar', level: 93, drops: ['divine_storm', 'god_thunder'] },
            { name: 'Celestial Titan', level: 94, drops: ['titan_wing', 'heaven_essence'] },
            { name: 'Void Emperor', level: 95, drops: ['emperor_bow', 'dimension_scepter'] },
            { name: 'Ancient Celestial Dragon', level: 96, drops: ['ancient_divine_scale', 'primordial_holy_breath'] },
            { name: 'Primordial Phoenix', level: 97, drops: ['primordial_plume', 'creation_flame'] },
            { name: 'Sky God', level: 98, drops: ['divine_wing', 'heaven_bow'] },
            { name: 'Eternal Phoenix', level: 99, drops: ['eternal_essence', 'immortal_rebirth'] }
        ];
    }

    // ==================== DEFENSE ENEMIES ====================
    getDefenseEnemies() {
        return [
            // Tier 1 (Levels 1-10)
            { name: 'Angry Boar', level: 1, drops: ['boar_hide', 'tusk_fragment'] },
            { name: 'Rabid Wolf', level: 2, drops: ['wolf_pelt', 'sharp_fang'] },
            { name: 'Charging Bull', level: 3, drops: ['bull_horn', 'thick_leather'] },
            { name: 'Wild Elk', level: 4, drops: ['elk_antler', 'sturdy_hide'] },
            { name: 'Guard Dog', level: 5, drops: ['guard_collar', 'loyal_fang'] },
            { name: 'Ram', level: 6, drops: ['ram_horn', 'wool_padding'] },
            { name: 'Bison', level: 7, drops: ['bison_hide', 'massive_horn'] },
            { name: 'Shield Goblin', level: 8, drops: ['wooden_shield', 'goblin_buckler'] },
            { name: 'Bear', level: 9, drops: ['bear_pelt', 'claw_guard'] },
            { name: 'Guard Captain', level: 10, drops: ['iron_shield', 'captain_helm'] },

            // Tier 2 (Levels 11-20)
            { name: 'Orc Defender', level: 11, drops: ['orc_shield', 'iron_rim'] },
            { name: 'Rhino', level: 12, drops: ['rhino_horn', 'armored_hide'] },
            { name: 'Shield Warrior', level: 13, drops: ['steel_shield', 'warrior_buckler'] },
            { name: 'Armored Bear', level: 14, drops: ['plated_hide', 'guard_claw'] },
            { name: 'Fortress Guard', level: 15, drops: ['fortress_shield', 'tower_plate'] },
            { name: 'War Hound', level: 16, drops: ['war_collar', 'battle_fang'] },
            { name: 'Cave Bear', level: 17, drops: ['cave_pelt', 'stone_claw'] },
            { name: 'Shield Troll', level: 18, drops: ['troll_shield', 'regenerating_plate'] },
            { name: 'Mammoth', level: 19, drops: ['mammoth_tusk', 'thick_fur'] },
            { name: 'Knight', level: 20, drops: ['knight_shield', 'steel_plate'] },

            // Tier 3 (Levels 21-30)
            { name: 'Giant Turtle', level: 21, drops: ['turtle_shell', 'fortified_scale'] },
            { name: 'Shield Golem', level: 22, drops: ['golem_shield', 'stone_core'] },
            { name: 'War Elephant', level: 23, drops: ['elephant_hide', 'ivory_guard'] },
            { name: 'Paladin', level: 24, drops: ['holy_shield', 'blessed_plate'] },
            { name: 'Armored Troll', level: 25, drops: ['plated_troll_hide', 'iron_guard'] },
            { name: 'Juggernaut', level: 26, drops: ['juggernaut_plate', 'massive_shield'] },
            { name: 'Guardian Bear', level: 27, drops: ['guardian_pelt', 'protective_claw'] },
            { name: 'Tower Guard', level: 28, drops: ['tower_shield', 'fortress_plate'] },
            { name: 'Rhino Charger', level: 29, drops: ['charging_horn', 'plated_hide'] },
            { name: 'Iron Warrior', level: 30, drops: ['iron_bulwark', 'warrior_plate'] },

            // Tier 4 (Levels 31-40)
            { name: 'Stone Guardian', level: 31, drops: ['stone_shield', 'granite_plate'] },
            { name: 'War Mammoth', level: 32, drops: ['war_tusk', 'battle_hide'] },
            { name: 'Shield Champion', level: 33, drops: ['champion_shield', 'elite_plate'] },
            { name: 'Fortress Golem', level: 34, drops: ['fortress_core', 'stone_bulwark'] },
            { name: 'Armored Giant', level: 35, drops: ['giant_shield', 'titan_plate'] },
            { name: 'Guardian Knight', level: 36, drops: ['guardian_bulwark', 'holy_plate'] },
            { name: 'Ancient Turtle', level: 37, drops: ['ancient_shell', 'primordial_scale'] },
            { name: 'War Beast', level: 38, drops: ['beast_armor', 'battle_hide'] },
            { name: 'Siege Ram', level: 39, drops: ['battering_horn', 'siege_plate'] },
            { name: 'Steel Colossus', level: 40, drops: ['colossus_shield', 'steel_bulwark'] },

            // Tier 5 (Levels 41-50)
            { name: 'Battle Mammoth', level: 41, drops: ['battle_tusk', 'war_hide'] },
            { name: 'Berserker Chief', level: 42, drops: ['berserker_shield', 'rage_plate'] },
            { name: 'Iron Guardian', level: 43, drops: ['iron_bulwark', 'guardian_core'] },
            { name: 'War Golem', level: 44, drops: ['war_core', 'battle_shield'] },
            { name: 'Siege Golem', level: 45, drops: ['siege_core', 'fortress_bulwark'] },
            { name: 'Dragon Turtle', level: 46, drops: ['dragon_shell', 'flame_scale'] },
            { name: 'Holy Paladin', level: 47, drops: ['divine_shield', 'celestial_plate'] },
            { name: 'Mountain Giant', level: 48, drops: ['mountain_shield', 'earth_plate'] },
            { name: 'War Titan', level: 49, drops: ['titan_bulwark', 'primordial_plate'] },
            { name: 'Fortress Titan', level: 50, drops: ['fortress_heart', 'wall_shield'] },

            // Tier 6 (Levels 51-60)
            { name: 'Adamant Guardian', level: 51, drops: ['adamant_shield', 'hard_plate'] },
            { name: 'Elder Mammoth', level: 52, drops: ['elder_tusk', 'ancient_hide'] },
            { name: 'Battle Colossus', level: 53, drops: ['battle_core', 'war_bulwark'] },
            { name: 'Stone Titan', level: 54, drops: ['titan_stone', 'earth_bulwark'] },
            { name: 'Guardian Dragon', level: 55, drops: ['dragon_guard', 'scale_shield'] },
            { name: 'Siege Titan', level: 56, drops: ['siege_heart', 'battering_shield'] },
            { name: 'Ancient Guardian', level: 57, drops: ['ancient_bulwark', 'primordial_shield'] },
            { name: 'War Dragon', level: 58, drops: ['war_scale', 'battle_shield'] },
            { name: 'Fortress Dragon', level: 59, drops: ['fortress_scale', 'wall_guard'] },
            { name: 'Elder Turtle', level: 60, drops: ['elder_shell', 'time_scale'] },

            // Tier 7 (Levels 61-70)
            { name: 'Runite Guardian', level: 61, drops: ['runite_shield', 'ancient_plate'] },
            { name: 'Primordial Mammoth', level: 62, drops: ['primordial_tusk', 'creation_hide'] },
            { name: 'Divine Guardian', level: 63, drops: ['divine_bulwark', 'holy_core'] },
            { name: 'Mountain Titan', level: 64, drops: ['mountain_heart', 'earth_titan_shield'] },
            { name: 'Crystal Guardian', level: 65, drops: ['crystal_shield', 'prismatic_plate'] },
            { name: 'Ancient War Golem', level: 66, drops: ['ancient_core', 'war_mechanism'] },
            { name: 'Dragon Guard', level: 67, drops: ['dragon_bulwark', 'scale_plate'] },
            { name: 'Celestial Guardian', level: 68, drops: ['celestial_shield', 'heaven_plate'] },
            { name: 'Elder Colossus', level: 69, drops: ['elder_core', 'ancient_bulwark'] },
            { name: 'Primordial Turtle', level: 70, drops: ['primordial_shell', 'creation_scale'] },

            // Tier 8 (Levels 71-80)
            { name: 'God Guardian', level: 71, drops: ['divine_guard', 'god_plate'] },
            { name: 'War God Titan', level: 72, drops: ['war_god_shield', 'battle_divinity'] },
            { name: 'Ancient Dragon Guard', level: 73, drops: ['ancient_dragon_shield', 'elder_scale_plate'] },
            { name: 'Fortress Colossus', level: 74, drops: ['fortress_titan_core', 'wall_bulwark'] },
            { name: 'Celestial Titan', level: 75, drops: ['celestial_bulwark', 'divine_titan_plate'] },
            { name: 'Primordial Guardian', level: 76, drops: ['primordial_guard', 'creation_bulwark'] },
            { name: 'Elder War Golem', level: 77, drops: ['elder_war_core', 'ancient_battle_shield'] },
            { name: 'Divine Dragon', level: 78, drops: ['divine_scale', 'god_dragon_shield'] },
            { name: 'Mountain God', level: 79, drops: ['mountain_divinity', 'earth_god_plate'] },
            { name: 'Ancient Titan', level: 80, drops: ['ancient_titan_heart', 'primordial_bulwark'] },

            // Tier 9 (Levels 81-90)
            { name: 'God of Defense', level: 81, drops: ['defense_divinity', 'god_fortress'] },
            { name: 'Eternal Guardian', level: 82, drops: ['eternal_bulwark', 'immortal_shield'] },
            { name: 'Primordial Dragon', level: 83, drops: ['primordial_scale', 'creation_dragon_guard'] },
            { name: 'War Divinity', level: 84, drops: ['war_godhood', 'battle_divine_shield'] },
            { name: 'Ancient Fortress Titan', level: 85, drops: ['ancient_fortress_heart', 'elder_wall_shield'] },
            { name: 'Celestial Dragon Guard', level: 86, drops: ['celestial_dragon_scale', 'heaven_bulwark'] },
            { name: 'Primordial Colossus', level: 87, drops: ['primordial_colossus_core', 'creation_titan_shield'] },
            { name: 'Elder Guardian Dragon', level: 88, drops: ['elder_guardian_scale', 'ancient_dragon_bulwark'] },
            { name: 'God Titan', level: 89, drops: ['god_titan_heart', 'divine_colossus_shield'] },
            { name: 'Ancient God Guardian', level: 90, drops: ['ancient_divinity', 'primordial_god_shield'] },

            // Tier 10 (Levels 91-99)
            { name: 'Fortress God', level: 91, drops: ['fortress_divinity', 'wall_god_bulwark'] },
            { name: 'Eternal Titan', level: 92, drops: ['eternal_titan_core', 'immortal_colossus_shield'] },
            { name: 'Primordial War God', level: 93, drops: ['primordial_war_divinity', 'creation_battle_bulwark'] },
            { name: 'Ancient Dragon God', level: 94, drops: ['ancient_dragon_divinity', 'elder_god_scale_shield'] },
            { name: 'Celestial Fortress', level: 95, drops: ['celestial_fortress_heart', 'heaven_wall_bulwark'] },
            { name: 'Creation Guardian', level: 96, drops: ['creation_divinity', 'primordial_guardian_shield'] },
            { name: 'Elder God Titan', level: 97, drops: ['elder_god_heart', 'ancient_divinity_bulwark'] },
            { name: 'Ragnarok Beast', level: 98, drops: ['ragnarok_essence', 'apocalypse_shield'] },
            { name: 'Elemental Titan', level: 99, drops: ['elemental_god_core', 'ultimate_bulwark'] }
        ];
    }
}

// Export singleton instance
const enemiesManager = new EnemiesManager();
