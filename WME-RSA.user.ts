// ==UserScript==
// @name         WME Road Shield Assistant
// @namespace    https://greasyfork.org/en/users/286957-skidooguy
// @version      2025.06.19.001
// @description  Adds shield information display to WME
// @author       SkiDooGuy, jm6087, Karlsosha
// @match        https://www.waze.com/editor*
// @match        https://www.waze.com/*/editor*
// @match        https://beta.waze.com/editor*
// @match        https://beta.waze.com/*/editor*
// @exclude      https://www.waze.com/user/editor*
// @require      https://greasyfork.org/scripts/24851-wazewrap/code/WazeWrap.js
// @require      https://cdn.jsdelivr.net/npm/@turf/turf@7.2.0/turf.min.js
// @require      https://cdn.jsdelivr.net/npm/proj4@2.16.2/dist/proj4.min.js
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @connect      greasyfork.org
// @contributionURL https://github.com/WazeDev/Thank-The-Authors
// ==/UserScript==

/* global W */
/* global WazeWrap */

// import type { Node, Segment, SegmentAddress, Street, Turn, WmeSDK } from "wme-sdk-typings";
// import type { Point, LineString, Position, Feature } from "geojson";
// import * as turf from "@turf/turf";
// import _ from "underscore";
// import proj4 from "proj4";
// import WazeWrap from "https://greasyfork.org/scripts/24851-wazewrap/code/WazeWrap.js";

