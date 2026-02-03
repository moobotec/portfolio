/*
Plugin: Code Input Builder
Version: 0.0.25
Author: Daumand David
Website: https://www.timecaps.io
Contact: daumanddavid@gmail.com
Description: Code Input Builder est un plugin jQuery permettant de générer des champs d'input configurables pour la saisie de valeurs numériques (entiers, flottants), de textes, ou de valeurs dans des systèmes spécifiques (binaire, hexadécimal). Il offre des options avancées de personnalisation incluant la gestion des signes, des positions décimales, des limites de valeurs, et des callbacks pour la gestion des changements de valeur.

Fonctionnalités :
- Configuration flexible du type de valeur (entier, flottant, texte, binaire, hexadécimal, lettre)
- Définition des valeurs initiales, des limites minimales et maximales pour chaque input
- Saisie facilitée avec un focus automatique et un défilement pour ajuster les valeurs
- Gestion des signes (+/-) et des séparateurs pour les décimales
- Callback `onValueChange` pour réagir aux changements de valeurs

Options disponibles:
    - `type`: (string) Définit le type de valeur acceptée par les inputs.
        * Valeurs possibles : 'integer', 'float', 'text', 'binary', 'hexadecimal', 'letter'.
        * Par défaut : 'integer'.

    - `numInputs`: (integer) Nombre total d'inputs affichés.
        * Par défaut : 1.

    - `minValues`: (array) Valeurs minimales pour chaque input. Le tableau doit contenir autant de valeurs que `numInputs`.
        * Par défaut : [] (pas de minimum spécifique pour chaque input).

    - `maxValues`: (array) Valeurs maximales pour chaque input. Utiliser autant de valeurs que `numInputs`.
        * Par défaut : [] (pas de maximum spécifique pour chaque input).

    - `values`: (array) Valeurs initiales pour chaque input. Utiliser autant de valeurs que `numInputs`.
        * Par défaut : [].

    - `defaultValue`: 
      (integer ou float) Valeur par défaut à afficher si aucune valeur initiale n’est définie. 
        * Par défaut : 0.

      (time) Valeur initiale à afficher.
        * Formats acceptés :
          Nombre (integer ou float) : Représente des secondes cumulées. Exemple : 86399.999 (23h 59m 59s 999ms).
          Objet Date : Utilise l'heure actuelle ou une instance spécifique de Date. Exemple : new Date().
          Chaîne formatée (string) : Respecte un format comme HH:MM:SS ou HH:MM:SS.SSS. Exemple : "01:02:25.250".
        * Par défaut : 0.

      (date) Valeur initiale à afficher.
        * Formats acceptés :
          Nombre (integer ou float) : Représente des secondes cumulées.
          Objet Date : Utilise l'heure actuelle ou une instance spécifique de Date. Exemple : new Date().
          Chaîne formatée (string) : Respecte un format comme DD/MM/YYYY.
        * Par défaut : 0.

    - `gap`: (string) Espace entre les inputs, spécifié en pixels (ex. '10px').
        * Par défaut : '10px'.

    - `allowSign`: (boolean) Permet d'ajouter un signe (+ ou -) devant la valeur.
        * Par défaut : false.

    - `defaultSign`: (string) Signe par défaut si `allowSign` est activé.
        * Valeurs possibles : '+' ou '-'.
        * Par défaut : '+'.

    - `decimalPosition`: (integer) Position du séparateur décimal dans le cas d’un `type` float.
        * Par défaut : 1.

    - `separator`: (string) Caractère à utiliser comme séparateur pour les décimales (ex. '.').
        * Par défaut : '.'.

    - `totalMax`: (number) Valeur maximale autorisée pour la somme de tous les inputs.
        * Par défaut : null (pas de limite).

    - `totalMin`: (number) Valeur minimale autorisée pour la somme de tous les inputs.
        * Par défaut : null (pas de limite).

    - `onValueChange`: (function) Fonction callback exécutée lorsque la valeur change. Reçoit deux paramètres : `$input` (l'élément input) et `newValue` (la nouvelle valeur).
        * Par défaut : null.

    - `allowScroll`: (boolean) Active ou désactive la fonctionnalité de défilement pour ajuster les valeurs des inputs.
        * Par défaut : true.

    - `scrollSensitivity`: (integer) Définit la sensibilité du défilement, en pixels. Plus la valeur est faible, plus le défilement sera réactif.
        * Par défaut : 50.

    - `requireKeyForScroll`: (string) Touche à enfoncer (par exemple 'Control' ou 'Shift') pour activer le défilement sur les inputs.
        * Valeurs possibles : 'Control', 'Shift', 'Alt', 'Meta'.
        * Par défaut : null (aucune touche requise).

    - `autoFocusNextInput`: (boolean) Active le décalage automatique du focus vers l'input suivant lors de la saisie.
        * Par défaut : false.

    - `autoFocusNextInputDirection`: (string) Détermine la direction du décalage automatique du focus.
        * Valeurs possibles : 'forward', 'right', 'backward', 'left'.
        * Par défaut : null.
        
    - `isDisabled`: (boolean) Permet de désactiver les inputs. Si activé, les champs ne seront pas modifiables par l'utilisateur. Dans le cas d'un CodeInput de type "text" cette option n'est pas utilisable.
        * Par défaut : false.
  
    - `allowArrowKeys`: (boolean) Permet d'active la fonctionnalité de navigation via les touches `ArrowLeft`,`ArrowRight`,`ArrowUp`,`ArrowDown`
      * Par défaut : false.

    - `maskInput`: (boolean) Permet de masquer ou afficher les inputs au format password
      * Par défaut : false.

    - `formatTime`: (string) Format de temps accepté. Exemples : HH:MM:SS
      * Par défaut : HH:MM:SS.SSS.
      * Formats acceptés :
        - `HH`: Heure.
        - `MM`: Minutes.
        - `SS`: Seconde.
        - `SSS`: Milliseconde.

    - `formatDate`: (string) Format de date accepté. Exemples : DD/MM/YYYY
      * Par défaut : DD/MM/YYYY.
      * Formats acceptés :
        - `DD`: Jour.
        - `MM`: Mois (numérique, 1 à 12).
        - `MH`: Mois (en caractères).
        - `YYYY`: Année complète.

    - `defaultLanguage`: (string) Pangue par défaut utilisée pour les noms des mois ou toute autre fonctionnalité nécessitant une localisation. 
        Elle est compatible avec les locales supportées par l'API `Intl.DateTimeFormat` de JavaScript. 
        Liste des locales disponibles - IANA Language Subtag Registry (https://www.iana.org/assignments/language-subtag-registry/language-subtag-registry).
      * Par défaut : 'fr-FR' (français)

    - `hourCycle`: (string) Définit le système horaire à utiliser, soit le format 24 heures (par défaut) ou 12 heures avec gestion AM/PM.
      * Par défaut : '24h'.
   
Usage basique :
    $('#element').codeInputBuilder({
        type: 'float',
        numInputs: 4,
        minValues: [0, 0, 1, 2],
        maxValues: [9, 9, 9, 5],
        defaultSign: '-',
        allowSign: true,
        totalMax: 100,
        allowScroll: true,
        scrollSensitivity: 30,
        requireKeyForScroll: 'Control'
    });

*/
'use strict';

/* istanbul ignore next */
if (typeof jQuery === 'undefined') {
  throw new Error(
    'La bibliothèque jQuery est requise pour que CodeInputBuilder fonctionne. Veuillez inclure jQuery avant de charger cette bibliothèque.'
  );
}

