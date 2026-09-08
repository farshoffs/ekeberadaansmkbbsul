import { google } from 'googleapis';
import { DEFAULT_SETTINGS, SHEETS, USER_HEADERS } from './constants';
import type { SheetValue, UserRecord } from './types';
import { normalizeTime } from './time';

function env(name:string){const v=process.env[name];if(!v)throw new Error(`Environment variable ${name} belum ditetapkan.`);return v}
const auth=new google.auth.GoogleAuth({credentials:{client_email:process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,private_key:process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g,'\n')},scopes:['https://www.googleapis.com/auth/spreadsheets']});
const sheets=google.sheets({version:'v4',auth});
const spreadsheetId=()=>env('GOOGLE_SHEET_ID');
export async function getRows(sheet:string,range='A:ZZ'){env('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY');const r=await sheets.spreadsheets.values.get({spreadsheetId:spreadsheetId(),range:`'${sheet}'!${range}`,valueRenderOption:'FORMATTED_VALUE',dateTimeRenderOption:'FORMATTED_STRING'});return (r.data.values??[]) as SheetValue[][]}
export async function appendRow(sheet:string,values:SheetValue[]){await sheets.spreadsheets.values.append({spreadsheetId:spreadsheetId(),range:`'${sheet}'!A:ZZ`,valueInputOption:'USER_ENTERED',insertDataOption:'INSERT_ROWS',requestBody:{values:[values]}})}
export async function updateRow(sheet:string,row:number,values:SheetValue[]){await sheets.spreadsheets.values.update({spreadsheetId:spreadsheetId(),range:`'${sheet}'!A${row}:${columnName(values.length)}${row}`,valueInputOption:'USER_ENTERED',requestBody:{values:[values]}})}
export async function updateCells(sheet:string,row:number,startColumn:number,values:SheetValue[]){await sheets.spreadsheets.values.update({spreadsheetId:spreadsheetId(),range:`'${sheet}'!${columnName(startColumn)}${row}:${columnName(startColumn+values.length-1)}${row}`,valueInputOption:'USER_ENTERED',requestBody:{values:[values]}})}
export function columnName(n:number){let s='';while(n>0){const r=(n-1)%26;s=String.fromCharCode(65+r)+s;n=Math.floor((n-1)/26)}return s}
export function toBool(v:unknown){const s=String(v??'').trim().toLowerCase();return v===true||['true','1','ya','✓','yes'].includes(s)}
export function normalizeEmail(v:unknown){return String(v??'').trim().toLowerCase()}
export function userFromRow(v:SheetValue[],row:number):UserRecord{const raw=String(v[3]??'').trim()||'PPP';return {row,active:toBool(v[0]),name:String(v[1]??'').trim(),email:normalizeEmail(v[2]),category:raw==='Pentadbir'?'Pengurusan':raw,isAdmin:toBool(v[4]),lateAfter:normalizeTime(v[5]),maxPunchIn:normalizeTime(v[6]),punchOutFrom:normalizeTime(v[7]),note:String(v[8]??''),passwordSalt:String(v[9]??''),passwordHash:String(v[10]??''),mustChangePassword:toBool(v[11]),sessionVersion:Math.max(1,Number(v[12])||1),failedLoginCount:Math.max(0,Number(v[13])||0),lockedUntil:String(v[14]??''),passwordUpdatedAt:String(v[15]??''),profilePhotoFileId:String(v[16]??''),authType:String(v[18]??'').trim().toUpperCase(),jobTitle:String(v[19]??'').trim(),s1In:normalizeTime(v[20]),s1Out:normalizeTime(v[21]),s2In:normalizeTime(v[22]),s2Out:normalizeTime(v[23])}}
export async function getUsers(){const rows=await getRows(SHEETS.USERS,`A1:${columnName(USER_HEADERS.length)}`);return rows.slice(1).map((r,i)=>userFromRow(r,i+2)).filter(u=>u.email)}
export async function getUser(email:string,activeOnly=true){const n=normalizeEmail(email);const u=(await getUsers()).find(x=>x.email===n)??null;return u&&(!activeOnly||u.active)?u:null}
export async function getSettings(){const rows=await getRows(SHEETS.SETTINGS,'A1:C');const s={...DEFAULT_SETTINGS};for(const row of rows.slice(1)){const k=String(row[0]??'').trim();if(k)s[k]=String(row[1]??'').trim()}return s}
