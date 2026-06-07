import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import * as userRepository from '../repositories/userRepository';
import { signToken } from '../utils/jwt';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '956714257482-2u4lmqbq96thm8k048boo9j22etiq297.apps.googleusercontent.com';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

export async function registerUser(email: string, passwordHashRaw: string, displayName: string) {
  const existingUser = await userRepository.findUserByEmail(email);
  if (existingUser) {
    throw new Error('Email đã được sử dụng');
  }

  const passwordHash = await bcrypt.hash(passwordHashRaw, 10);
  const user = await userRepository.createUser({
    email,
    passwordHash,
    displayName: displayName.trim(),
  });

  const token = signToken({ userId: user.id });
  return { token, user };
}

export async function loginUser(email: string, passwordRaw: string) {
  const user = await userRepository.findUserByEmail(email);
  if (!user) {
    throw new Error('Email hoặc mật khẩu không chính xác');
  }

  if (!user.passwordHash) {
    throw new Error('Tài khoản này được đăng ký qua Google. Vui lòng đăng nhập bằng Google.');
  }

  const isPasswordValid = await bcrypt.compare(passwordRaw, user.passwordHash);
  if (!isPasswordValid) {
    throw new Error('Email hoặc mật khẩu không chính xác');
  }

  const token = signToken({ userId: user.id });
  return { token, user };
}

export async function googleLoginUser(idToken: string) {
  let ticket;
  try {
    ticket = await googleClient.verifyIdToken({
      idToken: idToken,
      audience: GOOGLE_CLIENT_ID,
    });
  } catch (err: any) {
    console.error('[Google OAuth Error] verifyIdToken failed:', err.message || err);
    throw new Error('Xác thực Google ID Token thất bại');
  }

  const payload = ticket.getPayload();
  if (!payload || !payload.email) {
    throw new Error('Google ID Token không chứa thông tin hợp lệ');
  }

  const email = payload.email;
  const displayName = payload.name || email.split('@')[0];
  const googleId = payload.sub;

  let user = await userRepository.findUserByGoogleId(googleId);

  if (!user) {
    // Check if user with same email exists
    const existingUser = await userRepository.findUserByEmail(email);

    if (existingUser) {
      // Bind google account
      user = await userRepository.updateUser(existingUser.id, { googleId });
    } else {
      // Create new user
      user = await userRepository.createUser({
        email,
        displayName,
        googleId,
      });
    }
  }

  const token = signToken({ userId: user.id });
  return { token, user };
}

export async function updateUserProfile(userId: string, data: { displayName?: string; email?: string; avatarIndex?: number; avatarUrl?: string | null }) {
  if (data.email) {
    const existing = await userRepository.findUserByEmail(data.email.trim().toLowerCase());
    if (existing && existing.id !== userId) {
      throw new Error('Email đã được sử dụng bởi tài khoản khác');
    }
  }

  const updateData: any = {};
  if (data.displayName !== undefined) {
    updateData.displayName = data.displayName.trim();
  }
  if (data.email !== undefined) {
    updateData.email = data.email.trim().toLowerCase();
  }
  if (data.avatarIndex !== undefined) {
    updateData.avatarIndex = data.avatarIndex;
  }
  if (data.avatarUrl !== undefined) {
    updateData.avatarUrl = data.avatarUrl;
  }

  return userRepository.updateUser(userId, updateData);
}
