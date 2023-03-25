import { hash } from "@src/utils/hash.js";

const password = await hash("admin123");
const password2 = await hash("user1234");

export const usersSeed = [
  {
    username: "admin",
    email: "admin@example.com",
    password: password,
    name: "Admin",
    role: ["invite user", "edit invite user", "read invite user", "read user", "cancel invite user"],
  },

  {
    username: "usertesting",
    email: "usertesting@gmail.com",
    password: password2,
    name: "usertesting",
    role: "0",
  },

  {
    name: "exist",
    branch_assigned: "1",
  },
];
