import crypto from 'node:crypto';
import { ABSENCE_HEADERS, SHEETS } from '@/lib/constants';
import { audit } from '@/lib/audit';
import { fail, ok } from '@/lib/http';
import { appendRow, getRows } from '@/lib/sheets';
import { requireUser } from '@/lib/security';
import { todayKey } from '@/lib/time';
export const runtime='nodejs';
export async function GET(){try{const{user}=await requireUser(),rows=await getRows(SHEETS.ABSENCE,'A1:R'),mine=rows.slice(1).filter(r=>String(r[2]||'').trim().toLowerCase()===user.email).map(r=>({id:r[0],submittedAt:r[1],type:r[5],startDate:r[6],endDate:r[7],note:r[8],status:r[9],comment:r[12],mode:r[14],startTime:r[15],endTime:r[16]})).reverse();return ok({ok:true,records:mine})}catch(e){return fail(e)}}
export async function POST(req:Request){try{const{user}=await requireUser(),b=await req.json(),mode=String(b.mode||'').toUpperCase();if(!['TIDAK_HADIR','KEBERADAAN'].includes(mode))throw new Error('Mod permohonan tidak sah.');const startDate=String(b.startDate||todayKey()),endDate=String(b.endDate||startDate);if(!/^\d{4}-\d{2}-\d{2}$/.test(startDate)||!/^\d{4}-\d{2}-\d{2}$/.test(endDate)||endDate<startDate)throw new Error('Tarikh permohonan tidak sah.');const id=crypto.randomUUID(),now=new Date().toISOString(),row=Array(ABSENCE_HEADERS.length).fill('');row[0]=id;row[1]=now;row[2]=user.email;row[3]=user.name;row[4]=user.category;row[5]=String(b.type||'LAIN-LAIN').trim();row[6]=startDate;row[7]=endDate;row[8]=String(b.note||'').trim();row[9]='MENUNGGU';row[13]=now;row[14]=mode;row[15]=String(b.startTime||'');row[16]=String(b.endTime||'');row[17]=user.jobTitle;await appendRow(SHEETS.ABSENCE,row);await audit(user.email,'HANTAR_PERMOHONAN',id,`${mode}; ${startDate} hingga ${endDate}`);return ok({ok:true,id})}catch(e){return fail(e)}}