let sdk: WmeSDK;
unsafeWindow.SDK_INITIALIZED.then(() => {
    if (!unsafeWindow.getWmeSdk) {
        throw new Error("SDK is not installed");
    }
    sdk = unsafeWindow.getWmeSdk({ scriptId: "wme-road-shield-assistant", scriptName: "WME Road Shield Assistant" });

    console.log(`SDK v ${sdk.getSDKVersion()} on ${sdk.getWMEVersion()} initialized`);
    sdk.Events.once({ eventName: "wme-ready" }).then(rsaInit);
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
    - Converted to WME SDK<br>
    - <b>Make Sure to Enable RSA Layers to See the Shields</b><br>
    - Added Rules for Shield Checking Logic for Mexico<br>
    - Updated Shield Highlight Rules for All States in US<br>
    - Updated Some Highlight Rules for Canada<br><br>
<b>BUGFIXES:</b><br>
    - Fix error with undefined point Radius for Circle Tag<br><br>
<b>KNOWN ISSUES:</b><br>
    - Missing Exit Sign Shields on Node<br>
    - Some of the highlighting may be incorrect showing issues when there are none<br><br>`;

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
    type CountryRoadInfo = Record<number, StateRoadInfo>;

    const RoadAbbr: CountryRoadInfo = {
        //Canada
        40: {
            Alberta: {
                "^Hwy 1$": 5000, // 5000: National-Trans-Canada Highway
                "^Hwy 1A\\b": 5011, // 5011: Alberta - Provincial Hwy
                "^Hwy 2\\b": 5011, // 5011: Alberta - Provincial Hwy
                "^Hwy 3$": 5015, // 5015: Alberta - Crowsnext Hwy
                "^Hwy 3A\\b": 5011, // 5011: Alberta - Provincial Hwy
                "^Hwy 16$": 5000, // 5000: National-Trans-Canada Highway
                "^Hwy 16A\\b": 5011, // 5011: Alberta - Provincial Hwy
                "^Hwy ([4-9]|1[0-57-9]|[2-9]\\d{1}|2\\d{2})\\b": 5011,
                "^Hwy ([3-9]\\d{2})\\b": 5012,
            },
            "British Columbia": {
                "^Hwy 1\\b": 5000, // 5000: National-Trans-Canada Highway
                "^Hwy 2\\b": 5001, // 5001: BC - Provincial Hwy
                "^Hwy 3\\b": 5002, // 5002: BC - Crowsnest Hwy
                "^Hwy 16\\b": 5000, // 5000: National-Trans-Canada Highway
                "^Hwy 113\\b": 5004, // 5004: BC - Nisga'a Hwy
                "^Hwy\\s+([4-9]|[1-9][0-57-9]|10\\d|11[0-24-9]|1[2-9]\\d|[2-9]\\d{1,2})[a-zA-Z]*\\b": 5001, // 5001: BC - Provincial Hwy
            },
            Saskatchewan: {
                "^Hwy 1\\b": 5000, // 5000: National - Trans-Canada Hwy
                "^Hwy 16\\b": 5000, // 5000: National - Trans-Canada Hwy
                "^Hwy ([2-9]|1[0-57-9]|[2-9]\\d|[1-3]\\d{2})\\b": 5030, // 5030: Saskatchewan - Provincial Hwy
                "^Hwy (9\\d{2})\\b": 5031, // 5031: Saskatchewan - Northern Secondary Hwy
                "^Hwy ([6-7]\\d{2})\\b": 5032, // 5032: Saskatchewan - Municipal Road
            },
            Manitoba: {
                "^Hwy 1\\b": 5000, // 5000: National - Trans-Canada Hwy
                "^Hwy 16\\b": 5000, // 5000: National - Trans-Canada Hwy
                "^Hwy ([2-9]|1[0-57-9]|[2-9]\\d|1\\d{2})\\b": 5038, // 5038: Manitoba - Provincial Trunk Highway
                "^Hwy ([2-9]\\d{2})\\b": 5039, // 5039: Manitoba - Provincial Rd
            },
            Ontario: {
                "^QEW\\b": 5058, // 5058: Ontario QEW
                "(^Hwy 17\\b|Hwy 17$)": new Set<number>([5000, 5057]), // 5000: National - Trans-Canada Hwy
                "^Hwy 407\\b": new Set<number>([5207, 5206]), // 5060: Ontario ETR
                "^Hwy 412\\b": 5059, // 5059: Ontario Toll Hwy
                "^Hwy 418\\b": new Set<number>([5059, 5057]), // 5059: Ontario Toll Hwy
                // "Hwy [1-9]\\d{0,2}\\b": 5057, // 5057: Ontario King's Hwy 1-16
                // "Hwy (1[89]|[2-9]d|[1-3]d{2}|40[0-6])\\b": 5057, // 5057: Ontario King's Hwy 18-406
                // "Hwy (40[89]|41[01])\\b": 5057, // 5057: Ontario King's Hwy 408-411
                // "Hwy (41[3-7])\\b": 5057, // 5057: Ontario King's Hwy 413-417
                "^CR-[1-9]\\d{0,2}\\b": 5063,
                "^Hwy\\s+([1-9]|[1-68-9]\\d|[1-3]\\d{2}|40[0-68-9]|41[0-13-79]|4[2-9]\\d|[7-9]\\d{2})[A-Z]*\\b": 5057,
                "^Hwy\\s+[5-6]\\d{2}\\b": 5061, // 5061: Ontario Secondary Hwy 500-699
                // "Hwy (80d|8[1-9]d)\\b": 5057, // 5057: Ontario Tertiary Hwy
                "^(Muskoka|Wellington|Winchester|Regional) (Road|Rd) [1-9]\\d{0,2}\\b": new Set<number>([
                    5065, 5063, 5077,
                ]), // Ontario Regional
            },
            Quebec: {
                "Rte Transcanadienne": 5093, // 5093: Quebec: Route Transcanadienne
                "^Aut [1-9]\\d{1,2}\\b": 5090, // 5090: Quebec Autoroute 1-999
                "^Rte [1-9]\\d{0,2}\\b": 5091, // 5091: Quebec Route 100-399
                "R (10d|1[1-9]d|[2-9]d{2}|1[0-4]d{2}|15[0-5]d)\b": 5092, // 5092: Quebec Route 100-1559
            },
            "New Brunswick": {
                "^Rte 2\\b": 5000, // 5000: Trans-Canada Hwy
                "^Rte 16\\b": 5000, // 5000: Trans-Canada Hwy
                "^Rte 1\\b": 5112, // 5112: NB Arterial Highway 1
                "^Rte ([3-9]|1[0-57-9]|[2-9]\\d)\\b": 5112, // 5112: NB Arterial Highway 17-99
                "^Rte (10\\d|11[02-9]|1[2-9]\\d)\\b": 5113, // 5113: NB Collector Highway 100-199
                "^Rte (111|[2-9]\\d{2})\\b": 5114, // 5114: NB Local Highway 200-999
            },
            "Nova Scotia": {
                "^Hwy ([1-9]\\d{0,1})\\b": 5116, // 5116: NS Trunk Hwy 1-99
                "^Hwy 104\\b": new Set<number>([5115, 5000]), // In NS 104 has 2 different shields
                "^Hwy (10[5-6])\\b": 5000, // 5000: National Trans Canada Highway 105-106
                "^Hwy (10[0-37-9]|1[1-9]\\d)\\b": 5115, // 5115: NS Aterial Hwy 107-199
                "^Hwy ([2-3]\\d{2})\\b": 5117, // 5117: NS Collector Hwy 200-399
            },
            "Newfoundland and Labrador": {
                "^Hwy 1": 5000, // 5000: National - Trans-Canada Hwy 1
                "^Rte ([2-9]|[1-9]\\d|[1-5]\\d{2})\\b": 5129, // NLR: Newfoundland Labrador Route 2-599
            },
            "Prince Edward Island": {
                "^Rte 1$": 5000, // 5000: National Trans-Canada Hwy
                "^Rte ([2-9]|[1-9]\\d{1,2})\\b": 5144, // 5144: PEI - Provincial Highway
            },
            "Yukon Territory": {
                "^Hwy 1\\b": 5146, // 5145: Yukon - Territorial Hwy - Orange
                "Hwy 2": 5146, // 5146: Yukon - Territorial Hwy - Amber
                "Hwy 3": 5147, // 5147: Yukon - Territorial Hwy - Maroon
                "Hwy 4": 5148, // 5148: Yukon - Territorial Hwy - Brown
                "Hwy 5": 5149, // 5149: Yukon - Territorial Hwy - Blue
                "Hwy 6": 5150, // 5150: Yukon - Territorial Hwy - Teal
                "Hwy 7": 5147, // 5147: Yukon - Territorial Hwy - Maroon
                "Hwy 8": 5148, // 5148: Yukon - Territorial Hwy - Brown
                "Hwy 9": 5151, // 5151: Yukon - Territorial Hwy - Black
                "Hwy 10": 5151, // 5151: Yukon - Territorial Hwy - Black
                "Hwy 11": 5149, // 5149: Yukon - Territorial Hwy - Blue
                "Hwy 37": 5147, // 5147: Yukon - Territorial Hwy - Maroon
            },
            "Northwest Territories": {
                "Hwy ([1-9]|10)\b": 5152, // 5152: NWT - Territorial Hwy 1-10
            },
        },
        // France
        73: {
            "": {
                "D\\d+[^:]*": 1092,
                "N\\d+[^:]*": 1072,
                "A\\d+[^:]*": 1072,
                "M\\d+[^:]*": 1067,
                "C\\d+[^:]*": 3333,
                "T\\d+[^:]*": 3037,
            },
        },
        // Germany
        81: { "": { "(A\\d{1,3})": 1012, "(B\\d{1,3})": 1094 } },
        // Mexico
        145: {
            "*": { "^MEX-[1-9]\\d{0,2}[A-Z]*\\b": new Set<number>([1107, 1106]) },
            "Quintana Roo": { "Q.ROO-[1-9]\\d{0,2}\\b": 1000 },
            Yucatán: { "YUC-[1-9]\\d{0,2}\\b": 1000 },
            Campeche: { "CAM-[1-9]\\d{0,2}\\b": 1000 },
        },

        // Ukraine
        232: {
            "": {
                "(E\\d{2,3})": 1048,
                "(М-\\d{2})": 1071,
                "(Н-\\d{2})": 1071,
                "(Р-\\d{2})": 1008,
                "(Т-\\d{2}-\\d{2,3})": 1008,
                "(О\\d{6,7})": 1085,
                "(С\\d{6,7})": 1085,
            },
        },
        // US
        235: {
            "*": {
                "^I-[1-9]\\d{0,2}(?!\s+(?:W|E|East|West))\\b": 5,
                "^I-[1-9]\\d{0,2}\\s{1,}\\b(?:Bus|BUS|Business|BUSINESS)\\b": 2003,
                "^US-[1-9]\\d{0,2}[A-Z]*\\b": 6,
            },
            Alabama: { "^CR-[1-9]\\d{0,2}\\b": 2002, "^SR-[1-9]\\d{0,2}\\b": 2019 },
            Alaska: {
                "CR-[1-9]\\d{0,2}": 2002,
                "SR-[1-9]\\d{0,2}": 2017,
                "AK-[1-9]\\d{0,2}": 2017,
                "A-[1-9]\\d{0,2}": 2017,
            },
            Arizona: { "CR-[1-9]\\d{0,2}": 2002, "SR-[1-9]\\d{0,2}": 2022 },
            Arkansas: { "^CR-[1-9]\\d{0,2}\\b": 2002, "^AR-[1-9]\\d{0,2}\\b": 2020, "^AR-$1 SPUR\\b": 2020 },
            California: { "^CR-[1-9]\\d{0,2}\\b": 2002, "^SH-[1-9]\\d{0,2}\\b": 1082, "^SR-[1-9]\\d{0,2}\\b": 1082 },
            Colorado: {
                "^CR-[1-9]\\d{0,2}[a-zA-Z]*\\b": 2002,
                "^SH-[1-9]\\d{0,2}[a-zA-Z]*\\b": 2025,
                "^SR-[1-9]\\d{0,2}\\b": 2025,
            },
            Connecticut: {
                "^CR-[1-9]\\d{0,2}": 2002,
                "^SH-[1-9]\\d{0,2}": 2027,
                "^SR-[1-9]\\d{0,2}": 2027,
                "\\b(?:Wilbur Cross(?: Parkway| Pkwy))\\b": 2027,
            },
            Delaware: { "^CR-[1-9]\\d{0,2}\\b": 2002, "^SH-[1-9]\\d{0,2}\\b": 7, "^SR-[1-9]\\d{0,2}\\b": 7 },
            "District of Columbia": { "DC-[1-9]\\d{0,2}": 7 },
            Florida: {
                "^CR-[1-9]\\d{0,2}": 2002,
                "^SH-[1-9]\\d{0,2}": 2030,
                "^SR-[1-9]\\d{0,2}": 2030,
                "^Florida.* (Turnpike|Tpk|Tpke)\\b": 2033,
            },
            Georgia: { "^CR-[1-9]\\d{0,2}\\b": 2002, "^SH-[1-9]\\d{0,2}\\b": 2036, "^SR-[1-9]\\d{0,2}\\b": 2036 },
            Hawaii: {
                "H-[1-9]\\d{0,2}": 5,
                "CR-[1-9]\\d{0,2}": 2002,
                "SH-[1-9]\\d{0,2}": 2041,
                "SR-[1-9]\\d{0,2}": 2041,
            },
            Idaho: {
                "^CH-[1-9]\\d{0,2}\\b": 2002,
                "^CR-[1-9]\\d{0,2}\\b": 2002,
                "^SH-[1-9]\\d{0,2}\\b": 2043,
                "^SR-[1-9]\\d{0,2}\\b": 2043,
                "^ID-[1-9]\\d{0,2}\\b": 2043,
            },
            Illinois: {
                "^CH-[1-9]\\d{0,2}": 2002,
                "^CR-[1-9]\\d{0,3}": 2002,
                "^SH-[1-9]\\d{0,2}": 2044,
                "^SR-[1-9]\\d{0,2}": 2044,
            },
            Indiana: {
                "^CH-[1-9]\\d{0,2}": 2002,
                "^CR-[1-9]\\d{0,2}": 2002,
                "^SH-[1-9]\\d{0,2}": 2045,
                "^SR-[1-9]\\d{0,2}": 2045,
                "^IN-[1-9]\\d{0,2}": 2045,
            },
            Iowa: {
                "CH-[1-9]\\d{0,2}": 2002,
                "CR-[1-9]\\d{0,2}": 2002,
                "SH-[1-9]\\d{0,2}": 7,
                "SR-[1-9]\\d{0,2}": 7,
                "IA-[1-9]\\d{0,2}": 7,
            },
            Kansas: {
                "^CH-[1-9]\\d{0,2}\\b": 2002,
                "^CR-[1-9]\\d{0,2}\\b": 2002,
                "^SH-[1-9]\\d{0,2}\\b": 2046,
                "^SR-[1-9]\\d{0,2}\\b": 2046,
                "^K-[1-9]\\d{0,2}\\b": 2046,
            },
            Kentucky: {
                "^US-[1-9]\\d{0,2}\\s+(?:BUS|Bus|Business)\\b": 2005,
                "^CH-[1-9]\\d{0,2}\\b": 2002,
                "^CR-[1-9]\\d{0,2}\\b": 2002,
                "^SH-[1-9]\\d{0,2}\\b": 7,
                "^SR-[1-9]\\d{0,2}\\b": 7,
                "^KY-[1-9]\\d{0,3}\\b": 7,
                "^AA (Highway|Hwy)\\b": 2050,
            },
            Louisiana: {
                "^CH-[1-9]\\d{0,2}\\b": 2002,
                "^CR-[1-9]\\d{0,2}\\b": 2002,
                "^SH-[1-9]\\d{0,2}\\b": 1117,
                "^SR-[1-9]\\d{0,3}\\b": 1117,
                "^LA-[1-9]\\d{0,3}\\b": new Set<number>([1117, 1115]),
            },
            Maine: {
                "^CH-[1-9]\\d{0,2}\\b": 2002,
                "^CR-[1-9]\\d{0,2}\\b": 2002,
                "^SH-[1-9]\\d{0,2}\\b": 2051,
                "^SR-[1-9]\\d{0,2}(?!\\s*(?:BUS|Bus|Business))\\b": 2051,
                "^SR-[1-9]\\d{0,2}\\s+(?:BUS|Bus|Business)\\b": 2052,
            },
            Maryland: {
                "^CH-[1-9]\\d{0,2}": 2002,
                "^CR-[1-9]\\d{0,2}": 2002,
                "^SH-[1-9]\\d{0,2}": 2053,
                "^SR-[1-9]\\d{0,2}": 2053,
                "^MD-[1-9]\\d{0,2}": 2053,
            },
            Massachusetts: {
                "^CH-[1-9]\\d{0,2}\\b": 2002,
                "^CR-[1-9]\\d{0,2}\\b": 2002,
                "^SH-[1-9]\\d{0,2}\\b": 2055,
                "^SR-[1-9]\\d{0,2}[a-zA-Z]*\\b": 2055,
            },
            Michigan: { "^CR-[1-9]\\d{0,2}\\b": 2056, "^M-[1-9]\\d{0,2}\\b": 2056, "^SR-[1-9]\\d{0,2}\\b": 2056 },
            Minnesota: {
                "^CH-[1-9]\\d{0,2}\\b": 2002,
                "^CR-[1-9]\\d{0,2}\\b": 2180,
                "^SH-[1-9]\\d{0,2}\\b": 2060,
                "^SR-[1-9]\\d{0,2}\\b": 2060,
                "^MN-[1-9]\\d{0,2}\\b": 2060,
            },
            Mississippi: { "^SH-[1-9]\\d{0,2}\\b": 7, "^SR-[1-9]\\d{0,2}\\b": 7, "^MS-[1-9]\\d{0,2}\\b": 7 },
            Missouri: {
                "^CH-[1-9]\\d{0,2}\\b": 2002,
                "^CR-[1-9]\\d{0,2}\\b": 2002,
                "^SH-[1-9]\\d{0,2}\\b": 2061,
                "^SH-[A-Z]\\w{0,2}\\b": 2062,
                "^SR-[1-9]\\d{0,2}\\b": 2061,
                "^MO-[1-9]\\d{0,2}\\b": 2061,
            },
            Montana: {
                "^CH-[1-9]\\d{0,2}\\b": 2002,
                "^CR-[1-9]\\d{0,2}\\b": 2002,
                "^SH-[1-9]\\d{0,2}\\b": 2063,
                "^SR-[1-9]\\d{0,2}\\b": 2063,
                "^MT-[1-9]\\d{0,2}\\b": 2063,
            },
            Nebraska: {
                "^CH-[1-9]\\d{0,2}\\b": 2002,
                "^CR-[1-9]\\d{0,2}\\b": 2002,
                "^SH-[1-9]\\d{0,2}\\b": 7,
                "^SR-[1-9]\\d{0,2}\\b": 7,
                "^L-[1-9]\\d{0,2}\\b": 7,
                "^N-[1-9]\\d{0,2}\\b": 2072,
                "^S-[1-9]\\d{0,2}\\b": 7,
            },
            Nevada: {
                "^US-[1-9]\\d{0,2}\\s+(?:ALT|Alt)\\b": 2004,
                "^CH-[1-9]\\d{0,2}\\b": 2002,
                "^CR-[1-9]\\d{0,2}\\b": 2002,
                "^SH-[1-9]\\d{0,2}\\b": 2086,
                "^SR-[1-9]\\d{0,2}\\b": 2086,
                "^NV-[1-9]\\d{0,2}\\b": 2086,
            },
            "New Hampshire": {
                "^CH-[1-9]\\d{0,2}\\b": 2002,
                "^CR-[1-9]\\d{0,2}\\b": 2002,
                "^SH-[1-9]\\d{0,2}\\b": 2076,
                "^SR-[1-9]\\d{0,2}[a-zA-Z]*\\b": 2076,
            },
            "New Jersey": {
                "^CH-[1-9]\\d{0,2}": 2002,
                "^CR-[1-9]\\d{0,2}": 2083,
                "^SH-[1-9]\\d{0,2}": 7,
                "^SR-[1-9]\\d{0,2}": 7,
                "^NJ-[1-9]\\d{0,2}": 7,
                "^Garden State (Parkway|Pkwy)": 2079,
                "^Palisades Interstate (Parkway|Pkwy)": 2082,
                "^Atlantic City (Expressway|Expy|Expwy)": 2000,
            },
            "New Mexico": {
                "^CH-[1-9]\\d{0,2}\\b": 2002,
                "^CR-[1-9]\\d{0,2}\\b": 2002,
                "^SH-[1-9]\\d{0,2}\\b": 2085,
                "^SR-[1-9]\\d{0,2}\\b": 2085,
            },
            "New York": {
                "^CH-[1-9]\\d{0,2}": 2002,
                "^CR-[1-9]\\d{0,2}[A-Z]*\\b": 2002,
                "^SH-[1-9]\\d{0,2}": 2087,
                "^SR-[1-9]\\d{0,2}": 2087,
                "^NY-[1-9]\\d{0,2}": 2087,
                "\\bPalisades Interstate (Parkway|Pkwy)\\b": 2082,
                "\\b(?:Saw Mill River(?: Parkway| Pkwy)|SMP)\\b": 2092,
                "\\b(?:Taconic State(?: Parkway| Pkwy)|TSP)\\b": 2092,
                "\\b(?:Bear Mountain State(?: Parkway| Pkwy)|BMP)\\b": 2092,
                "\\b(?:Cross County(?: Parkway| Pkwy)|CCP)\\b": 2092,
                "\\b(?:Hutchinson River(?: Parkway| Pkwy)|HRP)\\b": 2092,
                "\\b(?:Korean War Veterans(?: Parkway| Pkwy)|KWVP)\\b": 2092,
                "\\b(?:Pelham(?: Parkway| Pkwy)|PP)\\b": 2092,
                "\\b(?:Sprain Brook(?: Parkway| Pkwy)|SBP)\\b": 2092,
                "\\b(?:Belt(?: Parkway| Pkwy))\\b": 2090,
                "\\b(?:Cross Island(?: Parkway| Pkwy))\\b": 2090,
                "\\b(?:Grand Central(?: Parkway| Pkwy))\\b": 2090,
                "\\b(?:Jackie Robinson(?: Parkway| Pkwy))\\b": 2090,
                "\\b(?:Bronx River(?: Parkway| Pkwy))\\b": 2090,
                "\\b(?:Hutchison River(?: Parkway| Pkwy))\\b": 2090,
                "\\b(?:Mosholu(?: Parkway| Pkwy))\\b": 2090,
                "\\b(?:Northern State(?: Parkway| Pkwy))\\b": 2090,
                "\\b(?:Harlem River(?: Drive| Dr))\\b": 2090,
                "\\b(?:Robert Moses(?: Causeway| Cswy))\\b": 2090,
                "\\b(?:Sagtikos State(?: Parkway| Pkwy))\\b": 2090,
                "\\b(?:Southern State(?: Parkway| Pkwy))\\b": 2090,
                "\\b(?:Sunken Meadow State(?: Parkway| Pkwy))\\b": 2090,
                "\\b(?:Wantagh State(?: Parkway| Pkwy))\\b": 2090,
                "\\b(?:Loop(?: Parkway| Dr))\\b": 2091,
                "\\b(?:Bethpage State(?: Parkway| Pkwy))\\b": 2091,
                "\\b(?:Meadowbrook State(?: Parkway| Pkwy))\\b": 2091,
                "\\b(?:Lake Ontario State(?: Parkway| Pkwy))\\b": 2093,
                "\\b(?:Niagara Scenic(?: Parkway| Pkwy))\\b": 2094,
            },
            "North Carolina": {
                "^US-[1-9]\\d{0,2}\\s+(?:BUS|Bus|Business)\\b": 2005,
                "^US-[1-9]\\d{0,2}\\s+(?:BYP|Byp|Bypass)\\b": 2006,
                "^US-[1-9]\\d{0,2}\\s+(?:CONN|Conn|Connector)\\b": 2007,
                "^CH-[1-9]\\d{0,2}\\b": 2002,
                "^CR-[1-9]\\d{0,2}\\b": 2002,
                "^SH-[1-9]\\d{0,2}\\b": 2065,
                "^SR-[1-9]\\d{0,2}\\b": 2065,
                "^NC-[1-9]\\d{0,2}\\b": 2065,
            },
            "North Dakota": {
                "^CH-[1-9]\\d{0,2}\\b": 2002,
                "^CR-[1-9]\\d{0,2}\\b": 2002,
                "^SH-[1-9]\\d{0,2}\\b": 2070,
                "^SR-[1-9]\\d{0,2}\\b": 2070,
                "^ND-[1-9]\\d{0,3}\\b": 2070,
            },
            Ohio: {
                "^CH-[1-9]\\d{0,2}\\b": 2002,
                "^CR-[1-9]\\d{0,3}\\b": 2181,
                "^SH-[1-9]\\d{0,2}\\b": 2095,
                "^SR-[1-9]\\d{0,2}\\b": 2095,
            },
            Oklahoma: { "^SH-[1-9]\\d{0,2}\\b": 2097, "^SR-[1-9]\\d{0,2}\\b": 2097 },
            Oregon: {
                "^CH-[1-9]\\d{0,2}\\b": 2002,
                "^CR-[1-9]\\d{0,2}\\b": 2002,
                "^SH-[1-9]\\d{0,2}\\b": 2099,
                "^SR-[1-9]\\d{0,2}\\b": 2099,
                "^OR-[1-9]\\d{0,2}\\b": 2099,
            },
            Pennsylvania: {
                "^US-[1-9]\\d{0,2}\\s+(?:BUS|Bus|Business)\\b": 2005,
                "^CH-[1-9]\\d{0,2}": 2002,
                "^CR-[1-9]\\d{0,2}": 2002,
                "^SH-[1-9]\\d{0,2}": 2101,
                "^PA-[1-9]\\d{0,2}\\b": 2101,
                "^Hwy\\s[1-9]\\d{0,2}\\b": 2101,
                "^SR-[1-9]\\d{0,2}\\s+(?:BUS|Bus|Business)\\b": 2104,
                "^SR-[1-9]\\d{0,2}(?!\\s*(?:BUS|Bus|Business))\\b": 2101,
            },
            "Rhode Island": {
                "^CH-[1-9]\\d{0,2}\\b": 2002,
                "^CR-[1-9]\\d{0,2}\\b": 2002,
                "^SH-[1-9]\\d{0,2}\\b": 2108,
                "^SR-[1-9]\\d{0,2}\\b": 2108,
                "^RI-[1-9]\\d{0,2}\\b": 2108,
            },
            "South Carolina": {
                "^CH-[1-9]\\d{0,2}": 2002,
                "^CR-[1-9]\\d{0,2}": 2002,
                "^SH-[1-9]\\d{0,2}": 2109,
                "^SR-[1-9]\\d{0,2}": 2109,
                "^SC-[1-9]\\d{0,2}": 2109,
            },
            "South Dakota": {
                "^CH-[1-9]\\d{0,2}\\b": 2002,
                "^CR-[1-9A-Z]\\d{0,2}\\b": 2002,
                "^SH-[1-9]\\d{0,2}\\b": 2114,
                "^SR-[1-9]\\d{0,2}\\b": 2114,
                "^SD-[1-9]\\d{0,3}\\b": 2114,
            },
            Tennessee: {
                "^CH-[1-9]\\d{0,2}\\b": 2002,
                "^CR-[1-9]\\d{0,2}\\b": 2002,
                "^SH-[1-9]\\d{0,2}\\b": 2115,
                "^TN-[1-9]\\d{0,2}\\b": 2115,
                "^SR-[1-9]\\d{0,2}\\b": 2116,
            },
            Texas: {
                "^I-[1-9]\\d{0,2}[A-Z]+\\s": new Set<number>([5, 2206]),
                "^SH-[1-9]\\d{0,3}": new Set<number>([2117, 2123]),
                "^[Ss][Pp][Uu][Rr] [1-9]\\d{0,3}\\b": 2126,
                "\\b[Ll][Oo][Oo][Pp] [1-9]\\d{0,3}\\b": 2122,
                "^SR-[1-9]\\d{0,3}": 2117,
                "^FM-[1-9]\\d{0,3}": 2121,
                "^Beltway [1-9]\\d{0,3}\\b": 2119,
                "^Sam Houston (Tollway|Tlwy|Parkway|Pkwy)\\b": 2198,
                "^President George Bush (Turnpike|Tpke|Tpk)\\b": 2123,
                "^Park (Road|Rd)\\b": 2144,
                "^Westpark (Tollway|Tlwy)\\b": 2199,
                "^Fort Bend (Tollway|Tlwy|Parkway|Pkwy)\\b": 2196,
            },
            Utah: {
                "^CH-[1-9]\\d{0,2}\\b": 2002,
                "^CR-[1-9]\\d{0,2}\\b": 2002,
                "^SH-[1-9]\\d{0,2}\\b": 2127,
                "^SR-[1-9]\\d{0,2}\\b": 2127,
            },
            Vermont: {
                "^CH-[1-9]\\d{0,2}\\b": 2002,
                "^CR-[1-9]\\d{0,2}\\b": 2002,
                "^SH-[1-9]\\d{0,2}\\b": 2131,
                "^SR-[1-9]\\d{0,2}\\b": 2131,
                "^VT-[1-9]\\d{0,2}\\b": 2131,
            },
            Virginia: {
                "^CH-[1-9]\\d{0,2}\\b": 2002,
                "^CR-[1-9]\\d{0,2}]\\b": 2002,
                "^SH-[1-9]\\d{0,2}\\b": 2128,
                "^SR-[1-9]\\d{0,2}\\b": 2128,
                "^Blue Ridge Pkwy\\b": 2069,
            },
            Washington: {
                "^CH-[1-9]\\d{0,2}\\b": 2002,
                "^CR-[1-9]\\d{0,2}\\b": 2002,
                "^SH-[1-9]\\d{0,2}\\b": 2133,
                "^SR-[1-9]\\d{0,2}(?!\\s*(?:Spur|SPUR|BUS|Bus|Business))\\b": 2133,
                "^SR-[1-9]\\d{0,2}\\s+(?:Spur|SPUR|BUS|Bus|Business)": 2134,
                "^FS-[1-9]\\d{0,3}\\b": 2011,
            },
            "West Virginia": {
                "^CH-[1-9]\\d{0,2}\\b": 2002,
                "^CR-[1-9]\\d{0,2}\\b": 2002,
                "^SH-[1-9]\\d{0,2}\\b": 2138,
                "^SR-[1-9]\\d{0,2}\\b": 2138,
                "^WV-[1-9]\\d{0,2}\\b": 2138,
            },
            Wisconsin: {
                "^CH-[A-Z]+\\b": 2137,
                "^CR-[1-9]\\d{0,2}": 2137,
                "^SH-[1-9]\\d{0,2}": 2135,
                "^SR-[1-9]\\d{0,2}": 2135,
                "^WIS-[1-9]\\d{0,2}\\b": 2135,
                "^WIS SPUR": 2135,
            },
            Wyoming: {
                "^CH-[1-9]\\d{0,2}\\b": 2002,
                "^CR-[1-9]\\d{0,2}\\b": 2002,
                "^SH-[1-9]\\d{0,2}\\b": 2143,
                "^SR-[1-9]\\d{0,2}\\b": 2143,
                "^WY-[1-9]\\d{0,2}\\b": 2143,
            },
        },
        // Uruguay
        236: { "": { Ruta: 1111 } },

        // Réunion
        262: { "": { "D\\d+[^:]*": 1092, "N\\d+[^:]*": 1072 } },
        // Guadeloupe
        590: { "": { "D\\d+[^:]*": 1092, "N\\d+[^:]*": 1072 } },
        // French Guyana
        594: { "": { "D\\d+[^:]*": 1092, "N\\d+[^:]*": 1072 } },
        // Martinique
        596: { "": { "D\\d+[^:]*": 1092, "N\\d+[^:]*": 1072 } },
        // Wallis and Futuna
        681: { "": { "D\\d+[^:]*": 1092, "N\\d+[^:]*": 1072 } },
        // French Polynesia
        689: { "": { "D\\d+[^:]*": 1092, "N\\d+[^:]*": 1072 } },
    };

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
        sdk.Sidebar.registerScriptTab().then((r) => {
            r.tabLabel.innerHTML = "RSA";
            r.tabPane.innerHTML = $rsaTab.html;
            setupOptions();
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
        await loadSettings();

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

        sdk.Shortcuts.createShortcut({
            callback: addShieldClick,
            description: "Activates the Add Shield Button",
            shortcutId: "addShield",
            shortcutKeys: "A+83",
        });
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

    async function loadSettings() {
        const localSettings = JSON.parse(<string>localStorage.getItem("RSA_Settings"));
        const serverSettings = await WazeWrap.Remote.RetrieveSettings("RSA_Settings");
        if (!serverSettings) {
            console.error("RSA: Error communicating with WW settings server");
        }

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
        if (serverSettings && serverSettings.lastSaveAction > rsaSettings.lastSaveAction) {
            $.extend(rsaSettings, serverSettings);
            // console.log('RSA: server settings used');
        } else {
            // console.log('RSA: local settings used');
        }
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
        const serverSave = await WazeWrap.Remote.SaveSettings("RSA_Settings", localSettings);

        if (serverSave === null) {
            console.warn("RSA: User PIN not set in WazeWrap tab");
        } else {
            if (serverSave === false) {
                console.error("RSA: Unable to save settings to server");
            }
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

    function tryScan() {
        if (!rsaSettings.enableScript) return;

        // Reset the array of objects that need names fixed
        BadNames = [];

        function scanNode(node: Node | null) {
            processNode(node);
        }

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
                processSeg(s);
            }
        }
        // Scan all nodes on screen
        if (rsaSettings.HighNodeShields || rsaSettings.ShowNodeShields || rsaSettings.titleCase) {
            const nodeSet: Set<Node> = new Set<Node>(sdk.DataModel.Nodes.getAll());
            for (const n of nodeSet) {
                scanNode(n);
            }
        }
    }

    const majorRoads = new Set<number>([3, 4, 5, 6]);
    function processSeg(seg: Segment) {
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
        const candidate: Candidate = isSegmentCandidate(address, stateName, countryID);

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
        for (let idx = 0; idx < turns.length; ++idx) {
            const turn = turns[idx];
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
    function isSegmentCandidate(address: SegmentAddress, stateName: string, countryId: number | null | undefined) {
        let candidate = isStreetCandidate(address.street, stateName, countryId);
        if (!candidate.isCandidate && address.country !== null && address.country?.id !== undefined && CheckAltName.has(address.country.id)) {
            for (const altAddress of address.altStreets) {
                candidate = isStreetCandidate(altAddress.street, stateName, countryId);
                if (candidate.isCandidate) {
                    return candidate;
                }
            }
        }
        return candidate;
    }

    function isStreetCandidate(street: Street | null, stateName: string, countryId: number | null | undefined): Candidate {
        const info: Candidate = { isCandidate: false, iconID: null };

        if (street === null || countryId === null || countryId === undefined || !RoadAbbr[countryId]) {
            return info;
        }
        // if (stateName === null) stateName = "";

        //Check to see if the country has states configured in RSA by looking for a key with nothing in it
        if (street.name) {
            const noStates: boolean = "" in RoadAbbr[countryId];
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

        const pixelPos = proj4("EPSG:4326", "EPSG:3857", node.geometry.coordinates);
        const startPoint = { x: pixelPos[0], y: pixelPos[1] };
        const lblStart = { x: startPoint.x - labelDistance().label, y: startPoint.y + labelDistance().label };

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

        const nodeLabelCoordinates = proj4("EPSG:3857", "EPSG:4326", [lblStart.x, lblStart.y]);
        const nodeLabel = turf.point(
            nodeLabelCoordinates,
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
        pointCoordinates.push(nodeLabelCoordinates);

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
                const pointLabelFeature = turf.point(
                    proj4("EPSG:3857", "EPSG:4326", [xpoint, ypoint]),
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
            const pointParam = proj4("EPSG:4326", "EPSG:3857", param);
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
                    Math.abs(oldparam.x - pointParam[0]) > labelDis.space ||
                    Math.abs(oldparam.y - pointParam[1]) > labelDis.space ||
                    !AtLeastOne
                ) {
                    const centerparam: Coordinates = { x: undefined, y: undefined };
                    centerparam.x = (oldparam.x + pointParam[0]) / 2;
                    centerparam.y = (oldparam.y + pointParam[1]) / 2;
                    if (
                        (centerparam.x && Math.abs(centerparam.x - pointParam[0]) > labelDis.space) ||
                        (centerparam.y && Math.abs(centerparam.y - pointParam[1]) > labelDis.space) ||
                        !AtLeastOne
                    ) {
                        // let LabelPoint = new OpenLayers.Geometry.Point(centerparam.x, centerparam.y);
                        // const pointFeature = new OpenLayers.Feature.Vector(LabelPoint, null, style);
                        const coordCenterPoint = proj4("EPSG:3857", "EPSG:4326", [centerparam.x, centerparam.y]);
                        const shieldFeature = turf.point(
                            coordCenterPoint,
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
            oldparam.x = pointParam[0];
            oldparam.y = pointParam[1];
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
        const label_distance: LabelDistance = { icon: 0, label: 0, space: 0 };
        switch (sdk.Map.getZoomLevel()) {
            case ZoomLevel.ZM10:
                label_distance.label = 2;
                label_distance.space = 30;
                label_distance.icon = 1.1;
                break;
            case ZoomLevel.ZM9:
                label_distance.label = 4;
                label_distance.space = 30;
                label_distance.icon = 2.2;
                break;
            case ZoomLevel.ZM8:
                label_distance.label = 8;
                label_distance.space = 30;
                label_distance.icon = 4.5;
                break;
            case ZoomLevel.ZM7:
                label_distance.label = 14;
                label_distance.space = 30;
                label_distance.icon = 8.3;
                break;
            case ZoomLevel.ZM6:
                label_distance.label = 28;
                label_distance.space = 30;
                label_distance.icon = 17;
                break;
            case ZoomLevel.ZM5:
                label_distance.label = 50;
                label_distance.space = 30;
                label_distance.icon = 34;
                break;
            case ZoomLevel.ZM4:
                label_distance.label = 100;
                label_distance.space = 40;
                label_distance.icon = 68;
                break;
            case ZoomLevel.ZM3:
                label_distance.label = 300;
                label_distance.space = 70;
                label_distance.icon = 140;
                break;
            case ZoomLevel.ZM2:
                label_distance.label = 300;
                label_distance.space = 200;
                label_distance.icon = 140;
                break;
            case ZoomLevel.ZM1:
                label_distance.label = 300;
                label_distance.space = 250;
                label_distance.icon = 140;
                break;
        }
        return label_distance;
    }

    initRSA();
}
