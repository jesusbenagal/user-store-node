import { Router } from "express";
import { ProductController } from "./controller";
import { ProductService } from "../services";
import { AuthMiddleware } from "../middlewares/auth.middleware";

export class ProductRoutes {
  static get routes(): Router {
    const router = Router();
    const service = new ProductService();
    const productController = new ProductController(service);

    router.get("/", productController.getProducts);
    router.post(
      "/",
      [AuthMiddleware.validateJWT],
      productController.createProduct
    );

    return router;
  }
}
