// // This is your Prisma schema file,
// // learn more about it in the docs: https://pris.ly/d/prisma-schema

// // Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?
// // Try Prisma Accelerate: https://pris.ly/cli/accelerate-init

// datasource db {
//   provider = "postgresql"
//   url      = env("DATABASE_URL")
// }

// generator client {
//   provider = "prisma-client-js"
// }

// model coin {
//   id        String   @id @default(uuid())
//   symbol    String
//   name      String
//   price     Float
//   createdAt DateTime @default(now())

//   coinPriceHistory coinPriceHistory[]
//   coinWallet       coinWallet[]
// }

// model coinPriceHistory {
//   id        String   @id @default(uuid())
//   coinId    String
//   price     Float
//   createdAt DateTime @default(now())

//   coin coin @relation(fields: [coinId], references: [id])
// }

// model user {
//   id        String   @id @default(uuid())
//   name      String
//   email     String
//   password  String
//   createdAt DateTime @default(now())

//   wallet     wallet?
//   coinWallet coinWallet?
// }

// model wallet {
//   id        String   @id @default(uuid())
//   balance   Float
//   userId    String   @unique
//   createdAt DateTime @default(now())
//   user      user     @relation(fields: [userId], references: [id])

//   walletHistory walletHistory[]
// }

// model walletHistory {
//   id        String   @id @default(uuid())
//   walletId  String
//   amount    Float
//   type      String
//   createdAt DateTime @default(now())

//   wallet wallet @relation(fields: [walletId], references: [id])
// }

// model coinWallet {
//   id        String   @id @default(uuid())
//   coinId    String
//   userId    String   @unique
//   createdAt DateTime @default(now())

//   coin              coin                @relation(fields: [coinId], references: [id])
//   user              user                @relation(fields: [userId], references: [id])
//   coinWalletHistory coinWalletHistory[]
// }

// model coinWalletHistory {
//   id           String     @id @default(uuid())
//   coinWalletId String
//   createdAt    DateTime   @default(now())
//   amount       Float
//   type         String

//   coinWallet    coinWallet   @relation(fields: [coinWalletId], references: [id])
// }
// --------------------------------------------------------------------------------------
