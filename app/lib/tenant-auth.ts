import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth";
import { getDb } from "./mongodb";

export async function getAuthorizedTenantId(orgParam?: string | null) {
  const session = await getServerSession(authOptions);
  const userTenantId = (session?.user as any)?.tenantId;

  if (!userTenantId) {
    return null;
  }

  // If a specific organization is requested in the URL/Param, it MUST match the session
  if (orgParam && orgParam !== userTenantId) {
    return null;
  }

  return userTenantId;
}

/**
 * Get tenant ID from org slug without authentication
 * Used for public status pages
 */
export async function getPublicTenantId(
  orgSlug: string,
): Promise<string | null> {
  if (!orgSlug) return null;

  try {
    const db = await getDb();
    const tenant = await db.collection("tenants").findOne({ slug: orgSlug });
    return tenant?.slug || null;
  } catch (error) {
    console.error("Error fetching public tenant:", error);
    return null;
  }
}

/**
 * Get tenant ID for either authenticated or public access
 * First tries authenticated access, then falls back to public if org param is provided
 */
export async function getTenantId(
  orgParam?: string | null,
): Promise<string | null> {
  // Try authenticated access first
  const authTenantId = await getAuthorizedTenantId(orgParam);
  if (authTenantId) return authTenantId;

  // Fall back to public access if org param is provided
  if (orgParam) {
    return await getPublicTenantId(orgParam);
  }

  return null;
}
