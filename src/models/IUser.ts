export interface IUser {
    "createdAt": string;
    "email": string;
    "firstName": string;
    "groupID": number;
    "id": number;
    "isApproved": boolean;
    "lastName": string;
    "passwordHash": string;
    "patronymic": string;
    "roleID": number;
}
export interface RegData {
  "email": string,
  "first_name": string,
  "group_id": number,
  "last_name": string,
  "password": string,
  "patronymic": string,
  "role": "student" | "seminarist"
}