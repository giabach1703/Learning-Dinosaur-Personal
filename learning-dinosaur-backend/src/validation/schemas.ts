import { z } from 'zod';

// ==========================================
// AUTH SCHEMAS
// ==========================================

export const registerSchema = z.object({
  email: z.string('Email không được để trống').email('Email không đúng định dạng'),
  password: z.string('Mật khẩu không được để trống').min(6, 'Mật khẩu phải có tối thiểu 6 ký tự'),
  displayName: z.string('Tên hiển thị không được để trống').trim().min(1, 'Tên hiển thị không được để trống'),
});

export const loginSchema = z.object({
  email: z.string('Email không được để trống').email('Email không đúng định dạng'),
  password: z.string('Mật khẩu không được để trống').min(1, 'Mật khẩu không được để trống'),
});

export const googleLoginSchema = z.object({
  idToken: z.string('Không tìm thấy ID Token của Google'),
});

// ==========================================
// DECK SCHEMAS
// ==========================================

export const deckSchema = z.object({
  name: z.string('Tên bộ thẻ không được để trống').trim().min(1, 'Tên bộ thẻ không được để trống'),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// ==========================================
// CARD SCHEMAS
// ==========================================

export const cardSchema = z.object({
  front: z.string('Mặt trước không được để trống').trim().min(1, 'Mặt trước không được để trống'),
  back: z.string('Mặt sau không được để trống').trim().min(1, 'Mặt sau không được để trống'),
  imageUrl: z.string().optional().nullable(),
  frontLanguage: z.string().optional().nullable(),
  backLanguage: z.string().optional().nullable(),
});

export const updateCardSchema = z.object({
  front: z.string('Mặt trước không được để trống').trim().min(1, 'Mặt trước không được để trống'),
  back: z.string('Mặt sau không được để trống').trim().min(1, 'Mặt sau không được để trống'),
  status: z.enum(['new', 'mastered', 'not_mastered']).optional(),
  imageUrl: z.string().optional().nullable(),
  frontLanguage: z.string().optional().nullable(),
  backLanguage: z.string().optional().nullable(),
});

// ==========================================
// STUDY SCHEMAS
// ==========================================

export const reviewCardSchema = z.object({
  result: z.enum(['mastered', 'not_mastered'], {
    message: 'Kết quả học không hợp lệ. Phải là mastered hoặc not_mastered',
  }),
});

// ==========================================
// PROFILE SCHEMAS
// ==========================================

export const updateProfileSchema = z.object({
  displayName: z.string('Tên người dùng không được để trống').trim().min(1, 'Tên người dùng không được để trống').optional(),
  email: z.string('Email không được để trống').email('Email không đúng định dạng').optional(),
  avatarIndex: z.number().int().min(0).max(20).optional(),
  avatarUrl: z.string().nullable().optional(),
});
