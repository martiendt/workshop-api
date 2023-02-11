import { ObjectId } from "mongodb";
import { hash } from "@src/utils/hash.js";

export interface UserInterface {
  _id?: string | ObjectId;
  username?: string;
  email?: string;
  password?: string;
  name?: string;
  role?: string;
  emailValidationCode?: string;
  status?: "registered" | "activated" | "suspended";
}

export const restricted = ["password"];

export class UserEntity {
  public user: UserInterface;

  constructor(user: UserInterface) {
    this.user = user;
  }

  public generateEmailValidationCode() {
    this.user.emailValidationCode = "";
  }

  public async generateRandomUsername() {
    this.user.username = "";
  }

  public async generateRandomPassword() {
    this.user.password = "";
  }
}
