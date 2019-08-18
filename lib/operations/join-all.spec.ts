import { assert } from "chai";
import * as sinon from "sinon";
import { TimeoutError } from "../await/timeout-error";
import { assertErrorChain, fakeConnection } from "../helpers.spec";
import { JoinError } from "./join";
import { joinAll } from "./join-all";

function successResponsesForChannelChunk(channels: string[]): string[] {
  return channels.map(
    ch =>
      `:justinfan12345!justinfan12345@justinfan12345.tmi.twitch.tv JOIN #${ch}`
  );
}

describe("./operations/join-all", function() {
  describe("#joinAll()", function() {
    it("should send the correct wire command for a single chunk", function() {
      sinon.useFakeTimers();
      const { client, data } = fakeConnection();

      joinAll(client, ["pajlada", "randers", "nymn_hs", "forsen"]);

      assert.deepStrictEqual(data, [
        "JOIN #pajlada,#randers,#nymn_hs,#forsen\r\n"
      ]);
    });

    it("should send the correct wire command for a multiple chunks", async function() {
      const { client, emitAndEnd, emit, data } = fakeConnection();

      const firstChunkChannels = [
        "007_zeppelin",
        "00joel0",
        "00xxxzeroxxx00",
        "0414811480",
        "0hhhschnapp",
        "0liver92",
        "0malleycat",
        "0mrwaffles0",
        "0neeyedwolf",
        "0oopatrickoo0",
        "0strand47",
        "0wegtail0",
        "0x4c554b49",
        "101bryce",
        "1023alec",
        "112_ty",
        "123drnijal321",
        "123kosta",
        "123rollwithme",
        "12ballergarza",
        "12camster",
        "12kt3_",
        "12stealth",
        "13458788393762899",
        "13misterj",
        "142squad",
        "15santmyern",
        "1802_callum",
        "1_achillus_1",
        "1a2ip105josip",
        "1blessedmom",
        "1carrot_tv",
        "1charlie3_",
        "1darkss",
        "1jarelle",
        "1mattyp7",
        "1nekolai",
        "1o0qnov7",
        "1regular_guy",
        "1shoot1heat1",
        "1ststring",
        "1stworldgg",
        "1thefighter2",
        "1thegreenarrow1",
        "1trutank",
        "1wilshire",
        "1wolverine59",
        "1yourmom4",
        "20thcenturyrasta",
        "21cheeseheadtv",
        "23al3o7",
        "23chrism",
        "2447indiana",
        "24_hollywood_",
        "24atabe",
        "24k_jsmooth",
        "25an8th",
        "26shorty11",
        "27aaaaaaaaaaz",
        "2icyalpha",
        "2kcheezy",
        "2muchp0wer",
        "2ndtrip",
        "2ofemyesterday",
        "2philosophy4",
        "2rushthefrog",
        "2twotango",
        "2what2nani2",
        "2xxhitmanxx6",
        "30clipkey",
        "30indabasement",
        "317536",
        "31conspiracy",
        "31valerio",
        "33dommarino",
        "3ddielurkk",
        "3ddy3d",
        "3diii",
        "3lch0b1",
        "3puttbirdie",
        "3rnrkassanyt",
        "412_sye",
        "420_playzz",
        "420darthreefer",
        "4511_911",
        "46legend",
        "47ripz",
        "4chainreaver",
        "4nanassalad",
        "4nugg",
        "4secs",
        "4tn1ght",
        "50cal_muaythai",
        "50nocent",
        "5330b8",
        "54bryce54",
        "559slumpgod",
        "55sllew",
        "5alixz",
        "5h4h",
        "5iivebodies",
        "5roachdylan",
        "5starbr686",
        "5tylepointz",
        "610harry",
        "64c248",
        "661patrick",
        "676755678696",
        "69purepenguin69",
        "6_leprbeast_12",
        "6lack_shinobi",
        "6lue6illsonat",
        "70grade",
        "7hebrady",
        "7mdanz",
        "7wells_",
        "801_mk4r32",
        "850k0p3ning",
        "88littlefoot88",
        "8bombtv",
        "8thoctopuz",
        "98dark98",
        "98sparkz",
        "9calighost4",
        "a1d3ns4stdad",
        "a1phadog1",
        "a1thicksauce",
        "a4k_scope",
        "a55eater51",
        "a63caddyboy",
        "a6g0d",
        "a__d__a__m_",
        "a_deadly_love",
        "a_hal0_pr0d1gy",
        "a_skylit_drive",
        "aaghaad",
        "aahtherapy",
        "aandy_11",
        "aaronbull22010123",
        "aaronfhd",
        "aaronhenry4",
        "aaronrosse55",
        "aaronscharf",
        "aarun_",
        "aasc19",
        "aashuraaa",
        "aasomee",
        "aayyoo_brian",
        "ab_pete21",
        "abaked_potato_27",
        "abakedfish",
        "abbyzgamingchannel",
        "abchxnn",
        "abcomb",
        "abdul_jahar_",
        "abenedict7",
        "abennett11",
        "abergsoften",
        "aberrant_ninja",
        "abhishekc22",
        "abitdelusional",
        "abn_vp_polo",
        "abode_juve",
        "abominableally",
        "aboriyan7",
        "about_75_puppies",
        "abovexcloudz",
        "aboyero97",
        "abraham_h12",
        "abraxaslobo",
        "abrightshadow",
        "abskater02",
        "absolutemachine1",
        "abstracreality",
        "absurdityttv",
        "absxrdityx",
        "abusemiicro",
        "abusyseagull",
        "acanizal521",
        "accretian",
        "accurateee",
        "aceboogie_215",
        "acedrewfiggy",
        "acehuntinyt",
        "acerfoxz",
        "acescorpion35555",
        "acethemace4",
        "acethough",
        "achieverexe",
        "achillesj",
        "acho1117",
        "achtlireinhardt",
        "achubyredneck",
        "acidzloco",
        "ackes",
        "ackey917",
        "acm6600",
        "acornzzzz",
        "acorrn",
        "acr202",
        "acrdominate",
        "acridwindow5397",
        "acrobaticfork",
        "acrowe412",
        "activetwirl",
        "acupzz",
        "acweezy",
        "ad__23",
        "adam97416",
        "adamantassassin",
        "adamdotson1994",
        "adamdumb",
        "adameric85",
        "adamjbrown10",
        "adamjonezi",
        "adamkopo",
        "adamnat95",
        "adamroark1996",
        "adamshortt123",
        "adamwarlock_",
        "adan0520",
        "adan_4tears",
        "adansanch94",
        "adavi_",
        "addroon",
        "adeddy",
        "adel0406",
        "ademonstration",
        "adhd_alex99",
        "adiaxe_x",
        "adnane_benany",
        "ado_da_don",
        "adok25",
        "adonisvango",
        "adonzo14",
        "adooooo",
        "adrialeti1810",
        "adrian0368",
        "adrianarmitage1134",
        "adriaxpaola",
        "adrielomo",
        "adrocess",
        "adrugaddictstream",
        "adstban",
        "adub12w",
        "adude03",
        "aduval_",
        "advancednewb",
        "advancedprimate",
        "advilow",
        "adz89_",
        "aei1119",
        "aergl0w",
        "aero2448",
        "aerusam",
        "aesselidrah",
        "aether_shiv",
        "aetherinthek",
        "afgbludz",
        "afolabi180",
        "afonsocruz9817",
        "afro_budd_98",
        "afroblack",
        "afroditto",
        "afterearth323",
        "aftm12",
        "aftnine",
        "ag3k20205",
        "ag_shmopboy",
        "agbonzzorn",
        "agecristina",
        "agerasan",
        "agirlcalledjim",
        "aglore94",
        "agonzales003",
        "agoracy",
        "aguilarj13",
        "aguynamede",
        "agxd3m0n",
        "ahacienda",
        "ahhh_griff",
        "ahmad_kurd_",
        "ahmed200438",
        "ahnegrotwt",
        "ahole232",
        "ahopkins2018",
        "ahrnesson1919",
        "aicudi",
        "aidankitts",
        "aidant1992",
        "aiden1328",
        "aiden_like_what",
        "aidenhamilton",
        "aidxstown",
        "aiglon19",
        "aiirplays",
        "ailoator",
        "aimbrat_",
        "aimoroyale",
        "aiphameez",
        "air_agu",
        "airbusadam",
        "airk00laid09",
        "airweeily",
        "aizenxhollow",
        "aj2nd",
        "aj_25",
        "aj_the1st",
        "aj_wint",
        "aj_zzzzz",
        "ajayx_x",
        "ajboolin",
        "ajbrown30",
        "ajcase21",
        "ajhollowayvrm",
        "ajkauri",
        "ajm7aus",
        "ajmack21",
        "ajr_95",
        "ajxrunnerx",
        "ak__er1nho__47",
        "aka_bloodtooth",
        "aka_mrx",
        "aka_shots",
        "akabani",
        "akamalikk",
        "akarobles",
        "akasuspect",
        "akathektos",
        "akeekerz",
        "akg_alpha",
        "akibbarvatiya",
        "akiileez",
        "akillerintux",
        "akira_hdk",
        "akiraarcade",
        "akirazlol",
        "akjomab",
        "akkvme",
        "akonel89",
        "akretsch10",
        "akse1234",
        "akselmaron"
      ];

      const secondChunkChannels = ["pajlada", "nymn_hs", "forsen"];

      const channels = [...firstChunkChannels, ...secondChunkChannels];

      const promise = joinAll(client, channels);

      // method sends first chunk...
      assert.deepStrictEqual(data, [
        "JOIN #" + firstChunkChannels.join(",#") + "\r\n"
      ]);

      // then awaits all responses/failures for that chunk...
      // let's simulate 100% success
      emit(...successResponsesForChannelChunk(firstChunkChannels));

      // wait for promised to be settled in the response handling
      await new Promise(resolve => setImmediate(resolve));

      assert.deepStrictEqual(data, [
        "JOIN #" + firstChunkChannels.join(",#") + "\r\n",
        "JOIN #pajlada,#nymn_hs,#forsen\r\n"
      ]);

      // leave out nymn_hs so nymn_hs should have an error (outpaced)
      emitAndEnd(
        ":justinfan12345!justinfan12345@justinfan12345.tmi.twitch.tv JOIN #pajlada",
        ":justinfan12345!justinfan12345@justinfan12345.tmi.twitch.tv JOIN #forsen"
      );

      const results = await promise;

      // no error for successful channel
      // tslint:disable-next-line:no-string-literal
      assert.isUndefined(results["pajlada"]);

      // error for nymn_hs (no response received)
      assertErrorChain(
        // tslint:disable-next-line:no-string-literal
        results["nymn_hs"],
        JoinError,
        "Failed to join channel nymn_hs: A response to a command issued later than this command was received",
        TimeoutError,
        "A response to a command issued later than this command was received"
      );

      assert.isTrue(client.wantedChannels.has("nymn_hs"));
      assert.isFalse(client.joinedChannels.has("nymn_hs"));

      assert.isTrue(client.wantedChannels.has("pajlada"));
      assert.isTrue(client.joinedChannels.has("pajlada"));
    });
  });
});
