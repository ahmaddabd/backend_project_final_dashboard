import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { APP_FILTER, APP_GUARD } from "@nestjs/core";
import { JwtAuthGuard } from "./application/auth/guards/jwt-auth.guard";
import { RolesGuard } from "./application/auth/guards/roles.guard";
import { AllExceptionsFilter } from "./application/common/filters/all-exceptions.filter";
import { AuthModule } from "./application/auth/auth.module";
import { ProductsModule } from "./application/products/products.module";
import { StoresModule } from "./application/stores/stores.module";
import { ReviewsModule } from "./application/reviews/reviews.module";
import { CategoriesModule } from "./application/categories/categories.module";
import { LoggerService } from "./utils/logger.service";
import jwtConfig from "./application/config/jwt.config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [jwtConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get("DB_HOST", "localhost"),
        port: configService.get("DB_PORT", 5432),
        username: configService.get("DB_USERNAME", "postgres"),
        password: configService.get("DB_PASSWORD", "postgres"),
        database: configService.get("DB_NAME", "dashboard"),
        entities: [__dirname + "/**/*.entity{.ts,.js}"],
        synchronize:
          configService.get("NODE_ENV", "development") === "development",
        logging: configService.get("DB_LOGGING", "false") === "true",
        ssl:
          configService.get("DB_SSL", "false") === "true"
            ? {
                rejectUnauthorized: false,
              }
            : false,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    ProductsModule,
    StoresModule,
    ReviewsModule,
    CategoriesModule,
  ],
  providers: [
    LoggerService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
