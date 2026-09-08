import { punch } from '@/lib/attendance';
import { clientIp, fail, ok } from '@/lib/http';
import { requireUser } from '@/lib/security';
export const runtime='nodejs';
export async function POST(req:Request){try{const{user}=await requireUser(),body=await req.json(),type=String(body.type||'').toUpperCase();if(type!=='IN'&&type!=='OUT')throw new Error('Jenis rekod waktu tidak sah.');return ok(await punch(user,type,body.location,clientIp(req)))}catch(e){return fail(e)}}
