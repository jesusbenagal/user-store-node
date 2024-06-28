import { bcryptAdapter, JwtAdapter } from "../../config";
import { UserModel } from "../../data";
import {
  CustomError,
  LoginUserDto,
  RegisterUserDto,
  UserEntity,
} from "../../domain";

export class AuthService {
  constructor() {}

  public async registerUser(registerUserDto: RegisterUserDto) {
    const existsUser = await UserModel.findOne({
      email: registerUserDto.email,
    });
    if (existsUser) throw CustomError.badRequest("User already exists");

    try {
      const user = new UserModel(registerUserDto);

      user.password = bcryptAdapter.hash(registerUserDto.password);

      await user.save();

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
}
