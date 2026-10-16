/*
 * ReparerTexteArabeRTL.jsx  v1.0.0
 * -------------------------------------------------------------------------
 * FR : Diagnostique et répare en lot le texte arabe et hébreu d'un document
 *      Illustrator : composeur Moyen-Orient manquant (lettres non liées),
 *      sens de paragraphe, langue, jeu de chiffres, formes de présentation
 *      Unicode collées depuis un PDF et texte stocké à l'envers (ordre visuel).
 * EN : Batch-diagnoses and repairs Arabic and Hebrew text in an Illustrator
 *      document: missing Middle Eastern composer (unjoined letters), paragraph
 *      direction, language, digit set, Unicode presentation forms pasted from
 *      PDFs and text stored backwards (visual order).
 *
 * Auteur / Author : Amirouche Amwanes — Licence MIT (voir LICENSE)
 * Cible / Target  : Adobe Illustrator CC 2018 et plus récent (ExtendScript)
 * Statut / Status : non testé dans Illustrator (syntaxe ES3 et logique de
 *                   texte vérifiées hors Illustrator sur données simulées)
 *
 * Technique de contournement du sens de paragraphe (réglage ignoré quand il
 * est égal à celui du style appliqué) : idée décrite par sttk3 sur Adobe
 * Community, réimplémentée ici. / Paragraph-direction workaround idea credited
 * to sttk3 (Adobe Community), reimplemented from scratch.
 *
 * Conseil : travaillez sur une copie du fichier. / Tip: work on a copy.
 * Aucun appel réseau, aucune collecte de données. / No network, no telemetry.
 */
#target illustrator

/* =========================================================================
 * 1. LOGIQUE TEXTE PURE (testable hors Illustrator)
 *    PURE TEXT LOGIC (testable outside Illustrator)
 * ========================================================================= */
