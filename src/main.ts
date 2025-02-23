import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";
import compression from "compression";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { LoggerService } from "./utils/logger.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);
  const logger = app.get(LoggerService);
  app.useLogger(logger);

  // Global prefix
  app.setGlobalPrefix("api");

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // Security
  app.use(helmet());
  app.enableCors({
    origin: configService.get("CORS_ORIGIN", "*"),
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  });

  // Compression
  app.use(compression());

  // Swagger documentation
  if (configService.get("NODE_ENV") !== "production") {
    const config = new DocumentBuilder()
      .setTitle("Backend Dashboard API")
      .setDescription("API documentation for the Backend Dashboard")
      .setVersion("1.0")
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api/docs", app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  const port = configService.get("PORT", 3000);
  const host = configService.get("HOST", "0.0.0.0");

  await app.listen(port, host);

  logger.log(`Server running on http://${host}:${port}`);
  if (configService.get("NODE_ENV") !== "production") {
    logger.log(
      `Swagger documentation available at http://${host}:${port}/api/docs`
    );
  }
}

bootstrap().catch((error) => {
  console.error("Error starting server:", error);
  process.exit(1);
});
