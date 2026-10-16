var fs = require('fs'), acorn = require('acorn');
var src = fs.readFileSync(process.argv[2] || __dirname + '/../ReparerTexteArabeRTL.jsx', 'utf8').replace(/^#.*$/mg, '');
acorn.parse(src, { ecmaVersion: 3 }); console.log('ES3 parse OK');
var RTLCore; eval(src.replace('var RTLCore =', 'RTLCore ='));
var pass = 0, fail = 0;
function eq(name, a, b) { if (a === b) { pass++; } else { fail++; console.log('FAIL', name, JSON.stringify(a), '!==', JSON.stringify(b)); } }
function u() { var s = ''; for (var i = 0; i < arguments.length; i++) s += String.fromCharCode(arguments[i]); return s; }
var bayt = u(0xFE91,0xFEF4,0xFE96), kutub = u(0xFEDB,0xFE98,0xFE90), naam = u(0xFEE7,0xFECC,0xFEE2);
function rev(s){return s.split('').reverse().join('');}
var logical = bayt + ' ' + kutub + ' ' + naam + ' 2026';
var visual = '2026 ' + rev(naam) + ' ' + rev(kutub) + ' ' + rev(bayt);
eq('table size', RTLCore.tableSize(), 731);
var av = RTLCore.analyse(visual), al = RTLCore.analyse(logical);
eq('visual detected', av.visualOrder, true);
eq('logical not visual', al.visualOrder, false);
eq('rtl dominant', av.rtlDominant, true);
eq('presentation count', av.presentation, 9);
eq('reverse visual', RTLCore.reverseVisualText(visual), logical);
eq('length kept', RTLCore.reverseVisualText(visual).length, visual.length);
eq('deshape', RTLCore.deshape(logical), '\u0628\u064A\u062A \u0643\u062A\u0628 \u0646\u0639\u0645 2026');
eq('lam-alef', RTLCore.deshape(u(0xFEFB)), '\u0644\u0627');
eq('allah lig len>1', RTLCore.deshape(u(0xFDF2)).length > 1, true);
eq('fathatan isolated no space', RTLCore.deshape(u(0xFE70)), '\u064B');
eq('brackets+latin', RTLCore.reverseVisualText('PDF (' + rev(naam) + ')'), '(' + naam + ') PDF');
eq('decimal', RTLCore.reverseVisualText('3.5 ' + rev(naam)), naam + ' 3.5');
eq('multi words latin', RTLCore.reverseVisualText('Adobe Illustrator ' + rev(kutub)), kutub + ' Adobe Illustrator');
eq('multiline', RTLCore.reverseVisualText('12 ' + rev(naam) + '\u0003' + rev(bayt)), naam + ' 12\u0003' + bayt);
var mixed = RTLCore.analyse('Le mot \u0633\u0644\u0627\u0645 en arabe');
eq('mixed hasRtl', mixed.hasRtl, true); eq('mixed not dominant', mixed.rtlDominant, false);
eq('mixed no presentation', mixed.presentation, 0);
var heb = RTLCore.analyse('\u05E9\u05DC\u05D5\u05DD');
eq('hebrew script', heb.script, 'hebrew'); eq('hebrew dominant', heb.rtlDominant, true);
eq('latin only', RTLCore.analyse('Hello world').hasRtl, false);
eq('single-letter words no false visual', RTLCore.analyse(u(0xFE8D) + ' ' + u(0xFE8F)).visualOrder, false);
console.log(pass + ' passed, ' + fail + ' failed'); process.exit(fail ? 1 : 0);
