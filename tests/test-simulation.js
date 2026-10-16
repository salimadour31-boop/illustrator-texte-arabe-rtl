var fs = require('fs');
var src = fs.readFileSync(process.argv[2] || __dirname + '/../ReparerTexteArabeRTL.jsx', 'utf8').replace(/^#.*$/mg, '');
global.ComposerEngineType = { latinCJKComposer: 'latin', optycaComposer: 'optyca', adornment: 'adorn' };
global.ParagraphDirectionType = { LEFT_TO_RIGHT_DIRECTION: 'LTR', RIGHT_TO_LEFT_DIRECTION: 'RTL' };
global.LanguageType = { ARABIC: 'ar', HEBREW: 'he', FRENCH: 'fr' };
global.Justification = { LEFT: 'L', RIGHT: 'R' };
global.DigitSetType = { ARABIC_DIGITS: 'd0', HINDI_DIGITS: 'd1', FARSI_DIGITS: 'd2' };
global.app = { locale: 'fr_FR' };
var alerts = []; global.alert = function (m) { alerts.push(m); };
// Paragraph mock: setting paragraphDirection equal to the style value is ignored (Illustrator quirk)
function Para(text, style) {
  var self = this; this._t = text.split('');
  this.paragraphStyles = [style];
  var pa = { composerEngine: 'latin', justification: 'L', everyLineComposer: true };
  var dir = 'LTR';
  Object.defineProperty(pa, 'paragraphDirection', { get: function () { return dir; },
    set: function (v) { if (v === style.paragraphAttributes.paragraphDirection) return; dir = v; } });
  this.paragraphAttributes = pa; this.characterAttributes = { language: 'fr', digitSet: null };
  Object.defineProperty(this, 'contents', { get: function () { return self._t.join(''); } });
  Object.defineProperty(this, 'characters', { get: function () {
    var arr = self._t.map(function (c, i) { var o = {}; Object.defineProperty(o, 'contents', {
      get: function () { return self._t[i]; }, set: function (v) { self._t[i] = v; } }); return o; });
    return arr; } });
}
var style = { paragraphAttributes: { paragraphDirection: 'RTL', composerEngine: 'latin' } };
function u() { var s = ''; for (var i = 0; i < arguments.length; i++) s += String.fromCharCode(arguments[i]); return s; }
function rev(s){return s.split('').reverse().join('');}
var naam = u(0xFEE7,0xFECC,0xFEE2), kutub = u(0xFEDB,0xFE98,0xFE90);
var p1 = new Para('2026 ' + rev(naam) + ' ' + rev(kutub), style);       // PDF paste, reversed
var p2 = new Para('\u0633\u0644\u0627\u0645 \u0639\u0644\u064A\u0643\u0645', style); // clean Arabic, wrong composer
var p3 = new Para('Bonjour tout le monde', style);                        // Latin only
var p4 = new Para('Le mot \u0633\u0644\u0627\u0645', style);              // mixed, Latin dominant
var layer = { typename: 'Layer', locked: false, visible: true, parent: { typename: 'Document' } };
var fA = { typename: 'TextFrame', locked: false, hidden: false, parent: layer, uuid: 'a', paragraphs: [p1, p2] };
var fB = { typename: 'TextFrame', locked: false, hidden: false, parent: layer, uuid: 'b', paragraphs: [p3, p4] };
var fC = { typename: 'TextFrame', locked: true, hidden: false, parent: layer, uuid: 'c', paragraphs: [new Para('\u0633', style)] };
var doc = { typename: 'Document', textFrames: [fA, fB, fC], activeLayer: layer, selection: [] };
layer.parent = doc;
global.Window = function () { throw new Error('no UI in mock'); };
eval(src.replace('var RTLCore =', 'RTLCore =').replace('var RTLFix = (function () {', 'RTLFix = (function () {').replace('return { run: run };', 'return { run: run, scan: scan, apply: apply, summary: summary };'));
var pass = 0, fail = 0; function eq(n, a, b) { if (a === b) pass++; else { fail++; console.log('FAIL', n, JSON.stringify(a), JSON.stringify(b)); } }
var opts = { scope: 0, fixComposer: true, everyLine: 1, fixDirection: true, fixLanguage: true, alignRight: true, digits: 2, fixPresentation: true, fixVisual: true };
var s = RTLFix.scan(doc, opts);
eq('frames scanned (locked skipped)', s.frames, 2);
eq('rtl paras', s.paras, 3);
eq('composer issues', s.composer, 3);
eq('direction issues', s.direction, 2);
eq('visual issues', s.visual, 1);
eq('presentation issues', s.presentation, 1);
console.log(RTLFix.summary(s));
var r = RTLFix.apply(doc, opts);
eq('p1 fixed text', p1.contents, '\u0643\u062A\u0628 \u0646\u0639\u0645 2026');
eq('p1 composer', p1.paragraphAttributes.composerEngine, 'optyca');
eq('p1 direction via style workaround', p1.paragraphAttributes.paragraphDirection, 'RTL');
eq('style restored', style.paragraphAttributes.paragraphDirection, 'RTL');
eq('p2 lang', p2.characterAttributes.language, 'ar');
eq('p2 aligned right', p2.paragraphAttributes.justification, 'R');
eq('p2 digits hindi (index 2)', p2.characterAttributes.digitSet, 'd1');
eq('p3 untouched', p3.paragraphAttributes.composerEngine, 'latin');
eq('p4 composer ME (has Arabic)', p4.paragraphAttributes.composerEngine, 'optyca');
eq('p4 direction kept LTR', p4.paragraphAttributes.paragraphDirection, 'LTR');
eq('p4 language kept', p4.characterAttributes.language, 'fr');
eq('locked untouched', fC.paragraphs[0].paragraphAttributes.composerEngine, 'latin');
eq('no failures', r.done.failed, 0);
var s2 = RTLFix.scan(doc, opts);
eq('rescan clean', s2.problemFrames.length, 0);
console.log(pass + ' passed, ' + fail + ' failed'); process.exit(fail ? 1 : 0);
