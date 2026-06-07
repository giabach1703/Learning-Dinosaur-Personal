import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, displayName } = req.body;

    if (!email || !password || !displayName) {
      return res.status(400).json({
        message: 'Vui lòng nhập đầy đủ email, mật khẩu và tên hiển thị',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Mật khẩu phải có tối thiểu 6 ký tự',
      });
    }

    const { token, user } = await authService.registerUser(
      email.trim().toLowerCase(),
      password,
      displayName
    );

    return res.status(201).json({
      message: 'Đăng ký thành công',
      token,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        xp: user.xp,
        currentStreak: user.currentStreak,
        lastStudyDate: user.lastStudyDate,
        avatarIndex: user.avatarIndex,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    if (error.message === 'Email đã được sử dụng') {
      return res.status(409).json({ message: error.message });
    }
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Vui lòng nhập email và mật khẩu',
      });
    }

    const { token, user } = await authService.loginUser(
      email.trim().toLowerCase(),
      password
    );

    return res.json({
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        xp: user.xp,
        currentStreak: user.currentStreak,
        lastStudyDate: user.lastStudyDate,
        avatarIndex: user.avatarIndex,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error: any) {
    if (
      error.message === 'Email hoặc mật khẩu không chính xác' ||
      error.message === 'Tài khoản này được đăng ký qua Google. Vui lòng đăng nhập bằng Google.'
    ) {
      return res.status(error.message.includes('Google') ? 400 : 401).json({ message: error.message });
    }
    next(error);
  }
}

export async function getMe(req: Request, res: Response) {
  return res.json({
    user: req.user,
  });
}

export async function googleLogin(req: Request, res: Response, next: NextFunction) {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        message: 'Không tìm thấy ID Token của Google',
      });
    }

    const { token, user } = await authService.googleLoginUser(idToken);

    return res.json({
      message: 'Đăng nhập Google thành công',
      token,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        xp: user.xp,
        currentStreak: user.currentStreak,
        lastStudyDate: user.lastStudyDate,
        avatarIndex: user.avatarIndex,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error: any) {
    if (
      error.message === 'Xác thực Google ID Token thất bại' ||
      error.message === 'Google ID Token không chứa thông tin hợp lệ'
    ) {
      return res.status(401).json({ message: error.message });
    }
    next(error);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Bạn chưa đăng nhập' });
    }

    const { displayName, email, avatarIndex, avatarUrl } = req.body;
    const updatedUser = await authService.updateUserProfile(req.user.id, {
      displayName,
      email,
      avatarIndex,
      avatarUrl,
    });

    return res.json({
      message: 'Cập nhật thông tin cá nhân thành công',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        displayName: updatedUser.displayName,
        xp: updatedUser.xp,
        currentStreak: updatedUser.currentStreak,
        lastStudyDate: updatedUser.lastStudyDate,
        avatarIndex: updatedUser.avatarIndex,
        avatarUrl: updatedUser.avatarUrl,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (error: any) {
    if (error.message.includes('Email đã được sử dụng')) {
      return res.status(409).json({ message: error.message });
    }
    next(error);
  }
}
