import type { Locale } from '../data/types'

export type UiCopy = Record<Locale, string>

export const ui = {
  pseudoCodeLabel: {
    en: 'Simplified pseudocode (not the real implementation)',
    tr: 'Basitleştirilmiş sözde kod (gerçek uygulama değil)',
  },
  stepCounter: {
    en: 'Step',
    tr: 'Adım',
  },
  navPrevious: {
    en: 'Previous step',
    tr: 'Önceki adım',
  },
  navNext: {
    en: 'Next step',
    tr: 'Sonraki adım',
  },
  navLabel: {
    en: 'Step navigation',
    tr: 'Adım gezintisi',
  },
  navStepsList: {
    en: 'Steps',
    tr: 'Adımlar',
  },
  previewLabel: {
    en: 'Preview',
    tr: 'Önizleme',
  },
  htmlSnippetLabel: {
    en: 'Generated HTML',
    tr: 'Üretilen HTML',
  },
  sourceDocumentLabel: {
    en: 'Source document',
    tr: 'Kaynak belge',
  },
  blockTokensLabel: {
    en: 'Block tokens',
    tr: 'Blok tokenları',
  },
  blockStructureLabel: {
    en: 'Block structure',
    tr: 'Blok yapısı',
  },
  inlineSourceLineLabel: {
    en: 'Source line',
    tr: 'Kaynak satır',
  },
  inlineTokensLabel: {
    en: 'Inline tokens',
    tr: 'Satır içi tokenlar',
  },
  inlineNodesLabel: {
    en: 'Inline nodes',
    tr: 'Satır içi düğümler',
  },
  inlineLayerBadge: {
    en: 'inline layer',
    tr: 'satır içi katman',
  },
  pipelineAriaLabel: {
    en: 'Compiler pipeline',
    tr: 'Derleme hattı',
  },
  astInsight: {
    en: 'Markdown is one long string. To render it, you need typed nodes, not raw #, **, or - characters.',
    tr: 'Markdown tek parça metindir. Ekranda göstermek için #, ** veya - gibi ham karakterler yetmez; tipi belli düğümlere ihtiyaç vardır.',
  },
  astSourceTitle: {
    en: 'Source',
    tr: 'Kaynak',
  },
  astSourceSubtitle: {
    en: 'what the author typed',
    tr: 'yazarın yazdığı metin',
  },
  astParseLabel: {
    en: 'parse',
    tr: 'ayrıştır',
  },
  astAstTitle: {
    en: 'AST',
    tr: 'AST',
  },
  astAstSubtitle: {
    en: 'what the renderer reads',
    tr: "renderer'ın okuduğu yapı",
  },
  astOutlineLabel: {
    en: 'Abstract syntax tree',
    tr: 'Soyut sözdizimi ağacı',
  },
  blockStackLabel: {
    en: 'Block structure',
    tr: 'Blok yapısı',
  },
  inlineFlowLabel: {
    en: 'Inline nodes',
    tr: 'Satır içi düğümler',
  },
  codegenWalkLabel: {
    en: 'Render walk',
    tr: 'Oluşturma adımları',
  },
  codegenEmitsLabel: {
    en: 'emits',
    tr: 'üretir',
  },
  codegenBufferTitle: {
    en: 'HTML string',
    tr: 'HTML dizgesi',
  },
  codegenBufferSubtitle: {
    en: 'concatenated output, formatted here for readability',
    tr: 'birleştirilmiş çıktı (okunaklı olsun diye biçimlendirildi)',
  },
  welcomeTagline: {
    en: 'markdown-like text → HTML',
    tr: 'markdown benzeri metin → HTML',
  },
  footerBuiltBy: {
    en: 'Built by',
    tr: 'Geliştiren',
  },
  languageToggle: {
    en: 'Language',
    tr: 'Dil',
  },
  themeLight: {
    en: 'Switch to dark theme',
    tr: 'Koyu temaya geç',
  },
  themeDark: {
    en: 'Switch to light theme',
    tr: 'Açık temaya geç',
  },
  homeLabel: {
    en: 'vemi home',
    tr: 'vemi ana sayfa',
  },
  socialLinks: {
    en: 'Social links',
    tr: 'Sosyal bağlantılar',
  },
} satisfies Record<string, UiCopy>

export const pipelineStageLabels: Record<Locale, readonly string[]> = {
  en: ['Source', 'Lex', 'Parse', 'AST', 'HTML'],
  tr: ['Kaynak', 'Lex', 'Parse', 'AST', 'HTML'],
}
