import { bcryptAdapter, envs, JwtAdapter } from "../../config";
import { UserModel } from "../../data";
import {
  CustomError,
  LoginUserDto,
  RegisterUserDto,
  UserEntity,
} from "../../domain";
import { EmailService } from "./email.service";

export class AuthService {
  constructor(private readonly emailService: EmailService) {}

  public async registerUser(registerUserDto: RegisterUserDto) {
    const existsUser = await UserModel.findOne({
      email: registerUserDto.email,
    });
    if (existsUser) throw CustomError.badRequest("User already exists");

    try {
      const user = new UserModel(registerUserDto);

      user.password = bcryptAdapter.hash(registerUserDto.password);

      await user.save();

      this.sendEmailValidationLink(user.email);

      const { password, ...userEntity } = UserEntity.fromObject(user);

      const token = await JwtAdapter.generateToken({ id: user.id });

      return { user: userEntity, token };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  public async loginUser(loginUserDro: LoginUserDto) {
    const user = await UserModel.findOne({ email: loginUserDro.email });
    if (!user) throw CustomError.notFound("User not found");

    const isPasswordCorrect = bcryptAdapter.compare(
      loginUserDro.password,
      user.password
    );
    if (!isPasswordCorrect) throw CustomError.unauthorized("Invalid password");

    const { password, ...userEntity } = UserEntity.fromObject(user);

    const token = await JwtAdapter.generateToken({ id: user.id });
    if (!token) throw CustomError.internalServer("Error while creating JWT");

    return { user: userEntity, token };
  }

  public async validateEmail(token: string) {
    const payload = await JwtAdapter.validateToken(token);
    if (!payload) throw CustomError.unauthorized("Invalid token");

    const { email } = payload as { email: string };
    if (!email) throw CustomError.internalServer("Email not found in token");

    const user = await UserModel.findOne({ email });
    if (!user) throw CustomError.internalServer("Email not exists");

    user.emailValidated = true;
    await user.save();

    return true;
  }

  private sendEmailValidationLink = async (email: string) => {
    const token = await JwtAdapter.generateToken({ email });
    if (!token)
      throw CustomError.internalServer("Error while creating Email JWT");

    const link = `${envs.WEBSERVICE_URL}/auth/validate-email/${
      token as string
    }`;
    const html = `
    <h1>Validate your email</h1>
    <p>Click on the link below to validate your email</p>
    <a href="${link}">Validate email</a>
    `;

    const options = {
      to: email,
      subject: "Validate your email",
      htmlBody: html,
    };

    const isSet = this.emailService.sendEmail(options);
    if (!isSet) throw CustomError.internalServer("Error while sending email");

    return true;
  };
}
