export type SheetValue=string|number|boolean|null|undefined;
export type UserRecord={row:number;active:boolean;name:string;email:string;category:string;isAdmin:boolean;lateAfter:string;maxPunchIn:string;punchOutFrom:string;note:string;passwordSalt:string;passwordHash:string;mustChangePassword:boolean;sessionVersion:number;failedLoginCount:number;lockedUntil:string;passwordUpdatedAt:string;profilePhotoFileId:string;authType:string;jobTitle:string;s1In:string;s1Out:string;s2In:string;s2Out:string};
export type Settings=Record<string,string>;
export type AttendanceRow={row:number;values:SheetValue[];date:string;email:string};
export type AbsenceRow={row:number;id:string;submittedAt:string;email:string;name:string;category:string;type:string;startDate:string;endDate:string;note:string;status:string;reviewedBy:string;reviewedAt:string;comment:string;updatedAt:string;mode:'TIDAK_HADIR'|'KEBERADAAN';startTime:string;endTime:string;jobTitle:string};
