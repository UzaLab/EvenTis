export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD') // Retire les accents
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Remplace les espaces par -
    .replace(/[^\w-]+/g, '') // Retire les caractères non-alphanumériques (sauf -)
    .replace(/--+/g, '-'); // Retire les tirets multiples
}