(function ($) {
  function getMonthMapByLocale(locale = 'fr') {
    const formatter = new Intl.DateTimeFormat(locale, { month: 'long' });
    const monthMap = new Map();

    for (let i = 0; i < 12; i++) {
      const date = new Date(2000, i, 1); // Année arbitraire
      const monthName = formatter.format(date).toLowerCase(); // Nom du mois dans la langue choisie
      const formattedNumber = String(i + 1).padStart(2, '0'); // Formatage en deux chiffres
      monthMap.set(monthName, formattedNumber); // Ajoute le mois et le numéro formaté
    }

    return monthMap;
  }

  // Fonction de validation des options
  function initCodeInputBuilderOptions(options) {
    const monthMap = getMonthMapByLocale();

    const defaultOptions = {
      type: 'integer',
      numInputs: 1,
      minValues: [],
      maxValues: [],
      values: [],
      formatTime: 'HH:MM:SS.SSS',
      formatDate: 'DD/MM/YYYY',
      hourCycle: '24h',
      defaultLanguage: 'fr-FR',
      defaultValue: 0,
      allowSign: false,
      defaultSign: '+',
      decimalPosition: 1,
      separator: '.',
      totalMax: null,
      totalMin: null,
      onValueChange: null,
      allowScroll: true,
      scrollSensitivity: 50,
      requireKeyForScroll: null,
      autoFocusNextInput: false,
      autoFocusNextInputDirection: null,
      gap: '10px',
      isDisabled: false,
      allowArrowKeys: false,
      maskInput: false,
      months: Array.from(monthMap.keys()),
      monthMap: monthMap,
    };

    const settings = $.extend({}, defaultOptions, options);

    function validateType(type) {
      if (
        ![
          'integer',
          'float',
          'text',
          'binary',
          'hexadecimal',
          'letter',
          'time',
          'date',
        ].includes(type)
      ) {
        throw new Error(
          "Option 'type' invalide. Valeurs autorisées : 'integer', 'float', 'text','binary', 'hexadecimal', 'letter', time, date."
        );
      }
    }

    function validateDateTimeFormat(type) {
      const formatValidators = {
        date: {
          format: settings.formatDate,
          isValid: isValidDateFormat,
          errorMessage: `Le format '${settings.formatDate}' est invalide. Utilisez un format valide comme 'DD/MM/YYYY' ou 'DD|MM|YYYY' ou 'DD|MH|YYYY' ou 'DD/MH.`,
        },
        time: {
          format: settings.formatTime,
          isValid: isValidTimeFormat,
          errorMessage: `Le format '${settings.formatTime}' est invalide. Utilisez un format valide comme 'HH:MM:SS.SSS' ou 'HH|MM|SS'.`,
        },
      };

      const validator = formatValidators[type];
      if (validator && !validator.isValid(validator.format)) {
        throw new Error(validator.errorMessage);
      }
    }

    function validateMaskInput(maskInput) {
      if (typeof maskInput !== 'boolean') {
        throw new Error("Option 'maskInput' doit être un booléen.");
      }
    }

    function validateNumInputs(numInputs) {
      if (typeof numInputs !== 'number' || numInputs < 1) {
        throw new Error("Option 'numInputs' doit être un entier positif.");
      }
    }

    function validateMinValues(type, minValues, numInputs) {
      if (
        type !== 'text' &&
        Array.isArray(minValues) &&
        minValues.length > 0 &&
        minValues.length !== numInputs
      ) {
        throw new Error(
          "'minValues' doit contenir autant d'éléments que 'numInputs'."
        );
      }
    }

    function validateMaxValues(type, maxValues, numInputs) {
      if (
        type !== 'text' &&
        Array.isArray(maxValues) &&
        maxValues.length > 0 &&
        maxValues.length !== numInputs
      ) {
        throw new Error(
          "'maxValues' doit contenir autant d'éléments que 'numInputs'."
        );
      }
    }

    function validateValues(type, values, numInputs) {
      if (
        type !== 'text' &&
        Array.isArray(values) &&
        values.length > 0 &&
        values.length !== numInputs
      ) {
        throw new Error(
          "'values' doit contenir autant d'éléments que 'numInputs'."
        );
      }
    }

    function validateDecimalPosition(type, decimalPosition) {
      if (
        type === 'float' &&
        (typeof decimalPosition !== 'number' || decimalPosition < 1)
      ) {
        throw new Error(
          "Option 'decimalPosition' doit être un entier positif pour les types flottants."
        );
      }
    }

    function validateDefaultValue(type, defaultValue) {
      const isPositiveNumber = (value) =>
        typeof value === 'number' && !isNaN(value) && value >= 0;
      const isValidDate = (value) =>
        value instanceof Date && !isNaN(value.getTime());

      const buildDateRegex = (format) => {
        const escapeRegex = (str) =>
          str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const tokenRegex = /(DD|MM|MH|YYYY)/g;
        const parts = format.split(tokenRegex).filter(Boolean);
        const pattern = parts
          .map((part) => {
            if (part === 'YYYY') return '\\d{4}';
            if (part === 'DD' || part === 'MM' || part === 'MH') return '\\d{1,2}';
            return escapeRegex(part);
          })
          .join('');
        return new RegExp(`^${pattern}$`);
      };

      const buildTimeRegex = (format) => {
        const escapeRegex = (str) =>
          str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const tokenRegex = /(HH|MM|SSS|SS|A)/g;
        const parts = format.split(tokenRegex).filter(Boolean);
        const pattern = parts
          .map((part) => {
            if (part === 'HH' || part === 'MM' || part === 'SS') return '\\d{1,2}';
            if (part === 'SSS') return '\\d{1,3}';
            if (part === 'A') return '(AM|PM)?';
            return escapeRegex(part);
          })
          .join('');
        return new RegExp(`^${pattern}$`, 'i');
      };

      const errorMessages = {
        time: "Option 'defaultValue' : doit être un nombre (secondes), une chaîne formatée 'HH:MM:SS' ou un objet Date.",
        date: "Option 'defaultValue' : doit être un nombre (secondes), une chaîne formatée 'DD/MM/YYYY' ou un objet Date.",
        generic: "Option 'defaultValue' doit être un nombre ou une chaîne.",
      };

      if (['time', 'date'].includes(type)) {
        if (isPositiveNumber(defaultValue)) return;

        if (typeof defaultValue === 'string') {
          if (type === 'time') {
            const timeRegex = buildTimeRegex(settings.formatTime);
            if (timeRegex.test(defaultValue)) return;
          } else if (type === 'date') {
            const dateRegex = buildDateRegex(settings.formatDate);
            if (dateRegex.test(defaultValue)) return;
          }
        }

        if (isValidDate(defaultValue)) return;

        throw new Error(errorMessages[type]);
      }

      // Validation générique pour les autres types
      if (
        typeof defaultValue !== 'number' &&
        typeof defaultValue !== 'string'
      ) {
        throw new Error(errorMessages.generic);
      }
    }

    function validateTotalMin(totalMin) {
      if (totalMin !== null && typeof totalMin !== 'number') {
        throw new Error("Option 'totalMin' doit être un nombre ou null.");
      }
    }

    function validateTotalMax(totalMax) {
      if (totalMax !== null && typeof totalMax !== 'number') {
        throw new Error("Option 'totalMax' doit être un nombre ou null.");
      }
    }

    function validateOnValueChange(onValueChange) {
      if (onValueChange !== null && typeof onValueChange !== 'function') {
        throw new Error(
          "Option 'onValueChange' doit être une fonction ou null."
        );
      }
    }

    function validateAllowScroll(allowScroll) {
      if (typeof allowScroll !== 'boolean') {
        throw new Error("Option 'allowScroll' doit être un booléen.");
      }
    }

    function validateAllowSign(allowSign) {
      if (typeof allowSign !== 'boolean') {
        throw new Error("Option 'allowSign' doit être un booléen.");
      }
    }

    function validateAllowArrowKeys(allowArrowKeys) {
      if (typeof allowArrowKeys !== 'boolean') {
        throw new Error("Option 'allowArrowKeys' doit être un booléen.");
      }
    }

    function validateIsDisabled(isDisabled) {
      if (typeof isDisabled !== 'boolean') {
        throw new Error("Option 'isDisabled' doit être un booléen.");
      }
    }

    function validateAutoFocusNextInput(autoFocusNextInput) {
      if (typeof autoFocusNextInput !== 'boolean') {
        throw new Error("Option 'autoFocusNextInput' doit être un booléen.");
      }
    }

    function validateAutoFocusNextInputDirection(autoFocusNextInputDirection) {
      if (
        autoFocusNextInputDirection &&
        !['Forward', 'Backward', 'Right', 'Left'].includes(
          autoFocusNextInputDirection
        )
      ) {
        throw new Error(
          "Option 'autoFocusNextInputDirection' doit être 'Forward', 'Backward', 'Right', 'Left' ou null."
        );
      }
    }

    function validateScrollSensitivity(scrollSensitivity) {
      if (typeof scrollSensitivity !== 'number' || scrollSensitivity <= 0) {
        throw new Error(
          "Option 'scrollSensitivity' doit être un entier positif."
        );
      }
    }

    function validateRequireKeyForScroll(requireKeyForScroll) {
      if (
        requireKeyForScroll &&
        !['Control', 'Shift', 'Alt', 'Meta'].includes(requireKeyForScroll)
      ) {
        throw new Error(
          "Option 'requireKeyForScroll' doit être 'Control', 'Shift', 'Alt', 'Meta' ou null."
        );
      }
    }

    function validateDefaultSign(defaultSign) {
      if (defaultSign && !['+', '-'].includes(defaultSign)) {
        throw new Error("Option 'defaultSign' doit être '+', '-'.");
      }
    }

    function validateDefaultLanguage(defaultLanguage) {
      // Vérifie si la langue est une chaîne de caractères
      if (typeof defaultLanguage !== 'string') {
        throw new Error(
          "L'option 'defaultLanguage' doit être une chaîne de caractères."
        );
      }

      // Vérifie si la langue est prise en charge par Intl.DateTimeFormat
      try {
        Intl.DateTimeFormat.supportedLocalesOf([defaultLanguage]);
      } catch (error) {
        throw new Error('Incorrect locale information provided');
      }
    }

    function validateHourCycle(type, hourCycle) {
      const validOptions = ['24h', '12h']; // Les valeurs possibles pour hourCycle

      if (type !== 'time') {
        return; // Pas de validation nécessaire pour d'autres types
      }

      // Si aucune valeur n'est fournie, retourner la valeur par défaut
      if (!hourCycle) {
        throw new Error(
          "L'option 'hourCycle' n'est pas définie. Valeur par défaut utilisée : '24h'."
        );
      }

      // Vérifie si la valeur est une chaîne valide
      if (typeof hourCycle !== 'string') {
        throw new Error(
          "L'option 'hourCycle' doit être une chaîne de caractères ('24h' ou '12h')."
        );
      }

      // Vérifie si la valeur est valide
      if (!validOptions.includes(hourCycle)) {
        throw new Error(
          `L'option 'hourCycle' doit être une des valeurs suivantes : ${validOptions.join(
            ', '
          )}.`
        );
      }

      // Si tout est valide, retourner la valeur
      return hourCycle;
    }

    function validateOptions() {
      validateType(settings.type);
      validateNumInputs(settings.numInputs);
      validateMinValues(settings.type, settings.minValues, settings.numInputs);
      validateMaxValues(settings.type, settings.maxValues, settings.numInputs);
      validateValues(settings.type, settings.values, settings.numInputs);
      validateDecimalPosition(settings.type, settings.decimalPosition);
      validateDefaultValue(settings.type, settings.defaultValue);
      validateTotalMin(settings.totalMin);
      validateTotalMax(settings.totalMax);
      validateOnValueChange(settings.onValueChange);
      validateAllowScroll(settings.allowScroll);
      validateAllowSign(settings.allowSign);
      validateAllowArrowKeys(settings.allowArrowKeys);
      validateIsDisabled(settings.isDisabled);
      validateAutoFocusNextInput(settings.autoFocusNextInput);
      validateAutoFocusNextInputDirection(settings.autoFocusNextInputDirection);
      validateScrollSensitivity(settings.scrollSensitivity);
      validateRequireKeyForScroll(settings.requireKeyForScroll);
      validateDefaultSign(settings.defaultSign);
      validateMaskInput(settings.maskInput);
      validateDateTimeFormat(settings.type);
      validateDefaultLanguage(settings.defaultLanguage);
      validateHourCycle(settings.type, settings.hourCycle);
    }

    validateOptions();

    return settings;
  }

  function isValidDateFormat(format) {
    // Expression régulière pour accepter toutes les combinaisons de DD, MM, MH, YYYY avec ou sans séparateurs
    const formatRegex = /^(DD|MM|MH|YYYY)([^a-zA-Z0-9](DD|MM|MH|YYYY)){0,2}$/;

    // Validation du format
    return formatRegex.test(format);
  }

  function isValidTimeFormat(format) {
    // Expression régulière pour accepter HH, MM, SS et SSS avec n'importe quel séparateur
    const formatRegex =
      /^HH[^a-zA-Z0-9]MM([^a-zA-Z0-9]SS)?([^a-zA-Z0-9]SSS)?(\s?A)?$/;

    // Validation du format
    return formatRegex.test(format);
  }

  function truncateFromEnd(text, maxLength) {
    if (text.length > maxLength) {
      return text.slice(-maxLength); // Tronque le texte et conserve les derniers caractères
    }
    return text; // Retourne le texte original s'il est plus court que maxLength
  }

  function findPosition(array, element) {
    return array.indexOf(element);
  }

  function uuidShort() {
    return 'xxxxxxxx'.replace(/x/g, function () {
      const r = (Math.random() * 16) | 0;
      return r.toString(16);
    });
  }

  function getValueLimits(settings) {
    const valueMin = valueDigitMin(settings);
    const valueMax = valueDigitMax(settings);
    return { valueMin, valueMax };
  }

  function getValueInputLimits(currentValue, inputElement, settings) {
    let valueMin = 0;
    let valueMax = 0;
    if (isAllowSign(settings)) {
      valueMax =
        currentValue < 0
          ? convertIntegerBase10($(inputElement).attr('data-min'))
          : convertIntegerBase10($(inputElement).attr('data-max'));
    } else {
      valueMin = convertIntegerBase10($(inputElement).attr('data-min'));
      valueMax = convertIntegerBase10($(inputElement).attr('data-max'));
    }

    return { valueMin, valueMax };
  }

  function calculateNextIndex(id, settings) {
    let index = id;

    if (
      settings.autoFocusNextInput &&
      settings.autoFocusNextInputDirection !== null
    ) {
      switch (settings.autoFocusNextInputDirection) {
        case 'Forward':
        case 'Right':
          index += 1;
          break;
        case 'Backward':
        case 'Left':
          index -= 1;
          break;
        default:
          console.warn(
            `Direction "${settings.autoFocusNextInputDirection}" non reconnue. L'index reste inchangé.`
          );
      }
    }

    return index;
  }

  const charEscapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    ' ': 'Espace', // espace insécable
    '©': '&copy;',
    '®': '&reg;',
    '™': '&trade;',
    '€': '&euro;',
    '¢': '&cent;',
    '£': '&pound;',
    '¥': '&yen;',
  };

  // Map inversée pour les caractères échappés vers leurs caractères originaux
  const escapeToCharMap = Object.fromEntries(
    Object.entries(charEscapeMap).map(([char, escaped]) => [escaped, char])
  );

  // Fonction pour échapper un caractère
  function escapeChar(char) {
    return charEscapeMap[char];
  }

  // Fonction pour convertir un caractère échappé en caractère normal
  function unescapeChar(escapedChar) {
    return escapeToCharMap[escapedChar] || escapedChar;
  }

  // Fonction pour échapper les caractères spéciaux dans une chaîne
  function escapeHtml(text) {
    return text.replace(/[&<>"' ©®™€¢£¥]/g, (m) => escapeChar(m));
  }

  // Fonction pour convertir une chaîne échappée en caractères normaux
  function convertFromEscapedChar(escapedStr) {
    switch (escapedStr) {
      case '\\0x00':
        return convertChar(0);
      case '\\0x0b':
        return convertChar(11);
      case '\\t':
        return '\t'; // Tabulation
      case '\\n':
        return '\n'; // Nouvelle ligne
      case '\\r':
        return '\r'; // Retour chariot
      case '\\b':
        return '\b'; // Retour arrière
      case '\\f':
        return '\f'; // Saut de page
      default:
        return unescapeChar(escapedStr); // Utilise la fonction unescapeChar pour le reste
    }
  }

  // Fonction pour convertir un caractère en version échappée si nécessaire
  function convertToEscapedChar(char) {
    const charCode = convertLetter(char);

    switch (charCode) {
      case 9:
        return '\\t'; // Tabulation
      case 10:
        return '\\n'; // Nouvelle ligne
      case 13:
        return '\\r'; // Retour chariot
      case 8:
        return '\\b'; // Retour arrière
      case 12:
        return '\\f'; // Saut de page
      default:
        return char; // Utilise la map pour les caractères spéciaux
    }
  }

  function convertFloat(value) {
    return parseFloat(value);
  }
  function convertIntegerBase10(value) {
    return parseInt(value, 10);
  }
  function convertIntegerBase16(value) {
    return parseInt(value, 16);
  }
  function convertBinary(value) {
    return parseInt(value, 2);
  }
  function convertLetter(value) {
    return value.charCodeAt(0);
  }
  function convertChar(value) {
    return String.fromCharCode(value);
  }

  function convertHexadecimalToLetter(value) {
    if (value >= 0 && value <= 9) {
      return convertChar(0x30 + value); // '0' à '9'
    }
    // Si la valeur est entre 10 et 15, renvoie le caractère alphabétique correspondant
    else if (value >= 10 && value <= 15) {
      return convertChar(0x61 + (value - 10)); // 'a' à 'f'
    }
    // Si le caractère n'est pas dans la plage autorisée, retourne null ou un message d'erreur
    return null;
  }

  function convertLetterToHexadecimal(char) {
    // Vérifie si le caractère est entre '0' et '9'
    if (char >= '0' && char <= '9') {
      return convertLetter(char) - 0x30;
    }
    // Vérifie si le caractère est entre 'a' et 'f'
    else if (char >= 'a' && char <= 'f') {
      return convertLetter(char) - 0x61 + 10;
    }
    // Si le caractère n'est pas dans la plage autorisée, retourne null ou un message d'erreur
    return null;
  }

  function validateInteger(value) {
    return Number(value) === value && Number.isInteger(value);
  }

  // Vérifie si la valeur est un nombre valide en fonction du type
  const isValidIntegerOrFloat = (val) => /^[-+]?\d+(\.\d+)?$/.test(val);
  const isValidBinary = (val) => /^0b[01]+$/.test(val) || /^[01]+$/.test(val);
  const isValidHexadecimal = (val) =>
    /^0x[0-9a-fA-F]+$/.test(val) || /^[0-9a-fA-F]+$/.test(val);

  const dateTimeSettings = {
    convert: (value) => convertIntegerBase10(value),
    validate: (value) =>
      typeof value === 'number' && !isNaN(value) && validateInteger(value),
    display: (value) => value,
    isForcedAllowSign: false,
    isForcedAllowArrowKeys: false,
    isAdjustToBounds: false,
    isGetDigit: true,
    isSetDigit: true,
    min: 0x00,
    max: 0x09,
    isForcedDisabled: false,
    isValidKey: (codeTouche, valueMax) =>
      (codeTouche >= 48 && codeTouche <= 48 + valueMax) || // Chiffres (0-9)
      (codeTouche >= 96 && codeTouche <= 96 + valueMax), // Pavé numérique (0-9)
  };

  const typeHandlers = {
    integer: {
      convert: (value) => convertIntegerBase10(value),
      validate: (value) =>
        typeof value === 'number' && !isNaN(value) && validateInteger(value),
      display: (value) => value,
      isForcedAllowSign: false,
      isForcedAllowArrowKeys: false,
      isAdjustToBounds: true,
      isGetDigit: true,
      isSetDigit: true,
      min: 0x00,
      max: 0x09,
      isForcedDisabled: false,
      isValidKey: (codeTouche, valueMax) =>
        (codeTouche >= 48 && codeTouche <= 48 + valueMax) || // Chiffres (0-9)
        (codeTouche >= 96 && codeTouche <= 96 + valueMax), // Pavé numérique (0-9)
    },
    float: {
      convert: (value) => convertFloat(value),
      validate: null,
      display: (value) => value,
      isForcedAllowSign: false,
      isForcedAllowArrowKeys: false,
      isAdjustToBounds: true,
      isGetDigit: true,
      isSetDigit: true,
      min: 0x00,
      max: 0x09,
      isForcedDisabled: false,
      isValidKey: (codeTouche, valueMax) =>
        (codeTouche >= 48 && codeTouche <= 48 + valueMax) || // Chiffres (0-9)
        (codeTouche >= 96 && codeTouche <= 96 + valueMax), // Pavé numérique (0-9)
    },
    binary: {
      convert: (value) => convertBinary(value),
      validate: null,
      display: (value) => value,
      isForcedAllowSign: false,
      isForcedAllowArrowKeys: false,
      isAdjustToBounds: false,
      isGetDigit: true,
      isSetDigit: true,
      min: 0x00,
      max: 0x01,
      isForcedDisabled: false,
      isValidKey: (codeTouche) =>
        codeTouche === 48 ||
        codeTouche === 49 || // Chiffres 0 et 1
        codeTouche === 96 ||
        codeTouche === 97, // Pavé numérique 0 et 1
    },
    hexadecimal: {
      convert: (value) => convertIntegerBase16(value),
      validate: (value, settings) =>
        settings.type !== 'letter' &&
        typeof value === 'string' &&
        isValidHexadecimal(value),
      display: (value) => convertHexadecimalToLetter(value),
      isForcedAllowSign: false,
      isForcedAllowArrowKeys: false,
      isAdjustToBounds: false,
      isGetDigit: true,
      isSetDigit: true,
      min: 0x00,
      max: 0x0f,
      isForcedDisabled: false,
      isValidKey: (codeTouche) =>
        (codeTouche >= 48 && codeTouche <= 57) || // Chiffres (0-9)
        (codeTouche >= 65 && codeTouche <= 70) || // Lettres A-F
        (codeTouche >= 96 && codeTouche <= 105), // Lettres a-f et // Pavé numérique (0-9)
    },
    letter: {
      convert: (value) => convertLetter(value),
      validate: () => false,
      display: (value) => convertChar(value),
      isForcedAllowSign: false,
      isForcedAllowArrowKeys: false,
      isAdjustToBounds: false,
      isGetDigit: true,
      isSetDigit: true,
      min: 0x00,
      max: 0xff,
      isForcedDisabled: false,
      isValidKey: (codeTouche, valueMax, key, allowArrowKeys) => {
        // Exclut Ctrl, Shift, Alt, Windows (Meta), et Menu Contextuel
        const invalidCodes = [16, 17, 18, 91, 93];
        if (invalidCodes.includes(codeTouche)) {
          return false;
        }
        const arrowKeys = ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'];
        return (
          !invalidCodes.includes(codeTouche) &&
          (!allowArrowKeys || !arrowKeys.includes(key))
        );
      },
    },
    text: {
      convert: null,
      validate: () => false,
      display: null,
      isForcedAllowSign: false,
      isForcedAllowArrowKeys: false,
      isAdjustToBounds: false,
      isGetDigit: false,
      isSetDigit: false,
      min: null,
      max: null,
      isForcedDisabled: true,
      isValidKey: null,
    },
    time: dateTimeSettings,
    date: dateTimeSettings,
  };

  function isKeyAllowed(codeTouche, key, valueMax, type, allowArrowKeys) {
    // Utilisation de l'opérateur de chaînage optionnel pour vérifier les propriétés
    return (
      typeHandlers[type]?.isValidKey?.(
        codeTouche,
        valueMax,
        key,
        allowArrowKeys
      ) || false
    );
  }

  function convertDigitByType(value, type) {
    return typeHandlers[type]?.convert?.(value) ?? null;
  }

  function valueDigitMin(settings) {
    return typeHandlers[settings.type]?.min ?? null;
  }

  function valueDigitMax(settings) {
    return typeHandlers[settings.type]?.max ?? null;
  }

  function determineType(value, settings) {
    // Trouve le premier type qui valide la valeur
    for (const [type, handler] of Object.entries(typeHandlers)) {
      if (handler?.validate?.(value, settings)) {
        return type;
      }
    }
    // Retourne "letter" si aucun type valide n'est trouvé
    return 'letter';
  }

  function makeValueElement(value, settings) {
    return typeHandlers[settings.type]?.display?.(value) ?? null;
  }

  function isAdjustToBounds(settings) {
    return typeHandlers[settings.type]?.isAdjustToBounds ?? false;
  }

  function isAllowSign(settings) {
    return (
      (typeHandlers[settings.type]?.isForcedAllowSign ?? false) ||
      settings.allowSign
    );
  }

  function isAllowArrowKeys(settings) {
    return (
      (typeHandlers[settings.type]?.isForcedAllowArrowKeys ?? false) ||
      settings.allowArrowKeys
    );
  }

  function isGetDigit(settings) {
    return typeHandlers[settings.type]?.isGetDigit ?? false;
  }

  function isSetDigit(settings) {
    return typeHandlers[settings.type]?.isSetDigit ?? false;
  }

  function isDisabled(settings) {
    return (
      (typeHandlers[settings.type]?.isForcedDisabled ?? false) ||
      settings.isDisabled
    );
  }

  function defaultSign(settings) {
    return isAllowSign(settings) ? settings.defaultSign : null;
  }

  function getValueByType(index, valueArray, settings) {
    const value = valueArray[index];
    // Vérifie si la valeur existe et la détermine le type
    if (value === undefined) return null;
    const type = determineType(value, settings);
    // prettier-ignore
    return convertDigitByType(value, type);
  }

  function maxValue(index, settings) {
    return getValueByType(index, settings.maxValues, settings);
  }

  function minValue(index, settings) {
    return getValueByType(index, settings.minValues, settings);
  }

  function defaultValue(index, settings) {
    return getValueByType(index, settings.values, settings);
  }

  // Fonction interne pour effectuer le clamp
  function clampCore(value, min, max) {
    return Math.max(min, Math.min(value, max));
  }

  function setElement(type, object, value, settings) {
    let val = makeValueElement(value, settings);
    if (settings.type == 'letter') val = convertToEscapedChar(val);
    // Utiliser des fonctions spécifiques pour chaque type d'élément
    if (type === 'input') {
      setInputValue(object, val);
    } else if (type === 'div') {
      setDivValue(object, val, settings);
    } else {
      throw new Error('Type invalide :', type);
    }
  }

  // Gère la valeur pour un élément input
  function setInputValue(object, val) {
    $(object).val(val);
  }

  // Gère la valeur pour un élément div
  function setDivValue(object, val, settings) {
    if (settings.type === 'letter') {
      val = handleSpecialLetters(val);
      $(object).html(escapeHtml(val));
    } else {
      $(object).html(val);
    }
  }

  // Gestion des caractères spéciaux pour le type lettre
  function handleSpecialLetters(val) {
    if (convertLetter(val) === 0) {
      return '\\0x00';
    }
    if (convertLetter(val) === 11) return '\\0x0b';
    return val;
  }

  function getElement(type, object, settings) {
    let value = type === 'input' ? $(object).val() : $(object).html();
    if (settings.type === 'letter') value = convertFromEscapedChar(value);
    if (settings.type === 'date' && $(object).attr('id').includes('month'))
      value = settings.monthMap.get(value);
    return convertDigitByType(value, settings.type);
  }

  function calculateAdjacentValues(value) {
    const currentValue = convertIntegerBase10(value);
    const valueTop = currentValue - 1;
    const valueBottom = currentValue + 1;
    return { valueTop, valueBottom };
  }

  function getValidLimitDigit(limitDigit, id) {
    // Vérifie si l'index est valide et si la valeur correspond à un nombre
    if (
      Array.isArray(limitDigit) &&
      limitDigit[id - 1] !== undefined &&
      typeof limitDigit[id - 1] === 'number'
    ) {
      return convertIntegerBase10(limitDigit[id - 1]); // Retourne la valeur valide
    }
    return 0; // Retourne la valeur par défaut si invalide
  }

  function adjustToBounds(
    value,
    min,
    max,
    othervalue = null,
    othervaluemin = null,
    othervaluemax = null
  ) {
    if (
      min !== undefined &&
      min !== null &&
      typeof min === 'number' &&
      value <= min
    )
      return othervaluemin != null ? othervaluemin : min;
    if (
      max !== undefined &&
      max !== null &&
      typeof max === 'number' &&
      value >= max
    )
      return othervaluemax != null ? othervaluemax : max;
    return othervalue != null ? othervalue : value;
  }

  $.fn.codeInputBuilder = function (options) {
    // Options par défaut
    const settings = initCodeInputBuilderOptions(options);

    settings.monthMap = getMonthMapByLocale(settings.defaultLanguage);
    settings.months = Array.from(settings.monthMap.keys());

    let gIdHover = null;

    let currentValues = {
      value: '',
      digits: new Array(settings.numInputs).fill(0), // Tableau pour n digits
      sign: defaultSign(settings), // Valeur pour sign
      systime: 'AM',
      list: '',
      limitDigitMin: null,
      limitDigitMax: null,
      limitMin: null,
      limitMax: null,
      totalMin: null,
      totalMax: null,
    };

    initLimitValue(currentValues, settings);
    initTotalValue(currentValues, settings);

    let uniqueTypeShort = settings.type + '_' + uuidShort();

    function initTotalValue(currentValues, settings) {
      const signMultiplier = isAllowSign(settings) ? -1 : 1;

      // prettier-ignore
      let totalMin =
        settings.totalMin !== undefined && settings.totalMin != null
          ? settings.totalMin
          : digitsArrayToNumber(
            settings.minValues,
            settings.type === 'float',
            settings.decimalPosition
          ) * signMultiplier;

      // prettier-ignore
      let totalMax =
        settings.totalMax !== undefined && settings.totalMax != null
          ? settings.totalMax
          : digitsArrayToNumber(
            settings.maxValues,
            settings.type === 'float',
            settings.decimalPosition
          );

      currentValues.totalMin = totalMin;
      currentValues.totalMax = totalMax;
      currentValues.limitDigitMin = numberToDigitsArray(totalMin);
      currentValues.limitDigitMax = numberToDigitsArray(totalMax);
    }

    function initLimitValue(currentValues, settings) {
      if (settings.type === 'float' || settings.type === 'integer') {
        let minDigitArray = new Array();
        let maxDigitArray = new Array();

        for (let i = 0; i < settings.numInputs; i++) {
          // prettier-ignore
          const min = settings.minValues[i] !== undefined 
          ? Math.max(valueDigitMin(settings), Math.min(minValue(i,settings), valueDigitMax(settings))) 
          :  valueDigitMin(settings);

          minDigitArray.push(min);

          // prettier-ignore
          const max = settings.maxValues[i] !== undefined 
          ? Math.max(valueDigitMin(settings), Math.min(maxValue(i,settings), valueDigitMax(settings))) 
          : valueDigitMax(settings);

          maxDigitArray.push(max);
        }

        let limitMax = digitsArrayToNumber(
          maxDigitArray,
          settings.type === 'float',
          settings.decimalPosition
        );
        let limitMin = digitsArrayToNumber(
          minDigitArray,
          settings.type === 'float',
          settings.decimalPosition
        );
        if (isAllowSign(settings)) limitMin *= -1;

        currentValues.limitMax = limitMax;
        currentValues.limitMin = limitMin;
      }
    }

    function triggerValueChange($input, settings, onchange) {
      if (onchange && typeof settings.onValueChange === 'function') {
        const newValue = getCurrentValueByIndex('current');
        // Mise à jour de la région de notification pour les lecteurs d'écran
        if ($input != null) {
          $('#live-update').text(
            `Input ${$input.attr('id')} a changé de valeur ${newValue}`
          );
        } else {
          $('#live-update').text(`Le CodeInput a changé de valeur ${newValue}`);
        }
        // Appel du callback avec l'input et la nouvelle valeur
        settings.onValueChange($input, newValue);
      }
    }

    // Fonction pour mettre à jour les valeurs en fonction de l'index
    function updateCurrentValues(index, value) {
      if (index === 'systime') {
        currentValues.systime = value;
      } else if (index === 'sign') {
        currentValues.sign = value;
      } else if (index === 'list') {
        currentValues.list = value;
      } else if (index === 'current') {
        currentValues.value = value;
      } else if (index === 'fillDigits') {
        currentValues.digits.fill(value);
      } else if (!isNaN(index)) {
        // Si l'index est un nombre, on l'utilise pour mettre à jour le digit
        currentValues.digits[index] = value;
      } else {
        throw new Error('Index invalide :', index);
      }
    }

    function getCurrentValueByIndex(index) {
      let value = null;

      if (index === 'systime') {
        value = currentValues.systime;
      } else if (index === 'sign') {
        value = currentValues.sign;
      } else if (index === 'current') {
        value = currentValues.value;
      } else if (index === 'digits') {
        value = currentValues.digits;
      } else if (!isNaN(index)) {
        // Si l'index est un nombre, on l'utilise pour mettre à jour le digit
        value = currentValues.digits[index];
      } else {
        throw new Error('Index invalide :', index);
      }
      return value;
    }

    function processIntegerParts(value) {
      let integer = value; // Partie entière (par défaut, la valeur entière est le "value")
      let decimal = ''; // Partie décimale par défaut est une chaîne vide

      // Retourner un tableau contenant la partie entière et décimale
      return [integer, decimal];
    }

    function processFloatParts(value, settings) {
      const maxDecimalLength = settings.numInputs - settings.decimalPosition;
      let [integer, decimal = ''] = value.split('.');
      integer = integer.padStart(settings.decimalPosition, '0');
      decimal = (decimal || '')
        .slice(0, maxDecimalLength)
        .padEnd(maxDecimalLength, '0');
      return [integer, decimal];
    }

    function populateDigitInputs(digitString, type, settings) {
      const digitInputs = $(
        `input[id^=digits_${type}_input], input[id^=month_${type}_input]`
      )
        .toArray() // Convertit en tableau natif pour trier
        .sort((a, b) => {
          // Extraction du numéro final de l'ID
          const numA = parseInt(
            $(a)
              .attr('id')
              .match(/_(\d+)$/)[1],
            10
          );
          const numB = parseInt(
            $(b)
              .attr('id')
              .match(/_(\d+)$/)[1],
            10
          );

          // Comparaison des numéros
          return numA - numB;
        });

      let index = digitInputs.length - 1;

      // Réinitialise les valeurs des inputs à zéro
      digitInputs.forEach((input) => {
        if (!$(input).attr('id').includes('month')) {
          setElement('input', input, 0, settings);
        }
      });

      let i = digitString.length - 1;

      while (i >= 0) {
        if (!$(digitInputs[index]).attr('id').includes('month')) {
          const { value } = getAdjustedValueSettings(
            index,
            settings,
            convertDigitByType(digitString[i], settings.type)
          );
          setElement('input', digitInputs[index], value, settings);
          updateCurrentValues(index, value);
        } else {
          const value = parseInt(digitString[i - 1] + digitString[i], 10);
          setElement(
            'input',
            digitInputs[index],
            settings.months[value - 1],
            settings
          );
          updateCurrentValues(index, settings.months[value - 1]);
          i--; // Sauter un élément supplémentaire pour les mois
        }

        i--; // Décrémentation générale
        index--;
        if (index < 0) break;
      }
    }

    function adjustToBoundsByAllDigit(
      number,
      limitDigitMin,
      limitDigitMax,
      settings
    ) {
      // Détermine le signe du nombre et les limites correspondantes
      const sign = number > 0 ? '+' : '-';
      const limitDigit =
        number > 0
          ? numberToDigitsArray(limitDigitMax)
          : numberToDigitsArray(limitDigitMin);

      const decimalPosition =
        settings.type === 'float' && settings.decimalPosition
          ? settings.decimalPosition
          : 0;

      // Séparation des parties entière et décimale
      let [integer, decimal] =
        settings.type === 'float'
          ? processFloatParts(Math.abs(number).toString(), settings)
          : processIntegerParts(Math.abs(number).toString());

      // Traitement des parties entière et décimale
      const adjustedInteger = adjustDigits(
        integer,
        limitDigit,
        limitDigit.length - decimalPosition - 1
      );
      const adjustedDecimal = adjustDigits(
        decimal,
        limitDigit,
        decimalPosition
      );

      // Fusionne les parties entière et décimale, puis convertit en nombre
      const adjustedDigits = adjustedInteger.concat(adjustedDecimal);
      let baseValue = digitsArrayToNumber(
        adjustedDigits,
        settings.type === 'float',
        settings.decimalPosition
      );

      if (sign === '-') baseValue *= -1;

      return baseValue;
    }

    // Fonction auxiliaire pour ajuster les digits
    function adjustDigits(part, limitDigit, startIndex) {
      const adjustedPart = [];
      const partArray = part.split('').reverse();

      partArray.forEach((digit, index) => {
        const limitIndex = startIndex - index;
        adjustedPart.unshift(
          digit > limitDigit[limitIndex]
            ? limitDigit[limitIndex].toString()
            : digit
        );
      });

      return adjustedPart;
    }

    function fillSysTime(askValue, type) {
      if (type === 'time' && settings.hourCycle === '12h') {
        const period = determinePeriod(askValue); // Déterminer AM/PM

        if (period) {
          updateSystemTimeInput(period); // Mettre à jour l'input
        }
      }
    }

    // Détermine si la période est AM ou PM
    function determinePeriod(value) {
      if (value instanceof Date) {
        return getPeriodFromDate(value);
      } else if (typeof value === 'string') {
        return getPeriodFromString(value);
      } else if (typeof value === 'number') {
        return getPeriodFromNumber(value);
      }
      return ''; // Aucun résultat valide
    }

    // Retourne AM ou PM pour une Date
    function getPeriodFromDate(date) {
      const hours = date.getUTCHours();
      return hours >= 12 ? 'PM' : 'AM';
    }

    // Retourne AM ou PM pour une chaîne
    function getPeriodFromString(value) {
      const valueUpper = value.toUpperCase();
      if (valueUpper.includes('AM')) return 'AM';
      if (valueUpper.includes('PM')) return 'PM';

      // Conversion de la chaîne en secondes si AM/PM n'est pas explicite
      const seconds = timeStringToSeconds(value, settings.formatTime, '24h');
      const hours = Math.floor(seconds / 3600);
      return hours >= 12 ? 'PM' : 'AM';
    }

    // Retourne AM ou PM pour un nombre (secondes)
    function getPeriodFromNumber(seconds) {
      const hours = Math.floor(seconds / 3600);
      return hours >= 12 ? 'PM' : 'AM';
    }

    // Met à jour l'input avec la période calculée
    function updateSystemTimeInput(period) {
      $('input[id^=systime_' + uniqueTypeShort + '_input]').val(period);
    }

    function fillDigits(number, type) {
      // Vérifie si la valeur `number` est valide pour les types pris en charge
      if (['float', 'integer'].includes(settings.type) && isNaN(number)) return;

      let integerPart, decimalPart;
      let baseValue = number;
      let numericValue = number;
      // Ajuste la valeur en fonction des limites si nécessaire
      if (isAdjustToBounds(settings)) {
        baseValue = adjustToBounds(
          number,
          currentValues.totalMin,
          currentValues.totalMax
        );

        baseValue = adjustToBoundsByAllDigit(
          baseValue,
          currentValues.limitMin,
          currentValues.limitMax,
          settings
        );

        numericValue = Math.abs(baseValue).toString();
      }

      // Gère le signe si `allowSign` est activé
      if (isAllowSign(settings)) {
        $(`[id^="sign_${type}_input"]`).val(baseValue < 0 ? '-' : '+');
      }

      // Traite les parties entière et décimale selon le type défini
      switch (settings.type) {
        case 'float':
          [integerPart, decimalPart] = processFloatParts(
            numericValue,
            settings
          );
          break;
        case 'integer':
        case 'binary':
        case 'hexadecimal':
        case 'letter':
        case 'time':
        case 'date':
          integerPart = numericValue;
          decimalPart = '';
          break;

        default:
          throw new Error('Type non supporté dans la fonction fillDigits.');
      }

      // Remplit les inputs avec les parties entière et décimale combinées
      populateDigitInputs(integerPart + decimalPart, type, settings);
    }

    function computeValueFromInputs(type) {
      let numberString = computeDigitToValue(type);
      if (settings.type === 'float' || settings.type === 'integer') {
        numberString = addSignToValue(numberString, type);
        return convertDigitByType(numberString, settings.type);
      }
      return numberString;
    }

    function computeDigitToValue(type) {
      let numberString = '';

      // Sélection des éléments et tri en fonction du numéro final dans l'ID
      $(`input[id^=digits_${type}_input], input[id^=month_${type}_input]`)
        .toArray() // Convertit en tableau natif pour trier
        .sort((a, b) => {
          // Extraction du numéro final de l'ID
          const numA = parseInt(
            $(a)
              .attr('id')
              .match(/_(\d+)$/)[1],
            10
          );
          const numB = parseInt(
            $(b)
              .attr('id')
              .match(/_(\d+)$/)[1],
            10
          );

          // Comparaison des numéros
          return numA - numB;
        })
        .forEach((element, index) => {
          const $element = $(element); // Convertit l'élément DOM en objet jQuery
          // Construction de la valeur selon le type
          if (
            settings.type === 'float' ||
            settings.type === 'integer' ||
            settings.type === 'binary'
          ) {
            // Ajouter un point décimal pour le type 'float'
            if (
              settings.type === 'float' &&
              index === settings.decimalPosition
            ) {
              numberString += '.';
            }
            // Ajoute la valeur extraite de l'élément
            numberString += getElement('input', $element, settings);
          } else {
            let value = 0;

            if ($element.attr('id').includes('month')) {
              value = settings.monthMap.get($element.val()); // Récupère la valeur de l'élément
            } else {
              value = $element.val(); // Récupère la valeur de l'élément
            }

            if (settings.type === 'letter') {
              value = convertFromEscapedChar(value); // Conversion spécifique pour les lettres
            }

            // Ajoute la valeur à la chaîne finale
            numberString += value;
          }
        });

      return numberString; // Retourne la chaîne résultante
    }

    function addSignToValue(value, type) {
      if (!isAllowSign(settings)) return value; // Retourne la valeur sans modification si `allowSign` est désactivé

      // Récupère le signe (+ ou -) pour le type spécifié
      const signInput = $('input[id^=sign_' + type + '_input]');
      let newvalue = null;
      // Applique le signe en fonction du type de la valeur (chaîne ou nombre)
      if (typeof value === 'string') {
        newvalue = signInput.val() === '-' ? '-' + value : value;
      } else {
        newvalue = signInput.val() === '-' ? -value : value;
      }
      return newvalue;
    }

    function analyzeFormat(
      format,
      regex,
      matchs,
      maxlimitMapping,
      minlimitMapping
    ) {
      let match;
      const parts = [];
      const separators = [];

      while ((match = regex.exec(format)) !== null) {
        if (matchs.includes(match[0])) {
          // Partie de la date
          parts.push({
            part: match[0],
            maxlimit: maxlimitMapping[match[0]] || [],
            minlimit: minlimitMapping[match[0]] || [],
            length: match[0].length,
          });
        } else if (match[1]) {
          // Séparateur
          separators.push(match[1]);
        }
      }

      const sizes = parts.map((p) => `${p.part != 'MH' ? p.length : 1}`);

      return {
        sizes: sizes,
        parts: parts.map((p) => `${p.part}`),
        maxlimits: parts.map((p) => `${p.maxlimit}`),
        minlimits: parts.map((p) => `${p.minlimit}`),
        numinputs: sizes.reduce((sum, size) => sum + parseInt(size, 10), 0),
        separators,
      };
    }

    function analyzeDateFormat(format) {
      // Expression régulière pour extraire chaque partie (DD, MM, YYYY) et les séparateurs
      const regex = /(?:DD|MM|MH|YYYY)|([^a-zA-Z0-9])/g;

      const maxlimitMapping = {
        DD: [3, 9],
        MM: [1, 9],
        MH: [12],
        YYYY: Array(4).fill(9),
      };

      const minlimitMapping = {
        DD: [0, 0],
        MM: [0, 0],
        MH: [1],
        YYYY: [1, 0, 0, 0],
      };

      const matchs = ['DD', 'MM', 'MH', 'YYYY'];

      return analyzeFormat(
        format,
        regex,
        matchs,
        maxlimitMapping,
        minlimitMapping
      );
    }

    function analyzeTimeFormat(format) {
      // Expression régulière pour extraire chaque partie (HH, MM, SS, SSS) et les séparateurs
      const regex = /(?:SSS|HH|MM|SS)|([^a-zA-Z0-9])/g;

      const maxlimitMapping = {
        HH: settings.hourCycle === '24h' ? [2, 9] : [1, 9],
        MM: [5, 9],
        SS: [5, 9],
        SSS: Array(3).fill(9),
      };

      const minlimitMapping = {
        HH: [0, 0],
        MM: [0, 0],
        SS: [0, 0],
        SSS: Array(3).fill(0),
      };

      const matchs = ['SSS', 'HH', 'MM', 'SS'];

      return analyzeFormat(
        format,
        regex,
        matchs,
        maxlimitMapping,
        minlimitMapping
      );
    }

    function parseDefaultTimeValue(defaultValue, format) {
      let defaultValueSecond;

      if (defaultValue instanceof Date) {
        defaultValueSecond = timeStringToSeconds(
          formatTimeFromDate(defaultValue, format, settings.hourCycle),
          format
        );
      } else if (typeof defaultValue === 'number') {
        defaultValueSecond = defaultValue;
      } else if (typeof defaultValue === 'string') {
        defaultValueSecond = timeStringToSeconds(
          defaultValue,
          format,
          settings.hourCycle
        );
      } else {
        return 0; // Valeur par défaut si rien n'est fourni
      }
      // Contraindre la valeur entre 0 et 86399.999 - 23:59:29.999
      return Math.min(Math.max(defaultValueSecond, 0), 86399.999);
    }

    function parseDefaultDateValue(defaultValue, format) {
      let defaultValueSecond = 0;
      if (defaultValue instanceof Date) {
        const newValue = formatDateFromDate(defaultValue, format);
        defaultValueSecond = dateStringToTimestamp(newValue, format);
      } else if (typeof defaultValue === 'number') {
        defaultValueSecond = defaultValue;
      } else if (typeof defaultValue === 'string') {
        defaultValueSecond = dateStringToTimestamp(defaultValue, format);
      } else {
        return 0; // Valeur par défaut si rien n'est fourni
      }
      // Contraindre la valeur entre 0 et 253402214400 - 31/12/9999
      return Math.min(Math.max(defaultValueSecond, 0), 253402214400);
    }

    function adjustHoursByTimeCycle(hours, timeString, hourCycle) {
      // Normaliser la chaîne de temps pour ignorer la casse
      const timeStringNormalized = timeString.toUpperCase();

      // Conversion en fonction du cycle horaire
      if (timeStringNormalized.includes('AM')) {
        if (hourCycle === '24h' && hours === 12) {
          hours = 0; // Minuit pour 12 AM
        }
      } else if (timeStringNormalized.includes('PM')) {
        if (hourCycle === '24h' && hours < 12) {
          hours += 12; // Ajouter 12 heures pour PM
        }
      } else if (hourCycle === '12h') {
        // Si aucun AM/PM spécifié et le cycle est 12h, ajuster les heures
        hours = hours % 12 || 12; // Convertit 0 en 12
      }

      // Validation des heures en fonction du cycle horaire
      if (hourCycle === '24h') {
        hours = Math.max(0, Math.min(hours, 23)); // Limite à 0-23
      } else {
        hours = Math.max(0, Math.min(hours, 12)); // Limite à 0-12
      }

      return hours;
    }

    function timeStringToSeconds(timeString, format, hourCycle) {
      const { parts, separators } = analyzeTimeFormat(format);
      // Construction de l'expression régulière pour découper la chaîne
      const regex = new RegExp(separators.map((s) => `\\${s}`).join('|'));
      const values = timeString.split(regex).map((v) => parseInt(v || '0', 10));

      // Initialise les valeurs par défaut
      let [hours, minutes, seconds, milliseconds] = [0, 0, 0, 0];

      // Associe chaque partie aux valeurs
      parts.forEach((part, i) => {
        const value = values[i] || 0;
        switch (part) {
          case 'HH':
            hours = adjustHoursByTimeCycle(value, timeString, hourCycle);
            break;
          case 'MM':
            minutes = Math.max(0, Math.min(value, 59));
            break;
          case 'SS':
            seconds = Math.max(0, Math.min(value, 59));
            break;
          case 'SSS':
            milliseconds = Math.max(0, Math.min(value, 999));
            break;
        }
      });
      // Conversion en secondes
      return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
    }

    function dateStringToTimestamp(dateString, format) {
      const { parts, separators } = analyzeDateFormat(format);

      // Construction de l'expression régulière pour découper la chaîne
      const regex = new RegExp(separators.map((s) => `\\${s}`).join('|'));
      const values = dateString.split(regex).map((v) => parseInt(v || '0', 10));

      // Initialise les valeurs par défaut
      let [day, month, year] = [1, 1, 1970];

      // Associe chaque partie aux valeurs
      parts.forEach((part, i) => {
        const value = values[i] || 0;
        switch (part) {
          case 'DD':
            day = Math.max(1, Math.min(value, 31));
            break;
          case 'MM':
            month = Math.max(1, Math.min(value, 12));
            break;
          case 'MH':
            month = Math.max(1, Math.min(value, 12));
            break;
          case 'YYYY':
            year = value; // Année valide sans limite imposée
            break;
        }
      });

      // Création de la date en UTC
      const date = new Date(Date.UTC(year, month - 1, day));

      // Retourne le timestamp en secondes
      return date.getTime() / 1000;
    }

    function processInput(inputValue, format, regex) {
      const parts = format.match(regex);
      const result = {};
      let index = 0;
      for (const part of parts) {
        const length = part.length; // Longueur du segment
        const value = parseInt(inputValue.substr(index, length), 10) || 0;
        index += length;
        // Stocker la valeur validée dans un objet
        result[part] = value;
      }
      return result;
    }

    // Fonction pour extraire, valider et construire les valeurs des segments
    function processTimeInput(inputValue, format) {
      const regex = /(SSS|HH|MM|SS)/g;

      const result = processInput(inputValue, format, regex);

      const hourCycle = settings.hourCycle == '24h' ? 23 : 12;

      const isValid =
        result.HH >= 0 &&
        result.HH <= hourCycle &&
        result.MM >= 0 &&
        result.MM <= 59 &&
        result.SS >= 0 &&
        result.SS <= 59 &&
        result.SSS >= 0 &&
        result.SSS <= 999;

      return { isValid, values: result };
    }

    function processDateInput(inputValue, format) {
      const regex = /(DD|MM|MH|YYYY)/g;

      const result = processInput(inputValue, format, regex);

      // Validation des segments extraits
      let isValid = false;

      if (result.MM != null) {
        isValid =
          result.DD >= 1 &&
          result.DD <= 31 &&
          result.MM >= 1 &&
          result.MM <= 12 && // Format MM
          result.YYYY >= 1970 &&
          result.YYYY <= 9999;
      } else if (result.MH != null) {
        isValid =
          result.DD >= 1 &&
          result.DD <= 31 &&
          result.MH >= 1 &&
          result.MH <= 12 && // Format MH
          result.YYYY >= 1970 &&
          result.YYYY <= 9999;
      }

      return { isValid, values: result };
    }

    // Fonction pour construire la date à partir des valeurs extraites
    function buildTimeFromValidatedParts(values) {
      const hourCycle = settings.hourCycle == '24h' ? 23 : 12;

      let hours = Math.min(values.HH || 0, hourCycle);
      const minutes = Math.min(values.MM || 0, 59);
      const seconds = Math.min(values.SS || 0, 59);
      const milliseconds = Math.min(values.SSS || 0, 999);

      const date = new Date(0);
      date.setUTCHours(hours, minutes, seconds, milliseconds);
      return date;
    }

    function buildDateFromValidatedParts(values) {
      const year = Math.min(Math.max(values.YYYY || 1970, 1970), 9999); // Année par défaut : 1970

      let month = 1;

      if (values.MM != null) {
        month = Math.min(Math.max(values.MM || 1, 1), 12) - 1; // Mois entre 0 et 11 (JavaScript)
      } else if (values.MH != null) {
        month = Math.min(Math.max(values.MH || 1, 1), 12) - 1; // Mois entre 0 et 11 (JavaScript)
      }

      // Calculer le nombre maximal de jours pour le mois et l'année donnés
      const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate(); // Dernier jour du mois
      const day = Math.min(Math.max(values.DD || 1, 1), daysInMonth); // Jour entre 1 et le maximum du mois

      // Création de la date en UTC
      const date = new Date(Date.UTC(year, month, day));
      return date;
    }

    // Fonction principale pour valider et construire la date
    function validateAndBuildTime(inputValue, format) {
      const result = processTimeInput(inputValue, format);
      const time = buildTimeFromValidatedParts(result.values);
      return time;
    }

    // Fonction principale pour valider et construire la date
    function validateAndBuildDate(inputValue, format) {
      const result = processDateInput(inputValue, format);
      const date = buildDateFromValidatedParts(result.values);
      return date;
    }

    function getTotalTimeSeconds(date) {
      let hours = date.getUTCHours(); // Heures (0-23)
      const minutes = date.getUTCMinutes(); // Minutes (0-59)
      const seconds = date.getUTCSeconds(); // Secondes (0-59)
      const milliseconds = date.getUTCMilliseconds(); // Millisecondes (0-999)

      if (settings.hourCycle === '12h') {
        const AMPM = $(
          'input[id^=systime_' + uniqueTypeShort + '_input]'
        ).val();
        const isPM = AMPM.toUpperCase() === 'PM';
        // Convertir les heures au format 24h
        if (isPM && hours < 12) {
          hours += 12; // Ajouter 12 heures pour PM
        } else if (!isPM && hours === 12) {
          hours = 0; // Minuit pour AM
        }
      }

      // Calcul des secondes totales avec millisecondes en fractions
      const totalSeconds =
        hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;

      return totalSeconds;
    }

    function getTotalDateSeconds(date) {
      return date.getTime() / 1000;
    }

    // Fonction pour extraire le temps d'une instance de Date
    function formatTimeFromDate(date, format, hourCycle) {
      function convertTo12HourFormat(hours) {
        const amOrPm = hours >= 12 ? 'PM' : 'AM';
        const hours12 = hours % 12 || 12; // Convertit 0 en 12 pour minuit
        return { hours12, amOrPm };
      }

      let hours;

      if (hourCycle === '12h') {
        hours = convertTo12HourFormat(date.getUTCHours())
          .hours12.toString()
          .padStart(2, '0');
      } else {
        hours = String(date.getUTCHours()).padStart(2, '0');
      }

      const minutes = String(date.getUTCMinutes()).padStart(2, '0');
      const seconds = String(date.getUTCSeconds()).padStart(2, '0');
      const milliseconds = String(date.getUTCMilliseconds()).padStart(3, '0');

      // Remplace en fonction du format
      return format
        .replace('HH', hours)
        .replace('MM', minutes)
        .replace('SS', seconds)
        .replace('SSS', milliseconds);
    }

    function formatDateFromDate(date, format) {
      const days = String(date.getDate()).padStart(2, '0'); // Jour du mois (1-31)
      const months = String(date.getMonth() + 1).padStart(2, '0'); // Mois de l'année (1-12)
      const years = String(date.getFullYear()); // Année complète (ex: 2024)
      return format
        .replace('DD', days)
        .replace('MM', months)
        .replace('MH', months)
        .replace('YYYY', years);
    }

    function formatTimeToCustomString(date, format) {
      return formatTimeFromDate(date, format, settings.hourCycle).replace(
        /[^a-zA-Z0-9]/g,
        ''
      ); // Supprime les séparateurs pour obtenir HHMMSSSSS
    }

    function formatDateToCustomString(date, format) {
      return formatDateFromDate(date, format).replace(/[^a-zA-Z0-9]/g, ''); // Supprime les séparateurs pour obtenir DDMMYYYY
    }

    function updateCurrentTimeValues(type, format) {
      let finalValue = computeValueFromInputs(type);
      let backValue = finalValue;
      const time = validateAndBuildTime(finalValue, format);
      finalValue = formatTimeToCustomString(time, format);
      if (backValue != finalValue) {
        fillDigits(finalValue, type);
      }
      updateCurrentValues('current', getTotalTimeSeconds(time));
    }

    function updateCurrentDateValues(type, format) {
      let finalValue = computeValueFromInputs(type);
      let backValue = finalValue;
      const date = validateAndBuildDate(finalValue, format);
      finalValue = formatDateToCustomString(date, format);
      if (backValue != finalValue) {
        fillDigits(finalValue, type);
      }
      updateCurrentValues('current', getTotalDateSeconds(date));
    }

    function updateFinalValue($input, newValue, type, onchange = true) {
      // Fonction pour mettre à jour la valeur finale et gérer les limites
      function updateNumericValue() {
        let finalValue = computeValueFromInputs(type);
        let backValue = finalValue;

        finalValue = adjustToBounds(
          finalValue,
          currentValues.totalMin,
          currentValues.totalMax,
          finalValue
        );

        finalValue = adjustToBoundsByAllDigit(
          finalValue,
          currentValues.limitMin,
          currentValues.limitMax,
          settings
        );
        // Met à jour la valeur 'current' dans currentValues
        updateCurrentValues('current', finalValue);
        // Met à jour les digits si la valeur finale a changé
        if (backValue !== getCurrentValueByIndex('current')) {
          fillDigits(getCurrentValueByIndex('current'), type);
        }
      }

      // Gestion des différents types de données
      switch (settings.type) {
        case 'integer':
        case 'float':
          updateNumericValue();
          break;

        case 'hexadecimal':
        case 'letter':
        case 'binary':
          updateCurrentValues('current', computeValueFromInputs(type));
          break;

        case 'text':
          updateCurrentValues('current', newValue);
          break;

        case 'time':
          updateCurrentTimeValues(type, settings.formatTime);
          break;

        case 'date':
          updateCurrentDateValues(type, settings.formatDate);
          break;

        default:
          throw new Error('Type de données non supporté.');
      }

      // Déclenche le callback de changement de valeur si nécessaire
      triggerValueChange($input, settings, onchange);
    }

    /* Changement de l'effet de persitance des valeur 
        possible en haut et en bas */
    function updatePeripheralDigit(
      type,
      id,
      showTop,
      showBottom,
      valueTop,
      valueBottom
    ) {
      $('.cla-input-wrapper .top-text-' + type + '-' + id).css(
        'visibility',
        'hidden'
      );
      $('.cla-input-wrapper .bottom-text-' + type + '-' + id).css(
        'visibility',
        'hidden'
      );
      $('.cla-input-wrapper .top-text-' + type + '-' + id).css('opacity', '0');
      $('.cla-input-wrapper .bottom-text-' + type + '-' + id).css(
        'opacity',
        '0'
      );

      if (showTop) {
        $('.cla-input-wrapper .top-text-' + type + '-' + id).css(
          'visibility',
          'visible'
        );

        if (settings.type === 'text') {
          $('.cla-input-wrapper .top-text-' + type + '-' + id).html(valueTop);
        } else {
          setElement(
            'div',
            $('.cla-input-wrapper .top-text-' + type + '-' + id),
            valueTop,
            settings
          );
        }
        $('.cla-input-wrapper .top-text-' + type + '-' + id).css(
          'opacity',
          '1'
        );
      }

      if (showBottom) {
        $('.cla-input-wrapper .bottom-text-' + type + '-' + id).css(
          'visibility',
          'visible'
        );

        if (settings.type === 'text') {
          $('.cla-input-wrapper .bottom-text-' + type + '-' + id).html(
            valueBottom
          );
        } else {
          setElement(
            'div',
            $('.cla-input-wrapper .bottom-text-' + type + '-' + id),
            valueBottom,
            settings
          );
        }
        $('.cla-input-wrapper .bottom-text-' + type + '-' + id).css(
          'opacity',
          '1'
        );
      }
    }

    function numberToDigitsArray(number) {
      // Convertir le nombre en chaîne de caractères, supprimer le point décimal pour les floats
      const numberStr = Math.abs(number).toString().replace('.', '');

      // Initialiser le tableau de chiffres en extrayant chaque chiffre
      let digitsArray = Array.from(numberStr, (char) =>
        convertIntegerBase10(char)
      );

      // Limiter le tableau à la taille numInputs, au cas où il y aurait trop de chiffres
      return digitsArray.slice(0, settings.numInputs);
    }

    function digitsArrayToNumber(digitsArray, isFloat, decimalPosition) {
      // Convertir chaque chiffre en chaîne de caractères
      let numberStr = digitsArray.map((digit) => digit.toString()).join('');

      // Si un index de décimale est fourni, insérer le point décimal
      if (isFloat && decimalPosition < digitsArray.length) {
        numberStr =
          numberStr.slice(0, decimalPosition) +
          '.' +
          numberStr.slice(decimalPosition);
      }

      // Convertir la chaîne résultante en nombre (float ou integer selon la présence du point)
      return convertFloat(numberStr);
    }

    function calculatePeripheralDisplay(
      prefix,
      id,
      value,
      inputElement,
      hover
    ) {
      // Vérification initiale pour le hover
      if (hover !== gIdHover) {
        return {
          index: -1,
          showTop: false,
          showBottom: false,
          adjustedValueTop: 0,
          adjustedValueBottom: 0,
        };
      }

      // Dictionnaire d'actions pour chaque type de `prefix`
      const actions = {
        digits: () => {
          const valueLimits = calculateValueLimits(
            inputElement,
            id,
            getCurrentValueByIndex('current'),
            currentValues.limitDigitMin,
            currentValues.limitDigitMax
          );

          return {
            index: id,
            showTop: valueLimits.showTop,
            showBottom: valueLimits.showBottom,
            adjustedValueTop: valueLimits.valueTop,
            adjustedValueBottom: valueLimits.valueBottom,
          };
        },
        month: () => {
          const valueLimits = calculateValueLimits(
            inputElement,
            id,
            getCurrentValueByIndex('current'),
            currentValues.limitDigitMin,
            currentValues.limitDigitMax
          );
          return {
            index: id,
            showTop: valueLimits.showTop,
            showBottom: valueLimits.showBottom,
            adjustedValueTop: valueLimits.valueTop,
            adjustedValueBottom: valueLimits.valueBottom,
          };
        },
        sign: () => {
          return {
            index: prefix,
            showTop: value === '-',
            showBottom: value === '+',
            adjustedValueTop: '+',
            adjustedValueBottom: '-',
          };
        },
        systime: () => {
          return {
            index: prefix,
            showTop: value === 'PM',
            showBottom: value === 'AM',
            adjustedValueTop: 'AM',
            adjustedValueBottom: 'PM',
          };
        },
        list: () => {
          const { valueTop, valueBottom } = calculateAdjacentValues(value);
          const valueLimits = calculateVisibilityAndAdjustLimits(
            valueTop,
            valueBottom,
            0,
            settings.values.length - 1
          );
          return {
            index: prefix,
            showTop: valueLimits.showTop,
            showBottom: valueLimits.showBottom,
            adjustedValueTop: settings.values[valueLimits.adjustedValueTop],
            adjustedValueBottom:
              settings.values[valueLimits.adjustedValueBottom],
          };
        },
      };

      // prettier-ignore
      return actions[prefix] ? actions[prefix]() : { index: -1, showTop: false, showBottom: false, adjustedValueTop: 0, adjustedValueBottom: 0 };
    }

    function setValueInput(inputElement, value, prefix, type) {
      // Déterminer l'ID pour les types `digit` et `list`
      const id =
        prefix === 'digits' || prefix === 'month'
          ? $(inputElement).attr('id').replace(`${prefix}_${type}_input_`, '')
          : prefix;
      const hover =
        type + (prefix === 'digits' || prefix === 'month' ? id : prefix);

      // Dictionnaire des actions pour définir `newValue` et mettre à jour `currentValues`
      const actions = {
        month: () => {
          updateCurrentValues(id - 1, settings.months[value - 1]);
          setElement(
            'input',
            $(inputElement),
            settings.months[value - 1],
            settings
          );
          return settings.months[value - 1];
        },
        digits: () => {
          updateCurrentValues(id - 1, value);
          setElement('input', $(inputElement), value, settings);
          return value;
        },
        sign: () => {
          updateCurrentValues('sign', value);
          setElement('input', $(inputElement), value, settings);
          return value;
        },
        systime: () => {
          updateCurrentValues('systime', value);
          setElement('input', $(inputElement), value, settings);
          return value;
        },
        list: () => {
          const listValue = settings.values[value];
          updateCurrentValues('list', listValue);
          inputElement.val(listValue);
          return listValue;
        },
      };

      updateFinalValue($(inputElement), actions[prefix](), type);

      // Calcul des informations pour l'affichage périphérique
      const displayData = calculatePeripheralDisplay(
        prefix,
        id,
        value,
        inputElement,
        hover
      );

      // Mise à jour de l'affichage périphérique avec les données calculées
      updatePeripheralDigit(
        type,
        displayData.index,
        displayData.showTop,
        displayData.showBottom,
        prefix == 'month'
          ? settings.months[parseInt(displayData.adjustedValueTop) - 1]
          : displayData.adjustedValueTop,
        prefix == 'month'
          ? settings.months[parseInt(displayData.adjustedValueBottom) - 1]
          : displayData.adjustedValueBottom
      );
    }

    function isSpecialKey(event, codeTouche) {
      return (
        (event.ctrlKey && (event.key === 'c' || codeTouche === 67)) ||
        (event.ctrlKey && (event.key === 'v' || codeTouche === 86)) ||
        (!event.ctrlKey && codeTouche === 17)
      );
    }

    function isControlKey(codeTouche, settings) {
      // Backspace, Tab, Delete, ArrowUp, ArrowDown,ArrowLeft, ArrowRight
      return (
        [8, 9, 46].includes(codeTouche) ||
        (isAllowArrowKeys(settings) && [37, 38, 39, 40].includes(codeTouche))
      );
    }

    function navigateInput(prefix, type, id, direction, settings) {
      // Ajuster l'id en fonction de la direction
      if (direction === 'previous') {
        id = id - 1 === 0 ? settings.numInputs : id - 1;
      } else if (direction === 'next') {
        id = id + 1 === settings.numInputs + 1 ? 1 : id + 1;
      }

      // Appliquer le focus au champ correspondant
      $(`#${prefix}_${type}_input_${id}`).focus();
    }

    function handleBackspace(
      inputElement,
      type,
      id,
      prefix,
      valueMin,
      settings
    ) {
      setValueInput(inputElement, valueMin, prefix, type);
      navigateInput(prefix, type, id, 'previous', settings);
    }

    function handleDelete(inputElement, type, id, prefix, valueMin, settings) {
      setValueInput(inputElement, valueMin, prefix, type);
      navigateInput(prefix, type, id, 'next', settings);
    }

    function handleDigitEntry(inputElement, event, type, id, prefix, settings) {
      let key = event.key;
      if (settings.type == 'hexadecimal')
        key = convertLetterToHexadecimal(event.key);
      if (settings.type == 'letter') key = convertLetter(event.key);
      setValueInput(inputElement, key, prefix, type);
      navigateInput(
        prefix,
        type,
        calculateNextIndex(id, settings),
        null,
        settings
      );
    }

    function handleArrowUp(inputElement, type, id, prefix, settings) {
      // Récupérer la valeur actuelle

      let currentValue = -1;

      if (settings.type == 'hexadecimal')
        currentValue = convertLetterToHexadecimal($(inputElement).val());
      else if (settings.type == 'letter')
        currentValue = convertLetter($(inputElement).val());
      else currentValue = convertIntegerBase10($(inputElement).val());

      // Incrémenter la valeur
      currentValue -= 1;

      const { valueMin, valueMax } = getValueInputLimits(
        getCurrentValueByIndex('current'),
        inputElement,
        settings
      );

      currentValue = adjustLimits(
        currentValue,
        valueMin,
        valueMax
      ).adjustedValue;

      setValueInput(inputElement, currentValue, prefix, type);
      navigateInput(prefix, type, id, null, settings);
    }

    function handleArrowDown(inputElement, type, id, prefix, settings) {
      // Récupérer la valeur actuelle
      let currentValue = -1;

      if (settings.type == 'hexadecimal')
        currentValue = convertLetterToHexadecimal($(inputElement).val());
      else if (settings.type == 'letter')
        currentValue = convertLetter($(inputElement).val());
      else currentValue = convertIntegerBase10($(inputElement).val());

      // Décrémenter la valeur
      currentValue += 1;

      const { valueMin, valueMax } = getValueInputLimits(
        getCurrentValueByIndex('current'),
        inputElement,
        settings
      );

      currentValue = adjustLimits(
        currentValue,
        valueMin,
        valueMax
      ).adjustedValue;

      setValueInput(inputElement, currentValue, prefix, type);
      navigateInput(prefix, type, id, null, settings);
    }

    function processDigitInput({
      inputElement,
      codeTouche,
      event,
      type,
      id,
      prefix,
      valueMin,
      settings,
    }) {
      if (codeTouche === 8) {
        // Handle Backspace
        handleBackspace(inputElement, type, id, prefix, valueMin, settings);
      } else if (codeTouche === 46) {
        // Handle Delete
        handleDelete(inputElement, type, id, prefix, valueMin, settings);
      } else if (codeTouche === 9) {
        // Handle Tab (actuellement vide)
      } else if (codeTouche === 37) {
        // Handle ArrowLeft
        navigateInput(prefix, type, id, 'previous', settings);
      } else if (codeTouche === 38) {
        // Handle ArrowUp
        handleArrowUp(inputElement, type, id, prefix, settings);
      } else if (codeTouche === 39) {
        // Handle ArrowRight
        navigateInput(prefix, type, id, 'next', settings);
      } else if (codeTouche === 40) {
        // Handle ArrowDown
        handleArrowDown(inputElement, type, id, prefix, settings);
      } else {
        handleDigitEntry(inputElement, event, type, id, prefix, settings);
      }
    }

    function handleDigitsInput(
      inputElement,
      codeTouche,
      event,
      type,
      prefix,
      id,
      settings
    ) {
      // Récupérer les limites pour `digit`
      const { valueMin, valueMax } = getValueLimits(settings);

      // Vérifier si la touche est valide pour un chiffre
      if (
        isKeyAllowed(
          codeTouche,
          event.key,
          valueMax,
          settings.type,
          isAllowArrowKeys(settings)
        ) ||
        isControlKey(codeTouche, settings)
      ) {
        processDigitInput({
          inputElement,
          codeTouche,
          event,
          type,
          id,
          prefix,
          valueMin,
          settings,
        });
      } else {
        // Valeur non valide pour un digit
        setValueInput(inputElement, valueMin, prefix, type);
        event.preventDefault();
      }
    }

    function handleSignInput(inputElement, codeTouche, event, type, prefix) {
      // Gestion des signes
      if (event.key === '+' || event.key === '-') {
        setValueInput(inputElement, event.key, prefix, type);
      } else if (codeTouche !== 9) {
        // Valeur non valide pour un signe
        setValueInput(inputElement, '+', prefix, type);
        event.preventDefault();
      }
    }

    function applyInput(
      inputElement,
      codeTouche,
      event,
      prefix,
      type,
      id,
      settings
    ) {
      // Gestion des touches de contrôle (Copier, Coller)
      if (isSpecialKey(event, codeTouche)) {
        event.preventDefault();
        return;
      }

      switch (prefix) {
        case 'digits':
          handleDigitsInput(
            inputElement,
            codeTouche,
            event,
            type,
            prefix,
            id,
            settings
          );
          break;
        case 'sign':
          handleSignInput(inputElement, codeTouche, event, type, prefix);
          break;
      }
    }

    function handleTouchInput(inputElement, event, prefix, type, id, settings) {
      const originalEvent = event.originalEvent || event;

      // Récupérer le code de la touche appuyée
      const codeTouche = originalEvent.keyCode || originalEvent.which;

      // Vérifie si la touche "Maj" (Shift) n'est pas enfoncée
      if (codeTouche !== 16) {
        applyInput(
          inputElement,
          codeTouche,
          originalEvent,
          prefix,
          type,
          id,
          settings
        );
      }
    }

    /* Gestionnaire de modification de la mollette de la souris */

    function adjustOnScroll(inputElement, event, prefix, type) {
      if (settings.maskInput === true) return;
      if (!settings.allowScroll) return;
      const originalEvent = event.originalEvent || event;
      originalEvent.preventDefault();

      if (!isKeyRequiredForScroll(event)) return;

      const delta = calculateDelta(originalEvent);
      if (Math.abs(delta) < settings.scrollSensitivity) return;

      handlePrefixScroll(prefix, inputElement, delta, type);
    }

    function isKeyRequiredForScroll(event) {
      if (!settings.requireKeyForScroll) return true;
      const keyRequired = settings.requireKeyForScroll.toLowerCase();
      return (
        (keyRequired === 'control' && event.ctrlKey) ||
        (keyRequired === 'shift' && event.shiftKey) ||
        (keyRequired === 'alt' && event.altKey) ||
        (keyRequired === 'meta' && event.metaKey)
      );
    }

    function calculateDelta(originalEvent) {
      if (originalEvent.deltaY !== undefined) return originalEvent.deltaY;
      if (originalEvent.wheelDelta !== undefined)
        return originalEvent.wheelDelta;
      return 0;
    }

    function handlePrefixScroll(prefix, inputElement, delta, type) {
      switch (prefix) {
        case 'month':
          handleMonthScroll(inputElement, delta, type);
          break;
        case 'digits':
          handleDigitsScroll(inputElement, delta, type);
          break;
        case 'sign':
          handleSignScroll(inputElement, delta, type);
          break;
        case 'systime':
          handleSysTimeScroll(inputElement, delta, type);
          break;
        case 'list':
          handleListScroll(inputElement, delta, type);
          break;
      }
    }

    function handleMonthScroll(inputElement, delta, type) {
      let currentValue = parseInt(
        settings.monthMap.get($(inputElement).val()),
        10
      ); // Récupère la valeur de l'élément
      if (currentValue != -1) {
        currentValue += delta < 0 ? -1 : 1;
        const { valueMin, valueMax } = getValueInputLimits(
          getCurrentValueByIndex('current'),
          inputElement,
          settings
        );

        currentValue = adjustLimits(
          currentValue,
          valueMin,
          valueMax
        ).adjustedValue;
      }

      setValueInput(inputElement, currentValue, 'month', type);
    }

    function handleDigitsScroll(inputElement, delta, type) {
      let currentValue = getElement('input', $(inputElement), settings);

      if (currentValue != -1) {
        currentValue += delta < 0 ? -1 : 1;
        const { valueMin, valueMax } = getValueInputLimits(
          getCurrentValueByIndex('current'),
          inputElement,
          settings
        );

        currentValue = adjustLimits(
          currentValue,
          valueMin,
          valueMax
        ).adjustedValue;

        setValueInput(inputElement, currentValue, 'digits', type);
      }
    }

    function handleSignScroll(inputElement, delta, type) {
      let currentValue = -1;

      if (inputElement.val() == '-') currentValue = 0;
      if (inputElement.val() == '+') currentValue = 1;

      if (currentValue != -1) {
        // Incrémenter ou décrémenter la valeur en fonction de la direction du scroll
        currentValue += delta < 0 ? -1 : 1;
        // Contrôler les limites de la valeur
        if (currentValue < 0) setValueInput(inputElement, '+', 'sign', type);
        if (currentValue > 1) setValueInput(inputElement, '-', 'sign', type);
      }
    }

    function handleSysTimeScroll(inputElement, delta, type) {
      let currentValue = -1;

      if (inputElement.val() == 'PM') currentValue = 0;
      if (inputElement.val() == 'AM') currentValue = 1;

      if (currentValue != -1) {
        // Incrémenter ou décrémenter la valeur en fonction de la direction du scroll
        currentValue += delta < 0 ? -1 : 1;

        // Contrôler les limites de la valeur
        if (currentValue < 0)
          setValueInput(inputElement, 'AM', 'systime', type);
        if (currentValue > 1)
          setValueInput(inputElement, 'PM', 'systime', type);
      }
    }

    function handleListScroll(inputElement, delta, type) {
      let currentValue = findPosition(settings.values, inputElement.val());
      if (currentValue != -1) {
        currentValue += delta < 0 ? -1 : 1;
        currentValue = adjustLimits(
          currentValue,
          0,
          settings.values.length - 1
        ).adjustedValue;
        setValueInput(inputElement, currentValue, 'list', type);
      }
    }

    function calculateValueLimits(
      inputElement,
      id,
      currentValue,
      digitMinLimit,
      digitMaxLimit
    ) {
      let { valueTop, valueBottom } = calculateAdjacentValues(
        getElement('input', $(inputElement), settings)
      );

      valueTop = adjustToBounds(
        currentValue,
        -Infinity,
        currentValues.limitMax,
        valueTop,
        null,
        getValidLimitDigit(digitMaxLimit, id) - 1
      );
      valueBottom = adjustToBounds(
        currentValue,
        currentValues.limitMin,
        +Infinity,
        valueBottom,
        getValidLimitDigit(digitMinLimit, id) + 1,
        null
      );

      let { valueMin, valueMax } = getValueInputLimits(
        currentValue,
        inputElement,
        settings
      );

      // Calculer les indicateurs de visibilité pour top et bottom
      let showTop = valueTop >= valueMin;
      let showBottom = valueBottom <= valueMax;

      return { valueTop, valueBottom, valueMin, valueMax, showTop, showBottom };
    }

    function adjustLimits(
      value,
      valueMin,
      valueMax,
      valueTop = null,
      valueBottom = null
    ) {
      // Si seule la valeur unique est fournie, ajuster selon les limites min/max
      if (valueTop === null && valueBottom === null) {
        const adjustedValue = Math.max(valueMin, Math.min(value, valueMax));
        return { adjustedValue };
      }

      // Ajuster les valeurs si elles sont en dehors des limites
      const adjustedValueTop = Math.max(valueTop, valueMin);
      const adjustedValueBottom = Math.min(valueBottom, valueMax);

      return {
        adjustedValueTop,
        adjustedValueBottom,
      };
    }

    function calculateVisibilityAndAdjustLimits(
      valueTop,
      valueBottom,
      valueMin,
      valueMax
    ) {
      // Calculer la visibilité en fonction des valeurs et des limites
      const showTop = valueTop >= valueMin;
      const showBottom = valueBottom <= valueMax;

      // Ajuster les valeurs si elles sont en dehors des limites
      const { adjustedValueTop, adjustedValueBottom } = adjustLimits(
        null,
        valueMin,
        valueMax,
        valueTop,
        valueBottom
      );

      return {
        showTop,
        showBottom,
        adjustedValueTop,
        adjustedValueBottom,
      };
    }

    function hoverMouseEnter(inputElement, prefix, type) {
      if (settings.maskInput === true) return;

      let id = convertIntegerBase10(
        $(inputElement)
          .attr('id')
          .replace(prefix + '_' + type + '_input_', '')
      );

      if (prefix == 'digits' || prefix == 'month') {
        gIdHover = type + id;

        let valueLimites = calculateValueLimits(
          inputElement,
          id,
          getCurrentValueByIndex('current'),
          currentValues.limitDigitMin,
          currentValues.limitDigitMax
        );

        updatePeripheralDigit(
          type,
          id,
          valueLimites.showTop,
          valueLimites.showBottom,
          prefix == 'month'
            ? settings.months[parseInt(valueLimites.valueTop) - 1]
            : valueLimites.valueTop,
          prefix == 'month'
            ? settings.months[parseInt(valueLimites.valueBottom) - 1]
            : valueLimites.valueBottom
        );
      } else if (prefix == 'systime') {
        gIdHover = type + prefix;
        let showTop = $(inputElement).val() == 'PM';
        let showBottom = $(inputElement).val() == 'AM';
        updatePeripheralDigit(type, prefix, showTop, showBottom, 'AM', 'PM');
      } else if (prefix == 'sign') {
        gIdHover = type + prefix;
        let showTop = $(inputElement).val() == '-';
        let showBottom = $(inputElement).val() == '+';
        updatePeripheralDigit(type, prefix, showTop, showBottom, '+', '-');
      } else if (prefix == 'list') {
        gIdHover = type + prefix;

        let currentValue = findPosition(settings.values, inputElement.value);
        if (currentValue != -1) {
          const valueTop = convertIntegerBase10(currentValue) - 1;
          const valueBottom = convertIntegerBase10(currentValue) + 1;
          let valueLimites = calculateVisibilityAndAdjustLimits(
            valueTop,
            valueBottom,
            0,
            settings.values.length - 1
          );
          updatePeripheralDigit(
            type,
            prefix,
            valueLimites.showTop,
            valueLimites.showBottom,
            settings.values[valueLimites.adjustedValueTop],
            settings.values[valueLimites.adjustedValueBottom]
          );
        }
      }
    }

    function hoverMouseLeave(inputElement, prefix, type) {
      if (prefix == 'digits' || prefix == 'month') {
        let id = $(inputElement)
          .attr('id')
          .replace(prefix + '_' + type + '_input_', '');
        updatePeripheralDigit(type, id, false, false, 0, 0);
      } else if (prefix == 'sign' || prefix == 'list' || prefix == 'systime') {
        updatePeripheralDigit(type, prefix, false, false, 0, 0);
      }
      gIdHover = null;
    }

    function toggleHoverEffect(element, prefix, type, isMouseEnter) {
      const suffix = $(element)
        .attr('id')
        .replace(`${prefix}_${type}_div_`, '');
      const position = suffix.includes('top') ? 'top' : 'bottom';
      const id = suffix.replace(`${position}_`, '');
      const selector = `.cla-input-wrapper .${position}-text-${type}-${id}`;

      $(selector).css({
        visibility: isMouseEnter ? 'visible' : 'hidden',
        opacity: isMouseEnter ? '1' : '0',
      });
    }

    function handleTextDivClick(element, prefix, type) {
      const suffix = $(element)
        .attr('id')
        .replace(`${prefix}_${type}_div_`, '');

      if (prefix === 'digits') {
        handleDigitsClick(element, suffix, prefix, type);
      } else if (prefix === 'month') {
        handleMonthClick(element, suffix, prefix, type);
      } else if (prefix === 'sign' || prefix === 'systime') {
        handleSignAndSysTimeClick(element, prefix, type);
      } else if (prefix === 'list') {
        handleListClick(element, suffix, prefix, type);
      }
    }

    function handleMonthClick(element, suffix, prefix, type) {
      const id = suffix.replace(/(top_|bottom_)/, '');
      const value = getElement('div', $(element), settings);

      if (!isValidValue(value) || isNaN(value)) return;

      setElement(
        'input',
        $(`#${prefix}_${type}_input_${id}`),
        settings.months[value - 1],
        settings
      );
      updateFinalValue(
        $(`#${prefix}_${type}_input_${id}`),
        settings.months[value - 1],
        type
      );
      gIdHover = `${type}${id}`;

      const isTop = suffix.includes('top');

      const valueLimits = calculateValueLimits(
        $(`#${prefix}_${type}_input_${id}`),
        id,
        getCurrentValueByIndex('current'),
        currentValues.limitDigitMin,
        currentValues.limitDigitMax
      );

      updatePeripheralDigit(
        type,
        id,
        isTop ? valueLimits.showTop : false,
        isTop ? false : valueLimits.showBottom,
        isTop ? settings.months[parseInt(valueLimits.valueTop) - 1] : 0,
        isTop ? 0 : settings.months[parseInt(valueLimits.valueBottom) - 1]
      );

      gIdHover = null;
    }

    // Gestion du préfixe 'digits'
    function handleDigitsClick(element, suffix, prefix, type) {
      const id = suffix.replace(/(top_|bottom_)/, '');
      const value = getElement('div', $(element), settings);

      if (!isValidValue(value) || isNaN(value)) return;

      setElement('input', $(`#${prefix}_${type}_input_${id}`), value, settings);
      updateFinalValue($(`#${prefix}_${type}_input_${id}`), value, type);
      gIdHover = `${type}${id}`;

      const isTop = suffix.includes('top');

      const valueLimits = calculateValueLimits(
        $(`#${prefix}_${type}_input_${id}`),
        id,
        getCurrentValueByIndex('current'),
        currentValues.limitDigitMin,
        currentValues.limitDigitMax
      );

      updatePeripheralDigit(
        type,
        id,
        isTop ? valueLimits.showTop : false,
        isTop ? false : valueLimits.showBottom,
        isTop ? valueLimits.valueTop : 0,
        isTop ? 0 : valueLimits.valueBottom
      );

      gIdHover = null;
    }

    // Gestion du préfixe 'sign' et 'systime'
    function handleSignAndSysTimeClick(element, prefix, type) {
      const value = $(element).html();
      if (!isValidValue(value)) return;

      const inputElement = $(`#${prefix}_${type}_input_${prefix}`);
      inputElement.val(value);
      updateFinalValue(inputElement, value, type);

      gIdHover = `${type}${prefix}`;
      updatePeripheralDigit(type, prefix, false, false, 0, 0);
      gIdHover = null;
    }

    // Gestion du préfixe 'list'
    function handleListClick(element, suffix, prefix, type) {
      const value = $(element).html();
      if (!isValidValue(value)) return;

      const inputElement = $(`#${prefix}_${type}_input_${prefix}`);
      inputElement.val(value);
      updateFinalValue(inputElement, value, type);

      gIdHover = `${type}${prefix}`;
      const currentValue = findPosition(settings.values, value);

      const isTop = suffix.includes('top');
      const adjustedValue = isTop ? currentValue - 1 : currentValue + 1;
      const valueLimits = calculateVisibilityAndAdjustLimits(
        isTop ? adjustedValue : 0,
        isTop ? 0 : adjustedValue,
        0,
        settings.values.length - 1
      );

      updatePeripheralDigit(
        type,
        prefix,
        isTop ? valueLimits.showTop : false,
        isTop ? false : valueLimits.showBottom,
        isTop ? settings.values[valueLimits.adjustedValueTop] : '...',
        isTop ? '...' : settings.values[valueLimits.adjustedValueBottom]
      );

      gIdHover = null;
    }

    // Validation de la valeur
    function isValidValue(value) {
      return value !== null && value !== '';
    }

    function getAdjustedValueSettings(index, settings, inputValue = null) {
      // prettier-ignore
      const min = settings.minValues[index] !== undefined 
                ? Math.max(valueDigitMin(settings), Math.min( minValue(index,settings), valueDigitMax(settings))) 
                :  valueDigitMin(settings);

      // prettier-ignore
      const max = settings.maxValues[index] !== undefined 
                ? Math.max(valueDigitMin(settings), Math.min(maxValue(index,settings), valueDigitMax(settings))) 
                : valueDigitMax(settings);

      let value;
      if (inputValue != null) {
        value = inputValue;
      } else if (settings.values[index] !== undefined) {
        value = defaultValue(index, settings);
      } else {
        value = settings.defaultValue;
      }

      // Ajuster `value` pour qu'il soit compris entre `min` et `max`
      value = clampCore(
        value,
        valueDigitMin(settings),
        valueDigitMax(settings)
      );
      return { min, max, value };
    }

    function handlePasteEvent(inputElement, event, prefix, type, id, settings) {
      const originalEvent = event.originalEvent || event;

      originalEvent.preventDefault();
      let pasteText = originalEvent.clipboardData.getData('text');
      if (pasteText.length > 1) pasteText = pasteText.substring(0, 1); // Limiter à un caractère
      let codeTouche = pasteText.charCodeAt(0);
      originalEvent.ctrlKey = false;
      originalEvent.key = pasteText;

      applyInput(
        inputElement,
        codeTouche,
        originalEvent,
        prefix,
        type,
        id,
        settings
      );
    }

    function createTextElement(prefix, uniqueTypeShort, id, position, text) {
      return $('<div>', {
        class: `cla-hover-text ${position}-text-${uniqueTypeShort}-${id}`,
        id: `${prefix}_${uniqueTypeShort}_div_${position}_${id}`,
        text: text,
      })
        .hover(
          function () {
            toggleHoverEffect(this, prefix, uniqueTypeShort, true);
          },
          function () {
            toggleHoverEffect(this, prefix, uniqueTypeShort, false);
          }
        )
        .on('click', function () {
          handleTextDivClick(this, prefix, uniqueTypeShort);
        });
    }

    function createInputElement(
      prefix,
      uniqueTypeShort,
      id,
      value,
      { min, max, maxLength, isDisabled }
    ) {
      // Créer une étiquette avec un texte descriptif pour chaque champ
      const labelId = `${prefix}_${uniqueTypeShort}_label_${id}`;
      const $label = $('<label>', {
        for: `${prefix}_${uniqueTypeShort}_input_${id}`,
        id: labelId,
        text: `Entrée ${id} pour ${settings.type}`,
        class: 'sr-only visually-hidden',
      });

      const $description = $('<div>', {
        id: `description_${uniqueTypeShort}_input_${id}`,
        class: 'visually-hidden',
        text: 'Utilisez la molette ou cliquez sur la valeur suivante ou précédente visible pour modifier la valeur.',
      });
      $('body').append($description);

      const $liveRegion = $('<div>', {
        'aria-live': 'polite',
        class: 'visually-hidden',
        id: 'live-update',
      });
      $('body').append($liveRegion);

      const $input = $('<input>', {
        type: settings.maskInput === true ? 'password' : 'text',
        class: `truncate-${prefix} form-control form-control-lg text-center cla-h2-like ${prefix}-input`,
        maxLength: maxLength,
        id: `${prefix}_${uniqueTypeShort}_input_${id}`,
        name: `${prefix}${id}`,
        autocomplete: 'off',
        value:
          settings.type === 'text' ? value : makeValueElement(value, settings),
        'data-min': min,
        'data-max': max,
        disabled: isDisabled ? 'disabled' : null,
        // Ajouter des attributs ARIA pour améliorer l'accessibilité
        'aria-labelledby': `${labelId}`,
        'aria-valuemin': min,
        'aria-valuemax': max,
        'aria-valuenow':
          settings.type === 'text' ? value : makeValueElement(value, settings),
        'aria-live': 'polite',
        role: 'spinbutton', // Indiquer qu'il s'agit d'un champ de saisie ajustable
      });

      // Lier les descriptions avec l'input
      $input.attr('aria-describedby', 'input-description');

      // Ajouter les événements comme avant
      $input
        .on('keyup', (event) => {
          if (settings.type != 'text' && settings.isDisabled) return;
          const $element = $(event.currentTarget);
          handleTouchInput(
            $element,
            event,
            prefix,
            uniqueTypeShort,
            id,
            settings
          );
        })
        .on('wheel', (event) => {
          if (settings.type != 'text' && settings.isDisabled) return;
          const $element = $(event.currentTarget);
          adjustOnScroll($element, event, prefix, uniqueTypeShort);
        })
        .hover(
          function () {
            if (settings.type != 'text' && settings.isDisabled) return;
            hoverMouseEnter(this, prefix, uniqueTypeShort);
          },
          function () {
            if (settings.type != 'text' && settings.isDisabled) return;
            hoverMouseLeave(this, prefix, uniqueTypeShort);
          }
        )
        .on('paste', (event) => {
          const $element = $(event.currentTarget);
          handlePasteEvent(
            $element,
            event,
            prefix,
            uniqueTypeShort,
            id,
            settings
          );
        })
        .on('copy', (event) => {
          event.preventDefault();
          const $element = $(event.currentTarget);
          navigator.clipboard.writeText($element.val());
        });

      // Retourner un conteneur contenant le label et l'input
      return $('<div>', {
        class: 'cla-input-wrapper',
        css: { position: 'relative' },
      })
        .append($label)
        .append($input);
    }

    let $container = null;
    let $inputContainer = null;

    function processSeparators(index, result) {
      let separatorIndex = index;

      if (separatorIndex < result.separators.length) {
        $inputContainer.append(
          $('<div>', {
            class: 'col-auto',
            html: `<div><h2 class="my-5">${result.separators[separatorIndex]}</h2></div>`,
          })
        );
        separatorIndex++;
      }

      return separatorIndex;
    }

    function getMaxLimits(result, partIndex) {
      return result.maxlimits[partIndex].split(',');
    }

    function getMinLimits(result, partIndex) {
      return result.minlimits[partIndex].split(',');
    }

    function processPartValues(
      funcAddInputElement,
      part,
      partLength,
      minlimits,
      maxlimits,
      stringDefaultValue,
      inputIndex,
      stringIndex,
      monthValue,
      monthStringLength
    ) {
      for (let i = 0; i < partLength; i++) {
        const value =
          part == 'MH' ? monthValue : stringDefaultValue[stringIndex];
        funcAddInputElement(
          part == 'MH' ? 'month' : 'digits',
          inputIndex + 1,
          minlimits[i],
          maxlimits[i],
          part == 'MH' ? settings.months[value - 1] : value,
          part == 'MH' ? '30' : '1',
          part == 'MH' ? true : isDisabled(settings)
        );
        updateCurrentValues(
          inputIndex,
          part == 'MH' ? settings.months[value - 1] : value
        );
        inputIndex++;
        if (part != 'MH') {
          stringIndex++;
        }
      }
      if (part == 'MH') {
        stringIndex += monthStringLength;
      }
      return { inputIndex, stringIndex };
    }

    function processParts(
      funcAddInputElement,
      result,
      stringDefaultValue,
      monthValue,
      monthStringLength
    ) {
      let separatorIndex = 0;
      let inputIndex = 0;
      let stringIndex = 0;

      result.sizes.forEach((partLength, partIndex) => {
        const minlimits = getMinLimits(result, partIndex);
        const maxlimits = getMaxLimits(result, partIndex);

        const indices = processPartValues(
          funcAddInputElement,
          result.parts[partIndex],
          partLength,
          minlimits,
          maxlimits,
          stringDefaultValue,
          inputIndex,
          stringIndex,
          monthValue,
          monthStringLength
        );
        inputIndex = indices.inputIndex;
        stringIndex = indices.stringIndex;
        separatorIndex = processSeparators(separatorIndex, result);
      });
    }

    this.each(function () {
      $container = $(this);

      // Création d'un div parent avec la classe `cla-input-container` pour appliquer le `gap`
      $inputContainer = $('<div>', {
        class: 'cla-input-container',
        css: {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: settings.gap,
        },
      });

      // Fonction pour ajouter un élément d'input et ses éléments associés
      function addInputElement(
        prefix,
        id,
        min,
        max,
        value,
        maxLength,
        isDisabled
      ) {
        const $wrapperDiv = $('<div>', {
          class: 'text-center cla-input-wrapper',
          css: { position: 'relative' },
        });
        $wrapperDiv.append(
          createTextElement(prefix, uniqueTypeShort, id, 'top', '&nbsp;')
        );

        $wrapperDiv.append(
          createInputElement(prefix, uniqueTypeShort, id, value, {
            min,
            max,
            maxLength,
            isDisabled,
          })
        );
        $wrapperDiv.append(
          createTextElement(prefix, uniqueTypeShort, id, 'bottom', '&nbsp;')
        );
        $inputContainer.append($wrapperDiv);
      }

      // Ajoute les préfixes spécifiques aux types "binary" et "hexadecimal"
      function addPrefixLabel(prefix) {
        const labelMap = { binary: '0b', hexadecimal: '0x' };
        if (labelMap[prefix]) {
          $inputContainer.append(
            $('<div>', {
              class: 'col-1',
              html: `<div><h2 class="my-5">${labelMap[prefix]}</h2></div>`,
            })
          );
        }
      }

      function addInputTimeElement() {
        const result = analyzeTimeFormat(settings.formatTime);
        settings.numInputs = result.numinputs;

        const defaultValue = parseDefaultTimeValue(
          settings.defaultValue,
          settings.formatTime
        );
        const date = new Date(0);
        date.setUTCMilliseconds(Math.round(defaultValue * 1000));

        const stringDefaultValue = formatTimeToCustomString(
          date,
          settings.formatTime
        );

        processParts(addInputElement, result, stringDefaultValue);
      }

      function addInputDateElement() {
        const result = analyzeDateFormat(settings.formatDate);
        settings.numInputs = result.numinputs;

        const defaultValueSecond = parseDefaultDateValue(
          settings.defaultValue,
          settings.formatDate
        );

        const date = new Date(0);
        date.setUTCMilliseconds(Math.round(defaultValueSecond * 1000));
        const monthValue = date.getUTCMonth() + 1;
        const monthStringLength = String(monthValue).padStart(2, '0').length;

        const stringDefaultValue = formatDateToCustomString(
          date,
          settings.formatDate
        );

        processParts(
          addInputElement,
          result,
          stringDefaultValue,
          monthValue,
          monthStringLength
        );
      }

      if (
        ['integer', 'float', 'binary', 'hexadecimal', 'letter'].includes(
          settings.type
        )
      ) {
        if (isAllowSign(settings)) {
          addInputElement(
            'sign',
            'sign',
            null,
            null,
            getCurrentValueByIndex('sign'),
            '1',
            isDisabled(settings)
          );
        }

        // Ajoute le préfixe "0b" pour binaire et "0x" pour hexadécimal si nécessaire
        addPrefixLabel(settings.type);

        const prefix = 'digits';
        for (let i = 1; i <= settings.numInputs; i++) {
          // Ajoute le séparateur décimal pour les nombres flottants
          if (settings.type === 'float' && i - 1 === settings.decimalPosition) {
            $inputContainer.append(
              $('<div>', {
                class: 'col-1',
                html: `<div><h2 class="my-5">${settings.separator}</h2></div>`,
              })
            );
          }
          // Récupère les paramètres pour chaque input et ajoute l'élément
          const { min, max, value } = getAdjustedValueSettings(i - 1, settings);
          addInputElement(
            prefix,
            i,
            min,
            max,
            value,
            '1',
            isDisabled(settings)
          );
          // Met à jour les valeurs actuelles et finales pour l'input
          updateCurrentValues(i - 1, value);
        }
        $container.append($inputContainer);

        const { value } = getAdjustedValueSettings(
          settings.numInputs - 1,
          settings
        );
        updateFinalValue(
          $(`#${prefix}_${uniqueTypeShort}_input_${settings.numInputs}`),
          value,
          uniqueTypeShort,
          false
        );
      } else if (settings.type === 'text') {
        // Ajoute l'élément de liste pour le type texte
        addInputElement(
          'list',
          'list',
          0,
          settings.values.length - 1,
          settings.values[settings.defaultValue],
          '30',
          isDisabled(settings)
        );
        $container.append($inputContainer);
        updateCurrentValues('current', settings.values[settings.defaultValue]);
      } else if (settings.type === 'time') {
        addInputElement(
          'systime',
          'systime',
          null,
          null,
          getCurrentValueByIndex('systime'),
          '2',
          true
        );

        $('#btAddMosquitoRelease').css('display', 'none');
        const prefix = 'digits';
        addInputTimeElement();

        $container.append($inputContainer);

        const { value } = getAdjustedValueSettings(
          settings.numInputs - 1,
          settings
        );

        fillSysTime(settings.defaultValue, settings.type);

        updateFinalValue(
          $(`#${prefix}_${uniqueTypeShort}_input_${settings.numInputs}`),
          value,
          uniqueTypeShort,
          false
        );

        if (settings.hourCycle == '24h') {
          $('input[id^=systime_' + uniqueTypeShort + '_input]')
            .parent()
            .parent()
            .css('display', 'none');
        }
      } else if (settings.type === 'date') {
        const prefix = 'digits';
        addInputDateElement();

        $container.append($inputContainer);

        const { value } = getAdjustedValueSettings(
          settings.numInputs - 1,
          settings
        );
        updateFinalValue(
          $(`#${prefix}_${uniqueTypeShort}_input_${settings.numInputs}`),
          value,
          uniqueTypeShort,
          false
        );
      }
    });

    // Méthode pour récupérer un chiffre spécifique à un index donné
    this.getDigitAt = function (index) {
      if (index === undefined || index == null) {
        throw new Error('Un index doit être renseignée.');
      }

      if (isGetDigit(settings)) {
        // Vérifie si l'index est dans la plage de currentValue
        if (index >= 0 && index < currentValues.digits.length) {
          return getCurrentValueByIndex(index);
        } else {
          throw new Error("L'index est en dehors de la plage.");
        }
      } else {
        throw new Error(
          'settings.type non disponible avec la fonction getDigitAt.'
        );
      }
    };

    // Méthode pour récupérer un chiffre spécifique à un index donné
    this.setDigitAt = function (index, value) {
      validateValue(value);

      if (index === undefined || index == null) {
        throw new Error('Un index doit être renseignée.');
      }

      if (isSetDigit(settings)) {
        // Vérifie si l'index est dans la plage de currentValue
        if (index >= 0 && index < currentValues.digits.length) {
          let newvalue = value;
          const inputElement = $(
            `#digits_${uniqueTypeShort}_input_${index + 1}`
          );

          if (settings.type == 'hexadecimal')
            newvalue = convertLetterToHexadecimal(value);
          if (settings.type == 'letter') newvalue = convertLetter(value);
          setValueInput(inputElement, newvalue, 'digits', uniqueTypeShort);
        } else {
          throw new Error("L'index est en dehors de la plage.");
        }
      } else {
        throw new Error(
          'settings.type non disponible avec la fonction setDigitAt.'
        );
      }
    };

    this.changeMaskInputs = function (isPassword) {
      if (typeof isPassword !== 'boolean') {
        throw new Error("Parameter 'isPassword' doit être un booléen.");
      }
      settings.maskInput = isPassword; // Met à jour l'option dans les paramètres
      this.find('input').each(function () {
        $(this).attr('type', isPassword ? 'password' : 'text'); // Change le type d'input
      });
    };

    this.toggleInputs = function (disabled) {
      if (typeof disabled !== 'boolean') {
        throw new Error("Parameter 'disabled' doit être un booléen.");
      }
      settings.isDisabled = disabled; // Met à jour l'option dans les paramètres
      this.find('input:not([id^="month_"]):not([id^="list_"])').prop('disabled', isDisabled(settings)); // Applique le changement
    };

    this.changeLanguage = function (locale) {
      if (typeof locale !== 'string') {
        throw new Error(
          "Parameter 'locale' doit être une chaîne de caractères."
        );
      }
      // Vérifie si la langue est prise en charge par Intl.DateTimeFormat
      Intl.DateTimeFormat.supportedLocalesOf([locale]);
      settings.defaultLanguage = locale; // Met à jour l'option dans les paramètres
      const monthMap = getMonthMapByLocale(locale);
      settings.months = Array.from(monthMap.keys());
      settings.monthMap = monthMap;
      updateValue(getCurrentValueByIndex('current'));
    };

    this.changeHourCycle = function (hourCycle) {
      const validOptions = ['24h', '12h']; // Les valeurs possibles pour hourCycle
      // Si aucune valeur n'est fournie, retourner la valeur par défaut
      if (!hourCycle) {
        throw new Error(
          "Parameter 'hourCycle' n'est pas définie. Valeur par défaut utilisée : '24h'."
        );
      }
      // Vérifie si la valeur est une chaîne valide
      if (typeof hourCycle !== 'string') {
        throw new Error(
          "Parameter 'hourCycle' doit être une chaîne de caractères ('24h' ou '12h')."
        );
      }
      // Vérifie si la valeur est valide
      if (!validOptions.includes(hourCycle)) {
        throw new Error(
          `Parameter 'hourCycle' doit être une des valeurs suivantes : ${validOptions.join(
            ', '
          )}.`
        );
      }
      settings.hourCycle = hourCycle; // Met à jour l'option dans les paramètres

      if (settings.hourCycle == '24h') {
        $('input[id^=systime_' + uniqueTypeShort + '_input]')
          .parent()
          .parent()
          .css('display', 'none');
      } else {
        $('input[id^=systime_' + uniqueTypeShort + '_input]')
          .parent()
          .parent()
          .css('display', 'block');
      }

      updateValue(getCurrentValueByIndex('current'));
    };

    this.changeTextValues = function (values, index_0 = 0, onchange = false) {
      if (settings.type === 'text') {
        if (!Array.isArray(values)) {
          throw new Error("Parameter 'values' doit être liste.");
        }

        if (index_0 < 0 || index_0 >= values.length) {
          throw new Error(
            "Parameter 'index_0' doit être une valeur comprise entre 0 et values.length."
          );
        }
        settings.values = values;
        this.setCompleteValue(values[index_0], onchange);
      }
    };

    // Méthode pour récupérer la valeur complète
    this.getCompleteValue = function () {
      return getCurrentValueByIndex('current');
    };

    function validateValue(value) {
      if (
        value === undefined ||
        value === null ||
        (typeof value == 'string' && (!value || value.length === 0))
      ) {
        throw new Error('Une valeur doit être renseignée.');
      }
    }

    // Fonction pour valider la valeur, remplir les digits et mettre à jour
    function validateAndFillDigits(value, conversionFunction) {
      updateCurrentValues('fillDigits', 0);
      fillDigits(conversionFunction(value), uniqueTypeShort);
      let newValue = digitsArrayToNumber(
        getCurrentValueByIndex('digits'),
        settings.type === 'float',
        settings.decimalPosition
      );
      newValue = addSignToValue(newValue, uniqueTypeShort);
      updateCurrentValues('current', newValue);
    }

    function updateValueInteger(value) {
      if (isValidIntegerOrFloat(value)) {
        validateAndFillDigits(value, convertIntegerBase10);
      } else {
        throw new Error('La valeur doit être un nombre entier.');
      }
    }

    function updateValueFloat(value) {
      if (isValidIntegerOrFloat(value)) {
        validateAndFillDigits(value, convertFloat);
      } else {
        throw new Error('La valeur doit être un nombre flottant.');
      }
    }

    function updateValueBinary(value) {
      if (typeof value == 'number') value = value.toString();
      const removeBinaryPrefix = (value) => value.replace(/^0b/, '');
      if (isValidBinary(value)) {
        updateValueDigits(
          truncateFromEnd(removeBinaryPrefix(value), settings.numInputs)
        );
      } else {
        throw new Error(
          'La valeur doit être un nombre binaire (composé uniquement de 0 et 1).'
        );
      }
    }

    function updateValueHexadecimal(value) {
      if (typeof value == 'number') value = value.toString();
      const removeHexadecimalPrefix = (value) => value.replace(/^0x/, '');
      if (isValidHexadecimal(value)) {
        updateValueDigits(
          truncateFromEnd(removeHexadecimalPrefix(value), settings.numInputs)
        );
      } else {
        throw new Error('La valeur doit être un nombre hexadécimal.');
      }
    }

    function updateValueLetter(value) {
      updateValueDigits(truncateFromEnd(value, settings.numInputs));
    }

    function updateValueDigits(value) {
      updateCurrentValues('fillDigits', 0);
      fillDigits(value, uniqueTypeShort);
      updateCurrentValues('current', value);
    }

    function updateValueText(value) {
      const index = findPosition(settings.values, value);
      if (index !== -1) {
        $(`input[id^=list_${uniqueTypeShort}_input]`).val(value);
        updateCurrentValues('current', value);
      } else {
        throw new Error(
          "Le texte n'est pas reconnu dans les valeurs disponibles."
        );
      }
    }

    function updateValueDateTime(type, value) {
      let askValue = isValidIntegerOrFloat(value) ? convertFloat(value) : value;

      const settingsMap = {
        time: {
          parse: parseDefaultTimeValue,
          format: formatTimeToCustomString,
          total: getTotalTimeSeconds,
          formatSetting: settings.formatTime,
        },
        date: {
          parse: parseDefaultDateValue,
          format: formatDateToCustomString,
          total: getTotalDateSeconds,
          formatSetting: settings.formatDate,
        },
      };

      const setting = settingsMap[type];
      if (!setting) {
        throw new Error(`Unsupported type: ${type}`);
      }

      const defaultValue = setting.parse(askValue, setting.formatSetting);

      const date = new Date(0); // Initialise la date à epoch 0
      date.setUTCMilliseconds(Math.round(defaultValue * 1000)); // Convertit les secondes en millisecondes

      const newValue = setting.format(date, setting.formatSetting);

      fillSysTime(askValue, type);

      fillDigits(newValue, uniqueTypeShort);

      updateCurrentValues(
        'current',
        setting.total ? setting.total(date) : null
      );
    }

    function updateValue(value) {
      // Fonctions auxiliaires pour supprimer les préfixes
      switch (settings.type) {
        case 'integer':
          updateValueInteger(value);
          break;
        case 'float':
          updateValueFloat(value);
          break;
        case 'binary':
          updateValueBinary(value);
          break;
        case 'hexadecimal':
          updateValueHexadecimal(value);
          break;
        case 'letter':
          updateValueLetter(value);
          break;
        case 'text':
          updateValueText(value);
          break;
        case 'time':
        case 'date':
          updateValueDateTime(settings.type, value);
          break;
        /* istanbul ignore next */
        default:
          throw new Error(
            "Le type spécifié dans settings n'est pas compatible avec setCompleteValue."
          );
      }
    }

    this.setCompleteValue = function (value, onchange = false) {
      validateValue(value);
      updateValue(value);
      triggerValueChange(null, settings, onchange);
    };

    this.destroy = function () {
      return this.each(function () {
        const $this = $(this);

        // Supprime tous les événements attachés au plugin
        $this.off();

        // Identifier le conteneur principal et tous ses enfants
        const $container = $this.find('.cla-input-container');

        if ($container.length > 0) {
          // Supprimer tous les événements des éléments enfants
          $container.find('*').off();

          // Supprimer tous les enfants du conteneur
          $container.empty();

          // Supprimer le conteneur lui-même
          $container.remove();
        }

        // Supprime les éléments DOM ajoutés par le plugin
        $this
          .find(
            '.cla-hover-text, .cla-input-wrapper, [class*="top-text"], [class*="bottom-text"], .cla-input-container, .visually-hidden'
          )
          .remove();

        // Supprime les données associées
        $this.removeData();

        // Supprime les classes ajoutées par le plugin
        $this.removeClass(
          'cla-input-wrapper cla-input-container cla-hover-text visually-hidden'
        );

        // Nettoie complètement le contenu si nécessaire
        $this.empty();
      });
    };

    /* istanbul ignore next */
    if (typeof window !== 'undefined' && window.TEST_MODE) {
      // Fonction pour définir `gIdHover`
      this.setHoverId = function (hoverId) {
        gIdHover = hoverId;
      };

      // Fonction pour récupérer `gIdHover`
      this.getHoverId = function () {
        return gIdHover;
      };

      // Fonction pour exposer `calculatePeripheralDisplay` et retourner ses résultats
      this.calculatePeripheralDisplay = function (
        prefix,
        id,
        value,
        inputElement,
        hover
      ) {
        return calculatePeripheralDisplay(
          prefix,
          id,
          value,
          inputElement,
          hover
        );
      };
    }
    return this;
  };

  $.fn.codeInputBuilder.version = '0.0.25';
  $.fn.codeInputBuilder.title = 'CodeInputBuilder';
  $.fn.codeInputBuilder.description =
    "Plugin jQuery permettant de générer des champs d'input configurables pour la saisie de valeurs numériques (entiers, flottants), de textes, ou de valeurs dans des systèmes spécifiques (binaire, hexadécimal). Il offre des options avancées de personnalisation incluant la gestion des signes, des positions décimales, des limites de valeurs, et des callbacks pour la gestion des changements de valeur.";
})(jQuery);
