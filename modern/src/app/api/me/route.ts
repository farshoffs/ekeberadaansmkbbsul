import { attendanceToday } from '@/lib/attendance';
import { fail, ok } from '@/lib/http';
import { requireUser } from '@/lib/security';
export const runtime='nodejs';
export async function GET(){try{const{user}=await requireUser(),today=await attendanceToday(user);return ok({ok:true,user:{name:user.name,email:user.email,category:user.category,jobTitle:user.jobTitle,isAdmin:user.isAdmin},today:{record:today.record?{values:today.record.values}:null,next:today.next,schedule:today.schedule},settings:{schoolName:today.settings.SCHOOL_NAME,systemMode:today.settings.SYSTEM_MODE,radiusM:Number(today.settings.RADIUS_M),maxGpsAccuracyM:Number(today.settings.MAX_GPS_ACCURACY_M)}})}catch(e){return fail(e)}}
