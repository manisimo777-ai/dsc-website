// Etsy API v3 utility functions

const ETSY_API_BASE = 'https://openapi.etsy.com/v3';

export interface EtsyListing {
  listing_id: number;
  title: string;
  description: string;
  price: {
    amount: number;
    divisor: number;
    currency_code: string;
  };
  quantity: number;
  sku?: string[];
  state: string;
  url: string;
  images?: EtsyListingImage[];
  created_timestamp: number;
  updated_timestamp: number;
}

export interface EtsyListingImage {
  listing_id: number;
  listing_image_id: number;
  url_570xN: string;
  url_fullxfull: string;
  full_height: number;
  full_width: number;
  rank: number;
}

/**
 * Fetch active listings from an Etsy shop
 */
export async function getShopListings(
  shopId: string,
  accessToken: string
): Promise<EtsyListing[]> {
  const url = `${ETSY_API_BASE}/application/shops/${shopId}/listings/active?includes=images`;

  const response = await fetch(url, {
    headers: {
      'x-api-key': process.env.ETSY_API_KEY!,
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Etsy API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.results || [];
}

/**
 * Get a single listing by ID
 */
export async function getListing(
  listingId: string,
  accessToken: string
): Promise<EtsyListing> {
  const url = `${ETSY_API_BASE}/application/listings/${listingId}?includes=images`;

  const response = await fetch(url, {
    headers: {
      'x-api-key': process.env.ETSY_API_KEY!,
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Etsy API error: ${response.status} - ${error}`);
  }

  return await response.json();
}

/**
 * Update listing inventory (quantity)
 */
export async function updateListingInventory(
  listingId: string,
  quantity: number,
  accessToken: string
): Promise<void> {
  // First, get the listing's inventory
  const inventoryUrl = `${ETSY_API_BASE}/application/listings/${listingId}/inventory`;

  const getResponse = await fetch(inventoryUrl, {
    headers: {
      'x-api-key': process.env.ETSY_API_KEY!,
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!getResponse.ok) {
    throw new Error(`Failed to get inventory: ${getResponse.status}`);
  }

  const inventory = await getResponse.json();

  // Update the inventory
  const updateResponse = await fetch(inventoryUrl, {
    method: 'PUT',
    headers: {
      'x-api-key': process.env.ETSY_API_KEY!,
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      products: inventory.products.map((product: any) => ({
        ...product,
        offerings: product.offerings.map((offering: any) => ({
          ...offering,
          quantity,
        })),
      })),
    }),
  });

  if (!updateResponse.ok) {
    const error = await updateResponse.text();
    throw new Error(`Failed to update inventory: ${updateResponse.status} - ${error}`);
  }
}

/**
 * Update listing details (title, description, price)
 */
export async function updateListing(
  listingId: string,
  updates: {
    title?: string;
    description?: string;
    price?: number;
  },
  accessToken: string
): Promise<void> {
  const url = `${ETSY_API_BASE}/application/shops/${process.env.ETSY_SHOP_ID}/listings/${listingId}`;

  const body: any = {};
  if (updates.title) body.title = updates.title;
  if (updates.description) body.description = updates.description;
  if (updates.price) body.price = updates.price;

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'x-api-key': process.env.ETSY_API_KEY!,
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update listing: ${response.status} - ${error}`);
  }
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(code: string, verifier: string) {
  const response = await fetch('https://api.etsy.com/v3/public/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.ETSY_API_KEY!,
      redirect_uri: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/etsy/callback`,
      code,
      code_verifier: verifier,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${response.status} - ${error}`);
  }

  return await response.json();
}

/**
 * Refresh an expired access token
 */
export async function refreshAccessToken(refreshToken: string) {
  const response = await fetch('https://api.etsy.com/v3/public/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: process.env.ETSY_API_KEY!,
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token refresh failed: ${response.status} - ${error}`);
  }

  return await response.json();
}
