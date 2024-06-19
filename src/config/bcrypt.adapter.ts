import { compareSync, genSaltSync, hashSync } from "bcryptjs";

export const bcryptAdapter = {
  hash: (value: string) => hashSync(value, genSaltSync()),
  compare: (value: string, hash: string) => compareSync(value, hash),
};
