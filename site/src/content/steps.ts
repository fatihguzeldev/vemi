import type { Locale } from '../data/types'

export type StepId =
  | 'welcome'
  | 'source'
  | 'pipeline'
  | 'block-lex'
  | 'block-parse'
  | 'two-layers'
  | 'inline-lex'
  | 'inline-parse'
  | 'ast'
  | 'codegen'
  | 'output'

export type StepContent = {
  id: StepId
  title: Record<Locale, string>
  body: Record<Locale, string>
  pseudoCode?: Record<Locale, string>
}

export const steps: StepContent[] = [
  {
    id: 'welcome',
    title: {
      en: 'What is a compiler?',
      tr: 'Derleyici nedir?',
    },
    body: {
      en: 'A compiler reads source text and turns it into something else, usually a form a browser or runtime can use. Vemi is a small compiler: markdown-like text goes in, HTML comes out. The next steps walk through that path, from raw input to finished markup.',
      tr: "Derleyici kaynak metni okur ve başka bir forma çevirir; çoğu zaman tarayıcının veya çalışma zamanının kullanabileceği bir çıktı üretir. Vemi küçük bir derleyicidir: markdown benzeri metin girer, HTML çıkar. Sonraki adımlarda ham girdiden nihai markup'a giden yolu adım adım göreceksiniz.",
    },
  },
  {
    id: 'source',
    title: {
      en: 'The source document',
      tr: 'Kaynak belge',
    },
    body: {
      en: 'Everything starts as plain text. Headings, paragraphs, lists, and links are just characters on the page. There is no structure yet. The compiler has to infer structure from the raw input.',
      tr: 'Her şey düz metin olarak başlar. Başlıklar, paragraflar, listeler ve bağlantılar henüz yalnızca karakterlerdir; yapı yoktur. Derleyici bu yapıyı ham girdiden çıkarmak zorundadır.',
    },
  },
  {
    id: 'pipeline',
    title: {
      en: 'The pipeline',
      tr: 'Derleme hattı',
    },
    body: {
      en: 'Vemi follows a classic compiler pipeline. Lexing splits text into tokens. Parsing builds a tree (the AST). Code generation walks that tree and emits HTML. Vemi runs this twice: first for block structure, then again for inline formatting inside each block.',
      tr: 'Vemi klasik bir derleme hattı izler. Lexer metni tokenlara böler. Parser bir ağaç (AST) kurar. Kod üretimi bu ağacı dolaşarak HTML yazar. Vemi bunu iki kez yapar: önce blok yapısı için, sonra her blok içindeki satır içi biçimlendirme için.',
    },
  },
  {
    id: 'block-lex',
    title: {
      en: 'Block lexing',
      tr: 'Blok lexing',
    },
    body: {
      en: 'The block lexer reads the source line by line. Each line becomes a token: a heading, a text line, a list item, or a blank line. Tokens are the first structured view of the document.',
      tr: 'Blok lexer kaynağı satır satır okur. Her satır bir token olur: başlık, metin satırı, liste öğesi veya boş satır. Tokenlar, belgenin ilk yapılandırılmış görünümüdür.',
    },
    pseudoCode: {
      en: `for each line in source:
  if line starts with "#":
    emit HEADING
  elif line starts with "-":
    emit LIST_ITEM
  elif line is empty:
    emit BLANK_LINE
  else:
    emit TEXT_LINE`,
      tr: `kaynaktaki her satır için:
  satır "#" ile başlıyorsa:
    HEADING üret
  satır "-" ile başlıyorsa:
    LIST_ITEM üret
  satır boşsa:
    BLANK_LINE üret
  aksi halde:
    TEXT_LINE üret`,
    },
  },
  {
    id: 'block-parse',
    title: {
      en: 'Block parsing',
      tr: 'Blok ayrıştırma',
    },
    body: {
      en: 'The block parser consumes tokens and builds block-level structure: headings, paragraphs, lists, and blockquotes. Consecutive list items merge into one list node. Blank lines separate blocks.',
      tr: 'Blok parser tokenları işler ve blok düzeyinde yapı kurar: başlıklar, paragraflar, listeler, alıntılar. Ardışık liste öğeleri tek liste düğümünde birleşir. Boş satırlar blokları ayırır.',
    },
    pseudoCode: {
      en: `while tokens remain:
  match next token:
    HEADING  → heading node
    TEXT_LINE → paragraph node
    LIST_ITEM → add to list (or start new list)
    BLANK_LINE → separator`,
      tr: `token varken:
  sonraki tokena bak:
    HEADING  → heading düğümü
    TEXT_LINE → paragraf düğümü
    LIST_ITEM → listeye ekle (veya yeni liste)
    BLANK_LINE → ayırıcı`,
    },
  },
  {
    id: 'two-layers',
    title: {
      en: 'Two layers',
      tr: 'İki katman',
    },
    body: {
      en: 'Block structure is only half the work. Inside a paragraph or heading, markers like **bold**, `code`, and [links](url) need their own lexer and parser. Most real compilers split the problem this way. Vemi does too.',
      tr: "Blok yapısı işin yarısıdır. Bir paragraf veya başlık içinde **kalın**, `kod` ve [bağlantılar](url) gibi işaretlerin ayrı lexer ve parser'a ihtiyacı vardır. Gerçek derleyicilerin çoğu sorunu böyle ikiye ayırır. Vemi de aynısını yapar.",
    },
  },
  {
    id: 'inline-lex',
    title: {
      en: 'Inline lexing',
      tr: 'Satır içi lexing',
    },
    body: {
      en: 'The inline lexer scans one line span at a time. It finds delimiter runs (** or _), backtick runs for code, and bracket pairs for links. Plain text fills the space between markers.',
      tr: 'Satır içi lexer tek seferde bir satır aralığını tarar. Ayraç dizilerini (** veya _), kod için backtick dizilerini ve bağlantılar için köşeli parantez çiftlerini bulur. Düz metin, işaretler arasındaki boşluğu doldurur.',
    },
    pseudoCode: {
      en: `while chars remain in span:
  if "**" or "__":
    emit DELIMITER_RUN
  elif "\`":
    emit BACKTICK_RUN
  elif "[":
    emit LEFT_BRACKET …
  else:
    emit TEXT`,
      tr: `aralıktaki karakterler bitene kadar:
  "**" veya "__" ise:
    DELIMITER_RUN üret
  "\`" ise:
    BACKTICK_RUN üret
  "[" ise:
    LEFT_BRACKET … üret
  aksi halde:
    TEXT üret`,
    },
  },
  {
    id: 'inline-parse',
    title: {
      en: 'Inline parsing',
      tr: 'Satır içi ayrıştırma',
    },
    body: {
      en: 'The inline parser pairs delimiters and turns them into emphasis, strong, code, or link nodes. Unmatched markers stay plain text. Each block ends up with a small tree of inline nodes.',
      tr: 'Satır içi parser ayraçları eşleştirir ve emphasis, strong, code veya link düğümlerine çevirir. Eşleşmeyen işaretler düz metin kalır. Her blok, küçük bir satır içi ağaçla biter.',
    },
    pseudoCode: {
      en: `pair delimiter runs:
  length 1 → emphasis
  length 2+ → strong
match backtick runs → code
match [text](url) → link
remaining text → text nodes`,
      tr: `ayraç dizilerini eşle:
  uzunluk 1 → emphasis
  uzunluk 2+ → strong
backtick dizilerini eşle → code
[metin](url) eşle → link
kalan metin → text düğümleri`,
    },
  },
  {
    id: 'ast',
    title: {
      en: 'The AST',
      tr: 'AST',
    },
    body: {
      en: 'The Abstract Syntax Tree makes document meaning explicit. Block nodes form the skeleton. Inline nodes hold formatting and links. Every node has a type. The renderer walks this tree; it does not re-read the original markdown.',
      tr: "Soyut sözdizimi ağacı (AST) belgenin anlamını açık hale getirir. Blok düğümler iskeleti oluşturur. Satır içi düğümler biçimlendirme ve bağlantıları taşır. Her düğümün bir tipi vardır. Renderer bu ağacı dolaşır; orijinal markdown'ı yeniden okumaz.",
    },
  },
  {
    id: 'codegen',
    title: {
      en: 'Code generation',
      tr: 'Kod üretimi',
    },
    body: {
      en: 'Code generation walks the AST and writes HTML. Each node type maps to a tag or attribute. Text is escaped. Unsafe link URLs are dropped. The tree becomes one string the browser can render.',
      tr: "Kod üretimi AST'yi dolaşır ve HTML yazar. Her düğüm tipi bir etikete veya niteliğe karşılık gelir. Metin kaçışlanır. Güvensiz bağlantı URL'leri atılır. Ağaç, tarayıcının işleyebileceği tek bir dizgeye dönüşür.",
    },
    pseudoCode: {
      en: `function render(node):
  match node.type:
    heading   → "<h{n}>" + children + "</h{n}>"
    strong    → "<strong>" + children + "</strong>"
    link      → "<a href=…>" + text + "</a>"
    text      → escape(content)`,
      tr: `function render(node):
  node.type'a göre:
    heading   → "<h{n}>" + children + "</h{n}>"
    strong    → "<strong>" + children + "</strong>"
    link      → "<a href=…>" + text + "</a>"
    text      → escape(content)`,
    },
  },
  {
    id: 'output',
    title: {
      en: 'Output',
      tr: 'Çıktı',
    },
    body: {
      en: 'The final HTML is a fragment of semantic tags: headings, paragraphs, lists, and links. Vemi escapes text by default and rejects unsafe URLs such as javascript: schemes. What you write becomes safe markup the browser can render.',
      tr: "Son HTML; başlık, paragraf, liste ve bağlantı gibi anlamsal etiketlerden oluşan bir parçadır. Vemi metni varsayılan olarak kaçırır ve javascript: gibi güvensiz URL'leri reddeder. Yazdığınız metin, tarayıcının işleyebileceği güvenli markup'a dönüşür.",
    },
  },
]

export const stepIds = steps.map((s) => s.id)

export function getStepIndex(id: StepId): number {
  return steps.findIndex((s) => s.id === id)
}

export function getStep(id: StepId): StepContent {
  const step = steps.find((s) => s.id === id)
  if (!step) throw new Error(`Unknown step: ${id}`)
  return step
}
