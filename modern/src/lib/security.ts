import crypto from 'node:crypto';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { AUTH_TYPE, MAX_TRUSTED_DEVICES, SESSION_DAYS, SHEETS } from './constants';
import { appendRow, getRows, getUser, normalizeEmail, toBool, updateCells } from './sheets';
import type { UserRecord } from './types';
import { isoPlusDays, parseSheetDate } from './time';

const SESSION_COOKIE='ek_session', DEVICE_COOKIE='ek_device';
function secret(name:string,fallback?:string){const v=process.env[name]||(fallback?process.env[fallback]:undefined);if(!v)throw new Error(`Environment variable ${name} belum ditetapkan.`);return v}
const sessionKey=()=>new TextEncoder().encode(secret('EK_WEB_SESSION_SECRET'));
const trustedKey=()=>secret('EK_TRUSTED_DEVICE_SECRET','EK_WEB_SESSION_SECRET');
const pepper=()=>secret('EK_PASSWORD_PEPPER');
function b64(buf:Buffer){return buf.toString('base64').replace(/\+/g,'-').replace(/\//g,'_')}
export function hashPin(pin:string,salt:string){return b64(crypto.createHmac('sha256',pepper()).update(`${salt}\n${pin}`,'utf8').digest())}
export function verifyPin(pin:string,user:UserRecord){if(!user.passwordHash||!user.passwordSalt)return false;const a=Buffer.from(hashPin(pin,user.passwordSalt)),b=Buffer.from(user.passwordHash);return a.length===b.length&&crypto.timingSafeEqual(a,b)}
export function newSalt(){return crypto.randomUUID().replace(/-/g,'')+crypto.randomUUID().replace(/-/g,'')}
function deviceHash(id:string,s:string){return b64(crypto.createHmac('sha256',trustedKey()).update(`${id}\n${s}`,'utf8').digest())}
function deviceName(ua:string){const p=/iPhone/i.test(ua)?'iPhone':/iPad/i.test(ua)?'iPad':/Android/i.test(ua)?'Android':/Windows/i.test(ua)?'Windows':/Mac/i.test(ua)?'Mac':/Linux/i.test(ua)?'Linux':'Peranti';const b=/Edg\//i.test(ua)?'Microsoft Edge':/CriOS|Chrome\//i.test(ua)?'Chrome':/FxiOS|Firefox\//i.test(ua)?'Firefox':/Safari\//i.test(ua)?'Safari':'Pelayar';return{platform:p,browser:b,name:`${p} · ${b}`}}
type Device={row:number;id:string;email:string;expiresAt:string;active:boolean;sessionVersion:number;lastSeen:string;hash:string};
async function devicesFor(email:string){const rows=await getRows(SHEETS.TRUSTED_DEVICES,'A1:M');return rows.slice(1).map((r,i):Device=>({row:i+2,id:String(r[0]??'').trim().toLowerCase(),email:normalizeEmail(r[1]),expiresAt:String(r[8]??''),active:toBool(r[9]),sessionVersion:Math.max(1,Number(r[10])||1),hash:String(r[11]??''),lastSeen:String(r[7]??r[6]??'')})).filter(d=>d.email===normalizeEmail(email)&&d.id)}
function expired(v:string){const t=parseSheetDate(v);return Number.isFinite(t)&&Date.now()>t}
async function revokeDevice(d:Device,reason:string){await updateCells(SHEETS.TRUSTED_DEVICES,d.row,10,[false,d.sessionVersion,'',reason])}
export async function registerDevice(user:UserRecord,ua:string,ip:string){const all=await devicesFor(user.email);for(const d of all.filter(x=>x.active&&expired(x.expiresAt)))await revokeDevice(d,'TAMAT_30_HARI');const active=all.filter(d=>d.active&&!expired(d.expiresAt)&&d.sessionVersion===user.sessionVersion).sort((a,b)=>(parseSheetDate(a.lastSeen)||0)-(parseSheetDate(b.lastSeen)||0));while(active.length>=MAX_TRUSTED_DEVICES)await revokeDevice(active.shift()!,'DIGANTI_PERANTI_BAHARU');const id=crypto.randomUUID().toLowerCase(),raw=crypto.randomBytes(32).toString('hex'),now=new Date().toISOString(),info=deviceName(ua);await appendRow(SHEETS.TRUSTED_DEVICES,[id,user.email,info.name,info.platform,info.browser,ip,now,now,isoPlusDays(SESSION_DAYS),true,user.sessionVersion,deviceHash(id,raw),'']);return{id,credential:`${id}.${raw}`}}
export async function issueSession(user:UserRecord,deviceId:string){return new SignJWT({email:user.email,version:user.sessionVersion,deviceId}).setProtectedHeader({alg:'HS256'}).setIssuedAt().setExpirationTime(`${SESSION_DAYS}d`).sign(sessionKey())}
export async function setAuthCookies(token:string,credential:string){const jar=await cookies(),common={httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax' as const,path:'/',maxAge:SESSION_DAYS*86400};jar.set(SESSION_COOKIE,token,common);jar.set(DEVICE_COOKIE,credential,common)}
export async function clearAuthCookies(){const jar=await cookies();jar.set(SESSION_COOKIE,'',{path:'/',maxAge:0});jar.set(DEVICE_COOKIE,'',{path:'/',maxAge:0})}
async function findDevice(id:string,email:string){return(await devicesFor(email)).find(d=>d.id===id)??null}
export async function currentSession(){const token=(await cookies()).get(SESSION_COOKIE)?.value;if(!token)return null;try{const{payload}=await jwtVerify(token,sessionKey());const email=normalizeEmail(payload.email),version=Number(payload.version||0),deviceId=String(payload.deviceId||'');if(!email||!deviceId)return null;const user=await getUser(email,true);if(!user||user.sessionVersion!==version||user.mustChangePassword||user.authType!==AUTH_TYPE)return null;const device=await findDevice(deviceId,user.email);if(!device||!device.active||device.sessionVersion!==user.sessionVersion||expired(device.expiresAt))return null;return{user,device}}catch{return null}}
export async function requireUser(){const s=await currentSession();if(!s)throw new Error('UNAUTHORIZED');return s}
export async function requireAdmin(){const s=await requireUser();if(!s.user.isAdmin)throw new Error('FORBIDDEN');return s}
export async function revokeCurrentDevice(){const s=await currentSession();if(s)await revokeDevice(s.device,'LOGOUT_PERANTI')}
