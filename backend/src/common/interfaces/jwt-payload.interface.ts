/** Shape of the decoded JWT payload */
export interface JwtPayload {
  sub: string;    // MongoDB user ObjectId
  email: string;
  iat?: number;
  exp?: number;
}
