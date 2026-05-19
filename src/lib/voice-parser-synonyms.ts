/**
 * Spoken word -> category slug. The actual category id is resolved by the
 * caller by matching slug against the user's active categories table.
 *
 * Keep keys lowercase, single-token where possible.
 */
export const SYNONYMS: Record<string, string> = {
  // food
  chai: 'food',
  coffee: 'food',
  tea: 'food',
  lunch: 'food',
  dinner: 'food',
  breakfast: 'food',
  khaana: 'food',
  khana: 'food',
  food: 'food',
  swiggy: 'food',
  zomato: 'food',
  restaurant: 'food',
  hotel: 'food',
  cafe: 'food',
  drinks: 'food',
  // groceries
  grocery: 'groceries',
  groceries: 'groceries',
  vegetables: 'groceries',
  sabzi: 'groceries',
  bigbasket: 'groceries',
  blinkit: 'groceries',
  zepto: 'groceries',
  instamart: 'groceries',
  dmart: 'groceries',
  // transport
  transport: 'transport',
  uber: 'transport',
  ola: 'transport',
  auto: 'transport',
  rickshaw: 'transport',
  metro: 'transport',
  bus: 'transport',
  train: 'transport',
  rapido: 'transport',
  cab: 'transport',
  // fuel
  fuel: 'fuel',
  petrol: 'fuel',
  diesel: 'fuel',
  cng: 'fuel',
  // bills
  bill: 'bills',
  bills: 'bills',
  electricity: 'bills',
  water: 'bills',
  internet: 'bills',
  wifi: 'bills',
  mobile: 'bills',
  recharge: 'bills',
  jio: 'bills',
  airtel: 'bills',
  vi: 'bills',
  dth: 'bills',
  // rent
  rent: 'rent',
  kiraya: 'rent',
  // shopping
  shopping: 'shopping',
  clothes: 'shopping',
  amazon: 'shopping',
  flipkart: 'shopping',
  myntra: 'shopping',
  meesho: 'shopping',
  ajio: 'shopping',
  nykaa: 'shopping',
  // entertainment
  movie: 'entertainment',
  movies: 'entertainment',
  netflix: 'entertainment',
  spotify: 'entertainment',
  prime: 'entertainment',
  hotstar: 'entertainment',
  jiocinema: 'entertainment',
  games: 'entertainment',
  bookmyshow: 'entertainment',
  pvr: 'entertainment',
  inox: 'entertainment',
  // health
  health: 'health',
  doctor: 'health',
  medicine: 'health',
  pharmacy: 'health',
  hospital: 'health',
  apollo: 'health',
  pharmeasy: 'health',
  netmeds: 'health',
  // education
  education: 'education',
  books: 'education',
  course: 'education',
  fees: 'education',
  tuition: 'education',
  udemy: 'education',
  coursera: 'education',
  // personal care
  salon: 'personal',
  haircut: 'personal',
  gym: 'personal',
  spa: 'personal',
  parlour: 'personal',
  // income
  salary: 'salary',
  freelance: 'freelance',
  refund: 'refund',
};

const PAYEE_BRANDS = new Set([
  'swiggy', 'zomato', 'uber', 'ola', 'rapido', 'amazon', 'flipkart', 'myntra', 'meesho',
  'ajio', 'nykaa', 'netflix', 'spotify', 'prime', 'hotstar', 'jiocinema', 'bookmyshow', 'pvr',
  'inox', 'apollo', 'pharmeasy', 'netmeds', 'udemy', 'coursera', 'bigbasket', 'blinkit', 'zepto',
  'instamart', 'dmart', 'jio', 'airtel', 'vi',
]);

export function brandToPayee(word: string): string | null {
  if (!PAYEE_BRANDS.has(word.toLowerCase())) return null;
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}
