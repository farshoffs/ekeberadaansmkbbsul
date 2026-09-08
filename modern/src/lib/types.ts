export type SheetValue = string | number | boolean | null;
export type UserRecord = {
  row:number; active:boolean; name:string; email:string; category:string; isAdmin:boolean; lateAfter:string; maxPunchIn:string; punchOutFrom:string; note:string;
  passwordSalt:string; passwordHash:string; mustChangePassword:boolean; sessionVersion:number; failedLoginCount:number; lockedUntil:string; passwordUpdatedAt:string;
  profilePhotoFileId:string; authType:string; jobTitle:string; s1In:string; s1Out:string; s2In:string; s2Out:string;
};
export type LocationPayload = {lat:number; lng:number; accuracy:number};
