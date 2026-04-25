/*
  Warnings:

  - You are about to drop the column `telefono` on the `Usuario` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Pedido" ADD COLUMN     "telefono" TEXT NOT NULL DEFAULT '000000000';

-- AlterTable
ALTER TABLE "Usuario" DROP COLUMN "telefono";
