import { envs } from "../../config";
import {
  MongoDatabase,
  CategoryModel,
  ProductModel,
  UserModel,
} from "../mongo";
import { seedData } from "./data";

(async () => {
  await MongoDatabase.connect({
    dbName: envs.MONGO_DB_NAME,
    mongoUrl: envs.MONGO_URL,
  });

  await main();

  await MongoDatabase.disconnect();
})();

const randomBetweeen0andX = (x: number) => Math.floor(Math.random() * x);

async function main() {
  // Delete all data
  await Promise.all([
    UserModel.deleteMany(),
    CategoryModel.deleteMany(),
    ProductModel.deleteMany(),
  ]);

  // Create Users
  const users = await UserModel.insertMany(seedData.users);

  // Create Categories
  const categories = await CategoryModel.insertMany(
    seedData.categories.map((category) => ({
      ...category,
      user: users[randomBetweeen0andX(users.length - 1)]._id,
    }))
  );

  // Create Products
  await ProductModel.insertMany(
    seedData.products.map((product) => ({
      ...product,
      user: users[randomBetweeen0andX(users.length - 1)]._id,
      category: categories[randomBetweeen0andX(categories.length - 1)]._id,
    }))
  );

  console.log("SEED COMPLETED");
}
