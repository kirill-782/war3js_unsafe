export default {
    agent: "\n\n@patch 1.24b\n\n",
    event: "\nCurrently useless, although triggers return an event reference when you register\na new trigger-event, there are no useful functions.\nYou cannot destroy an event object either (technically a leak).\n\nThe only functions that take event are: `SaveTriggerEventHandle` and\n`SaveTriggerEventHandleBJ`.\n\n",
    widget: '\nA widget is an "interactive game object" with HP, possibly an inventory etc.\n\nTypes `unit`, `destructable`, `item` extend from widget.\nWidget is the parent type and unit etc. are the descendant types (children).\n\nTherefore all API functions that accept `widget` as a type, will also work with\nany of the children types.\n\nHowever if doesn\'t work the other way around, then you need to explicitly cast the type by pushing it through a hashtable, this is called "downcasting":\n\n1. Put the widget object in a hashtable\n2. Retrieve it as unit/destructable/item - needed since 1.24b,\n[source](https://web.archive.org/web/20100118203210/http://wiki.thehelper.net/wc3/jass/common.j/Widget_API)\n\n**Example (Lua)**:\n\n```{.lua}\nhasht = InitHashtable() -- for type-casting\nSaveWidgetHandle(hasht, 1, 1, widgetHandle) -- put as widget\nitemHandle = LoadItemHandle(hasht, 1, 1) -- retrieve as item\n```\n\nSee `TriggerRegisterDeathEvent` for a full practical example.\n\n',
    widgetevent: "\nCurrently useless, there are no functions that take `widgetevent`.\n\n",
    gamespeed:
        '\nRepresents a game speed option at which the map can run. There are five\npredefined settings, but only SLOWEST, SLOW, NORMAL can be set and used.\nSetting FAST or FASTEST will automatically set it to NORMAL instead.\n\nWarcraft 3 game speed setting:\n\n| Menu Name      | Game constant      | Speed | 10 seconds is |\n|----------------|--------------------|-------|---------------|\n| High (default) | `MAP_SPEED_NORMAL` | 1.0x  | 10s           |\n| Medium         | `MAP_SPEED_SLOW`   | 0.8x  | 12.5s         |\n| Slow           | `MAP_SPEED_SLOWEST`| 0.6x  | 16.667s       |\n\n\n@note \nThis setting is actually just a multiplier for a "base game speed",\nwhich is normally set to 1.0x (100%).\n\nYou can achieve a higher "base game speed" via a .wgc file only for testing.\nThe in-game `gamespeed` is actually a multiplier on top of that. The results\nare shown in the table below:\n\n| Base game speed | Game speed option | Effective speed |\n| --------------: | ----------------: | --------------: |\n|              1x |              0.6x |           0.60x |\n|              1x |              0.8x |           0.80x |\n|              1x |              1.0x |           1.00x |\n|              2x |              0.6x |           1.20x |\n|              2x |              0.8x |           1.60x |\n|              2x |              1.0x |           2.00x |\n|              3x |              0.6x |           1.80x |\n|              3x |              0.8x |           2.40x |\n|              3x |              1.0x |           3.00x |\n\nFurther reading:\n\n- [How to run maps with high gamespeed](https://www.hiveworkshop.com/threads/how-to-run-maps-with-high-gamespeed.37255/)\n- [WGC file format specification](https://github.com/ChiefOfGxBxL/WC3MapSpecification/pull/4)\n\n@bug (v1.27, v1.32.10 tested) Restarting the map from the F10 in-game menu\nwill reset the "base game speed" back to 1x.\n\n\n',
    minimapicon: "\n\n@patch 1.32\n\n",
    fogstate:
        '\nRepresents different fog of war types.\n\n- `FOG_OF_WAR_MASKED` (1): Black mask, an unexplored map area.\n    - If "Masked areas are partially visible" is enabled in\nMap Properties, unexplored areas are shown in dark grey.\nYou can see the terrain, but no units.\n    - If disabled, unexplored areas are black and not visible.\n- `FOG_OF_WAR_FOGGED` (2): Haze, a previously explored\nmap area that is currently not visible.\n    - You can see the terrain, but no units.\n- `FOG_OF_WAR_VISIBLE` (4): A fully visible map area.\n- Other (non-existent) fog types do nothing.\n\n',
    trackable:
        '\nTrackables can register both click and hover events by players. But they don\'t\nprovide a way to get the triggering player. In fact the only (as of writing)\nfunctions that have the trackable type in their signature are:\n\n* `CreateTrackable`\n* `TriggerRegisterTrackableHitEvent`\n* `TriggerRegisterTrackableTrackEvent`\n* `GetTriggeringTrackable`\n* `SaveTrackableHandle`\n* `LoadTrackableHandle`\n\nTo create a trackable which can distinguish the triggering player we simply\ncreate a trackable for each player but with a *locally* different path:\n\n```\nfunction CreateTrackableForPlayer takes player p, string path, real x, real y, real facing returns trackable\n    if GetLocalPlayer() != p then\n        set path = ""\n    endif\n    return CreateTrackable(path, x, y, facing)\nendfunction\n```\n\nNow using something like `hashtable`s or [lua tables](https://www.lua.org/pil/2.5.html)\nwe can attach the correct player to the trackable handle and retrieve it by\naccessing `GetTriggeringTrackable`. You can use the same technique to attach\nother information like the trackables position, facing, etc.\n\n@note See `CreateTrackable` for a way to create a trackable with a non-zero\nz-coordinate.\n\n\n',
    gamecache:
        '\nGamecaches are designed for transferring data between maps in a campaign, by\nstoring data on the hard disk. In multi-player games however, the data is never\nstored on the hard disk, making online campaigns and saving/loading data between\ngames impossible.\n\nTo be able to read and write from a gamecache across maps you have to use a\nconsistent name between them, that is the first parameter for `InitGameCache`.\nIf you\'re developing a campaign it would be reasonable to use something like\n`set my_gc = InitGameCache("my_campaign.w3v")`.\n\nOnce you\'ve setup your `gamecache` it is time to fill it with data. There are\nonly five natives to store data inside a `gamecache`, that is\n\n* `StoreInteger`\n* `StoreReal`\n* `StoreBoolean`\n* `StoreString`\n* `StoreUnit`\n\nThese should be enough to track stats like gold, lumber and all your important\n`unit`s. Just storing values inside the `gamecache` is not enough to transfer\nthem between maps though; in fact those natives still work in multiplayer.\nPersisting stored values to disk is achieved by calling `SaveGameCache(my_gc)`.\n\nNow if you create your `gamecache` again via `InitGameCache("my_campaign.w3v")`\n(in another map or another game) it should have all previously stored values\navailable and can be queried via `HaveStoredString`, `RestoreUnit`, `GetStoredInteger`, etc.\n\n',
    mousebuttontype: "\n\n@patch 1.29\n\n",
    animtype: "\n\n@patch 1.30\n\n",
    subanimtype: "\n\n@patch 1.30\n\n",
    hashtable: "\n\n@patch 1.24\n\n",
    framehandle: "\n\n@patch 1.31\n\n",
    originframetype: "\n\n@patch 1.31\n\n",
    framepointtype: "\n\n@patch 1.31\n\n",
    textaligntype: "\n\n@patch 1.31\n\n",
    frameeventtype: "\n\n@patch 1.31\n\n",
    oskeytype: "\n\n@patch 1.31\n\n",
    abilityintegerfield: "\n\n@patch 1.31\n\n",
    abilityrealfield: "\n\n@patch 1.31\n\n",
    abilitybooleanfield: "\n\n@patch 1.31\n\n",
    abilitystringfield: "\n\n@patch 1.31\n\n",
    abilityintegerlevelfield: "\n\n@patch 1.31\n\n",
    abilityreallevelfield: "\n\n@patch 1.31\n\n",
    abilitybooleanlevelfield: "\n\n@patch 1.31\n\n",
    abilitystringlevelfield: "\n\n@patch 1.31\n\n",
    abilityintegerlevelarrayfield: "\n\n@patch 1.31\n\n",
    abilityreallevelarrayfield: "\n\n@patch 1.31\n\n",
    abilitybooleanlevelarrayfield: "\n\n@patch 1.31\n\n",
    abilitystringlevelarrayfield: "\n\n@patch 1.31\n\n",
    unitintegerfield: "\n\n@patch 1.31\n\n",
    unitrealfield: "\n\n@patch 1.31\n\n",
    unitbooleanfield: "\n\n@patch 1.31\n\n",
    unitstringfield: "\n\n@patch 1.31\n\n",
    unitweaponintegerfield: "\n\n@patch 1.31\n\n",
    unitweaponrealfield: "\n\n@patch 1.31\n\n",
    unitweaponbooleanfield: "\n\n@patch 1.31\n\n",
    unitweaponstringfield: "\n\n@patch 1.31\n\n",
    itemintegerfield: "\n\n@patch 1.31\n\n",
    itemrealfield: "\n\n@patch 1.31\n\n",
    itembooleanfield: "\n\n@patch 1.31\n\n",
    itemstringfield: "\n\n@patch 1.31\n\n",
    movetype: "\n\n@patch 1.31\n\n",
    targetflag: "\n\n@patch 1.31\n\n",
    armortype: "\n\n@patch 1.31\n\n",
    heroattribute: "\n\n@patch 1.31\n\n",
    defensetype: "\n\n@patch 1.31\n\n",
    regentype: "\n\n@patch 1.31\n\n",
    unitcategory: "\n\n@patch 1.31\n\n",
    pathingflag: "\n\n@patch 1.31\n\n",
    commandbuttoneffect: "\n\n@patch 1.32\n\n",
    ConvertRace:
        "\nReturns the race that corresponds to the given integer.\n@param i The integer representation of the race.\n\n@pure \n\n",
    ConvertAllianceType:
        "\nReturns the alliancetype that corresponds to the given integer.\n@param i The integer representation of the alliancetype.\n\n@pure \n\n",
    ConvertRacePref:
        "\nReturns the racepreference that corresponds to the given integer.\n@param i The integer representation of the racepreference.\n\n@pure \n\n",
    ConvertIGameState:
        "\nReturns the igamestate that corresponds to the given integer.\n@param i The integer representation of the igamestate.\n\n@pure \n\n",
    ConvertFGameState:
        "\nReturns the fgamestate that corresponds to the given integer.\n@param i The integer representation of the fgamestate.\n\n@pure \n\n",
    ConvertPlayerState:
        "\nReturns the playerstate that corresponds to the given integer.\n@param i The integer representation of the playerstate.\n\n@pure \n\n",
    ConvertPlayerScore:
        "\nReturns the playerscore that corresponds to the given integer.\n@param i The integer representation of the playerscore.\n\n@pure \n\n",
    ConvertPlayerGameResult:
        "\nReturns the playergameresult that corresponds to the given integer.\n@param i The integer representation of the playergameresult.\n\n@pure \n\n",
    ConvertUnitState:
        "\nReturns unitstate, first index is 0. \n\nIt is used to define the constants representing unit state. Accepts any integer, the unitstate reference is always the same for a given integer.\n\n**Example:** `constant unitstate UNIT_STATE_MAX_MANA = ConvertUnitState(3)`\n\n@param i The integer representation of the unitstate.\n\n\n@note See: `GetUnitState`, `SetUnitState`.\n@pure \n\n",
    ConvertAIDifficulty:
        "\nReturns the aidifficulty that corresponds to the given integer.\n@param i The integer representation of the aidifficulty.\n\n@pure \n\n",
    ConvertGameEvent:
        "\nReturns the gameevent that corresponds to the given integer.\n@param i The integer representation of the gameevent.\n\n@pure \n\n",
    ConvertPlayerEvent:
        "\nReturns the playerevent that corresponds to the given integer.\n@param i The integer representation of the playerevent.\n\n@pure \n\n",
    ConvertPlayerUnitEvent:
        "\nReturns the playerunitevent that corresponds to the given integer.\n@param i The integer representation of the playerunitevent.\n\n@pure \n\n",
    ConvertWidgetEvent:
        "\nReturns the widgetevent that corresponds to the given integer.\n@param i The integer representation of the widgetevent.\n\n@pure \n\n",
    ConvertDialogEvent:
        "\nReturns the dialogevent that corresponds to the given integer.\n@param i The integer representation of the dialogevent.\n\n@pure \n\n",
    ConvertUnitEvent:
        "\nReturns the unitevent that corresponds to the given integer.\n@param i The integer representation of the unitevent.\n\n@pure \n\n",
    ConvertLimitOp:
        "\nReturns the limitop that corresponds to the given integer.\n@param i The integer representation of the limitop.\n\n@pure \n\n",
    ConvertUnitType:
        "\nReturns the unittype that corresponds to the given integer.\n@param i The integer representation of the unittype.\n\n@pure \n\n",
    ConvertGameSpeed:
        "\nReturns the gamespeed that corresponds to the given integer.\n\nIt is used to define the constants representing gamespeed. First index is 0. Accepts any integer, the reference is always the same for a given integer.\n\n@param i The integer representation of the gamespeed.\n\n@pure \n\n",
    ConvertPlacement:
        "\nReturns the placement that corresponds to the given integer.\n@param i The integer representation of the placement.\n\n@pure \n\n",
    ConvertStartLocPrio:
        "\nReturns the startlocprio that corresponds to the given integer.\n@param i The integer representation of the startlocprio.\n\n@pure \n\n",
    ConvertGameDifficulty:
        "\nReturns the gamedifficulty that corresponds to the given integer.\n@param i The integer representation of the gamedifficulty.\n\n@pure \n\n",
    ConvertGameType:
        "\nReturns the gametype that corresponds to the given integer.\n@param i The integer representation of the gametype.\n\n@pure \n\n",
    ConvertMapFlag:
        "\nReturns the mapflag that corresponds to the given integer.\n@param i The integer representation of the mapflag.\n\n@pure \n\n",
    ConvertMapVisibility:
        "\nReturns the mapvisibility that corresponds to the given integer.\n@param i The integer representation of the mapvisibility.\n\n@pure \n\n",
    ConvertMapSetting:
        "\nReturns the mapsetting that corresponds to the given integer.\n@param i The integer representation of the mapsetting.\n\n@pure \n\n",
    ConvertMapDensity:
        "\nReturns the mapdensity that corresponds to the given integer.\n@param i The integer representation of the mapdensity.\n\n@pure \n\n",
    ConvertMapControl:
        "\nReturns the mapcontrol that corresponds to the given integer.\n@param i The integer representation of the mapcontrol.\n\n@pure \n\n",
    ConvertPlayerColor:
        "\nReturns the playercolor that corresponds to the given integer.\n@param i The integer representation of the playercolor.\n\n@pure \n\n",
    ConvertPlayerSlotState:
        "\nReturns the playerslotstate that corresponds to the given integer.\n@param i The integer representation of the playerslotstate.\n\n@pure \n\n",
    ConvertVolumeGroup:
        "\nReturns the volumegroup that corresponds to the given integer.\n@param i The integer representation of the volumegroup.\n\n@pure \n\n",
    ConvertCameraField:
        "\nReturns the camerafield that corresponds to the given integer.\n@param i The integer representation of the camerafield.\n\n@pure \n\n",
    ConvertBlendMode:
        "\nReturns the blendmode that corresponds to the given integer.\n@param i The integer representation of the blendmode.\n\n@pure \n\n",
    ConvertRarityControl:
        "\nReturns the raritycontrol that corresponds to the given integer.\n@param i The integer representation of the raritycontrol.\n\n@pure \n\n",
    ConvertTexMapFlags:
        "\nReturns the texmapflags that corresponds to the given integer.\n@param i The integer representation of the texmapflags.\n\n@pure \n\n",
    ConvertFogState:
        "\nConverts a bitmask in integer i to a fog of war type. See: `fogstate`.\n\n\n@note Can be used for extended typecasting.\n<http://www.hiveworkshop.com/forums/j-280/t-232039/>\n@pure \n\n",
    ConvertEffectType:
        "\nReturns the effecttype that corresponds to the given integer.\n@param i The integer representation of the effecttype.\n\n@pure \n\n",
    ConvertVersion:
        "\nReturns the version that corresponds to the given integer.\n@param i The integer representation of the version.\n\n@pure \n\n",
    ConvertItemType:
        "\nReturns the itemtype that corresponds to the given integer.\n@param i The integer representation of the itemtype.\n\n@pure \n\n",
    ConvertAttackType:
        "\n\n\n@note Blizzard only defined attack-types 0 to 6 but there is a hidden one:\n`ConvertAttackType(7)`.\n<http://www.hiveworkshop.com/forums/t-269/h-227993/>\n@pure \n\n",
    ConvertDamageType:
        "\nReturns the damagetype that corresponds to the given integer.\n@param i The integer representation of the damagetype.\n\n@pure \n\n",
    ConvertWeaponType:
        "\nReturns the weapontype that corresponds to the given integer.\n@param i The integer representation of the weapontype.\n\n@pure \n\n",
    ConvertSoundType:
        "\nReturns the soundtype that corresponds to the given integer.\n@param i The integer representation of the soundtype.\n\n@pure \n\n",
    ConvertPathingType:
        "\nReturns the pathingtype that corresponds to the given integer.\n@param i The integer representation of the pathingtype.\n\n@pure \n\n",
    ConvertMouseButtonType:
        "\nReturns the mousebuttontype that corresponds to the given integer.\n@param i The integer representation of the mousebuttontype.\n\n@pure \n@patch 1.29\n\n",
    ConvertAnimType:
        "\nReturns the animtype that corresponds to the given integer.\n@param i The integer representation of the animtype.\n\n@pure \n@patch 1.30\n\n",
    ConvertSubAnimType:
        "\nReturns the subanimtype that corresponds to the given integer.\n@param i The integer representation of the subanimtype.\n\n@pure \n@patch 1.30\n\n",
    ConvertOriginFrameType: "\n\n\n@pure \n@patch 1.31\n\n",
    ConvertFramePointType: "\n\n\n@pure \n@patch 1.31\n\n",
    ConvertTextAlignType: "\n\n\n@pure \n@patch 1.31\n\n",
    ConvertFrameEventType: "\n\n\n@pure \n@patch 1.31\n\n",
    ConvertOsKeyType: "\n\n\n@pure \n@patch 1.31\n\n",
    ConvertAbilityIntegerField: "\n\n\n@pure \n@patch 1.31\n\n",
    ConvertAbilityRealField: "\n\n\n@pure \n@patch 1.31\n\n",
    ConvertAbilityBooleanField: "\n\n\n@pure \n@patch 1.31\n\n",
    ConvertAbilityStringField: "\n\n\n@pure \n@patch 1.31\n\n",
    ConvertAbilityIntegerLevelField: "\n\n\n@pure \n@patch 1.31\n\n",
    ConvertAbilityRealLevelField: "\n\n\n@pure \n@patch 1.31\n\n",
    ConvertAbilityBooleanLevelField: "\n\n\n@pure \n@patch 1.31\n\n",
    ConvertAbilityStringLevelField: "\n\n\n@pure \n@patch 1.31\n\n",
    ConvertAbilityIntegerLevelArrayField: "\n\n\n@pure \n@patch 1.31\n\n",
    ConvertAbilityRealLevelArrayField: "\n\n\n@pure \n@patch 1.31\n\n",
    ConvertAbilityBooleanLevelArrayField: "\n\n\n@pure \n@patch 1.31\n\n",
    ConvertAbilityStringLevelArrayField: "\n\n\n@pure \n@patch 1.31\n\n",
    ConvertUnitIntegerField: "\n\n\n@pure \n@patch 1.31\n\n",
    ConvertUnitRealField: "\n\n\n@pure \n@patch 1.31\n\n",
    ConvertUnitBooleanField: "\n\n\n@pure \n@patch 1.31\n\n",
    ConvertUnitStringField: "\n\n\n@pure \n@patch 1.31\n\n",
    ConvertUnitWeaponIntegerField: "\n\n\n@pure \n@patch 1.31\n\n",
    ConvertUnitWeaponRealField: "\n\n\n@pure \n@patch 1.31\n\n",
    ConvertUnitWeaponBooleanField: "\n\n\n@pure \n@patch 1.31\n\n",
    ConvertUnitWeaponStringField: "\n\n\n@pure \n@patch 1.31\n\n",
    ConvertItemIntegerField: "\n\n\n@pure \n@patch 1.31\n\n",
    ConvertItemRealField: "\n\n\n@pure \n@patch 1.31\n\n",
    ConvertItemBooleanField: "\n\n\n@pure \n@patch 1.31\n\n",
    ConvertItemStringField: "\n\n\n@pure \n@patch 1.31\n\n",
    ConvertMoveType: "\n\n\n@pure \n@patch 1.31\n\n",
    ConvertTargetFlag: "\n\n\n@pure \n@patch 1.31\n\n",
    ConvertArmorType: "\n\n\n@pure \n@patch 1.31\n\n",
    ConvertHeroAttribute: "\n\n\n@pure \n@patch 1.31\n\n",
    ConvertDefenseType: "\n\n\n@pure \n@patch 1.31\n\n",
    ConvertRegenType: "\n\n\n@pure \n@patch 1.31\n\n",
    ConvertUnitCategory: "\n\n\n@pure \n@patch 1.31\n\n",
    ConvertPathingFlag: "\n\n\n@pure \n@patch 1.31\n\n",
    OrderId:
        '\nReturns an internal ID for the unit order string.\n\n**Example (Lua):**\n\n```{.lua}\nOrderId("humanbuild") == 851995 -- this order opens the human build menu\n```\n\n\n@note See: `OrderId2String`\n\n@bug Do not use this in a global initialisation (map init) as it returns 0 there.\n@bug \nOrders: `humainbuild` / `orcbuild` / `nightelfbuild` / `undeadbuild` are [totally broken](https://www.hiveworkshop.com/threads/build-order-causing-all-player-builders-to-open-build-menu.339196/post-3529953), don\'t issue them.\n\n@pure \n\n',
    OrderId2String:
        '\nReturns the human-readable unit order string.\n\n**Example (Lua):**\n\n```{.lua}\nOrderId2String(851995) --> returns "humanbuild" (opens human build menu)\n```\n\n\n@note See: `OrderId`\n\n@pure \n@bug Always returns null after the game is loaded/if the game is a replay.\n@bug Do not use this in a global initialisation (map init) as it returns null there.\n\n',
    UnitId2String:
        '\n**Example (Lua):** `UnitId2String( FourCC("hfoo") ) --> "footman" (internal name, not localized)`{.lua}\n\n\n@note See `GetObjectName` if you need to retrieve a unit\'s localized pretty name by the type ID.\n\n@bug Always returns null after the game is loaded/if the game is a replay.\n@bug Do not use this in a global initialisation (on map init) as it returns null there.\n\n',
    AbilityId: "\n\n\n@bug Not working correctly.\n@pure \n\n",
    AbilityId2String: "\n\n\n@bug Not working correctly.\n@pure \n\n",
    GetObjectName:
        '\nReturns localized value for field "name" for the given object type ID (unit, item, ability).\nIn WorldEdit this is "Text - Name".\n\n**Example (Lua):** `GetObjectName( FourCC("hfoo") ) --> "Footman"`{.lua}\n\n\n@note See: `UnitId2String`.\n\n@pure \n@async \n@bug Do not use this in a global initialisation (on map init) as it crashes the game there.\n\n',
    GetBJMaxPlayers:
        "\nReturns the maximum number of playable player slots regardless of map options.\n\n* Classic: 12 (hardcoded as `bj_MAX_PLAYERS`)\n* Reforged: 24\n\n@note This is only affected by WorldEditor version (>=6060) specified in the map's war3map.w3i file.\n[Further reading](https://www.hiveworkshop.com/threads/success-hybrid-12-24-player-map-backwards-compatible-1-24-1-28-5-1-31.339722/).\n\n@note See: `bj_MAX_PLAYERS`, `GetBJMaxPlayerSlots`.\n\n@patch 1.29.0.8803\n",
    GetBJPlayerNeutralVictim:
        "\nReturns the zero-based ID of neutral victim player.\n\n* Classic: 13 (hardcoded as `bj_PLAYER_NEUTRAL_VICTIM`)\n* Reforged: 25\n\n@note This is only affected by WorldEditor version (>=6060) specified in the map's war3map.w3i file.\n[Further reading](https://www.hiveworkshop.com/threads/success-hybrid-12-24-player-map-backwards-compatible-1-24-1-28-5-1-31.339722/).\n\n\n@note See: `bj_PLAYER_NEUTRAL_VICTIM`, `GetPlayerNeutralAggressive`, `GetBJPlayerNeutralExtra`, `GetPlayerNeutralPassive`.\n\n@patch 1.29.0.8803\n",
    GetBJPlayerNeutralExtra:
        "\nReturns the zero-based ID of neutral extra player.\n\n* Classic: 14 (hardcoded as `bj_PLAYER_NEUTRAL_EXTRA`)\n* Reforged: 26\n\n@note This is only affected by WorldEditor version (>=6060) specified in the map's war3map.w3i file.\n[Further reading](https://www.hiveworkshop.com/threads/success-hybrid-12-24-player-map-backwards-compatible-1-24-1-28-5-1-31.339722/).\n\n\n@note See: `bj_PLAYER_NEUTRAL_EXTRA`, `GetPlayerNeutralAggressive`, `GetPlayerNeutralPassive`, `GetBJPlayerNeutralVictim`.\n\n@patch 1.29.0.8803\n",
    GetBJMaxPlayerSlots:
        "\nReturns the maximum number of internal player slots regardless of map options.\n\n* Classic: 16 (hardcoded as `bj_MAX_PLAYER_SLOTS`)\n* Reforged: 28\n\n@note This is only affected by WorldEditor version (>=6060) specified in the map's war3map.w3i file.\n[Further reading](https://www.hiveworkshop.com/threads/success-hybrid-12-24-player-map-backwards-compatible-1-24-1-28-5-1-31.339722/).\n\n@note See: `bj_MAX_PLAYER_SLOTS`, `GetBJMaxPlayers`.\n\n@patch 1.29.0.8803\n",
    GetPlayerNeutralPassive:
        "\nReturns the zero-based ID of neutral passive player.\n\n* Classic: 15 (hardcoded as `PLAYER_NEUTRAL_PASSIVE`)\n* Reforged: 27\n\n@note This is only affected by WorldEditor version (>=6060) specified in the map's war3map.w3i file.\n[Further reading](https://www.hiveworkshop.com/threads/success-hybrid-12-24-player-map-backwards-compatible-1-24-1-28-5-1-31.339722/).\n\nSee: `PLAYER_NEUTRAL_PASSIVE`, `GetPlayerNeutralAggressive`, `GetBJPlayerNeutralExtra`, `GetBJPlayerNeutralVictim`.\n\n@patch 1.29.0.8803\n",
    GetPlayerNeutralAggressive:
        "\nReturns the zero-based ID of neutral aggressive player.\n\n* Classic: 12 (hardcoded as `PLAYER_NEUTRAL_AGGRESSIVE`)\n* Reforged: 24\n\n@note This is only affected by WorldEditor version (>=6060) specified in the map's war3map.w3i file.\n[Further reading](https://www.hiveworkshop.com/threads/success-hybrid-12-24-player-map-backwards-compatible-1-24-1-28-5-1-31.339722/).\n\nSee: `PLAYER_NEUTRAL_AGGRESSIVE`, `GetBJPlayerNeutralExtra`, `GetPlayerNeutralPassive`, `GetBJPlayerNeutralVictim`.\n\n@patch 1.29.0.8803\n",
    PLAYER_NEUTRAL_PASSIVE:
        "\nStores the zero-based ID of neutral passive player.\n\n@note See: `GetPlayerNeutralPassive`, `GetPlayerNeutralAggressive`, `GetBJPlayerNeutralExtra`, `GetBJPlayerNeutralVictim`.\n\n",
    PLAYER_NEUTRAL_AGGRESSIVE:
        "\nStores the zero-based ID of neutral aggressive player.\n\n@note See: `GetPlayerNeutralAggressive`.\n\n",
    MAP_SPEED_SLOWEST: "\n\n@note See `gamespeed` for explanation, values and mechanics.\n\n",
    MAP_SPEED_SLOW: "\n\n@note See `gamespeed` for explanation, values and mechanics.\n\n",
    MAP_SPEED_NORMAL: "\n\n@note See `gamespeed` for explanation, values and mechanics.\n\n",
    MAP_SPEED_FAST:
        "\n\n@note See `gamespeed` for explanation, values and mechanics.\n@bug Currently unused, resets to `MAP_SPEED_NORMAL`.\n\n",
    MAP_SPEED_FASTEST:
        "\n\n@note See `gamespeed` for explanation, values and mechanics.\n@bug Currently unused, resets to `MAP_SPEED_NORMAL`.\n\n",
    SOUND_VOLUMEGROUP_CINEMATIC_GENERAL: "\n\n@patch 1.33\n\n",
    SOUND_VOLUMEGROUP_CINEMATIC_AMBIENT: "\n\n@patch 1.33\n\n",
    SOUND_VOLUMEGROUP_CINEMATIC_MUSIC: "\n\n@patch 1.33\n\n",
    SOUND_VOLUMEGROUP_CINEMATIC_DIALOGUE: "\n\n@patch 1.33\n\n",
    SOUND_VOLUMEGROUP_CINEMATIC_SOUND_EFFECTS_1: "\n\n@patch 1.33\n\n",
    SOUND_VOLUMEGROUP_CINEMATIC_SOUND_EFFECTS_2: "\n\n@patch 1.33\n\n",
    SOUND_VOLUMEGROUP_CINEMATIC_SOUND_EFFECTS_3: "\n\n@patch 1.33\n\n",
    EVENT_GAME_BUILD_SUBMENU:
        "\nThis event is fired when a build menu is opened (e.g. by human peasant).\n\n**Example (Lua)**:\n\n```{.lua}\ntrg_gameev = CreateTrigger()\n-- just print the object representing EventId\nTriggerAddAction(trg_gameev, function() print(GetTriggerEventId()) end)\n-- register for this event\nTriggerRegisterGameEvent(trg_gameev, EVENT_GAME_BUILD_SUBMENU)\n```\n\n\n",
    EVENT_PLAYER_CHAT:
        '\n\n@bug Do not use this with `TriggerRegisterPlayerEvent` as `GetEventPlayerChatString`\nwill return `""`. Use `TriggerRegisterPlayerChatEvent` instead.\n\n\n',
    EVENT_WIDGET_DEATH:
        "\nCurrently useless, there are no functions that take `widgetevent`.\n\n@note It was probably intended to be used in a similar way like\n`TriggerRegisterUnitEvent` and `TriggerRegisterFilterUnitEvent` that take\na `unitevent`. It would have allowed to register an event for\na specific widget (unit/item/destructable).\n\n@note See: `TriggerRegisterDeathEvent`.\n\n",
    FOG_OF_WAR_MASKED: "\nSee `fogstate` for an explanation.\n\n",
    FOG_OF_WAR_FOGGED: "\nSee `fogstate` for an explanation.\n\n",
    FOG_OF_WAR_VISIBLE: "\nSee `fogstate` for an explanation.\n\n",
    Deg2Rad:
        "\nConverts degrees into radians. This is similar to multiplying the degree value by pi / 2.\n\n@param degrees The degree input.\n\n\n@note This is slightly more accurate than multiplying the degree value\nby `bj_PI / 2`. `bj_PI` has a value of 3.14159. This native uses a pi value closer to 3.141592496.\n\n@pure \n\n",
    Rad2Deg:
        "\nConverts a radian value into its degree equivalent.\n\n@param radians The radian value to be converted.\n\n\n@pure \n\n",
    Sin: "\nTakes a real value input in radians and returns its sine value. The domain of\nthe input is all real numbers and the range of the output is -1 to 1 inclusive.\n\n@param radians The input radians.\n\n\n@pure \n\n",
    Cos: "\nTakes a real value input in radians and returns its cosine value. The domain of\nthe input is all real numbers and the range of the output is -1 to 1 inclusive.\n\n@param radians The input radians.\n\n\n@pure \n\n",
    Tan: "\nTakes a real value input in radians and returns its tangent value.\n\n@param radians The input radians.\n\n@pure \n\n",
    Asin: "\nArcsine, one of inverse trigonometric functions. The result is returned in\nradians in range [-Pi/2;Pi/2].\nReturns 0 for invalid input.\n\n@param y A value between -1 and 1.\n\n@pure \n\n",
    Acos: "\nArccos, one of inverse trigonometric functions. The result is returned in\nradians in range [-Pi/2;Pi/2].\nReturns 0 for invalid input.\n\n@param x A value between -1 and 1.\n\n@pure \n\n",
    Atan: "\nArctangen, one of the inverse trigonometric functions. The result is returned\nin radians in range [-π/2, π/2].\nReturns 0 for invalid input.\n\n@param x A value between -1 and 1.\n\n@pure \n\n",
    Atan2: "\nArctangent function with two arguments.\nThe result is returned in radians in range (-Pi;Pi].\nReturns 0 if x and y are both 0\n\n@pure \n\n",
    SquareRoot:
        "\nReturns the square root of x.\nIf x is less than or equal to zero this returns 0.0\n\n@param x Should be greater than or equal to 0.\n\n\n@pure \n\n",
    Pow: "\nComputes x to the y'th power.\nIf y is zero this returns 1.0 and if both x is zero and y is less than zero this returns 0.0\n\n\n@pure \n\n",
    MathRound: "\n\n\n@patch 1.32\n@pure \n\n",
    I2R: "\nReturns a real representation for integer i.\n\nLua: If i is not an integer or i is null, raises an error.\n\n\n@pure \n\n",
    R2I: "\nReturns an integer representation for real r. The output will be rounded towards 0 if it is a real number.\n\nLua: Only raises an error if r is null.\n\nFor extermely large values the minimum/maximum representable signed integer will be returned\n(e.g. for Lua: `math.mininteger`{.lua} and `math.maxinteger`{.lua})\n\n\n@note NaN is not a possible value in Warcraft 3 (always reset to 1.0).\n\n@pure \n\n",
    I2S: "\nReturns the string representation for integer i.\n\nLua: Raises an error if i is null or has no integer representation.\n\n\n@pure \n\n",
    R2S: '\nReturns a string representation for real r with precision of 3 digits.\nThe real is correctly rounded to nearest to fit within the precision.\n\nLua: Raises an error if r is null.\n\n**Example:**\n\n`R2S(1.12) --> 1.120`{.lua}\nEquivalent to: `R2SW(r, 0, 3)` and Lua: `string.format("%.3f", r)`{.lua}\n\n\n@note See: `R2SW`.\n\n@pure \n\n',
    R2SW: '\nReturns a string representation for real r with precision digits and width.\nThe real is correctly rounded to nearest to fit within the precision.\n\nLua: Raises an error if r is null.\n\nWorks similar to C/C++ [printf](https://www.cplusplus.com/reference/cstdio/printf/),\nbut does not support negative width (left-align with right padding).\n\n**Example (Lua):**\n\n```{.lua}\nR2SW(31.1235, 5, 3) == "31.124"\nR2SW(1, 5, 0) == "  1.0" --> two spaces followed by number\n```\n\t\n\n@param r The number to be converted.\n@param width The width of the string. If the width of the resulting conversion\n             is too small the string will be filled with spaces.\n             Use 0 for no padding.\n@param precision The amount of decimal places. The minimum possible precision is 1 (automatically set).\n\n\n@note See: `R2S` for a simple converter with preset values.\n\n@pure \n\n',
    S2I: '\nReturns an integer by parsing the string for a number.\n\nFor values too big or too small, returns max/min integer respectively.\nFor an empty string or text that doesn\'t start with a number, returns 0.\n\n\nLua: For null raises an error.\n\n**Examples (Lua):**\n\n```{.lua}\nS2I("") == 0\nS2I("-123") == -123\nS2I("-99999999") == -2147483648\nS2I("99999999") == 2147483647\nS2I("123abc") == 123\nS2I("abc123") == 0\nS2I(nil) -- error\n```\n\n@param s The string to be converted.\n\n\n@note This function only works for decimal strings. Hexadecimal or octal strings\nare not supported.\n\n@note The parser stops at the first non-number character [0-9.].\nIf the input string starts with some valid input but ends in invalid input\nthis will return the conversion of the valid part: `S2I("123asd") == 123`.\n\n@pure \n\n\n',
    S2R: '\nReturns a real by parsing the string for a number.\nReturns 0 for: values too big or too small, an empty string or text that doesn\'t start with a number.\n\nLua: For null raises an error.\n\n@param s The string to be converted.\n\n\n@note This function only works for decimal strings. Hexadecimal or octal strings\nare not supported.\n\n@note The parser stops at the first non-number character [0-9.] - does not support comma `,` as a decimal point.\nIf the input string starts with some valid input but ends in invalid input\nthis will return the conversion of the valid part: `S2R(".123asd") == 0.123`.\n\n@pure \n\n',
    GetHandleId:
        '\nReturns the internal index of the given handle; returns 0 if `h` is `null`.\n\n**Example:** `GetHandleId(Player(0)) -> 1048584`\n\n@note Removing a game object does not automatically invalidate an allocated handle:\n\n```{.lua}\nuf = CreateUnit(Player(0), FourCC("hfoo"), -30, 0, 90)\nGetHandleId(uf) --> 1049016\nRemoveUnit(uf)\nGetHandleId(uf) --> 1049016\nuf = nil\nGetHandleId(uf) --> 0\n```\n\n@note Sometimes the handle ID may be different between clients.\n\n@note The handle index returned here is only a weak and not a conclusive indicator\nof leaking game objects. In other words, the number may be high without an actual leak.\n\n@param h Handle\n\n@patch 1.24b\n\n',
    SubString:
        '\nReturns a new substring from the interval [start, end) - inclusive, exclusive.\nPositions are zero-indexed.\nFor empty or invalid out-of-bounds values returns an empty string "" (in Lua).\n\nFor start>end returns substring beginning with start until the actual end of string.\nFor start<0 returns an empty string.\n\n**Examples (Lua):**\n\n```{.lua}\nSubString("abc", 0, 0) == ""\nSubString("abc", 0, 1) == "a"\nSubString("abc", 2, 3) == "c"\nSubString("abc", 0, 3) == "abc"\nSubString("abcdef", 2, 0) == "cdef"\n```\n\n@param source Text string.\n@param start Starting position, zero-indexed, inclusive.\n@param end Last position, zero-indexed, exclusive.\n\n\n@pure \n\n',
    StringLength:
        '\nReturns the length of the string in *bytes*.\nThis means Unicode (non-ASCII) characters will take up and return a higher byte count than there are letters.\n\n**Example**: `StringLength("я")` returns 2.\n\n\n@pure \n\n',
    StringCase:
        "\nTurns the text to upper/lower case and returns it. Only works for ASCII characters (A-Z), not Unicode (Дружба).\n\n@param source Text string.\n\n@param upper True: turn to UPPER CASE. False: turn to lower case.\n\n\n@pure \n\n",
    StringHash:
        '\nReturns a string hash for the given string. The string is normalized before hashing.\n\nThe hash is supposed to be case-insensitive of the input string:\nthis works for ASCII and (Reforged) some small subset of Unicode (Latin Supplement, Cyrillic...).\nAlso the backslash is the same as forward slash: `/` and `\\`.\nA probable explanation for this is the usage of file paths, since the game runs on Windows and Mac OS/OSX.\nStringHash is also used for variable lookup: string name -> integer index.\n\n`StringHash("\\\\") == StringHash("/")`\n`StringHash("AB") == StringHash("ab")`\n\n\n@note Code for the algorithm ["SStrHash2"](https://www.hiveworkshop.com/threads/bits-of-interest.213272/) via ["1997 Dr Dobbs article"](http://burtleburtle.net/bob/hash/doobs.html).\n\n@note *Breaking:* The hashing of multi-byte characters (Unicode) was changed in v1.30.0/1.31.1.\nIt\'s unknown if hashes of these characters are different in old versions between Windows/Mac OS\nor depends on OS-default character page settings (non-Unicode programs on Windows).\n\n@pure \n\n@patch 1.24a\n\n',
    GetLocalizedString:
        '\nreturns a translated string for the client\'s local language.\nWithout an available translation, returns `source`.\n\nThe result will differ between players with different languages.\nPossible sources are the .fdf files and the war3map.wts file.\n\n**Example:** `GetLocalizedString("REFORGED")` -> "Reforged"\n\n\n@bug (Jass) Cannot assign it to a constant variable as it will crash the game.\n`constant string foo = GetLocalizedString("bar")`\n\n@async \n\n',
    GetLocalizedHotkey:
        "\nReturns the `integer` hotkey for a specific game action à la `\"GAMEOVER_QUIT_GAME\"`.\nYou can look up potential values in `UI\\FrameDef\\GlobalStrings.fdf`.\n\n\n@note To define own values you have to import a file named `war3mapMisc.txt`\ninto your map. A sample `war3mapMisc.txt` could look like this:\n\n    [Hotkeys]\n    ,=44\n    !='!'\n    A='A'\n    B='B'\n    C='C'\n    // etc.\n\nSee also <https://www.hiveworkshop.com/threads/chrord.274579/>.\n\n@async \n\n",
    SetMapName:
        "\nSets the map name.\n\n\n@note This function shall only be used within the scope of function `config`\nin war3map.j, it is executed by the game when you load the lobby/selected\nthe map for preview.\n\n@note v1.32.10: WorldEditor limits map name input to 36 characters (ASCII/Unicode).\n\n@note \nOld game versions (tested v1.0) used different sources for map name based on\nwhere it was intended to be displayed:\n\n- In map selection (to create a lobby), the map name embedded in HM3W map's header\nwas used (see legacy .w3m/.w3x file format).\n- The map preview (right-hand side) runs the map's `config` code and thus\nmakes use of `SetMapName` and strings in .wts files.\n- (Unused) Map name field in war3map.w3i\n\nReforged runs the configuration code in both cases. Therefore it always uses\nthe proper name at the expense of increasing the loading time of map selection list.\n\n@note Supports color codes (they also affect sorting)\n\n@note Map name length:\n\n- Classic (1.0): Limited by total text width, e.g. `DescriptionFirstL...`\n- Reforged (1.32.10): Up to two lines, then limited by text width, e.g. `VeryLongMapName-ABCDEFGHIJKLMNOP...`\n\n",
    SetMapDescription:
        '\nSets the map description.\n\n\n@note This function shall only be used within the scope of function `config`\nin war3map.j, it is executed by the game when you load the lobby/selected\nthe map for preview.\n\n@note The map description is saved to "war3map.w3i" too, but this field is unused.\n\n@note Supports color codes.\n\n@note Length limits:\n\n- Classic (1.0): Limited by total text width,\napprox. 40 latin characters per line. Automatic line breaks.\n- Reforged: Seemingly no limit, the description box gets (bugged)\nvertical & horizontal scroll bars along with automatic line-breaking.\n\n@note Line limits:\n\n- Classic (1.0): Maximum 9 lines.\n- Reforged (1.32.10): Seemingly no limit.\n\n',
    SetTeams:
        "\n\n\n@note This function shall only be used within the scope of function `config`\nin war3map.j, it is executed by the game when you load the lobby/selected\nthe map for preview.\n\n",
    SetPlayers:
        "\n\n\n@note This function shall only be used within the scope of function `config`\nin war3map.j, it is executed by the game when you load the lobby/selected\nthe map for preview.\n\n@note The maximum amount of players (12 or 24) is determined by WorldEditor version specified in the map's war3map.w3i file. [Further reading](https://www.hiveworkshop.com/threads/success-hybrid-12-24-player-map-backwards-compatible-1-24-1-28-5-1-31.339722/).\n\n",
    DefineStartLocation:
        "\nDefines a player's start location at the specified coordinates. The start\nlocation determines where the camera is initially positioned. For melee maps,\nit will also determine where the player's first town hall structure will be placed.\n\n@param whichStartLoc The ID of the player for the starting location. See `GetPlayerStartLocation`.\n\n@param x The x-coordinate of the start location.\n\n@param y The y-coordinate of the start location.\n\n@note This function shall only be used within the scope of function `config`\nin war3map.j, it is executed by the game when you load the lobby/selected\nthe map for preview.\nUsing it elsewhere will affect the returned values of `GetStartLocationX` and\n`GetStartLocationY`, but will have no effect on the camera's initial position and\nthe melee starting positions.\n\n\n",
    DefineStartLocationLoc:
        "\nDefines a player's start location at the specified location. The start\nlocation determines where the camera is initially positioned. For melee maps,\nit will also determine where the player's first town hall structure will be placed.\n\n@param whichStartLoc The ID of the player for the starting location. See `GetPlayerStartLocation`.\n\n@param whichLocation The location of the start location.\n\n@note This function shall only be used within the scope of function `config`\nin war3map.j, it is executed by the game when you load the lobby/selected\nthe map for preview.\nUsing it elsewhere will affect the returned values of `GetStartLocationX` and\n`GetStartLocationY`, but will have no effect on the camera's initial position and\nthe melee starting positions.\n\n\n",
    SetStartLocPrioCount:
        "\n\n\n@note This function shall only be used within the scope of function `config`\nin war3map.j, it is executed by the game when you load the lobby/selected\nthe map for preview.\n\n",
    SetStartLocPrio:
        "\n\n\n@note This function shall only be used within the scope of function `config`\nin war3map.j, it is executed by the game when you load the lobby/selected\nthe map for preview.\n\n",
    SetEnemyStartLocPrioCount: "\n\n\n@patch 1.32\n\n",
    SetEnemyStartLocPrio: "\n\n\n@patch 1.32\n\n",
    SetGamePlacement:
        "\n\n\n@note This function shall only be used within the scope of function `config`\nin war3map.j, it is executed by the game when you load the lobby/selected\nthe map for preview.\n\n",
    SetGameSpeed:
        "\nSets a new gamespeed to run the map at.\n\n@param whichspeed The gamespeed constant to be set as new speed.\nThe only allowed values are: `MAP_SPEED_SLOWEST`, `MAP_SPEED_SLOW` and `MAP_SPEED_NORMAL`, because `MAP_SPEED_FAST` and `MAP_SPEED_FASTEST` are automatically reverted to normal speed.\n\n\n@note See: `gamespeed` for values and mechanics.\n\n",
    GetGameSpeed:
        "\nReturns the currently set gamespeed.\n\n\n@note See: `SetGameSpeed` and for values and mechanics `gamespeed`.\n\n",
    SetPlayerStartLocation:
        "\n\n\n@note This function shall only be used within the scope of function `config`\nin war3map.j, it is executed by the game when you load the lobby/selected\nthe map for preview.\n\n",
    ForcePlayerStartLocation:
        "\nForces player to have the specified start loc and marks the start loc as occupied\nwhich removes it from consideration for subsequently placed players\n( i.e. you can use this to put people in a fixed loc and then\nuse random placement for any unplaced players etc. ).\n\n\n@note This function shall only be used within the scope of function `config`\nin war3map.j, it is executed by the game when you load the lobby/selected\nthe map for preview.\n\n",
    SetPlayerColor:
        "\n\n\n@note This function is called by the game within the scope of `config`\nto set each player's color.\n\n",
    SetPlayerRacePreference:
        "\n\n\n@note This function shall only be used within the scope of function `config`\nin war3map.j, it is executed by the game when you load the lobby/selected\nthe map for preview.\n\n",
    SetPlayerRaceSelectable:
        "\n\n\n@note This function shall only be used within the scope of function `config`\nin war3map.j, it is executed by the game when you load the lobby/selected\nthe map for preview.\n\n",
    SetPlayerController:
        "\n\n\n@note This function shall only be used within the scope of function `config`\nin war3map.j, it is executed by the game when you load the lobby/selected\nthe map for preview.\n\n",
    GetPlayerStartLocation:
        "\nReturns an integer representation of a player's start location. If the player\nhas a start location on the map (regardless of whether that player slot is filled),\nit will return the player's ID (e.g. Player 1 (red) will return 0, Player 2 (blue)\nwill return 1, and so forth). If the player does not have a start location\non the map, it will return -1.\n\n@param whichPlayer The player of which to return the starting location.\n\n\n",
    GetPlayerName:
        '\nReturns the player name.\n\n**Example (Lua):**\n\n    -- assuming you play as player Red\n    local name = GetPlayerName(Player(0)) --> your player name as text\n\nIf the player is not present in the game or is one of the internal players, returns localized string + one-based player number (WorldEdit-like):\n\n    local me = GetPlayerName( Player(0) ) --> your player name as text\n    local np = GetPlayerName( Player(PLAYER_NEUTRAL_PASSIVE) ) --> "Player 28"\n\n\n\n',
    DestroyTimer:
        "\n\n\n@bug Destroying does not pause timer, so if call of its callback is scheduled,\nthen callback is called with `GetElapsedTimer` being `null`.\n\n",
    TimerStart:
        "\nStarts a previously created timer that calls a function when timeout reaches 0.\n\nIt is affected by gamespeed at any point of it execution, if the gamespeed is changed at 50% of timeout duration, the rest of the timeout will be correctly affected by new gamespeed.\n\n@param whichTimer Handle to timer.\n@param timeout Delay in seconds.\n@param periodic True: repeat timer after expiration (loop).\nFalse: timer only runs once.\n\n@param handlerFunc Callback function to be executed when timer expires.\n\n\n@note See: `GetExpiredTimer` to retrieve the handle of the expired timer inside handlerFunc.\n\n@note The table below shows how often a 0 millisecond timer is executed\nin comparison with `TriggerRegisterTimerEvent`\n(aka `TriggerRegisterTimerEventPeriodic`).\n\n| Trigger or Timer \\ Tick count  |   ROC 1.0 | Reforged 1.32.10 |\n|--------------------------------|----------:|-----------------:|\n| 1000ms Trigger periodic        |      1 Hz |             1 Hz |\n| 100ms Trigger periodic         |     10 Hz |            10 Hz |\n| 20ms Trigger periodic          |     50 Hz |            50 Hz |\n| 10ms Trigger periodic          |    100 Hz |           100 Hz |\n| 5ms Trigger periodic           |    200 Hz |           100 Hz |\n| 1ms Trigger periodic           |   1000 Hz |           100 Hz |\n| 0ms Trigger periodic           |  10077 Hz |           100 Hz |\n| 1ms Timer                      |   1000 Hz |          1000 Hz |\n| 0ms Timer                      |  10077 Hz |         10077 Hz |\n\n",
    TimerGetElapsed:
        "\n\n\n@note If passed timer is paused or has expired,\nthis function returns `(TimerGetTimeout - TimerGetRemaining)`.\n@bug If passed timer was resumed by `ResumeTimer`,\nthis function returns amount of time elapsed after last resuming.\n\n",
    TimerGetRemaining:
        "\n\n\n@note Returns remaining time of passed timer while timer is running or paused by `PauseTimer`.\n@bug After non-periodic timer expires, this function returns remaining time that was at last pause of this timer.\n\n",
    ResumeTimer:
        "\n\n\n@note Has no effect if passed timer is running.\n@bug If passed timer is paused or has expired, launches it for `TimerGetRemaining`,\nand after this time is elapsed, launches it again for `TimerGetTimeout`.\nAfter that passed timer is stopped even if it is periodic.\n\n",
    GetExpiredTimer:
        "\n\n\n@bug Returns `null` if timer is destroyed right before callback call.\n@bug Might crash the game if called when there is no expired timer.\n<http://www.wc3c.net/showthread.php?t=84131>\n\n",
    DestroyGroup:
        "\nDestroys the group.\n\nAccessing a destroyed group shows no units, a size of 0 and cannot be modified in any way.\n\n\n",
    GroupAddUnit:
        '\nAppends unit at the end of group, increasing size by 1 (see `BlzGroupGetSize`).\nReturns true if the unit was added, false if the unit is already in the group or the group is destroyed.\n\nEven if there\'s a null "hole" at index 0, the unit will still be added at the tail end.\n\n@param whichGroup Target group.\n@param whichUnit Target unit.\n\n\n',
    GroupRemoveUnit:
        "\nRemoves unit from group, returns true on success; returns false on failure (no operation).\n\nIf unit is null, does nothing and returns false regardless if there're null values at any index in the group (does not remove destroyed units which are still in group).\n\n\n",
    BlzGroupAddGroupFast: "\nAdds a target addGroup to the desired whichGroup immediately.\n\n\n@patch 1.31\n\n",
    BlzGroupRemoveGroupFast: "\n\n\n@patch 1.31\n\n",
    GroupClear: "\nErase every unit from the group, it becomes size = 0.\n\n\n",
    BlzGroupGetSize:
        "\nReturns the size (length) of group.\nThe size refers to game's internal representation of group data (array), group's last index is `size - 1`.\n\n\n@note See: `BlzGroupUnitAt`.\n@patch 1.31\n\n",
    BlzGroupUnitAt:
        "\nReturns unit at the given index in group. Groups start at index 0.\n\nIf the unit was removed from the game or index is out of bounds, returns null.\n\n\n@patch 1.31\n\n",
    GroupEnumUnitsOfPlayer:
        "\n\n\n@note In contrast to other Enum-functions this function enumarates units with locust.\n\n",
    GroupEnumUnitsOfTypeCounted:
        "\n\n\n@bug Causes irregular behavior when used with large numbers.\n@note *Probably* countLimit doesn't work similar to `GroupEnumUnitsInRangeCounted`. Instead see `GroupEnumUnitsOfType`.\n\n",
    GroupEnumUnitsInRectCounted:
        "\n\n\n@bug Causes irregular behavior when used with large numbers.\n@note *Probably* countLimit doesn't work similar to `GroupEnumUnitsInRangeCounted`. Instead see `GroupEnumUnitsInRect`.\n\n",
    GroupEnumUnitsInRange:
        "\nAdds units within radius of map coordinates X, Y who match filter to whichGroup.\nA null as filter means that every nearby unit is added to group.\n\nIf the group has had units previously, it will be first cleared (old units will not be preserved).\nA group that has been destroyed will not be recreated.\n\n@param whichGroup Group to add units to.\n@param x X map coordinate.\n@param y Y map coordinate.\n@param radius Radius in map units.\n@param filter Filter function.\n\n\n@note See: `GroupEnumUnitsInRect`, `GroupEnumUnitsInRangeOfLoc`.\n\n",
    GroupEnumUnitsInRangeCounted:
        "\n\n\n@bug Causes irregular behavior when used with large numbers.\n@bug countLimit does not work, tested in 1.32.10.18067. Therefore behaves like `GroupEnumUnitsInRange` adding all units in range.\n\n",
    GroupEnumUnitsInRangeOfLocCounted:
        "\n\n\n@bug Causes irregular behavior when used with large numbers.\n@note *Probably* countLimit doesn't work similar to `GroupEnumUnitsInRangeCounted`. Instead see `GroupEnumUnitsInRangeOfLoc`.\n\n",
    GroupEnumUnitsSelected:
        "\n@param whichGroup Should be an empty group.\n\n@note Must call `SyncSelections` before this to have up-to-date players' selections.\n",
    FirstOfGroup:
        '\nReturns the unit at the first position in group or null if that unit no longer exists.\n\nEquivalent to: `BlzGroupUnitAt(varGroup, 0)`.\n\n\n@bug If the first unit of this group was removed from the game (RemoveUnit or decayed) then null be returned, regardless if there\'re valid units in group at further indeces. To iterate over all existing units of a group, use `ForGroup`/`ForGroupBJ`.\nYou cannot remove such null "holes" from a group without destroying or clearing it (`DestroyGroup`/`GroupClear`).\nIf you use FirstOfGroup in iterations with removal, units in the group will eventually leak.\n\n@note See [GroupUtils Library](https://web.archive.org/web/20200918161954/http://wc3c.net/showthread.php?t=104464) for vJass.\n\n',
    CreateForce:
        "\nCreates an empty force object, returns a handle to it.\n\nForces are groups containing players.\nTo add/remove a player, see `ForceAddPlayer`/`ForceRemovePlayer`.\n",
    DestroyForce:
        "\nDestroys the force. Any further actions on it will have no effect.\n\nFor example, checks if player is part of force will return false, enums will not iterate.\n",
    ForceAddPlayer: "\nAdds player to force.\n",
    BlzForceHasPlayer: "\n\n\n@patch 1.31\n\n",
    ForceEnumPlayers:
        "\nPopulates the force by iterating all existing players and AI (excluding player neutral etc.) and adds them to force if filter returned true.\n\nCalling `GetFilterPlayer` will return the current player, see `Filter`.\n\n@note If you only want to iterate the force without changing it, use `ForForce`.\n",
    ForceEnumPlayersCounted:
        "\n\n\n@note *Probably* countLimit doesn't work similar to `GroupEnumUnitsInRangeCounted`. Instead see `ForceEnumPlayers`.\n\n",
    ForForce:
        "\nExecutes a callback function for every player in a given force. Within the callback, calling `GetEnumPlayer` returns the player of the current iteration.\n\n@note: The iteration order is given by the player id, ascending (e.g., `Player(3)`, then `Player(7)`, then `Player(15)`) regardless in which order the players were added to the force.\n",
    Rect: "\nReturns a new rectangle as defined by two points (minX, minY) and (maxX, maxY).\n\nThe rectangle size and coordinates are limited to valid map coordinates, see\n`GetWorldBounds`.\n\nIn Warcraft 3 the coordinates follow the regular cartesian system you know from\nschool math. The minimum coordinates (towards negative infinity) are on the left/bottom,\nthe maximum coordinates on right/top (towards positive infinity).\n\nIn the following graphic the N stands for the minimum point (minX, minY) and\nX for the maximum point (maxX, maxY).\n\n    +----X\n    |    |\n    |    |\n    N----+\n\t\n\n@bug You can't create your own rectangle that would match the dimensions\nof `GetWorldBounds`. The maxX and maxY will be smaller by `32.0` than that of\nthe world bounds.\n\n@note See: `RectFromLoc`, `RemoveRect`, `GetWorldBounds`.\n\n\n",
    RectFromLoc:
        "\nReturns new rectangle as defined by two locations: `min` (bottom-left) and\n`max` (top-right).\n\nThe rectangle size and coordinates are limited to valid map coordinates, see\n`GetWorldBounds`.\n\n\n@bug You can't create your own rectangle that would match the dimensions\nof `GetWorldBounds`. The maxX and maxY will be smaller by `32.0` than that of\nthe world bounds.\n\n@note See: `Rect`, `RemoveRect`, `GetWorldBounds`.\n\n\n",
    RemoveRect:
        "\nDestroys the rectangle.\n\nIf you access the rectangle after removal, all of its values will return zero.\n\n\n\n",
    SetRect:
        "\nChanges a rectangle's minimum and maximum points that define it.\n\nThe rectangle size and coordinates are limited to valid map coordinates, see\n`GetWorldBounds`.\n\n\n@bug You can't create your own rectangle that would match the dimensions\nof `GetWorldBounds`. The maxX and maxY will be smaller by `32.0` than that of\nthe world bounds.\n\n@note See: `Rect`, `SetRectFromLoc`, `MoveRectTo`, `MoveRectToLoc`.\n\n\n",
    SetRectFromLoc:
        "\nChanges a rectangle's minimum and maximum points (that define it) to those specified\nby `min` and `max` locations.\n\nDoes nothing if either location is null or invalid.\n\n\n@bug You can't create your own rectangle that would match the dimensions\nof `GetWorldBounds`. The maxX and maxY will be smaller by `32.0` than that of\nthe world bounds.\n\n@note See: `Rect`, `SetRect`, `MoveRectTo`, `MoveRectToLoc`.\n\n\n",
    MoveRectTo:
        "\nChanges the minimum and maximum point of a rectangle to make it centered around the\nspecified point. Thus it moves the rectangle to a new position.\n\n\n@bug This can be used to move the rectangle outside of the map bounds, bypassing\nthe limiting checks.\n\n@note See: `Rect`, `SetRect`, `SetRectFromLoc`, `MoveRectToLoc`.\n\n\n",
    MoveRectToLoc:
        "\nChanges the minimum and maximum point of a rectangle to make it centered around the\nspecified point. Thus it moves the rectangle to a new position.\n\nDoes nothing if either location is null or invalid.\n\n\n@bug This can be used to move the rectangle outside of the map bounds, bypassing\nthe limiting checks.\n\n@note See: `Rect`, `SetRect`, `SetRectFromLoc`, `MoveRectTo`.\n\n\n",
    GetRectCenterX:
        "\nReturns rectangle's center X coordinate. This is equal to `((maxX + minX)/2)`.\n\nReturns zero if `whichRect` is null or invalid.\n\n\n",
    GetRectCenterY:
        "\nReturns rectangle's center Y coordinate. This is equal to `((maxY + minY)/2)`.\n\nReturns zero if `whichRect` is null or invalid.\n\n\n",
    GetRectMinX:
        "\nReturns rectangle's bottom-left X coordinate. \n\nReturns zero if `whichRect` is null or invalid.\n\n\n",
    GetRectMinY:
        "\nReturns rectangle's bottom-left Y coordinate. \n\nReturns zero if `whichRect` is null or invalid.\n\n\n",
    GetRectMaxX:
        "\nReturns rectangle's top-right X coordinate. \n\nReturns zero if `whichRect` is null or invalid.\n\n\n",
    GetRectMaxY:
        "\nReturns rectangle's top-right Y coordinate. \n\nReturns zero if `whichRect` is null or invalid.\n\n\n",
    GetLocationZ:
        "\n\n\n@note Reasons for returning different values might be terrain-deformations\ncaused by spells/abilities and different graphic settings.\nOther reasons could be the rendering state of destructables and visibility differences.\n\n@async \n\n",
    GetWorldBounds:
        "\nReturns a new instance of rectangle that spans the entire map, including\nunplayable borders, in world coordinates.\n\nSince this creates a new rectangle on each call, the rectangle object must be\ndestroyed manually by calling `RemoveRect`.\n\n\n@note See: `Rect`, `RemoveRect`.\n\n\n",
    CreateTrigger: "\nCreates a new blank trigger object without any events, conditions or actions.\n\n\n",
    DestroyTrigger:
        "\n\n\n@bug Do not destroy the current running Trigger (when waits are involved) as\nit can cause handle stack corruption as documented [here](http://www.wc3c.net/showthread.php?t=110519).\n\n",
    ResetTrigger:
        "\nResets the evaluate and execution count of the given trigger back to zero.\n\n\n@note See: `GetTriggerEvalCount`, `GetTriggerExecCount`.\n\n",
    EnableTrigger:
        "\nSee `DisableTrigger`. `EnableTrigger` enables the given trigger again, so it will be fired when the events registered on it occur.\n\n\n",
    DisableTrigger:
        "\nDisables the given trigger. A disabled trigger is not fired by the events registered on it but `TriggerEvaluate` and `TriggerExecute` can still be used.\nThis can be reversed with `EnableTrigger`.\n\n\n",
    IsTriggerEnabled:
        "\nTells whether the given trigger is enabled. See `EnableTrigger` and `DisableTrigger`. A trigger is enabled on default.\n\n\n",
    TriggerWaitOnSleeps:
        "\nMarks the given trigger to wait/no longer wait for `TriggerSleepAction`s in sub trigger executions started via `TriggerExecuteWait`.\nSince this is an attribute of the execution rather than the trigger object, this affects future runs of the given trigger, and not\nthose already started.\n\n\n",
    IsTriggerWaitOnSleeps:
        "\nTells whether the given trigger waits for `TriggerSleepAction`s in sub trigger executions started via `TriggerExecuteWait`.\nSee `TriggerWaitOnSleeps`.\n\n\n",
    GetFilterUnit: "\nThis returns the current unit in calls to the `GroupEnumUnits-`natives.\n\n\n",
    GetEnumUnit: "\nThis returns the current unit in calls to the `ForGroup` native.\n\n\n",
    ParseTags: "\n\n\n@patch 1.32\n\n",
    GetTriggerEvalCount:
        "\nReturns the count of how often this trigger was evaluated.\n\nA trigger is evaluated each time it is called. A trigger is executed each time it is called and passes the condition. If the condition is not met, the execution count is not incremented.\n\n\n@note See: `ResetTrigger`, `GetTriggerExecCount`.\n\n",
    GetTriggerExecCount:
        "\nReturns the count of how often this trigger was executed.\n\nA trigger is evaluated each time it is called. A trigger is executed each time it is called and passes the condition. If the condition is not met, the execution count is not incremented.\n\n\n@note See: `ResetTrigger`, `GetTriggerEvalCount`.\n\n",
    ExecuteFunc:
        '\nTries to find a function with the given name and calls it in a new thread.\n\n\n@note If this is called in a trigger action context, `ExecuteFunc` will use that trigger, so `GetTriggeringTrigger` will return it. If `ExecuteFunc` is\ncalled in another type of context, it will spawn a new trigger, which can be seen with `GetTriggeringTrigger`.\n\n@bug `ExecuteFunc` does not seem to release the trigger it spawns.\n\n@note As `ExecuteFunc` will run the target function in a trigger action context one way or another, `TriggerSleepAction` can be used.\n\n@note Performance numbers:\n\n- 10000 regular function calls in Jass: 3ms (300ns/call)\n- 10000 regular function calls in Lua: 0.07ms (6.9ns/call)\n- 10000 "ExecuteFunc" calls in Jass: ~50ms (5µs/call)\n\nResult: plain Lua is ~43.5x and ~724x faster respectively.\n\nSource: Unryze\'s test results using\n[this code](https://github.com/Luashine/wc3-test-maps/blob/31138de4f481b0186ee1002481324f0003baa51b/JassTestSpeed-ujAPI-20221109.j)\nand his UjAPI (Jass on 1.26a; Lua on 1.32.10 and 1.26a).\n\n',
    And: "\nAlways returns a new boolean expression that has the result of evaluating logical (expr1 AND expr2).\n\n\n@note `boolexpr` extends from `agent` and must be explicitly destroyed with `DestroyBoolExpr` to prevent leaks.\nHowever, most functions from blizzard.j destroy passed boolexpr automatically.\n\n@note See: `Or`, `Not`, `Condition`, `Filter`, `DestroyBoolExpr`\n",
    Or: "\nAlways returns a new boolean expression that has the result of evaluating logical (expr1 OR expr2).\n\n\n@note `boolexpr` extends from `agent` and must be explicitly destroyed with `DestroyBoolExpr` to prevent leaks.\nHowever, most functions from blizzard.j destroy passed boolexpr automatically.\n\n@note See: `And`, `Not`, `Condition`, `Filter`, `DestroyBoolExpr`\n",
    Not: "\nAlways returns a new boolean expression that has the result of evaluating logical (NOT expr1).\n\n@note `boolexpr` extends from `agent` and must be explicitly destroyed with `DestroyBoolExpr` to prevent leaks.\nHowever, most functions from blizzard.j destroy passed boolexpr automatically.\n\n@note See: `And`, `Or`, `Condition`, `Filter`, `DestroyBoolExpr`\n",
    Condition:
        '\nReturns a new conditionfunc, when called by the game returns the result of evaluating func().\nfunc will receive no arguments and must return a boolean: true/false.\n\n@param func A function that returns boolean or `null`.\n\n@note 1.32.10, Lua: `conditionfunc` extends from `boolexpr`->`agent` and must be explicitly destroyed with `DestroyBoolExpr`/`DestroyCondition` to prevent leaks.\nHowever, most functions from blizzard.j destroy passed boolexpr automatically.\n\n@note **Lua:** Always returns a new handle unless the passed parameter is `nil`, in this case\nit MAY return the same handle depending on unknown conditions (consecutive calls are likely to reuse previous handle).\n\n**Jass:** Returns same handle when creating multiple filters for the same function:\n`Condition(function foo) == Condition(function foo)` ("foo" can be non-constant and constant).\n\nFor this reason, do **not** destroy filterfuncs created with `Condition` in Jass,\nin the best case it does nothing but in the worst case it would affect some internals.\n\nThis behavior is similar to `Condition`.\n\n@pure \n\n@note See: `And`, `Or`, `Not`, `Condition`, `Filter`, `DestroyCondition`\n\n',
    DestroyCondition:
        "\nDestroys the provided condition.\n\n\n@note `conditionfunc` extends from `boolexpr`->`agent` and must be explicitly destroyed to prevent leaks.\nHowever, most functions from blizzard.j destroy passed boolexpr automatically.\n\n@note Only call this on conditionfuncs created via `And`,`Or`,`Not`.\n\n@note See: `Condition`\n\n",
    Filter: '\nReturns a new filterfunc, when called by the game returns the result of evaluating func().\nfunc will receive no arguments and must return a boolean: true/false.\n\n\n@param func A filtering function that returns boolean or `null`.\n\n@note Lua, 1.32.10: `filterfunc` extends from `boolexpr`->`agent` and must be explicitly destroyed with `DestroyBoolExpr`/`DestroyFilter` to prevent leaks.\nHowever, most functions from blizzard.j destroy passed boolexpr automatically.\n\n@note **Lua:** Always returns a new handle unless the passed parameter is `nil`, in this case\nit MAY return the same handle depending on unknown conditions (consecutive calls are likely to reuse previous handle).\n\n**Jass:** Returns same handle when creating multiple filters for the same function:\n`Filter(function foo) == Filter(function foo)` ("foo" can be non-constant and constant).\n\nFor this reason, do **not** destroy filterfuncs created with `Filter` in Jass,\nin the best case it does nothing but in the worst case it would affect some internals.\n\nThis behavior is similar to `Condition`.\n\n@pure \n\n@note See: `And`, `Or`, `Not`, `Condition`, `DestroyFilter`;\n`GetFilterUnit`, `GetFilterItem`, `GetFilterPlayer`, `GetFilterDestructable`.\n\n',
    DestroyFilter:
        "\nDestroys the provided filter function.\n\n\n@note `filterfunc` extends from `boolexpr`->`agent` and must be explicitly destroyed with `DestroyBoolExpr`/`DestroyFilter` to prevent leaks.\nHowever, most functions from blizzard.j destroy passed boolexpr automatically.\n\n@note Only call this on filterfunc created via `And`,`Or`,`Not`.\n\n@note See: `Filter`.\n\n",
    DestroyBoolExpr:
        "\nDestroys the provided boolean expression.\n\n\n@note `boolexpr` extends from `agent` and must be explicitly destroyed to prevent leaks.\nHowever, most functions from blizzard.j destroy passed boolexpr automatically.\n\n@note Only call this on boolexpr created via `And`,`Or`,`Not`.\n\n@note See: `And`, `Or`, `Not`, `Condition`, `Filter`.\n\n",
    TriggerRegisterTimerEvent:
        "\nCreates its own timer and triggers when it expires.\n\n\n@note The table below shows how often `TriggerRegisterTimerEvent` aka\n`TriggerRegisterTimerEventPeriodic` is executed per second with different\ntimeout values set.\nThis is in comparison with a 1ms and 0ms `timer`.\n\nNote how its frequency was limited to 100 times per second in v1.32.x.\n\n| Trigger or Timer \\ Tick count  |   ROC 1.0 | Reforged 1.32.10 |\n|--------------------------------|----------:|-----------------:|\n| 1000ms Trigger periodic        |      1 Hz |             1 Hz |\n| 100ms Trigger periodic         |     10 Hz |            10 Hz |\n| 20ms Trigger periodic          |     50 Hz |            50 Hz |\n| 10ms Trigger periodic          |    100 Hz |           100 Hz |\n| 5ms Trigger periodic           |    200 Hz |           100 Hz |\n| 1ms Trigger periodic           |   1000 Hz |           100 Hz |\n| 0ms Trigger periodic           |  10077 Hz |           100 Hz |\n| 1ms Timer                      |   1000 Hz |          1000 Hz |\n| 0ms Timer                      |  10077 Hz |         10077 Hz |\n\nSee: `TimerStart`\n\n",
    TriggerRegisterTimerExpireEvent:
        "\nAttach trigger to timer t. The trigger executes each time when timer expires.\nUsually used on periodic timers.\n\nReturns event, which is not used by GUI functions.\n\n\n@note See: `GetExpiredTimer` to retrieve timer inside trigger's actions.\n\n",
    GetEventGameState: "\n\n\n@event EVENT_GAME_STATE_LIMIT\n\n",
    TriggerRegisterGameEvent:
        "\nRegisters to execute whichTrigger when a game event occurs.\nReturns a handle to event that represents the registration, you can't do anything with those currently.\n\n**Example (Lua):**\n\n    trg_gameev = CreateTrigger()\n    -- this will print a message when someone opens a build menu\n    TriggerAddAction(trg_gameev, function() print(GetTriggerEventId()) end)\n    TriggerRegisterGameEvent(trg_gameev, EVENT_GAME_BUILD_SUBMENU)\n    --> new event on build menu open\n\n\n@bug Registered events cannot be destroyed as an object.\n\n",
    GetWinningPlayer: "\n\n\n@event EVENT_GAME_VICTORY\n\n",
    GetTriggeringRegion: "\n\n\n@event EVENT_GAME_ENTER_REGION\n\n",
    GetEnteringUnit: "\n\n\n@event EVENT_GAME_ENTER_REGION\n\n",
    GetLeavingUnit: "\n\n\n@event EVENT_GAME_LEAVE_REGION\n\n",
    TriggerRegisterTrackableHitEvent: "\nRegisters when a player clicks on the given `trackable`.\n\n\n",
    TriggerRegisterTrackableTrackEvent: "\nRegisters when a player hovers over the given `trackable`.\n\n\n",
    TriggerRegisterCommandEvent: "\n\n\n@patch 1.32\n@event EVENT_COMMAND_BUTTON_CLICK\n\n",
    TriggerRegisterUpgradeCommandEvent: "\n\n\n@patch 1.32\n@event EVENT_COMMAND_BUTTON_CLICK\n\n",
    GetTriggeringTrackable: "\n\n\n@event `EVENT_GAME_TRACKABLE_HIT`\n@event `EVENT_GAME_TRACKABLE_TRACK`\n\n",
    GetClickedButton: "\n\n\n@event EVENT_DIALOG_BUTTON_CLICK\n\n",
    GetClickedDialog: "\n\n\n@event EVENT_DIALOG_BUTTON_CLICK\n\n",
    GetTournamentFinishSoonTimeRemaining: "\n\n\n@event EVENT_GAME_TOURNAMENT_FINISH_SOON\n\n",
    GetTournamentFinishNowRule: "\n\n\n@event EVENT_GAME_TOURNAMENT_FINISH_SOON\n\n",
    GetTournamentFinishNowPlayer: "\n\n\n@event EVENT_GAME_TOURNAMENT_FINISH_SOON\n\n",
    GetTournamentScore: "\n\n\n@event EVENT_GAME_TOURNAMENT_FINISH_SOON\n\n",
    GetSaveBasicFilename: "\n\n\n@event EVENT_GAME_SAVE\n\n",
    GetTriggerPlayer: "\n\n\n@event EVENT_PLAYER_DEFEAT\n@event EVENT_PLAYER_VICTORY\n\n",
    GetLevelingUnit: "\n\n\n@event EVENT_PLAYER_HERO_LEVEL\n@event EVENT_UNIT_HERO_LEVEL\n\n",
    GetLearningUnit: "\n\n\n@event EVENT_PLAYER_HERO_SKILL\n@event EVENT_UNIT_HERO_SKILL\n\n",
    GetLearnedSkill: "\n\n\n@event EVENT_PLAYER_HERO_SKILL\n@event EVENT_UNIT_HERO_SKILL\n\n",
    GetLearnedSkillLevel: "\n\n\n@event EVENT_PLAYER_HERO_SKILL\n@event EVENT_UNIT_HERO_SKILL\n\n",
    GetRevivableUnit: "\n\n\n@event EVENT_PLAYER_HERO_REVIVABLE\n\n",
    GetRevivingUnit:
        "\n\n\n@event EVENT_PLAYER_HERO_REVIVE_START\n@event EVENT_PLAYER_HERO_REVIVE_CANCEL\n@event EVENT_PLAYER_HERO_REVIVE_FINISH\n@event EVENT_UNIT_HERO_REVIVE_START\n@event EVENT_UNIT_HERO_REVIVE_CANCEL\n@event EVENT_UNIT_HERO_REVIVE_FINISH\n\n",
    GetAttacker: "\n\n\n@event EVENT_PLAYER_UNIT_ATTACKED\n@event EVENT_UNIT_ATTACKED\n\n",
    GetRescuer: "\n\n\n@event EVENT_PLAYER_UNIT_RESCUED\n@event EVENT_UNIT_RESCUEDED\n\n",
    GetDyingUnit: "\n\n\n@event EVENT_PLAYER_UNIT_DEATH\n@event EVENT_UNIT_DEATH\n\n\n\n",
    GetKillingUnit: "\n\n\n@event EVENT_PLAYER_UNIT_DEATH\n\n",
    GetDecayingUnit: "\n\n\n@event EVENT_PLAYER_UNIT_DECAY\n@event EVENT_UNIT_DECAY\n\n",
    GetConstructingStructure: "\n\n\n@event EVENT_PLAYER_UNIT_CONSTRUCT_START\n\n",
    GetCancelledStructure:
        "\n\n\n@event EVENT_PLAYER_UNIT_CONSTRUCT_FINISH\n@event EVENT_PLAYER_UNIT_CONSTRUCT_CANCEL\n\n@event EVENT_UNIT_CONSTRUCT_CANCEL\n\n",
    GetConstructedStructure:
        "\n\n\n@event EVENT_PLAYER_UNIT_CONSTRUCT_FINISH\n@event EVENT_PLAYER_UNIT_CONSTRUCT_CANCEL\n\n@event EVENT_UNIT_CONSTRUCT_CANCEL\n@event EVENT_UNIT_CONSTRUCT_FINISH\n\n",
    GetResearchingUnit:
        "\n\n\n@event EVENT_PLAYER_UNIT_RESEARCH_START\n@event EVENT_PLAYER_UNIT_RESEARCH_CANCEL\n@event EVENT_PLAYER_UNIT_RESEARCH_FINISH\n\n",
    GetResearched:
        "\n\n\n@event EVENT_PLAYER_UNIT_RESEARCH_START\n@event EVENT_PLAYER_UNIT_RESEARCH_CANCEL\n@event EVENT_PLAYER_UNIT_RESEARCH_FINISH\n\n",
    GetTrainedUnitType:
        "\n\n\n@event EVENT_PLAYER_UNIT_TRAIN_START\n@event EVENT_PLAYER_UNIT_TRAIN_CANCEL\n\n@event EVENT_UNIT_TRAIN_START\n@event EVENT_UNIT_TRAIN_CANCELLED\n@event EVENT_UNIT_TRAIN_FINISH\n\n",
    GetTrainedUnit: "\n\n\n@event EVENT_PLAYER_UNIT_TRAIN_FINISH\n@event EVENT_UNIT_TRAIN_FINISH\n\n",
    GetDetectedUnit: "\n\n\n@event EVENT_PLAYER_UNIT_DETECTED\n\n",
    GetSummoningUnit: "\n\n\n@event EVENT_PLAYER_UNIT_SUMMONED\n\n",
    GetSummonedUnit: "\n\n\n@event EVENT_PLAYER_UNIT_SUMMONED\n\n",
    GetTransportUnit: "\n\n\n@event EVENT_PLAYER_UNIT_LOADED\n\n",
    GetLoadedUnit: "\n\n\n@event EVENT_PLAYER_UNIT_LOADED\n\n",
    GetSellingUnit: "\n\n\n@event EVENT_PLAYER_UNIT_SELL\n@event EVENT_UNIT_SELL\n\n",
    GetSoldUnit: "\n\n\n@event EVENT_PLAYER_UNIT_SELL\n@event EVENT_UNIT_SELL\n\n",
    GetBuyingUnit: "\n\n\n@event EVENT_PLAYER_UNIT_SELL\n@event EVENT_UNIT_SELL\n\n",
    GetSoldItem: "\n\n\n@event EVENT_PLAYER_UNIT_SELL_ITEM\n\n",
    GetChangingUnit: "\n\n\n@event EVENT_PLAYER_UNIT_CHANGE_OWNER\n\n",
    GetChangingUnitPrevOwner: "\n\n\n@event EVENT_PLAYER_UNIT_CHANGE_OWNER\n\n",
    GetManipulatingUnit:
        "\n\n\n@event EVENT_PLAYER_UNIT_DROP_ITEM\n@event EVENT_PLAYER_UNIT_PICKUP_ITEM\n@event EVENT_PLAYER_UNIT_USE_ITEM\n\n@event EVENT_UNIT_DROP_ITEM\n@event EVENT_UNIT_PICKUP_ITEM\n@event EVENT_UNIT_USE_ITEM\n\n",
    GetManipulatedItem:
        "\n\n\n@event EVENT_PLAYER_UNIT_DROP_ITEM\n@event EVENT_PLAYER_UNIT_PICKUP_ITEM\n@event EVENT_PLAYER_UNIT_USE_ITEM\n\n@event EVENT_UNIT_DROP_ITEM\n@event EVENT_UNIT_PICKUP_ITEM\n@event EVENT_UNIT_USE_ITEM\n\n",
    BlzGetAbsorbingItem:
        "\nFor EVENT_PLAYER_UNIT_PICKUP_ITEM, returns the item absorbing the picked up item in case it is stacking.\nReturns null if the item was a powerup and not a stacking item.\n\n\n@event EVENT_PLAYER_UNIT_PICKUP_ITEM\n@patch 1.32.3\n\n",
    BlzGetManipulatedItemWasAbsorbed: "\n\n\n@event EVENT_PLAYER_UNIT_PICKUP_ITEM\n@patch 1.32.3\n\n",
    BlzGetStackingItemSource:
        "\nSource is the item that is losing charges.\n\n\n@event EVENT_PLAYER_UNIT_STACK_ITEM\n@patch 1.32.3\n\n",
    BlzGetStackingItemTarget:
        "\nTarget is the item getting charges.\n\n\n@event EVENT_PLAYER_UNIT_STACK_ITEM\n@patch 1.32.3\n\n",
    BlzGetStackingItemTargetPreviousCharges: "\n\n\n@event EVENT_PLAYER_UNIT_STACK_ITEM\n@patch 1.32.3\n\n",
    GetOrderedUnit:
        "\n\n\n@event EVENT_PLAYER_UNIT_ISSUED_ORDER\n\n@event EVENT_UNIT_ISSUED_ORDER\n@event EVENT_UNIT_ISSUED_POINT_ORDER\n@event EVENT_UNIT_ISSUED_TARGET_ORDER\n\n",
    GetIssuedOrderId:
        "\n\n\n@event EVENT_PLAYER_UNIT_ISSUED_ORDER\n\n@event EVENT_UNIT_ISSUED_ORDER\n@event EVENT_UNIT_ISSUED_POINT_ORDER\n@event EVENT_UNIT_ISSUED_TARGET_ORDER\n\n",
    GetOrderPointX: "\n\n\n@event EVENT_PLAYER_UNIT_ISSUED_POINT_ORDER\n@event EVENT_UNIT_ISSUED_POINT_ORDER\n\n",
    GetOrderPointY: "\n\n\n@event EVENT_PLAYER_UNIT_ISSUED_POINT_ORDER\n@event EVENT_UNIT_ISSUED_POINT_ORDER\n\n",
    GetOrderPointLoc: "\n\n\n@event EVENT_PLAYER_UNIT_ISSUED_POINT_ORDER\n@event EVENT_UNIT_ISSUED_POINT_ORDER\n\n",
    GetOrderTarget: "\n\n\n@event EVENT_PLAYER_UNIT_ISSUED_TARGET_ORDER\n@event EVENT_UNIT_ISSUED_TARGET_ORDER\n\n",
    GetOrderTargetDestructable:
        "\n\n\n@event EVENT_PLAYER_UNIT_ISSUED_TARGET_ORDER\n@event EVENT_UNIT_ISSUED_TARGET_ORDER\n\n",
    GetOrderTargetItem: "\n\n\n@event EVENT_PLAYER_UNIT_ISSUED_TARGET_ORDER\n@event EVENT_UNIT_ISSUED_TARGET_ORDER\n\n",
    GetOrderTargetUnit: "\n\n\n@event EVENT_PLAYER_UNIT_ISSUED_TARGET_ORDER\n@event EVENT_UNIT_ISSUED_TARGET_ORDER\n\n",
    GetSpellAbilityUnit:
        "\n\n\n@event EVENT_UNIT_SPELL_CHANNEL\n@event EVENT_UNIT_SPELL_CAST\n@event EVENT_UNIT_SPELL_EFFECT\n@event EVENT_UNIT_SPELL_FINISH\n@event EVENT_UNIT_SPELL_ENDCAST\n@event EVENT_PLAYER_UNIT_SPELL_CHANNEL\n@event EVENT_PLAYER_UNIT_SPELL_CAST\n@event EVENT_PLAYER_UNIT_SPELL_EFFECT\n@event EVENT_PLAYER_UNIT_SPELL_FINISH\n@event EVENT_PLAYER_UNIT_SPELL_ENDCAST\n\n",
    GetSpellAbilityId:
        "\n\n\n@event EVENT_UNIT_SPELL_CHANNEL\n@event EVENT_UNIT_SPELL_CAST\n@event EVENT_UNIT_SPELL_EFFECT\n@event EVENT_UNIT_SPELL_FINISH\n@event EVENT_UNIT_SPELL_ENDCAST\n@event EVENT_PLAYER_UNIT_SPELL_CHANNEL\n@event EVENT_PLAYER_UNIT_SPELL_CAST\n@event EVENT_PLAYER_UNIT_SPELL_EFFECT\n@event EVENT_PLAYER_UNIT_SPELL_FINISH\n@event EVENT_PLAYER_UNIT_SPELL_ENDCAST\n\n",
    GetSpellAbility:
        "\n\n\n@event EVENT_UNIT_SPELL_CHANNEL\n@event EVENT_UNIT_SPELL_CAST\n@event EVENT_UNIT_SPELL_EFFECT\n@event EVENT_UNIT_SPELL_FINISH\n@event EVENT_UNIT_SPELL_ENDCAST\n@event EVENT_PLAYER_UNIT_SPELL_CHANNEL\n@event EVENT_PLAYER_UNIT_SPELL_CAST\n@event EVENT_PLAYER_UNIT_SPELL_EFFECT\n@event EVENT_PLAYER_UNIT_SPELL_FINISH\n@event EVENT_PLAYER_UNIT_SPELL_ENDCAST\n\n",
    GetSpellTargetLoc:
        "\n\n\n@event EVENT_UNIT_SPELL_CHANNEL\n@event EVENT_UNIT_SPELL_CAST\n@event EVENT_UNIT_SPELL_EFFECT\n@event EVENT_UNIT_SPELL_FINISH\n@event EVENT_UNIT_SPELL_ENDCAST\n@event EVENT_PLAYER_UNIT_SPELL_CHANNEL\n@event EVENT_PLAYER_UNIT_SPELL_CAST\n@event EVENT_PLAYER_UNIT_SPELL_EFFECT\n@event EVENT_PLAYER_UNIT_SPELL_FINISH\n@event EVENT_PLAYER_UNIT_SPELL_ENDCAST\n\n",
    GetSpellTargetX:
        "\n\n\n@event EVENT_UNIT_SPELL_CHANNEL\n@event EVENT_UNIT_SPELL_CAST\n@event EVENT_UNIT_SPELL_EFFECT\n@event EVENT_UNIT_SPELL_FINISH\n@event EVENT_UNIT_SPELL_ENDCAST\n@event EVENT_PLAYER_UNIT_SPELL_CHANNEL\n@event EVENT_PLAYER_UNIT_SPELL_CAST\n@event EVENT_PLAYER_UNIT_SPELL_EFFECT\n@event EVENT_PLAYER_UNIT_SPELL_FINISH\n@event EVENT_PLAYER_UNIT_SPELL_ENDCAST\n\n@patch 1.24b\n\n",
    GetSpellTargetY:
        "\n\n\n@event EVENT_UNIT_SPELL_CHANNEL\n@event EVENT_UNIT_SPELL_CAST\n@event EVENT_UNIT_SPELL_EFFECT\n@event EVENT_UNIT_SPELL_FINISH\n@event EVENT_UNIT_SPELL_ENDCAST\n@event EVENT_PLAYER_UNIT_SPELL_CHANNEL\n@event EVENT_PLAYER_UNIT_SPELL_CAST\n@event EVENT_PLAYER_UNIT_SPELL_EFFECT\n@event EVENT_PLAYER_UNIT_SPELL_FINISH\n@event EVENT_PLAYER_UNIT_SPELL_ENDCAST\n\n@patch 1.24b\n\n",
    GetSpellTargetDestructable:
        "\n\n\n@event EVENT_UNIT_SPELL_CHANNEL\n@event EVENT_UNIT_SPELL_CAST\n@event EVENT_UNIT_SPELL_EFFECT\n@event EVENT_UNIT_SPELL_FINISH\n@event EVENT_UNIT_SPELL_ENDCAST\n@event EVENT_PLAYER_UNIT_SPELL_CHANNEL\n@event EVENT_PLAYER_UNIT_SPELL_CAST\n@event EVENT_PLAYER_UNIT_SPELL_EFFECT\n@event EVENT_PLAYER_UNIT_SPELL_FINISH\n@event EVENT_PLAYER_UNIT_SPELL_ENDCAST\n\n",
    GetSpellTargetItem:
        "\n\n\n@event EVENT_UNIT_SPELL_CHANNEL\n@event EVENT_UNIT_SPELL_CAST\n@event EVENT_UNIT_SPELL_EFFECT\n@event EVENT_UNIT_SPELL_FINISH\n@event EVENT_UNIT_SPELL_ENDCAST\n@event EVENT_PLAYER_UNIT_SPELL_CHANNEL\n@event EVENT_PLAYER_UNIT_SPELL_CAST\n@event EVENT_PLAYER_UNIT_SPELL_EFFECT\n@event EVENT_PLAYER_UNIT_SPELL_FINISH\n@event EVENT_PLAYER_UNIT_SPELL_ENDCAST\n\n",
    GetSpellTargetUnit:
        "\n\n\n@event EVENT_UNIT_SPELL_CHANNEL\n@event EVENT_UNIT_SPELL_CAST\n@event EVENT_UNIT_SPELL_EFFECT\n@event EVENT_UNIT_SPELL_FINISH\n@event EVENT_UNIT_SPELL_ENDCAST\n@event EVENT_PLAYER_UNIT_SPELL_CHANNEL\n@event EVENT_PLAYER_UNIT_SPELL_CAST\n@event EVENT_PLAYER_UNIT_SPELL_EFFECT\n@event EVENT_PLAYER_UNIT_SPELL_FINISH\n@event EVENT_PLAYER_UNIT_SPELL_ENDCAST\n\n",
    GetEventPlayerState: "\n\n\n@event EVENT_PLAYER_STATE_LIMIT\n\n",
    TriggerRegisterPlayerChatEvent:
        '\nRegisters a chat event.\n\n@param whichTrigger The trigger to which register the event.\n\n@param whichPlayer The player on which chat-messages to react to.\n\n@param chatMessageToDetect The message to react to. Pass `""` to react to any message.\n\n@param exactMatchOnly `true` if only the exact string in `chatMessageToDetect`\nshould fire the trigger. `false` will trigger if the `chatMessageToDetect` appears\nanywhere in the entered string.\n\n\n@note The callback event will not have the `EVENT_PLAYER_CHAT` eventid,\ninstead `ConvertPlayerEvent(96)` which has no attached global in common.j.\n\n@note Players removed by `RemovePlayer` will not fire chat events.\n\n@event ConvertPlayerEvent(96)\n\n',
    GetEventPlayerChatString:
        '\nReturns the actual string they typed in ( same as what you registered for\n if you required exact match ).\nUsed in conjunction with `TriggerRegisterPlayerChatEvent`.\n\n\n@event ConvertPlayerEvent(96)\n\n@bug This function only returns `""` when called in response to `EVENT_PLAYER_CHAT`.\n\n',
    GetEventPlayerChatStringMatched:
        '\nReturns the string that you registered for.\nUsed in conjunction with `TriggerRegisterPlayerChatEvent`.\n\n\n@event ConvertPlayerEvent(96)\n\n@bug This function only returns `""` when called in response to `EVENT_PLAYER_CHAT`.\n\n',
    TriggerRegisterDeathEvent:
        '\nMakes the target trigger execute when specified widget dies.\nReturns registered event.\n\nUse `GetTriggerWidget` to retrieve the target. These work too if the widget\nis of the correct sub-type: `GetTriggerUnit`, `GetTriggerDestructable`.\n\n@param whichTrigger Register death event to execute this trigger.\n@param whichWidget Trigger when this widget dies.\n\n@note There\'s no "GetTriggerItem" so you have to downcast it from `widget` type.\nSee example.\n\n@note **Example (Lua):** This event and trigger can be used to operate on\nwidgets, units, destructables, items (with typecasting).\n\n```{.lua}\n-- Create necessary widgets\nu = CreateUnit(Player(0), FourCC("Hamg"), -30, 0, 90)\nd = CreateDestructable(FourCC("ZTg1"), 256, 0, 90, 1, 0)\nitem = CreateItem(FourCC("war2"), 256, 384)\n\n-- This is our trigger action\nhasht = InitHashtable() -- for type-casting\nfunction widgetDied()\n\tlocal w,u,d,i\n\tw,u,d = GetTriggerWidget(),GetTriggerUnit(),GetTriggerDestructable()\n\tif not u and not d then -- the widget is an item\n\t\t-- Downcasting (explicit type casting from widget to a child type)\n\t\tSaveWidgetHandle(hasht, 1, 1, w) -- put as widget\n\t\ti = LoadItemHandle(hasht, 1, 1) -- retrieve as item\n\tend\n\tprint("died object (widget, unit, destr, item):", w, u, d, i)\n\t\n\tlocal wXpos, uXpos, dXpos, iXpos\n\twXpos = GetWidgetX(w)\n\tif u then uXpos = GetUnitX(u) end\n\tif d then dXpos = GetDestructableX(d) end\n\tif i then iXpos = GetItemX(i) end\n\tprint("died obj x pos (widget, unit, destr, item):", wXpos, uXpos, dXpos, iXpos)\nend\n\n-- Create and register widgets to this trigger\ntrig = CreateTrigger()\nTriggerAddAction(trig, widgetDied)\nfor k,widg in pairs({u,d,item}) do TriggerRegisterDeathEvent(trig, widg) end\n\n-- Kill widgets and observe what happens\nSetWidgetLife(u, 0)\nSetWidgetLife(d, 0)\nSetWidgetLife(item, 0)\n```\n\n@note You can use this with units, items, destructables. Explained in `widget`.\n\n\n',
    GetTriggerUnit:
        "\nReturns handle to unit which triggered the most recent event when called from\nwithin a trigger action function. Returns `null` handle when used incorrectly.\n\n\n@note Can be used in `TriggerRegisterDeathEvent` if the dead widget is actually\na unit.\n\n",
    GetEventUnitState: "\n\n\n@event EVENT_UNIT_STATE_LIMIT\n\n",
    GetEventDamage: "\n\n\n@event EVENT_UNIT_DAMAGED\n\n",
    GetEventDamageSource: "\n\n\n@event EVENT_UNIT_DAMAGED\n\n",
    GetEventDetectingPlayer: "\n\n\n@event EVENT_UNIT_DETECTED\n\n",
    GetEventTargetUnit: "\n\n\n@event EVENT_UNIT_ACQUIRED_TARGET\n@event EVENT_UNIT_TARGET_IN_RANGE\n\n",
    TriggerAddAction:
        "\nAdds an action to be called when the given trigger is fired through registered events or through `TriggerExecute`.\n\n\n@note More than one action can be added to the trigger. The actions run in the order they were added.\n\n@note The same function can be used more than once on the same trigger.\n\n@note Actions wait for their forerunner to finish. So if there are `TriggerSleepAction`s, subsequent actions will be delayed accordingly.\n\n@note If an action execution crashes, subsequent actions will be unaffected and still be called.\n\n@bug If an action execution crashes after a `TriggerSleepAction` in the same action execution, subsequent actions will not be run.\n\n@note New actions added to the trigger during the execution of the actions won't be subject for execution for this run.\n\n",
    TriggerRemoveAction:
        "\nRemoves an action from a trigger.\n\n\n@bug If the actions of the trigger are currently running and the removed action was still pending to be called, it will still be called unless\nthere is a `TriggerSleepAction` after the `TriggerRemoveAction`.\n\n",
    TriggerClearActions:
        "\nRemoves all actions from a trigger.\n\n\n@bug If the actions of the trigger are currently running, hereby removed actions still pending to be called will still be called. In contrast to\n`TriggerRemoveAction`, this will be the case regardless if there is a `TriggerSleepAction` after `TriggerClearActions` or not.\n\n",
    TriggerSleepAction:
        "\nMakes a trigger execution sleep for a given duration. The thread will yield so other threads can do their work.\n\n\n@note This works only in a trigger action execution context, not in trigger conditions nor for example in timer functions or `ForGroup` functions. However, it\nalso works in `ExecuteFunc` contexts, even if the `ExecuteFunc` call is not in a trigger action execution context.\n\n@note This has many implications, see other trigger-related natives.\n\n@note This ticks while the game was paused with the `PauseGame` native, unlike timers.\n\n@note This does not tick while the game was paused by the user, neither in singleplayer nor in multiplayer. (But the Trigger Editor of the World Editor\ndenotes it as a real-time wait. Is this a bug?)\n\n@note This ticks independently from game speed, i.e., in Fast mode, it will be about the same as a game time, in Normal mode, it will be about 25% faster than\ngame time and in Slow mode, it will be about 67% faster than game time, see table below.\n\nGame speed | TSA speed (%) | game speed (%)\n-----------|---------------|---------------\nFast       | 100%          | 100%\nNormal     | 100%          | 80%\nSlow       | 100%          | 60%\n\nExample elapsed game time after TSA with timeout = 30:\n\nGame speed | game time elapsed\n-----------|------------------\nFast       | 30s\nNormal     | 24s\nSlow       | 18s\n\n",
    TriggerEvaluate:
        '\nEvaluates all functions that were added to the trigger via `TriggerAddCondition`.\nAll return-values from all added condition-functions are `and`ed together as the final return-value.\nReturns the boolean value of the return value from the condition-function.\nSo if the condition-functions return `0`/`0.0`/`null`, then `TriggerEvaluate`\nwill return `false`. Note that an empty string `""` would return `true`.\n\n\n@note If a condition-function crashes the thread or does not return any value\n`TriggerEvaluate` will return `false`.\n\n@note If you want to return false for a condition-function that returns\nstring (for whatever reason) return `null` instead of `""`.\n\n@note *All* functions added via `TriggerAddCondition` are run.\nThere is no short-circuting. If you want short-circuting use `And` or `Or`.\n\n@note All functions added via `TriggerAddCondition` are run in the order they\nwere added.\n\n',
    TriggerExecute:
        "\nCalls the actions of a trigger in a new execution context. Control will return to the caller when the\ntrigger has finished or has been suspended via `TriggerSleepAction`.\n\n\n",
    TriggerExecuteWait:
        "\nDoes the same as `TriggerExecute` but if the caller has been marked with `TriggerWaitOnSleeps` before its\nexecution, it will additionally wait for `TriggerSleepAction`s of the callee, so this really ensures that\nthe callee has finished. If there was a `TriggerSleepAction`, there will be a short delay before returning.\n\n\n",
    TriggerSyncReady:
        "\nWaits until all currently running `SyncStoredX` (like `SyncStoredInteger`)\ncalls are done.\n\n\n",
    GetWidgetLife:
        "\nReturns target's health points on succcess. Returns 0.0 if widget was removed or is null.\n\n@param whichWidget target widget.\n\n@note See: `SetWidgetLife`.\nSee `widget` for an explanation how this applies to units, destructables, items.\n\n\n",
    SetWidgetLife:
        "\nSets target's health points.\n\nIt is limited by target's maximum health points. A value of ≤0 kills the target.\n\n@param whichWidget target widget.\n@param newLife set health points to this amount.\n\n@note See: `GetWidgetLife`.\nSee `widget` for an explanation how this applies to units, destructables, items.\n\n\n",
    GetWidgetX:
        "\nReturns X map coordinate of widget on success. Returns 0.0 if widget was removed or is null.\n\n@param whichWidget target widget.\n\n@note See: `GetWidgetY`.\nSee `widget` for an explanation how this applies to units, destructables, items.\n\n\n",
    GetWidgetY:
        "\nReturns Y map coordinate of widget on success. Returns 0.0 if widget was removed or is null.\n\n@param whichWidget target widget.\n\n@note See: `GetWidgetX`.\nSee `widget` for an explanation how this applies to units, destructables, items.\n\n\n",
    GetTriggerWidget:
        "\nReturns the target widget (that caused the trigger-event) inside a trigger action.\nOtherwise returns null.\n\n\n@note Only works in triggers that operate on actual `widget` type, like `TriggerRegisterDeathEvent`.\n\n",
    CreateDestructableZ:
        "\nCreates a destructable at the coordinates ( x , y ).\n\n@param objectid The rawcode of the destructable to be created.\n@param x The x-coordinate of the destructable.\n@param y The y-coordinate of the destructable.\n@param face The facing of the destructable.\n@param scale The X-Y-Z scaling value of the destructable.\n@param variation The integer representing the variation of the destructable to be created.\n\n\n",
    CreateDeadDestructable:
        "\nCreates the dead version of a destructable at the coordinates ( x , y ).\nIf the destructable has no animations, it will show the destructable's default\nform. If it has a death animation, but no decay animation, then the object will\nbe created in memory but will not visibly appear.\n\n@param objectid The rawcode of the destructable to be created.\n@param x The x-coordinate of the destructable.\n@param y The y-coordinate of the destructable.\n@param face The facing of the destructable.\n@param scale The X-Y-Z scaling value of the destructable.\n@param variation The integer representing the variation of the destructable to be created.\n\n\n",
    CreateDeadDestructableZ:
        "\nCreates the dead version of a destructable at the coordinates ( x , y , z ).\nIf the destructable has no animations, it will show the destructable's default\nform. If it has a death animation, but no decay animation, then the object will\nbe created in memory but will not visibly appear.\n\n@param objectid The rawcode of the destructable to be created.\n@param x The x-coordinate of the destructable.\n@param y The y-coordinate of the destructable.\n@param z The z-coordinate of the destructable.\n@param face The facing of the destructable.\n@param scale The X-Y-Z scaling value of the destructable.\n@param variation The integer representing the variation of the destructable to be created.\n\n\n",
    DestructableRestoreLife:
        "\nResurrects a destructable with the specified hit points.\n\n@param d The destructable to resurrect. If it is not dead, there will be no effect.\n\n@param life The amount of hit points the destructable will have when it is\nresurrected. A value of 0, or any value above the destructable's maximum HP,\nwill give the destructable its maximum HP (as defined in the object editor).\nAny value below 0.5 will give the destructable 0.5 hit points.\n\n@param birth If true, the destructable will play its birth animation upon resurrection.\n\n\n\n",
    GetDestructableName: "\n\n\n@async \n\n",
    GetTriggerDestructable:
        "\n\n\n@note Can be used in `TriggerRegisterDeathEvent` if the dead widget is actually\na destructable.\n\n",
    CreateItem:
        "\nCreates an item object at the specified coordinates ( x , y ).\n\n@param itemid The rawcode of the item.\n\n@param x The x-coordinate of the item.\n\n@param y The y-coordinate of the item.\n\n\n",
    SetItemVisible:
        "\n\n\n@note \nAn item can be hidden locally, but it will desync if visibility causes a local side-effect.\n\n",
    GetItemName: "\n\n\n@async \n\n",
    CreateUnit:
        "\nCreates a unit of type `unitid` for player `id`, facing a certain direction at the provided coordinates.\nReturns handle to unit.\n\n**Example:** Create a human footman for first player (red) at map coordinates -30, 0, facing north:\n\n```\n    // Jass\n    call CreateUnit(Player(0), 'hfoo', -30, 0, 90)\n```\n```{.lua}\n    -- Lua\n    CreateUnit(Player(0), FourCC(\"hfoo\"), -30, 0, 90)\n```\n\t\n@param id The owner of the unit.\n@param unitid The rawcode of the unit.\n@param x The x-coordinate of the unit.\n@param y The y-coordinate of the unit.\n@param face Unit facing in degrees.\n\n* 0   = East\n* 90  = North\n* 180 = West\n* 270 = South\n* -90 = South (wraps around)\n\n\n@note See: `bj_UNIT_FACING` constant for default facing direction of units in BJ scripts and GUI.\n\n\n",
    CreateUnitByName: "\n@param face Unit facing in degrees.\n",
    CreateUnitAtLoc:
        "\n@param id The owner of the unit.\n@param unitid The rawcode of the unit.\n@param whichLocation The position of the unit.\n@param face Unit facing in degrees.\n",
    CreateUnitAtLocByName: "\n@param face Unit facing in degrees.\n",
    CreateCorpse:
        "\nCreates the corpse of a specific unit for a player at the coordinates ( x , y ).\nThe unit will die upon spawning and play their decay animation, therefore they\nwill not necessarily be a corpse immediately after this function call. If the\nunit corresponding to the rawcode cannot have a corpse, then the returned value is null.\n\n@param whichPlayer The owner of the corpse.\n@param unitid The rawcode of the unit for the corpse.\n@param x The x-coordinate of the corpse.\n@param y The y-coordinate of the corpse.\n@param face Unit facing in degrees.\n\n\n",
    RemoveUnit:
        '\n\n@note A comment in Blizzard.j, `ReplaceUnitBJ` states that it\'s "sometimes unsafe to remove hidden units",\nas a workaround it calls `KillUnit` right before `RemoveUnit`.\n\nTODO: Propagate this note to other functions that use hidden units.\n',
    SetUnitState:
        "\nSet unit's unit state to a new absolute value.\n\n**Example:** Set unit's max mana to 105 MP.\n\n    call SetUnitState(myUnit, UNIT_STATE_MAX_MANA, 105.0)\n\t\n\n@note See: `GetUnitState`.\n\n",
    SetUnitX:
        "\n\n\n@note If the unit has movementspeed of zero the unit will be moved but the model\nof the unit will not move.\n@note This does not cancel orders of the unit. `SetUnitPosition` does cancel orders.\n\n",
    SetUnitY:
        "\n\n\n@note If the unit has movementspeed of zero the unit will be moved but the model\nof the unit will not move.\n@note This does not cancel orders of the unit. `SetUnitPosition` does cancel orders.\n\n",
    SetUnitPosition:
        "\n\n\n@note This cancels the orders of the unit. If you want to move a unit without\ncanceling its orders use `SetUnitX`/`SetUnitY`.\n\n",
    SetUnitFacing:
        "\nMakes the unit slowly turn around on the spot to look at new direction.\n\n@param whichUnit Target unit.\n@param facingAngle Unit facing in degrees.\n\n* 0   = East\n* 90  = North\n* 180 = West\n* 270 = South\n* -90 = South (wraps around)\n\n@note While the unit is moving, calling this function will have no effect.\n\n",
    SetUnitFacingTimed:
        '\nMakes the unit slowly turn around on the spot to look at new direction,\nthe turn speed can be modified with `duration`.\n\n@note Not affected by `GetUnitTurnSpeed`/`SetUnitTurnSpeed`.\n\n@note If `duration < 0.1`, while the unit is moving, calling this function will have no effect.\n\n@bug For `duration == 0.5` the footman plays the running animation while turning.\n\n```{.lua}\nuf1 = CreateUnit(Player(0), FourCC("hfoo"), -128, 0, 90)\nuf2 = CreateUnit(Player(0), FourCC("hfoo"), 128, 0, 90)\n\nSetUnitFacing(uf1, -90)\nSetUnitFacingTimed(uf2, -90, 0.5)\n```\n\n@bug For `duration` values other than zero, the final angle is different\nthan the requested angle, even when called repeatedly.\n\n```{.lua}\nSetUnitFacing(uf1, 90)\nSetUnitFacingTimed(uf2, 90, 1) --> final angle = 96.91184 (expected 90)\n```\n\n@param whichUnit Target unit.\n\n@param facingAngle New angle in degrees (direction), see: `SetUnitFacing`.\n\n@param duration\nValue >= 0 and < 1: same turn speed as `SetUnitFacing`.\n\nValues >= 1 seem to be applied like a multiplier, slowing down the turn speed.\n',
    SetUnitPropWindow:
        "\nSets a unit's propulsion window to the specified angle (in radians).\n\nThe propulsion window determines at which facing angle difference to the target\ncommand's location (move, attack, patrol, smart) a unit will begin to move if\nmovement is required to fulfil the command, or if it will turn without movement.\nA propulsion window of 0 makes the unit unable to move at all.\nA propulsion window of 180 will force it to start moving as soon as the command\nis given (if movement is required). In practice, this means that setting a\nunit's prop window to 0 will prevent it from attacking.\n\n<http://www.hiveworkshop.com/forums/2391397-post20.html>\n\n\n@param whichUnit The function will modify this unit's propulsion window.\n@param newPropWindowAngle The propulsion window angle to assign. Should be in radians.\n\n\n\n",
    SetUnitAcquireRange:
        "\nSets a unit's acquire range.  This is the value that a unit uses to choose targets to\nengage with.  Note that this is not the attack range.  When acquisition range is\ngreater than attack range, the unit will attempt to move towards acquired targets, and\nthen attack.\n\nSetting acquisition range lower than attack range in the object editor limits the\nunit's attack range to the acquisition range, but changing a unit's acquisition range\nwith this native does not change its attack range, nor the value displayed in the UI.\n\n\n@note It is a myth that reducing acquire range with this native can limit a unit's\nattack range.\n\n",
    GetUnitPropWindow:
        "\nReturns a unit's propulsion window angle in radians.\n\n@param whichUnit The function will return this unit's propulsion window angle.\n\n\n",
    GetUnitDefaultPropWindow:
        "\nReturns a unit's default propulsion window angle in degrees.\n\n@param whichUnit The unit of which to return the default prop window.\n\n\n@note This native is the odd case in the asymmetric prop window API, since the\nother prop window natives use radians. Therefore, to reset a unit's prop window\nyou need the explicit conversion, i.e.\n`SetUnitPropWindow(u, GetUnitDefaultPropWindow(u) * bj_DEGTORAD)`.\n\n",
    SetUnitOwner:
        "\nChanges ownership of a unit.\n\n@param whichUnit Unit to modify.\n@param whichPlayer The unit's new owner.\n@param changeColor True to change unit's accent color to new owner's color, false to leave old color.\n\n\n@note Reforged: The HP bar will always have the color of its owner player, regardless of `changeColor`.\n\n@note See: `GetOwningPlayer`, `Player`.\n\n",
    SetUnitColor:
        "\nSets a unit's player color accent.\n\n@param whichUnit Unit to modify.\n@param whichColor Set to this player's color.\n\n\n@bug Visual bug (tested v1.32.10): if you create two units of the same type (Normal and Colored)\nand set Colored's color to a different color, then clicking between the two units\nwill not change the portrait color. The portrait will only update correctly if you\ndeselect the unit. \n\n\n",
    SetUnitScale:
        "\n\n@param scaleX This is actually the scale for *all* dimensions.\n@param scaleY This parameter is not taken into account.\n@param scaleZ This parameter is not taken into account.\n\n@bug Only takes scaleX into account and uses scaleX for all three dimensions.\n\n",
    SetUnitVertexColor:
        "\nSets the unit's entire model color to the color defined by (red, green, blue, alpha).\n\nThe vertex color changes how the model is rendered. For example, setting all r,g,b=0 will make the model entirely black; no colors will be visible (like Illidan's demon form).\n\nTo imagine the final result of changing vertex colors, it is helpful to think of individual RGB layers in a color image, if you disable the Red channel, only Green & Blue channels will be shown.\n\n@param whichUnit The unit to modify.\n@param red visibility of red channel (clamped to 0-255).\n@param green visibility of green channel (clamped to 0-255).\n@param blue visibility of blue channel (clamped to 0-255).\n@param alpha opacity (clamped to 0-255). A value of 255 is total opacity (fully visible). A value of 0 is total transparency; the model will be invisible, but you'll still see the shadow, HP bar etc.\n\n\n@note Not to be confused with `SetUnitColor` which changes a unit's player accent color.\n\n",
    SetUnitLookAt:
        "\nLocks a unit's bone to face the target until ResetUnitLookAt is called.\n\nThe offset coordinates ( X, Y, Z ) are taken from the target's origin.\nThe bones will lock to the lookAtTarget, offset by those coordinates. You can't\nhave both the head and the chest locked to the target at the same time.\n\n\n\n@param whichUnit The unit that will have its bone locked to face the target.\n\n@param whichBone The bone to lock onto the target. The engine only supports\nlocking the head and the chest. To lock the head, you can put in any input\nexcept a null string. To lock the chest, the string must start with `\"bone_chest\"`.\nAll leading spaces are ignored, it is case insensitive, and anything after the\nfirst non-leading space will be ignored.\n\n@param lookAtTarget The bone will be locked to face this unit.\n\n@param offsetX The x-offset from lookAtTarget's origin point.\n\n@param offsetY The y-offset from lookAtTarget's origin point.\n\n@param offsetZ The z-offset from lookAtTarget's origin point (this already factors in the terrain Z).\n\n\n@note The parameter `whichBone` can only move the head bones and the chest bones.\nAll other input will default to the head bone. However, the function only looks\nfor the helper named `\"Bone_Head\"` (or `\"Bone_Chest\"`) in the MDL, so you can just\nrename a helper so that it will move that set of bones instead.\n\n@note SetUnitLookAt is affected by animation speed and blend time.\n\n@note [How to instantly set a unit's facing](http://www.wc3c.net/showthread.php?t=105830).\n\n",
    ResetUnitLookAt:
        "\nUnlocks the bone oriented by `SetUnitLookAt`, allowing it to move in accordance\nto the unit's regular animations.\n\n@param whichUnit The unit that will have its bone unlocked.\n\n\n",
    SetHeroStr:
        "\nSets the hero's strength property. If the new strength property is less than current value, the hero will lose HP.\n\n\n@note Hero cannot lose HP below 1.0, which means that removing X strength and then adding X strength back can result in healing.\n\n",
    GetHeroSkillPoints: "\nReturns the units available skill points.\n\n\n",
    UnitModifySkillPoints:
        "\nAdds the amount to the units available skill points. Calling with a negative\nnumber reduces the skill points by that amount.\nReturns false if the amount of available skill points is already zero and\nif it's called with any non-positive number.\nReturns true in any other case.\n\n\n@note If `skillPointDelta` is greater than the amount of skillpoints the hero\nactually can spend (like 9 for three 3-level abilities) only that amount will\nbe added. Negative `skillPointDelta` works as expected.\n\n",
    AddHeroXP:
        "\nAdds the input value of experience to the hero unit specified.\n\nIf the experience added exceeds the amount required for the hero to gain a level,\nthen it will force the unit to gain a level and the remaining experience will\nspill over for the next level.\n\n@param whichHero The hero unit to add experience to.\n\n@param xpToAdd The amount of experience to add to the hero unit.\n\n@param showEyeCandy If the boolean input is true, then the hero-level-gain\neffect will be shown if the hero gains a level from the added experience.\n\n@bug Adding negative value to experience will decrease it\nby the stated value, but won't lower the level even if the experience value\nafter deduction is lower than the lower bound of the experience required to get\nthe stated level.\n\n@bug If the value will become lower than zero, the experience won't\nbe negative, instead of it it'll be equal\nto `4294967296+(supposed_negative_experience_value)` which actually proves\nthat WarCraft III uses unsigned int type for storing experience points.\n\n\n",
    SetHeroLevel:
        "\nSets the hero to chosen level.\n\nThe level can only be increased; lowering the level does nothing.\nFurther, the level will not exceed the hero's maximum level set in WorldEditor.\n\n@param whichHero The target hero unit.\n@param level New level of the hero.\n@param showEyeCandy False to hide level-up effects, true to show.\nThe level-up effects include: floating experience gain text, sound and a visual effect.\n\n\n",
    GetHeroProperName:
        '\nReturns the hero\'s "Proper Name", which is the name displayed above the level bar.\n\n\n@note Will return `null` on non-hero units or `null`.\n\n',
    SelectHeroSkill:
        "\nSpends a skill point of the hero to learn a skill.\nIf the requirements are not met, does nothing.\nThis is equivalent to clicking the red plus button in game and choosing a skill.\n\nRequirements:\n\n1. The hero has an unspent skill point\n2. The skill is available for learning (not level-locked etc.)\n\n@param whichHero Target hero.\n@param abilcode Abilities' raw code identifier.\n\n\n",
    GetUnitAbilityLevel:
        "\nReturns the level of the ability for the unit.\n\n@param whichUnit Target unit.\n@param abilcode Abilities' raw code identifier.\n\n\n",
    DecUnitAbilityLevel:
        "\nDecreases the level of a unit's ability by 1. The level will not go below 1.\nReturns the new ability level.\n\n@param whichUnit The unit with the ability.\n@param abilcode The four digit rawcode representation of the ability.\n\n\n",
    IncUnitAbilityLevel:
        "\nIncreases the level of a unit's ability by 1.\n\nReturns the new ability level.\n\n@param whichUnit The unit with the ability.\n@param abilcode The four digit rawcode representation of the ability.\n\n\n@note `IncUnitAbilityLevel` can increase an abilities level to maxlevel+1.\nOn maxlevel+1 all ability fields are 0.\nSee <http://www.wc3c.net/showthread.php?p=1029039#post1029039>\nand <http://www.hiveworkshop.com/forums/lab-715/silenceex-everything-you-dont-know-about-silence-274351/>.\n\n",
    SetUnitAbilityLevel:
        "\nSets the new level of unit's ability.\n\n@param whichUnit Target unit.\n@param abilcode Abilities' raw code identifier.\n@param level New ability level.\n\n\n@note You can only set levels which are defined for the current ability.\nFor example, most WC3 abilities have levels 1-3.\nSetting level <=0 will instead set it to level 1.\nSetting level >maximum will instead set it to abilities' highest level defined in WorldEditor.\n\n@note When a unit picks up an item with an ability, the ability will be added to the unit's list of abilities. Thus, this function can be used\nto set the level of an ability for an item on the unit, too. Since it's an attribute of the unit, a level set this way will not be retained\nwhen the item is dropped and picked up again. Via item abilities, a unit can have more than one instance of ability with the same ability id.\nThis function will only set the level of the most recently obtained ability instance, then, which corresponds to the first ability instance found\nwhen using `BlzGetUnitAbilityByIndex` counting upwards.\n",
    ReviveHero:
        "\nRevives a dead hero at target coordinates, with or without special effects.\n\nReturns true if hero was dead and revived.\nReturns false otherwise (hero alive, unit isn't a hero/doesn't exist etc.).\n\n@param whichHero Target dead hero.\n@param x X map coordinate.\n@param y Y map coordinate.\n@param doEyecandy True to revive with revival special effects, false without.\nSpecial effects include: sound, visual effect. \n\n\n@note See: `ReviveHeroLoc`.\n\n",
    ReviveHeroLoc:
        "\nRevives a dead hero at target location, with or without special effects.\n\nReturns true if hero was dead and revived.\nReturns false otherwise (hero alive, unit isn't a hero/doesn't exist etc.)\n\n@param loc Location on map.\n@param doEyecandy True to revive with revival special effects, false without.\nSpecial effects include: sound, visual effect. \n\n\n@note See: `ReviveHero`.\n\n",
    SetUnitInvulnerable:
        "\nRenders a unit invulnerable/lifts that specific invulnerability.\n\n\n@note The native seems to employ the `'Avul'` ability, which is defined in the\ndefault AbilityData.slk.\nIf there is no `'Avul'` defined, this will crash the game.\n\n",
    PauseUnit:
        "\nPauses a unit. A paused unit has the following properties:\n\n  * Buffs/effects are suspended\n  * Orders are stored when paused and fired on unpause\n  * The paused unit does not accept powerups. `UnitAddItem` returns true but\n    the item is not picked up\n\n\n",
    ClearSelection:
        "\nClears all widget selections for all players.\n\n\n@note Use `ClearSelectionForPlayer` to clear selection for only one player.\n\n",
    SelectUnit:
        "\n\n\n@bug If you use this function to select a unit after calling `ClearSelection` (like `SelectUnitSingle`\ndoes) and you have a unit sub-menu opened (like spellbook or build structure), the command buttons\nof the selected unit won't show until you select another unit.\n\n",
    UnitAddItem:
        "\nPuts specific item in target unit's inventory.\n\nReturns:\n\n- true if this exact item is already in unit's inventory or if it was put there successfully\n- false if unit has no inventory or space, or invalid item/unit\n\n@param whichUnit Target unit.\n@param whichItem Handle to item instance.\n\n\n",
    UnitAddItemById:
        "\nCreates a new item of type `itemId` and puts it in unit's inventory.\nIf the inventory is full, it is dropped on the ground at unit's position instead.\n\nThis function works in two steps:\n\n1. Spawn the item if both `whichUnit` and `itemId` are valid and exist\n2. Attempt to put the item in unit's inventory. If inventory is full or unit is\ndead then the item is dropped on the ground at unit position.\n\nReturns:\n\n- item handle if the item was successfully placed in unit's inventory\n- null if inventory is full, unit cannot carry items, itemId/unit invalid etc.\n\n@param whichUnit Target unit.\n@param itemId Item's raw code identifier.\n\n\n@note See: `UnitAddItemToSlotById`.\n\n",
    UnitAddItemToSlotById:
        "\nCreates a new item of type `itemId`\nand puts it in unit's inventory in slot specified by `itemSlot`.\nIf the slot is occupied or invalid (<0 or >6, or higher than unit's max slots),\nit is dropped on the ground at unit's position instead.\n\nThis function works in two steps:\n\n1. Spawn the item if both `whichUnit` and `itemId` are valid and exist\n2. Attempt to put the item in unit's inventory at specified slot.\nIf the slot is occupied or unit is dead then the item is dropped on the ground\nat unit position.\n\nReturns:\n\n- true if the item was successfully placed in unit's inventory\n- false otherwise: slot occupied, unit cannot carry items, itemId/unit/itemSlot invalid etc.\n\n@param whichUnit Target unit.\n@param itemId Item's raw code identifier.\n@param itemSlot Slot number (zero-based, i.e. 0 to 5).\n\n\n@note See: `UnitAddItemById`.\n\n",
    UnitRemoveItem:
        "\nIf the target unit carries the item, it is removed from the inventory and dropped at unit's position.\n\nNothing happens if unit or item instance is invalid.\n\n@param whichUnit Target unit.\n@param whichItem Handle to item instance.\n\n\n@note See `UnitRemoveItemFromSlot` to drop an item from a specific slot.\n\n",
    UnitRemoveItemFromSlot:
        "\nIf an item exists in the given slot, it is removed from the inventory and dropped at unit's position.\n\nReturns the handle of dropped item when successful.\nReturns null on failure (no item, invalid slot/unit).\n\n@param whichUnit Target unit.\n@param itemSlot Slot number (zero-based, i.e. 0 to 5).\n\n\n@note See `UnitRemoveItem` to drop an item by handle.\n\n",
    UnitHasItem:
        "\nReturns true if unit has this specific instance of item somewhere in inventory.\nReturns false otherwise (null unit, item not found in inventory, null item etc).\n\n@param whichUnit Target unit.\n@param whichItem Handle to item instance.\n\n\n",
    UnitItemInSlot:
        "\nReturns a handle to item in slot number `itemSlot` of the specified unit.\n\nReturns null otherwise:\nwhen there's no item in slot, no slot (less than 6 slots), invalid slot number, invalid unit.\n\n@param whichUnit Target unit.\n@param itemSlot Slot number (zero-based, i.e. 0 to 5).\n\n\n",
    UnitInventorySize:
        "\nReturns amount of inventory slots for unit (0 to `bj_MAX_INVENTORY` inclusive).\nReturns zero if unit is invalid or has no inventory.\n\n@param whichUnit Target unit.\n\n\n",
    UnitDropItemPoint:
        "\nIssues an immediate order for the unit to go to point (x,y) and drop the item there.\n\nIf the unit cannot reach the point, it will run up to closest location and stop there,\nwithout dropping the item.\n\nReturns:\n\n- true if item was found in inventory of unit and an order was issued.\n- false if unit/item invalid, unit is paused and cannot take orders etc.\n\n@param whichUnit Target unit.\n@param whichItem Handle to item instance.\n@param x X map coordinate.\n@param y Y map coordinate.\n\n\n@note See: `UnitDropItemSlot`, `UnitDropItemTarget`.\n\n",
    UnitDropItemSlot:
        "\nMoves an item inside unit's inventory to specified slot.\nIf this slot contains an item, their positions are swapped.\n\nThis is the same as if you'd right-click an item in game to move it to a different slot.\n\nReturns:\n\n- true if the move was successful, even if moving an item to its current slot (no change)\n- false if unit/item invalid, item not in inventory, invalid item slot specified\n\n@param whichUnit Target unit.\n@param whichItem Handle to item instance.\n@param slot Move to this slot.\n\n\n",
    UnitDropItemTarget:
        "\nIssues an immediate order for the `whichUnit` to go to `target` (usually another unit)\nand give the item to target. If the target has no inventory slots/full inventory,\nthe item is dropped at target's feet.\n\nIf the `whichUnit` cannot reach the target, it will run up to closest location and stop there,\nwithout giving the item. If the target is a running unit, `whichUnit` will follow it\nto give the item.\n\nReturns:\n\n- true if item was found in inventory of `whichUnit` and an order was issued.\n- false if `whichUnit`/item/widget invalid, `whichUnit` is paused and cannot take orders etc.\nTarget widget can be a paused unit and will receive the item.\n\n@param whichUnit Target unit.\n@param whichItem Handle to item instance.\n@param target Target unit or widget.\n\n\n@note See: `UnitDropItemSlot`, `UnitDropItemPoint`.\n\n\n",
    UnitUseItem:
        "\nIssues an immediate order for the unit to use the specified item.\n\nThis is the same as left-clicking and using an item in inventory.\nUnits that cannot use items will not do anything.\n\nReturns:\n\n- true if item was successfully used / an order was issued\n- false otherwise, because an order was not issued:\nunit doesn't have item, item on cooldown, invalid unit/item etc.\n\nExamples:\n\n- Potion of Healing `'phea'`:\n    - Unit on patrol, but has full HP: does nothing, unit continues running\n    - Unit on patrol, but has low HP: Uses potion to restore HP, stops patrolling\n\n- Dagger of Escape `'desc'`:\nis not casted, because requires a position as a target.\nHowever, an order is issued, hence returns true.\n\n- Inferno Stone `'infs'`: same as with dagger above.\n\n\n@note See: `UnitUseItemPoint`, `UnitUseItemTarget`.\n\n\n",
    UnitUseItemPoint:
        "\nIssues an immediate order for the unit to use item pointed at position (x,y).\n\nThis is the same as left-clicking and using an item in inventory.\nUnits that cannot use items will not do anything.\n\nExamples:\n\n- Potion of Healing `'phea'`:\nRestores HP \n\n- Dagger of Escape `'desc'`:\nCasts immediately towards (x,y), even if too far, item on cooldown.\nDoes not cast if position is already reached (no cooldown).\n\n- Inferno Stone `'infs'`:\nruns towards (x,y) and once in range, casts to spawn an Infernal.\nIf already in range, casts immediately.\n\n@param whichUnit Target unit.\n@param whichItem Handle to item instance.\n@param x Point at X map coordinate to use the item.\n@param y Point at Y map coordinate to use the item.\n\n\n@bug Seems to always return false (tested v1.32.10).\n\n@note See: `UnitUseItem`, `UnitUseItemTarget`.\n\n\n",
    UnitUseItemTarget:
        "\nIssues an immediate order for the unit to use item pointed `target` (widget or unit).\n\nThis is the similar to left-clicking and using an item in inventory.\nUnits that cannot use items will not do anything.\n\nReturns:\n\n- true if item was successfully used / an order was issued\n- false otherwise, because an order was not issued:\nunit doesn't have item, item on cooldown, invalid unit/item/target etc.\n\nExamples:\n\n- Dagger of Escape `'desc'`: does not cast.\nExplanation: when you click a dagger on a building in game, the target is not\nactually the building, but the map position you're pointing at, even though you\nsee the building being highlighted on cursor hover.\n\n- Inferno Stone `'infs'`: does not cast, same as above.\n\n@param whichUnit Target unit.\n@param whichItem Handle to item instance.\n@param target Target unit or widget.\n\n\n@note See: `UnitUseItem`, `UnitUseItemPoint`.\n\n\n",
    GetUnitX:
        "\nReturns X map coordinate of whichUnit (alive or dead). Returns 0.0 if unit was removed or is null.\n\n\n@bug If the unit is loaded into a zeppelin this will not return the position\nof the zeppelin but the last position of the unit before it was loaded into\nthe zeppelin.\n\n@note Since unit extends from `widget`, you can use widget-related functions too.\nSee: `GetUnitY`, `BlzGetLocalUnitZ`, `BlzGetUnitZ`, `GetWidgetX`, `GetWidgetY`.\n\n",
    GetUnitY:
        "\nReturns Y map coordinate of whichUnit (alive or dead). Returns 0.0 if unit was removed or is null.\n\n\n@bug If the unit is loaded into a zeppelin this will not return the position\nof the zeppelin but the last position of the unit before it was loaded into\nthe zeppelin.\n\n@note Since unit extends from `widget`, you can use widget-related functions too.\nSee: `GetUnitX`, `BlzGetLocalUnitZ`, `BlzGetUnitZ`, GetWidgetX`, `GetWidgetY`.\n\n",
    GetUnitLoc:
        "\n\n\n@bug If the unit is loaded into a zeppelin this will not return the position\nof the zeppelin but the last position of the unit before it was loaded into\nthe zeppelin.\n\n",
    GetUnitFacing: "\nReturns the units facing in degrees.\n\n\n",
    GetUnitState:
        "\nReturns unit's current unit state as an absolute value.\n\n**Example:** Retrieve a unit's current/max HP and mana:\n\n    call GetUnitState(myUnit, UNIT_STATE_MAX_MANA) // returns 285.0\n\t\n\n@note See: `SetUnitState`.\n\n",
    GetOwningPlayer:
        "\nReturns the owner player of the unit.\n\n@param whichUnit Target unit.\n\n\n@note See: `SetUnitOwner`.\n\n",
    GetUnitName:
        '\nReturns localized name for unit.\n\n**Example (Lua)**:\n\n```{.lua}\nu = CreateUnit(Player(0), FourCC("hfoo"), -30, 0, 90)\nprint(GetUnitName(u)) --> "Footman"\n```\n\n@param whichUnit Target unit.\n\n@async \n\n',
    IsUnitType:
        "\n\n\n@note This native returns a boolean, which when typecasted to integer might\nbe greater than 1. It's probably implemented via a bitset.\n\n@note In past patches this native bugged when used in `conditionfunc`s.\nThe fix back then was to compare with true (`==true`).\nI cannot reproduce the faulty behaviour in patch 1.27 so this is only a note.\n\n",
    IsUnit: "\n\n\n@note Useless. Use operator== instead.\n@pure \n\n",
    IsUnitHidden:
        '\nReturns `true` if `whichUnit` is hidden, for example by means of `ShowUnit`.\n\n@note A comment in Blizzard.j, `ReplaceUnitBJ` states that it\'s "sometimes unsafe to remove hidden units",\nas a workaround it calls `KillUnit` right before `RemoveUnit`.\n',
    UnitAddAbility:
        "\nAdds the ability to target unit. Can be used to add an ability to any hero.\nThe added ability is level 1 and without a cooldown.\n\nReturns:\n\n- true if the addition was successful (hero did not have this ability before)\n- false otherwise (hero already has this ability)\n\n@param whichUnit Target unit.\n@param abilityId Abilities' raw code identifier.\n\n\n",
    UnitRemoveAbility:
        "\nRemoves the ability from target unit.\n\nReturns:\n\n- true if the removal was successful (hero did have this ability before)\n- false otherwise (hero does not have this ability)\n\n@param whichUnit Target unit.\n@param abilityId Abilities' raw code identifier.\n\n\n@bug Removing non-interrupt abilities like divine shile while they're being\ncast (at the EVENT_PLAYER_UNIT_SPELL_EFFECT point), and while the caster is\nmoving, will cause the caster to become unresponsive to new commands until\nthey reach their ordered move point. \n\n",
    UnitMakeAbilityPermanent: "\nThis native is used to keep abilities when morphing units.\n\n\n",
    UnitDamagePoint: "\n\n\n@bug Has been known to cause crashes in battle.net.\n\n",
    UnitDamageTarget:
        "\nDeals damage to target widget from a source unit.\n\n@param whichUnit The source of the damage. To actual deal damage it should be\nnot `null`.\n\n@param target The target being damaged.\n\n@param amount How much damage is being dealt.\n\n@param attack Consider the damage dealt as being an attack.\n\n@param ranged Consider the damage dealt as being from a ranged source.\n\n\n@note For some insight about the different configurations of the different\ntypes see [this post](http://www.wc3c.net/showpost.php?p=1030046&postcount=19).\n\n\n",
    IssuePointOrder:
        "\n@note If the order is to build a structure and the unit can build that structure in principle but the player lacks the resources for it, then the unit\nwill be pinged on the minimap in yellow for its owning player.\n\n@bug If the order is to build a structure, this function will return `false` even if the unit accepts the order.\n",
    IssuePointOrderLoc:
        "\n@note If the order is to build a structure and the unit can build that structure in principle but the player lacks the resources for it, then the unit\nwill be pinged on the minimap in yellow for its owning player.\n\n@bug If the order is to build a structure, this function will return `false` even if the unit accepts the order.\n",
    IssuePointOrderById:
        "\n@note If the order is to build a structure and the unit can build that structure in principle but the player lacks the resources for it, then the unit\nwill be pinged on the minimap in yellow for its owning player.\n\n@bug If the order is to build a structure, this function will return `false` even if the unit accepts the order.\n",
    IssuePointOrderByIdLoc:
        "\n@note If the order is to build a structure and the unit can build that structure in principle but the player lacks the resources for it, then the unit\nwill be pinged on the minimap in yellow for its owning player.\n\n@bug If the order is to build a structure, this function will return `false` even if the unit accepts the order.\n",
    IssueBuildOrder:
        "\n@note If the order is to build a structure and the unit can build that structure in principle but the player lacks the resources for it, then the unit\nwill be pinged on the minimap in yellow for its owning player.\n\n@bug If the order is to build a structure and the unit can build that structure in principle (and the spot is not blocked, either),\nthis function will still return `true` even if the player lacks the resources for it.\n",
    IssueBuildOrderById:
        "\n@note If the order is to build a structure and the unit can build that structure in principle but the player lacks the resources for it, then the unit\nwill be pinged on the minimap in yellow for its owning player.\n\n@bug If the order is to build a structure and the unit can build that structure in principle (and the spot is not blocked, either),\nthis function will still return `true` even if the player lacks the resources for it.\n",
    IssueNeutralImmediateOrderById: "\nCan be used to buy items and units at a shop.\n\n\n",
    SetResourceAmount:
        "\nSets the amount of available gold of a gold mine. The amount can be negative, which is practically the same as 0.\n\n@param whichUnit Change amount of this gold mine unit.\n\n@param amount The new gold amount.\n\n\n@bug If the final value, after adding a negative amount, will be less than zero, then it\nwill display the correct negative amount, but mining won't yield any gold.\nIf peasant enters a mine with 0 gold, it's destroyed and he stops next to mine.\nIf peasant enters a mine with <0 gold, it's destroyed and he runs back to the castle.\n\n@note See: `AddResourceAmount`, `GetResourceAmount`.\n\n",
    AddResourceAmount:
        "\nAdds the amount of available gold to a gold mine. The amount can be negative, which is practically the same as 0.\n\n@param whichUnit Add gold to this gold mine unit.\n\n@param amount The amount of gold to add to the unit.\n\n\n@note See `SetResourceAmount` for edge-case descriptions. Also: `SetResourceAmount`, `GetResourceAmount`.\n\n",
    GetResourceAmount:
        "\nReturns the amount of available gold in a gold mine. The amount can be negative, which is practically the same as 0.\n\n@param whichUnit Add gold to this gold mine unit.\n\n\n@note See `SetResourceAmount` for edge-case descriptions. Also: `SetResourceAmount`, `AddResourceAmount`.\n\n",
    AddItemToAllStock:
        "\nAdds an item of the type itemId with current stock of currentStock and max stock\nof stockMax to all shops in game.\n\n@param itemId The item to add to the stock.\n\n@param currentStock Determines the amount of that item in stock upon being added\nto the buildings.\n\n@param stockMax The item will grow in stock count up to the value of stockMax.\nThe rate at which the item grows in stock is determined by its stock replenish\ninterval, which can be modified in the object editor.\n\n@note Some issues with default Blizzard initialization and that function were met.\nSee <http://www.hiveworkshop.com/forums/l-715/a-251815/> for details.\n\n@note Adding an item which already is in stock for a building will replace it\nand refresh the interval and stock count.\n\n\n\n\n",
    AddItemToStock:
        "\nAdds an item of the type itemId with current stock of currentStock and max stock\nof stockMax to the specific shop whichUnit.\n\n\n@note Some issues with default Blizzard initialization and that function were met.\nSee <http://www.hiveworkshop.com/forums/l-715/a-251815/> for details.\n\n",
    SetUnitUserData:
        "\nSets a single custom integer for a unit.\n\n\n@note This value is not used by any standard mechanisms in Warcraft III nor\nin the blizzard.j, so it is free to be harnessed.\nBesides `GetHandleId`, this is an excellent possibility to assign a unique\ninteger id to a unit, which can serve as an index in other data structures.\n\n",
    Player: "\nReturns the instance of player based on ID number.\n\nThis function always returns the same instance, does not create new objects.\nIf used with invalid values (below 0 or above `GetBJMaxPlayerSlots`), returns null in Reforged, crashed on Classic.\n\n\n@note \nCommon.j: IDs start from 0, e.g. Player(0) is red, 1 is blue etc. -> `GetPlayerId`\nBlizzard.j (WorldEdit): IDs start with 1 -> `GetConvertedPlayerId`.\n\n@note See: `GetPlayerId`, `GetBJMaxPlayers`, `GetBJMaxPlayerSlots`, `GetPlayerNeutralPassive`, `GetPlayerNeutralAggressive`.\n\n@bug In old versions (which?) crashes the game if used with wrong values, that is values greather than 15\nor values lower than 0.\n\n@pure \n\n",
    GetLocalPlayer:
        "\nReturns reference to local player, as such it always points to yourself.\nEvery other player in the game gets their player respectively.\n\nDo not use this function until you understand it fully and know how to avoid desyncs!\nAlways test your map in LAN multiplayer after changing code around it.\n\nWarcraft 3 has the lock-step network/execution model.\nThis means the game simulation and code run on all players' computers with the exact same data at any point in time.\nLook at this example (Lua):\n    \n```{.lua}\nfunction whoami_command()\n    -- all players know who entered this command, equal value on every computer\n    local player_who_entered_command = GetTriggerPlayer()\n    -- this always points to you!\n    local myself = GetLocalPlayer() \n    \n    local command_player_name = GetPlayerName(player_who_entered_command)\n    local my_player_name = GetPlayerName(myself)\n    -- everybody will see this player's name\n    DisplayTextToForce(GetPlayersAll(), \"Player \".. command_player_name ..\" entered the whoami command!\")\n    -- everybody will see their own name!\n    DisplayTextToForce(GetPlayersAll(), \"But my name is: \".. my_player_name)\nend\n```\n\nThis function is always used when you want something only to happen to a certain player.\n**However if you aren't careful, you will cause a desync:** where one player's game state is different from everybody else!\nFor example, you can apply camera position locally, this is how `SetCameraPositionForPlayer` works (Jass):\n\n    if (GetLocalPlayer() == whichPlayer) then\n       // Use only local code (no net traffic) within this block to avoid desyncs.\n       call SetCameraPosition(x, y)\n    endif\n\nBasic rule: anything that's only visual (like unit color) will not desync... unless your code relies on the exact value later in the game:\n*if cameraX is 123 then ...* different players will have different camera positions here.\n\nOn the other hand, manipulating handles or creating units locally,\nchanging their health, attack, invisibility etc. - anything that changes the game will desync:\n\n    if (GetLocalPlayer() == whichPlayer) then\n       // INSTANTLY DESYNCS! The unit was only killed on one player's screen! Others think it's alive\n       call KillUnit(someUnit)\n    endif\n\n\n@async \n\n",
    GetPlayerRace:
        "\nReturns race of the player.\n\nThe handle is constant and does not change between invocations. (Lua, v1.32.10)\n",
    GetPlayerId:
        "\nReturns player ID of player (which starts with zero; e.g. player red is 0).\n\n@param whichPlayer Target player.\n\n\n@note For one-based WorldEdit-type IDs see: `GetConvertedPlayerId`. Also: `Player`.\n\n",
    GetPlayerHandicapReviveTime: "\n\n\n@patch 1.32\n\n",
    GetPlayerHandicapDamage: "\n\n\n@patch 1.32\n\n",
    SetPlayerHandicapReviveTime: "\n\n\n@patch 1.32\n\n",
    SetPlayerHandicapDamage: "\n\n\n@patch 1.32\n\n",
    AddPlayerTechResearched:
        "\nIn upgrades that have multiple levels, it will research the upgrade by the\nnumber of levels specified. (it adds the number of levels to the current\nresearch level, see `SetPlayerTechResearched` to set the research level).\n\n@param whichPlayer The player who the upgrade will be researched for.\n\n@param techid The four digit rawcode ID of the upgrade.\n\n@param levels The number of levels to add to the current research level of the upgrade.\n\n\n",
    GetPlayerTechCount:
        "\nGets the level of a tech of a player. This could be an upgrade, a unit type or an equivalent as selected in tech requirement fields.\nIn case of an upgrade, this would be the level of the upgrade the given player has and 0 if the player has not researched the upgrade at all.\nIn case of a unit type or an equivalent, it would be the amount of units of that type or which fulfill the equivalent condition for the given player.\n\n@param whichPlayer The player whose tech level to query.\n\n@param techid The id of the tech item. Either an upgrade like Iron Plating `'Rhar'`, a unit type like Footman `'hfoo'` or one of the following special equivalent ids:\n\n- `'HERO'` - any hero\n- `'TALT'` - any altar\n- `'TWN1'` - town hall tier 1\n- `'TWN2'` - town hall tier 2\n- `'TWN3'` - town hall tier 3\n- `'TWN4'` - town hall tier 4\n- `'TWN5'` - town hall tier 5\n- `'TWN6'` - town hall tier 6\n- `'TWN7'` - town hall tier 7\n- `'TWN8'` - town hall tier 8\n- `'TWN9'` - town hall tier 9\n\n@param specificonly When this is false, it will consider some additional dependencies between the techs:\nWhen specificonly is false, the Human Guard Tower 'hgtw' will also be considered when querying for the Scout Tower `'hwtw'` (even if the Guard Tower is preplaced, i.e. not doing the upgrade on runtime, so this checks the Teechtree - Upgrades To `'uupt'` field?).\nHigher tier townhalls will be considered when querying for lower tier hownhalls, i.e. querying for Great Hall `'ogre'` will also consider Stronghold `'ostr'` and Fortress `'ofrt'` when specificonly is false.\nAbility morph does not seem to be considered when specificonly is false, tested with Berserker Upgrade of Headhunter.\nTechtree - Dependency Equivalents `'udep'` seems to be considered even if specificonly is true, i.e. when you set Scout Tower as an equivalent for Farm `'hhou'`, querying for `'hhou'` will also consider Scout Towers.\n\n\n",
    CripplePlayer:
        "\nReveals a player's remaining buildings to a force. The black mask over the\nbuildings will be removed as if the territory had been discovered.\n\n@param whichPlayer The player to reveal.\n\n@param toWhichPlayers The players who will see whichPlayer's buildings.\n\n@param flag If true, the buildings will be revealed. If false, the buildings\nwill not be revealed. Note that if you set it to false, it will not hide the buildings with a black mask.\n\n@note his function will not check whether the player has a town hall before revealing.\n\n\n",
    CachePlayerHeroData:
        "\nUsed to store hero level data for the scorescreen, before units are moved\nto neutral passive in melee games.\n\n@param whichPlayer The player to store hero data for.\n\n\n",
    SetFogStateRect:
        "\nSets target player's fog of war data in the specified rectangle.\n\nIndividual player's fog state is a reflection of player's map exploration progress:\nwhich areas were explored or still hidden; which are fogged (not visible); which are\nvisible. What is visible in game is a combination of personal fog state & fog modifiers.\n\n@param forWhichPlayer Target player.\n@param whichState Change fog to this type. See `fogstate` for type explanation.\n@param where Target rectangle area.\n@param useSharedVision If true, apply new state to player and whoever player shares their vision.\nIf false, apply only to player themself.\n\n\n",
    SetFogStateRadius:
        "\nSets target player's fog of war data in the specified circle area.\n\nIndividual player's fog state is a reflection of player's map exploration progress:\nwhich areas were explored or still hidden; which are fogged (not visible); which are\nvisible. What is visible in game is a combination of personal fog state & fog modifiers.\n\n@param forWhichPlayer Target player.\n@param whichState Change fog to this type. See `fogstate` for type explanation.\n@param centerx X-coordinate of the circle center.\n@param centerY Y-coordinate of the circle center.\n@param radius Circle's radius (from center to its edge).\n@param useSharedVision If true, apply new state to player and whoever player shares their vision.\nIf false, apply only to player themself.\n\n\n",
    SetFogStateRadiusLoc:
        "\nSets target player's fog of war data in the specified circle area.\n\nIndividual player's fog state is a reflection of player's map exploration progress:\nwhich areas were explored or still hidden; which are fogged (not visible); which are\nvisible. What is visible in game is a combination of personal fog state & fog modifiers.\n\n@param forWhichPlayer Target player.\n@param whichState Change fog to this type. See `fogstate` for type explanation.\n@param center Location describing the center of the circle.\n@param radius Circle's radius (from center to its edge).\n@param useSharedVision If true, apply new state to player and whoever player shares their vision.\nIf false, apply only to player themself.\n\n\n",
    FogMaskEnable:
        '\nToggles global FOW masking of unexplored areas.\n\nAn individual player\'s fog state is not modified, that means this toggle is fully\nreversible.\n\n@param enable True: unexplored areas are masked.\n\nFalse: unexplored areas are not masked (whether visible depends on `IsFogEnabled`).\n\n\n@note See: `IsFogMaskEnabled`, `IsFogEnabled`. "Fog mask" is explained in `fogstate`.\n\n',
    IsFogMaskEnabled:
        '\nReturns whether global FOW masking is in effect.\n\nTrue: unexplored areas are globally masked.\n\nFalse: unexplored areas are not globally masked (whether visible depends on `IsFogEnabled`).\n\n\n@note See: `FogMaskEnable`, `FogEnable`. "Fog mask" is explained in `fogstate`.\n\n',
    FogEnable:
        '\nToggles global FOW fogging of explored yet not visible areas.\n\nAn individual player\'s fog state is not modified, that means this toggle is fully\nreversible.\n\nTrue: explored areas are fogged if not in sight.\n\nFalse: explored areas remain permanently visible.\n\n\n@note See: `IsFogEnabled`, `IsFogMaskEnabled`. "Fog" is explained in `fogstate`.\n\n',
    IsFogEnabled:
        '\nToggles global FOW fogging of explored yet not visible areas.\n\nTrue: explored areas are fogged if not in sight.\n\nFalse: explored areas remain permanently visible.\n\n\n@note See: `FogEnable`, `FogMaskEnable`. "Fog" is explained in `fogstate`.\n\n',
    CreateFogModifierRect:
        '\nCreates an object that overrides the fog in a rect for a specific player.\n\nA fog modifier is disabled by default, use `FogModifierStart` to enable.\n\nThis creates a new object with a handle and must be removed to avoid leaks: `DestroyFogModifier`.\n\n@param whichState Determines what type of fog the area is being modified to. See `fogstate` for type explanation.\n\n@param where The rect where the fog is.\n\n@param useSharedVision Apply modifier to target\'s allied players with shared vision?\n\n@param afterUnits Will determine whether or not units in that area will be masked by the fog. If it is set to true and the fogstate is masked, it will hide all the units in the fog modifier\'s radius and mask the area. If set to false, it will only mask the areas that are not visible to the units.\n\n\n@bug (v1.32.10) Just by creating a modifier of type `FOG_OF_WAR_FOGGED` or\n`FOG_OF_WAR_VISIBLE`, this will modify the player\'s global fog state before it is\nenabled. "VISIBLE" will instantly become "FOGGED" and "FOGGED" will cause unexplored\nareas to become explored. You can workaround this by using e.g. `SetFogStateRect`\nafter fog modifier creation.\n\n',
    CreateFogModifierRadius:
        '\nCreates an object that overrides the fog in a circular radius for a specific player.\n\nA fog modifier is disabled by default, use `FogModifierStart` to enable.\n\nThis creates a new object with a handle and must be removed to avoid leaks: `DestroyFogModifier`.\n\n@param whichState Determines what type of fog the area is being modified to. See `fogstate` for type explanation.\n\n@param centerx The x-coordinate where the fog modifier begins.\n\n@param centerY The y-coordinate where the fog modifier begins.\n\n@param radius Determines the extent that the fog travels (expanding from the coordinates ( centerx , centery )).\n\n@param useSharedVision Apply modifier to target\'s allied players with shared vision?\n\n@param afterUnits Will determine whether or not units in that area will be masked by the fog. If it is set to true and the `fogstate` is masked, it will hide all the units in the fog modifier\'s radius and mask the area. If set to false, it will only mask the areas that are not visible to the units.\n\n\n@bug (v1.32.10) Just by creating a modifier of type `FOG_OF_WAR_FOGGED` or\n`FOG_OF_WAR_VISIBLE`, this will modify the player\'s global fog state before it is\nenabled. "VISIBLE" will instantly become "FOGGED" and "FOGGED" will cause unexplored\nareas to become explored. You can workaround this by using e.g. `SetFogStateRect`\nafter fog modifier creation.\n\n',
    CreateFogModifierRadiusLoc:
        '\nCreates an object that overrides the fog in a circular radius for a specific player.\n\nA fog modifier is disabled by default, use `FogModifierStart` to enable.\n\nThis creates a new object with a handle and must be removed to avoid leaks: `DestroyFogModifier`.\n\n@param whichState Determines what type of fog the area is being modified to. See `fogstate` for type explanation.\n\n@param center The location where the fog modifier begins.\n\n@param radius Determines the extent that the fog travels (expanding from the location `center`).\n\n@param useSharedVision Apply modifier to target\'s allied players with shared vision?\n\n@param afterUnits Will determine whether or not units in that area will be masked by the fog. If it is set to true and the `fogstate` is masked, it will hide all the units in the fog modifier\'s radius and mask the area. If set to false, it will only mask the areas that are not visible to the units.\n\n\n@bug (v1.32.10) Just by creating a modifier of type `FOG_OF_WAR_FOGGED` or\n`FOG_OF_WAR_VISIBLE`, this will modify the player\'s global fog state before it is\nenabled. "VISIBLE" will instantly become "FOGGED" and "FOGGED" will cause unexplored\nareas to become explored. You can workaround this by using e.g. `SetFogStateRect`\nafter fog modifier creation.\n\n',
    DestroyFogModifier: "\nDestroys the fog modifier object and removes its effect.\n\n\n",
    FogModifierStart:
        "\nEnable the effect of the modifier. While enabled, it will override the player's\nregular fog state.\n\n\n",
    FogModifierStop:
        "\nDisable the effect of the modifier. Once disabled the player's visibility\nwill return to player's regular fog state.\n\n\n",
    ChangeLevel:
        "\nLoads the next level for all players. Note that this function is asynchronous,\nso each player will be sent to their own map. If the boolean is set to true,\nthe score screen will appear before the user progresses to the next level.\n\n@param newLevel The path of the next level. The path is relative to the Warcraft III folder.\n\n@param doScoreScreen If set to true, the score screen will appear before the user progresses to the next level.\n\n\n",
    SetCampaignMenuRace: "\n\n\n@note Deprecated. Use SetCampaignMenuRaceEx instead.\n\n",
    LoadGame:
        "\n\n\n@bug The filename seems to have some limitations:\n\n- No underscores in campaign names.\n- Shorter file names for savegames.\n- Probably no dots in savegames or campaign names.\n\nFor more info see <http://www.hiveworkshop.com/threads/map-transition-does-not-work-when-loading-a-custom-savegame.286927/>.\n\n",
    SetMaxCheckpointSaves: "\n\n\n@patch 1.32\n\n",
    SaveGameCheckpoint: "\n\n\n@patch 1.32\n\n",
    DialogCreate:
        '\nCreates a new dialog. It is empty and hidden by default.\n\nSince this creates an object and returns a handle, it must be freed when no longer needed\nwith `DialogDestroy`.\n\nAn empty dialog must be populated with buttons\n(`DialogSetMessage`, `DialogAddButton`, `DialogAddQuitButton`)\nand finally displayed with `DialogDisplay`.\n\n\n@note While a dialog is open, the player can only interact with the dialog.\nEverything else is disabled.\n\nAn empty dialog completely blocks all player input (except multiboard interaction and\nprobably other scripted custom elements). A player can only exit the game with Alt+F4.\n\n@bug The top-bar menu buttons are greyed out when a dialog is shown. If the player presses\nAlt+F4 and then clicks "Cancel", the menu buttons become visible and clickable but do nothing.\n\n',
    DialogDestroy:
        "\nDestroys the dialog and frees the handle.\n\nDue to a bug, you must first hide the dialog for all players (who have it open).\n\n\n@bug If you destroy a dialog that is still shown, it will no longer show **but**\nthe player who had it open will be unable to interact with the game. Everything will be still\ndisabled, all menus and units unclickable.\n\n",
    DialogClear:
        "\nCompletely clears the dialog, its title and buttons, even if it is already open.\n\nYou must hide the dialog first, else the player will need to quit the game,\nbecause they will be unable to click anything or send a chat message.\n\n@param whichDialog Target dialog to clear.\n\n\n",
    DialogSetMessage:
        "\nSets the menu title.\n\n@param whichDialog Target dialog.\n@param messageText New title.\n\n@note If the dialog is not set (empty string), then no vertical space is reserved for it.\nThe buttons start at the very top.\n\n@note The new message shows up instantly, even when the menu is already open.\n@note Unlike with buttons, if the message is too long it overflows to the left and right beyond the\nscreen edges (it is centered).\n\n\n",
    DialogAddButton:
        "\nCreates a menu button and returns a handle to it.\n\nYou must save the button handle to later compare it to the selected button in\na `EVENT_DIALOG_BUTTON_CLICK` using `GetClickedButton` and `GetClickedDialog`.\n\nNew buttons are added to the bottom of the menu.\n\n@param whichDialog Target dialog to add the button to.\n@param buttonText Custom text.\n@param hotkey Integer value of the ASCII upper-case character for the hotkey.\nExample: \"F\" = 70.\n\n@note If the menu is already open, you must refresh the menu with `DialogDisplay`\nto show new buttons.\n\n@note **Line-width:** With the default font (v1.32.10) there's just enough space to display\n`Yo dawg I put this text in here.` or 19 full-width characters like \"@\" (at character).\nIf longer, the text becomes multi-line, up to 3 lines max.\nIf longer than 3 full lines, the rest of string is not shown.\n\n@note **Hotkey (uppercase):**\nWhen adding a hotkey use the uppercase, e.g. `'F'` instead of `'f'` as it\ndoes not work with lowercased keys. The button still gets triggered when the player\npresses a lowercased letter.\n\n@note **Duplicated hotkeys**: When multiple buttons have the same hotkey, the last button has priority.\n\n@note **Hotkeys are layout-dependent.**\n\nIn other words, the English QWERTY, the German QWERTZ and the French AZERTY layouts etc. will have some\nkeyboard keys on different physical buttons, based on user's currently enabled layout.\n\nThe Russian keyboard layout adheres to QWERTY (as an example of a non-latin layout).\n\n@note Hotkeys like \"@\" (ASCII 64) don't work (or maybe they have a different integer value).\nOn a QWERTY layout you need to press SHIFT+2 to enter \"@\".\n\n@note You can add up to 12 working buttons.\n\n@bug \nThe 13th button will still render correctly, but not work when clicked/hotkey is used.\nThe 14th button will render outside the dialog border background.\nThe 15th button will render outside the visible area (you'll see a few pixels of it at the bottom).\n\n\n",
    DialogAddQuitButton:
        '\nCreates a menu button that will exit the game for the player who clicks it.\nReturns a handle of button.\n\nSee the detailed description in `DialogAddButton`.\n\n@param whichDialog Target dialog to add the button to.\n@param doScoreScreen When a button with `true` is pressed, you quit the map and see the end game leaderboards.\n\nWhen a button with `false` is pressed, you quit the map to game\'s main menu.\n\n@param buttonText Custom text.\n@param hotkey Integer value of the ASCII upper-case character for the hotkey.\nExample: "F" = 70.\n\n\n',
    DialogDisplay:
        "\nOpen/close the dialog for the target player.\n\nSince the dialogs are created for all players, they are hidden by default. Then you display the\ndialog to players who should see and interact with it.\n\n@param whichPlayer Target player to whom to show the dialog.\n@param whichDialog Target dialog.\n@param flag `true` to show (or refresh), `false` to hide.\n\n@note Technically, because every player knows about each dialog,\ncheaters could interact with dialogs that are invisible to them.\n\n@note Dialogs can not be shown at map-init. Use a wait or a zero-timer to\ndisplay it as soon as possible.\n\n\n",
    InitGameCache:
        "\n\n\n@note You cannot create more than 255 gamecaches.\nIn multiplayer the existing game caches are not considered, so you can get a\nfull 255 new game caches.\n\nIn singleplayer, when you call `InitGameCache`, it looks in the Campaigns.w3v\nfile if a `gamecache` with that name already exists, if yes, it will create a\n`gamecache` handle (you can get multiple handles for the same game cache, and\nthat will only count once to the 255 limit in the current game), if no and it\ndoes not exist yet in the current game either, it will take a new slot among\nthe 255.\n\n",
    StoreUnit:
        "\nStores a description of a unit in a game cache that can be retrieved with `RestoreUnit`.\n\nThe saved attributes of the unit are (non-exhaustive): unit id, experience, hero level, unused skill points, hero proper name (index),\nstrength/agility/intelligence, attack speed/move speed increments from agility, life, mana and attack damage increments\n(can be adjusted individually using tome abilities), sight range (day) (can be adjusted with `UNIT_RF_SIGHT_RADIUS`), armor increment\n\nDescriptions of the items in the unit's inventory will also be saved (non-exhaustive): item id, charges, flags: drop upon death, perishable,\ninvulnerable, pawnable, used on acquire (powerup), droppable, actively used\n\nDescriptions of the unit's hero abilities will also be saved: ability id, current level\n\nSee also the unit entry in the following Kaitai Struct file describing the w3v format (gamecaches file): https://github.com/WaterKnight/Warcraft3-Formats-KaitaiStruct/blob/main/w3-w3v.ksy\n\n\n@bug When a unit obtains armor from a research and is then stored in a game cache, restoring it will retain the armor increment without the research, so if\nthe research is done again, the unit will benefit doubly.\n\n@bug If a hero unit was stored under some key pair and later the key pair is overwritten with a non-hero unit, the previous hero attributes will not\nbe overwritten, i.e., they will remain and be merged with the non-hero attributes. This can be observed in the persisted .w3v file. Ingame, it\nwould not make a difference because the restored non-hero unit normally would not use the hero attributes.\n\n",
    SyncStoredInteger:
        '\nSynchronizes the value stored in the `gamecache` under the mission key and key.\nCalling this function sends a sync packet from each player in the calling\ncontext (citation needed), that is everybody sends a packet to everybody.\nThe game then picks the first packet arrived (at the host). Often (but not\nalways) that is the packet coming from the game host.\n\nMore interesting perhaps is the use to synchronize local data (like a player\'s\ncamera position) to all other players. To do this only store and sync the value\nin a local context:\n\n```\nif GetLocalPlayer() == p then\n    call StoreInteger(my_cache, "missionkey", "key", my_value)\n    call SyncStoredInteger(my_cache, "missionkey", "key")\nendif\n```\n\nNow this will synchronize the local value `my_value` to each player but we don\'t\nknow when each player has actually received it. You can use `TriggerSyncReady`\nto wait for each sync action, but it\'s not recommended as it is very slow and\ncan hang for minutes (cf. [sync doc](https://www.hiveworkshop.com/pastebin/1ce4fe042832e6bd7d06697a43055373.5801))\nInstead it is recommended to use a rapid timer to check if the key is present\nin the gamecache. Note that this is still a local operation as different players\ncan receive the sync at different times. If a player has received all the data\nyou synchronize the fact that that player has got all the data. This is\nreasonably done via `SelectUnit` and\n`TriggerRegisterPlayerUnitEvent(trig, p, EVENT_PLAYER_UNIT_SELECTED, null)`.\nNow once the last player has sent their selection event you have synchronized\nyour data.\n\nThis is a very high-level overview and the process has many edges to look out\nfor, so it\'s probably a good idea to use an already made system like\n[this one](https://www.hiveworkshop.com/threads/sync-game-cache.279148/).\n\n\n@note You might rather use `BlzSendSyncData` if possible.\n\n@note Calling multiple `SyncStoredX` in a row will keep their order in the\nsyncing process, i.e. first sync will be received first (FIFO).\n\n',
    SyncStoredReal:
        "\nSynchronizes the value stored in the `gamecache` under the mission key and key.\nSee `SyncStoredInteger` for a more in-depth explanation.\n\n\n",
    SyncStoredBoolean:
        "\nSynchronizes the value stored in the `gamecache` under the mission key and key.\nSee `SyncStoredInteger` for a more in-depth explanation.\n\n\n",
    SyncStoredString: "\n\n\n@bug Does not seem to work.\n\n",
    GetStoredInteger: "\nReturns `0` if the specified value's data is not found in the cache.\n\n\n",
    GetStoredReal: "\nReturns `0.0` if the specified value's data is not found in the cache.\n\n\n",
    GetStoredBoolean: "\nReturns `false` if the specified value's data is not found in the cache.\n\n\n",
    GetStoredString: '\nReturns `""` if the specified value\'s data is not found in the cache.\n\n\n',
    RestoreUnit: "\nReturns `null` if the specified value's data is not found in the cache.\n\n\n",
    InitHashtable: "\n\n\n@note You cannot create more than 255 hashtables.\n@patch 1.24\n\n",
    SaveInteger: "\n\n\n@patch 1.24\n\n",
    SaveReal: "\n\n\n@patch 1.24\n\n",
    SaveBoolean: "\n\n\n@patch 1.24\n\n",
    SaveStr: "\n\n\n@patch 1.24\n\n",
    SavePlayerHandle: "\n\n\n@patch 1.24\n\n",
    SaveWidgetHandle: "\n\n\n@patch 1.24\n\n",
    SaveDestructableHandle: "\n\n\n@patch 1.24\n\n",
    SaveItemHandle: "\n\n\n@patch 1.24\n\n",
    SaveUnitHandle: "\n\n\n@patch 1.24\n\n",
    SaveAbilityHandle: "\n\n\n@patch 1.24\n\n",
    SaveTimerHandle: "\n\n\n@patch 1.24\n\n",
    SaveTriggerHandle: "\n\n\n@patch 1.24\n\n",
    SaveTriggerConditionHandle: "\n\n\n@patch 1.24\n\n",
    SaveTriggerActionHandle: "\n\n\n@patch 1.24\n\n",
    SaveTriggerEventHandle: "\n\n\n@patch 1.24\n\n",
    SaveForceHandle: "\n\n\n@patch 1.24\n\n",
    SaveGroupHandle: "\n\n\n@patch 1.24\n\n",
    SaveLocationHandle: "\n\n\n@patch 1.24\n\n",
    SaveRectHandle: "\n\n\n@patch 1.24\n\n",
    SaveBooleanExprHandle: "\n\n\n@patch 1.24\n\n",
    SaveSoundHandle: "\n\n\n@patch 1.24\n\n",
    SaveEffectHandle: "\n\n\n@patch 1.24\n\n",
    SaveUnitPoolHandle: "\n\n\n@patch 1.24\n\n",
    SaveItemPoolHandle: "\n\n\n@patch 1.24\n\n",
    SaveQuestHandle: "\n\n\n@patch 1.24\n\n",
    SaveQuestItemHandle: "\n\n\n@patch 1.24\n\n",
    SaveDefeatConditionHandle: "\n\n\n@patch 1.24\n\n",
    SaveTimerDialogHandle: "\n\n\n@patch 1.24\n\n",
    SaveLeaderboardHandle: "\n\n\n@patch 1.24\n\n",
    SaveMultiboardHandle: "\n\n\n@patch 1.24\n\n",
    SaveMultiboardItemHandle: "\n\n\n@patch 1.24\n\n",
    SaveTrackableHandle: "\n\n\n@patch 1.24\n\n",
    SaveDialogHandle: "\n\n\n@patch 1.24\n\n",
    SaveButtonHandle: "\n\n\n@patch 1.24\n\n",
    SaveTextTagHandle: "\n\n\n@patch 1.24\n\n",
    SaveLightningHandle: "\n\n\n@patch 1.24\n\n",
    SaveImageHandle: "\n\n\n@patch 1.24\n\n",
    SaveUbersplatHandle: "\n\n\n@patch 1.24\n\n",
    SaveRegionHandle: "\n\n\n@patch 1.24\n\n",
    SaveFogStateHandle: "\n\n\n@patch 1.24\n\n",
    SaveFogModifierHandle: "\n\n\n@patch 1.24\n\n",
    SaveAgentHandle: "\n\n\n@patch 1.24b\n\n",
    SaveHashtableHandle: "\n\n\n@patch 1.24b\n\n",
    SaveFrameHandle: "\n\n\n@patch 1.31\n\n",
    LoadInteger: "\n\n\n@patch 1.24\n\n",
    LoadReal: "\n\n\n@patch 1.24\n\n",
    LoadBoolean: "\n\n\n@patch 1.24\n\n",
    LoadStr: "\n\n\n@patch 1.24\n\n",
    LoadPlayerHandle: "\n\n\n@patch 1.24\n\n",
    LoadWidgetHandle: "\n\n\n@patch 1.24\n\n",
    LoadDestructableHandle: "\n\n\n@patch 1.24\n\n",
    LoadItemHandle: "\n\n\n@patch 1.24\n\n",
    LoadUnitHandle: "\n\n\n@patch 1.24\n\n",
    LoadAbilityHandle: "\n\n\n@patch 1.24\n\n",
    LoadTimerHandle: "\n\n\n@patch 1.24\n\n",
    LoadTriggerHandle: "\n\n\n@patch 1.24\n\n",
    LoadTriggerConditionHandle: "\n\n\n@patch 1.24\n\n",
    LoadTriggerActionHandle: "\n\n\n@patch 1.24\n\n",
    LoadTriggerEventHandle: "\n\n\n@patch 1.24\n\n",
    LoadForceHandle: "\n\n\n@patch 1.24\n\n",
    LoadGroupHandle: "\n\n\n@patch 1.24\n\n",
    LoadLocationHandle: "\n\n\n@patch 1.24\n\n",
    LoadRectHandle: "\n\n\n@patch 1.24\n\n",
    LoadBooleanExprHandle: "\n\n\n@patch 1.24\n\n",
    LoadSoundHandle: "\n\n\n@patch 1.24\n\n",
    LoadEffectHandle: "\n\n\n@patch 1.24\n\n",
    LoadUnitPoolHandle: "\n\n\n@patch 1.24\n\n",
    LoadItemPoolHandle: "\n\n\n@patch 1.24\n\n",
    LoadQuestHandle: "\n\n\n@patch 1.24\n\n",
    LoadQuestItemHandle: "\n\n\n@patch 1.24\n\n",
    LoadDefeatConditionHandle: "\n\n\n@patch 1.24\n\n",
    LoadTimerDialogHandle: "\n\n\n@patch 1.24\n\n",
    LoadLeaderboardHandle: "\n\n\n@patch 1.24\n\n",
    LoadMultiboardHandle: "\n\n\n@patch 1.24\n\n",
    LoadMultiboardItemHandle: "\n\n\n@patch 1.24\n\n",
    LoadTrackableHandle: "\n\n\n@patch 1.24\n\n",
    LoadDialogHandle: "\n\n\n@patch 1.24\n\n",
    LoadButtonHandle: "\n\n\n@patch 1.24\n\n",
    LoadTextTagHandle: "\n\n\n@patch 1.24\n\n",
    LoadLightningHandle: "\n\n\n@patch 1.24\n\n",
    LoadImageHandle: "\n\n\n@patch 1.24\n\n",
    LoadUbersplatHandle: "\n\n\n@patch 1.24\n\n",
    LoadRegionHandle: "\n\n\n@patch 1.24\n\n",
    LoadFogStateHandle: "\n\n\n@patch 1.24\n\n",
    LoadFogModifierHandle: "\n\n\n@patch 1.24\n\n",
    LoadHashtableHandle: "\n\n\n@patch 1.24\n\n",
    LoadFrameHandle: "\n\n\n@patch 1.31\n\n",
    HaveSavedInteger: "\n\n\n@patch 1.24\n\n",
    HaveSavedReal: "\n\n\n@patch 1.24\n\n",
    HaveSavedBoolean: "\n\n\n@patch 1.24\n\n",
    HaveSavedString: "\n\n\n@patch 1.24\n\n",
    HaveSavedHandle: "\n\n\n@patch 1.24\n\n",
    RemoveSavedInteger: "\n\n\n@patch 1.24\n\n",
    RemoveSavedReal: "\n\n\n@patch 1.24\n\n",
    RemoveSavedBoolean: "\n\n\n@patch 1.24\n\n",
    RemoveSavedString: "\n\n\n@patch 1.24\n\n",
    RemoveSavedHandle: "\n\n\n@patch 1.24\n\n",
    FlushParentHashtable: "\n\n\n@patch 1.24\n\n",
    FlushChildHashtable: "\n\n\n@patch 1.24\n\n",
    GetRandomInt:
        "\nReturns a random integer in the range [lowBound, highBound] (inclusive).\nBounds may be negative, but should be lowBound <= highBound.\nWhen lowBound==highBound, always returns that number.\n\n@param lowBound The inclusive lower bound of the random number returned.\n\n@param highBound The inclusive higher bound of the random number returned.\n\n\n@note If lowBound > highBound then it just swaps the values.\n\n@bug If you call `GetRandomInt(INT_MIN, INT_MAX)` or `GetRandomInt(INT_MAX, INT_MIN)`\nit will always return the same value, namely `INT_MIN` or `INT_MAX`.\n\n@note See <http://hiveworkshop.com/threads/random.286109#post-3073222> for an overview of the algorithm used.\n\n@note **Desyncs!** The random number generator is a global, shared resource.\nDo not change its state in local blocks asynchronously.\n\n@note See: `GetRandomReal`, `SetRandomSeed`.\n\n",
    GetRandomReal:
        '\nReturns a real in range [lowBound, highBound) that is: inclusive, exclusive.\nBounds may be negative, but must be lowBound <= highBound. When lowBound==highBound, always returns that number.\n\n**Example (Lua):**\n\n\tSetRandomSeed(1229611)\n\tstring.format("%.16f", GetRandomReal(0, 0.002)) == "0.00"\n\tSetRandomSeed(1229611)\n\tstring.format("%.16f", GetRandomReal(-0.002, 0)) == "-0.002"\n\t\n\n@note **Desyncs!** The random number generator is a global, shared resource. Do not change its state in local blocks asynchronously.\n\n@note Undefined behavior when lowBound > highBound. Test code:\n\n\t-- Set seed to zero and then generate and print a random real\n\tfunction testRReal(low, high) SetRandomSeed(0); return string.format("%.16f", GetRandomReal(low,high)) end\n\ttestRReal(-42, 42) == "-4.0800933837890625"\n\ttestRReal(42, -42) == "79.9199066162109375"\n\n@note See: `GetRandomInt`, `SetRandomSeed`.\n\n',
    CreateItemPool:
        "\nCreates an empty itempool handle.\n\nItem pools are initially empty, but can have item-types added\nto them via `ItemPoolAddItemType`. Item pools only serve for random item\nplacing, via `PlaceRandomItem`.\n\n\n",
    ItemPoolAddItemType:
        "\nAdds an item-id to the itempool.\n\n@param whichItemPool The itempool to add the item to.\n\n@param itemId The rawcode of the item.\nAn invalid itemId (like 0) can be added & rolled.\n\n@param weight The weight of the item.\nThe weight determines how likely it is for the item to be chose by `PlaceRandomItem`.\n\n\n",
    PlaceRandomItem:
        "\nDraws a random itemid from the itempool and creates the item.\n\n@param whichItemPool The itempool to draw from.\n\n@param x The x-coordinate of the item.\n\n@param y The y-coordinate of the item.\n\n\n",
    ChooseRandomCreep:
        "\nReturns the rawcode ID of a random unit of the specified level. The unit chosen\nwill come from the set of units that include or are assigned to the base tileset\nof the map. Passing a level of -1 is equivalent to picking a creep of any level.\nIf there are no units of the specified level, the returned value is 0.\n\n@param level The level of the units to choose from.\n\n\n",
    ChooseRandomNPBuilding:
        '\nReturns the rawcode ID of a random neutral passive building,\nsuch as the buildings "Goblin Merchant" or "Tavern".\n\n\n@note The building returned is not necessarily on the map already.\n\n',
    ChooseRandomItem:
        "\nReturns the rawcode ID of a random item of the specified level. Passing a level\nof -1 will return an item of any level. If there are no items of the specified\nlevel, the id returned will be 0.\n\n@param level The level of the items to choose from. Passing a level of -1 is equivalent to any level.\n\n\n@note The item returned is not chosen from preplaced items on the map, but rather any item of that level.\n\n",
    ChooseRandomItemEx:
        "\nReturns the rawcode ID of a random item of the specified level and item type.\nPassing a level of -1 will return an item of any level. If there are no items\nof the specified level, the id returned will be 0.\n\n@param whichType The classification of items to choose from.\n\n@param level The level of the items to choose from. Passing a level of -1 is equivalent to any level.\n\n\n@note The item returned is not chosen from preplaced items on the map, but rather any item of that level.\n\n",
    SetRandomSeed:
        "\nSets the internal [PRNG's](https://en.wikipedia.org/wiki/Pseudorandom_number_generator) seed.\n\nUseful for testing or when you want a repeatable outcome. WorldEdit has an option to run test maps with a fixed seed, you can achieve the same result with this.\n\n**Example:**\n\n\tSetRandomSeed(42)\n\tGetRandomInt(0, 18) == 12\n\tGetRandomInt(0, 18) == 2\n\tSetRandomSeed(42)\n\tGetRandomInt(0, 18) == 12\n\t\n@param seed New seed for the PRNG.\n\n@note **Desyncs!** The random number generator is a global, shared resource. Do not change its state in local blocks asynchronously.\n\n@note See: `GetRandomInt`, `GetRandomReal`.\n\n\n",
    SetTerrainFog: "\n\n\n@bug Does nothing (unknown, unused).\n\n",
    SetUnitFog: "\nUnknown, unused.\n\n\n",
    DisplayTextToPlayer:
        "\nDisplays a trigger message to player.\n\nThe text line fades out in the end.\n\n@param toPlayer target player\n@param x new text box position (default is 0, clamped to: 0.0-1.0)\n@param y new text box position (default is 0, clamped to: 0.0-1.0)\n@param message text (supports color codes)\n\n@bug Changing x or y moves the entire text box, including previously displayed lines.\nAn example is shown at \n[Luashine/DisplayTextToPlayer-position](https://github.com/Luashine/wc3-test-maps/blob/master/DisplayTextToPlayer-position/DisplayTextToPlayer-position.md)\n\n@note The text lines are bottom-left aligned: text continues to the right and new lines\ncontinue upwards.\n\n@note This is equivalent to `DisplayTimedTextToPlayer` with `duration` set to 4.\n\n@note See: `DisplayTimedTextToPlayer`, `DisplayTimedTextFromPlayer`, `BlzDisplayChatMessage`.\n\n\n",
    DisplayTimedTextToPlayer:
        "\nDisplays a trigger message to player with a custom display duration.\n\nThe text line fades out in the end.\n\n@param toPlayer target player\n@param x new text box position (default is 0, clamped to: 0.0-1.0)\n@param y new text box position (default is 0, clamped to: 0.0-1.0)\n@param duration text lifetime in seconds\n@param message text (supports color codes)\n\n@note See: `DisplayTextToPlayer` for the full description.\nAlso: `DisplayTimedTextFromPlayer`, `BlzDisplayChatMessage`.\n\n\n",
    DisplayTimedTextFromPlayer:
        '\nDisplays a trigger message to *all* players but the first "%s" in the message will\nbe replaced by `GetPlayerName(toPlayer)`.\n\n@param toPlayer this player\'s name will be used to replace the `%s` placeholder\n@param x new text box position (default is 0, clamped to: 0.0-1.0)\n@param y new text box position (default is 0, clamped to: 0.0-1.0)\n@param duration text lifetime in seconds\n@param message text (supports color codes), may contain only one `%s` placeholder\n\n@bug Only the first "%s" will be replaced correctly. Following "%s" will be\nprinted as garbage or (v1.32.10, Lua) crash the game.\n\nUsing formatters like "%i" will also print garbage and following "%s" wont\nwork either.\n\nSee: [C stdlib printf documentation](https://cplusplus.com/reference/cstdio/printf/).\n\n@note A better name for the parameter `toPlayer` would be `fromPlayer`.\n\n@note See: `DisplayTextToPlayer` for the full description.\nAlso: `DisplayTimedTextToPlayer`, `BlzDisplayChatMessage`.\n\n\n',
    ClearTextMessages:
        "\nClears all messages displayed via triggers. All messages will still show up in the message log, however.\n\n\n@note This does not remove player chat messages.\n\n",
    SetPortraitLight: "\n\n\n@patch 1.32\n\n",
    EnableUserControl:
        "\nToggles user's input controls.\n\nWhen disabled this includes:\n\n- hide the cursor (you can still see UI on-hover effects with menu buttons and\neven mouse-down animation on ability buttons)\n- on-hover unit selection circles no longer show (cannot be overriden with\n`EnableDragSelect`, `EnablePreSelect`, `EnableSelect`)\n- disable all hotkeys (binds, abilities, minimap, menus like F10), only Alt+F4 continues to work\n\n@param b `true` to enable control, `false` to disable\n\n\n",
    EnableUserUI:
        "\nToggles the display of tooltips, other features unknown (v1.32.10).\nGroup hotkeys, selection etc. continue to work.\n\n@param b `true` to enable tooltips, `false` to disable the display of tooltips.\n\n\n",
    SuspendTimeOfDay:
        "\nControls the ticking of the in-game day/night time.\n\n@param b `true` to stop time ticking, `false` to enable time progression (default).\n\n\n",
    SetTimeOfDayScale:
        "\nSets the speed of the in-game day/night time.\n\nBy default: `1.0` or 100%. `2.0` would make it twice as fast.\n\n@param r new scaling factor\n\n\n@bug A negative scaling factor is applied and the time ticks backwards until\n00:00 is reached. Then the time freezes at 00:00, the day does not progress backwards.\n\n",
    GetTimeOfDayScale:
        "\nReturns the speed of the in-game day/night time (a scaling factor).\nBy default: `1.0` or 100%.\n\n\n",
    ShowInterface: "\n\n\n@bug If fadeDuration equals 0 the unit portrait always appears invisible.\n\n",
    UnitAddIndicator: "\n\n\n@note See: `AddIndicator` (it is a more generic version as it takes a `widget`).\n\n",
    AddIndicator:
        '\nAdds a blinking circle around widget with the color (red,green,blue,alpha).\nThe circle blinks twice. This function is commonly used for cinematic modes\nand is seen in `TransmissionFromUnitWithNameBJ`.\n\n@param whichWidget The widget the indicator will be applied to.\n@param red 0-255 red color (value mod 256).\n@param green 0-255 green color (value mod 256).\n@param blue 0-255 blue color (value mod 256).\n@param alpha 0-255 opacity (value mod 256). Determining the transparency\nof the indicator. `0` is total transparency, `255` is total opacity.\n\n@note The size of the indicator depends on a widget\'s selection size. To modify\nthis, you must edit the object editor field of the widget listed as "Art - Selection Size".\n\nThe indicator is shown below the unit selection.\nIf the unit is currently selected, the blinking indicator will be practically\nhidden by the selection circle. For more see `SetImageType` description.\n\n@note See: `UnitAddIndicator` (functionally equivalent to this widget version).\n\n\n',
    PingMinimap:
        '\nPings a spot on the minimap.\n\n@param x horizontal world coordinate of the ping.\n@param y vertical world coordinate of the ping.\n@param duration duration of the ping in seconds.\n\n\n@note This ping has the semantics of a "simple" ping (GUI/blizzard.j terminology).\n\n@note As a "simple" ping, pings created with this function have a default shape of a rotating circle with 4 arrows\npointing inwards and periodically emitting a growing circle that fades out like a pulse. There is also a dot in the center.\n\n@note This ping is neon green on default.\n\n@note There can only be 16 pings at a time. When a new one is created but there are already 16,\nthe oldest will be deleted in favor of the new one. This includes user pings: user pings can be deleted by this function\nand user pings can overwrite scripted pings.\n\n',
    PingMinimapEx:
        '\nPings a spot on the minimap.\n\n@param x horizontal world coordinate of the ping.\n@param y vertical world coordinate of the ping.\n@param duration duration of the ping in seconds.\n@param red 0-255 red color (value mod 256).\n@param green 0-255 green color (value mod 256).\n@param blue 0-255 blue color (value mod 256).\n@param extraEffects When true, the ping will have the appearance of a "flashy" ping. Otherwise it will be a "simple" ping (see notes).\n\n\n@note "Simple" pings (GUI/blizzard.j terminology) have a default shape of a rotating circle with 4 arrows\npointing inwards and periodically emitting a growing circle that fades out like a pulse. There is also a dot in the center.\n\n@note "Flashy" pings (GUI/blizzard.j terminology) have the same shape as user-generated pings. On default, they first feature an exclamation mark\nand a large circle growing and fading out before going into a stable state where smaller circles are periodically emitted growing and fading out\nlike a pulse and there is a static exclamation mark in the center.\n\n@note Pings with red == 255 && green == 0 && blue == 0 (mod 256) have a special shape, appearing as "attack" or "warning" pings (GUI/blizzard.j terminology).\nOn default, if extraEffects is false, it is similar to "simple" pings but the rotating arrows are flying in from outside before getting attached to the circle.\nOn default, if extraEffects is true, it additionally briefly shows an exclamation mark when the ping vanishes (bug?).\n\n@note There can only be 16 pings at a time. When a new one is created but there are already 16,\nthe oldest will be deleted in favor of the new one. This includes user pings: user pings can be deleted by this function\nand user pings can overwrite scripted pings.\n\n',
    CreateMinimapIconOnUnit: "\n\n\n@patch 1.32\n\n",
    CreateMinimapIconAtLoc: "\n\n\n@patch 1.32\n\n",
    CreateMinimapIcon: "\n\n\n@patch 1.32\n\n",
    SkinManagerGetLocalPath: "\n\n\n@patch 1.32\n\n",
    DestroyMinimapIcon: "\n\n\n@patch 1.32\n\n",
    SetMinimapIconVisible: "\n\n\n@patch 1.32\n\n",
    SetMinimapIconOrphanDestroy: "\n\n\n@patch 1.32\n\n",
    ForceUIKey:
        "\nEmulates a key press within the game. Seems to only work with latin alphabet, only for printable ASCII characters.\n\n\n@note See `ForceUICancel` for limitations and bugs. Most importantly, the outcome is affected by local player's hotkey layout.\n\n",
    ForceUICancel:
        "\nEmulates an ESCAPE key press internally, used to interact with UI, e.g. close F10 menu.\n\n\n@bug Does not always work as expected if you use it to \"Cancel\" something on behalf of a player, like cancel research in the current building. Since it always sends the Escape key, it will break if hotkey layout was changed from classic to grid/custom in game settings. Explanation:\n\n1. OldPlayer plays with classic hotkey layout, the Cancelling abilities are bound to Escape.\n2. ModernPlayer plays with grid layout, the Cancelling abilities' hotkey depends on their position but it's usually V.\n3. ForceUICancel() is executed for both players\n4. OldPlayer executes a Cancel ability, nothing happens to ModernPlayer\n5. The game doesn't desync because it thinks OldPlayer really pressed that key, and even though ModernPlayer did \"press\" it too, he didn't trigger Cancel for his unit.\n\n@note Does not trigger (physical) player key events like `BlzTriggerRegisterPlayerKeyEvent`.\n\n",
    DisplayLoadDialog:
        '\nOpens the "Load game" menu where you can load a previous save.\n\n\n@note Singleplayer only! This menu is disabled in multiplayer and nothing will happen.\n\n',
    SetAltMinimapIcon:
        '\nSets the "alternative icon". You can display this icon for any unit via\n`UnitSetUsesAltIcon`.\n\n\n@note Only one icon can be the "alternative icon" but you can give each\nplayer a different icon via `GetLocalPlayer`.\n\n',
    DisableRestartMission:
        '\nToggles the "Restart Mission" button (found in: Menu (F10) -> End Game).\n\n@param flag `true` to disable the button, `false` to allow game restarts by the player.\n\n@note This button is only enabled in singleplayer (default),\nyou cannot enable it in multiplayer.\n\n\n',
    GetAllyColorFilterState:
        '\nReturns the currently chosen player color display mode.\n\nThis is called "ally color mode" by the game (hotkey: Alt+A).\n\n- `0` aka "Mode 1" (default):\n    - Minimap: Player colors, youself are white\n\t- World: Unit colors same as player color\n- `1` aka "Mode 2":\n    - Minimap: Allies are teal, enemies are red, yourself are white\n\t- World: Unit colors same as player color\n- `2` aka "Mode 3":\n    - Minimap: Allies are teal, enemies are red, yourself are white\n\t- World: Allies are teal, enemies are red, own units are blue\n\n\n@note See: `SetAllyColorFilterState`\n\n@note This setting affects how a unit\'s "Art - Team Color" (WE name) is displayed.\nIf the models you use rely on this color to match player color,\nyou can choose to force state=0 with `SetAllyColorFilterState`.\n\n@async \n\n',
    SetAllyColorFilterState:
        "\nSets the player color display mode.\n\n@param state new state (only 0, 1, 2 are valid).\nSee `GetAllyColorFilterState` for a description.\n\n@note This is a player setting. Do not change it without a reason.\nMoreover this is an accessibility setting that may be used by visually impaired\nplayers.\n\n@bug You can set other states than 0-2, but they'll still display like state 0.\n\n@bug (v1.32.10) You can permanently break this feature for a player\nif you set a large negative value.\n\nAny negative value will display like `state=0` and clicking the button\nwill increase the state by 1. However if you set a very large negative value,\nthe player will use the button to no avail. The issue here is that the value\nwill be saved in player's game settings and persist forever, thus breaking this\nfeature until a reinstall or until you set this to a sane value (0-2).\n\nUsing large positive values instantly reverts to `state=0` after the first button\nclick.\n\n@note See: `GetAllyColorFilterState` for full description; `EnableMinimapFilterButtons`.\n\n\n",
    GetCreepCampFilterState:
        "\nReturns `true` if the local player has enabled the display of creep camps on the minimap.\n\nThe creep camps are shown as green/orange/red circles by default and there's a button\nnext to the minimap to toggle it while playing (hotkey: Alt+R).\n\n\n@note See: `SetCreepCampFilterState`, `GetAllyColorFilterState`\n\n@async \n\n",
    SetCreepCampFilterState:
        "\nToggles minimap creep display.\n\n@param state `true` to highlight camps, `false` to hide\n\n@note See: `GetCreepCampFilterState` for full description; `SetAllyColorFilterState`, `EnableMinimapFilterButtons`.\n\n\n",
    EnableMinimapFilterButtons:
        '\nToggles the "player color display mode" and "minimap creep display" buttons.\n\nWhen the buttons are disabled, the player cannot control the minimap appearance\nor player colors (ally/enemy).\n\n@param enableAlly `true` to enable the button (default), `false` to disable.\nSee: `GetAllyColorFilterState` for an explanation.\n\n@param enableCreep `true` to enable the button (default), `false` to disable.\nSee: `GetCreepCampFilterState` for an explanation.\n\n@note This controls a player setting. Do not change it without a reason.\nMoreover this is an accessibility setting that may be used by visually impaired\nplayers.\n\n@note The buttons turn gray and their hotkeys stop working too.\n\n\n',
    EnableDragSelect:
        '\nSets the functionality of the rectangular unit multi-select.\n\n"Drag Select" allows you to hold left-click to select multiple units by\nexpanding the green selection rectangle over the units.\n\n@param state If `true`, default game behavior (drag select is enabled).\n\nIf `false`, drag select is disabled. Only the first unit in the rectangle will\nbe selected (closest to the point where you first clicked the mouse).\n\nNote that you can still select multiple units with Shift+Click even if drag\nselect is disabled.\n\n@param ui If `true`, render the visual indicator that shows the green rectangular selection area (default).\nUnits, that are not yet selected but are inside the rectangle,\nhave a semi-transparent green circle around them.\n\nIf `false`, the green rectangle is not rendered.\nThis has no effect on `state`, Drag Select can still work without the visual indicator.\n\n\n',
    EnablePreSelect:
        "\nSets the functionality when you hover over a unit with your cursor.\n\n@param state unknown\n@param ui If `true`, show semi-transparent green circle around the unit and the health bar etc.\n\nIf `false`, the green circle and the health bar is not shown.\nThe cursor still blinks green/yellow/red like when you hover over a unit.\nThe color depends on whether the unit is your own/ally/enemy.\n\n\n",
    EnableSelect:
        '\nControls whether you can de/select any units and the green visual indicator.\n\n@param state If `true`, you can de/select units (default).\n\nIf `false`, deselects any currently selected units and disables your ability\nto select any unit. Mouse clicks and group binds ("CTRL+1" then press "1")\ndon\'t work any more.\nDrag select will not allow you to select too.\n\n@param ui If `true`, show the green selection indicator around selected units (default).\n\nIf `false`, no visual indicator is shown.\n\n@note \nYou can use `SelectUnit` and other functions to select the units for a player,\neven when `state` is set to `false`.\n\nThe player cannot manually deselect any units they have control over (after `SelectUnit`).\n\n\n',
    CreateTrackable:
        "\nCreates a trackable at the given coordinates but with zero z-coordinate.\nTrackables are used to register mouse clicks or hovers at the trackables\nposition. But their functionality is very limited, as you can't, for example\ndistinguish the triggering player out of the box. To get a general overview\nto the common workarounds see the `trackable` documentation.\n\n@param trackableModelPath The path to the model the trackable should use. Models\nwith team colours will use the neutral-hostile team colour. To create an\ninvisible trackable provide the empty string `\"\"`.\n\n@param x The x-coordinate where the trackable should be created.\n\n@param y The x-coordinate where the trackable should be created.\n\n@param facing The facing of the trackable.\n\n\n@note To create a trackable with a non-zero z-coordinate you can use the same\ntechnique as with `AddSpecialEffect`, that is create an invisible platform\nbefore creating the trackable.\n\n```\nfunction CreateTrackableZ takes string trackableModelPath, real x, real y, real z, real facing returns trackable\n    local destructable d = CreateDestructableZ('OTip', x, y, z, 0, 1, 0)\n    local trackable t = CreateTrackable(trackableModelPath, x, y, facing)\n    call RemoveDestructable(d)\n    set d = null\n    return t\nendfunction\n```\n\n\n",
    CreateQuest: "\n\n\n@bug Do not use this in a global initialisation as it crashes the game there.\n\n",
    CreateDefeatCondition:
        '\nDefeat conditions tell players what conditions would warrant a defeat.\nThey are shown above all quest descriptions. Note that this function will only\ndisplay text. To put the condition in effect, you would need additional\ntriggering (i.e. registering when a unit dies to end the game). This updates\nall quests with the list of defeat condition descriptions.\nTo actually set the text use `DefeatConditionSetDescription`.\n\n\n@note Each defeat condition has a hyphen "-" symbol appended to the front.\n\n',
    CreateTimerDialog:
        '\nCreates a new timer dialog based on the underlying timer.\nIt is hidden by default and has "Remaining" as title (localized).\n\nTimer dialog works as a visible countdown timer in the format: "Title hh:mm:ss".\n\nSince this creates an object and returns a handle, it must be freed when no longer needed\nwith `DestroyTimerDialog`.\n\n@param t connect the timer dialog to this timer, it\'ll always follow its\n"time remaining".\n\n@note (v1.32.10, Lua) If `t` is nil then the dialog is still created,\nbut will never show any time.\n\nAlternatively, you can set the visible time with `TimerDialogSetRealTimeRemaining`.\n\n\n',
    DestroyTimerDialog:
        "\nDestroys the timer dialog and frees the handle.\n\nThis does not affect the timer you might have provided in `CreateTimerDialog`.\n\n@param whichDialog target dialog.\n\n\n",
    TimerDialogSetTitle:
        '\nSets the shown dialog title. Replaces the default "Remaining" text.\n\n@param whichDialog target dialog.\n@param title new title.\n\n@note Depending on font and version, there\'s enough space to display\n14 full-width characters like "@" (at character). If the text is wider,\nit is shortened and an ellipsis "..." is shown at the end.\n\n@note See: `TimerDialogSetTitle`, `TimerDialogSetTitleColor`, `TimerDialogSetTimeColor`.\n\n\n',
    TimerDialogSetTitleColor:
        "\nSets the timer-dialogs color.\n\nSee: `TimerDialogSetTitle`, `TimerDialogSetTimeColor`.\n\n@param whichDialog The timerdialog.\n@param red 0-255 red color (value mod 256).\n@param green 0-255 green color (value mod 256).\n@param blue 0-255 blue color (value mod 256).\n@param alpha (unused) 0-255 transparency, please set to 255.\nA value of 0 is complete transparency, while a value of 255 is complete opacity.\n\n\n",
    TimerDialogSetTimeColor:
        "\nSets the timer-dialogs time color.\n\n@param whichDialog The timerdialog.\n@param red 0-255 red color (value mod 256).\n@param green 0-255 green color (value mod 256).\n@param blue 0-255 blue color (value mod 256).\n@param alpha (unused) 0-255 transparency, please set to 255.\nA value of 0 is complete transparency, while a value of 255 is complete opacity.\n\n@note See: `TimerDialogSetTitleColor`.\n\n\n",
    TimerDialogSetSpeed:
        "\nSet a new multiplier for the shown time remaining. Default is `1.0`.\n\nThe multiplier factor is applied literally to the displayed time:\n`timerTimeRemainingSec * speedMultFactor`.\n\n@param whichDialog target dialog to modify the speed of.\n@param speedMultFactor new multiplicator factor.\n\nFor factor `2.0` the displayed time will appear twice as fast (200% speed).\n\nFor factor `0.5` the displayed time will appear half as fast (50% speed).\n\nFactor `0.0` will always display `00:00:00`.\n\n@note It does not affect the underlying timer `t` from `CreateTimerDialog`.\nIf you set the speed too high, the display will not become smoother as\nit updates roughly 2-3 times per second.\n\n\n",
    TimerDialogDisplay:
        '\nShow/hide the dialog for all players.\n\nA timer dialog is displayed above a multiboard in the top-right corner.\n\n@param whichDialog target dialog.\n@param display `true` to show, `false` to hide.\n\n@note Multiple timer dialogues stack from right to left, for example:\n"Timer dialog 2  12:34:56" "Timer dialog 1  02:10:42".\n\n@note If the timer has not been started yet, it will not show any time:\n"Remaining ".\n\n@note A dialog display can be toggled per-player by using it inside a\n`GetLocalPlayer` condition.\n\n@bug (v1.32.10) The second timerdialog\'s width and position is calculated and\ndisplayed incorrectly in ultra-wide mode (beyond 1800x920, 1.95 ratio).\n\n@bug (v1.32.10) If you toggle visibility of one dialog but not the other\nin a single frame, the first dialog will appear below the second one.\n\n```{.lua}\n\ttdialog = CreateTimerDialog(CreateTimer())\n\tTimerDialogSetTitle(tdialog, "Timer1 Dialog __ 1")\n\tTimerDialogDisplay(tdialog, true)\n\ttdialog2 = CreateTimerDialog(CreateTimer())\n\tTimerDialogSetTitle(tdialog2, "Timer2 Dialog")\n\tTimerDialogDisplay(tdialog2, true)\n\t-- Correct up to this point.\n\t-- This is buggy:\n\tTimerDialogDisplay(tdialog, false)\n\tTimerDialogDisplay(tdialog2, true)\n\tTimerDialogDisplay(tdialog, true)\n\t-- Now tdialog will appear beneath tdialog2.\n```\n\n**Workarounds:**\n\n1. Hide *every* dialog, then show those that you need.\n2. Introduce a sleep-wait before turning dialog display on.\n\n@note See: `IsTimerDialogDisplayed`.\n\n\n',
    IsTimerDialogDisplayed:
        "\nReturns `true` if the dialog is shown, `false` if it is hidden.\n\n@param whichDialog check visibility of this timer dialog.\n\n@note See: `TimerDialogDisplay`.\n\n\n",
    TimerDialogSetRealTimeRemaining:
        "\nSets the timer dialog countdown to specified time and decouples it from the\nprovided timer in `CreateTimerDialog`.\n\n@param whichDialog target dialog.\n@param timeRemaining new time in seconds.\n\n@note For example if the dialog was created with a periodic timer, it would\nreset the countdown like the timer when it reaches zero.\n\nOnce you set a custom time with this function, it will no longer follow the\ntimer. Once it reaches zero, it'll stay at zero.\n\n@note There's no way to retrieve the internal timer value or to have an event\ntrigger.\n\n\n",
    CreateLeaderboard:
        "\nCreates a leaderboard handle.\nLeaderboards initially have 0 rows, 0 columns, and no label.\n\n\n@bug Do not use this in a global initialisation as it crashes the game there.\n\n",
    CreateMultiboard:
        "\nCreates a new multiboard and returns its handle.\n\nThe new multiboard by default:\n\n- does not have a title\n- row and column count are 0\n- is not displayed\n- is not minimized\n\nTo display a multiboard after creation, you must use `MultiboardDisplay`.\n\n\n@note Multiboards must be destroyed to prevent leaks: `DestroyMultiboard`.\n\n@note Only one multiboard can be visible at a time.\nHowever there's a workaround using [Frame API](https://www.hiveworkshop.com/threads/ui-showing-3-multiboards.316610/).\n\n@note There's a bug that causes big multiboards to\n[freeze/crash the game on 1.33](https://www.hiveworkshop.com/threads/maximizing-the-multiboard-leads-to-freezing-game-with-the-latest-reforged-patch.341873/#post-3550996).\n\n@bug Do not use this in a global initialisation as it crashes the game there.\n\n",
    DestroyMultiboard:
        '\nDestroys the multiboard and frees the handle.\n\n\n@bug **Fixed in 1.33:** Crash on 1.30-1.32.10 (earlier?) when a multiboard is destroyed\nwhile `ShowInterface` is false for a player and the game crashes later, once turned on.\n\n`ShowInterface` is used by the cinematic mode, also known as "letterbox mode" as GUI trigger.\n\n**Workaround:** hide the multiboard before destroying it, see: `MultiboardMinimize`.\n\n**Bug reports:**\n[Cinematic mode, multiboard](https://www.hiveworkshop.com/threads/fatal-error-after-cinematics.316707/post-3358087),\n[toggling letterbox mode](https://www.hiveworkshop.com/threads/1-31-1-bug-destroymultiboard-causes-crash-after-disabling-letterbox.315554/),\n[multiboard](https://www.hiveworkshop.com/threads/destroying-or-hiding-timer-window-causes-game-to-crash.310883/post-3312587).\n\n',
    MultiboardDisplay:
        "\nShows or hides the multiboard.\n\nCan be used to force a multiboard update.\n\n@param lb Target multiboard\n@param show `true` to show, `false` to hide.\n\n\n@note Multiboards can not be shown at map-init. Use a wait or a zero-timer to\ndisplay as soon as possible.\n\n@note See: `IsMultiboardDisplayed`.\n\n@bug `MultiboardDisplay(mb,false)`, where mb is an arbitrary non-null multiboard\nwill close any open multiboard, regardless of whether it's `mb` or not.\n<http://www.wc3c.net/showthread.php?p=971681#post971681>\n\n",
    IsMultiboardDisplayed:
        "\nReturns true if multiboard is visible, false if not shown.\n\n@param lb Target multiboard.\n\n\n@note See: `MultiboardDisplay`.\n\n",
    MultiboardMinimize:
        "\nMinimizes/maximizes the multiboard. This is equivalent to clicking the small ↑ ↓ buttons in-game.\n\nCan be used to force a multiboard update.\n\nA maximized multiboard shows its contents and draws the content borders, even\nif it has 0 rows and columns. When minimized only the title is shown.\n\n\n@note See: `IsMultiboardMinimized`.\n\n",
    IsMultiboardMinimized:
        "\nReturns true if minimized, false if maximized.\n\n@param lb Target multiboard.\n\n\n@async \n\n@note See: `MultiboardMinimize`.\n\n",
    MultiboardClear:
        "\nErases all items in a multiboard and sets row count to 0, column count to 0.\nThe multiboard's name is preserved.\n\n@param lb Target multiboard.\n\n\n@note *Implementation-specific:* Clearing a multiboard does not automatically invalidate\nprevious `multiboarditem` handles. If you expand the multiboard again, you'll be able to reuse\nold handles. BUT you really shouldn't be doing this, it seems to be a buggy/undefined behavior.\nWhen you clear or shrink a table, it's best to release old cell (item) handles with `MultiboardReleaseItem`.\n\n@note See: `DestroyMultiboard` to remove, `MultiboardDisplay` to hide a multiboard.\n\n",
    MultiboardSetTitleText:
        "\nSets a multiboard's name.\n\nThe new text appears instantly.\nThe multiboard will expand as wide as necessary to display the title.\n\n@param lb Target multiboard.\n@param label New name.\n\n@note See: `MultiboardGetTitleText`\n\n\n",
    MultiboardGetTitleText: "\nReturns multiboard's name.\n\n\n@note See: `MultiboardSetTitleText`.\n\n",
    MultiboardSetTitleTextColor:
        "\nSets the default color for multiboard name.\n\nThis is different than using color codes. If you use a color code in text,\nit will override this color.\n\n@param lb Target multiboard.\n@param red 0-255 red color (value mod 256).\n@param green 0-255 green color (value mod 256).\n@param blue 0-255 blue color (value mod 256).\n@param alpha (unused) 0-255 transparency, please set to 255.\nA value of 0 is complete transparency, while a value of 255 is complete opacity.\n\n\n@note You can use this to avoid using color tags and text manipulation in code.\n\n@note See: `MultiboardSetItemValueColor`.\n\n",
    MultiboardGetRowCount:
        "\nReturns the number of content rows (lines, horizontal) for the multiboard.\n\n@param lb Target multiboard.\n\n@note See: `MultiboardSetRowCount`, `MultiboardGetColumnCount`.\n\n\n",
    MultiboardGetColumnCount:
        "\nReturns the number of content columns (vertical) for the multiboard.\n\n@param lb Target multiboard.\n\n@note See: `MultiboardSetColumnCount`.\n\n\n",
    MultiboardSetColumnCount:
        "\nSets the number of content columns (vertical) for the multiboard.\n\n@param lb Target multiboard.\n\n@note See: `MultiboardGetColumnCount`.\n\n\n",
    MultiboardSetRowCount:
        "\nSets the number of content rows (lines, horizontal) for the multiboard.\n\n@param lb Target multiboard.\n\n@bug It is only safe to change the row count by one. Use multiple calls for bigger values.\n<http://www.hiveworkshop.com/forums/l-715/m-250775/> (has test map)\n<http://www.hiveworkshop.com/forums/t-269/w-234897/> (has only code)\n\n@note See: `MultiboardGetRowCount`.\n\n\n",
    MultiboardSetItemsStyle:
        "\nSets rendering properties for all cells.\n\n@param lb Target multiboard.\n\n@note See: `MultiboardSetItemStyle` for a detailed description.\n\n\n",
    MultiboardSetItemsValue:
        "\nSets new text for all cells.\n\n@param lb Target multiboard.\n\n@note See: `MultiboardSetItemValue` for a detailed description.\n\n\n",
    MultiboardSetItemsValueColor:
        "\nSets the default color for text in all cell.\n\nThis is different than using color codes. If you use a color code in text,\nit will override this color.\n\n@param lb Target multiboard.\n@param red 0-255 red color (value mod 256).\n@param green 0-255 green color (value mod 256).\n@param blue 0-255 blue color (value mod 256).\n@param alpha (unused) 0-255 alpha color, please set to 255.\n\n\n@note You can use this to avoid using color tags and text manipulation in code.\n\n@note See: `MultiboardSetItemValueColor`.\n\n",
    MultiboardSetItemsWidth:
        "\nSets the new width for all cells.\n\n@param lb Target multiboard.\n@param width New cell width expressed as screen width. `1.0` = 100% of screen width,\n`0.05` = 5% of screen width.\n\n\n@note See: `MultiboardSetItemWidth` for a detailed description.\n\n",
    MultiboardSetItemsIcon:
        "\nSets a new icon for all cells.\n\n@param lb Target multiboard.\n@param iconPath Path to new icon texture.\n\n@note See: `MultiboardSetItemIcon` for a detailed description.\n\n\n",
    MultiboardGetItem:
        "\nAcquires and returns a new handle for the multiboard cell.\n\n@param lb Target multiboard.\n@param row In which row is the target cell (Y-coord, up-down). Starts from 0.\n@param column in which column is the target cell (X-coord, left-right). Starts from 0.\n\n@note Because a new handle is created each time, the handle must be\nfreed with `MultiboardReleaseItem`. The handle is different even if you\nretrieve the same cell of the multiboard (v1.32.10, Lua).\n\n@note The parameter order of `row` and `column` is (y,x) if you think of coordinates.\n\n\n",
    MultiboardReleaseItem:
        "\nDestroys the handle previously created with `MultiboardGetItem`.\n\nIt must be used to prevent leaks. Releasing the handle does not destroy or modify the\nitem.\n\n\n",
    MultiboardSetItemStyle:
        "\nSets rendering properties of the multiboard cell.\nHiding the icon or text does not erase it.\n\nThere is no way to get a cell's style.\n\n@param mbi Target cell handle.\n@param showValue `true` to render text, `false` to hide text.\n@param showIcon `true` to render icon, `false` to hide icon.\n\n\n@note See: `MultiboardSetItemsStyle`.\n\n",
    MultiboardSetItemValue:
        "\nSets the cell's text. It is empty by default.\n\n@param mbi Target cell handle.\n@param val New text.\n\n\n@note You must make sure the new text will fit in current width by setting\n`MultiboardSetItemWidth` appropriately. If the width is too small, the text will be\ncut off.\n\n@note See: `MultiboardSetItemsValue`.\n\n",
    MultiboardSetItemValueColor:
        "\nSets the default color for the cell text.\n\nThis is different than using color codes. If you use a color code in text,\nit will override this color.\n\n@param red 0-255 red color (value mod 256).\n@param green 0-255 green color (value mod 256).\n@param blue 0-255 blue color (value mod 256).\n@param alpha (unused) 0-255 alpha color, please set to 255.\n\n\n@note You can use this to avoid using color tags and text manipulation in code.\n\n@note See: `MultiboardSetItemsValueColor`.\n\n",
    MultiboardSetItemWidth:
        "\nSets the new text width for the cell.\n\nDefault width is `0.03` (3%), this is enough to fit 1-3 characters\n(depending on font and character).\n\n@param mbi Target cell handle.\n@param width New cell width expressed as screen width. `1.0` = 100% of screen width,\n`0.05` = 5% of screen width.\n\nThe multiboard is right-aligned (begins at the right) at the window border.\nSee Tasyen's\n[The Big UI-Frame Tutorial](https://www.hiveworkshop.com/pastebin/e23909d8468ff4942ccea268fbbcafd1.20598#PosFrames)\nfor the explanation of screen width.\n\n\n@bug **NOTE!** Multiboard's total width is calculated based on ONLY the first row's\nwidths.\n\n*Example:* Your first row is very short, but second row is twice is long.\n\n*Result:* The second row will not fit inside the table and overflow to the right,\nbeyond the visible area.\n\n**Summary:** To set the multiboard width, set the width of columns in the first row.\n\n@bug Although the column width is set immediately and items in the same row are\nmoved left/right, the multiboard is not redrawn to accomodate the new width.\n\nTo update the entire multiboard's width, you must manually minimize/maximize\nthe multiboard or call `MultiboardDisplay(udg_myMultiboard, true)`\nor `MultiboardMinimize(udg_myMultiboard, false)`.\n\nFor example, if you only change the width of cell at (x=0, y=0) to\nbe 0.2x of screen width, then the cell (x=1, y=0) will be moved right beyond the\nvisible screen.\n\n@note See: `MultiboardSetItemsWidth`.\n\n",
    MultiboardSetItemIcon:
        "\nSets the cell's icon. It is a grey eye icon by default.\n\n@param mbi Target cell handle.\n@param iconFileName Path to new icon texture.\n\n\n@note Setting an invalid texture path will result in an undefined texture (100% green).\n\n@note See: `MultiboardSetItemsIcon`.\n\n",
    MultiboardSuppressDisplay:
        "\nWhile enabled, completely stops displaying any multiboards. It does not modify\nany multiboards' display state. Useful for cinematics.\n\nOnce disabled, shows the last displayed (enabled) multiboard.\n\n@param flag `true` to not render any multiboards, `false` to render multiboards.\n\n\n@note See: `MultiboardDisplay` to modify an individual multiboard.\n\n",
    AdjustCameraField: "\nChanges one of the game camera's options whichField by offset over duration seconds.\n\n\n",
    CreateCameraSetup:
        "\nCreates a new camerasetup object with the following default values.\n\n|                   |               |\n|-------------------|---------------|\n|Target Coordinates |( 0.00 , 0.00 )|\n|Z-Offset           | 0.00          |\n|Rotation           | 90.00         |\n|Angle of Attack    | 304.00        |\n|Distance           | 1650.00       |\n|Roll               | 0.00          |\n|Field of View      | 70.00         |\n|Far Clipping       | 5000.00       |\n\n\n\n",
    CameraSetupSetField:
        "\nAssigns a value to the specified field for a camerasetup. The input angles should be in degrees.\n\n@param whichSetup The camera setup.\n\n@param whichField The field of the camerasetup. \n\n@param value The value to assign to the field.\n\n@param duration The duration over which the field will be set. If the duration is greater\nthan 0, the changes will be made gradually once the camera setup is applied.\n\n\n",
    CameraSetupGetField:
        "\nReturns the value of the specified field for a camerasetup. The angle of attack,\nfield of view, roll, and rotation are all returned in degrees, unlike `GetCameraField`.\n\n@param whichSetup The camera setup.\n\n@param whichField The field of the camerasetup.\n\n\n@note The angle of attack, field of view, roll, and rotation are all returned in degrees.\n\n",
    CameraSetupSetDestPosition:
        "\nSets the target coordinates for a camerasetup over a duration. The coordinate\nchange will only be applied when `CameraSetupApply` (or some other variant) is ran.\n\n@param whichSetup The camera setup.\n\n@param x The target x-coordinate.\n\n@param y The target y-coordinate.\n\n@param duration The coordinates will be applied over this duration once the camera setup is applied.\n\n\n",
    CameraSetupGetDestPositionLoc:
        "\nReturns the target location of a camerasetup.\n\n@param whichSetup The camera setup.\n\n\n",
    CameraSetupGetDestPositionX:
        "\nReturns the target x-coordinate of a camerasetup.\n\n@param whichSetup The camera setup.\n\n\n",
    CameraSetupGetDestPositionY:
        "\nReturns the target y-coordinate of a camerasetup.\n\n@param whichSetup The camera setup.\n\n\n",
    CameraSetupApply:
        "\nApplies the camerasetup, altering the current camera's fields to match those of the camera setup.\n\n@param whichSetup The camerasetup to apply.\n\n@param doPan If set to true, it will move the current camera's target coordinates to the\ncamera setup's target coordinates. If false, the camera will not move\ncoordinates, but will still apply the other fields.\n\n@param panTimed If set to true, then it will change the camera's properties over the times specified in CameraSetupSetField.\n\n\n\n",
    CameraSetupApplyWithZ:
        "\nApplies the camerasetup with a custom z-offset, altering the current camera's\nfields to match those of the camera setup. The z-offset input will override\nthe z-offset specified by the camerasetup through `CameraSetupSetField`.\n\n@param whichSetup The camerasetup to apply.\n\n@param zDestOffset The camera's z-offset will gradually change to this value over the specified duration.\n\n\n@bug If a player pauses the game after the camerasetup has been applied, the\nz-offset of the game camera will change to the z-offset of the camerasetup for that player. \n\n",
    CameraSetupApplyForceDuration:
        "\nApplies the camerasetup over a certain duration, altering the current\ncamera's fields to match those of the camera setup.\n\n@param whichSetup The camerasetup to apply.\n\n@param doPan If set to true, it will move the current camera's target coordinates to the\ncamera setup's target coordinates. If false, the camera will not move\ncoordinates, but will still apply the other fields.\n\n@param forceDuration The duration it will take to apply all the camera fields.\nIt will ignore the times set by CameraSetupSetField.\n\n\n",
    CameraSetupApplyForceDurationWithZ:
        "\nApplies the camerasetup over a certain duration with a custom z-offset value,\naltering the current camera's fields to match those of the camera setup.\nThe z-offset input will override the z-offset specified by `CameraSetupSetField`.\n\n@param whichSetup The camerasetup to apply.\n\n@param zDestOffset The camera's z-offset will gradually change to this value over the specified duration.\n\n@param forceDuration The duration it will take to apply all the camera fields.\nIt will ignore the times set by CameraSetupSetField.\n\n\n",
    BlzCameraSetupSetLabel: "\n\n\n@patch 1.32\n\n",
    BlzCameraSetupGetLabel: "\n\n\n@patch 1.32\n\n",
    CameraSetTargetNoise:
        "\nCauses the camera's target to sway(the camera's target, not the camera's perspective).\nThe higher the magnitude, the higher the range of swaying.\nThe higher the velocity, the more rapidly the swaying occurs.\n\n@param mag The magnitude of the swaying.\n\n@param velocity The speed of the swaying.\n\n\n\n",
    CameraSetSourceNoise:
        "\nCauses the camera's source to sway (the camera's perspective, not the camera's target).\nThe higher the magnitude, the higher the range of swaying.\nThe higher the velocity, the more rapidly the swaying occurs.\nThis will not affect the camera's target coordinates.\n\n@param mag The magnitude of the swaying.\n\n@param velocity The speed of the swaying.\n\n\n",
    CameraSetTargetNoiseEx:
        "\nCauses the camera's target to sway, just like CameraSetTargetNoise. (the camera's target, not the camera's perspective) The higher the magnitude, the higher the range of swaying. The higher the velocity, the more rapidly the swaying occurs.\n\nCauses the camera's source to sway (the camera's perspective, not the camera's target).\nThe higher the magnitude, the higher the range of swaying.\nThe higher the velocity, the more rapidly the swaying occurs.\nThis will not affect the camera's target coordinates.\n\n\n@param mag The magnitude of the swaying.\n\n@param velocity The speed of the swaying.\n\n@param vertOnly Stands for \"vertical only\". If set to true, then the swaying will only modify target distance and z-offset.\n\n\n\n",
    CameraSetSourceNoiseEx:
        '\nCauses the camera to sway in the same fashion as `CameraSetSourceNoise`.\n\n@param mag The magnitude of the swaying.\n\n@param velocity The speed of the swaying.\n\n@param vertOnly Stands for "vertical only". If true, then only the angle of attack, target distance, and z-offset of the camera will be modified. (the rotation will not be modified)\n\n\n',
    CameraSetSmoothingFactor:
        "\nSets the game camera's smoothing factor for scrolling with the mouse/keyboard. The default smoothing factor for the standard game camera is 0, where upon scrolling, the camera will immediately come to a stop. As the factor increases, the camera eases into a stop more and more gradually.\n\n@param factor The smoothing factor. It is 0 by default.\n\n\n",
    CameraSetFocalDistance: "\n\n\n@patch 1.32\n\n",
    CameraSetDepthOfFieldScale: "\n\n\n@patch 1.32\n\n",
    SetCinematicAudio: "\n\n\n@patch 1.32\n\n",
    GetCameraBoundMinX: "\nReturn-value for the local players camera only.\n\n\n@async \n\n",
    GetCameraBoundMinY: "\nReturn-value for the local players camera only.\n\n\n@async \n\n",
    GetCameraBoundMaxX: "\nReturn-value for the local players camera only.\n\n\n@async \n\n",
    GetCameraBoundMaxY: "\nReturn-value for the local players camera only.\n\n\n@async \n\n",
    GetCameraField: "\nReturn-value for the local players camera only.\n\n\n@async \n\n",
    GetCameraTargetPositionX: "\nReturn-value for the local players camera only.\n\n\n@async \n\n",
    GetCameraTargetPositionY: "\nReturn-value for the local players camera only.\n\n\n@async \n\n",
    GetCameraTargetPositionZ: "\nReturn-value for the local players camera only.\n\n\n@async \n\n",
    GetCameraTargetPositionLoc: "\nReturn-value for the local players camera only.\n\n\n@async \n\n",
    GetCameraEyePositionX: "\nReturn-value for the local players camera only.\n\n\n@async \n\n",
    GetCameraEyePositionY: "\nReturn-value for the local players camera only.\n\n\n@async \n\n",
    GetCameraEyePositionZ: "\nReturn-value for the local players camera only.\n\n\n@async \n\n",
    GetCameraEyePositionLoc: "\nReturn-value for the local players camera only.\n\n\n@async \n\n",
    CreateSound:
        '\nCreates a sound handle.\n\n@param fileName The path to the file.\n\n@param looping Looping sounds will restart once the sound duration has finished.\n\n@param is3D 3D Sounds can be played on particular areas of the map. They are at\ntheir loudest when the camera is close to the sound\'s coordinates.\n\n@param fadeInRate How quickly the sound fades in. The higher the number, the\nfaster the sound fades in. Maximum number is 127.\n\n@param fadeOutRate How quickly the sound fades out. The higher the number, the\nfaster the sound fades out. Maximum number is 127.\n\n@param eaxSetting EAX is an acronym for environmental audio extensions. In the\nsound editor, this corresponds to the "Effect" setting.\nThe known settings available in Warcraft III are:\n\n| Value              |  Setting               |\n|--------------------| ---------------------- |\n|`"CombatSoundsEAX"` | combat                 |\n|`"KotoDrumsEAX"`    | drums                  | \n|`"SpellsEAX"`       | spells                 |\n|`"MissilesEAX"`     | missiles               |\n|`"HeroAcksEAX"`     | hero acknowledgements  |\n|`"DoodadsEAX"`      | doodads                |\n|`"DefaultEAXON"`    | default                |\n\n\n@note You can only play the same sound handle once.\n\n@note You can only play the same sound filepath four times.\n\n@note Sounds of the same filepath (on different sound handles) must have a delay\nof at least 0.1 seconds inbetween them to be played.\nYou can overcome this by starting one earlier and then using `SetSoundPosition`.\n\n@note You can only play 16 sounds in general.\n\n\n',
    CreateSoundFilenameWithLabel:
        "\nCreates a sound but applies default settings to the sound, which are found\nunder the label from the following SLK-files:\n\n* UI\\SoundInfo\\AbilitySounds.slk\n* UI\\SoundInfo\\AmbienceSounds.slk\n* UI\\SoundInfo\\AnimSounds.slk\n* UI\\SoundInfo\\DialogSounds.slk\n* UI\\SoundInfo\\UISounds.slk\n* UI\\SoundInfo\\UnitAckSounds.slk\n* UI\\SoundInfo\\UnitCombatSounds.slk\n\n@param fileName The path to the file.\n\n@param looping Looping sounds will restart once the sound duration has finished.\n\n@param is3D 3D Sounds can be played on particular areas of the map. They are at\ntheir loudest when the camera is close to the sound's coordinates.\n\n@param fadeInRate How quickly the sound fades in. The higher the number,\nthe faster the sound fades in. Maximum number is 127.\n\n@param fadeOutRate How quickly the sound fades out. The higher the number,\nthe faster the sound fades out. Maximum number is 127.\n\n@param SLKEntryName the label out of one of the SLK-files, whose settings should be\nused, e.g. values like volume, pitch, pitch variance, priority, channel, min distance, max distance, distance cutoff or eax.\n\n\n@note You can only play the same sound handle once.\n\n@note You can only play the same sound filepath four times.\n\n@note Sounds of the same filepath (on different sound handles) must have a delay\nof at least 0.1 seconds inbetween them to be played.\nYou can overcome this by starting one earlier and then using `SetSoundPosition`.\n\n@note You can only play 16 sounds in general.\n\n\n",
    SetSoundParamsFromLabel:
        "\nApplies default settings to the sound, which are found under the label from the following SLK-files:\n\n* UI\\SoundInfo\\AbilitySounds.slk\n* UI\\SoundInfo\\AmbienceSounds.slk\n* UI\\SoundInfo\\AnimSounds.slk\n* UI\\SoundInfo\\DialogSounds.slk\n* UI\\SoundInfo\\UISounds.slk\n* UI\\SoundInfo\\UnitAckSounds.slk\n* UI\\SoundInfo\\UnitCombatSounds.slk\n\n@param soundHandle The sound to configure.\n@param soundLabel the label out of one of the SLK-files, whose settings should be\nused, e.g. values like volume, pitch, pitch variance, priority, channel, min distance, max distance, distance cutoff or eax.\n\n\n",
    SetSoundVolume:
        "\nSets the sounds volume.\n\n@param soundHandle which sound.\n\n@param volume Volume, between 0 and 127.\n\n\n",
    SetSoundPitch:
        "\nTones the pitch of the sound, default value is 1. Increasing it you get the chipmunk\nversion and the sound becomes shorter, when decremented the sound becomes low-pitched and longer.\n\n\n@bug This native has very weird behaviour.\nSee [this](http://www.hiveworkshop.com/threads/setsoundpitch-weirdness.215743/#post-2145419) for an explanation\nand [this](http://www.hiveworkshop.com/threads/snippet-rapidsound.258991/#post-2611724) for a non-bugged implementation.\n\n",
    SetSoundPlayPosition: "\n\n\n@note Must be called immediately after calling `StartSound`.\n\n",
    SetSoundDistances: "\n\n\n@note This call is only valid if the sound was created with 3d enabled.\n\n",
    SetSoundConeAngles: "\n\n\n@note This call is only valid if the sound was created with 3d enabled.\n\n",
    SetSoundConeOrientation: "\n\n\n@note This call is only valid if the sound was created with 3d enabled.\n\n",
    SetSoundPosition: "\n\n\n@note This call is only valid if the sound was created with 3d enabled.\n\n",
    SetSoundVelocity: "\n\n\n@note This call is only valid if the sound was created with 3d enabled.\n\n",
    AttachSoundToUnit:
        "\nAttaches the sound soundHandle to unit whichUnit. Attaching sound to unit means\nthat the more far away the player stays from the unit to which the sound is attached, the less\nloud the sound plays (the volume of the attached sound decreases with increasing distance).\n\n@param soundHandle The 3D sound to play.\n@param whichUnit The unit to attach the sound to.\n\n@note This call is only valid if the sound was created with 3d enabled.\n\n\n",
    StartSound:
        "\nStarts the sound.\n\n\n@note You can only play the same sound handle once.\n\n@note You can only play 16 sounds in general.\n\n@note Sounds of the same filepath (on different sound handles) must have a delay\nof at least 0.1 seconds inbetween them to be played.\nYou can overcome this by starting one earlier and then using `SetSoundPosition`.\n\n",
    StartSoundEx:
        "\nStarts playing a sound. \n\n\n@note An officially exported native in: 1.33.0 (checked v1.33.0.18897 PTR).\nUnofficially available in: 1.32 (not declared a native, but visible in Lua).\n\n@bug The `fadeIn` parameter does nothing (unused); thus equivalent to `StartSound`.\n\n@note The only difference to StartSound is the optional fadeIn (boolean).\n@patch 1.33\n\n",
    StopSound:
        "\nStops the sound.\n\n@param soundHandle The sound to stop.\n@param killWhenDone The sound gets destroyed if true.\n@param fadeOut turns down the volume with `fadeOutRate` as stated in constructor.\n\n\n",
    KillSoundWhenDone: "\nDestroys the handle when the sound has finished playing.\n\n\n",
    SetMapMusic:
        "\n\n\n@note If music is disabled, these calls do nothing.\n@note If musicName is a semicolon-delimited list, the whole list of music is played. The index and random parameters seem to be with respect to the list.\n\n",
    ClearMapMusic: "\nClears the map music applied via `SetMapMusic`.\n\n\n",
    PlayMusic:
        "\nSets the file as the current music for the map, and plays it.\n\n@param musicName The path to the music file.\n\n@note Music is on its own channel and can be toggled on and off within the Warcraft III game menu.\n@bug This native may cause a short lag spike as soon as the music starts. To circumvent this lag, stop the current music without fadeout before calling this function (`call StopMusic(false)`).\n@note Should work with mp3s, midis and wavs.\n@note If musicName is a semicolon-delimited list, the whole list of music is played.\n\n",
    PlayMusicEx:
        "\nSets the file as the current music for the map, and plays it.\n\n@param musicName The path to the music file.\n@param frommsecs At what offset the music starts. In milliseconds.\n@param fadeinmsecs How long the music is faded in. In milliseconds.\n\n@note Music is on its own channel and can be toggled on and off within the Warcraft III game menu.\n@bug This native may cause a short lag spike as soon as the music starts. To circumvent this lag, stop the current music without fadeout before calling this function (`call StopMusic(false)`).\n@note Should work with mp3s, midis and wavs.\n\n",
    StopMusic: "\nStops the current music.\n\n\n",
    ResumeMusic: "\nResumes music.\n\n\n",
    PlayThematicMusic:
        "\nThe thematic music does not play repeatedly, but interrupts the PlayMusic-music.\n\n@param musicFileName The path to the music file.\n\n@note Only one thematic music at a time, cancels the previous one.\n@note Probably meant for boss fights and similar where the sound should go in foreground.\n\n\n",
    PlayThematicMusicEx:
        "\nThe thematic music does not play repeatedly, but interrupts the PlayMusic-music.\n\n@param musicFileName The path to the music file.\n@param frommsecs At what offset the music starts. In milliseconds.\n\n@note Only one thematic music at a time, cancels the previous one.\n@note Probably meant for boss fights and similar where the sound should go in foreground.\n\n\n",
    EndThematicMusic: "\nStops thematic music.\n\n\n",
    SetMusicVolume: "\nSets the music volume.\n\n@param volume Volume between 0 and 127.\n\n\n",
    SetThematicMusicVolume: "\n\n\n@patch 1.32.2\n\n",
    GetSoundDuration:
        "\nReturns sound length in milliseconds.\n\n\n@note Beweare that this might return different values for different players\nif you use native wc3-sounds as these can have different length in different languages.\nThis can cause desyncs if you use the duration for non-local stuff.\n\n@async \n\n",
    GetSoundFileDuration:
        "\nReturns length of the sound file under the path in milliseconds.\n\n\n@note Beweare that this might return different values for different players\nif you use native wc3-sounds as these can have different length in different languages.\nThis can cause desyncs if you use the duration for non-local stuff.\n\n@async \n\n",
    GetSoundIsPlaying: "\n\n\n@note If you just started the sound this still returns false.\n\n@async \n\n",
    SetSoundFacialAnimationLabel: "\n\n\n@patch 1.32\n\n",
    SetSoundFacialAnimationGroupLabel: "\n\n\n@patch 1.32\n\n",
    SetSoundFacialAnimationSetFilepath: "\n\n\n@patch 1.32\n\n",
    SetDialogueSpeakerNameKey: "\n\n\n@patch 1.32\n\n",
    GetDialogueSpeakerNameKey: "\n\n\n@patch 1.32\n\n",
    SetDialogueTextKey: "\n\n\n@patch 1.32\n\n",
    GetDialogueTextKey: "\n\n\n@patch 1.32\n\n",
    AddWeatherEffect:
        '\nCreates a weather effect that is spatially limited to the specified area.\n\nThis creates a new object and returns its handle, to prevent leaks it must be destroyed\nwith `RemoveWeatherEffect` when no longer needed.\n\nThe weather effect is created initially disabled and must be turned on with `EnableWeatherEffect`.\n\n**Example (Lua):** to create an "Ashenvale Heavy Rain" at map center:\n\n```{.lua}\ncenter = Rect(-1024, -1024, 1024, 1024)\nweather = AddWeatherEffect(center, FourCC("RAhr"))\nEnableWeatherEffect(weather, true)\n```\n\n@param where The rect where the weather will be visible.\n\n@param effectID (Rawcode) Which weather preset to apply.\n\n\n@note To understand more about weather effects nature, I advise to read\nAmmorth\'s article about weather effects: <http://www.wc3c.net/showthread.php?t=91176>.\n\n@note To get an idea on how to add your own weather effects, you may read\nCryoniC\'s article about custom weather effects: <http://www.wc3c.net/showthread.php?t=67949>.\n\n@note The weather effects are defined in `terrainart/weather.slk` in game files.\nThe [current default list is here](https://www.hiveworkshop.com/threads/how-to-create-random-weather.198658/post-1953519) (v1.32.10).\n\n',
    RemoveWeatherEffect:
        "\nRemoves the weather effect (visually instant) and frees the handle.\n\n\n@note See: `AddWeatherEffect`, `EnableWeatherEffect`.\n\n",
    EnableWeatherEffect:
        "\nSmoothly enables/disables the given weather effect.\n\n@param whichEffect A handle of target weather effect.\n@param enable `true` to enable, `false` to disable the effect.\n\n\n@note See: `AddWeatherEffect`, `RemoveWeatherEffect`.\n\n",
    TerrainDeformCrater:
        "\nCreate a crater at the given coordinates.\n\n@param x The x coordinate of the craters center.\n@param y The y coordinate of the craters center.\n@param radius The radius of the crater.\n@param depth The depth of the crater.\n@param duration The duration in milliseconds.\n@param permanent Make the deformation permanent.\n\n@note To approximate the resulting height of a point `distance` units away from the\ncenter point `(x, y)` you can use the following formula: `Cos(bj_PI/2 * distance / radius) * -depth`. See this [issue](https://github.com/lep/jassdoc/issues/31) for some more information.\n\n@note Not every player might display those transformations due to graphics\nsettings. Thus reading data like terrain height might lead to async values.\nSee the other note on a way to compute an appropiate height to use instead.\n\n@note Permanent terrain deformations are not present in saved game files.\n\n\n",
    TerrainDeformRipple:
        "\n\n@param duration The duration in milliseconds.\n\n\n@note Permanent terrain deformations are not present in saved game files.\n\n",
    TerrainDeformWave: "\n\n\n@note Permanent terrain deformations are not present in saved game files.\n\n",
    TerrainDeformRandom:
        "\n\n@param duration The duration in milliseconds.\n\n\n@note Permanent terrain deformations are not present in saved game files.\n\n",
    AddSpecialEffect:
        "\nCreates the special effect in point with coordinates (x;y) using the model file with a path modelName.\nThe altitude (Z) of the newly spawned effect is at the ground level, be it terrain, some pathable destructable or on top of water.\nIn other words, the effect's Z coordinate does not have to be 0.\n\n\n@note To create an effect with an offset in relation to the ground before 1.30 patch, see <http://www.hiveworkshop.com/forums/1561722-post10.html>\n@note In case of 1.30 patch or higher, use `BlzSetSpecialEffectZ` native.\n\n@note To create an effect only visible to one player see <https://www.hiveworkshop.com/threads/gs.300430/#post-3209073>\n\n",
    AddSpecialEffectLoc:
        "\nCreates the special effect in the stated location using the model file with a path modelName.\nThe altitude (Z) of the newly spawned effect is at the ground level, be it terrain, some pathable destructable or on top of water.\nIn other words, the effect's Z coordinate does not have to be 0.\n\n\n@note To create an effect with a z-position not zero see <http://www.hiveworkshop.com/forums/1561722-post10.html>.\n\n@note To create an effect only visible to one player see <https://www.hiveworkshop.com/threads/gs.300430/#post-3209073>.\n\n",
    AddSpecialEffectTarget:
        '\nAttaches the special effect to the attachment point attachPointName of the\ntarget widget, using the model file with a path modelName.\n\nUpon creation, the effect will play its "birth" animation followed by its "stand" animation (once the birth animation has finished). If the model does not have animations, it will show up the way it appears by default. The effect will last indefinitely unless it is destroyed, even if the model seems to disappear. To destroy an effect, see DestroyEffect.\n\n\n@param modelName The path of the model. Use double backslashes when specifying\na directory, rather than single backslashes. See AddSpecialEffect for an example.\n\n@param targetWidget The widget to attach the effect to.\n\n@param attachPointName The attachment point of the widget where the effect will\nbe placed. Attachment points are points in a model that can be referenced to as\nareas for effects to be attached, whether it be from a spell or this function.\nA list of common attachment points in in-game Warcraft 3 models can be seen below.\nIf the attachment point does not exist, it will attach the effect to the model\'s origin.\n\n\n@note Strings such as "Large" and "Medium" affect effects\' sizes on the widget\nit is attached to. You can add or remove these by going to the object editor and\nmodifying "Art - Required Animation Names - Attachments" for a particular unit\nyou are attaching effects to. \n\n@note To create an effect only visible to one player see <https://www.hiveworkshop.com/threads/gs.300430/#post-3209073>.\n\n\n',
    AddSpellEffect: "\n\n\n@note No one knows what abilityString is supposed to be.\n@bug Does nothing.\n\n",
    AddSpellEffectLoc: "\n\n\n@note No one knows what abilityString is supposed to be.\n@bug Does nothing.\n\n",
    AddSpellEffectById:
        "\nCreates the special effect in point with coordinates (x;y) with Z = 0 using the\nmodel file from the Object Editor field of type t from the ability, unit or\nbuff (works with all these types, though the name states it's ability-only\nfunction) with raw code abilityId. If this field has more than one effect\ninside, it will only create the first effect stated in the field, ignoring\nall others.\n\n\n@note To create an effect with a z-position not zero see <http://www.hiveworkshop.com/forums/1561722-post10.html>.\n\n",
    AddSpellEffectByIdLoc:
        "\nCreates the special effect in location where with Z = 0 using the model file\nfrom the Object Editor field of type t from the ability, unit or buff (works\nwith all these types, though the name states it's ability-only function) with\nraw code abilityId. If this field has more than one effect inside, it will only\ncreate the first effect stated in the field, ignoring all others.\n\n\n@note To create an effect with a z-position not zero see <http://www.hiveworkshop.com/forums/1561722-post10.html>.\n\n",
    AddSpellEffectTargetById:
        "\nAttaches the special effect to the attachment point attachPointName of the\ntarget widget, using the model file from the Object Editor field of type t from\nthe ability, unit or buff (works with all these types, though the name states\nit's ability-only function) with raw code abilityId. If this field has more than\none effect inside, it will only create the first effect stated in the field,\nignoring all others.\n\n\n",
    AddLightning:
        "\nCreates a lightning between two points.\n\n@param codeName 4 letter id from the LightningData.slk.\n@param checkVisibility If this is true, the lightning won't be created and the function will return null unless the local player\ncurrently has as visibility of at least one of the endpoints of the to be created lightning.\n@param x1 x-coordinate (World) of source point.\n@param y1 y-coordinate (World) of source point.\n@param x2 x-coordinate (World) of target point.\n@param y2 y-coordinate (World) of target point.\n\n\n@note The source z value of the new lightning is set to match the current terrain height of the source point, analogously, the target z value\nmatches the current terrain height of the target point. Later changes to the terrain height do not affect herewith created existing lightnings anymore.\n\n",
    AddLightningEx:
        "\nCreates a lightning between two points.\n\n@param codeName 4 letter id from the LightningData.slk.\n@param checkVisibility If this is true, the lightning won't be created and the function will return null unless the local player\ncurrently has visibility of at least one of the endpoints of the to be created lightning.\n@param x1 x-coordinate (World) of source point.\n@param y1 y-coordinate (World) of source point.\n@param z1 z-coordinate (World) of source point.\n@param x2 x-coordinate (World) of target point.\n@param y2 y-coordinate (World) of target point.\n@param z2 z-coordinate (World) of target point.\n\n\n",
    DestroyLightning: "\nDestroys a lightning.\n\n@param whichBolt The lightning to be destroyed.\n\n\n",
    MoveLightning:
        "\nMoves a lightning.\n\n@param whichBolt The lightning to be moved.\n@param checkVisibility If this is true, the lightning won't be moved (at all) unless the local player\ncurrently has visibility of at least one of the new endpoints.\n@param x1 x-coordinate (World) of the new source point.\n@param y1 y-coordinate (World) of the new source point.\n@param x2 x-coordinate (World) of the new target point.\n@param y2 y-coordinate (World) of the new target point.\n\n\n",
    MoveLightningEx:
        "\nMoves a lightning.\n\n@param whichBolt The lightning to be moved.\n@param checkVisibility If this is true, the lightning won't be moved (at all) unless the local player\ncurrently has visibility of at least one of the new endpoints.\n@param x1 x-coordinate (World) of the new source point.\n@param y1 y-coordinate (World) of the new source point.\n@param z1 z-coordinate (World) of the new source point.\n@param x2 x-coordinate (World) of the new target point.\n@param y2 y-coordinate (World) of the new target point.\n@param z2 z-coordinate (World) of the new target point.\n\n\n",
    GetLightningColorA: "\nGets the alpha value of a lightning.\n\n\n",
    GetLightningColorR: "\nGets the red color value of a lightning.\n\n\n",
    GetLightningColorG: "\nGets the green color value of a lightning.\n\n\n",
    GetLightningColorB: "\nGets the blue color value of a lightning.\n\n\n",
    SetLightningColor:
        "\nSets the coloring of a lightning.\n\n@param whichBolt The lightning to be colored.\n@param r 0-1 visibility of red channel (value mod 1)\n@param g 0-1 visibility of green channel (value mod 1)\n@param b 0-1 visibility of blue channel (value mod 1)\n@param a 0-1 alpha value/overall visibility multiplier (value mod 1)\n\n\n@note The default is 1, 1, 1, 1.\n\n@bug This native is inaccurate. The modulo is not exactly 1 and even setting a color value to e.g. 0.1 yields 0.098.\n\n",
    GetAbilityEffect: "\n\n\n@note No one knows what abilityString is supposed to be.\n@bug Does nothing.\n@pure \n\n",
    GetAbilityEffectById: "\n\n\n@pure \n\n",
    GetAbilitySound: "\n\n\n@note No one knows what abilityString is supposed to be.\n@bug Does nothing.\n@pure \n\n",
    GetAbilitySoundById: "\n\n\n@pure \n\n",
    GetTerrainCliffLevel:
        "\nGets the cliff level at a point.\n\n@param x x-coordinate (World) of the point.\n@param y y-coordinate (World) of the point.\n\n\n@note Walkable destructables add their effective cliff level to the terrain across their pathing maps, i.e., if the terrain at some point\nwithout destructables has a cliff height of a and the destructable covering that point has an effective cliff height of b, this function returns a + b. If there\nare multiple walkable destructables intersecting at the requested point, the function returns a + max(b1, b2, ...). If the declared cliff height of a destructable\nis negative, it will have an effective cliff height of 0.\n\n",
    SetWaterBaseColor:
        "\nSets the tint of the water.\n\n@param red 0-255 red color (value mod 256).\n@param green 0-255 green color (value mod 256).\n@param blue 0-255 blue color (value mod 256).\n@param alpha 0-255 opaqueness (value mod 256).\n\n\n@note The default is 255 for all parameters.\n\n@bug In HD, the alpha setting seems to only affect the water surface.\n\n",
    SetWaterDeforms:
        "\nSets whether terrain deformations also affect the water mesh on top of it.\n\n@param val If this is true, terrain deformations will affect the water mesh.\n\n\n@note This is only during transitions of terrain deformations, i.e., for temporary terrain deformations and during the transition\nof permanent terrain deformations. After a permanent terrain deformation has completed, the water deformation will revert instantly.\n\n@note The default is false.\n\n",
    IsTerrainPathable:
        "\nReturns if a specific pathingtype is set at the location.\n\n@note Returns true if the pathingtype is *not* set, false if it *is* set.\n\n",
    CreateImage:
        "\nThis returns a new image, the first ID given being 0 and then counting upwards (0, 1, 2, 3, ...).\n\n@param file The path to the image. The image itself should have its border alpha-ed out\ncompletely. If an invalid path is specified CreateImage returns image(-1).\n\n@param sizeX The x-dimensions of the image.\n\n@param sizeY The y-dimensions of the image.\n\n@param sizeZ The z-dimensions of the image.\n\n@param posX The x-cooridnate of where to create the image. This is the bottom left corner of the image.\n\n@param posY The y-cooridnate of where to create the image. This is the bottom left corner of the image.\n\n@param posZ The z-cooridnate of where to create the image.\n\n@param originX Moves the origin (bottom left corner) of the image from posX in negative X-direction.\n\n@param originY Moves the origin (bottom left corner) of the image from posY in negative Y-direction.\n\n@param originZ Moves the origin (bottom left corner) of the image from posZ in negative Z-direction.\n\n@param imageType Working values range from 1 to 4 (4 and 1 included).\nUsing 0 causes CreateImage to return image(-1). Every other value will simply\ncause WC3 to not display the image.\nimageTypes also influence the order in which images are drawn above one another:\n\n| Value | Name           | Description |\n|-------|----------------|-------------|\n| 1     | Selection      | Drawn above all other imageTypes. |\n| 2     | Indicator      | Drawn above imageType 4, but below 1 and 3. |\n| 3     | Occlusion Mask | Drawn above imageType 4 and 2 and below imageType 1. |\n| 4     | Ubersplat      | Drawn below every other type. Images of this type are additionally affected by time of day and the fog of war (only for tinting). |\n\n\n\nMultiple images with the same type are drawn in their order of creation,\nmeaning that the image created first is drawn below the image created after.\n\n\n",
    DestroyImage:
        "\nThis function destroys the image specified and recycles the handle ID of that\nimage instantly (no ref counting for images).\n\n@param whichImage Which image to destroy.\n\n\n@bug May crash the game if an invalid image is used (null, before the first image is created).\n\n",
    ShowImage:
        "\nIt shows/hides image whichImage, depending on boolean flag (true shows, false hides).\nSeems like a redundant function in the light of SetImageRender(Always).\n\n\n",
    SetImageConstantHeight:
        "\nUntested, but if its decription can account for anthing, it locks the Z position\nto the given height, if the flag is true. After a bit of testing i concluded\nthat this is the only function thats able to modify an images Z offset.\n\n\n",
    SetImagePosition:
        "\nSets the X/Y position of the provided image.\nThis is the bottom left corner of the image, unless you used values\nform originX/Y/Z in the constructor other than 0, in which case the bottom\nleft corner is moved further into negative X/Y/Z direction.\n\n\n",
    SetImageColor: "\nValid values for all channels range from 0 to 255.\n\n\n",
    SetImageRender: "\n\n\n@bug Does not work. Use `SetImageRenderAlways` instead.\n\n",
    SetImageRenderAlways:
        "\nSince `SetImageRender` is non-functional, this should be used to\nenable/disable rendering of the image.\n\n\n",
    SetImageAboveWater:
        "\nDraws the specified image above the water if the flag is true. The second\nboolean (useWaterAlpha) doesnt seem to do much. Every imagetype other than 1\ndoesnt seem to appear above water.\n\n\n",
    SetImageType:
        "\nChanges the specified images type.\n\n@param imageType Influence the order in which images are drawn above one another:\n\n| Value | Name           | Description |\n|-------|----------------|-------------|\n| 1     | Selection      | Drawn above all other imageTypes. |\n| 2     | Indicator      | Drawn above imageType 4, but below 1 and 3. |\n| 3     | Occlusion Mask | Drawn above imageType 4 and 2 and below imageType 1. |\n| 4     | Ubersplat      | Drawn below every other type. Images of this type are additionally affected by time of day and the fog of war (only for tinting). |\n\nMultiple images with the same type are drawn in their order of creation,\nmeaning that the image created first is drawn below the image created after.\n\n\n",
    ResetUbersplat: "\n\n\n@bug Does nothing.\n\n",
    FinishUbersplat: "\n\n\n@bug Does nothing.\n\n",
    CreateBlightedGoldmine:
        "\nCreates a new, undead blighted gold mine unit at the specified coordinates for the player. The haunted gold mine will create blight around the area, and will become a normal gold mine when destroyed. The amount of gold in the mine is determined by the Data - Max Gold field for the ability Gold Mine ability ('Agld').\n\n@param id The player to create the goldmine for.\n\n@param x The x-coordinate of the goldmine.\n\n@param y The y-coordinate of the goldmine.\n\n@param face The facing of the goldmine in degrees.\n\n\n",
    SetDoodadAnimation:
        '\nMakes doodads in the vicinity of a point play an animation.\n\n@param x x-coordinate (world units) of the point.\n@param y y-coordinate (world units) of the point.\n@param radius Maximum pick distance from the point.\n@param doodadID The type of the doodad that should be affected.\n@param nearestOnly If true, only the single doodad (of the given type) closest to the point will be affected, otherwise all in the vicinity (of the given type).\n@param animName String identifier of the animation that should be played.\n@param animRandom If true, the animation to be played will be picked from an extended set including different variations of the animName, e.g., if animName is "walk", it can also be "walk defend".\n\n\n@note Only doodads whose origin is within the radius distance of the point are considered.\n\n@note There are the special values "hide" and "show" for animName, which will hide respectively show the doodad. When a doodad is hidden this way, its animation will pause at the current time frame. Re-showing the doodad resumes the animation.\n\n@note If a target does not have an animation identified by animName (and it\'s not one of the special animation names either), it will play its first declared animation instead.\n\n@bug If animName is null and there is at least one target, the game will crash.\n\n@note If animRandom is true and the picked animation is looped, it will freshly re-pick from the set when an animation ends.\n\n',
    SetDoodadAnimationRect:
        "\nMakes doodads within a rect play an animation.\n\n@param r The rect wherein doodads should play an animation.\n\n\n@note Only doodads whose origin is in the rect are considered targets.\n\n@note The animation won't play for an observer until they have sight visibility of the doodad, at which point it will play.\n\nSee `SetDoodadAnimation` for other parameters and notes.\n\n",
    Cheat: '\nApplies the specified cheat, but only if the game is single player. There are a\nfew cheats that can be toggled on or off. If the cheat is enabled, entering the\ncheat again will disable it. If the cheat is disabled, entering the cheat will\nenable it again. Upon entering, the text "Cheat Enabled!" will be displayed.\n\n@param cheatStr The cheat to enter. \n\n\n@note For a list of all cheats see <http://classic.battle.net/war3/cheatcodes.shtml>.\n\n',
    IsNoVictoryCheat: '\nReturns true if "ItVexesMe" aka "no victory" cheat is enabled.\n\n\n',
    IsNoDefeatCheat: '\nReturns true if "StrengthAndHonor" aka "no defeat" cheat is enabled.\n\n\n',
    Preload:
        '\nIt does two things:\n\n1. Try to read the file, if "Allow Local Files" is enabled then also searches in the game folder\n2. Append filename to preload buffer\n\n@param filename Text string, supposed to be a file path to be preloaded. Max length: 259 characters (see Windows MAX_PATH).\n\n\n@note The game only reads these files, does not load them. The reading is done in a separate thread and does not freeze the game. One file is not read twice, no matter how often you call Preload().\n\n@note Trick: It does not escape double-quotes " on purpose (approved not a bug, it\'s a feature).\nIt is possible to inject custom code in Preload files this way (Lua):\n\n```{.lua}\nPreloadGenClear()\nPreloadGenStart()\nPreload(\' ")\\ncall otherFunction("123")\\n//\')\nPreloadGenEnd("its-a-feature.txt")\n```\n\t\nResults in the following preload file code (Jass):\n\n    function PreloadFiles takes nothing returns nothing\n     \n            call PreloadStart()\n            call Preload( " ")\n    call otherFunction("123")\n    //" )\n            call PreloadEnd( 754.6 )\n     \n    endfunction\n\n\n@note **Game folder:**\nReforged: `Warcraft III\\_retail_\\somefile.txt`, instead of `_retail_` there\'s also a `_ptr_` game version currently.\nClassic: ?\n\n@note **Mini tutorial:**\n\n**What are Preload files?**\n\nPreload files instruct the game to pre-read a file/resources to avoid freezes/stutter during gameplay. It\'s done to move the file into OS cache. Blizzard used preload files to load all required files at map init. See blizzard.j or campaign maps.\n\nCreate a preload file (Lua)\n\n```{.lua}\nPreloadGenClear()\nPreloadGenStart()\n-- call Preload("filename.ext") as often as you need, one call per file you add\nPreload("Textures\\\\Knight.blp")\nPreloadGenEnd("MyPreloadFile.txt")\n```\n\n**How to run a preload file**\n\nThis must be done manually:\n\n```{.lua}\nPreloader("MyPreloadFile.txt")\n```\n\t\n**Lua code in preload files?**\n\nIt is possible although in a very hacky way, [described here](https://www.hiveworkshop.com/threads/blizzards-hidden-jass2lua-transpiler.337281/).\nYou need to use "//! beginusercode" to start a section containing Lua code and end it using "//! endusercode".\nIt works because the code is compiled on the fly with Jass2Lua.\n\n\n@note See: `PreloadEnd`, `PreloadStart`, `PreloadRefresh`, `PreloadEndEx`, `PreloadGenClear`, `PreloadGenStart`, `PreloadGenEnd`, `Preloader`.\n@note Also see the documentation for `Preloader` for more info on the generated files.\n\n',
    PreloadEnd:
        "\nUnknown. It's always generated at the end of a preload file, timeout represents the time between calls to `PreloadStart` and `PreloadGenEnd`.\n\n\n@note See: `Preload`, `PreloadStart`, `PreloadRefresh`, `PreloadEndEx`, `PreloadGenClear`, `PreloadGenStart`, `PreloadGenEnd`, `Preloader`.\n\n",
    PreloadStart:
        "\nClears the preload buffer and starts the timer. (Anything else?)\n\n\n@note See: `Preload`, `PreloadEnd`, `PreloadRefresh`, `PreloadEndEx`, `PreloadGenClear`, `PreloadGenStart`, `PreloadGenEnd`, `Preloader`.\n\n",
    PreloadRefresh:
        "\nUnknown. It does not reset the timer or clear the buffer.\n\n\n@note See: `Preload`, `PreloadEnd`, `PreloadStart`, `PreloadEndEx`, `PreloadGenClear`, `PreloadGenStart`, `PreloadGenEnd`, `Preloader`.\n\n",
    PreloadEndEx:
        "\nUnknown\n\n\n@note See: `Preload`, `PreloadEnd`, `PreloadStart`, `PreloadRefresh`, `PreloadGenClear`, `PreloadGenStart`, `PreloadGenEnd`, `Preloader`.\n\n",
    PreloadGenClear:
        "\nClears all added file paths from the current preload buffer. Does not reset the timer.\n\n\n@note See: `Preload`, `PreloadEnd`, `PreloadStart`, `PreloadRefresh`, `PreloadEndEx`, `PreloadGenStart`, `PreloadGenEnd`, `Preloader`.\n\n",
    PreloadGenStart:
        "\nStarts an internal timer for preloads. The timer will be used and recorded by `PreloadGenEnd`. The timer represents the wall clock time (in seconds) spent between the calls `PreloadStart()` and `PreloadGenEnd()`.\n\nThis function does not clear the previous buffer.\n\nThe recorded time will be output as `call PreloadEnd( 0.123 )` in the saved preload file.\n\n\n@note See: `Preload`, `PreloadEnd`, `PreloadStart`, `PreloadRefresh`, `PreloadEndEx`, `PreloadGenClear`, `PreloadGenStart`, `PreloadGenEnd`, `Preloader`.\n\n",
    PreloadGenEnd:
        '\nWrites the current Preload buffer to specified file.\nThe first and final preload directives are `call PreloadStart()` and `call PreloadEnd( realTime )`. The value represents the time in seconds between the calls `PreloadStart` and `PreloadGenEnd`. There\'s no way to get this value with the API.\n\nDoes not clear the buffer or timer after flushing. The file is overwritten. It\'s possible to specify subfolders: "myMapFolder/file.txt". Reforged: Any other tricks such as relative paths, UNC or drive letters will not write any files. Classic: possible to write to any path (verify?)\n\n**Example preload file:*\n\n\tfunction PreloadFiles takes nothing returns nothing\n\n\t\tcall PreloadStart()\n\t\tcall Preload( "units\\\\human\\\\Knight\\\\Knight.mdx" )\n\t\tcall PreloadEnd( 2.5 )\n\n\tendfunction\n\n@param filename The filepath to be written to. Max length for filename is 259 characters (see: Windows MAX_PATH).\n\n\n@note Before Reforged (which version?) you needed to enable "Allow Local Files" in registry.\n\n@note **Save Path:**\n\nReforged: `%USERPROFILE%\\Documents\\Warcraft III\\CustomMapData\\`\n\nClassic: ?\n\n@note See: `Preload`, `PreloadEnd`, `PreloadStart`, `PreloadRefresh`, `PreloadEndEx`, `PreloadGenClear`, `PreloadGenStart`, `Preloader`.\n\n',
    Preloader:
        "\nRuns the filename as a preload script, only if the filename has an extension. For Jass, the capabilities are very restricted.\n\n**Example (from blizzard.j)**:\n\n    if (doPreload) then\n            call Preloader( \"scripts\\\\HumanMelee.pld\" )\n    endif\n\n@param filename The file to execute.\n\n\n@note There're no restrictions for Lua code if you add it to Preload files (which are supposed to be in Jass), that's only possible with [dirty hacks or manual editing](https://www.hiveworkshop.com/threads/blizzards-hidden-jass2lua-transpiler.337281/). If the map runs in Lua mode, the Jass code is compiled using Jass2Lua before execution.\n\n@note On pre-Reforged (version?) this only works if you have enabled the usage of local files in your registry.\nThe registry key is `HKEY_CURRENT_USER\\Software\\Blizzard Entertainment\\Warcraft III\\Allow Local Files\\`\n\n@note Here are some ways to get the data out of the preload file into your map:\nTo store multiple integers you can use `SetPlayerTechMaxAllowed` to have a good\n2d-array. Read via `GetPlayerTechMaxAllowed`.\n\nFor strings `SetPlayerName` is suited. To read use `GetPlayerName`.\n\nInside the preload script you can also use `ExecuteFunc` to call your map-defined\nfunctions and interleave the preload script with your functions.\n\n@note If you use `Preloader` to load some values into your map, these values\nare very likely to be different for each player (since the player might not \neven have local files enabled), so treat them as async values.\n\n@note Also see the documentation of `Preload` to see how to properly get the data\ninto the preload script.\n\n@bug 1.33.0 and above: Due to aggressive file caching by the game, the preload file is only loaded and read once.\nThis means, updates to the saved preload file cannot be reloaded and old contents will be executed.\n\n@note See: `Preload`, `PreloadEnd`, `PreloadStart`, `PreloadRefresh`, `PreloadEndEx`, `PreloadGenClear`, `PreloadGenStart`, `PreloadGenEnd`.\n\n",
    BlzHideCinematicPanels:
        "\n\n\n@bug (v1.32.10, Lua)\nEnabling this mode without cinematic mode produces no visible differences. (TODO)\n\nHowever, it shifts the rendered view towards north (without changing the\ncamera position) until disabled again.\n\nSee [test code](https://github.com/Luashine/wc3-test-maps/blob/master/BlzHideCinematicPanels.md)\n\n@patch 1.32\n\n",
    AutomationSetTestType: "\n\n\n@patch 1.29\n\n",
    AutomationTestStart: "\n\n\n@patch 1.29\n\n",
    AutomationTestEnd: "\n\n\n@patch 1.30\n\n",
    AutomationTestingFinished: "\n\n\n@patch 1.30\n\n",
    BlzGetTriggerPlayerMouseX:
        "\nIt is used inside a mouse event trigger’s action/condition it will return only the X coordinate (Cartesian System) of the current location of the mouse (ground) at the moment of the event trigger.\n\n\n@event EVENT_PLAYER_MOUSE_MOVE\n@patch 1.29\n\n",
    BlzGetTriggerPlayerMouseY:
        "\nIt is used inside a mouse event trigger’s action/condition it will return only the Y coordinate (Cartesian System) of the current location of the mouse (ground) at the moment of the event trigger.\n\n\n@event EVENT_PLAYER_MOUSE_MOVE\n@patch 1.29\n\n",
    BlzGetTriggerPlayerMousePosition:
        "\nIt is used inside a mouse event trigger’s action/condition it will return a location (type, based on the ground not screen) of the mouse at the moment of the event trigger.\n\n\n@event EVENT_PLAYER_MOUSE_MOVE\n@patch 1.29\n\n",
    BlzGetTriggerPlayerMouseButton:
        "\nIt is used inside a mouse event trigger’s action/condition it will return the mousebuttontype (type) used at the moment of the event trigger.\n\n\n@event EVENT_PLAYER_MOUSE_UP\n@event EVENT_PLAYER_MOUSE_DOWN\n@patch 1.29\n\n",
    BlzSetAbilityTooltip: "\nSet the ability tooltip (basic) of an ability at runtime.\n\n\n@patch 1.29\n\n",
    BlzSetAbilityActivatedTooltip:
        "\nSet the activated ability tooltip (for abilities such as defend which have an “active” state) of an ability at runtime.\n\n\n@patch 1.29\n\n",
    BlzSetAbilityExtendedTooltip: "\nSet the ability tooltip (extended) of an ability at runtime.\n\n\n@patch 1.29\n\n",
    BlzSetAbilityActivatedExtendedTooltip:
        "\nSet the activated ability tooltip (Extended state for abilities such as defend which have an “active” state) of an ability at runtime.\n\n\n@patch 1.29\n\n",
    BlzSetAbilityResearchTooltip:
        "\nSet the research ability tooltip (For abilities that can be learned (all abilities have this, but only hero abilities show it on the object editor, you can still change it with these natives)) of an ability at runtime.\n\n\n@patch 1.29\n\n",
    BlzSetAbilityResearchExtendedTooltip:
        "\nSet the research ability tooltip (Extended state for abilities that can be learned (all abilities have this, but only hero abilities show it on the object editor, you can still change it with these natives)) of an ability at runtime.\n\n\n@patch 1.29\n\n",
    BlzGetAbilityTooltip:
        "\nGet the ability tooltip of an ability.\nSupports Unit/Item/Ability/Tech Codes.\n\n\n@async \n@patch 1.29\n\n",
    BlzGetAbilityActivatedTooltip:
        "\nGet the ability activated tooltip (for abilities that have an “activated” state) of an ability.\n\n\n@async \n@patch 1.29\n\n",
    BlzGetAbilityExtendedTooltip:
        "\nGet the extended ability tooltip of an ability.\nSupports Unit/Item/Ability/Tech Codes.\n\n\n@async \n@patch 1.29\n\n",
    BlzGetAbilityActivatedExtendedTooltip:
        "\nGet the extended ability activated tooltip (for abilities that have an “activated” state such as defend, Avatar, etc.) of an ability.\n\n\n@async \n@patch 1.29\n\n",
    BlzGetAbilityResearchTooltip:
        "\nGet the ability research tooltip (for abilities that can be researched/learned such as defend, hero abilities, etc) of an ability.\n\n\n@async \n@patch 1.29\n\n",
    BlzGetAbilityResearchExtendedTooltip:
        "\nGet the extended ability research tooltip (for abilities that can be researched/learned such as defend, hero abilities, etc) of an ability.\n\n\n@async \n@patch 1.29\n\n",
    BlzSetAbilityIcon: "\nChange(set) an ability’s icon at runtime.\n\n\n@patch 1.29\n\n",
    BlzGetAbilityIcon:
        "\nGet an ability’s icon at runtime, returns the icon path.\nSupports Unit/Item/Ability/Tech Codes.\n\n\n@patch 1.29\n\n",
    BlzSetAbilityActivatedIcon:
        "\nChange(set) an ability’s activated icon (this is for abilities that have an activated state such as defend, avatar, etc) at runtime.\n\n\n@patch 1.29\n\n",
    BlzGetAbilityActivatedIcon:
        "\nGet an ability’s activated icon (this is for abilities that have an activated state such as defend, avatar, etc) at runtime, returns icon path.\n\n\n@patch 1.29\n\n",
    BlzGetAbilityPosX:
        "\nGet the ability X coordinate (Cartesian System) of the ability icon in the default 4x3 grid.\n\n\n@patch 1.29\n\n",
    BlzGetAbilityPosY:
        "\nGet the ability Y coordinate (Cartesian System) of the ability icon in the default 4x3 grid.\n\n\n@patch 1.29\n\n",
    BlzSetAbilityPosX:
        "\nSet the ability X coordinate (Cartesian System) of the ability icon in the default 4x3 grid.\nAs of the 1.31 PTR while you can specify the position of abilities such as “Build” directly in the object editor, you cannot do it with this native.\n\n\n@patch 1.29\n\n",
    BlzSetAbilityPosY:
        "\nSet the ability Y coordinate (Cartesian System) of the ability icon in the default 4x3 grid.\n\n\n@note As of the 1.31 PTR while you can specify the position of abilities such as “Build” directly in the object editor, you cannot do it with this native.\n\n@patch 1.29\n\n",
    BlzGetAbilityActivatedPosX:
        "\nGet the ability X coordinate (Cartesian System) of the activated ability icon in the default 4x3 grid.\n\n\n@patch 1.29\n\n",
    BlzGetAbilityActivatedPosY:
        "\nGet the ability Y coordinate (Cartesian System) of the activated ability icon in the default 4x3 grid.\n\n\n@patch 1.29\n\n",
    BlzSetAbilityActivatedPosX:
        "\nChange(Set) the ability X coordinate (Cartesian System) of the activated ability icon in the default 4x3 grid.\n\n\n@patch 1.29\n\n",
    BlzSetAbilityActivatedPosY:
        "\nChange(Set) the ability Y coordinate (Cartesian System) of the activated ability icon in the default 4x3 grid.\n\n\n@patch 1.29\n\n",
    BlzGetUnitMaxHP: "\nGet the max HP (hit points) of a unit.\n\n\n@patch 1.29\n\n",
    BlzSetUnitMaxHP: "\nChange(set) the max HP (hit points) of a unit.\n\n\n@patch 1.29\n\n",
    BlzGetUnitMaxMana: "\nGet the max mana of a unit.\n\n\n@patch 1.29\n\n",
    BlzSetUnitMaxMana: "\nChange(set) the max mana of a unit.\n\n\n@patch 1.29\n\n",
    BlzSetItemName: "\nChange(set) the item name at runtime.\n\n\n@patch 1.29\n@bug Doesn't work.\n\n",
    BlzSetItemDescription: "\nChange(set) the item description at runtime.\n\n\n@patch 1.29\n\n",
    BlzGetItemDescription: "\nGet the item description.\n\n\n@async \n@patch 1.29\n\n",
    BlzSetItemTooltip: "\nChange(set) the item tooltip at runtime.\n\n\n@patch 1.29\n@bug Doesn't work.\n\n",
    BlzGetItemTooltip: "\nGet the item tooltip.\n\n\n@async \n@patch 1.29\n\n",
    BlzSetItemExtendedTooltip: "\nChange(set) the extended item tooltip at runtime.\n\n\n@patch 1.29\n\n",
    BlzGetItemExtendedTooltip: "\nGet the extended item tooltip.\n\n\n@async \n@patch 1.29\n\n",
    BlzSetItemIconPath: "\nChange(set) the item icon path at runtime.\n\n\n@patch 1.29\n\n",
    BlzGetItemIconPath: "\nGet the item icon path.\n\n\n@patch 1.29\n\n",
    BlzSetUnitName: "\nChange(set) the unit name at runtime.\n\n\n@patch 1.29\n\n",
    BlzSetHeroProperName:
        '\nChange(set) the hero proper name at runtime. A "proper name" is the multiple names a hero can get at random, in this case it forces a specific proper name.\n\n\n@patch 1.29\n\n',
    BlzGetUnitBaseDamage:
        "\nGet a unit’s base damage, weapon index can be either 0 and 1 (a unit can have two different attacks).\n\n\n@patch 1.29\n\n",
    BlzSetUnitBaseDamage:
        "\nChange(set) a unit’s base damage, weapon index can be either 0 and 1 (a unit can have two different attacks) at runtime.\n\n\n@patch 1.29\n\n",
    BlzGetUnitDiceNumber:
        "\nGet a unit’s dice number (damage), weapon index can be either 0 and 1 (a unit can have two different attacks).\n\n\n@patch 1.29\n\n",
    BlzSetUnitDiceNumber:
        "\nChange(set) a unit’s dice number (damage), weapon index can be either 0 and 1 (a unit can have two different attacks) at runtime.\n\n\n@patch 1.29\n\n",
    BlzGetUnitDiceSides:
        "\nGet a unit’s dice sides (damage), weapon index can be either 0 and 1 (a unit can have two different attacks).\n\n\n@patch 1.29\n\n",
    BlzSetUnitDiceSides:
        "\nChanges(set) unit’s dice sides (damage), weapon index can be either 0 and 1 (a unit can have two different attacks) at runtime.\n\n\n@patch 1.29\n\n",
    BlzGetUnitAttackCooldown:
        "\nGet a unit’s Attack Cooldown, weapon index can be either 0 and 1 (a unit can have two different attacks).\nReturns base attack cooldown (from the unit editor) in seconds, without any items, agility or buff bonuses.\n\n\n@patch 1.29\n\n",
    BlzSetUnitAttackCooldown:
        "\nSet a unit’s base Attack Cooldown, weapon index can be either 0 and 1 (a unit can have two different attacks) at runtime.\n\n\n@patch 1.29\n\n",
    BlzSetSpecialEffectColorByPlayer:
        "\nChanges(Set) the color of a special effect (tinting), using the specific player’s color, it will tint the effect on every part that it can be tinted.\n\n\n@patch 1.29\n\n",
    BlzSetSpecialEffectColor:
        "\nChanges(Set) the color of a special effect (tinting), using R (RED) G (GREEN) B (BLUE) values, it will tint the effect on every part that it can be tinted.\n\n\n@patch 1.29\n\n",
    BlzSetSpecialEffectAlpha:
        "\nChanges(Set) the alpha (transparency) of a special effect, the entire model will be made transparent based on the integer value.\n*Integer Alpha goes from 0 to 100 (it equals percentage).*\n\n\n@patch 1.29\n\n",
    BlzSetSpecialEffectScale:
        "\nChanges(Set) the scale of a special effect, the entire model will be scaled based on the scale value.\n\n*Even though scale is a real (allows negative and positive numbers with decimals), it should be logically deduced that it shouldn’t be a negative value, object editor forces the minimum to be 0.10 (10% of the original size), it is not yet tested if it supports up to 0.01(1% of the original size).*\n\n\n@patch 1.31\n\n",
    BlzSetSpecialEffectPosition:
        "\nChanges(set) the X, Y and Z (altitude) coordinate (Cartesian System) of the current location of the special effect.\n\n\n@note Z is not relative to terrain, it is absolute.\n\n@patch 1.29\n\n",
    BlzSetSpecialEffectHeight:
        "\nSets the effect's absolute Z position (height). This native is functionally identical to `BlzSetSpecialEffectZ`.\n\n\n@patch 1.29\n\n",
    BlzSetSpecialEffectTimeScale:
        "\nChanges(set) the TimeScale (animation speed) of the passed special effect.\n\n*TimeScale is a real, which means that it can be both negative and positive numbers with decimals, if you see the animation speed at 100.0 it will go at 100% speed, if you however set it to -100.0 it will go backwards and reset towards the beginning, however it can’t start at a negative value, if you want to reset the animation, you must pass it a negative value mid animation, else it will stand still.*\n\n\n@patch 1.29\n\n",
    BlzSetSpecialEffectTime:
        "\nChanges(set) the time (how long the special effect lasts) of the passed special effect.\n\n*TimeScale is a real, which means that it could be both negative and positive numbers with decimals, however it can’t be a negative value in this case.*\n\n\n@patch 1.29\n\n",
    BlzSetSpecialEffectOrientation:
        "\nChanges(set) the yaw, pitch and roll of the passed special effect.\n\n*Yaw, pitch and roll are reals, which means that they can be both negative and positive numbers with decimals.*\n\n\n@patch 1.29\n\n",
    BlzSetSpecialEffectYaw: "\n\n\n@patch 1.29\n\n",
    BlzSetSpecialEffectPitch: "\n\n\n@patch 1.29\n\n",
    BlzSetSpecialEffectRoll: "\n\n\n@patch 1.29\n\n",
    BlzSetSpecialEffectX:
        "\n\n\n@bug In 1.29 this native is bugged, it will set the X coordinate, but reset the Y and Z to where it was spawned in.\n\n@patch 1.29\n\n",
    BlzSetSpecialEffectY:
        "\n\n\n@bug In 1.29 this native is bugged, it will set the Y coordinate, but reset the X and Z to where it was spawned in.\n\n@patch 1.29\n\n",
    BlzSetSpecialEffectZ:
        "\nSets the effect's absolute Z position (height). \n\n\n@note Before 1.29 there was no direct way to set a special effect's height. The following trick was used as a workaround:\n\n    // Creates a temporary platform in the air, the special effect will be put on top of it:\n    set tempDestr = CreateDestructableZ('OTis', x, y, z, 0, 1, 0)\n    // Effect spawns on top of platform\n    call DestroyEffect(AddSpecialEffect(effectPath, x, y))\n    // Remove platform immediately, only the effect will remain visible for its life duration\n    call RemoveDestructable(tempDestr)\n\n@bug In 1.29 this native is bugged, it will set the Z coordinate, but reset the X and Y to where it was spawned in.\n\n@patch 1.29\n\n",
    BlzSetSpecialEffectPositionLoc:
        "\nChanges(set) the current location of the special effect into the passed location.\n\n\n@patch 1.29\n\n",
    BlzGetLocalSpecialEffectX:
        "\nGet the X coordinate (Cartesian System) of the current location of the special effect.\n\n\n@async \n@patch 1.29\n\n",
    BlzGetLocalSpecialEffectY:
        "\nGet the Y coordinate (Cartesian System) of the current location of the special effect.\n\n\n@async \n@patch 1.29\n\n",
    BlzGetLocalSpecialEffectZ:
        "\nGet the absolute Z coordinate (altitude)(Cartesian System) of the current location of the special effect.\n\n\n@async \n@patch 1.29\n\n",
    BlzSpecialEffectClearSubAnimations:
        "\nClears all subanimations (tags) of the special effect. It does not affect normal animations.\n\n**Example usage of subanimations:**\n\n    // if you play anim attack it becomes attack slam:\n    call BlzSpecialEffectAddSubAnimation(fx, SUBANIM_TYPE_SLAM)\n    call BlzPlaySpecialEffect(fx, ANIM_TYPE_SPELL)\n    call BlzSpecialEffectRemoveSubAnimation(fx, SUBANIM_TYPE_SLAM)\n\n**Examples of animations, animation names:**\n\n    stand | birth | death | decay | dissipate | walk | attack | morph | sleep | spell | portrait\n\n**Examples of subanimations (tags), subanimation names:**\n\n    first | second | third | fourth | fifth | defend | channel | slam | victory | throw | spin |\n    ready | upgrade | lumber | gold | work | talk | swim | flesh | entangle | chainlightning | rooted |\n    eattree | berserk | spiked | light | moderate | severe | critical | small | medium | large | alternateex |\n    looping | wounded | fast | turn | left | right | fire | one | two | three | four | five | fill |\n    puke | drain | flail | hit | off | complete\n\n\n@patch 1.30\n\n",
    BlzSpecialEffectRemoveSubAnimation:
        "\nClears a specific subanimation (tag) of a specified special effect. (It does not affect normal animations).\n\n\n@patch 1.30\n\n",
    BlzSpecialEffectAddSubAnimation:
        "\nAdds(set) a specific subanimation (tag) to a specified special effect.\n\n\n@patch 1.30\n\n",
    BlzPlaySpecialEffect: "\nPlays a specific subanimation (tag) on a specified special effect.\n\n\n@patch 1.30\n\n",
    BlzPlaySpecialEffectWithTimeScale:
        "\nPlays a specific subanimation (tag) on a specified special effect at a specific timeScale (speed).\n\n1. *Overrides the currently playing animation/subanimation.*\n2. *TimeScale is a real, meaning that it can be both negative and positive numbers with decimals, there are examples in which you can use negative numbers mid animation to make it go backwards, however in this case it starts at 0 meaning that it can’t be negative.*\n\n\n@patch 1.30\n\n",
    BlzGetAnimName:
        "\nReturns the string representation of the name of the animation. `animtype` is a handle of the animation type.\n\n\n@patch 1.30\n\n",
    BlzGetUnitArmor:
        "\nGet the current unit armor of a specific unit (real value).\n\n*Returns TOTAL amount of armor a unit has, including bonus (green) armor from  auras, buffs, agility and items. If you need just base or bonus armor, you need to calculate base armor yourself (for heroes: -2 + agility (excluding bonuses) * 0.3). Agility bonus also counts as bonus armor, e.g. +1 agility will be displayed as + 0.3 armor with default gameplay constants.*\n\n\n@patch 1.29\n\n",
    BlzSetUnitArmor:
        "\nChanges(set) the unit armor of a specific unit, you pass it a real value, can be negative.\n\n*Changes TOTAL amount of armor a unit has. If unit has a bonus (green) armor from an aura or item, base armor will be reduced to achieve total amount of armor you specified. E.g. a unit has 1+3 armor, if you set armor to 1.00, unit’s armor will be changed to -2+3*\n\n\n@patch 1.29\n\n",
    BlzUnitHideAbility:
        "\nHides or unhides an ability for a unit.\n\n@param whichUnit Unit to apply this to\n\n@param abilId Rawcode of ability.\n\n@param flag isHidden: true to hide, false to show.\n\n\n@bug The boolean flag doesn't work as expected, it acts more like an integer counter: <https://www.hiveworkshop.com/threads/blzunithideability-and-blzunitdisableability-dont-work.312477/>.\n\n@patch 1.29\n\n",
    BlzUnitDisableAbility:
        '\nEnables/disables and hides/unhides an ability for a unit. A visible disabled ability is shown as deactivated, an invisible ability disappears from the grid.\n\n**Example (Lua)**:\n\n```{.lua}\n-- assume u is Human Peasant, AHbu is ability for Human building.\n-- keep enabled, but hide icon\nBlzUnitDisableAbility(u, FourCC"AHbu", false, true)\n```\n\n@param whichUnit Unit to apply this to.\n\n@param abilId Rawcode of ability.\n\n@param flag isDisabled: true to disable (cannot click), false to enable ability.\n\n@param hideUI isHidden: true to completely hide the icon, false to show icon. Icons are different for disabled/enabled abilities.\n\n\n@bug (1.32.10 confirmed) The game counts isDisabled and hideUI internally as integers(?) If you called 5 times "hideUI = true" to hide an icon then you\'ll need to multiple times "hideUI = false" to show it again. I do not exactly understand how it\'s counted.\nhttps://www.hiveworkshop.com/threads/blzunithideability-and-blzunitdisableability-dont-work.312477/\n\n@patch 1.29\n\n',
    BlzUnitCancelTimedLife: "\nMakes a specific summoned unit permanent.\n\n\n@patch 1.29\n\n",
    BlzIsUnitSelectable: "\nReturns true if the unit is selectable.\n\n\n@patch 1.29\n\n",
    BlzIsUnitInvulnerable: "\nReturns true if unit is invulnerable.\n\n\n@patch 1.29\n\n",
    BlzUnitInterruptAttack: "\nInterrupts unit's current attack being casted.\n\n\n@patch 1.29\n\n",
    BlzGetUnitCollisionSize:
        "\nGet a real which is the collision size of the specific unit being passed. For reference, a peasant returns 16 and a MG returns 48.\n\n\n@patch 1.29\n\n",
    BlzGetAbilityManaCost:
        "\nRequires an ability ID and the ability level and returns the ability’s (at the level passed) mana cost. \n\n\n@note Since 1.31: use Level 0 to read manacosts of Level 1.\n\n@patch 1.29\n\n",
    BlzGetAbilityCooldown:
        "\nRequires an ability ID and the ability level and returns the ability’s (at the level passed) cooldown. *Since 1.31: use Level 0 to read cooldown from Level 1.*\n\n\n@patch 1.29\n\n",
    BlzSetUnitAbilityCooldown:
        "\nChanges(set) an ability’s cooldown at runtime for a specific unit.\n\n@param whichUnit Target unit (handle).\n@param abilId Rawcode of ability.\n@param level Ability level.\n@param cooldown New cooldown.\n\n\n@note Cooldown is a real, which means that it supports negative and positive numbers with decimals, in this case setting it to negative allows you to reduce an ability’s cooldown.\n@note It does not reduce the cooldown if the ability is currently on CD, it will have its new cooldown after the CD is over though.\n\n@patch 1.29\n\n",
    BlzGetUnitAbilityCooldown:
        "\nGet a specific unit’s specific ability cooldown from a specific level.\n\n\n@note It does not return the remaining cooldown when you use an ability but the max cooldown of that ability of that unit at that level.\n\n@patch 1.29\n\n",
    BlzGetUnitAbilityCooldownRemaining:
        "\nGet a specific unit’s remaining ability cooldown.\n\n\n@bug Sometimes it may return 0 for abilities based on Channel even when they are on cooldown.\n\n@patch 1.29\n\n",
    BlzEndUnitAbilityCooldown:
        "\nReduces the current ability cooldown of a specific ability to 0.\n\n\n@patch 1.29\n\n",
    BlzStartUnitAbilityCooldown: "\n\n\n@patch 1.32\n\n",
    BlzGetUnitAbilityManaCost:
        "\nGet a specific unit’s specific ability’s mana cost at a specific level.\n\n\n@patch 1.29\n\n",
    BlzSetUnitAbilityManaCost:
        "\nSet manacost of an ability (at ability level) for a unit.\nWorks as expected, so you can dynamically calculate the mana cost.\n\n\n@patch 1.29\n\n",
    BlzGetLocalUnitZ:
        "\nReturn unit's (altitude) Z map coordinate ([Cartesian System](https://en.wikipedia.org/wiki/Cartesian_coordinate_system)). Unit may be alive or dead.\n\nReturns 0.0 if unit was removed or is null.\n\nRetrieving Z is desync prone, this version might cause desyncs, but (unconfirmed) should be faster than `BlzGetUnitZ`, hence why both exist. In case that you are doing a single player map (campaign), you might decide to use this one instead of `BlzGetUnitZ`.\n\n\n@note Terrain height is not synced between clients in multiplayer.\n\n@note Since unit extends from widget, you can use widget-related functions too.\nSee: `BlzGetUnitZ`, `GetUnitX`, `GetUnitY`, `GetWidgetX`, `GetWidgetY`.\n\n@async \n@patch 1.29\n\n",
    BlzDecPlayerTechResearched:
        "\nDecreases (reduces) a specific player’s specific upgrade by a specific amount of levels.\n\n\n@note Even though this native takes an integer and integers can be both negatives and positive numbers, in this specific case this native does not allow for an increment by setting the integer to negative.\n\n@patch 1.29\n\n",
    BlzSetEventDamage:
        "\nSet the damage amount of a damage event.\n\nIn 1.31 PTR there’s currently 3 new damage events:\n\n1. `EVENT_UNIT_DAMAGED` - old classic event for a specific unit;\n2. `EVENT_PLAYER_UNIT_DAMAGED` - Same as 1, but for all units of a specific player on the map;\n\n        // This seems to work fine anyway:\n        call TriggerRegisterAnyUnitEventBJ(gg_trg_a, EVENT_PLAYER_UNIT_DAMAGING)\n\n3. `EVENT_UNIT_DAMAGING` - triggers before any armor, armor type and other resistances. Event for a specific unit like 1.\n4. `EVENT_PLAYER_UNIT_DAMAGING` - triggers before any armor, armor type and other resistances. Useful to modify either damage amount, attack type or damage type before any reductions done by game.\n\n1 and 2 - modify the damage after any reduction.\n3 and 4 - changes damage before reduction. Amount you set will be reduced later according to target’s resistance, armor etc.\n\nIf set to <=0 during 3 or 4, then 1 or 2 will never fire.\nMisses don’t trigger any damage events.\nSet to 0.00 to completely block the damage.\nSet to negative value to heal the target instead of damaging.\n\n\n@note Tip: calling `GetEventDamage` after you set it with this function will return the value you set.\n@note If you’ll call `UnitDamageTarget` from within a trigger, which reacts to a damage event or triggered by one, it will cause infinite loop and game will crash, so you should handle such scenarios with additional logic.\n\n@event EVENT_UNIT_DAMAGED\n@patch 1.29\n\n",
    BlzGetEventDamageTarget:
        "\nThe target unit of the damage event.\nIf damage is AoE, your trigger will run separately for each target without known issues.\nThis returns the same result as `GetTriggerUnit`.\n\n\n@event EVENT_UNIT_DAMAGED\n@patch 1.31\n\n",
    BlzGetEventAttackType:
        "\nReturns attacktype of the damage being taken.\nSpell-damage is `ATTACK_TYPE_NORMAL`.\n\n\n@event EVENT_UNIT_DAMAGED\n@patch 1.31\n\n",
    BlzGetEventDamageType:
        "\nReturns damagetype of the damage being taken.\nRegular attack is `DAMAGE_TYPE_NORMAL`.\n\n\n@event EVENT_UNIT_DAMAGED\n@patch 1.31\n\n",
    BlzGetEventWeaponType:
        "\nReturns weapontype of a damage being taken. This only affects the sound of impact.\n\n\n@event EVENT_UNIT_DAMAGED\n@patch 1.31\n\n",
    BlzSetEventAttackType:
        "\nSet the attacktype of a damage being taken. \nCan be only used to change attacktype before armor reduction.\n\n\n@event EVENT_UNIT_DAMAGED\n@patch 1.31\n\n",
    BlzSetEventDamageType:
        "\nSet the damagetype of a damage being taken. \nCan be only used to change damagetype before armor reduction.\n\n\n@event EVENT_UNIT_DAMAGED\n@patch 1.31\n\n",
    BlzSetEventWeaponType:
        "\nSet the weapontype of a damage being taken. \nCan be used to modify the sound of impact in the event before armor reduction.\n\n\n@event EVENT_UNIT_DAMAGED\n@patch 1.31\n\n",
    BlzGetEventIsAttack: "\n\n\n@patch 1.32\n\n",
    RequestExtraIntegerData:
        '\n"They do nothing of interest, just a compatibility thing" - MindWorX (Blizzard Developer), on [The Hive Discord](https://discord.com/channels/178569180625240064/311662737015046144/572101913349193738).\n\n\n@patch 1.30\n\n',
    RequestExtraBooleanData:
        "\nAccording to MindWorX (Blizzard Developer): //They do nothing of interest //Just a compatibility thing\n\n\n@patch 1.30\n\n",
    RequestExtraStringData:
        "\nAccording to MindWorX (Blizzard Developer): //They do nothing of interest //Just a compatibility thing\n\n\n@patch 1.30\n\n",
    RequestExtraRealData:
        "\nAccording to MindWorX (Blizzard Developer): //They do nothing of interest //Just a compatibility thing\n\n\n@patch 1.30\n\n",
    BlzGetUnitZ:
        "\n\n\n@note Returns the same result as `BlzGetLocalUnitZ`.\n@note Since unit extends from widget, you can use widget-related functions too.\nSee: `GetUnitX`, `GetUnitY`, `GetWidgetX`, `GetWidgetY`.\n\n@async \n@patch 1.30\n\n",
    BlzEnableSelections:
        "\nControls selection settings globally: enables/disables selection of units, and visibility of selection circles.\n\n@param enableSelection true to enable, false to disable selection.\n@param enableSelectionCircle true to show, false to hide selection circles on units and doodads.\n\n\n@note \nActs exactly the same as `EnableSelect`\n\n@patch 1.31\n\n",
    BlzIsSelectionEnabled:
        "\nReturns whether unit selection is enabled (a global setting, see `BlzEnableSelections` and `EnableSelect`).\n\n\n@note \nDoes not account for `EnablePreSelect` or `EnableDragSelect` settings.\n\n@patch 1.31\n\n",
    BlzIsSelectionCircleEnabled:
        "\nReturns whether unit selection circles are shown (a global setting, see `BlzEnableSelections` and `EnableSelect`).\n\n\n@note \nDoes not account for `EnablePreSelect` or `EnableDragSelect` settings.\n\n@patch 1.31\n\n",
    BlzCameraSetupApplyForceDurationSmooth: "\n\n\n@patch 1.31\n\n",
    BlzEnableTargetIndicator:
        "\nEnable or disable the three green arrows when right-clicking on ground.\n\n\n@patch 1.31\n\n",
    BlzIsTargetIndicatorEnabled:
        "\nCheck if the the three green arrows when right-clicking on ground is shown or not.\n\n\n@patch 1.31\n\n",
    BlzShowTerrain:
        "\nToggles the rendering of terrain.\n\n@param show `true` to render terrain, `false` no terrain (black background by default)\n\n\n@note See: `BlzShowSkyBox`\n\n@patch 1.32\n\n",
    BlzShowSkyBox: "\n\n\n@note See: `BlzShowTerrain`\n\n@patch 1.32\n\n",
    BlzStartRecording:
        "\nDoes nothing (v1.32.10 without Battle.net App running), no files are created.\n\n\n@note See: `BlzEndRecording`\n\n@patch 1.32\n\n",
    BlzEndRecording:
        "\nDoes nothing (v1.32.10 without Battle.net App running), no files are created.\n\n\n@note See: `BlzStartRecording`\n\n@patch 1.32\n\n",
    BlzShowUnitTeamGlow:
        "\nToggle team glow on whichUnit.\nWill remove Hero glowing team color when set to false.\n\n@param whichUnit Target unit (handle).\n@param show Boolean to show/hide the team glow.\n\n@patch 1.32\n\n",
    BlzGetOriginFrame:
        '\nGet a `framehandle` by specifying a specific `originframetype` and index (in most cases it should be 0 (first index), however it can go above 0 when using originframetypes such as `ORIGIN_FRAME_HERO_BUTTON`)\n\nThe one with indices above 0 are:\n\n\t// The ability buttons at the right bottom corner\n    ORIGIN_FRAME_COMMAND_BUTTON <0 to 11>\n\t// The clickable hero icons at the left of the screen\n    ORIGIN_FRAME_HERO_BUTTON <0 to 6>\n\t// See above for the following:\n    ORIGIN_FRAME_HERO_HP_BAR <0 to 6>\n    ORIGIN_FRAME_HERO_MANA_BAR <0 to 6>\n    ORIGIN_FRAME_HERO_BUTTON_INDICATOR <0 to 6>\n\t// Item inventory buttons\n    ORIGIN_FRAME_ITEM_BUTTON <0 to 5>\n\t// The buttons altering the minimap\n    ORIGIN_FRAME_MINIMAP_BUTTON\n\t// Indices:\n\t// 0 = Menu\n\t// 1 = Allies\n\t// 2 = Log\n\t// 3 = Quest\n    ORIGIN_FRAME_SYSTEM_BUTTON <0 to 3> \n\nHere is a basic example that creates a custom timerdialog window:\n\n    set GameUI = BlzGetOriginFrame(ORIGIN_FRAME_GAME_UI, 0)\n    set UIMain = BlzCreateFrame("TimerDialog", GameUI, 0, 0)\n    call BlzFrameSetPoint(UIMain, FRAMEPOINT_CENTER, GameUI, FRAMEPOINT_CENTER, 0.25, 0.055)\n    call BlzFrameSetSize(UIMain, 0.3, 0.7)\n\n*Take a look at the .fdf files in the game’s CASC or point 1.3 (refer to this document’s table of contents for reference) it should give you some ideas.*\n\n@param index to high values will return the frame from the last valid Index.\n\n@note The first time a Frame enters the map\'s script it takes a handleId.\n\n@note This is up for edition, this native is lacking a more in-depth explanation. For example a list of all of the originframetypes, and their possible indexes.\n\n@patch 1.31\n\n',
    BlzEnableUIAutoPosition:
        "\nDisabling Auto Position will prevent the game using default positions for changed hidden frames as soon they reappear/their state is changed.\n\n\n@patch 1.31\n\n",
    BlzHideOriginFrames:
        "\nHides/Shows most of the default in-game UI.\nUnaffected: Mouse, Command Buttons, Chat, Messages, TimerDialog, Multiboard, Leaderboard and ConsoleUIBackdrop.\n\n\n(De)Activades some auto-repositioning of default frames (see: `BlzEnableUIAutoPosition`).\n\n\n@patch 1.31\n\n",
    BlzConvertColor: "\n\n\n@pure \n@patch 1.31\n\n",
    BlzLoadTOCFile:
        "\nLoads in a TOCFile, to add/define Frame-Blueprints or Localized Strings\nA TOC file contains a list, Each line is a path to a fdf (not case sensitve).\n\n\n@bug The TOC needs to end with one or two empty lines.\n\n@patch 1.31\n\n",
    BlzCreateFrame:
        "\nCreate a new Frame using a Frame-BluePrint name (fdf) as child of owner.\nBluePrint needs to be loaded over TOC & fdf.\nOwner and BluePrint have to be from the Frame family.\nCan only create rootFrames (not subFrames).\nCreated Frames are stored into the game's Frame-Storage, `BlzGetFrameByName(name, createContext)`. Overwrites occupied slots.\n\n\n@patch 1.31\n\n",
    BlzCreateSimpleFrame:
        '\nLike `BlzCreateFrame` but for the SimpleFrame family, Frame "SIMPLExxxx".\n\n\n@note Only Frames loaded by used tocs are valid names.\n\n@patch 1.31\n\n',
    BlzCreateFrameByType:
        "\nCreate & Define a new (Simple)Frame.\nCan use a root-(Simple)Frame-BluePrint with inherits, when that is done it needs to be a loaded BluePrint.\n\n\n@patch 1.31\n\n",
    BlzDestroyFrame: "\n\n\n@patch 1.31\n\n",
    BlzFrameSetPoint:
        "\nUnbinds a point of FrameA and places it relative to a point of FrameB.\nWhen FrameB moves FrameA's point will keep this rule and moves with it.\n\nEach point of a frame can be placed to one point.\nBy placing multiple points of one Frame a Size is enforced.\n\n\n@patch 1.31\n\n",
    BlzFrameSetAbsPoint:
        "\nSet frame absolute x,y position with framepointtype.\nCoords are for the 4:3 Screen\n\n    |0.0/0.6           0.8/0.6|\n    |                         |\n    |         0.4/0.3         |\n    |                         |\n    |0.0/0.0           0.8/0.0|\n\n0.0/0.0 is bottomLeft (Minimap)\n0.8/0.6 is TopRight (UpkeepCost)\nIn widescreen format one can go further left with -x or further right with x > 0.8\nOnly some Frames and their Children/Offspring can leave 4:3.\nSimpleFrames, Leaderboard, TimerDialog, Multiboard, ConsoleUIBackdrop\n\n@param point framepointtype is a point, position of which you set to move the frame relatively to it.\n\n\n@patch 1.31\n\n",
    BlzFrameClearAllPoints:
        "\nUnbinds all points of frame.\nUseful to move frames with the next SetPoint.\n\n\n@patch 1.31\n\n",
    BlzFrameSetAllPoints:
        "\nExample:\n\n    BlzHideOriginFrames(true)\n    BlzFrameSetAllPoints(BlzGetOriginFrame(ORIGIN_FRAME_WORLD_FRAME, 0), BlzGetOriginFrame(ORIGIN_FRAME_GAME_UI, 0))\n\n@param frame the frame moved/resized.\n\n@patch 1.31\n\n",
    BlzFrameSetVisible:
        "\nSets visibility of a frame and its children.\n\n@param visible true is visible, false is invisible.\n\n\n@patch 1.31\n\n",
    BlzFrameIsVisible:
        "\nReturns visibility status of frame.\n\n@param frame Target frame.\n\n\n@async \n@patch 1.31\n\n",
    BlzGetFrameByName:
        '\nRequires a string for the frame name that you want to retrieve (get), and an integer (which in most cases should be 0) that specifies the index of the frame that you want to get (for example for inventory slots you have 6, from 0-5).\n\nRead from the internal Frame-Storage.\nThe first time a Frame enters the map\'s script it takes a handleId.\n\nExample: `BlzGetFrameByName("SimpleHeroLevelBar", 0)`.\n\n\n@note Refer to fdf files for frame names.\n\n@patch 1.31\n\n',
    BlzFrameGetName:
        "\nReturns the string representation of frame name.\n\nInherited Frames lose their Name.\nSimpleFrames return an empty String.\n\n@param frame A handle to frame.\n\n\n@patch 1.31\n\n",
    BlzFrameClick: "\nIgnores visibility. Triggers `FRAMEEVENT_CONTROL_CLICK`.\n\n\n@patch 1.31\n\n",
    BlzFrameSetText:
        "\nSupports Warcraft 3 formatting codes:\n\n* Colors (`|cffffcc00`)\n* Multiple lines (`|n`, `\\n`)\n\n\n@patch 1.31\n\n",
    BlzFrameGetText:
        "\nReturns(Get) the text of that frame. For user input frames this text probably differs between them. For some frames the child contains the Text.\n\n\n@async \n@patch 1.31\n\n",
    BlzFrameAddText: "\nStart a NewLine and add text (TEXTAREA).\n\n@patch 1.31\n\n",
    BlzFrameSetTextSizeLimit: "\n\n\n@patch 1.31\n\n",
    BlzFrameGetTextSizeLimit: "\n\n\n@patch 1.31\n\n",
    BlzFrameSetTextColor:
        "\nChanges text color of the frame. SimpleFrames only.\n\n@param color Four byte integer of the form 0xaarrggbb. You can also use\n`BlzConvertColor` to create such an integer.\n\n\n@patch 1.31\n\n",
    BlzFrameSetFocus: "\n\n\n@patch 1.31\n\n",
    BlzFrameSetModel: "\n\n\n@patch 1.31\n\n",
    BlzFrameSetEnable:
        "\nTurns on/off Interactivity/Events of frame.\nA disabled frame is transparent to the mouse (can click on things behind it) and can have a different color/texture/frame than in enabled state.\nThe frame's Tooltip is still shown on hover.\n(false) Removes KeyboardFocus.\n\n\n@patch 1.31\n\n",
    BlzFrameGetEnable: "\n\n\n@async \n@patch 1.31\n\n",
    BlzFrameSetAlpha:
        "\nAffects child-Frames, when they don't have an own Alpha.\n\n@param alpha 0 to 255.\n\n@patch 1.31\n\n",
    BlzFrameGetAlpha: "\n\n\n@async \n@patch 1.31\n\n",
    BlzFrameSetSpriteAnimate: "\n\n\n@patch 1.31\n\n",
    BlzFrameSetTexture:
        "\nOverwrittes some fdf setup.\n\n@param flag texture fill setting: 0 to stretch, 1 to tile (BACKDROP).\n@param blend Use transparency.\n\n\n@patch 1.31\n\n\n",
    BlzFrameSetScale: "\nAffects child-Frames, when they don't have an own Scale.\n\n@patch 1.31\n\n",
    BlzFrameSetTooltip:
        "\nFrame tooltip is visible when hovered with the mouse. Otherwise tooltip will be hidden.\n\ntooltip is limited to 4:3, but not it's children.\nSimpleFrame tooltips are not hidden with this call.\nframe and tooltip have to be from the same Family (Frames/SimpleFrames).\ntooltip can only serve one frame.\nIt's not possible to undo this.\n\n\n@bug Crashes the game, on hover, when done twice (same pair).\n@bug Frames should not be used as tooltips for simple Frames (Crash on PTR 1.31).\n\n@patch 1.31\n\n",
    BlzFrameCageMouse:
        "\nThe mouse cursor is forced into the frame and can not leave it. New cages (true) will overwrite old ones. Some frames can not be used to imprison the mouse.\n\n@param enable Enable mouse cage.\n\n\n@patch 1.31\n\n",
    BlzFrameSetValue:
        "\nSets the current Frame Value. Only for FrameType that use this feature:\nPOPUPMENU, SLIDER, SIMPLESTATUSBAR, STATUSBAR.\n\n\n@patch 1.31\n\n",
    BlzFrameGetValue: "\nGets the current Frame Value.\n\n\n@async \n@patch 1.31\n\n",
    BlzFrameSetMinMaxValue: "\n\n\n@patch 1.31\n\n",
    BlzFrameSetStepSize: "\nSLIDER accuracy for User.\n\n@patch 1.31\n\n",
    BlzFrameSetSize: "\n\n\n@patch 1.31\n\n",
    BlzFrameSetVertexColor:
        "\nSimpleFrames only.\n@param color Four byte integer of the form 0xaarrggbb. You can also use `BlzConvertColor` to create such an integer.\n\n@patch 1.31\n\n",
    BlzFrameSetLevel:
        "\nUsed to reorder the children of a Frame.\nSimpleFrames have fixed internal Layers. Which only contain String/Textures.\nFor SimpleFrames Level sets them higher/lower to all other SimpleFrames.\n\n@param level bigger number gives a higher position.\n\n@patch 1.31\n\n",
    BlzFrameSetParent: "\n\n\n@patch 1.31\n\n",
    BlzFrameGetParent: "\n\n\n@patch 1.31\n\n",
    BlzFrameGetHeight: "\n\n\n@async \n@patch 1.31\n\n",
    BlzFrameGetWidth: "\n\n\n@async \n@patch 1.31\n\n",
    BlzFrameSetFont: "\nOnly works for String (SimpleFrames).\n\n@patch 1.31\n\n",
    BlzFrameSetTextAlignment: "\n\n\n@patch 1.31\n\n",
    BlzFrameGetChildrenCount: "\nIgnores String/Texture.\n\n\n@patch 1.32.6\n\n",
    BlzFrameGetChild:
        "\nValid Indexes are 0 to `BlzFrameGetChildrenCount` - 1.\nIgnores String/Texture.\nBreaks `BlzGetOriginFrame` when the same frame is first get using `BlzFrameGetChild`.\n\n\n@patch 1.32.6\n\n",
    BlzTriggerRegisterFrameEvent:
        "\nThe event starts for all players when one player triggers it.\n\nThe Event Getter functions. \n\n* `BlzGetTriggerFrame`\n* `BlzGetTriggerFrameEvent`\n* `BlzGetTriggerFrameValue`\n* `BlzGetTriggerFrameText`\n* `GetTriggerPlayer`\n\n`BlzGetTriggerFrameValue` & `BlzGetTriggerFrameText` are only set when the\nFrameEventEvent has use of them.\n\n\n@patch 1.31\n\n",
    BlzGetTriggerFrame: "\n\n\n@patch 1.31\n\n",
    BlzGetTriggerFrameEvent: "\n\n\n@patch 1.31\n\n",
    BlzGetTriggerFrameValue:
        "\nReturns the user input value of the triggered frame. (Slider, popupmenu, scrollbar...)\nOne has to use this native to sync user input, if that is needed.\n\n\n@note This is a hidden native in PTR 1.31 (has to be declared to be usable in Jass).\n\n@patch 1.31\n\n",
    BlzGetTriggerFrameText:
        "\nReturns the user input text of the triggered frame. (EditBox)\nOne has to use this native to sync user input, if that is needed.\n\nLimited to something like ~255 bytes.\n\n\n@note This is a hidden native in PTR 1.31 (has to be declared to be usable in Jass).\n\n@patch 1.31\n\n",
    BlzTriggerRegisterPlayerSyncEvent:
        '\nCreate an event that listens to messages sent by player with prefix. (see: `BlzSendSyncData`).\n\nOne can create a player SyncEvent for any prefix with `TriggerRegisterPlayerEvent(whichTrigger, whichPlayer, EVENT_PLAYER_SYNC_DATA)`.\n\n`GetTriggerPlayer()` is the message source.\n\n@param fromServer "should be false".\n\n\n@patch 1.31\n\n',
    BlzSendSyncData:
        "\nThe player running this function sends a string message to all players.\nSee also `BlzTriggerRegisterPlayerSyncEvent`.\n\n@param prefix Limited to something like 255 bytes.\n\n@param data Limited to something like 255 bytes.\n\n\n@patch 1.31\n\n",
    BlzGetTriggerSyncPrefix: "\n\n\n@patch 1.31\n\n",
    BlzGetTriggerSyncData: "\n\n\n@patch 1.31\n\n",
    BlzTriggerRegisterPlayerKeyEvent:
        '\nRegisters event to call trigger when player presses a key + metakey.\nKey presses are synced by the game between players automatically.\n\nMeta keys are modifier keys like CTRL, SHIFT, ALT. See `BlzGetTriggerPlayerMetaKey`. If you just want a key press without them, use 0.\n\n**Example (Lua):**\n\n    trg_key = CreateTrigger()\n    -- prints oskey as object, metakey as integer\n    TriggerAddAction(trg_key, function() print(BlzGetTriggerPlayerKey(),  BlzGetTriggerPlayerMetaKey()) end)\n     \n    -- register key press ESCAPE\n    BlzTriggerRegisterPlayerKeyEvent(trg_key, Player(0), OSKEY_ESCAPE, 0, false)\n     \n    -- register key press CTRL+1\n    BlzTriggerRegisterPlayerKeyEvent(trg_key, Player(0), OSKEY_1, 2, false)\n\n@param metaKey Bitfield. MetaKeys are "none"(0), "shift"(1), "control"(2), "alt"(4) and "META"(8) (Windows key). They can be combined 2 + 4 = 6.\nThe player needs to hold all specified metakeys to trigger the event.\n\n@param keyDown If keyDown = false: trigger is called once when key is released (unpressed).\nIf keyDown = true: calls trigger repeatedly while key is being held down. In V1.31.1 this happens once. In V1.32.10 repeats until released at approximately 30 times per second and fluctuating.\n\n\n@patch 1.31\n\n',
    BlzGetTriggerPlayerKey:
        "\nReturns the key that was pressed during current event.\n\n**Example:** `if BlzGetTriggerPlayerKey() == OSKEY_F then ...`\n\n\n@note See: `BlzTriggerRegisterPlayerKeyEvent`.\n\n@patch 1.31\n\n",
    BlzGetTriggerPlayerMetaKey:
        "\nReturns the meta keys that were pressed (aka [modifier keys](https://en.wikipedia.org/wiki/Modifier_key)).\n\n**Example:** if player pressed CTRL+W then metakey=2 and oskeytype=OSKEY_W\n\n**Meta keys:**\n\n* 0 = None\n* 1 = Shift\n* 2 = Control (CTRL)\n* 4 = ALT\n* 8 = Meta aka Windows key aka Super\n\nMeta keys can be pressed simultaneously (CTRL+SHIFT+W) in that case, you need to add the numbers or use bit OR/AND/XOR.\nCTRL+SHIFT = 2+1 = 3. CTRL+SHIFT+ALT = 2+1+4 = 7.\n\n\n@note See: `BlzTriggerRegisterPlayerKeyEvent`.\n\n@patch 1.31\n\n",
    BlzGetTriggerPlayerIsKeyDown: "\n\n\n@patch 1.31\n\n",
    BlzEnableCursor:
        "\nSets cursor visibility.\n\n@param enable true to show, false to hide cursor.\n\n\n@patch 1.31\n\n",
    BlzSetMousePos:
        "\nx & y are px upto the used resolution `BlzGetLocalClientWidth()` `BlzGetLocalClientHeight()`.\n\n\n@patch 1.31\n\n",
    BlzGetLocalClientWidth: "\nGets the width (pixels) of the Warcraft 3 window.\n\n\n@async \n@patch 1.31\n\n",
    BlzGetLocalClientHeight: "\nGets the height (pixels) of the Warcraft 3 window.\n\n\n@async \n@patch 1.31\n\n",
    BlzIsLocalClientActive: "\nReturns true if Warcraft 3 window is in focus.\n\n\n@async \n@patch 1.31\n\n",
    BlzGetMouseFocusUnit:
        "\nReturns the unit that is currently hovered by the mouse of the local player.\n\n@async \n@patch 1.31\n\n",
    BlzChangeMinimapTerrainTex: "\nUses a new Texture for the minimap.\n\n@patch 1.31\n\n",
    BlzGetLocale:
        "\nReturns the used warcraft 3 Lcid.\n\n    //  English (US)            = 'enUS' \n    //  English (UK)            = 'enGB' \n    //  French                  = 'frFR' \n    //  German                  = 'deDE' \n    //  Spanish                 = 'esES' \n    //  Italian                 = 'itIT' \n    //  Czech                   = 'csCZ' \n    //  Russian                 = 'ruRU' \n    //  Polish                  = 'plPL' \n    //  Portuguese (Brazilian)  = 'ptBR' \n    //  Portuguese (Portugal)   = 'ptPT' \n    //  Turkish                 = 'tkTK' \n    //  Japanese                = 'jaJA' \n    //  Korean                  = 'koKR' \n    //  Chinese (Traditional)   = 'zhTW' \n    //  Chinese (Simplified)    = 'zhCN' \n    //  Thai                    = 'thTH'\n\t\n\n@note Warcraft 3 Lcids can be found in `config.ini` inside the CASC.\n\n@async \n@patch 1.31\n\n",
    BlzGetSpecialEffectScale: "\n\n\n@patch 1.31\n\n",
    BlzSetSpecialEffectMatrixScale: "\n\n\n@patch 1.31\n\n",
    BlzResetSpecialEffectMatrix: "\n\n\n@patch 1.31\n\n",
    BlzGetUnitAbility: "\n\n\n@patch 1.31\n\n",
    BlzGetUnitAbilityByIndex:
        "\nReturns a handle to specific unit's ability instance.\n\n\n@note Last added ability is at index 0, older abilities are pushed up.\n\n@patch 1.31\n\n",
    BlzGetAbilityId: "\n\n\n@patch 1.33\n\n",
    BlzDisplayChatMessage:
        '\nDisplays the message in chat as if it were sent by the specified player. The message does not appear in log (F12).\n\n@param whichPlayer The target player will be shown as sender of the message.\n\n@param recipient Changes the type of chat channel prefix shown. It has no effect on the message\'s visibility.\n\n* 0: "All" chat prefix\n* 1: "Allies"\n* 2: "Observers"\n* 3: "Private"\n* 4+: Defaults to private too.\n\n@param message Text to show.\n\n\n@patch 1.31\n\n',
    BlzPauseUnitEx:
        "\nThis does not update `IsUnitPaused` and keeps the command card visible. Otherwise identical to `PauseUnit()`.\n\n\n@patch 1.31\n\n",
    BlzSetUnitFacingEx: "\n\n\n@patch 1.32\n\n",
    CreateCommandButtonEffect: "\n\n\n@patch 1.32\n\n",
    CreateUpgradeCommandButtonEffect: "\n\n\n@patch 1.32\n\n",
    CreateLearnCommandButtonEffect: "\n\n\n@patch 1.32\n\n",
    DestroyCommandButtonEffect: "\n\n\n@patch 1.32\n\n",
    BlzBitOr:
        "\nReturns the result of connecting all bits of both numbers using OR (in regards of binary numeral system). It returns a number with bits, being set in at least one of the numbers.\n\n3v1 => 3 (0011 v 0001 => 0011)\n2v5 => 7 (0010 v 0101 => 0111)\n\n\n\n@pure \n@patch 1.31\n\n",
    BlzBitAnd:
        "\nReturns the result of connecting all bits of both numbers using AND (in regards of binary numeral system). It tells which bits are set for both integers.\n\n3&1 => 1 (0011 & 0001 => 0001)\n2&1 => 0 (0010 & 0001 => 0000)\n11&7 => 3 (1011 & 0111 => 0011)\n13&5 => 5 (1101 & 0101 => 0101)\n12&6 => 4 (1100 & 0100 => 0100)\n\n\n\n@pure \n@patch 1.31\n\n",
    BlzBitXor:
        "\nReturns the result of connecting all bits of both numbers using XOR (Difference) (in regards of binary numeral system). Each Bit being different between x and y becomes 1; every bit being equal becomes 0.\n\n2 xor 5 => 7 (0010 xor 0101 => 0111)\n6 xor 8 => 14  (0110 xor 1000 => 1110)\n\n\n\n@pure \n@patch 1.31\n\n",
    BlzGetAbilityBooleanField: "\n\n\n@patch 1.31\n\n",
    BlzGetAbilityIntegerField: "\n\n\n@patch 1.31\n\n",
    BlzGetAbilityRealField: "\n\n\n@patch 1.31\n\n",
    BlzGetAbilityStringField: "\n\n\n@patch 1.31\n\n",
    BlzGetAbilityBooleanLevelField:
        "\n\n\n@patch 1.31\n@bug Should not be used (crash): Use `BlzGetAbilityIntegerLevelField`.\n\n",
    BlzGetAbilityIntegerLevelField: "\n\n\n@patch 1.31\n\n",
    BlzGetAbilityRealLevelField: "\n\n\n@patch 1.31\n\n",
    BlzGetAbilityStringLevelField: "\n\n\n@patch 1.31\n\n",
    BlzGetAbilityBooleanLevelArrayField: "\n\n\n@patch 1.31\n\n",
    BlzGetAbilityIntegerLevelArrayField: "\n\n\n@patch 1.31\n\n",
    BlzGetAbilityRealLevelArrayField: "\n\n\n@patch 1.31\n\n",
    BlzGetAbilityStringLevelArrayField: "\n\n\n@patch 1.31\n\n",
    BlzSetAbilityBooleanField: "\n\n\n@patch 1.31\n\n",
    BlzSetAbilityIntegerField: "\n\n\n@patch 1.31\n\n",
    BlzSetAbilityRealField: "\n\n\n@patch 1.31\n\n",
    BlzSetAbilityStringField: "\n\n\n@patch 1.31\n\n",
    BlzSetAbilityBooleanLevelField:
        "\n\n\n@patch 1.31\n@bug Should not be used (crash): Use `BlzSetAbilityIntegerLevelField`.\n\n",
    BlzSetAbilityIntegerLevelField: "\n\n\n@patch 1.31\n\n",
    BlzSetAbilityRealLevelField: "\n\n\n@patch 1.31\n\n",
    BlzSetAbilityStringLevelField: "\n\n\n@patch 1.31\n\n",
    BlzSetAbilityBooleanLevelArrayField: "\n\n\n@patch 1.31\n\n",
    BlzSetAbilityIntegerLevelArrayField: "\n\n\n@patch 1.31\n\n",
    BlzSetAbilityRealLevelArrayField: "\n\n\n@patch 1.31\n\n",
    BlzSetAbilityStringLevelArrayField: "\n\n\n@patch 1.31\n\n",
    BlzAddAbilityBooleanLevelArrayField: "\n\n\n@patch 1.31\n\n",
    BlzAddAbilityIntegerLevelArrayField: "\n\n\n@patch 1.31\n\n",
    BlzAddAbilityRealLevelArrayField: "\n\n\n@patch 1.31\n\n",
    BlzAddAbilityStringLevelArrayField: "\n\n\n@patch 1.31\n\n",
    BlzRemoveAbilityBooleanLevelArrayField: "\n\n\n@patch 1.31\n\n",
    BlzRemoveAbilityIntegerLevelArrayField: "\n\n\n@patch 1.31\n\n",
    BlzRemoveAbilityRealLevelArrayField: "\n\n\n@patch 1.31\n\n",
    BlzRemoveAbilityStringLevelArrayField: "\n\n\n@patch 1.31\n\n",
    BlzGetItemAbilityByIndex: "\n\n\n@patch 1.31\n\n",
    BlzGetItemAbility: "\n\n\n@patch 1.31\n\n",
    BlzItemAddAbility: "\n\n\n@note The item has to be carried by a unit for this to work.\n\n@patch 1.31\n\n",
    BlzGetItemBooleanField: "\n\n\n@patch 1.31\n\n",
    BlzGetItemIntegerField: "\n\n\n@patch 1.31\n\n",
    BlzGetItemRealField: "\n\n\n@patch 1.31\n\n",
    BlzGetItemStringField: "\n\n\n@patch 1.31\n\n",
    BlzSetItemBooleanField: "\n\n\n@patch 1.31\n\n",
    BlzSetItemIntegerField: "\n\n\n@patch 1.31\n\n",
    BlzSetItemRealField: "\n\n\n@patch 1.31\n\n",
    BlzSetItemStringField: "\n\n\n@patch 1.31\n\n",
    BlzItemRemoveAbility: "\n\n\n@patch 1.31\n\n",
    BlzGetUnitBooleanField: "\n\n\n@note Many fields don't work at all.\n@patch 1.31\n\n",
    BlzGetUnitIntegerField: "\n\n\n@note Many fields don't work at all.\n@patch 1.31\n\n",
    BlzGetUnitRealField: "\n\n\n@note Many fields don't work at all.\n@patch 1.31\n\n",
    BlzGetUnitStringField: "\n\n\n@note Many fields don't work at all.\n@patch 1.31\n\n",
    BlzSetUnitBooleanField: "\n\n\n@note Many fields don't work at all.\n@patch 1.31\n\n",
    BlzSetUnitIntegerField:
        "\nChanges a unit's stats integer field.\n\nThere're quirks when changing stats, some values don't apply immediately and some don't work at all, likely due to how the game engine uses them. Example:\n\n`BlzSetUnitIntegerField(unit, UNIT_IF_HIT_POINTS_REGENERATION_TYPE)`\n\nRegeneration type values are as follows:\n\n* 0 - Never\n* 1 - Always\n* 2 - Only on blight\n* 4 - Only at night\n\nChanging the regeneration type at runtime WILL NOT work, even if true is returned (false positive).\n\nFor vision, it appears changing them to a specific value does not immediately change it. Instead, it will change over time to approach and reach said value. However, if one wishes to decrease the vision range, and the initial vision range is greater than 1800, the vision will remain at 1800. Thus, one must change it first to 1800, then to the desired value. Otherwise, vision change works as intended. One cannot increase vision beyond 1800.\n\nGoing into a fountain of life will not increase a unit's hp regeneration rate. Modifying regeneration rate is instant.\n\n\n@note Many fields don't work at all.\n@patch 1.31\n\n",
    BlzSetUnitRealField: "\n\n\n@note Many fields don't work at all.\n@patch 1.31\n\n",
    BlzSetUnitStringField: "\n\n\n@note Many fields don't work at all.\n@patch 1.31\n\n",
    BlzGetUnitWeaponBooleanField:
        "\n\n\n@bug Might crash the game when called on a unit with no attack.\n@patch 1.31\n\n",
    BlzGetUnitWeaponIntegerField:
        "\n\n\n@bug Might crash the game when called on a unit with no attack.\n@patch 1.31\n\n",
    BlzGetUnitWeaponRealField: "\n\n\n@bug Might crash the game when called on a unit with no attack.\n@patch 1.31\n\n",
    BlzGetUnitWeaponStringField:
        "\n\n\n@bug Might crash the game when called on a unit with no attack.\n@patch 1.31\n\n",
    BlzSetUnitWeaponBooleanField: "\n\n\n@patch 1.31\n\n",
    BlzSetUnitWeaponIntegerField: "\n\n\n@patch 1.31\n\n",
    BlzSetUnitWeaponRealField:
        "\nProblems:\nunitweaponfields `UNIT_WEAPON_RF_ATTACK_RANGE` and `UNIT_WEAPON_RF_ATTACK_PROJECTILE_SPEED` do not appear to change in value, even if the operation is reported successful (returns a false positive). This was tested at indices 0 - 3.\n\nThe getter equivalent of the native above does not work too (returns 0).\n\n\n@patch 1.31\n\n",
    BlzSetUnitWeaponStringField: "\n\n\n@patch 1.31\n\n",
    BlzGetUnitSkin: "\n\n\n@patch 1.32\n\n",
    BlzGetItemSkin: "\n\n\n@patch 1.32\n\n",
    BlzSetUnitSkin:
        "\nReplaces a unit's model with the unit's model referenced by the skinId.\n`BlzSetUnitSkin(whichUnit, 'hfoo')` will replace whichUnit model with the footman one.\nScale from the unit referenced by the skinId is applied to whichUnit.\nSoundSet from the unit referenced by the skinId is applied to whichUnit.\n\n@param whichUnit The function will modify this unit's model.\n@param skinId The function will apply the skinId model to whichUnit.\n\n\n@note Upon function call, all attachment visual effect are removed from whichUnit.\n@patch 1.32\n\n",
    BlzSetItemSkin: "\n\n\n@patch 1.32\n\n",
    BlzCreateItemWithSkin: "\n\n\n@patch 1.32\n\n",
    BlzCreateUnitWithSkin:
        "\nCreates a unit with the model from the unit referenced by the skinId.\n`BlzCreateUnitWithSkin(players[0], 'hpea', 0, 0, 270, 'hfoo')` will create a peasant with a footman model.\nScale from the unit referenced by the skinId is applied to whichUnit.\nSoundSet from the unit referenced by the skinId is applied to whichUnit.\n\n@param id The owner of the unit.\n@param unitid The rawcode of the unit.\n@param x The x-coordinate of the unit.\n@param y The y-coordinate of the unit.\n@param face Unit facing in degrees.\n@param skinId The function will apply the skinId model to the unit created.\n\n@patch 1.32\n\n",
    BlzCreateDestructableWithSkin: "\n\n\n@patch 1.32\n\n",
    BlzCreateDestructableZWithSkin: "\n\n\n@patch 1.32\n\n",
    BlzCreateDeadDestructableWithSkin: "\n\n\n@patch 1.32\n\n",
    BlzCreateDeadDestructableZWithSkin: "\n\n\n@patch 1.32\n\n",
    BlzGetPlayerTownHallCount: "\n\n\n@patch 1.32\n\n",
    BlzQueueImmediateOrderById: "\n\n\n@patch 1.33\n\n",
    BlzQueuePointOrderById:
        "\n\n@note If the order is to build a structure and the unit can build that structure in principle but the player lacks the resources for it, then the unit\nwill be pinged on the minimap in yellow for its owning player.\n\n@bug If the order is to build a structure, this function will return `false` even if the unit accepts the order.\n\n@patch 1.33\n\n",
    BlzQueueTargetOrderById: "\n\n\n@patch 1.33\n\n",
    BlzQueueInstantPointOrderById: "\n\n\n@patch 1.33\n\n",
    BlzQueueInstantTargetOrderById: "\n\n\n@patch 1.33\n\n",
    BlzQueueBuildOrderById:
        "\n\n@note If the order is to build a structure and the unit can build that structure in principle but the player lacks the resources for it, then the unit\nwill be pinged on the minimap in yellow for its owning player.\n\n@note If the order is to build a structure and the unit can build that structure in principle (and the spot is not blocked, either),\nthis function will still return `true` even if the player lacks the resources for it and the unit has no other orders.\n\n@patch 1.33\n\n",
    BlzQueueNeutralImmediateOrderById: "\n\n\n@patch 1.33\n\n",
    BlzQueueNeutralPointOrderById: "\n\n\n@patch 1.33\n\n",
    BlzQueueNeutralTargetOrderById: "\n\n\n@patch 1.33\n\n",
    BlzGetUnitOrderCount: "\nReturns the number of orders the unit currently has queued up.\n\n@patch 1.33\n\n",
    BlzUnitClearOrders: "\nClears either all orders or only queued up orders.\n\n@patch 1.33\n\n",
    BlzUnitForceStopOrder: "\nStops the current order and optionally clears the queue.\n\n@patch 1.33\n\n",
};