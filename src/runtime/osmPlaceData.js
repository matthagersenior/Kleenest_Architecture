const nestedTags = place => {
  const source = place?.source_metadata;
  if (!source || typeof source !== 'object') return {};
  if (source.tags && typeof source.tags === 'object' && !Array.isArray(source.tags)) return source.tags;
  return source;
};
const first = (...values) => values.map(v => String(v ?? '').trim()).find(Boolean) || '';
const normalizeBrand = value => String(value ?? '').trim().toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
const canonicalBrand = value => normalizeBrand(value).replace(/ /g, '');

const BRAND_DOMAINS = {
  starbucks:'starbucks.com',mcdonalds:'mcdonalds.com',target:'target.com',walmart:'walmart.com',walgreens:'walgreens.com',cvs:'cvs.com',costco:'costco.com',
  'whole foods':'wholefoodsmarket.com',kroger:'kroger.com',shell:'shell.com',bp:'bp.com',exxon:'exxonmobil.com',exxonmobil:'exxonmobil.com',chevron:'chevron.com',
  '7 eleven':'7-eleven.com','chick fil a':'chick-fil-a.com',subway:'subway.com','taco bell':'tacobell.com',dunkin:'dunkindonuts.com',panera:'panerabread.com',
  publix:'publix.com',aldi:'aldi.us','sams club':'samsclub.com','home depot':'homedepot.com',lowes:'lowes.com'
};
const BRAND_SLUGS = {
  starbucks:'starbucks',mcdonalds:'mcdonalds',target:'target',walmart:'walmart',walgreens:'walgreens',cvs:'cvs-health',costco:'costco',
  'whole foods':'whole-foods-market',kroger:'kroger',shell:'shell',bp:'bp',exxon:'exxonmobil',exxonmobil:'exxonmobil',chevron:'chevron',
  '7 eleven':'7--eleven','chick fil a':'chick-fil-a',subway:'subway','taco bell':'taco-bell',dunkin:'dunkin',panera:'panera-bread',publix:'publix',
  aldi:'aldi','sams club':'sams-club','home depot':'the-home-depot',lowes:'lowes'
};
const brandKey = place => {
  const text = canonicalBrand([place?.brand, place?.brand_name, place?.operator_name, place?.business_name, place?.name, nestedTags(place).brand, nestedTags(place).operator].filter(Boolean).join(' '));
  return Object.keys(BRAND_SLUGS).find(key => { const candidate=canonicalBrand(key); return text===candidate || text.includes(candidate); }) || '';
};
const businessIdentity = place => {
  const id=place?.business_id||place?.businessId;
  if(!id || typeof window==='undefined') return null;
  try { const raw=window.localStorage.getItem(`kleenest.map.identity.${id}`); return raw?JSON.parse(raw):null; } catch { return null; }
};
const hostname = raw => {
  if(!raw) return '';
  try { const url=String(raw).match(/^https?:\/\//i)?String(raw):`https://${raw}`; return new URL(url).hostname.replace(/^www\./,''); } catch { return ''; }
};
const domainFromPlace = place => {
  const tags=nestedTags(place);
  const direct=hostname(first(place?.website_url,place?.websiteUrl,place?.website,place?.url,place?.domain,tags.website,tags['contact:website']));
  if(direct) return direct;
  const key=brandKey(place);
  return key?BRAND_DOMAINS[key]||'':'';
};

export const osmTags = (place = {}) => nestedTags(place);

export function placeBrand(place = {}) {
  const tags = nestedTags(place);
  return first(place.brand, place.brand_name, place.operator_name, place.business_name, tags.brand, tags.operator, tags.official_name, place.name);
}

export function placeName(place = {}) {
  const tags = nestedTags(place);
  return first(place.name, place.brand, place.brand_name, place.operator_name, place.business_name, tags.name, tags.official_name, tags.brand, tags.operator, 'Kleenest location');
}

export function placeAddress(place = {}) {
  const tags = nestedTags(place);
  const full = first(place.address, place.formatted_address, tags['addr:full'], tags['contact:address']);
  if (full) return full;
  const number = first(place.street_number, place.housenumber, tags['addr:housenumber'], tags['contact:housenumber']);
  const street = first(place.street, tags['addr:street'], tags['contact:street']);
  const unit = first(place.unit, tags['addr:unit'], tags['addr:suite']);
  const locality = first(place.city, tags['addr:city'], tags['addr:place'], tags['addr:suburb'], tags['addr:neighbourhood']);
  const state = first(place.state, tags['addr:state']);
  const postal = first(place.postal_code, tags['addr:postcode']);
  const country = first(place.country, tags['addr:country']);
  const line = [number && street ? `${number} ${street}` : street || number, unit && `Unit ${unit}`].filter(Boolean).join(', ');
  const tail = [locality, state, postal, country].filter(Boolean).join(', ');
  return [line, tail].filter(Boolean).join(', ') || 'Address not yet available';
}

export function placeContact(place = {}) {
  const tags = nestedTags(place);
  return {
    phone: first(place.phone, place.phone_number, tags.phone, tags['contact:phone']),
    website: first(place.website_url, place.website, place.websiteUrl, place.url, tags.website, tags['contact:website']),
    email: first(place.email, tags.email, tags['contact:email'])
  };
}

export function placeLogoCandidates(place = {}) {
  const tags=nestedTags(place), identity=businessIdentity(place), key=brandKey(place), domain=domainFromPlace(place), urls=[];
  const direct=[identity?.logoUrl,place.logo_url,place.logoUrl,place.business_logo_url,place.businessLogoUrl,place.brand_logo_url,place.brandLogoUrl,place.image_url,place.image,tags.logo,tags['brand:logo'],tags.image].map(v=>String(v??'').trim()).filter(Boolean);
  urls.push(...direct);
  if(key&&BRAND_SLUGS[key]) urls.push(`https://cdn.simpleicons.org/${BRAND_SLUGS[key]}/111827`);
  if(domain) urls.push(`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`);
  if(domain) urls.push(`https://${domain}/favicon.ico`);
  return [...new Set(urls)];
}
export const placeLogo = place => placeLogoCandidates(place)[0] || '';

export function amenityLabels(place = {}) {
  if (Array.isArray(place.amenity_labels) && place.amenity_labels.length) return place.amenity_labels;
  if (Array.isArray(place.amenities) && place.amenities.length) return place.amenities.map(x => typeof x === 'string' ? x : x?.label || x?.name).filter(Boolean);
  const tags = nestedTags(place);
  const pairs = [['wheelchair','Wheelchair'],['changing_table','Changing table'],['drinking_water','Drinking water'],['shower','Shower'],['parking','Parking'],['internet_access','Wi-Fi'],['atm','ATM'],['seating','Seating']];
  return pairs.filter(([key]) => ['yes','true'].includes(String(tags[key] ?? '').toLowerCase())).map(([,label]) => label);
}

export function sourceLabel(place = {}) {
  const source = first(place.source_dataset, place.source, nestedTags(place).source).toLowerCase();
  return source.includes('osm') || source.includes('openstreetmap') || source.includes('overpass') ? 'OpenStreetMap / Overpass' : 'Kleenest canonical network';
}
