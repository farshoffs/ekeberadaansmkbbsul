import { monthRecords } from '@/lib/attendance';
import { fail, ok } from '@/lib/http';
import { requireUser } from '@/lib/security';
import { todayKey } from '@/lib/time';
export const runtime='nodejs';
export async function GET(req:Request){try{const{user}=await requireUser(),month=new URL(req.url).searchParams.get('month')||todayKey().slice(0,7);return ok({ok:true,records:await monthRecords(user,month)})}catch(e){return fail(e)}}
