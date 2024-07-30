import { Validators } from "../../../config";

export class CreateProductDto {
  private constructor(
    public readonly name: string,
    public readonly available: boolean,
    public readonly price: number,
    public readonly description: string,
    public readonly user: string,
    public readonly category: string
  ) {}

  static create(obj: { [key: string]: any }): [string?, CreateProductDto?] {
    const { name, available = true, price, description, user, category } = obj;

    let availableBoolean = available;

    if (!name) return ["Name is required"];
    if (!user) return ["User is required"];
    if (!Validators.isMongoId(user)) return ["User is invalid"];
    if (!category) return ["Category is required"];
    if (!Validators.isMongoId(category)) return ["Category is invalid"];
    if (typeof available !== "boolean") availableBoolean = available === "true";

    return [
      undefined,
      new CreateProductDto(
        name,
        !!available,
        price,
        description,
        user,
        category
      ),
    ];
  }
}