var RTLCore = (function () {
    // Table générée depuis les décompositions Unicode (formes de présentation
    // arabes FB50–FDFF, FE70–FEFE). Format : CODE + forme (i/m/f/s) + codes
    // de remplacement séparés par « . ».
    // Table generated from Unicode decompositions. Format: CODE + form
    // (i=initial, m=medial, f=final, s=isolated) + replacement codes.
    var RAW = "FB50s671,FB51f671,FB52s67B,FB53f67B,FB54i67B,FB55m67B,FB56s67E,FB57f67E,FB58i67E,FB59m67E,FB5As680,FB5Bf680,FB5Ci680,FB5Dm680,FB5Es67A,FB5Ff67A,FB60i67A,FB61m67A,FB62s67F,FB63f67F,FB64i67F,FB65m67F,FB66s679,FB67f679,FB68i679,FB69m679,FB6As6A4,FB6Bf6A4,FB6Ci6A4,FB6Dm6A4,FB6Es6A6,FB6Ff6A6,FB70i6A6,FB71m6A6,FB72s684,FB73f684,FB74i684,FB75m684,FB76s683,FB77f683,FB78i683,FB79m683,FB7As686,FB7Bf686,FB7Ci686,FB7Dm686,FB7Es687,FB7Ff687,FB80i687,FB81m687,FB82s68D,FB83f68D,FB84s68C,FB85f68C,FB86s68E,FB87f68E,FB88s688,FB89f688,FB8As698,FB8Bf698,FB8Cs691,FB8Df691,FB8Es6A9,FB8Ff6A9,FB90i6A9,FB91m6A9,FB92s6AF,FB93f6AF,FB94i6AF,FB95m6AF,FB96s6B3,FB97f6B3,FB98i6B3,FB99m6B3,FB9As6B1,FB9Bf6B1,FB9Ci6B1,FB9Dm6B1,FB9Es6BA,FB9Ff6BA,FBA0s6BB,FBA1f6BB,FBA2i6BB,FBA3m6BB,FBA4s6C0,FBA5f6C0,FBA6s6C1,FBA7f6C1,FBA8i6C1,FBA9m6C1,FBAAs6BE,FBABf6BE,FBACi6BE,FBADm6BE,FBAEs6D2,FBAFf6D2,FBB0s6D3,FBB1f6D3,FBD3s6AD,FBD4f6AD,FBD5i6AD,FBD6m6AD,FBD7s6C7,FBD8f6C7,FBD9s6C6,FBDAf6C6,FBDBs6C8,FBDCf6C8,FBDDs677,FBDEs6CB,FBDFf6CB,FBE0s6C5,FBE1f6C5,FBE2s6C9,FBE3f6C9,FBE4s6D0,FBE5f6D0,FBE6i6D0,FBE7m6D0,FBE8i649,FBE9m649,FBEAs626.627,FBEBf626.627,FBECs626.6D5,FBEDf626.6D5,FBEEs626.648,FBEFf626.648,FBF0s626.6C7,FBF1f626.6C7,FBF2s626.6C6,FBF3f626.6C6,FBF4s626.6C8,FBF5f626.6C8,FBF6s626.6D0,FBF7f626.6D0,FBF8i626.6D0,FBF9s626.649,FBFAf626.649,FBFBi626.649,FBFCs6CC,FBFDf6CC,FBFEi6CC,FBFFm6CC,FC00s626.62C,FC01s626.62D,FC02s626.645,FC03s626.649,FC04s626.64A,FC05s628.62C,FC06s628.62D,FC07s628.62E,FC08s628.645,FC09s628.649,FC0As628.64A,FC0Bs62A.62C,FC0Cs62A.62D,FC0Ds62A.62E,FC0Es62A.645,FC0Fs62A.649,FC10s62A.64A,FC11s62B.62C,FC12s62B.645,FC13s62B.649,FC14s62B.64A,FC15s62C.62D,FC16s62C.645,FC17s62D.62C,FC18s62D.645,FC19s62E.62C,FC1As62E.62D,FC1Bs62E.645,FC1Cs633.62C,FC1Ds633.62D,FC1Es633.62E,FC1Fs633.645,FC20s635.62D,FC21s635.645,FC22s636.62C,FC23s636.62D,FC24s636.62E,FC25s636.645,FC26s637.62D,FC27s637.645,FC28s638.645,FC29s639.62C,FC2As639.645,FC2Bs63A.62C,FC2Cs63A.645,FC2Ds641.62C,FC2Es641.62D,FC2Fs641.62E,FC30s641.645,FC31s641.649,FC32s641.64A,FC33s642.62D,FC34s642.645,FC35s642.649,FC36s642.64A,FC37s643.627,FC38s643.62C,FC39s643.62D,FC3As643.62E,FC3Bs643.644,FC3Cs643.645,FC3Ds643.649,FC3Es643.64A,FC3Fs644.62C,FC40s644.62D,FC41s644.62E,FC42s644.645,FC43s644.649,FC44s644.64A,FC45s645.62C,FC46s645.62D,FC47s645.62E,FC48s645.645,FC49s645.649,FC4As645.64A,FC4Bs646.62C,FC4Cs646.62D,FC4Ds646.62E,FC4Es646.645,FC4Fs646.649,FC50s646.64A,FC51s647.62C,FC52s647.645,FC53s647.649,FC54s647.64A,FC55s64A.62C,FC56s64A.62D,FC57s64A.62E,FC58s64A.645,FC59s64A.649,FC5As64A.64A,FC5Bs630.670,FC5Cs631.670,FC5Ds649.670,FC5Es64C.651,FC5Fs64D.651,FC60s64E.651,FC61s64F.651,FC62s650.651,FC63s651.670,FC64f626.631,FC65f626.632,FC66f626.645,FC67f626.646,FC68f626.649,FC69f626.64A,FC6Af628.631,FC6Bf628.632,FC6Cf628.645,FC6Df628.646,FC6Ef628.649,FC6Ff628.64A,FC70f62A.631,FC71f62A.632,FC72f62A.645,FC73f62A.646,FC74f62A.649,FC75f62A.64A,FC76f62B.631,FC77f62B.632,FC78f62B.645,FC79f62B.646,FC7Af62B.649,FC7Bf62B.64A,FC7Cf641.649,FC7Df641.64A,FC7Ef642.649,FC7Ff642.64A,FC80f643.627,FC81f643.644,FC82f643.645,FC83f643.649,FC84f643.64A,FC85f644.645,FC86f644.649,FC87f644.64A,FC88f645.627,FC89f645.645,FC8Af646.631,FC8Bf646.632,FC8Cf646.645,FC8Df646.646,FC8Ef646.649,FC8Ff646.64A,FC90f649.670,FC91f64A.631,FC92f64A.632,FC93f64A.645,FC94f64A.646,FC95f64A.649,FC96f64A.64A,FC97i626.62C,FC98i626.62D,FC99i626.62E,FC9Ai626.645,FC9Bi626.647,FC9Ci628.62C,FC9Di628.62D,FC9Ei628.62E,FC9Fi628.645,FCA0i628.647,FCA1i62A.62C,FCA2i62A.62D,FCA3i62A.62E,FCA4i62A.645,FCA5i62A.647,FCA6i62B.645,FCA7i62C.62D,FCA8i62C.645,FCA9i62D.62C,FCAAi62D.645,FCABi62E.62C,FCACi62E.645,FCADi633.62C,FCAEi633.62D,FCAFi633.62E,FCB0i633.645,FCB1i635.62D,FCB2i635.62E,FCB3i635.645,FCB4i636.62C,FCB5i636.62D,FCB6i636.62E,FCB7i636.645,FCB8i637.62D,FCB9i638.645,FCBAi639.62C,FCBBi639.645,FCBCi63A.62C,FCBDi63A.645,FCBEi641.62C,FCBFi641.62D,FCC0i641.62E,FCC1i641.645,FCC2i642.62D,FCC3i642.645,FCC4i643.62C,FCC5i643.62D,FCC6i643.62E,FCC7i643.644,FCC8i643.645,FCC9i644.62C,FCCAi644.62D,FCCBi644.62E,FCCCi644.645,FCCDi644.647,FCCEi645.62C,FCCFi645.62D,FCD0i645.62E,FCD1i645.645,FCD2i646.62C,FCD3i646.62D,FCD4i646.62E,FCD5i646.645,FCD6i646.647,FCD7i647.62C,FCD8i647.645,FCD9i647.670,FCDAi64A.62C,FCDBi64A.62D,FCDCi64A.62E,FCDDi64A.645,FCDEi64A.647,FCDFm626.645,FCE0m626.647,FCE1m628.645,FCE2m628.647,FCE3m62A.645,FCE4m62A.647,FCE5m62B.645,FCE6m62B.647,FCE7m633.645,FCE8m633.647,FCE9m634.645,FCEAm634.647,FCEBm643.644,FCECm643.645,FCEDm644.645,FCEEm646.645,FCEFm646.647,FCF0m64A.645,FCF1m64A.647,FCF2m640.64E.651,FCF3m640.64F.651,FCF4m640.650.651,FCF5s637.649,FCF6s637.64A,FCF7s639.649,FCF8s639.64A,FCF9s63A.649,FCFAs63A.64A,FCFBs633.649,FCFCs633.64A,FCFDs634.649,FCFEs634.64A,FCFFs62D.649,FD00s62D.64A,FD01s62C.649,FD02s62C.64A,FD03s62E.649,FD04s62E.64A,FD05s635.649,FD06s635.64A,FD07s636.649,FD08s636.64A,FD09s634.62C,FD0As634.62D,FD0Bs634.62E,FD0Cs634.645,FD0Ds634.631,FD0Es633.631,FD0Fs635.631,FD10s636.631,FD11f637.649,FD12f637.64A,FD13f639.649,FD14f639.64A,FD15f63A.649,FD16f63A.64A,FD17f633.649,FD18f633.64A,FD19f634.649,FD1Af634.64A,FD1Bf62D.649,FD1Cf62D.64A,FD1Df62C.649,FD1Ef62C.64A,FD1Ff62E.649,FD20f62E.64A,FD21f635.649,FD22f635.64A,FD23f636.649,FD24f636.64A,FD25f634.62C,FD26f634.62D,FD27f634.62E,FD28f634.645,FD29f634.631,FD2Af633.631,FD2Bf635.631,FD2Cf636.631,FD2Di634.62C,FD2Ei634.62D,FD2Fi634.62E,FD30i634.645,FD31i633.647,FD32i634.647,FD33i637.645,FD34m633.62C,FD35m633.62D,FD36m633.62E,FD37m634.62C,FD38m634.62D,FD39m634.62E,FD3Am637.645,FD3Bm638.645,FD3Cf627.64B,FD3Ds627.64B,FD50i62A.62C.645,FD51f62A.62D.62C,FD52i62A.62D.62C,FD53i62A.62D.645,FD54i62A.62E.645,FD55i62A.645.62C,FD56i62A.645.62D,FD57i62A.645.62E,FD58f62C.645.62D,FD59i62C.645.62D,FD5Af62D.645.64A,FD5Bf62D.645.649,FD5Ci633.62D.62C,FD5Di633.62C.62D,FD5Ef633.62C.649,FD5Ff633.645.62D,FD60i633.645.62D,FD61i633.645.62C,FD62f633.645.645,FD63i633.645.645,FD64f635.62D.62D,FD65i635.62D.62D,FD66f635.645.645,FD67f634.62D.645,FD68i634.62D.645,FD69f634.62C.64A,FD6Af634.645.62E,FD6Bi634.645.62E,FD6Cf634.645.645,FD6Di634.645.645,FD6Ef636.62D.649,FD6Ff636.62E.645,FD70i636.62E.645,FD71f637.645.62D,FD72i637.645.62D,FD73i637.645.645,FD74f637.645.64A,FD75f639.62C.645,FD76f639.645.645,FD77i639.645.645,FD78f639.645.649,FD79f63A.645.645,FD7Af63A.645.64A,FD7Bf63A.645.649,FD7Cf641.62E.645,FD7Di641.62E.645,FD7Ef642.645.62D,FD7Ff642.645.645,FD80f644.62D.645,FD81f644.62D.64A,FD82f644.62D.649,FD83i644.62C.62C,FD84f644.62C.62C,FD85f644.62E.645,FD86i644.62E.645,FD87f644.645.62D,FD88i644.645.62D,FD89i645.62D.62C,FD8Ai645.62D.645,FD8Bf645.62D.64A,FD8Ci645.62C.62D,FD8Di645.62C.645,FD8Ei645.62E.62C,FD8Fi645.62E.645,FD92i645.62C.62E,FD93i647.645.62C,FD94i647.645.645,FD95i646.62D.645,FD96f646.62D.649,FD97f646.62C.645,FD98i646.62C.645,FD99f646.62C.649,FD9Af646.645.64A,FD9Bf646.645.649,FD9Cf64A.645.645,FD9Di64A.645.645,FD9Ef628.62E.64A,FD9Ff62A.62C.64A,FDA0f62A.62C.649,FDA1f62A.62E.64A,FDA2f62A.62E.649,FDA3f62A.645.64A,FDA4f62A.645.649,FDA5f62C.645.64A,FDA6f62C.62D.649,FDA7f62C.645.649,FDA8f633.62E.649,FDA9f635.62D.64A,FDAAf634.62D.64A,FDABf636.62D.64A,FDACf644.62C.64A,FDADf644.645.64A,FDAEf64A.62D.64A,FDAFf64A.62C.64A,FDB0f64A.645.64A,FDB1f645.645.64A,FDB2f642.645.64A,FDB3f646.62D.64A,FDB4i642.645.62D,FDB5i644.62D.645,FDB6f639.645.64A,FDB7f643.645.64A,FDB8i646.62C.62D,FDB9f645.62E.64A,FDBAi644.62C.645,FDBBf643.645.645,FDBCf644.62C.645,FDBDf646.62C.62D,FDBEf62C.62D.64A,FDBFf62D.62C.64A,FDC0f645.62C.64A,FDC1f641.645.64A,FDC2f628.62D.64A,FDC3i643.645.645,FDC4i639.62C.645,FDC5i635.645.645,FDC6f633.62E.64A,FDC7f646.62C.64A,FDF0s635.644.6D2,FDF1s642.644.6D2,FDF2s627.644.644.647,FDF3s627.643.628.631,FDF4s645.62D.645.62F,FDF5s635.644.639.645,FDF6s631.633.648.644,FDF7s639.644.64A.647,FDF8s648.633.644.645,FDF9s635.644.649,FDFAs635.644.649.20.627.644.644.647.20.639.644.64A.647.20.648.633.644.645,FDFBs62C.644.20.62C.644.627.644.647,FDFCs631.6CC.627.644,FE70s64B,FE71m640.64B,FE72s64C,FE74s64D,FE76s64E,FE77m640.64E,FE78s64F,FE79m640.64F,FE7As650,FE7Bm640.650,FE7Cs651,FE7Dm640.651,FE7Es652,FE7Fm640.652,FE80s621,FE81s622,FE82f622,FE83s623,FE84f623,FE85s624,FE86f624,FE87s625,FE88f625,FE89s626,FE8Af626,FE8Bi626,FE8Cm626,FE8Ds627,FE8Ef627,FE8Fs628,FE90f628,FE91i628,FE92m628,FE93s629,FE94f629,FE95s62A,FE96f62A,FE97i62A,FE98m62A,FE99s62B,FE9Af62B,FE9Bi62B,FE9Cm62B,FE9Ds62C,FE9Ef62C,FE9Fi62C,FEA0m62C,FEA1s62D,FEA2f62D,FEA3i62D,FEA4m62D,FEA5s62E,FEA6f62E,FEA7i62E,FEA8m62E,FEA9s62F,FEAAf62F,FEABs630,FEACf630,FEADs631,FEAEf631,FEAFs632,FEB0f632,FEB1s633,FEB2f633,FEB3i633,FEB4m633,FEB5s634,FEB6f634,FEB7i634,FEB8m634,FEB9s635,FEBAf635,FEBBi635,FEBCm635,FEBDs636,FEBEf636,FEBFi636,FEC0m636,FEC1s637,FEC2f637,FEC3i637,FEC4m637,FEC5s638,FEC6f638,FEC7i638,FEC8m638,FEC9s639,FECAf639,FECBi639,FECCm639,FECDs63A,FECEf63A,FECFi63A,FED0m63A,FED1s641,FED2f641,FED3i641,FED4m641,FED5s642,FED6f642,FED7i642,FED8m642,FED9s643,FEDAf643,FEDBi643,FEDCm643,FEDDs644,FEDEf644,FEDFi644,FEE0m644,FEE1s645,FEE2f645,FEE3i645,FEE4m645,FEE5s646,FEE6f646,FEE7i646,FEE8m646,FEE9s647,FEEAf647,FEEBi647,FEECm647,FEEDs648,FEEEf648,FEEFs649,FEF0f649,FEF1s64A,FEF2f64A,FEF3i64A,FEF4m64A,FEF5s644.622,FEF6f644.622,FEF7s644.623,FEF8f644.623,FEF9s644.625,FEFAf644.625,FEFBs644.627,FEFCf644.627";

    var MAP = {};   // code -> chaîne de remplacement / replacement string
    var FORM = {};  // code -> 'i' | 'm' | 'f' | 's'
    (function build() {
        var items = RAW.split(","), k, it, code, form, reps, s, j;
        for (k = 0; k < items.length; k++) {
            it = items[k];
            code = parseInt(it.substr(0, 4), 16);
            form = it.charAt(4);
            reps = it.substr(5).split(".");
            s = "";
            for (j = 0; j < reps.length; j++) {
                s += String.fromCharCode(parseInt(reps[j], 16));
            }
            MAP[code] = s;
            FORM[code] = form;
        }
    })();

    function isPresentationForm(c) {
        return (c >= 0xFB50 && c <= 0xFDFF) || (c >= 0xFE70 && c <= 0xFEFE);
    }
    function isArabic(c) {
        return (c >= 0x0600 && c <= 0x06FF) || (c >= 0x0750 && c <= 0x077F) ||
               (c >= 0x08A0 && c <= 0x08FF) || isPresentationForm(c);
    }
    function isHebrew(c) {
        return (c >= 0x0590 && c <= 0x05FF) || (c >= 0xFB1D && c <= 0xFB4F);
    }
    function isLatinLetter(c) {
        return (c >= 0x41 && c <= 0x5A) || (c >= 0x61 && c <= 0x7A) ||
               (c >= 0xC0 && c <= 0x24F && c !== 0xD7 && c !== 0xF7);
    }
    // Caractères affichés de gauche à droite à l'intérieur d'un texte RTL
    // (lettres latines, chiffres occidentaux et arabes-indiens).
    // Characters that run left-to-right inside RTL text.
    function isLtrRunChar(c) {
        return isLatinLetter(c) || (c >= 0x30 && c <= 0x39) ||
               (c >= 0x0660 && c <= 0x0669) || (c >= 0x06F0 && c <= 0x06F9);
    }
    // Séparateurs pouvant rester DANS un nombre ou un mot latin (3.5, 12:30)
    function isLtrJoiner(c) {
        return c === 0x2E || c === 0x2C || c === 0x3A || c === 0x2F ||
               c === 0x2D || c === 0x25 || c === 0x066B || c === 0x066C;
    }
    var MIRROR = { "(": ")", ")": "(", "[": "]", "]": "[", "{": "}", "}": "{",
                   "<": ">", ">": "<", "\u00AB": "\u00BB", "\u00BB": "\u00AB" };

    /* Analyse d'une chaîne (un paragraphe) / Analyse one string */
    function analyse(str) {
        var r = { arabic: 0, hebrew: 0, latin: 0, presentation: 0,
                  visualScore: 0, logicalScore: 0 };
        var i, c;
        for (i = 0; i < str.length; i++) {
            c = str.charCodeAt(i);
            if (isArabic(c)) { r.arabic++; if (isPresentationForm(c)) { r.presentation++; } }
            else if (isHebrew(c)) { r.hebrew++; }
            else if (isLatinLetter(c)) { r.latin++; }
        }
        if (r.presentation > 0) { scoreOrder(str, r); }
        r.rtl = r.arabic + r.hebrew;
        r.hasRtl = r.rtl > 0;
        r.rtlDominant = r.rtl > 0 && r.rtl >= r.latin;
        r.script = r.arabic >= r.hebrew ? "arabic" : "hebrew";
        r.visualOrder = r.visualScore > r.logicalScore && r.visualScore >= 2;
        return r;
    }

    /* Heuristique d'ordre : dans un mot en ordre logique, la 1re lettre est en
     * forme initiale et la dernière en forme finale ; stocké à l'envers
     * (ordre visuel), c'est l'inverse.
     * Order heuristic: in logical order a word starts with an initial form and
     * ends with a final form; visual-order (reversed) storage is the opposite. */
    function scoreOrder(str, r) {
        var i = 0, n = str.length, start, first, last;
        while (i < n) {
            while (i < n && !isPresentationForm(str.charCodeAt(i))) { i++; }
            start = i;
            while (i < n && isPresentationForm(str.charCodeAt(i))) { i++; }
            if (i - start >= 2) {
                first = FORM[str.charCodeAt(start)];
                last = FORM[str.charCodeAt(i - 1)];
                if (first === "i") { r.logicalScore++; }
                if (last === "f") { r.logicalScore++; }
                if (first === "f") { r.visualScore++; }
                if (last === "i") { r.visualScore++; }
            }
        }
    }

    /* Remet en ordre logique une ligne stockée en ordre visuel : inversion
     * complète, puis ré-inversion des séquences LTR (latin, nombres) et
     * permutation des parenthèses. Longueur conservée.
     * Restores logical order of a visual-order line: full reversal, then the
     * LTR runs (Latin, numbers) are reversed back and brackets swapped.
     * Length is preserved. */
    function reverseVisualLine(line) {
        var chars = line.split("").reverse(), out = [], i = 0, n = chars.length, j, run, c;
        while (i < n) {
            c = chars[i].charCodeAt(0);
            if (isLtrRunChar(c)) {
                j = i;
                // étend la séquence : caractères LTR + séparateurs internes
                while (j < n) {
                    var cj = chars[j].charCodeAt(0);
                    if (isLtrRunChar(cj)) { j++; continue; }
                    if ((isLtrJoiner(cj) || cj === 0x20) && j + 1 < n &&
                        isLtrRunChar(chars[j + 1].charCodeAt(0)) &&
                        !(cj === 0x20 && !isLatinLetter(chars[j + 1].charCodeAt(0)))) { j++; continue; }
                    break;
                }
                run = chars.slice(i, j).reverse();
                for (var k = 0; k < run.length; k++) { out.push(run[k]); }
                i = j;
            } else {
                out.push(MIRROR.hasOwnProperty(chars[i]) ? MIRROR[chars[i]] : chars[i]);
                i++;
            }
        }
        return out.join("");
    }

    /* Inverse chaque ligne d'un paragraphe (séparateurs \r \n \u0003 \u2028
     * conservés à leur place). / Reverses each line, keeping separators. */
    function reverseVisualText(str) {
        var out = "", line = "", i, ch;
        for (i = 0; i < str.length; i++) {
            ch = str.charAt(i);
            if (ch === "\r" || ch === "\n" || ch === "\u0003" || ch === "\u2028") {
                out += reverseVisualLine(line) + ch;
                line = "";
            } else {
                line += ch;
            }
        }
        return out + reverseVisualLine(line);
    }

    /* Remplacement d'un caractère de présentation par ses lettres de base
     * (null si aucun). / Base-letter replacement for one char, or null. */
    function deshapeChar(ch) {
        var c = ch.charCodeAt(0);
        return MAP.hasOwnProperty(c) ? MAP[c] : null;
    }
    function deshape(str) {
        var out = "", i, rep;
        for (i = 0; i < str.length; i++) {
            rep = deshapeChar(str.charAt(i));
            out += rep === null ? str.charAt(i) : rep;
        }
        return out;
    }

    return {
        analyse: analyse,
        reverseVisualLine: reverseVisualLine,
        reverseVisualText: reverseVisualText,
        deshapeChar: deshapeChar,
        deshape: deshape,
        isPresentationForm: isPresentationForm,
        tableSize: function () { var n = 0, k; for (k in MAP) { if (MAP.hasOwnProperty(k)) { n++; } } return n; }
    };
})();

