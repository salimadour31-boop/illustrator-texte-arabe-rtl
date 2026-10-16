# Réparer le texte arabe / hébreu (RTL) — script Adobe Illustrator

**ReparerTexteArabeRTL.jsx** v1.0.0 — diagnostique et répare en lot le texte arabe et hébreu d'un document Illustrator.
*Batch-diagnoses and repairs Arabic and Hebrew text in an Illustrator document (FR/EN dialog).*

## Ce que fait le script

Il parcourt les blocs de texte (document, calque actif ou sélection), repère chaque paragraphe qui contient de l'arabe ou de l'hébreu, puis signale et corrige :

- **le composeur** : les paragraphes qui ne sont pas sur le composeur Moyen-Orient et Asie du Sud, cause des lettres arabes non liées ; le mode toutes les lignes ou ligne par ligne peut être imposé ;
- **le sens du paragraphe** : droite à gauche pour les paragraphes majoritairement arabes ou hébreux (les paragraphes surtout latins qui contiennent quelques mots arabes gardent leur sens) ;
- **la langue** : arabe ou hébreu, pour la césure et l'orthographe ;
- **l'alignement** (option) : aligne à droite les paragraphes RTL restés alignés à gauche ;
- **les chiffres** (option) : arabes 0123, hindi ٠١٢٣ ou farsi ۰۱۲۳ pour tout le texte arabe ;
- **le texte collé depuis un PDF** : convertit les formes de présentation Unicode (U+FB50–U+FDFF, U+FE70–U+FEFE, 731 caractères, ligatures comprises) en lettres normales, et remet à l'endroit le texte stocké en ordre visuel (inversé). L'inversion est détectée d'après la forme des lettres en début et en fin de mot ; les nombres et mots latins gardent leur ordre et les parenthèses sont permutées.

Le bouton **Analyser** affiche le diagnostic sans rien modifier, et **Sélectionner les blocs à corriger** sélectionne les blocs concernés. Les blocs verrouillés ou masqués, et ceux des calques verrouillés ou masqués, sont ignorés. Le texte est réécrit caractère par caractère pour garder la mise en forme.

Une particularité d'Illustrator ignore un sens de paragraphe égal à celui du style appliqué. Le script contourne ce problème en basculant brièvement le style, puis en le restaurant. L'idée de ce contournement a été décrite par sttk3 sur Adobe Community ; elle est réimplémentée ici.

## Pourquoi c'est nouveau

Vérifié le 16 octobre 2026 :

- **Illustrator** n'a pas de fonction native qui trouve les textes arabes mal composés dans tout un document ; il faut changer le composeur et le sens à la main, bloc par bloc, et il ne sait pas réparer le texte collé depuis un PDF.
- **Adobe Community** : plusieurs questions restent sans outil complet (« How can I access RTL LTR text direction property in scripting? », « Correcting inverted Arabic text in Illustrator using ExtendScript »). On n'y trouve que des extraits de quelques lignes qui forcent le sens sur la sélection.
- **GitHub** : aucun dépôt de script Illustrator dédié à l'arabe ou au RTL (recherche « illustrator arabic script jsx »). Les recherches de code sur `optycaComposer` et `RIGHT_TO_LEFT_DIRECTION` ne montrent que des fichiers d'autocomplétion, des scripts InDesign, des bibliothèques Adobe internes et un serveur MCP générique, qui n'analyse ni ne répare rien.
- **arabic-repair** (Python) répare le texte PDF en ordre visuel, mais hors d'Illustrator, et sans toucher au composeur, au sens ni à la mise en forme.
- Les catalogues de scripts connus (creold, Hiroyuki Sato, John Wundes, Alexander Ladygin, wckdtall, Kelso Cartography) ne proposent rien sur le texte RTL.

## Installation

- **Ponctuelle** : Fichier > Scripts > Autre script…, puis choisir `ReparerTexteArabeRTL.jsx`.
- **Permanente** : copier le fichier dans le dossier `Presets/<langue>/Scripts` d'Illustrator (par exemple `Adobe Illustrator 2026/Presets/fr_FR/Scripts`), puis redémarrer Illustrator. Le script apparaît dans Fichier > Scripts.

Pour voir les options Moyen-Orient dans les panneaux, activez Préférences > Texte > Afficher les options indiennes (ou Moyen-Orient selon la version).

## Utilisation

1. Ouvrez une **copie** de votre document.
2. Sélectionnez des blocs de texte, ou rien pour traiter tout le document.
3. Lancez le script, choisissez la portée et les corrections, puis cliquez sur **Analyser**.
4. Cliquez sur **Appliquer**. Ctrl+Z / Cmd+Z annule les changements.

## Version cible et statut des tests

- Cible : Adobe Illustrator CC 2018 et plus récent (ExtendScript, Windows et macOS).
- **Non testé dans Illustrator.**
- Syntaxe vérifiée avec acorn en mode ES3.
- Logique texte vérifiée sur données simulées (`tests/test-logique.js`, 22 tests : détection, inversion, nombres, parenthèses, lignes multiples, ligatures).
- Diagnostic et corrections vérifiés sur objets Illustrator simulés (`tests/test-simulation.js`, 20 tests, dont le contournement du style de paragraphe). Ces simulations ne remplacent pas un essai réel.

Limites : un texte arabe inversé sans formes de présentation ne peut pas être détecté de façon fiable ; les paragraphes dont la structure de caractères est inattendue sont ignorés et comptés dans le résumé.

Aucun appel réseau, aucune collecte de données.

## Licence

MIT © 2026 Amirouche Amwanes — voir [LICENSE](LICENSE).
