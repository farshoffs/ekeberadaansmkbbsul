import { TIMEZONE } from './constants';
function parts(date:Date){return new Intl.DateTimeFormat('en-GB',{timeZone:TIMEZONE,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(date).reduce<Record<string,string>>((a,p)=>{if(p.type!=='literal')a[p.type]=p.value;return a},{})}
export function todayKey(date=new Date()){const p=parts(date);return `${p.year}-${p.month}-${p.day}`}
export function timeKey(date=new Date()){const p=parts(date);return `${p.hour}:${p.minute}:${p.second}`}
export function minutesOf(time:string){const m=String(time||'').match(/^(\d{1,2}):(\d{2})/);return m?Number(m[1])*60+Number(m[2]):NaN}
export function normalizeTime(v:unknown){const s=String(v??'').trim();const m=s.match(/^(\d{1,2}):(\d{2})/);return m?`${m[1].padStart(2,'0')}:${m[2]}`:s}
export function dateCellToKey(v:unknown){const s=String(v??'').trim();let m=s.match(/^(\d{4})-(\d{2})-(\d{2})/);if(m)return `${m[1]}-${m[2]}-${m[3]}`;m=s.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})/);return m?`${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`:s}
export function parseSheetDate(v:unknown){const raw=String(v??'').trim();if(!raw)return NaN;const direct=Date.parse(raw);if(Number.isFinite(direct))return direct;const m=raw.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);if(!m)return NaN;return Date.parse(`${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}T${(m[4]||'00').padStart(2,'0')}:${m[5]||'00'}:${m[6]||'00'}+08:00`)}
export function isoPlusDays(days:number){return new Date(Date.now()+days*86400000).toISOString()}