/* =========================================================================
 * 2. PARTIE ILLUSTRATOR / ILLUSTRATOR PART
 * ========================================================================= */
var RTLFix = (function () {
    var LANG = (function () { try { return app.locale.indexOf("fr") === 0 ? "fr" : "en"; } catch (e) { return "fr"; } })();
    function T(fr, en) { return LANG === "fr" ? fr : en; }

    function sameEnum(a, b) {
        try { if (a == b) { return true; } } catch (e) {}
        return String(a) === String(b);
    }

    /* Objet visible et déverrouillé, parents compris / Editable, incl. parents */
    function isEditable(item) {
        var p = item;
        try {
            while (p && p.typename !== "Document") {
                if (p.typename === "Layer") {
                    if (p.locked || !p.visible) { return false; }
                } else {
                    if (p.locked || p.hidden) { return false; }
                }
                p = p.parent;
            }
        } catch (e) { return false; }
        return true;
    }

    function collectFromItems(items, out) {
        var i, it;
        for (i = 0; i < items.length; i++) {
            it = items[i];
            if (!it) { continue; }
            if (it.typename === "TextFrame") { out.push(it); }
            else if (it.typename === "GroupItem") { collectFromItems(it.pageItems, out); }
            else if (it.typename === "TextRange") {
                try { var fr = it.story.textFrames; for (var k = 0; k < fr.length; k++) { out.push(fr[k]); } } catch (e1) {}
            }
        }
    }

    /* Blocs de texte selon la portée / Text frames for the chosen scope */
    function getFrames(doc, scope) {
        var raw = [], out = [], seen = {}, i, f, key;
        if (scope === 2) {
            var sel = doc.selection;
            if (sel && sel.typename === "TextRange") { collectFromItems([sel], raw); }
            else if (sel && sel.length) { collectFromItems(sel, raw); }
        } else {
            for (i = 0; i < doc.textFrames.length; i++) {
                f = doc.textFrames[i];
                if (scope === 1 && !isInLayer(f, doc.activeLayer)) { continue; }
                raw.push(f);
            }
        }
        for (i = 0; i < raw.length; i++) {
            f = raw[i];
            if (!isEditable(f)) { continue; }
            key = null;
            try { key = f.uuid; } catch (e3) {}
            if (key) { if (seen[key]) { continue; } seen[key] = true; }
            out.push(f);
        }
        return out;
    }
    function isInLayer(item, layer) {
        var p = item;
        try { while (p && p.typename !== "Document") { if (p === layer) { return true; } p = p.parent; } } catch (e) {}
        return false;
    }

    /* Applique une propriété de paragraphe en contournant la règle « valeur
     * égale au style appliqué = ignorée ». / Sets a paragraph attribute,
     * working around "same value as applied style is ignored". */
    function setParaAttr(para, prop, value, opposite) {
        var pa = para.paragraphAttributes;
        try { pa[prop] = value; } catch (e) {}
        if (sameEnum(para.paragraphAttributes[prop], value)) { return true; }
        if (opposite === undefined) { return false; }
        var style = null, orig;
        try { style = para.paragraphStyles[0]; } catch (e1) {}
        if (!style) { return false; }
        try {
            orig = style.paragraphAttributes[prop];
            style.paragraphAttributes[prop] = opposite;
            try { para.paragraphAttributes[prop] = value; } catch (e2) {}
            style.paragraphAttributes[prop] = orig;
        } catch (e3) { return false; }
        return sameEnum(para.paragraphAttributes[prop], value);
    }

    /* Diagnostic d'un paragraphe / One paragraph diagnosis */
    function diagnose(para, opts) {
        var txt = "";
        try { txt = para.contents; } catch (e) { return null; }
        if (!txt) { return null; }
        var a = RTLCore.analyse(txt);
        if (!a.hasRtl) { return null; }
        var pa = para.paragraphAttributes, issues = {}, any = false;
        try {
            if (!sameEnum(pa.composerEngine, ComposerEngineType.optycaComposer)) { issues.composer = true; any = true; }
        } catch (e1) {}
        if (a.rtlDominant) {
            try {
                if (!sameEnum(pa.paragraphDirection, ParagraphDirectionType.RIGHT_TO_LEFT_DIRECTION)) { issues.direction = true; any = true; }
            } catch (e2) {}
            try {
                var want = langFor(a.script);
                if (want !== null && !sameEnum(para.characterAttributes.language, want)) { issues.language = true; any = true; }
            } catch (e3) {}
            if (opts.alignRight) {
                try { if (sameEnum(pa.justification, Justification.LEFT)) { issues.align = true; any = true; } } catch (e4) {}
            }
        }
        if (a.presentation > 0) { issues.presentation = true; any = true; }
        if (a.visualOrder) { issues.visual = true; any = true; }
        return { analysis: a, issues: issues, any: any, text: txt };
    }
    function langFor(script) {
        try {
            if (script === "arabic" && LanguageType.ARABIC !== undefined) { return LanguageType.ARABIC; }
            if (script === "hebrew" && LanguageType.HEBREW !== undefined) { return LanguageType.HEBREW; }
        } catch (e) {}
        return null;
    }

    /* Réécrit le texte d'une plage caractère par caractère pour garder la mise
     * en forme (seulement quand la longueur ne change pas).
     * Rewrites a range char by char to keep formatting (same length only). */
    function rewriteSameLength(para, oldTxt, newTxt) {
        var chars = para.characters, i;
        if (chars.length !== oldTxt.length || oldTxt.length !== newTxt.length) { return false; }
        for (i = 0; i < newTxt.length; i++) {
            if (oldTxt.charAt(i) !== newTxt.charAt(i)) { chars[i].contents = newTxt.charAt(i); }
        }
        return true;
    }
    /* Remplace les formes de présentation à partir de la fin (les ligatures
     * allongent le texte). / Replaces presentation forms from the end. */
    function deshapeRange(para, txt) {
        var chars = para.characters, n = 0, i, rep;
        if (chars.length !== txt.length) { return -1; }
        for (i = txt.length - 1; i >= 0; i--) {
            rep = RTLCore.deshapeChar(txt.charAt(i));
            if (rep !== null) { chars[i].contents = rep; n++; }
        }
        return n;
    }

    function scan(doc, opts) {
        var frames = getFrames(doc, opts.scope), res = { frames: frames.length, rtlFrames: 0, paras: 0,
            composer: 0, direction: 0, language: 0, align: 0, presentation: 0, visual: 0,
            problemFrames: [], list: [] }, i, j, f, paras, d, hasIssue, hasRtl;
        for (i = 0; i < frames.length; i++) {
            f = frames[i];
            hasIssue = false; hasRtl = false;
            try { paras = f.paragraphs; } catch (e) { continue; }
            for (j = 0; j < paras.length; j++) {
                d = diagnose(paras[j], opts);
                if (!d) { continue; }
                hasRtl = true; res.paras++;
                if (d.any) {
                    hasIssue = true;
                    for (var k in d.issues) { if (d.issues.hasOwnProperty(k)) { res[k]++; } }
                    res.list.push({ frame: f, frameIndex: i, index: j, d: d });
                }
            }
            if (hasRtl) { res.rtlFrames++; }
            if (hasIssue) { res.problemFrames.push(f); }
        }
        return res;
    }

    function summary(r) {
        return T("Blocs de texte examinés : ", "Text frames scanned: ") + r.frames + "\n" +
            T("Blocs avec arabe/hébreu : ", "Frames with Arabic/Hebrew: ") + r.rtlFrames +
            T(" (paragraphes : ", " (paragraphs: ") + r.paras + ")\n" +
            T("Blocs à corriger : ", "Frames needing fixes: ") + r.problemFrames.length + "\n\n" +
            T("Composeur non Moyen-Orient (lettres non liées) : ", "Non Middle Eastern composer (unjoined letters): ") + r.composer + "\n" +
            T("Sens de paragraphe gauche→droite : ", "Left-to-right paragraph direction: ") + r.direction + "\n" +
            T("Langue non arabe/hébreu : ", "Language not Arabic/Hebrew: ") + r.language + "\n" +
            T("Alignés à gauche (option) : ", "Left aligned (option): ") + r.align + "\n" +
            T("Formes de présentation (collé depuis un PDF) : ", "Presentation forms (pasted from PDF): ") + r.presentation + "\n" +
            T("Texte probablement stocké à l'envers : ", "Text probably stored backwards: ") + r.visual;
    }

    function apply(doc, opts) {
        var r = scan(doc, opts), done = { composer: 0, direction: 0, language: 0, digits: 0, align: 0,
            presentation: 0, visual: 0, failed: 0, skipped: 0 }, i, it, para, d, a, ok;
        // Ordre inverse : les modifications de contenu ne décalent pas les autres paragraphes
        // Reverse order so content edits don't shift other paragraphs
        for (i = r.list.length - 1; i >= 0; i--) {
            it = r.list[i];
            try { para = it.frame.paragraphs[it.index]; } catch (e) { done.failed++; continue; }
            d = it.d; a = d.analysis;
            // 1. Ordre visuel -> logique (avant le décomposage : même longueur)
            if (opts.fixVisual && d.issues.visual) {
                if (rewriteSameLength(para, d.text, RTLCore.reverseVisualText(d.text))) { done.visual++; }
                else { done.skipped++; }
                try { d.text = para.contents; } catch (e1) {}
            }
            // 2. Formes de présentation -> lettres de base
            if (opts.fixPresentation && d.issues.presentation) {
                var n = deshapeRange(para, d.text);
                if (n >= 0) { done.presentation++; } else { done.skipped++; }
            }
            // 3. Composeur Moyen-Orient + toutes lignes / ligne par ligne
            if (opts.fixComposer) {
                try {
                    if (d.issues.composer) {
                        ok = setParaAttr(para, "composerEngine", ComposerEngineType.optycaComposer, ComposerEngineType.latinCJKComposer);
                        if (ok) { done.composer++; } else { done.failed++; }
                    }
                    if (opts.everyLine !== 0) { para.paragraphAttributes.everyLineComposer = (opts.everyLine === 1); }
                } catch (e2) { done.failed++; }
            }
            if (a.rtlDominant) {
                // 4. Sens du paragraphe
                if (opts.fixDirection && d.issues.direction) {
                    ok = setParaAttr(para, "paragraphDirection", ParagraphDirectionType.RIGHT_TO_LEFT_DIRECTION,
                        ParagraphDirectionType.LEFT_TO_RIGHT_DIRECTION);
                    if (ok) { done.direction++; } else { done.failed++; }
                }
                // 5. Langue
                if (opts.fixLanguage && d.issues.language) {
                    try { para.characterAttributes.language = langFor(a.script); done.language++; } catch (e3) { done.failed++; }
                }
                // 6. Alignement à droite
                if (opts.alignRight && d.issues.align) {
                    try { para.paragraphAttributes.justification = Justification.RIGHT; done.align++; } catch (e4) { done.failed++; }
                }
            }
            // 7. Jeu de chiffres (arabe seulement)
            if (opts.digits > 0 && a.arabic > 0) {
                try {
                    para.characterAttributes.digitSet = [null, DigitSetType.ARABIC_DIGITS,
                        DigitSetType.HINDI_DIGITS, DigitSetType.FARSI_DIGITS][opts.digits];
                    done.digits++;
                } catch (e5) { done.failed++; }
            }
        }
        // Le jeu de chiffres s'applique aussi aux paragraphes sans autre problème
        if (opts.digits > 0) { done.digits += applyDigitsToClean(doc, opts, r); }
        return { scan: r, done: done };
    }
    function applyDigitsToClean(doc, opts, r) {
        var frames = getFrames(doc, opts.scope), n = 0, i, j, paras, txt, a, listed = {};
        for (i = 0; i < r.list.length; i++) { listed[r.list[i].frameIndex + ":" + r.list[i].index] = true; }
        for (i = 0; i < frames.length; i++) {
            try { paras = frames[i].paragraphs; } catch (e) { continue; }
            for (j = 0; j < paras.length; j++) {
                if (listed[i + ":" + j]) { continue; }
                try { txt = paras[j].contents; } catch (e1) { continue; }
                if (!txt) { continue; }
                a = RTLCore.analyse(txt);
                if (a.arabic === 0) { continue; }
                try {
                    paras[j].characterAttributes.digitSet = [null, DigitSetType.ARABIC_DIGITS,
                        DigitSetType.HINDI_DIGITS, DigitSetType.FARSI_DIGITS][opts.digits];
                    n++;
                } catch (e2) {}
            }
        }
        return n;
    }

    function selectFrames(doc, frames) {
        try { doc.selection = null; } catch (e) {}
        for (var i = 0; i < frames.length; i++) { try { frames[i].selected = true; } catch (e1) {} }
    }

    /* Boîte de dialogue / Dialog */
    function dialog(doc) {
        var w = new Window("dialog", T("Réparer le texte arabe / hébreu (RTL)", "Repair Arabic / Hebrew text (RTL)"));
        w.orientation = "column"; w.alignChildren = "fill";

        var pScope = w.add("panel", undefined, T("Portée", "Scope"));
        pScope.orientation = "row";
        var rbDoc = pScope.add("radiobutton", undefined, T("Document", "Document"));
        var rbLay = pScope.add("radiobutton", undefined, T("Calque actif", "Active layer"));
        var rbSel = pScope.add("radiobutton", undefined, T("Sélection", "Selection"));
        var hasSel = doc.selection && (doc.selection.length > 0 || doc.selection.typename === "TextRange");
        (hasSel ? rbSel : rbDoc).value = true;

        var pFix = w.add("panel", undefined, T("Corrections", "Fixes"));
        pFix.alignChildren = "left";
        var cbComp = pFix.add("checkbox", undefined, T("Composeur Moyen-Orient (lie les lettres arabes)", "Middle Eastern composer (joins Arabic letters)"));
        cbComp.value = true;
        var gEL = pFix.add("group");
        gEL.add("statictext", undefined, T("   Mode du composeur :", "   Composer mode:"));
        var ddEL = gEL.add("dropdownlist", undefined, [T("Ne pas changer", "Keep"), T("Toutes les lignes", "Every-line"), T("Ligne par ligne", "Single-line")]);
        ddEL.selection = 0;
        var cbDir = pFix.add("checkbox", undefined, T("Sens droite→gauche pour les paragraphes majoritairement RTL", "Right-to-left direction for mostly-RTL paragraphs"));
        cbDir.value = true;
        var cbLang = pFix.add("checkbox", undefined, T("Langue arabe / hébreu (césure, orthographe)", "Arabic / Hebrew language (hyphenation, spelling)"));
        cbLang.value = true;
        var cbAlign = pFix.add("checkbox", undefined, T("Aligner à droite les paragraphes RTL alignés à gauche", "Right-align RTL paragraphs that are left-aligned"));
        cbAlign.value = false;
        var gDig = pFix.add("group");
        gDig.add("statictext", undefined, T("Chiffres (texte arabe) :", "Digits (Arabic text):"));
        var ddDig = gDig.add("dropdownlist", undefined, [T("Ne pas changer", "Keep"), T("Arabes 0123", "Arabic 0123"),
            T("Hindi \u0660\u0661\u0662\u0663", "Hindi \u0660\u0661\u0662\u0663"), T("Farsi \u06F0\u06F1\u06F2\u06F3", "Farsi \u06F0\u06F1\u06F2\u06F3")]);
        ddDig.selection = 0;

        var pPdf = w.add("panel", undefined, T("Texte collé depuis un PDF (modifie le contenu)", "Text pasted from a PDF (changes contents)"));
        pPdf.alignChildren = "left";
        var cbPres = pPdf.add("checkbox", undefined, T("Convertir les formes de présentation en lettres normales", "Convert presentation forms to normal letters"));
        cbPres.value = true;
        var cbVis = pPdf.add("checkbox", undefined, T("Remettre à l'endroit le texte stocké à l'envers", "Restore text stored backwards"));
        cbVis.value = true;
        pPdf.add("statictext", undefined, T("Détection par la forme des lettres en début et fin de mot.", "Detected from letter shapes at word start and end."));

        var report = w.add("edittext", undefined, T("Cliquez sur Analyser pour voir le diagnostic (aucune modification).",
            "Click Analyse to see the diagnosis (no changes)."), { multiline: true, readonly: true });
        report.preferredSize = [460, 170];

        var gB = w.add("group"); gB.alignment = "right";
        var bAna = gB.add("button", undefined, T("Analyser", "Analyse"));
        var bSel = gB.add("button", undefined, T("Sélectionner les blocs à corriger", "Select frames to fix"));
        var bCancel = gB.add("button", undefined, T("Annuler", "Cancel"), { name: "cancel" });
        var bOk = gB.add("button", undefined, T("Appliquer", "Apply"), { name: "ok" });
        w.add("statictext", undefined, T("Conseil : travaillez sur une copie. Ctrl+Z / Cmd+Z annule.", "Tip: work on a copy. Ctrl+Z / Cmd+Z undoes."));

        function readOpts() {
            return { scope: rbSel.value ? 2 : (rbLay.value ? 1 : 0),
                fixComposer: cbComp.value, everyLine: ddEL.selection.index,
                fixDirection: cbDir.value, fixLanguage: cbLang.value, alignRight: cbAlign.value,
                digits: ddDig.selection.index, fixPresentation: cbPres.value, fixVisual: cbVis.value };
        }
        cbComp.onClick = function () { ddEL.enabled = cbComp.value; };
        bAna.onClick = function () { report.text = summary(scan(doc, readOpts())); };
        var action = 0;
        bSel.onClick = function () { action = 2; w.close(1); };
        bOk.onClick = function () { action = 1; w.close(1); };
        if (w.show() !== 1) { return null; }
        var o = readOpts(); o.action = action;
        return o;
    }

    function run() {
        if (app.documents.length === 0) {
            alert(T("Aucun document ouvert. Ouvrez un document puis relancez le script.", "No document open. Open a document and run the script again."));
            return;
        }
        var doc = app.activeDocument;
        if (doc.textFrames.length === 0) {
            alert(T("Ce document ne contient aucun texte.", "This document has no text."));
            return;
        }
        var opts = dialog(doc);
        if (!opts) { return; }
        if (opts.scope === 2) {
            var tmp = getFrames(doc, 2);
            if (tmp.length === 0) {
                alert(T("Rien n'est sélectionné (ou la sélection ne contient aucun texte modifiable).",
                    "Nothing is selected (or the selection holds no editable text)."));
                return;
            }
        }
        if (opts.action === 2) {
            var r0 = scan(doc, opts);
            selectFrames(doc, r0.problemFrames);
            alert(summary(r0));
            return;
        }
        var res = apply(doc, opts), d = res.done;
        try { app.redraw(); } catch (e) {}
        alert(T("Terminé.", "Done.") + "\n\n" +
            T("Composeur corrigé : ", "Composer fixed: ") + d.composer + "\n" +
            T("Sens RTL appliqué : ", "RTL direction set: ") + d.direction + "\n" +
            T("Langue appliquée : ", "Language set: ") + d.language + "\n" +
            T("Alignés à droite : ", "Right-aligned: ") + d.align + "\n" +
            T("Chiffres réglés : ", "Digits set: ") + d.digits + "\n" +
            T("Formes de présentation converties : ", "Presentation forms converted: ") + d.presentation + "\n" +
            T("Texte remis à l'endroit : ", "Text restored to logical order: ") + d.visual + "\n" +
            T("Ignorés (structure inattendue) : ", "Skipped (unexpected structure): ") + d.skipped + "\n" +
            T("Échecs : ", "Failures: ") + d.failed + "\n\n" +
            T("Paragraphes concernés : ", "Paragraphs involved: ") + res.scan.list.length);
    }

    return { run: run };
})();

if (typeof app !== "undefined" && typeof Window !== "undefined") {
    try { RTLFix.run(); } catch (err) { alert("ReparerTexteArabeRTL : " + err + (err.line ? " (ligne " + err.line + ")" : "")); }
}
