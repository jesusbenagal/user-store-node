import { regularExps } from "../../../config";

export class RegisterUserDto {
  private constructor(
    public readonly name: string,
    public readonly email: string,
    public readonly password: string
  ) {}

  static create(object: { [key: string]: any }): [string?, RegisterUserDto?] {
    const { name, email, password } = object;

    if (!name) return ["Name is required"];
    if (!email) return ["Email is required"];
    if (!regularExps.email.test(email)) return ["Invalid email"];
    if (!password) return ["Password is required"];
    if (password.length < 6) return ["Password must be at least 6 characters"];

    return [undefined, new RegisterUserDto(name, email, password)];
  }
}
