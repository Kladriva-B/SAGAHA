export type ProductBadge = "Bio" | "Nouveau" | "Best-seller";

export type PublicProduct = {
  id: string;
  name: string;
  category: "Thé vert" | "Thé noir" | "Tisanes" | "Infusions";
  priceXaf: number;
  badge?: ProductBadge;
  imageSrc: string;
  blurDataURL?: string;
};

export const publicProducts: PublicProduct[] = [
  {
    id: "1",
    name: "SAGAHA Impérial Noir",
    category: "Thé noir",
    priceXaf: 4500,
    badge: "Best-seller",
    imageSrc:
      "https://images.unsplash.com/photo-1564890369478-c89afeb9cd89?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "2",
    name: "Jade du Littoral",
    category: "Thé vert",
    priceXaf: 5200,
    badge: "Bio",
    imageSrc:
      "https://images.unsplash.com/photo-1582793984882-26103c77387e?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "3",
    name: "Atlas des Plateaux",
    category: "Thé noir",
    priceXaf: 4800,
    badge: "Nouveau",
    imageSrc:
      "https://images.unsplash.com/photo-1597318181409-cf-a483a5a1fcd?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "4",
    name: "Harmonie Hibiscus",
    category: "Tisanes",
    priceXaf: 3200,
    badge: "Bio",
    imageSrc:
      "https://images.unsplash.com/photo-1597481499759-d72f30c2f68f?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "5",
    name: "Infusion Citron-Gingembre",
    category: "Infusions",
    priceXaf: 3800,
    badge: "Best-seller",
    imageSrc:
      "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "6",
    name: "Éclat Matcha Cameroun",
    category: "Thé vert",
    priceXaf: 6500,
    badge: "Nouveau",
    imageSrc:
      "https://images.unsplash.com/photo-1515825838458-f2a94b20105a?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "7",
    name: "Rouge Ouest Earl Grey",
    category: "Thé noir",
    priceXaf: 4100,
    badge: "Bio",
    imageSrc:
      "https://images.unsplash.com/photo-1576092768241-d23160bd659c?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "8",
    name: "Douceur Camomille",
    category: "Tisanes",
    priceXaf: 2900,
    imageSrc:
      "https://images.unsplash.com/photo-1594631252849-808a2d3abf8e?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "9",
    name: "Infusion Mangue & Baobab",
    category: "Infusions",
    priceXaf: 4200,
    badge: "Bio",
    imageSrc:
      "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80",
  },
];

export const productCategories = ["Tous", "Thé vert", "Thé noir", "Tisanes", "Infusions"] as const;

export type CameroonRegionId =
  | "littoral"
  | "centre"
  | "ouest"
  | "nordouest"
  | "sudouest"
  | "adamaoua"
  | "est"
  | "nord";

export type RegionMarker = {
  id: CameroonRegionId;
  label: string;
  /** Position normalisée sur la silhouette (0–100) */
  x: number;
  y: number;
  activeDistributors: number;
};

export const regionMarkers: RegionMarker[] = [
  { id: "littoral", label: "Littoral", x: 42, y: 58, activeDistributors: 48 },
  { id: "centre", label: "Centre", x: 52, y: 48, activeDistributors: 36 },
  { id: "ouest", label: "Ouest", x: 38, y: 44, activeDistributors: 28 },
  { id: "nordouest", label: "Nord-Ouest", x: 32, y: 32, activeDistributors: 22 },
  { id: "sudouest", label: "Sud-Ouest", x: 28, y: 62, activeDistributors: 18 },
  { id: "adamaoua", label: "Adamaoua", x: 58, y: 38, activeDistributors: 12 },
  { id: "est", label: "Est", x: 72, y: 42, activeDistributors: 10 },
  { id: "nord", label: "Nord", x: 62, y: 22, activeDistributors: 26 },
];

export type DistributorEntry = {
  name: string;
  city: string;
  regionId: CameroonRegionId;
};

export const distributorsByRegion: DistributorEntry[] = [
  { name: "Les Grands Crus Douala", city: "Douala", regionId: "littoral" },
  { name: "Terroirs du Wouri", city: "Douala", regionId: "littoral" },
  { name: "Épicerie Fine Bonanjo", city: "Douala", regionId: "littoral" },
  { name: "Maison Yaoundé Premium", city: "Yaoundé", regionId: "centre" },
  { name: "Sawa Distribution", city: "Yaoundé", regionId: "centre" },
  { name: "Plateaux Sélect", city: "Mbalmayo", regionId: "centre" },
  { name: "Monts du Bamboutos", city: "Bafoussam", regionId: "ouest" },
  { name: "Kréo Thé & Co", city: "Dschang", regionId: "ouest" },
  { name: "Bamiléké Bio Trade", city: "Bafang", regionId: "ouest" },
  { name: "Noun Gourmet", city: "Foumban", regionId: "nordouest" },
  { name: "Menchum Valley", city: "Wum", regionId: "nordouest" },
  { name: "Kribi Océan", city: "Kribi", regionId: "sudouest" },
  { name: "Fako Excellence", city: "Buéa", regionId: "sudouest" },
  { name: "Vina Provisions", city: "Ngaoundéré", regionId: "adamaoua" },
  { name: "Boumba Logistique", city: "Bertoua", regionId: "est" },
  { name: "Garoua Nord Supply", city: "Garoua", regionId: "nord" },
];

export function formatXaf(n: number): string {
  return new Intl.NumberFormat("fr-CM", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(n);
}
