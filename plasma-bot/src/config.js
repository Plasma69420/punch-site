import 'dotenv/config';

export const env = process.env;

export const COLOR = 0xd400ff; // Plasma magenta

// Your custom server emojis
export const E = {
  hammer: '<:hammer:1558592837191209001>',
  satellite: '<:satalite:1558592919437447248>',
  lock: '<:lock:1558592871081316482>',
  pinkperson: '<:pinkperson:1558592811094249482>',
  warning: '<:warning:1558592828928692264>',
  question: '<:questionpink:1558592817301815387>',
  loading: '<a:loading_green:1558592850877353995>',
  loadingYellow: '<a:loading_yellow:1558609653431009371>',
  moneybag: '<:moneybag:1558592874600337493>',
  rocket: '<:rocket:1558592814323859466>',
};

// Edit this list to match the products on your storefront
export const PRODUCTS = [
  { key: 'fortnite', name: 'Fortnite Private' },
  { key: 'r6', name: 'R6 External' },
  { key: 'marvel', name: 'Marvel Rivals' },
  { key: 'arc', name: 'Arc Raiders Private' },
  { key: 'tempspoof', name: 'Temporary Swoofer' },
  { key: 'permspoof', name: 'Permanent Swoofer' },
];

export const STATUSES = {
  undetected: { label: 'Undetected', icon: E.loading },
  updating: { label: 'Updating', icon: E.loadingYellow },
  detected: { label: 'Detected', icon: '🔴' },
  maintenance: { label: 'Maintenance', icon: E.loadingYellow },
};

export const TICKET_TYPES = {
  purchase: { label: 'Purchase', description: 'Purchase / ordering help', emoji: '<:moneybag:1558592874600337493>' },
  support: { label: 'Support', description: 'Product & technical support', emoji: '<:pinkperson:1558592811094249482>' },
  other: { label: 'Other', description: 'General questions', emoji: '<:questionpink:1558592817301815387>' },
  delivery: { label: 'Delivery', description: 'Invoice / delivery claims', emoji: '<:rocket:1558592814323859466>' },
};

// Website catalog: bot status key + SellApp variant ids. Used by the API to validate checkouts.
export const SITE_PRODUCTS = {
  'fortnite-private': { statusKey: 'fortnite', variants: [416469, 416470, 416471, 416472] },
  'r6-external': { statusKey: 'r6', variants: [416712, 416705, 416716, 416735] },
  'marvel-rivals': { statusKey: 'marvel', variants: [416737, 416738, 416739] },
  'arc-raiders': { statusKey: 'arc', variants: [416741, 416742, 416743] },
  'temp-spoofer': { statusKey: 'tempspoof', variants: [416474, 416475, 416476] },
  'fortnite-slotted': { statusKey: 'slotted', variants: [416783, 416784, 416785] },
  'fortnite-accounts': { statusKey: 'accounts', variants: [] },
  'perm-spoofer': { statusKey: 'permspoof', variants: [416478, 416479] },
};
export const ADDON_VARIANTS = [416744]; // AnyDesk Support variant id(s)
export const ALLOWED_VARIANTS = new Set([...Object.values(SITE_PRODUCTS).flatMap(p => p.variants), ...ADDON_VARIANTS]);
// shown until someone runs /status for that product
export const DEFAULT_STATUS = { arc: 'updating' };
export const ALLOWED_ORIGINS = ['https://plasmatools.org', 'https://www.plasmatools.org', 'http://localhost:8765', 'http://127.0.0.1:8765'];
export const PAY_METHODS = ['PAYPAL', 'CASHAPP', 'SOL'];
