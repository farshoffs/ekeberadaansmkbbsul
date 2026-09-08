import crypto from 'node:crypto';
import {SignJWT,jwtVerify} from 'jose';
import {cookies} from 'next/headers';
import {AUTH_TYPE,MAX_TRUSTED_DEVICES,SESSION_DAYS,SHEETS} from './constants';
import {appendRow,getUser,normalizeEmail,trustedDeviceRows,updateCells} from './sheets';
import {parseDate} from './time';
import type {UserRecord} from './types';

const SESSION_COOKIE='ek_session',DEVICE_COOKIE='ek_device';
function secret(name:string,fallback?:string){const v=process.env[name]||(fallback?process.env[fallback]:undefined);if(!v)throw new Error(`Environment variable ${name} belum ditetapkan.`);return v}
const sessionKey=()=>new TextEncoder().encode(secret('EK_WEB_SESSION_SECRET'));
const trustedKey=()=>secret('EK_TRUSTED_DEVICE_SECRET','EK_WEB_SESSION_SECRET');
const pepper=()=>secret('EK_PASSWORD_PEPPER');
function b64(buf:Buffer){return buf.toString('base64').replace(/\+/g,'-').replace(/\//g,'_')}
export function hashPin(pin:string,salt:string){return b64(crypto.createHmac('sha256',pepper()).update(`${salt}\n${pin}`,'utf8').digest())}
export function verifyPin(pin:string,user:UserRecord){if(!/^\d{6}$/.test(pin)||!user.passwordHash||!user.passwordSalt)return false;const a=Buffer.from(hashPin(pin,user.passwordSalt)),b=Buffer.from(user.passwordHash);return a.length===b.length&&crypto.timingSafeEqual(a,b)}
export function newSalt(){return(crypto.randomUUID()+crypto.randomUUID()).replace(/-/g,'')}
function deviceHash(id:string,raw:string){return b64(crypto.createHmac('sha256',trustedKey()).update(`${id}\n${raw}`,'utf8').digest())}
function safeEqual(a:string,b:string){const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&crypto.timingSafeEqual(x,y)}
function deviceName(ua:string){const p=/iPhone/i.test(ua)?'iPhone':/iPad/i.test(ua)?'iPad':/Android/i.test(ua)?'Android':/Windows/i.test(ua)?'Windows':/Mac/i.test(ua)?'Mac':/Linux/i.test(ua)?'Linux':'Peranti';const b=/Edg\//i.test(ua)?'Microsoft Edge':/CriOS|Chrome\//i.test(ua)?'Chrome':/FxiOS|Firefox\//i.test(ua)?'Firefox':/Safari\//i.test(ua)?'Safari':'Pelayar';return{platform:p,browser:b,name:`${p} · ${b}`}}
function expired(v:string){const t=parseDate(v);return Number.isFinite(t)&&Date.now()>t}
async function revoke(d:{row:number;sessionVersion:number},reason:string){await updateCells(SHEETS.TRUSTED_DEVICES,d.row,10,[false,d.sessionVersion,'',reason])}
export async function revokeAllDevices(email:string,reason='DIBATALKAN_PENTADBIR'){const all=(await trustedDeviceRows()).filter(d=>d.email===normalizeEmail(email)&&d.active);for(const d of all)await revoke(d,reason);return all.length}
export async function registerDevice(user:UserRecord,ua:string,ip:string){const all=(await trustedDeviceRows()).filter(d=>d.email===user.email);for(const d of all.filter(x=>x.active&&expired(x.expiresAt)))await revoke(d,'TAMAT_30_HARI');const active=all.filter(d=>d.active&&!expired(d.expiresAt)&&d.sessionVersion===user.sessionVersion).sort((a,b)=>(parseDate(a.lastSeen)||0)-(parseDate(b.lastSeen)||0));while(active.length>=MAX_TRUSTED_DEVICES)await revoke(active.shift()!,'DIGANTI_PERANTI_BAHARU');const id=crypto.randomUUID().toLowerCase(),raw=crypto.randomBytes(32).toString('hex'),now=new Date().toISOString(),info=deviceName(ua),expires=new Date(Date.now()+SESSION_DAYS*86400000).toISOString();await appendRow(SHEETS.TRUSTED_DEVICES,[id,user.email,info.name,info.platform,info.browser,ip,now,now,expires,true,user.sessionVersion,deviceHash(id,raw),'']);return{id,credential:`${id}.${raw}`}}
export async function issueSession(user:UserRecord,deviceId:string){return new SignJWT({email:user.email,version:user.sessionVersion,deviceId}).setProtectedHeader({alg:'HS256'}).setIssuedAt().setExpirationTime(`${SESSION_DAYS}d`).sign(sessionKey())}
export async function setAuthCookies(token:string,credential:string){const jar=await cookies(),common={httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax' as const,path:'/',maxAge:SESSION_DAYS*86400};jar.set(SESSION_COOKIE,token,common);jar.set(DEVICE_COOKIE,credential,common)}
export async function clearAuthCookies(){const jar=await cookies();jar.set(SESSION_COOKIE,'',{path:'/',maxAge:0});jar.set(DEVICE_COOKIE,'',{path:'/',maxAge:0})}
export async function currentSession(){const jar=await cookies(),token=jar.get(SESSION_COOKIE)?.value,credential=jar.get(DEVICE_COOKIE)?.value;if(!token||!credential)return null;try{const{payload}=await jwtVerify(token,sessionKey());const email=normalizeEmail(payload.email),version=Number(payload.version||0),deviceId=String(payload.deviceId||'').toLowerCase();if(!email||!deviceId)return null;const [cid,raw]=credential.split('.');if(cid!==deviceId||!raw)return null;const user=await getUser(email,true);if(!user||user.sessionVersion!==version||user.mustChangePassword||user.authType!==AUTH_TYPE)return null;const d=(await trustedDeviceRows()).find(x=>x.id===deviceId&&x.email===email);if(!d||!d.active||d.sessionVersion!==version||expired(d.expiresAt)||!safeEqual(deviceHash(deviceId,raw),d.hash))return null;return{user,device:d}}catch{return null}}
export async function requireUser(){const s=await currentSession();if(!s)throw new Error('UNAUTHORIZED');return s}
export async function requireAdmin(){const s=await requireUser();if(!s.user.isAdmin)throw new Error('FORBIDDEN');return s}
export async function requireManagement(){const s=await requireUser();if(!(s.user.isAdmin||s.user.category==='Pengurusan'))throw new Error('FORBIDDEN');return s}
export async function revokeCurrentDevice(){const s=await currentSession();if(s)await revoke(s.device,'LOGOUT_PERANTI');await clearAuthCookies()}
export function isLocked(user:UserRecord){const t=parseDate(user.lockedUntil);return Number.isFinite(t)&&t>Date.now()}
export async function failedLogin(user:UserRecord){const count=user.failedLoginCount+1;if(count>=5){const until=new Date(Date.now()+15*60_000).toISOString();await updateCells(SHEETS.USERS,user.row,14,[0,until]);return{locked:true,until}}await updateCells(SHEETS.USERS,user.row,14,[count,'']);return{locked:false,until:''}}
export async function resetLoginFailures(user:UserRecord){if(user.failedLoginCount||user.lockedUntil)await updateCells(SHEETS.USERS,user.row,14,[0,''])}
export async function setPin(user:UserRecord,pin:string,mustChange=false){if(!/^\d{6}$/.test(pin))throw new Error('PIN mesti tepat 6 digit.');const salt=newSalt(),hash=hashPin(pin,salt),version=Math.max(1,user.sessionVersion)+1;await updateCells(SHEETS.USERS,user.row,10,[salt,hash,mustChange,version,0,'',new Date().toISOString()]);await updateCells(SHEETS.USERS,user.row,19,[AUTH_TYPE]);await revokeAllDevices(user.email,'PIN_DIKEMASKINI');return{...user,passwordSalt:salt,passwordHash:hash,mustChangePassword:mustChange,sessionVersion:version,authType:AUTH_TYPE}}
