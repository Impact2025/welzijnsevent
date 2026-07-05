export interface DiscoveryResult {
  name: string;
  url: string;
  domain: string;
  snippet?: string;
}

export interface ProspectLead {
  id: string;
  organisatie: string | null;
  naam: string | null;
  email: string;
  telefoon: string | null;
  website: string | null;
  kvkNummer: string | null;
  sbiCode: string | null;
  sbiBeschrijving: string | null;
  plaats: string | null;
  postcode: string | null;
  adres: string | null;
  contactPersoon: string | null;
  notitie: string | null;
  aiScore: number | null;
  aiRationale: string | null;
  status: string;
  starred: boolean;
  bron: string;
  scrapedAt: string | null;
  scoredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SearchResult {
  kvkNumber: string;
  name: string;
  website?: string;
  email?: string;
  phone?: string;
  aiScore?: number;
  aiRationale?: string;
  alreadySaved?: boolean;
  sbiDescription?: string;
}
