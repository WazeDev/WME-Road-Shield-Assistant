// ==UserScript==
// @name         WME Road Shield Assistant
// @namespace    https://greasyfork.org/en/users/286957-skidooguy
// @version      2026.06.11.001
// @description  Adds shield information display to WME
// @author       SkiDooGuy, jm6087, Karlsosha
// @match        https://www.waze.com/editor*
// @match        https://www.waze.com/*/editor*
// @match        https://beta.waze.com/editor*
// @match        https://beta.waze.com/*/editor*
// @exclude      https://www.waze.com/user/editor*
// @require      https://greasyfork.org/scripts/24851-wazewrap/code/WazeWrap.js
// @require      https://cdn.jsdelivr.net/npm/@turf/turf@7/turf.min.js
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @connect      greasyfork.org
// @connect      docs.google.com
// @contributionURL https://github.com/WazeDev/Thank-The-Authors
// ==/UserScript==

/* global W */
/* global WazeWrap */
/* global turf */

// import type { Node, Segment, SegmentAddress, Street, Turn, WmeSDK } from "wme-sdk-typings";
// import type { Point, LineString, Position, Feature } from "geojson";
// import * as turf from "@turf/turf";
// import _ from "underscore";
// import WazeWrap from "https://greasyfork.org/scripts/24851-wazewrap/code/WazeWrap.js";

let sdk: WmeSDK;
unsafeWindow.SDK_INITIALIZED.then(() => {
    try {
        console.log("RSA: SDK_INITIALIZED event fired");
        if (!unsafeWindow.getWmeSdk) {
            throw new Error("SDK is not installed");
        }
        sdk = unsafeWindow.getWmeSdk({ scriptId: "wme-road-shield-assistant", scriptName: "WME Road Shield Assistant" });

        console.log(`SDK v ${sdk.getSDKVersion()} on ${sdk.getWMEVersion()} initialized`);
        sdk.Events.once({ eventName: "wme-ready" }).then(rsaInit).catch((e: any) => {
            console.error("RSA: Error in rsaInit promise chain", e);
        });
    } catch (e: any) {
        console.error("RSA: Error in SDK initialization", e);
    }
}).catch((e: any) => {
    console.error("RSA: Error in SDK_INITIALIZED promise", e);
});

