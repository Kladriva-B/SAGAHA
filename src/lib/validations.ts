import { z } from "zod";

const email = z.string().trim().toLowerCase().email().max(255);
const password = z
  .string()
  .min(10, "Mot de passe : au moins 10 caractères")
  .max(128, "Mot de passe trop long")
  .regex(/[A-Z]/, "Au moins une majuscule")
  .regex(/[a-z]/, "Au moins une minuscule")
  .regex(/[0-9]/, "Au moins un chiffre");

/** Connexion : mot de passe déjà hashé côté serveur ; format libre à la saisie. */
export const loginSchema = z.object({
  email,
  password: z.string().min(1).max(512),
  totp: z.string().optional(),
});

export const registerSchema = z.object({
  email,
  password,
  companyName: z.string().trim().min(2).max(200),
  region: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(8).max(30),
});

/** Candidature publique (champs inscription + message optionnel). */
export const candidatureSchema = registerSchema.extend({
  notes: z.string().trim().max(2000).optional(),
});

export const distributorProfilePatchSchema = z
  .object({
    companyName: z.string().trim().min(2).max(200).optional(),
    region: z.string().trim().min(2).max(120).optional(),
    phone: z.string().trim().min(8).max(30).optional(),
    address: z.string().trim().max(2000).optional(),
  })
  .refine((d) => Object.keys(d).some((k) => d[k as keyof typeof d] !== undefined), {
    message: "Au moins un champ requis",
  });

export const distributorDocumentBodySchema = z.object({
  label: z.string().trim().min(1).max(120),
  fileUrl: z.string().url().max(2000),
});

export const productCreateSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(5000),
  price: z.coerce.number().positive().max(1_000_000),
  stock: z.coerce.number().int().min(0).max(10_000_000),
  minStockAlert: z.coerce.number().int().min(0).max(1_000_000).optional().default(5),
  category: z.string().trim().min(1).max(100),
  imageUrl: z.string().url().max(2000).optional().or(z.literal("")),
  isActive: z.coerce.boolean().optional().default(true),
});

export const productUpdateSchema = productCreateSchema.partial();

export const adminDistributorCreateSchema = z.object({
  email,
  password,
  companyName: z.string().trim().min(2).max(200),
  region: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(8).max(30),
});

export const orderStatusUpdateSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED", "DRAFT"]),
});

export const totpConfirmSchema = z.object({
  secret: z.string().min(16).max(128),
  code: z.string().trim().regex(/^\d{6}$/),
});

export const totpDisableSchema = z.object({
  password: z.string().min(1).max(512),
});

/** Query GET /api/products */
export const publicProductsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(10_000).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(20),
  category: z.string().trim().max(100).optional(),
  q: z.string().trim().max(200).optional(),
});

/** Query GET /api/distributors */
export const publicDistributorsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(10_000).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(30),
  region: z.string().trim().max(120).optional(),
  q: z.string().trim().max(200).optional(),
});

/** Query GET /api/admin/distributors */
export const adminDistributorsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(10_000).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
  region: z.string().trim().max(120).optional(),
  status: z.enum(["PENDING", "ACTIVE", "SUSPENDED"]).optional(),
  q: z.string().trim().max(200).optional(),
});

/** Body PUT /api/admin/distributors/[id]/status */
export const distributorStatusUpdateBodySchema = z.object({
  status: z.enum(["PENDING", "ACTIVE", "SUSPENDED"]),
});

/** Body POST /api/orders */
export const orderCreateSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().trim().min(1).max(64),
        quantity: z.coerce.number().int().positive().max(9999),
      }),
    )
    .min(1)
    .max(100),
});

/** Query GET /api/orders/my */
export const myOrdersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(10_000).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(20),
});

/** Query GET /api/admin/orders */
export const adminOrdersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(10_000).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(50),
  distributorId: z.string().trim().min(1).max(64).optional(),
  region: z.string().trim().max(120).optional(),
  from: z.string().trim().max(40).optional(),
  to: z.string().trim().max(40).optional(),
});

/** Body PUT /api/admin/orders/[id]/status */
export const adminOrderStatusBodySchema = z.object({
  status: z.enum(["DRAFT", "PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"]),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProductCreateInput = z.infer<typeof productCreateSchema>;
