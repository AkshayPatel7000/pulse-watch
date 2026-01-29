import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth";

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
