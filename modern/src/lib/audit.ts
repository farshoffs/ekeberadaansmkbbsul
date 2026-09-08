import { SHEETS } from './constants';
import { appendRow } from './sheets';
export async function audit(actor:string,action:string,target='',details=''){try{await appendRow(SHEETS.AUDIT,[new Date().toISOString(),actor||'SYSTEM',action,target,details])}catch{}}
export async function loginLog(email:string,name:string,category:string,ip:string,ua:string,status:string,detail:string){try{await appendRow(SHEETS.LOGIN_LOG,[new Date().toISOString(),email,name,category,ip,ua,status,detail])}catch{}}
