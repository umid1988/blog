// Code highlighting themes in the site's cyanotype palette.
// Light: ink on the pale wash. Dark: pale lines on deep Prussian blue.

function theme(name, type, c) {
  return {
    name,
    type,
    colors: {
      'editor.background': c.bg,
      'editor.foreground': c.fg,
    },
    tokenColors: [
      { settings: { foreground: c.fg } },
      {
        scope: ['comment', 'punctuation.definition.comment'],
        settings: { foreground: c.comment, fontStyle: 'italic' },
      },
      {
        scope: [
          'keyword',
          'storage',
          'storage.type',
          'keyword.control',
          'keyword.operator.new',
          'keyword.operator.expression',
          'variable.language',
          'constant.language',
          'support.type.primitive',
        ],
        settings: { foreground: c.keyword },
      },
      {
        scope: ['string', 'string.quoted', 'string.template', 'punctuation.definition.string'],
        settings: { foreground: c.string },
      },
      {
        scope: ['constant.numeric', 'constant.character', 'constant.other', 'support.constant'],
        settings: { foreground: c.number },
      },
      {
        scope: [
          'entity.name.function',
          'support.function',
          'meta.function-call.generic',
          'entity.name.type',
          'entity.name.class',
          'support.class',
        ],
        settings: { foreground: c.func },
      },
      {
        scope: ['entity.name.tag', 'meta.tag', 'keyword.other.http', 'keyword.other.method'],
        settings: { foreground: c.keyword },
      },
      {
        scope: [
          'entity.other.attribute-name',
          'support.type.property-name',
          'meta.object-literal.key',
          'variable.other.property',
          'meta.header.http',
        ],
        settings: { foreground: c.attr },
      },
      {
        scope: ['punctuation', 'keyword.operator', 'meta.brace'],
        settings: { foreground: c.punct },
      },
      { scope: ['markup.bold'], settings: { fontStyle: 'bold' } },
      { scope: ['markup.italic'], settings: { fontStyle: 'italic' } },
      { scope: ['markup.deleted'], settings: { foreground: c.deleted } },
      { scope: ['markup.inserted'], settings: { foreground: c.string } },
    ],
  };
}

export const cyanotypeLight = theme('cyanotype-light', 'light', {
  bg: '#e4eaee',
  fg: '#13304f',
  comment: '#5f7891',
  keyword: '#1d5aa6',
  string: '#22705f',
  number: '#9a5a08',
  func: '#5b3d9e',
  attr: '#285e8a',
  punct: '#4f6882',
  deleted: '#b3261e',
});

export const cyanotypeDark = theme('cyanotype-dark', 'dark', {
  bg: '#0b2742',
  fg: '#edf2f5',
  comment: '#8aa3bb',
  keyword: '#8ec5ff',
  string: '#8fd8c0',
  number: '#f3c47d',
  func: '#cdbdff',
  attr: '#a9d1f5',
  punct: '#a9bed1',
  deleted: '#ff8f8f',
});
