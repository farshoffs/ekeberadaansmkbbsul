import { SignJWT } from 'jose';
import { AUTH_TYPE } from '@/lib/constants';
import { getUser, normalizeEmail } from '@/lib/sheets';
import { fail, ok } from '@/lib/http';
export const runtime='nodejs';
export async function POST(req:Request){try{const{email}=await req.json();const n=normalizeEmail(email);if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(n))throw new Error('Masukkan emel DELIMa yang sah.');const user=await getUser(n,true);if(!user)throw new Error('Akaun tidak ditemui atau tidak aktif.');const needsPinSetup=user.authType!==AUTH_TYPE||!user.passwordHash||!user.passwordSalt||user.mustChangePassword;let setupToken='';if(needsPinSetup){const secret=process.env.EK_WEB_SESSION_SECRET;if(!secret)throw new Error('EK_WEB_SESSION_SECRET belum ditetapkan.');setupToken=await new SignJWT({purpose:'PIN_SETUP',email:user.email,version:user.sessionVersion}).setProtectedHeader({alg:'HS256'}).setIssuedAt().setExpirationTime('10m').sign(new TextEncoder().encode(secret))}return ok({ok:true,user:{name:user.name,email:user.email},needsPinSetup,setupToken})}catch(e){return fail(e)}}