function rsaInit() {
    if (!WazeWrap.Ready) {
        setTimeout(() => {
            rsaInit();
        }, 100);
        return;
    }

    const GF_LINK = "https://greasyfork.org/en/scripts/425050-wme-road-shield-assisstant";
    const FORUM_LINK = "https://www.waze.com/discuss/t/script-road-shield-assistant-rsa/227100";
    const RSA_UPDATE_NOTES = `<b>NEW:</b><br>
    - Remove Waze Wrap Remote Storage<br>
<b>BUGFIXES:</b><br>
<b>KNOWN ISSUES:</b><br><br>`;

    enum CountryID {
        AFGANISTAN = 1,
        ALBANIA = 2,
        ALGERIA = 3,
        AMERICAN_SAMOA = 4,
        ANDORRA = 5,
        ANGOLA = 6,
        ANGUILLA = 7,
        ANTARCTICA = 8,
        ANTIGUA_AND_BARBUDA = 9,
        ARGENTINA = 10,
        ARMENIA = 11,
        ARUBA = 12,
        AUSTRALIA = 13,
        AUSTRIA = 14,
        AZERBAIJAN = 15,
        BAHAMAS = 16,
        BAHRAIN = 17,
        BAKER_ISLAND = 18,
        BANGLADESH = 19,
        BARBADOS = 20,
        BELGUIM = 21,
        BELIZE = 22,
        BENIN = 23,
        BERMUDA = 24,
        BHUTAN = 25,
        BOLIVIA = 26,
        BOSNIA_AND_HERZEGOWINA = 27,
        BOTSWANA = 28,
        BOUVET_ISLAND = 29,
        BRAZIL = 30,
        BRITISH_INDIAN_OCEAN_TERRITORY = 31,
        BRITISH_VIRGIN_ISLANDS = 32,
        BRUNEI = 33,
        BULGARIA = 34,
        BURKINA_FASO = 35,
        BURUNDI = 36,
        BELARUS = 37,
        CAMBODIA = 38,
        CAMEROON = 39,
        CANADA = 40,
        CAPE_VERDE = 41,
        CAYMAN_ISLANDS = 42,
        CENTRAL_AFRICAN_REPUBLIC = 43,
        CHAD = 44,
        CHILE = 45,
        CHINA = 46,
        CHRISTMAS_ISLAND = 47,
        COCOS_ISLANDS = 48,
        KEELING_ISLANDS = 48,
        COLOMBIA = 49,
        COMOROS = 50,
        CONGO = 51,
        COOK_ISLANDS = 52,
        COSTA_RICA = 53,
        CROATIA = 54,
        CUBA = 55,
        CYPRUS = 56,
        CZECH_REPUBLIC = 57,
        DENMARK = 58,
        DJIBOUTI = 59,
        DOMINICA = 60,
        DOMINICAN_REPUBLIC = 61,
        ECUADOR = 62,
        EGYPT = 63,
        EL_SALVADOR = 64,
        EQUATORIAL_GUINEA = 65,
        ERITREA = 66,
        ESTONIA = 67,
        ETHIOPIA = 68,
        FALKLAND_ISLANDS = 69,
        ISLAS_MALVINAS = 69,
        FAROE_ISLANDS = 70,
        MICRONEISA = 71,
        FIJI = 72,
        FRNACE = 73,
        FRENCH_GUIANA = 74,
        FRENCH_POLYNESIA = 75,
        FRENCH_SOUTHERN_TERRITORIES = 76,
        GABON = 77,
        GAMBIA = 78,
        GEORGIA = 80,
        GERMANY = 81,
        GHANA = 82,
        GIBRALTAR = 83,
        GLORIOSO_ISLANDS = 84,
        GREECE = 85,
        GREENLAND = 86,
        GRENADA = 87,
        GUADELOUPE = 88,
        GUAM = 89,
        GUATEMALA = 90,
        GUERNSEY = 91,
        GUINEA = 92,
        GUINEA_BISSAU = 93,
        GUYANA = 94,
        HAITI = 95,
        HEARD_AND_MCDONAL_ISLANDS = 96,
        HONDURAS = 97,
        HOWLAND_ISLAND = 98,
        HUNGARY = 99,
        ICELAND = 100,
        INDIA = 101,
        INDONESIA = 102,
        IRAN = 103,
        IRAQ = 104,
        IRELAND = 105,
        ITALY = 107,
        COTE_DIVORE = 108,
        JAMAICA = 109,
        JAN_MAYEN = 110,
        JAPAN = 111,
        JARVIS_ISLAND = 112,
        JERSEY = 113,
        JOHNSTON_ATOLL = 114,
        JORDAN = 115,
        JUAN_DE_NOVA_ISLAND = 116,
        KAZAKHSTAN = 117,
        KENYA = 118,
        KIRIBATI = 119,
        KUWAIT = 120,
        KYRGYZSTAN = 121,
        LAOS = 122,
        LATVIA = 123,
        LEBANON = 124,
        LESOTHO = 125,
        LIBERIA = 126,
        LIBYA = 127,
        LIECHTENSTEIN = 128,
        LITHUANIA = 129,
        LUXEMBOURG = 130,
        MACAU = 131,
        MACEDONIA = 132,
        MADAGASCAR = 133,
        MALAWI = 134,
        MALAYSIA = 135,
        MALDIVES = 136,
        MALI = 137,
        MALTA = 138,
        ISLE_OF_MAN = 139,
        MARSHALL_ISLANDS = 140,
        MARTINIQUE = 141,
        MAURITANIA = 142,
        MAURITIUS = 143,
        MAYOTTE = 144,
        MEXICO = 145,
        MIDWAY_ISLAND = 146,
        MOLDOVA = 147,
        MONACO = 148,
        MONGOLIA = 149,
        MONTENEGRO = 150,
        MONTSERRAT = 151,
        MOROCCO = 152,
        MOZAMBIQUE = 153,
        MYANMAR = 154,
        NAMIBIA = 155,
        NAURU = 156,
        NEPAL = 157,
        NETHERLANDS = 158,
        NEW_CALEDONIA = 159,
        NEW_ZEALAND = 161,
        NICARAGUA = 162,
        NIGER = 163,
        NIGERIA = 164,
        NIUE = 165,
        NORFOLK_ISLAND = 166,
        NORTHERN_MARIANA_ISLANDS = 167,
        NORTH_KOREA = 168,
        KOREA_NORTH = 168,
        NORWAY = 169,
        OMAN = 170,
        PASIFIC_ISLANDS = 171,
        PALAU = 171,
        PAKISTAN = 172,
        PANAMA = 173,
        PAPUA_NEW_GUINEA = 174,
        PARACEL_ISLANDS = 175,
        PARAGUAY = 176,
        PERU = 177,
        PHILIPPINES = 178,
        PITCAIRN_ISLANDS = 179,
        POLAND = 180,
        PORTUGAL = 181,
        PUERTO_RICO = 182,
        QATAR = 183,
        REUNION = 184,
        ROMANIA = 185,
        RUSSIA = 186,
        RWANDA = 187,
        SAN_MARINO = 188,
        SAO_TOME_AND_PRINCIPE = 189,
        SAUDI_ARABIA = 190,
        SENEGAL = 191,
        SERBIA = 192,
        SEYCHELLES = 193,
        SIERRA_LEONE = 194,
        SINGAPORE = 195,
        SLOVAKIA = 196,
        SLOVENIA = 197,
        SOLOMON_ISLANDS = 198,
        SOMALIA = 199,
        SOUTH_AFRICA = 200,
        SOUTH_GEORGIA_AND_THE_SOUTH_SANDWICH_ISLANDS = 201,
        SOUTH_GEORGIA = 201,
        SOUTH_SANDWICH_ISLANDS = 201,
        SOUTH_KOREA = 202,
        KOREA_SOUTH = 202,
        SPAIN = 203,
        SPRATLY_ISLANDS = 204,
        SRI_LANKA = 205,
        ST_MARTIN = 254,
        SAINT_MARTIN = 254,
        ST_HELENA = 206,
        ST_KITTS_AND_NEVIS = 207,
        ST_LUCIA = 208,
        ST_PIERRE_AND_MIQUELON = 209,
        ST_VINCENT_AND_THE_GRENADINES = 210,
        SUDAN = 211,
        SURINAME = 212,
        SVALBARD = 213,
        SWAZILAND = 214,
        SWEDEN = 215,
        SWITZERLAND = 216,
        SYRIA = 217,
        TAIWAN = 218,
        TAJIKISTAN = 219,
        TANZANIA = 220,
        THAILAND = 221,
        TOGO = 222,
        TOKELAU = 223,
        TONGA = 224,
        TRINIDAD_AND_TOBAGO = 225,
        TUNISIA = 226,
        TURKEY = 227,
        TURKMENISTAN = 228,
        TURKS_AND_CAICOS_ISLANDS = 229,
        TUVALU = 230,
        UGANDA = 231,
        UKRAINE = 232,
        UNITED_ARAB_EMIRATES = 233,
        UNITED_KINGDOM = 234,
        UK = 234,
        GREAT_BRITAIN = 234,
        UNITED_STATES = 235,
        USA = 235,
        UNITED_STATES_OF_AMERICA = 235,
        URUGUAY = 236,
        UZBEKISTAN = 237,
        VANUATU = 238,
        VENEZUELA = 239,
        VIETNAM = 240,
        US_VIRGIN_ISLANDS = 241,
        WAKE_ISLAND = 242,
        WALLIS_AND_FUTUNA = 243,
        WESTERN_SAHARA = 245,
        SAMOA = 246,
        YEMEN = 247,
        DEMOCRATIC_REPUBLIC_OF_THE_CONGO = 248,
        DRC = 248,
        ZAMBIA = 249,
        ZIMBABWE = 250,
        FINLAND = 251,
        CURACAO = 252,
        BONAIRE_SINT_EUSTATIUS_SABA_ISLAND = 253,
        BONAIRE = 253,
        SINT_EUSTATIUS = 253,
        SABA_ISLAND = 253,
        SAINT_BARTHELEMY = 255,
        SAINT_BARTHS = 255,
        SAINT_BARTS = 255,
        HONG_KONG = 256,
        SINT_MAARTEN = 257,
        TIMOR_LESTE = 258,
        SOUTH_SUDAN = 259,
    }

    interface Coordinates {
        x: number | null | undefined;
        y: number | null | undefined;
    }

    interface GuidanceInterface {
        shield: boolean;
        exit: boolean;
        tts: boolean;
        towards: boolean;
        visual: boolean;
    }

    const MIN_ZOOM_LEVEL: number = 14;
    enum ZoomLevel {
        ZM0 = 12,
        ZM1 = 13,
        ZM2 = 14,
        ZM3 = 15,
        ZM4 = 16,
        ZM5 = 17,
        ZM6 = 18,
        ZM7 = 19,
        ZM8 = 20,
        ZM9 = 21,
        ZM10 = 22,
    }

    // const [zm0, zm1, zm2, zm3, zm4, zm5, zm6, zm7, zm8, zm9, zm10] = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];

    interface LabelDistance {
        icon: number;
        label: number;
        space: number;
    }

    interface RSASettings {
        [key: string]: string | number | boolean;
        lastSaveAction: number;
        enableScript: boolean;
        HighSegShields: boolean;
        ShowSegShields: boolean;
        SegShieldMissing: boolean;
        SegShieldError: boolean;
        SegHasDir: boolean;
        SegInvDir: boolean;
        HighNodeShields: boolean;
        ShowNodeShields: boolean;
        ShowExitShields: boolean;
        ShowTurnTTS: boolean;
        AlertTurnTTS: boolean;
        ShowTowards: boolean;
        ShowVisualInst: boolean;
        NodeShieldMissing: boolean;
        HighSegClr: string;
        MissSegClr: string;
        ErrSegClr: string;
        HighNodeClr: string;
        MissNodeClr: string;
        SegHasDirClr: string;
        SegInvDirClr: string;
        TitleCaseClr: string;
        TitleCaseSftClr: string;
        ShowRamps: boolean;
        AlternativeShields: boolean;
        mHPlus: boolean;
        titleCase: boolean;
        checkTWD: boolean;
        checkTTS: boolean;
        checkVI: boolean;
        mapLayerVisible: boolean;
        iconLayerVisible: boolean;
    }

    interface FeatureProperties {
        styleName: string;
    }

    type minShieldDisplayLengthsType = Record<number, number>;
    const minShieldDisplayLengths: minShieldDisplayLengthsType = {
        15: 150,
        16: 90,
        17: 80,
        18: 70,
        19: 60,
        20: 50,
        21: 40,
        22: 30,
    };
    interface Candidate {
        isCandidate: boolean;
        iconID: number | null | Set<number>;
    }
    type RoadInfo = Record<string, number | Set<number>>;
    type StateRoadInfo = Record<string, RoadInfo>;
    type CountryRoadInfo = Record<number, StateRoadInfo | false>;
    type CountryDataSheetMap = Record<number, string>;

    const CountryDataSheetInfo: CountryDataSheetMap = {};

    const RoadAbbr: CountryRoadInfo = {};
    let mainSheetLoaded = false;
    const loadingCountries = new Set<number>();  // Track which countries are currently being loaded
    const iconsAllowingNoText = new Set<number>([
        2000, // Atlantic City Expy
        2079, // Garden State Parkway
        2033, // Florida's Turnpike
        2082, // Palisades Pkwy
        2093, // Ontario State Pkwy
        2094, // Niagara Scenic Pkwy
        2199, // Westpark Tollway,
        2198, // Sam Houston Parkway,
        2196, // Fort Bend
        2050, // AA Hwy,
        2069, // Blue Ridge Pkwy
        5058, // QEW
    ]);

    type SettingName = Record<string, string>;
    type LocalizedSettings = Record<string, SettingName>;
    const Strings: LocalizedSettings = {
        en: {
            enableScript: "Script enabled",
            HighSegShields: "Segments with Shields",
            HighSegShieldsClr: "Segments with Shields",
            ShowSegShields: "Show Segment Shields on Map",
            SegShieldMissing: "Segments that might be missing shields",
            SegShieldMissingClr: "Segments that might be missing shields",
            SegShieldError: "Segments that have shields but maybe shouldn't",
            SegShieldErrorClr: "Segments that have shields but maybe shouldn't",
            HighNodeShields: "Nodes with Shields (TG)",
            HighNodeShieldsClr: "Nodes with Shields (TG)",
            ShowNodeShields: "Show Node Shield Info",
            ShowExitShields: "Has Exit Signs",
            ShowTurnTTS: "Has TIO",
            AlertTurnTTS: "Alert if TTS is different from default",
            NodeShieldMissing: "Nodes that might be missing shields",
            NodeShieldMissingClr: "Nodes that might be missing shields",
            resetSettings: "Reset Settings",
            disabledFeat: "(Feature not configured for this country)",
            ShowTowards: "Has Towards",
            ShowVisualInst: "Has Visual Instruction",
            SegHasDir: "Segment Shields with direction",
            SegHasDirClr: "Segment Shields with direction",
            SegInvDir: "Segment Shields without direction",
            SegInvDirClr: "Segment Shields without direction",
            IconHead: "Map Icons",
            HighlightHead: "Highlights",
            HighlightColors: "Highlight Colors",
            ShowRamps: "Include Ramps",
            Experimental: "Experimental Features (Use at Your own Risk)",
            AlternativeShields: "Alternative Name Shields",
            AlternativePrimaryCity: "Alternative Street with Primary City",
            AlternativeNoCity: "Alternative Street with No City",
            mHPlus: "Only show on minor highways or greater",
            titleCase: "Segments/nodes with direction not in large-and-small-caps format",
            TitleCaseClr: "Segments/nodes with direction not in large-and-small-caps format",
            TitleCaseSftClr: "Direction in free text might not be in large-and-small-caps format",
            checkTWD: "Include Towards field",
            checkTTS: "Include TTS field",
            checkVI: "Include Visual Instruction field",
        },
        "en-us": {
            enableScript: "Script enabled",
            HighSegShields: "Segments with Shields",
            HighSegShieldsClr: "Segments with Shields",
            ShowSegShields: "Show Segment Shields on Map",
            SegShieldMissing: "Segments that might be missing shields",
            SegShieldMissingClr: "Segments that might be missing shields",
            SegShieldError: "Segments that have shields but maybe shouldn't",
            SegShieldErrorClr: "Segments that have shields but maybe shouldn't",
            HighNodeShields: "Nodes with Shields (TG)",
            HighNodeShieldsClr: "Nodes with Shields (TG)",
            ShowNodeShields: "Show Node Shield Info",
            ShowExitShields: "Has Exit Signs",
            ShowTurnTTS: "Has TIO",
            AlertTurnTTS: "Alert if TTS is different from default",
            NodeShieldMissing: "Nodes that might be missing shields",
            NodeShieldMissingClr: "Nodes that might be missing shields",
            resetSettings: "Reset Settings",
            disabledFeat: "(Feature not configured for this country)",
            ShowTowards: "Has Towards",
            ShowVisualInst: "Has Visual Instruction",
            SegHasDir: "Segment Shields with direction",
            SegHasDirClr: "Segment Shields with direction",
            SegInvDir: "Segment Shields without direction",
            SegInvDirClr: "Segment Shields without direction",
            IconHead: "Map Icons",
            HighlightHead: "Highlights",
            HighlightColors: "Highlight Colors",
            ShowRamps: "Include Ramps",
            Experimental: "Experimental Features (Unstable use at Your own Risk)",
            AlternativeShields: "Alternative Name Shields",
            AlternativePrimaryCity: "Alternative Street with Primary City",
            AlternativeNoCity: "Alternative Street with No City",
            mHPlus: "Only show on minor highways or greater",
            titleCase: "Segments/nodes with direction not in large-and-small-caps format",
            TitleCaseClr: "Segments/nodes with direction not in large-and-small-caps format",
            TitleCaseSftClr: "Direction in free text might not be in large-and-small-caps format",
            checkTWD: "Include Towards field",
            checkTTS: "Include TTS field",
            checkVI: "Include Visual Instruction field",
        },
        "es-419": {
            enableScript: "Script habilitado",
            HighSegShields: "Segmentos con escudos",
            HighSegShieldsClr: "Segmentos con escudos",
            ShowSegShields: "Mostrar escudos de segmentos en el mapa",
            SegShieldMissing: "Segmentos a los que les pueden faltar escudos",
            SegShieldMissingClr: "Segmentos a los que les pueden faltar escudos",
            SegShieldError: "Segmentos que tienen escudos y quizá no deberían",
            SegShieldErrorClr: "Segmentos que tienen escudos y quizá no deberían",
            HighNodeShields: "Nodos con escudos (TG)",
            HighNodeShieldsClr: "Nodos con escudos (TG)",
            ShowNodeShields: "Mostrar Info de Escudo en Nodo",
            ShowExitShields: "Incluir iconos de giro (si existen)",
            ShowTurnTTS: "Incuir TTS",
            AlertTurnTTS: "Alertar si TTS fue modificado",
            NodeShieldMissing: "Nodos a los que les pueden faltar escudos",
            NodeShieldMissingClr: "Nodos a los que les pueden faltar escudos",
            resetSettings: "Reiniciar ajustes",
            disabledFeat: "(Funcionalidad no configurada para ese país)",
            ShowTowards: "Incluir dirección (si existe)",
            ShowVisualInst: "Incluir instrucción visual",
            SegHasDir: "Escudos con dirección",
            SegHasDirClr: "Escudos con dirección",
            SegInvDir: "Escudos sin dirección",
            SegInvDirClr: "Escudos sin dirección",
            IconHead: "Iconos en mapa",
            HighlightHead: "Destacar",
            HighlightColors: "Reseña de Colores",
            ShowRamps: "Incluir Rampas",
            Experimental: "Experimental Features",
            AlternativeShields: "Alternative Name Shields",
            AlternativePrimaryCity: "Alternative Street with Primary City",
            AlternativeNoCity: "Alternative Street with No City",
            mHPlus: "Only show on minor highways or greater",
            titleCase: "Segments/nodes with direction not in large-and-small-caps format",
            TitleCaseClr: "Segments/nodes with direction not in large-and-small-caps format",
            TitleCaseSftClr: "Direction in free text might not be in large-and-small-caps format",
            checkTWD: "Include Towards field",
            checkTTS: "Include TTS field",
            checkVI: "Include Visual Instruction field",
        },
        uk: {
            enableScript: "Скріпт вимкнено",
            HighSegShields: "Сегменти з шильдами",
            HighSegShieldsClr: "Сегменти з шильдами",
            ShowSegShields: "Показувати шильди на мапі",
            SegShieldMissing: "Сегменти, яким можливо потрібні шильди",
            SegShieldMissingClr: "Сегменти, яким можливо потрібні шильди",
            SegShieldError: "Сегменти, які мають шильди, але можливо вони непотрібні",
            SegShieldErrorClr: "Сегменти, які мають шильди, але можливо вони непотрібні",
            HighNodeShields: "Вузли з шильдами (TG)",
            HighNodeShieldsClr: "Вузли з шильдами (TG)",
            ShowNodeShields: "Показувати деталі шильда на вузлі ",
            ShowExitShields: "Включити іконку повороту (якщо вони є)",
            ShowTurnTTS: "Вимкнути TTS",
            AlertTurnTTS: "Сповіщати, якщо TTS відрізняється від типового",
            NodeShieldMissing: "Вузли, на яких можуть бути відсутні щити",
            NodeShieldMissingClr: "Вузли, на яких можуть бути відсутні щити",
            resetSettings: "Скинути налаштування",
            disabledFeat: "Відсутні налаштування для цієї страни",
            ShowTowards: "Включаючи Towards (якщо існує)",
            ShowVisualInst: "Включаючи візуальні інструкції",
            SegHasDir: "Шильди з напрямками",
            SegHasDirClr: "Шильди з напрямками",
            SegInvDir: "Шильди без напрямків",
            SegInvDirClr: "Шильди без напрямків",
            IconHead: "Іконки на мапі",
            HighlightHead: "Підсвічувати",
            HighlightColors: "Кольори підсвічування",
            ShowRamps: "Включаючи рампи",
            Experimental: "Экспериментальні засобливості",
            AlternativeShields: "Шильди альтернатівних назв",
            AlternativePrimaryCity: "Альтернативна назва с основним містом",
            AlternativeNoCity: "Альтернативна назва без міста",
            mHPlus: "Only show on minor highways or greater",
            titleCase: "Segments/nodes with direction not in large-and-small-caps format",
            TitleCaseClr: "Segments/nodes with direction not in large-and-small-caps format",
            TitleCaseSftClr: "Direction in free text might not be in large-and-small-caps format",
            checkTWD: "Include Towards field",
            checkTTS: "Include TTS field",
            checkVI: "Include Visual Instruction field",
        },
        fr: {
            enableScript: "Script activé",
            HighSegShields: "Segments avec cartouche",
            HighSegShieldsClr: "Segments avec cartouche",
            ShowSegShields: "Afficher les cartouches sur la carte",
            SegShieldMissing: "Segments dont le cartouche pourrait manquer",
            SegShieldMissingClr: "Segments dont le cartouche pourrait manquer",
            SegShieldError: "Segments ayant un cartouche mais ne devraient peut-être pas",
            SegShieldErrorClr: "Segments ayant un cartouche mais ne devraient peut-être pas",
            HighNodeShields: "Noeuds avec cartouche (TG)",
            HighNodeShieldsClr: "Noeuds avec cartouche (TG)",
            ShowNodeShields: "Afficher les infos des cartouches de noeuds",
            ShowExitShields: "As des panneaux de sortie",
            ShowTurnTTS: "Has TIO",
            AlertTurnTTS: "Alert if TTS is different from default",
            NodeShieldMissing: "Noeud dont le cartouche pourrait manquer",
            NodeShieldMissingClr: "Noeud dont le cartouche pourrait manquer",
            resetSettings: "Réinitialiser les paramètres",
            disabledFeat: "Feature not configured for this country",
            ShowTowards: 'As "En direction de"',
            ShowVisualInst: "As des instructions visuelles",
            SegHasDir: "Cartouche de segment avec direction",
            SegHasDirClr: "Cartouche de segment avec direction",
            SegInvDir: "Cartouche de segment sans direction",
            SegInvDirClr: "Cartouche de segment sans direction",
            IconHead: "Icônes de carte",
            HighlightHead: "Surlignages",
            HighlightColors: "Couleurs de surlignage",
            ShowRamps: "Inclure les bretelles",
            mHPlus: "Only show on minor highways or greater",
            Experimental: "Experimental Features",
            AlternativeShields: "Alternative Name Shields",
            AlternativePrimaryCity: "Alternative Street with Primary City",
            AlternativeNoCity: "Alternative Street with No City",
            titleCase: "Segments/nodes with direction not in large-and-small-caps format",
            TitleCaseClr: "Segments/nodes with direction not in large-and-small-caps format",
            TitleCaseSftClr: "Direction in free text might not be in large-and-small-caps format",
            checkTWD: 'Inclure le champ "en direction de"',
            checkTTS: "Inclure le champ TTS",
            checkVI: "Inclure le champ d'instruction visuel",
        },
    };
    const CheckAltName = new Set<number>([
        // France
        73,
    ]);
    let BadNames: (Street | Turn)[] = [];
    let rsaSettings: RSASettings = {
        lastSaveAction: 0,
        enableScript: true,
        HighSegShields: false,
        ShowSegShields: true,
        SegShieldMissing: false,
        SegShieldError: false,
        SegHasDir: false,
        SegInvDir: false,
        HighNodeShields: true,
        ShowNodeShields: false,
        ShowExitShields: false,
        ShowTurnTTS: false,
        AlertTurnTTS: false,
        ShowTowards: false,
        ShowVisualInst: false,
        NodeShieldMissing: false,
        HighSegClr: "#0066ff",
        MissSegClr: "#00ff00",
        ErrSegClr: "#cc00ff",
        HighNodeClr: "#ff00bf",
        MissNodeClr: "#ff0000",
        SegHasDirClr: "#ffff00",
        SegInvDirClr: "#66ffff",
        TitleCaseClr: "#ff9933",
        TitleCaseSftClr: "#ffff66",
        ShowRamps: true,
        AlternativeShields: false,
        mHPlus: false,
        titleCase: false,
        checkTWD: false,
        checkTTS: false,
        checkVI: false,
        mapLayerVisible: false,
        iconLayerVisible: false,
    };
    let UpdateObj;
    let SetTurn;

    const rsaMapLayer = { layerName: "RSA Map Layer", zIndexing: false };
    const rsaIconLayer = { layerName: "RSA Icon Layer", zIndexing: false };
    let LANG: string;
    let alternativeType: string;
    const styleConfig = {
        styleContext: {
            highNodeColor: (context) => {
                return context?.feature?.properties?.style?.strokeColor;
            },
            labelExternalGraphic: (context) => {
                const style = context?.feature?.properties?.style;
                if (!style || !style?.sign || !style?.txt) return "";
                return `https://renderer-am.waze.com/renderer/v1/signs/${style.sign}?text=${style.txt}`;
            },
            labelGraphicHeight: (context) => {
                return context?.feature?.properties?.style?.height;
            },
            labelGraphicWidth: (context) => {
                return context?.feature?.properties?.style?.width;
            },
            shieldExternalGraphic: (context) => {
                return context?.feature?.properties?.style?.externalGraphic;
            },
            shieldGraphicWidth: (context) => {
                return context?.feature?.properties?.style?.graphicWidth;
            },
            shieldGraphicHeight: (context) => {
                return context?.feature?.properties?.style?.graphicHeight;
            },
            shieldLabel: (context) => {
                return context?.feature?.properties?.style?.label;
            },
            nodeStyleStrokeColor: (context) => {
                return context?.feature?.properties?.style?.strokeColor;
            },
            nodeStyleStrokeOpacity: (context) => {
                return context?.feature?.properties?.style?.strokeOpacity;
            },
            nodeStyleStrokeWidth: (context) => {
                return context?.feature?.properties?.style?.strokeWidth;
            },
            nodeStyleFillOpacity: (context) => {
                return context?.feature?.properties?.style?.fillOpacity;
            },
            nodeStylePointRadius: (context) => {
                return context?.feature?.properties?.style?.pointRadius;
            },
            segHighlightStrokeOpacity: (context) => {
                return context?.feature?.properties?.style?.strokeOpacity;
            },
            segHighlightStrokeColor: (context) => {
                return context?.feature?.properties?.style?.strokeColor;
            },
            segHighlightStrokeWidth: (context) => {
                return context?.feature?.properties?.style?.strokeWidth;
            },
            segHighlightFillColor: (context) => {
                return context?.feature?.properties?.style?.fillColor;
            },
            segHighlightFillOpacity: (context) => {
                return context?.feature?.properties?.style?.fillOpacity;
            },
            shieldLabelYOffset: (context) => {
                return context?.feature?.properties?.style?.labelYOffset;
            },
        },
        styleRules: [
            {
                predicate: applyPointLabel,
                style: {
                    strokeColor: "${highNodeColor}",
                    strokeOpacity: 0.75,
                    strokeWidth: 4,
                    fillColor: "${highNodeColor}",
                    fillOpacity: 0.75,
                    pointRadius: 3,
                },
            },
            {
                predicate: applyShield,
                style: {
                    externalGraphic: "${shieldExternalGraphic}",
                    graphicWidth: "${shieldGraphicWidth}",
                    graphicHeight: "${shieldGraphicHeight}",
                    graphicXOffset: -20,
                    graphicYOffset: -20,
                    style: "opacity: 1",
                    fillOpacity: 1,
                    fill: "black",
                    stroke: "black",
                    fontColor: "green",
                    labelOutlineColor: "white",
                    labelOutlineWidth: 1,
                    fontSize: 12,
                    display: "grid",
                    label: "${shieldLabel}",
                    labelYOffset: "${shieldLabelYOffset}",
                },
            },
            {
                predicate: applySegHighlight,
                style: {
                    strokeColor: "${segHighlightStrokeColor}",
                    strokeOpacity: "${segHighlightStrokeOpacity}",
                    strokeWidth: "${segHighlightStrokeWidth}",
                    fillColor: "${segHighlightFillColor}",
                    fillOpacity: "${segHighlightFillOpacity}",
                },
            },
            {
                predicate: applyStyleNode,
                style: {
                    strokeColor: "${nodeStyleStrokeColor}",
                    strokeOpacity: "${nodeStyleStrokeOpacity}",
                    strokeWidth: "${nodeStyleStrokeWidth}",
                    fillColor: "${nodeStyleFillColor}",
                    fillOpacity: "${nodeStyleFillOpacity}",
                    pointRadius: "${nodeStylePointRadius}",
                },
            },
            {
                predicate: applyStyleLabel,
                style: {
                    externalGraphic: "${labelExternalGraphic}",
                    graphicHeight: "${labelGraphicHeight}",
                    graphicWidth: "${labelGraphicWidth}",
                    fillOpacity: "${nodeStyleFillOpacity}",
                    fontSize: 12,
                    graphicZIndex: 2432,
                },
            },
        ],
    };

    console.debug(`SDK v. ${sdk.getSDKVersion()} on ${sdk.getWMEVersion()} initialized`);

    // function rsaBootstrap() {
    //     // if (!document.getElementById('edit-panel') || !sdk.DataModel.Countries.getTopCountry() || !WazeWrap.Ready) {
    //     //     setTimeout(rsaBootstrap, 200);
    //     // }
    //     if (sdk.State.isReady()) {
    //         initRSA();
    //     } else {
    //         sdk.Events.once({eventName: "wme-ready"}).then(initRSA);
    //     }
    // }

    function initRSA() {
        const locale = sdk.Settings.getLocale();
        LANG = locale.localeCode.toLowerCase();

        console.log("RSA: Initializing...");

        // let UpdateObj = sdk.DataModel. require('Waze/Action/UpdateObject');
        // let SetTurn = require('Waze/Model/Graph/Actions/SetTurn');

        const rsaCss = [
            '.rsa-wrapper {position:relative;width:100%;font-size:12px;font-family:"Rubik", "Boing-light", sans-serif;user-select:none;}',
            ".rsa-section-wrapper {display:block;width:100%;padding:4px;}",
            ".rsa-section-wrapper.border {border-bottom:1px solid grey;margin-bottom:5px;}",
            ".rsa-header {font-weight:bold;}",
            ".rsa-option-container {padding:3px;}",
            ".rsa-option-container.no-display {display:none;}",
            ".rsa-option-container.sub {margin-left:20px;}",
            'input[type="checkbox"].rsa-checkbox {display:inline-block;position:relative;top:3px;vertical-align:top;margin:0;}',
            'input[type="color"].rsa-color-input {display:inline-block;position:relative;width:20px;padding:0px 1px;border:0px;vertical-align:top;cursor:pointer;}',
            'input[type="color"].rsa-color-input:focus {outline-width:0;}',
            "label.rsa-label {display:inline-block;position:relative;max-width:80%;vertical-align:top;font-weight:normal;padding-left:5px;word-wrap:break-word;}",
            ".group-title.toolbar-top-level-item-title.rsa:hover {cursor:pointer;}",
        ].join(" ");

        const $rsaTab = $("<div>");
        $rsaTab.html = [
            `<div class='rsa-wrapper' id='rsa-tab-wrapper'>
        <div style='margin-bottom:5px;border-bottom:1px solid black;'>
            <span style='font-weight:bold;'>
                <a href='https://www.waze.com/forum/viewtopic.php?f=1851&t=315748' target='_blank' style='text-decoration:none;'>Road Shield Assistant</a>
            </span> - v${GM_info.script.version}
        </div>
        <div class='rsa-option-container'>
            <input type=checkbox class='rsa-checkbox' id='rsa-enableScript' />
            <label class='rsa-label' for='rsa-enableScript'><span id='rsa-text-enableScript'></span></label>
        </div>
        <div class='rsa-option-container'>
            <input type=checkbox class='rsa-checkbox' id='rsa-ShowRamps' />
            <label class='rsa-label' for='rsa-ShowRamps'><span id='rsa-text-ShowRamps'></span></label>
        </div>
        <div class='rsa-option-container'>
            <input type=checkbox class='rsa-checkbox' id='rsa-mHPlus' />
            <label class='rsa-label' for='rsa-mHPlus'><span id='rsa-text-mHPlus'></span></label>
        </div>

        <span id='rsa-text-IconHead' class='rsa-header'></span>
        <div style='border-top:2px solid black;'>
            <div class='rsa-option-container'>
                <input type=checkbox class='rsa-checkbox' id='rsa-ShowSegShields' />
                <label class='rsa-label' for='rsa-ShowSegShields'><span id='rsa-text-ShowSegShields'></span></label>
            </div>
            <div class='rsa-option-container no-display'>
                <input type=checkbox class='rsa-checkbox' id='rsa-NodeShieldMissing' />
                <label class='rsa-label' for='rsa-NodeShieldMissing'><span id='rsa-text-NodeShieldMissing'></span></label>
            </div>
            <div class='rsa-option-container'>
                <input type=checkbox class='rsa-checkbox' id='rsa-ShowNodeShields' />
                <label class='rsa-label' for='rsa-ShowNodeShields'><span id='rsa-text-ShowNodeShields'></span></label>
            </div>
            <div class='rsa-option-container sub'>
                <input type=checkbox class='rsa-checkbox' id='rsa-ShowExitShields' />
                <label class='rsa-label' for='rsa-ShowExitShields'><span id='rsa-text-ShowExitShields'></span></label>
            </div>
            <div class='rsa-option-container sub'>
                <input type=checkbox class='rsa-checkbox' id='rsa-ShowTurnTTS' />
                <label class='rsa-label' for='rsa-ShowTurnTTS'><span id='rsa-text-ShowTurnTTS'></span></label>
            </div>
            <div class='rsa-option-container sub'>
                <input type=checkbox class='rsa-checkbox' id='rsa-ShowTowards' />
                <label class='rsa-label' for='rsa-ShowTowards'><span id='rsa-text-ShowTowards'></span></label>
            </div>
            <div class='rsa-option-container sub'>
                <input type=checkbox class='rsa-checkbox' id='rsa-ShowVisualInst' />
                <label class='rsa-label' for='rsa-ShowVisualInst'><span id='rsa-text-ShowVisualInst'></span></label>
            </div>
            <div class='rsa-option-container sub' style='display:none;'>
                <input type=checkbox class='rsa-checkbox' id='rsa-AlertTurnTTS' />
                <label class='rsa-label' for='rsa-AlertTurnTTS'><span id='rsa-text-AlertTurnTTS'></span></label>
            </div>
        </div>

        <span id='rsa-text-HighlightHead' class='rsa-header'></span>
        <div style='border-top:2px solid black;'>
            <div class='rsa-option-container' style='display:none;'>
                <input type=checkbox class='rsa-checkbox' id='rsa-HighNodeShields' />
                <label class='rsa-label' for='rsa-HighNodeShields'><span id='rsa-text-HighNodeShields'></span></label>
            </div>
            <div class='rsa-option-container'>
                <input type=checkbox class='rsa-checkbox' id='rsa-HighSegShields' />
                <label class='rsa-label' for='rsa-HighSegShields'><span id='rsa-text-HighSegShields'></span></label>
            </div>
            <div class='rsa-option-container'>
                <input type=checkbox class='rsa-checkbox' id='rsa-SegHasDir' />
                <label class='rsa-label' for='rsa-SegHasDir'><span id='rsa-text-SegHasDir'></span></label>
            </div>
            <div class='rsa-option-container'>
                <input type=checkbox class='rsa-checkbox' id='rsa-SegInvDir' />
                <label class='rsa-label' for='rsa-SegInvDir'><span id='rsa-text-SegInvDir'></span></label>
            </div>
            <div class='rsa-option-container' id='rsa-container-titleCase'>
                <input type=checkbox class='rsa-checkbox' id='rsa-titleCase' />
                <label class='rsa-label' for='rsa-titleCase'><span id='rsa-text-titleCase'></span></label>
            </div>
            <div class='rsa-option-container sub' id='rsa-container-checkTWD'>
                <input type=checkbox class='rsa-checkbox' id='rsa-checkTWD' />
                <label class='rsa-label' for='rsa-checkTWD'><span id='rsa-text-checkTWD'></span></label>
            </div>
            <div class='rsa-option-container sub' id='rsa-container-checkTTS'>
                <input type=checkbox class='rsa-checkbox' id='rsa-checkTTS' />
                <label class='rsa-label' for='rsa-checkTTS'><span id='rsa-text-checkTTS'></span></label>
            </div>
            <div class='rsa-option-container sub' id='rsa-container-checkVI'>
                <input type=checkbox class='rsa-checkbox' id='rsa-checkVI' />
                <label class='rsa-label' for='rsa-checkVI'><span id='rsa-text-checkVI'></span></label>
            </div>
            <div class='rsa-option-container'>
                <input type=checkbox class='rsa-checkbox' id='rsa-SegShieldMissing' />
                <label class='rsa-label' for='rsa-SegShieldMissing'><span id='rsa-text-SegShieldMissing'></span></label>
            </div>
            <div class='rsa-option-container'>
                <input type=checkbox class='rsa-checkbox' id='rsa-SegShieldError' />
                <label class='rsa-label' for='rsa-SegShieldError'><span id='rsa-text-SegShieldError'></span></label>
            </div>
        </div>
        <span id='rsa-text-HighlightColors' class='rsa-header'></span>
        <div style='border-top:2px solid black;'>
            <div class='rsa-option-container'>
                <input type=color class='rsa-color-input' id='rsa-HighSegClr' />
                <label class='rsa-label' for='rsa-HighSegClr'><span id='rsa-text-HighSegShieldsClr'></span></label>
            </div>
            <div class='rsa-option-container'>
                <input type=color class='rsa-color-input' id='rsa-SegHasDirClr' />
                <label class='rsa-label' for='rsa-SegHasDirClr'><span id='rsa-text-SegHasDirClr'></span></label>
            </div>
            <div class='rsa-option-container'>
                <input type=color class='rsa-color-input' id='rsa-SegInvDirClr' />
                <label class='rsa-label' for='rsa-SegInvDirClr'><span id='rsa-text-SegInvDirClr'></span></label>
            </div>
            <div class='rsa-option-container'>
                <input type=color class='rsa-color-input' id='rsa-MissSegClr' />
                <label class='rsa-label' for='rsa-MissSegClr'><span id='rsa-text-SegShieldMissingClr'></span></label>
            </div>
            <div class='rsa-option-container'>
                <input type=color class='rsa-color-input' id='rsa-ErrSegClr' />
                <label class='rsa-label' for='rsa-ErrSegClr'><span id='rsa-text-SegShieldErrorClr'></span></label>
            </div>
            <div class='rsa-option-container'>
                <input type=color class='rsa-color-input' id='rsa-HighNodeClr' />
                <label class='rsa-label' for='rsa-HighNodeClr'><span id='rsa-text-HighNodeShieldsClr'></span></label>
            </div>
            <div class='rsa-option-container no-display'>
                <input type=color class='rsa-color-input' id='rsa-MissNodeClr' />
                <label class='rsa-label' for='rsa-MissNodeClr'><span id='rsa-text-NodeShieldMissingClr'></span></label>
            </div>
            <div class='rsa-option-container' id='rsa-container-TitleCaseClr'>
                <input type=color class='rsa-color-input' id='rsa-TitleCaseClr' />
                <label class='rsa-label' for='rsa-TitleCaseClr'><span id='rsa-text-TitleCaseClr'></span></label>
            </div>
            <div class='rsa-option-container' id='rsa-container-TitleCaseSftClr'>
                <input type=color class='rsa-color-input' id='rsa-TitleCaseSftClr' />
                <label class='rsa-label' for='rsa-TitleCaseSftClr'><span id='rsa-text-TitleCaseSftClr'></span></label>
            </div>
        </div>
        <span id='rsa-text-Experimental' class='rsa-header'></span>
        <div style='border-top:2px solid black;'>
            <div class='rsa-option-container'>
                <input type=checkbox class='rsa-checkbox' id='rsa-AlternativeShields' />
                <label class='rsa-label' for='rsa-AlternativeShields'><span id='rsa-text-AlternativeShields'></span></label>
            </div>
            <div class='rsa-option-container sub'>
                <input type=radio class='rsa-checkbox' value='AlternativePrimaryCity' name='AlternativeShields' id='rsa-AlternativePrimaryCity' checked/>
                <label class='rsa-label' for='rsa-AlternativePrimaryCity'><span id='rsa-text-AlternativePrimaryCity'></span></label>
            </div>
            <div class='rsa-option-container sub'>
                <input type=radio class='rsa-checkbox' value='AlternativeNoCity' name='AlternativeShields' id='rsa-AlternativeNoCity' />
                <label class='rsa-label' for='rsa-AlternativeNoCity'><span id='rsa-text-AlternativeNoCity'></span></label>
            </div>
        </div>

        <div style='border-top:2px solid black;'>
            <div class='rsa-option-container'>
                <input type=button id='rsa-resetSettings' />
            </div>
        </div>
    </div>`,
        ].join(" ");

        const $rsaFixWrapper = $(
            '<div id="rsa-autoWrapper" class="toolbar-button ItemInactive" style="display:none;margin-right:5px;">'
        );
        const $rsaFixInner = $(
            '<div class="group-title toolbar-top-level-item-title rsa" style="margin:5px 0 0 15px;font-size:12px;">RSA Fix</div>'
        );

        // WazeWrap.Interface.Tab('RSA', $rsaTab.html, setupOptions, 'RSA');
        sdk.Sidebar.registerScriptTab().then(async (r: any) => {
            console.log("RSA: Registering sidebar tab");
            r.tabLabel.innerHTML = "RSA";
            r.tabPane.innerHTML = $rsaTab.html;
            console.log("RSA: Starting setupOptions");
            await setupOptions();
            console.log("RSA: setupOptions complete");
        });
        $(`<style type="text/css">${rsaCss}</style>`).appendTo("head");
        // $($rsaFixInner).appendTo($rsaFixWrapper);
        // $($rsaFixWrapper).appendTo($('#primary-toolbar > div'));
        WazeWrap.Interface.ShowScriptUpdate(
            GM_info.script.name,
            GM_info.script.version,
            RSA_UPDATE_NOTES,
            GF_LINK,
            FORUM_LINK
        );
        console.log("RSA: loaded");
    }

    function processAlternativeSettings() {
        if (rsaSettings.AlternativeShields) {
            const alt_primary = $("#rsa-AlternativePrimaryCity");
            alt_primary.prop("disabled", false);
            const alt_nocity = $("#rsa-AlternativeNoCity");
            alt_nocity.prop("disabled", false);
            const primaryCityButton: HTMLInputElement = alt_primary[0] as HTMLInputElement;
            const noCityButton: HTMLInputElement = alt_primary[0] as HTMLInputElement;
            if (primaryCityButton.checked) {
                alternativeType = primaryCityButton.value;
            }
            if (noCityButton.checked) {
                alternativeType = noCityButton.value;
            }
        }
        toggleAlternativeShields();
    }

    function getId(ele: string) {
        return document.getElementById(ele);
    }

    function setChecked(ele: string, status: boolean) {
        $(`#${ele}`).prop("checked", status);
    }

    function setValue(ele: string, value: string) {
        const inputElem = $(`#${ele}`);
        inputElem.attr("value", value);
        // inputElem.css('border', `1px solid ${value}`);
    }

    function toggleAlternativeShields() {
        if (!rsaSettings.AlternativeShields) {
            $("#rsa-AlternativePrimaryCity").prop("disabled", true);
            $("#rsa-AlternativeNoCity").prop("disabled", true);
        }
    }

    function applyPointLabel(properties: FeatureProperties): boolean {
        return properties.styleName === "pointLabelStyle";
    }

    function applyShield(properties: FeatureProperties): boolean {
        return properties.styleName === "shield";
    }

    function applySegHighlight(properties: FeatureProperties): boolean {
        return properties.styleName === "segHighlight";
    }

    function applyStyleNode(properties: FeatureProperties): boolean {
        return properties.styleName === "styleNode";
    }

    function applyStyleLabel(properties: FeatureProperties): boolean {
        return properties.styleName === "styleLabel";
    }

    function updateMap() {
        removeAutoFixButton();
        tryScan();
        checkOptions();
    }

    async function setupOptions() {
        console.log("RSA: setupOptions started");
        try {
            await loadSettings();
            console.log("RSA: loadSettings complete");
        } catch (e) {
            console.error("RSA: Error in loadSettings", e);
        }

        // Create OL layer for display

        sdk.Map.addLayer({
            layerName: rsaMapLayer.layerName,
            styleRules: styleConfig.styleRules,
            styleContext: styleConfig.styleContext,
        });
        sdk.LayerSwitcher.addLayerCheckbox({ name: rsaMapLayer.layerName });
        sdk.LayerSwitcher.setLayerCheckboxChecked({
            name: rsaMapLayer.layerName,
            isChecked: rsaSettings.mapLayerVisible,
        });
        sdk.Map.setLayerVisibility({ layerName: rsaMapLayer.layerName, visibility: rsaSettings.mapLayerVisible });

        sdk.Map.addLayer({
            layerName: rsaIconLayer.layerName,
            styleRules: styleConfig.styleRules,
            styleContext: styleConfig.styleContext,
        });
        sdk.LayerSwitcher.addLayerCheckbox({ name: rsaIconLayer.layerName });
        sdk.Map.setLayerVisibility({ layerName: rsaIconLayer.layerName, visibility: rsaSettings.iconLayerVisible });
        sdk.LayerSwitcher.setLayerCheckboxChecked({
            name: rsaIconLayer.layerName,
            isChecked: rsaSettings.iconLayerVisible,
        });
        sdk.Events.on({
            eventName: "wme-layer-checkbox-toggled",
            eventHandler: (payload) => {
                sdk.Map.setLayerVisibility({ layerName: payload.name, visibility: payload.checked });
                if (payload.name === rsaMapLayer.layerName) {
                    rsaSettings.mapLayerVisible = payload.checked;
                } else if (payload.name === rsaIconLayer.layerName) {
                    rsaSettings.iconLayerVisible = payload.checked;
                }
                if (payload.checked) tryScan();
                saveSettings();
            },
        });

        // Set user options
        function setEleStatus() {
            setChecked("rsa-enableScript", rsaSettings.enableScript);
            setChecked("rsa-HighSegShields", rsaSettings.HighSegShields);
            setChecked("rsa-ShowSegShields", rsaSettings.ShowSegShields);
            setChecked("rsa-SegShieldMissing", rsaSettings.SegShieldMissing);
            setChecked("rsa-SegShieldError", rsaSettings.SegShieldError);
            setChecked("rsa-HighNodeShields", rsaSettings.HighNodeShields);
            setChecked("rsa-ShowNodeShields", rsaSettings.ShowNodeShields);
            setChecked("rsa-ShowExitShields", rsaSettings.ShowExitShields);
            setChecked("rsa-ShowTurnTTS", rsaSettings.ShowTurnTTS);
            setChecked("rsa-AlertTurnTTS", rsaSettings.AlertTurnTTS);
            setChecked("rsa-ShowTowards", rsaSettings.ShowTowards);
            setChecked("rsa-ShowVisualInst", rsaSettings.ShowVisualInst);
            setChecked("rsa-NodeShieldMissing", rsaSettings.NodeShieldMissing);
            setChecked("rsa-SegHasDir", rsaSettings.SegHasDir);
            setChecked("rsa-SegInvDir", rsaSettings.SegInvDir);
            setChecked("rsa-ShowRamps", rsaSettings.ShowRamps);
            setChecked("rsa-mHPlus", rsaSettings.mHPlus);
            setChecked("rsa-titleCase", rsaSettings.titleCase);
            setChecked("rsa-checkTWD", rsaSettings.checkTWD);
            setChecked("rsa-checkTTS", rsaSettings.checkTTS);
            setChecked("rsa-checkVI", rsaSettings.checkVI);
            setChecked("rsa-AlternativeShields", rsaSettings.AlternativeShields);
            setValue("rsa-HighSegClr", rsaSettings.HighSegClr);
            setValue("rsa-MissSegClr", rsaSettings.MissSegClr);
            setValue("rsa-ErrSegClr", rsaSettings.ErrSegClr);
            setValue("rsa-HighNodeClr", rsaSettings.HighNodeClr);
            setValue("rsa-MissNodeClr", rsaSettings.MissNodeClr);
            setValue("rsa-SegHasDirClr", rsaSettings.SegHasDirClr);
            setValue("rsa-SegInvDirClr", rsaSettings.SegInvDirClr);
            setValue("rsa-TitleCaseClr", rsaSettings.TitleCaseClr);
            setValue("rsa-TitleCaseSftClr", rsaSettings.TitleCaseSftClr);

            $("#rsa-AlternativeShields").on("change", (e) => {
                processAlternativeSettings();
            });

            if (rsaSettings.titleCase && sdk.DataModel.Countries.getTopCountry()?.id === 235) {
                $("#rsa-container-checkTWD").css("display", "block");
                $("#rsa-container-checkTTS").css("display", "block");
                $("#rsa-container-checkVI").css("display", "block");
            } else {
                $("#rsa-container-checkTWD").css("display", "none");
                $("#rsa-container-checkTTS").css("display", "none");
                $("#rsa-container-checkVI").css("display", "none");
            }

            toggleAlternativeShields();
        }

        // Register event listeners
        // WazeWrap.Events.register('selectionchanged', null, removeAutoFixButton);
        sdk.Events.on({ eventName: "wme-selection-changed", eventHandler: removeAutoFixButton });
        // WazeWrap.Events.register('selectionchanged', null, tryScan);
        sdk.Events.on({ eventName: "wme-map-move-end", eventHandler: updateMap });
        sdk.Events.on({ eventName: "wme-map-zoom-changed", eventHandler: updateMap });

        const shortcutKeys = "A+83";
        const keysInUse = sdk.Shortcuts.areShortcutKeysInUse({ shortcutKeys });

        if (keysInUse) {
            console.warn("RSA: Shortcut key A+S was already in use, registering addShield without a key binding.");
        }

        try {
            sdk.Shortcuts.createShortcut({
                callback: addShieldClick,
                description: "Activates the Add Shield Button",
                shortcutId: "addShield",
                shortcutKeys: keysInUse ? null : shortcutKeys,
            });
        } catch (e) {
            console.error("RSA: Failed to register addShield shortcut:", e);
        }
        // new WazeWrap.Interface.Shortcut('addShield',
        //                                 'Activates the Add Shield Button',
        //                                 'wmersa',
        //                                 'Road Shield Assistant',
        //                                 rsaSettings.addShield,
        //                                 addShieldClick, null).add();

        setEleStatus();

        $("input[type=radio][name=AlternativeShields]").on("change", () => {
            processAlternativeSettings();
            saveSettings();
            removeHighlights();
            tryScan();
        });

        $(".rsa-checkbox").on("change", function () {
            const settingName = $(this)[0].id.substring(4);
            rsaSettings[settingName as keyof RSASettings] = (this as HTMLInputElement).checked;

            // Check to ensure highlight nodes and show node shields don't overlap each other
            // if (settingName = 'ShowNodeShields') {
            //     if (this.checked) {
            //         $('rsa-HighNodeShields').prop('checked', false);
            //         rsaSettings.HighNodeShields = false;
            //     }
            // } else if (settingName = 'HighNodeShields') {
            //     if (this.checked) {
            //         $('rsa-ShowNodeShields').prop('checked', false);
            //         rsaSettings.ShowNodeShields = false;
            //     }
            // }
            if (settingName === "AlternativeShields") processAlternativeSettings();
            saveSettings();
            removeHighlights();
            tryScan();
        });
        $(".rsa-color-input").on("change", function () {
            const settingName: string = $(this)[0].id.substring(4);
            rsaSettings[settingName as keyof RSASettings] = (this as HTMLInputElement).value;
            saveSettings();
            setEleStatus();
            removeHighlights();
            tryScan();
        });
        $("#rsa-titleCase").trigger("click", () => {
            const titleCase: HTMLInputElement = getId("rsa-titleCase") as HTMLInputElement;
            if (titleCase?.checked) {
                $("#rsa-container-checkTWD").css("display", "block");
                $("#rsa-container-checkTTS").css("display", "block");
                $("#rsa-container-checkVI").css("display", "block");
            } else {
                $("#rsa-container-checkTWD").css("display", "none");
                $("#rsa-container-checkTTS").css("display", "none");
                $("#rsa-container-checkVI").css("display", "none");
            }
        });
        // $('#rsa-ShowNodeShields').click(function() {
        //     if (!getId('rsa-ShowNodeShields').checked) $('.rsa-option-container.sub').hide();
        //     else $('.rsa-option-container.sub').show();
        // });
        $("#rsa-resetSettings").on("click", () => {
            const defaultSettings: RSASettings = {
                lastSaveAction: 0,
                enableScript: true,
                HighSegShields: false,
                ShowSegShields: true,
                SegShieldMissing: false,
                SegShieldError: false,
                SegHasDir: false,
                SegInvDir: false,
                HighNodeShields: true,
                ShowNodeShields: false,
                ShowExitShields: false,
                ShowTurnTTS: false,
                AlertTurnTTS: false,
                ShowTowards: false,
                ShowVisualInst: false,
                NodeShieldMissing: false,
                HighSegClr: "#0066ff",
                MissSegClr: "#00ff00",
                ErrSegClr: "#cc00ff",
                HighNodeClr: "#ff00bf",
                MissNodeClr: "#ff0000",
                SegHasDirClr: "#ffff00",
                SegInvDirClr: "#66ffff",
                TitleCaseClr: "#ff9933",
                TitleCaseSftClr: "#ffff66",
                ShowRamps: true,
                AlternativeShields: false,
                mHPlus: false,
                titleCase: false,
                checkTWD: false,
                checkTTS: false,
                checkVI: false,
                mapLayerVisible: false,
                iconLayerVisible: false,
            };

            rsaSettings = defaultSettings;
            saveSettings();
            setEleStatus();
        });
        // Add translated UI text
        if (!Strings[LANG]) LANG = "en";
        const messageKeys = Object.keys(Strings[LANG]);
        for (let i = 0; i < messageKeys.length; i++) {
            const key = messageKeys[i];
            $(`#rsa-text-${key}`).text(Strings[LANG][key]);
        }
        $("#rsa-resetSettings").attr("value", Strings[LANG].resetSettings);

        checkOptions();
    }

    const mainRoadSheetID = "10RiokHwpEdcDu5AotXVBbesAzixDSCm9y5x44TRsToI";
    const gvizCache = new Map<string, Promise<any>>();  // Cache parsed gviz responses by URL

    async function parseGvizResponse(responseText: string) {
        const match = responseText.match(/google\.visualization\.Query\.setResponse\(([\s\S]+)\);/);
        if (!match) {
            throw new Error("Failed to parse Google Sheet data");
        }
        return JSON.parse(match[1]);
    }

    async function gvizFetch(url: string): Promise<any> {
        // Return cached parsed response if available
        if (gvizCache.has(url)) {
            console.log(`RSA: gvizFetch (cached) for URL: ${url}`);
            return gvizCache.get(url)!;
        }

        console.log(`RSA: gvizFetch called with URL: ${url}`);
        const promise = new Promise<any>((resolve, reject) => {
            GM_xmlhttpRequest({
                method: "GET",
                url: url,
                timeout: 10000,
                onload: (response) => {
                    console.log(`RSA: gviz request to ${url} returned status ${response.status}`);
                    if (response.status === 200) {
                        try {
                            const json = parseGvizResponse(response.responseText);
                            resolve(json);
                        } catch (e) {
                            reject(e);
                        }
                    } else {
                        const err = new Error(`HTTP ${response.status}: ${response.statusText} from ${url}`);
                        console.error(`RSA: HTTP error`, err);
                        reject(err);
                    }
                },
                onerror: (err) => {
                    console.error("RSA: gviz request error", err);
                    reject(err);
                },
                ontimeout: () => {
                    console.error("RSA: gviz request timeout");
                    reject(new Error("Request timeout"));
                },
            });
        });

        // Cache the promise
        gvizCache.set(url, promise);
        return promise;
    }

    async function loadCountryAbbr(countryId: number, sheetKey: string, stateName?: string) {
        if (!mainSheetLoaded || loadingCountries.has(countryId)) return;

        loadingCountries.add(countryId);

        try {
            const countryWide: StateRoadInfo = {};

            // Determine which sheets to load
            let sheetsToLoad: string[] = [""];  // Always load country-wide (default) sheet

            // If a specific state is requested, load only that state + country-wide
            if (stateName) {
                sheetsToLoad.push(stateName);
            } else {
                // Initial load: just load country-wide sheet for fast startup
                // State sheets will be loaded on-demand when needed
                sheetsToLoad = [""];
            }

            // Load sheets in parallel
            const sheetPromises = sheetsToLoad.map(async (sheetName) => {
                try {
                    const sheetUrl = sheetName
                        ? `https://docs.google.com/spreadsheets/d/${sheetKey}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`
                        : `https://docs.google.com/spreadsheets/d/${sheetKey}/gviz/tq?tqx=out:json`;

                    const json = await gvizFetch(sheetUrl);

                    if (json.table && json.table.rows && json.table.rows.length > 0) {
                        const sheetData: Record<string, number> = {};

                        for (const row of json.table.rows) {
                            if (!row.c || row.c.length < 2) continue;

                            const abbr = row.c[0]?.v;
                            const iconIdValue = row.c[1]?.v;

                            if (!abbr || typeof abbr !== "string" || iconIdValue === null || iconIdValue === undefined) continue;

                            const iconID = typeof iconIdValue === "number" ? iconIdValue : parseInt(iconIdValue, 10);
                            sheetData[abbr] = iconID;
                        }
                        return { sheetName, sheetData, count: Object.keys(sheetData).length };
                    }
                } catch (e) {
                    // Sheet might not exist, skip it
                }
                return null;
            });

            const results = await Promise.allSettled(sheetPromises);
            for (const result of results) {
                if (result.status === "fulfilled" && result.value) {
                    const { sheetName, sheetData } = result.value;
                    countryWide[sheetName] = sheetData;
                }
            }

            if (Object.keys(countryWide).length > 0 && Object.values(countryWide).some(state => Object.keys(state).length > 0)) {
                RoadAbbr[countryId] = countryWide;
            }
        } catch (e) {
            console.error("RSA: Unable to load road abbreviation data from Google Sheets", e);
        } finally {
            loadingCountries.delete(countryId);
        }
    }

    async function loadMainRoadAbbr() {
        try {
            const gvizUrl = `https://docs.google.com/spreadsheets/d/${mainRoadSheetID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent("CountryData")}`;
            const json = await gvizFetch(gvizUrl);

            if (json.table && json.table.rows) {
                for (const row of json.table.rows) {
                    if (!row.c || row.c.length < 3) continue;

                    const country = row.c[0]?.v;
                    if (!country || country === "Country") continue;

                    const countryCode = parseInt(row.c[1]?.v ?? "0", 10);
                    const sheetKey = row.c[2]?.v;

                    if (countryCode && sheetKey) {
                        CountryDataSheetInfo[countryCode] = sheetKey;
                    }
                }
            }

            mainSheetLoaded = true;
            console.log("RSA: Main Road Abbreviations are Loaded");
        } catch (e) {
            console.error("RSA: Unable to load road abbreviation data from Google Sheets", e);
        }
    }
    async function loadSettings() {
        console.log("RSA: loadSettings started");
        const localSettings = JSON.parse(<string>localStorage.getItem("RSA_Settings"));
        console.log("RSA: localSettings parsed, calling loadMainRoadAbbr");
        const defaultSettings: RSASettings = {
            lastSaveAction: 0,
            enableScript: true,
            HighSegShields: false,
            ShowSegShields: true,
            SegShieldMissing: false,
            SegShieldError: false,
            SegHasDir: false,
            SegInvDir: false,
            HighNodeShields: true,
            ShowNodeShields: false,
            ShowExitShields: false,
            ShowTurnTTS: false,
            AlertTurnTTS: false,
            ShowTowards: false,
            ShowVisualInst: false,
            NodeShieldMissing: false,
            HighSegClr: "#0066ff",
            MissSegClr: "#00ff00",
            ErrSegClr: "#cc00ff",
            HighNodeClr: "#ff00bf",
            MissNodeClr: "#ff0000",
            SegHasDirClr: "#ffff00",
            SegInvDirClr: "#66ffff",
            TitleCaseClr: "#ff9933",
            TitleCaseSftClr: "#ffff66",
            ShowRamps: true,
            AlternativeShields: false,
            mHPlus: false,
            titleCase: false,
            checkTWD: false,
            checkTTS: false,
            checkVI: false,
            mapLayerVisible: false,
            iconLayerVisible: false,
        };

        rsaSettings = $.extend({}, defaultSettings, localSettings);
        await loadMainRoadAbbr();
    }

    async function saveSettings() {
        const {
            enableScript,
            HighSegShields,
            ShowSegShields,
            SegShieldMissing,
            SegShieldError,
            HighNodeShields,
            ShowNodeShields,
            ShowExitShields,
            SegHasDir,
            SegInvDir,
            ShowTurnTTS,
            AlertTurnTTS,
            ShowTowards,
            ShowVisualInst,
            NodeShieldMissing,
            HighSegClr,
            MissSegClr,
            ErrSegClr,
            HighNodeClr,
            MissNodeClr,
            SegHasDirClr,
            SegInvDirClr,
            TitleCaseClr,
            TitleCaseSftClr,
            ShowRamps,
            AlternativeShields,
            mHPlus,
            titleCase,
            checkTWD,
            checkTTS,
            checkVI,
            mapLayerVisible,
            iconLayerVisible,
        } = rsaSettings;

        const localSettings = {
            lastSaveAction: Date.now(),
            enableScript,
            HighSegShields,
            ShowSegShields,
            SegShieldMissing,
            SegShieldError,
            HighNodeShields,
            ShowNodeShields,
            ShowExitShields,
            SegHasDir,
            SegInvDir,
            ShowTurnTTS,
            AlertTurnTTS,
            ShowTowards,
            ShowVisualInst,
            NodeShieldMissing,
            HighSegClr,
            MissSegClr,
            ErrSegClr,
            HighNodeClr,
            MissNodeClr,
            SegHasDirClr,
            SegInvDirClr,
            TitleCaseClr,
            TitleCaseSftClr,
            ShowRamps,
            AlternativeShields,
            mHPlus,
            titleCase,
            checkTWD,
            checkTTS,
            checkVI,
            mapLayerVisible,
            iconLayerVisible,
        };

        // Grab keyboard shortcuts and store them for saving
        // for (const name in W.accelerators.Actions) {
        //     const {shortcut, group} = W.accelerators.Actions[name];
        //     if (group === 'wmersa') {
        //         let TempKeys = '';
        //         if (shortcut) {
        //             if (shortcut.altKey === true) {
        //                 TempKeys += 'A';
        //             }
        //             if (shortcut.shiftKey === true) {
        //                 TempKeys += 'S';
        //             }
        //             if (shortcut.ctrlKey === true) {
        //                 TempKeys += 'C';
        //             }
        //             if (TempKeys !== '') {
        //                 TempKeys += '+';
        //             }
        //             if (shortcut.keyCode) {
        //                 TempKeys += shortcut.keyCode;
        //             }
        //         } else {
        //             TempKeys = '-1';
        //         }
        //         localSettings[name as keyof typeof localSettings] = TempKeys;
        //     }
        // }

        // Required for the instant update of changes to the keyboard shortcuts on the UI
        rsaSettings = localSettings;

        if (localStorage) {
            localStorage.setItem("RSA_Settings", JSON.stringify(localSettings));
        }
    }

    function checkOptions() {
        const countries = sdk.DataModel.Countries.getAll();
        // const countries = W.model.countries.getObjectArray();

        if (countries.length < 1) {
            setTimeout(() => {
                checkOptions();
            }, 500);
            return;
        }
        let allowFeat = false;

        for (let i = 0; i < countries.length; i++) {
            if (RoadAbbr[countries[i].id]) allowFeat = true;
        }

        const segShieldMissing: JQuery<HTMLElement> = $("#rsa-SegShieldMissing");
        const segShieldError: JQuery<HTMLElement> = $("#rsa-SegShieldError");
        const nodeShieldMissing: JQuery<HTMLElement> = $("#rsa-NodeShieldMissing");
        const textSegShieldMissing: JQuery<HTMLElement> = $("#rsa-text-SegShieldMissing");
        const textSegShieldError: JQuery<HTMLElement> = $("#rsa-text-SegShieldError");
        const textNodeShieldMissing: JQuery<HTMLElement> = $("#rsa-text-NodeShieldMissing");
        if (!allowFeat) {
            textSegShieldMissing.prop("checked", false);
            textSegShieldError.prop("checked", false);
            textNodeShieldMissing.prop("checked", false);

            textSegShieldMissing.text(`${Strings[LANG].SegShieldMissing} ${Strings[LANG].disabledFeat}`);
            textSegShieldError.text(`${Strings[LANG].SegShieldError} ${Strings[LANG].disabledFeat}`);
            textNodeShieldMissing.text(`${Strings[LANG].NodeShieldMissing} ${Strings[LANG].disabledFeat}`);

            segShieldMissing.prop("disabled", true);
            segShieldError.prop("disabled", true);
            nodeShieldMissing.prop("disabled", true);

            rsaSettings.SegShieldMissing = false;
            rsaSettings.SegShieldError = false;
            rsaSettings.NodeShieldMissing = false;
            saveSettings();
        } else {
            textSegShieldMissing.prop("checked", rsaSettings.SegShieldMissing);
            textSegShieldError.prop("checked", rsaSettings.SegShieldError);
            textNodeShieldMissing.prop("checked", rsaSettings.NodeShieldMissing);

            textSegShieldMissing.text(Strings[LANG].SegShieldMissing);
            textSegShieldError.text(Strings[LANG].SegShieldError);
            textNodeShieldMissing.text(Strings[LANG].NodeShieldMissing);

            segShieldMissing.prop("disabled", false);
            segShieldError.prop("disabled", false);
            nodeShieldMissing.prop("disabled", false);
        }

        const topCountry = sdk.DataModel.Countries.getTopCountry();
        if (topCountry === null || topCountry.id !== 235) {
            $("#rsa-container-titleCase").css("display", "none");
            $("#rsa-container-TitleCaseClr").css("display", "none");
            $("#rsa-container-TitleCaseSftClr").css("display", "none");
        } else {
            $("#rsa-container-titleCase").css("display", "block");
            $("#rsa-container-TitleCaseClr").css("display", "block");
            $("#rsa-container-TitleCaseSftClr").css("display", "block");
        }
    }

    function autoFixButton() {
        $("#rsa-autoWrapper").css("display", "inline-block");
        $("#rsa-autoWrapper > div").off();

        // console.log(BadNames);
        // Create function to fix case types when button clicked
        $("#rsa-autoWrapper > div").on("click", () => {
            // const turnGraph = W.model.getTurnGraph();
            const turnGraph: Turn[] = sdk.DataModel.Turns.getAll();

            for (let i = 0; i < BadNames.length; i++) {
                // Check if street or turn
                if (BadNames[i]) {
                    const strt = BadNames[i];
                    let dir = strt.direction;
                    if (dir !== null) {
                        if (dir.match(/\b(north)\b/i) != null) dir = "Nᴏʀᴛʜ";
                        if (dir.match(/\b(south)\b/i) != null) dir = "Sᴏᴜᴛʜ";
                        if (dir.match(/\b(east)\b/i) != null) dir = "Eᴀꜱᴛ";
                        if (dir.match(/\b(west)\b/i) != null) dir = "Wᴇꜱᴛ";

                        W.model.actionManager.add(new UpdateObj(strt, { direction: dir }));
                    }
                } else {
                    function fixName(name: string) {
                        let temp = name;
                        temp = temp.replace(/\b(north)\b/gi, "Nᴏʀᴛʜ");
                        temp = temp.replace(/\b(south)\b/gi, "Sᴏᴜᴛʜ");
                        temp = temp.replace(/\b(east)\b/gi, "Eᴀꜱᴛ");
                        temp = temp.replace(/\b(west)\b/gi, "Wᴇꜱᴛ");

                        temp = temp.replace(/\b(TO)\b/gi, "ᴛᴏ");
                        temp = temp.replace(/\b(VIA)\b/gi, "ᴠɪᴀ");
                        temp = temp.replace(/\b(JCT)\b/gi, "ᴊᴄᴛ");
                        return temp;
                    }

                    const turn = BadNames[i];
                    let turnDat = turn.getTurnData();
                    const turnGuid = turnDat.getTurnGuidance();
                    // let newGuid = turnGuid;
                    console.log(turn);
                    for (const s in turnGuid.roadShields) {
                        turnGuid.roadShields[s].direction = fixName(turnGuid.roadShields[s].direction);
                    }
                    if (rsaSettings.checkTWD && turnGuid.towards) turnGuid.towards = fixName(turnGuid.towards);
                    if (rsaSettings.checkTTS && turnGuid.tts) turnGuid.tts = fixName(turnGuid.tts);
                    if (rsaSettings.checkVI && turnGuid.visualInstruction)
                        turnGuid.visualInstruction = fixName(turnGuid.visualInstruction);

                    console.log(turnGuid);
                    turnDat = turnDat.withTurnGuidance(turnGuid);
                    W.model.actionManager.add(new SetTurn(turnGraph, turn.withTurnData(turnDat)));
                }
            }
        });
    }

    function removeAutoFixButton() {
        $("#rsa-autoWrapper > div").off();
        $("#rsa-autoWrapper").css("display", "none");
    }

    function addShieldClick() {
        // const selFea = W.selectionManager.getSelectedFeatures();
        const selFea = sdk.Editing.getSelection();
        if (selFea && selFea.objectType === "segment") {
            $(".add-new-road-shield").trigger("click");
        } else {
            WazeWrap.Alerts.error(
                GM_info.script.name,
                "You must have only 1 segment selected to use the shield editing menu"
            );
        }
    }

    async function tryScan() {
        if (!rsaSettings.enableScript) return;

        // Reset the array of objects that need names fixed
        BadNames = [];

        removeHighlights();
        if (sdk.Map.getZoomLevel() <= MIN_ZOOM_LEVEL) return;
        // let selFea = W.selectionManager.getSelectedFeatures();
        // Scan all segments on screen
        if (
            rsaSettings.ShowSegShields ||
            rsaSettings.SegShieldMissing ||
            rsaSettings.SegShieldError ||
            rsaSettings.HighSegShields ||
            rsaSettings.titleCase
        ) {
            // _.each(W.model.segments.getObjectArray(), s => {
            //     scanSeg(s);
            // }
            for (const s of sdk.DataModel.Segments.getAll()) {
                await processSeg(s);
            }
        }
        // Scan all nodes on screen
        if (rsaSettings.HighNodeShields || rsaSettings.ShowNodeShields || rsaSettings.titleCase) {
            const nodeSet: Set<Node> = new Set<Node>(sdk.DataModel.Nodes.getAll());
            for (const n of nodeSet) {
                processNode(n);
            }
        }
    }

    const majorRoads = new Set<number>([3, 4, 6, 7]);
    async function processSeg(seg: Segment) {
        if (
            (!rsaSettings.ShowRamps && seg.roadType === 4) ||
            (rsaSettings.mHPlus && !majorRoads.has(seg.roadType))
        )
            return;

        // let segAtt = seg.attributes;
        // let streetID = segAtt.primaryStreetID;
        // const streetID: number | null = seg.primaryStreetId;
        // if (streetID === null) return;
        // // let oldStreet = W.model.streets.getObjectById(streetID).attributes;
        // let street: Street | null = sdk.DataModel.Streets.getById({ streetId: streetID });
        // if (street === null || street.cityId === null) return;
        // const city: City | null = sdk.DataModel.Cities.getById({ cityId: street.cityId });
        // if (city === null) return;
        // const stateID = city.stateId;
        let address = sdk.DataModel.Segments.getAddress({segmentId: seg.id});

        if (rsaSettings.AlternativeShields) {
            for (const altAddress of address.altStreets) {
                // let oldAltStreet = W.model.streets.getObjectById(segAtt.streetIDs[i]).attributes;
                if (alternativeType === "AlternativePrimaryCity") {
                    if (altAddress.city !== null) {
                        address = altAddress
                        break;
                    }
                } 
                if (alternativeType === "AlternativeNoCity") {
                    if(altAddress.city?.name === "") {
                        address = altAddress
                        break;
                    }
                }
            }
        }
        // let oldStateName = W.model.states.getObjectById(cityID.stateID).attributes.name;
        const stateName: string = address.state === null ? "" : address.state.name;
        const countryID = address.country?.id;
        const candidate: Candidate = await isSegmentCandidate(address, stateName, countryID);

        // Display shield on map
        function checkDeclutterSettings(seg: Segment): boolean {
            let result = false;

            const zoomLevel = sdk.Map.getZoomLevel();
            if (zoomLevel > MIN_ZOOM_LEVEL) {
                if (seg.length > minShieldDisplayLengths[zoomLevel]) {
                    result = true;
                }
            }

            return result;
        }
        if (address.street !== null && address.street.signType !== null) {
            if (rsaSettings.ShowSegShields && checkDeclutterSettings(seg)) {
                displaySegShields(seg, address.street.signType, address.street.signText, address.street.direction);
            }
            // If candidate and has shield
            if (rsaSettings.HighSegShields && candidate.isCandidate) {
                if (isValidShield(seg, candidate.iconID)) {
                    createHighlight(seg, rsaSettings.HighSegClr);
                } else {
                    createHighlight(seg, rsaSettings.ErrSegClr);
                }
            }
            

            // If not candidate and has shield
            if (rsaSettings.SegShieldError && !candidate.isCandidate) createHighlight(seg, rsaSettings.ErrSegClr);
            if (rsaSettings.SegHasDir && address.street?.direction) createHighlight(seg, rsaSettings.SegHasDirClr);

            // Highlight seg shields with direction
            if (rsaSettings.SegInvDir && !address.street?.direction) createHighlight(seg, rsaSettings.SegInvDirClr);
        }
        // If candidate and missing shield
        if (rsaSettings.SegShieldMissing && candidate.isCandidate && address.street !== null && address.street.signType === null)
            createHighlight(seg, rsaSettings.MissSegClr);

        // Streets without capitalized letters
        if (rsaSettings.titleCase) {
            const badName = matchTitleCase(address.street);
            if (badName) {
                createHighlight(seg, rsaSettings.TitleCaseClr, true);
                // autoFixButton();
            }
        }
    }

    function processNode(node: Node | null) {
        if (node === null) return;
        const guidance: GuidanceInterface = {
            tts: false,
            visual: false,
            exit: false,
            shield: false,
            towards: false,
        };
        const turns = sdk.DataModel.Turns.getTurnsThroughNode({ nodeId: node.id });
        for (const turn of turns) {
            if(!turn.isAllowed) continue;
            // let oldTurn = W.model.getTurnGraph().getTurnThroughNode(node,turn.fromSegmentId,turn.toSegmentId);
            guidance.tts = guidance.tts || turn.hasCustomTTS;
            guidance.shield = guidance.shield || turn.hasShieldsPopulated;
            guidance.towards = guidance.towards || turn.hasTowardsGuidance;
            guidance.visual = guidance.visual || turn.hasVisualInstruction;

            if (rsaSettings.titleCase) {
                const badName = matchTitleCaseThroughNode(turn);
                if (badName.isBad) {
                    const color = badName.softIssue ? rsaSettings.TitleCaseSftClr : rsaSettings.TitleCaseClr;
                    createHighlight(node, color, true);
                    // autoFixButton();
                }
            }
        }

        if (
            rsaSettings.ShowNodeShields &&
            sdk.Map.getZoomLevel() > ZoomLevel.ZM2 &&
            (guidance.exit || guidance.tts || guidance.shield || guidance.visual || guidance.towards)
        )
            displayNodeIcons(node, guidance);
    }

    // Function written by kpouer to accommodate French conventions of shields being based on alt names
    async function isSegmentCandidate(address: SegmentAddress, stateName: string, countryId: number | null | undefined): Promise<Candidate> {
        let candidate = await isStreetCandidate(address.street, stateName, countryId);
        if (!candidate.isCandidate && address.country !== null && address.country?.id !== undefined && CheckAltName.has(address.country.id)) {
            for (const altAddress of address.altStreets) {
                candidate = await isStreetCandidate(altAddress.street, stateName, countryId);
                if (candidate.isCandidate) {
                    return candidate;
                }
            }
        }
        return candidate;
    }

    async function isStreetCandidate(street: Street | null, stateName: string, countryId: number | null | undefined): Promise<Candidate> {
        const info: Candidate = { isCandidate: false, iconID: null };

        if (street === null || countryId === null || countryId === undefined) {
            return info;
        }

        if(!RoadAbbr[countryId]) {
            if(!mainSheetLoaded) {
                return info;
            }
            if(mainSheetLoaded && !CountryDataSheetInfo[countryId]) {
                RoadAbbr[countryId] = false;
                return info;
            }
            await loadCountryAbbr(countryId, CountryDataSheetInfo[countryId], stateName);
        }
        // if (stateName === null) stateName = "";

        //Check to see if the country has states configured in RSA by looking for a key with nothing in it
        if (street.name && typeof RoadAbbr[countryId] === "object") {
            const noStates: boolean = ("" in RoadAbbr[countryId]);
            const abbrvs = noStates
                ? RoadAbbr[countryId][""]
                : { ...RoadAbbr[countryId][stateName], ...RoadAbbr[countryId]["*"] };

            const abbreviationKeys = Object.keys(abbrvs);
            for (let i = 0; i < abbreviationKeys.length; i++) {
                const abrKey = abbreviationKeys[i];
                const abbr = new RegExp(abrKey, "g");
                const isMatch = street.name.match(abbr);

                if (isMatch && street.name.includes(isMatch[0])) {
                    info.isCandidate = true;
                    info.iconID = abbrvs[abrKey];
                    break;
                }
            }
        }
        return info;
    }

    function iconTextValidation(
        signType: number | null,
        signText: string | null,
        iconId: number | null | Set<number>
    ): boolean {
        let result = true;
        if (
            signType === null ||
            typeof signType === "undefined" ||
            typeof signText === "undefined" ||
            (iconId instanceof Set && !iconId.has(signType)) ||
            (!(iconId instanceof Set) && signType !== iconId)
        ) {
            result = false;
        }
        if (
            signType !== null &&
            !iconsAllowingNoText.has(signType) &&
            (signText === null || typeof signText === "undefined" || signText === "")
        ) {
            result = false;
        }
        return result;
    }

    function isValidShield(seg: Segment | null, iconID: number | null | Set<number>): boolean {
        // let primaryStreet = W.model.streets.getObjectById(segAtt.primaryStreetID);
        if (seg === null || seg.primaryStreetId === null) return false;
        const primaryStreet: Street | null = sdk.DataModel.Streets.getById({ streetId: seg.primaryStreetId });
        if (
            primaryStreet === null ||
            primaryStreet.signText === null ||
            !iconTextValidation(primaryStreet.signType, primaryStreet.signText, iconID)
        )
            return false;
        if (primaryStreet.name?.includes(primaryStreet.signText)) {
            return true;
        }
        for (let i = 0; i < seg.alternateStreetIds.length; i++) {
            const street: Street | null = sdk.DataModel.Streets.getById({ streetId: seg.alternateStreetIds[i] });
            if (street?.name?.includes(primaryStreet.signText)) {
                return true;
            }
        }
        return false;
    }

    function matchTitleCase(street: Street | null) {
        if(!street) return;
        const dir = street.direction;
        let isBad = false;
        if (dir !== "" && dir !== null) {
            // console.log(dir);
            if (dir.match(/\\b(north|south|east|west)\\b/i) !== null) isBad = true;
            if (dir.match(/([ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘʀꜱᴛᴜᴠᴡʏᴢ][a-z]|[a-z][ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘʀꜱᴛᴜᴠᴡʏᴢ])/) !== null) isBad = true;

            if (isBad) {
                if (BadNames.length === 0) {
                    BadNames.push(street);
                } else {
                    let isDuplicate = false;
                    for (let i = 0; i < BadNames.length; i++) {
                        // if (BadNames[i].type) console.log(BadNames[i].id === street.id);
                        if (typeof BadNames[i] && BadNames[i].id === street.id) isDuplicate = true;
                    }
                    if (!isDuplicate) BadNames.push(street);
                }
            }
        }
        return isBad;
    }

    function matchTitleCaseThroughNode(turn: Turn) {
        const info = { isBad: false, softIssue: false };

        return info;

        const turnGuid = turnData.getTurnGuidance();
        const shields = turnGuid.getRoadShields();
        const twd = turnGuid.getTowards();
        const tts = turnGuid.getTTS();
        const VI = turnGuid.getVisualInstruction();

        function checkText(txt: string | null, isSoft = false) {
            if (txt !== "" && txt !== null) {
                if (txt.match(/\b(north|south|east|west)\b/i) != null) {
                    info.isBad = true;
                    if (isSoft) info.softIssue = true;
                }
                if (txt.match(/\b(TO|VIA|JCT)\b/i) != null) {
                    info.isBad = true;
                    if (isSoft) info.softIssue = true;
                }
                if (txt.match(/([ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘʀꜱᴛᴜᴠᴡʏᴢ][a-z]|[a-z][ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘʀꜱᴛᴜᴠᴡʏᴢ])/) != null) {
                    info.isBad = true;
                    if (isSoft) info.softIssue = true;
                }
            }
        }

        function checkTTStext(txt: string, isSoft = false) {
            if (txt !== "" && txt !== null) {
                if (txt.match(/(Nᴏʀᴛʜ|Sᴏᴜᴛʜ|Eᴀꜱᴛ|Wᴇꜱᴛ)/) != null) {
                    info.isBad = true;
                    if (isSoft) info.softIssue = true;
                }
                if (txt.match(/(ᴛᴏ|ᴠɪᴀ|ᴊᴄᴛ)/) != null) {
                    info.isBad = true;
                    if (isSoft) info.softIssue = true;
                }
                if (txt.match(/([ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘʀꜱᴛᴜᴠᴡʏᴢ][a-z]|[a-z][ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘʀꜱᴛᴜᴠᴡʏᴢ])/) != null) {
                    info.isBad = true;
                    if (isSoft) info.softIssue = true;
                }
            }
        }

        if (shields) {
            _.each(shields, (s) => {
                checkText(s.direction);
            });
        }
        if (twd && twd !== "" && rsaSettings.checkTWD) checkText(twd, true);
        if (tts && tts !== "" && rsaSettings.checkTTS) checkTTStext(tts, true);
        if (VI && VI !== "" && rsaSettings.checkVI) checkText(VI, true);

        if (info.isBad) BadNames.push(turn);

        return info;
    }

    function displayNodeIcons(node: Node, guidance: GuidanceInterface) {
        const GUIDANCE = {
            shields: {
                setting: "ShowNodeShields",
                exists: guidance.shield,
                color: "",
                width: 30,
                height: 30,
                sign: "6",
                txt: "TG",
            },
            exitsign: {
                setting: "ShowExitShields",
                exists: guidance.exit,
                color: "",
                width: 30,
                height: 20,
                sign: "2159",
                txt: "EX",
            },
            tts: {
                setting: "ShowTurnTTS",
                exists: guidance.tts,
                color: "",
                width: 30,
                height: 30,
                sign: "7",
                txt: "TIO",
            },
            towards: {
                setting: "ShowTowards",
                exists: guidance.towards,
                color: "",
                width: 30,
                height: 30,
                sign: "7",
                txt: "TW",
            },
            visualIn: {
                setting: "ShowVisualInst",
                exists: guidance.visual,
                color: "",
                width: 30,
                height: 30,
                sign: "7",
                txt: "VI",
            },
        };
        let count = 0;

        const pixelPos = sdk.Map.getPixelFromLonLat({ lonLat: {lon: node.geometry.coordinates[0], lat: node.geometry.coordinates[1]} });
        // const pixelPos = proj4("EPSG:4326", "EPSG:3857", node.geometry.coordinates);
        const startPoint = { x: pixelPos.x, y: pixelPos.y };
        const lblStart = { x: startPoint.x - labelDistance().label, y: startPoint.y - labelDistance().label };

        // Array of points for line connecting node to icons
        const points: GeoJSON.Feature[] = [];
        const pointCoordinates: GeoJSON.Position[] = [];
        // Point coords
        // let pointNode = new OpenLayers.Geometry.Point(startPoint.x, startPoint.y);
        const pointNode = turf.point(
            node.geometry.coordinates,
            {
                styleName: "styleNode",
                style: {
                    strokeColor: rsaSettings.HighNodeClr,
                    strokeOpacity: 0.75,
                    strokeWidth: 4,
                    fillColor: rsaSettings.HighNodeClr,
                    fillOpacity: 0.75,
                    pointRadius: 3,
                },
            },
            { id: `node_${startPoint.x} ${startPoint.y}` }
        );
        points.push(pointNode);
        pointCoordinates.push(node.geometry.coordinates);
        // Label coords
        // var pointLabel = new OpenLayers.Geometry.Point(lblStart.x, lblStart.y);

        // const nodeLabelCoordinates = proj4("EPSG:3857", "EPSG:4326", [lblStart.x, lblStart.y]);
        const nodeLabelCoordinates = sdk.Map.getLonLatFromPixel( { x: lblStart.x, y: lblStart.y } );
        const nodeLabel = turf.point(
            [nodeLabelCoordinates.lon, nodeLabelCoordinates.lat],
            {
                styleName: "styleNode",
                style: {
                    strokeColor: rsaSettings.HighNodeClr,
                    strokeOpacity: 0.75,
                    strokeWidth: 4,
                    fillColor: rsaSettings.HighNodeClr,
                    fillOpacity: 0.75,
                    pointRadius: 3,
                },
            },
            { id: `pointNode_${startPoint.x} ${startPoint.y}` }
        );
        points.push(nodeLabel);
        pointCoordinates.push([nodeLabelCoordinates.lon, nodeLabelCoordinates.lat]);

        sdk.Map.addFeaturesToLayer({ features: points, layerName: rsaMapLayer.layerName });
        const newLine = turf.lineString(
            pointCoordinates,
            {
                styleName: "styleNode",
                style: {
                    strokeColor: rsaSettings.HighNodeClr,
                    strokeOpacity: 0.75,
                    strokeWidth: 4,
                    fillColor: rsaSettings.HighNodeClr,
                    fillOpacity: 0.75,
                    pointRadius: 3,
                },
            },
            { id: `line_${points[0].toString()}` }
        );
        sdk.Map.addFeatureToLayer({ feature: newLine, layerName: rsaIconLayer.layerName });

        _.each(GUIDANCE, (q) => {
            if (q.exists && rsaSettings[q.setting]) {
                // console.log(q);
                let xpoint: number = lblStart.x;
                let ypoint: number = lblStart.y;

                const lblDis: LabelDistance = labelDistance();
                switch (count) {
                    case 1:
                        xpoint = lblStart.x + lblDis.icon;
                        ypoint = lblStart.y;
                        break;
                    case 2:
                        xpoint = lblStart.x;
                        ypoint = lblStart.y - lblDis.icon;
                        break;
                    case 3:
                        xpoint = lblStart.x + lblDis.icon;
                        ypoint = lblStart.y - lblDis.icon;
                        break;
                    case 4:
                        xpoint = lblStart.x + lblDis.icon * 2;
                        ypoint = lblStart.y;
                        break;
                    default:
                        break;
                }

                // Label coords
                // let pointLabel = new OpenLayers.Geometry.Point(xpoint, ypoint);
                // labelFeat = new OpenLayers.Feature.Vector(pointLabel, null, styleLabel);
                const lonLat = sdk.Map.getLonLatFromPixel({ x: xpoint, y: ypoint });
                const pointLabelFeature = turf.point(
                    [lonLat.lon, lonLat.lat],
                    {
                        styleName: "styleLabel",
                        style: { sign: q.sign, txt: q.txt, height: q.height, width: q.width, fillOpacity: 1 },
                    },
                    { id: `pointLabel_${xpoint.toString()}_${ypoint.toString()}` }
                );
                sdk.Map.addFeatureToLayer({ feature: pointLabelFeature, layerName: rsaIconLayer.layerName });

                count++;
            }
        });
    }

    function displaySegShields(
        segment: Segment,
        shieldID: number,
        shieldText: string | null,
        shieldDir: string | null
    ) {
        const iconURL = `https://renderer-am.waze.com/renderer/v1/signs/${shieldID}?text=${shieldText}`;
        // let SegmentPoints = [];
        const oldparam: Coordinates = { x: null, y: null };
        const labelDis = labelDistance();
        let width = 37;
        let height = 37;

        if (shieldText !== null) {
            if (shieldText.length > 4 && shieldText.length < 7) {
                width = 50;
                height = 40;
            } else if (shieldText.length > 6 && shieldText.length < 9) {
                width = 80;
                height = 45;
            } else if (shieldText.length > 8 && shieldText.length < 13) {
                width = 100;
                height = 50;
            }
        }
        // oldparam.x = null;
        // oldparam.y = null;
        let AtLeastOne = false;
        $.each(segment.geometry.coordinates, (idx: number, param: Position) => {
            // const pointParam = proj4("EPSG:4326", "EPSG:3857", param);
            const pointParam = sdk.Map.getPixelFromLonLat({ lonLat: { lon: param[0], lat: param[1] } });
            // Build a new segment with same geometry

            // SegmentPoints.push(new OpenLayers.Geometry.Point(param[0], param[1]));
            // let newPoint = {
            //     type: "Feature",
            //     geometry: {
            //         type: "Point",
            //         coordinates: [param[0], param[1]],
            //     },
            //     id: "point_" + param[0].toString() + " " + param[1].toString(),
            // };
            // SegmentPoints.push(newPoint);

            // let shieldWithLabelStyle = {
            //     externalGraphic: iconURL,
            //     graphicWidth: width,
            //     graphicHeight: height,
            //     graphicYOffset: -20,
            //     // graphicZIndex: 6000,
            //     style: "opacity: 1",
            //     fillOpacity: 1,
            //     fill: "black",
            //     stroke: "black",
            //     label: shieldDir !== null ? shieldDir : "",
            //     fontColor: "green",
            //     labelOutlineColor: "white",
            //     labelOutlineWidth: 1,
            //     fontSize: 12,
            //     display: "grid",
            //     labelYOffset: 0,
            // };

            if (oldparam.x && oldparam.y && oldparam.x !== null && oldparam.y !== null) {
                if (
                    Math.abs(oldparam.x - pointParam.x) > labelDis.space ||
                    Math.abs(oldparam.y - pointParam.y) > labelDis.space ||
                    !AtLeastOne
                ) {
                    const centerparam: Coordinates = { x: undefined, y: undefined };
                    centerparam.x = (oldparam.x + pointParam.x) / 2;
                    centerparam.y = (oldparam.y + pointParam.y) / 2;
                    if (
                        (centerparam.x && Math.abs(centerparam.x - pointParam.x) > labelDis.space) ||
                        (centerparam.y && Math.abs(centerparam.y - pointParam.y) > labelDis.space) ||
                        !AtLeastOne
                    ) {
                        // let LabelPoint = new OpenLayers.Geometry.Point(centerparam.x, centerparam.y);
                        // const pointFeature = new OpenLayers.Feature.Vector(LabelPoint, null, style);
                        // const coordCenterPoint = proj4("EPSG:3857", "EPSG:4326", [centerparam.x, centerparam.y]);
                        const coordCenterPoint = sdk.Map.getLonLatFromPixel({ x: centerparam.x, y: centerparam.y });
                        const shieldFeature = turf.point(
                            [coordCenterPoint.lon, coordCenterPoint.lat],
                            {
                                styleName: "shield",
                                style: {
                                    externalGraphic: iconURL,
                                    graphicWidth: width,
                                    graphicHeight: height,
                                    label: shieldDir !== null ? shieldDir : "",
                                    labelYOffset: shieldDir !== null ? -20 : 0,
                                },
                            },
                            { id: `shield_${centerparam.x.toString()}_${centerparam.y.toString()}` }
                        );
                        // Shield icon style
                        // shieldWithLabelStyle.labelYOffset = -1 * labelDis.label;
                        sdk.Map.addFeatureToLayer({ feature: shieldFeature, layerName: rsaIconLayer.layerName });
                        AtLeastOne = true;
                    }
                }
            }
            oldparam.x = pointParam.x;
            oldparam.y = pointParam.y;
        });
    }

    function createHighlight(obj: Segment | Node, color: string, overSized = false) {
        // const geo = obj.getOLGeometry().clone();
        const geo: Point | LineString = structuredClone(obj.geometry);
        const isNode = obj instanceof Node;

        if (isNode) {
            // Point coords
            // let pointNode = new OpenLayers.Geometry.Point(geo.x, geo.y);
            const pointFeature: Feature = turf.point(
                (geo as Point).coordinates,
                {
                    styleName: "styleNode",
                    style: {
                        strokeColor: color,
                        strokeOpacity: overSized ? 1 : 0.75,
                        strokeWidth: 4,
                        fillColor: color,
                        fillOpacity: 0.75,
                        pointRadius: overSized ? 7 : 3,
                    },
                },
                { id: `point_${geo.coordinates[0]}_${geo.coordinates[1]}` }
            );
            sdk.Map.addFeatureToLayer({ feature: pointFeature, layerName: rsaIconLayer.layerName });
        } else {
            // console.log('seg highlight')
            // Object.assign(styleRules.segHighlight.style, {
            //     strokeColor: color,
            //     strokeOpacity: overSized ? 1 : 0.75,
            //     strokeWidth: overSized ? 7 : 4,
            //     fillColor: color,
            //     fillOpacity: 0.75,
            // });
            // const newFeat =  new OpenLayers.Geometry.LineString(geo.components, {});
            // const newVector = new OpenLayers.Feature.Vector(newFeat, null, style);
            // rsaMapLayer.addFeatures([newVector]);
            const newLineFeature: Feature = turf.lineString(
                (geo as LineString).coordinates,
                {
                    styleName: "segHighlight",
                    style: {
                        strokeColor: color,
                        strokeOpacity: overSized ? 1 : 0.75,
                        strokeWidth: overSized ? 7 : 4,
                        fillColor: color,
                        fillOpacity: 0.75,
                    },
                },
                { id: `line_${geo}` }
            );
            sdk.Map.addFeatureToLayer({ feature: newLineFeature, layerName: rsaMapLayer.layerName });
        }
    }

    function removeHighlights() {
        sdk.Map.removeAllFeaturesFromLayer(rsaMapLayer);
        sdk.Map.removeAllFeaturesFromLayer(rsaIconLayer);
    }

    function labelDistance(): LabelDistance {
        // Return object with two variables - label is the distance used to place the direction below the icon,
        // space is the space between geo points needed to render another icon
        const label_distance: LabelDistance = { icon: 27, label: 40, space: 30 };
        return label_distance;
    }

    initRSA();
}
