import { NextResponse } from 'next/server';
export function clientIp(req:Request){return (req.headers.get('x-forwarded-for')||req.headers.get('x-real-ip')||'').split(',')[0].trim().slice(0,64)}
export function ok(data:unknown,status=200){return NextResponse.json(data,{status})}
export function fail(error:unknown,status=400){const m=error instanceof Error?error.message:String(error||'Ralat tidak diketahui.');const code=m==='UNAUTHORIZED'?401:m==='FORBIDDEN'?403:status;return NextResponse.json({ok:false,error:m==='UNAUTHORIZED'?'Sesi tamat. Sila log masuk semula.':m==='FORBIDDEN'?'Akses tidak dibenarkan.':m},{status:code})}
