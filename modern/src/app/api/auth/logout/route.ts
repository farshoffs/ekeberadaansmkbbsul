import { clearAuthCookies, revokeCurrentDevice } from '@/lib/security';
import { ok } from '@/lib/http';
export const runtime='nodejs';
export async function POST(){try{await revokeCurrentDevice()}finally{await clearAuthCookies()}return ok({ok:true})}
