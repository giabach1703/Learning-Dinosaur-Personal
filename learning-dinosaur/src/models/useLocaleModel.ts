import { useState, useCallback } from 'react';

const translations: Record<string, Record<string, string>> = {
  vi: {
    // Sidebar
    'sidebar.decks': 'Bộ thẻ',
    'sidebar.stats': 'Thống kê',
    'sidebar.achievements': 'Thành tựu',
    'sidebar.logout': 'Đăng xuất',
    'sidebar.logo': '🦕 Learning Dinosaur',

    // Header
    'header.greeting': 'Chào, {name}',
    'header.defaultName': 'Dinosaur Learner',
    'header.level': 'Cấp {level}',
    'header.darkTheme': 'Chế độ tối',
    'header.days': 'ngày',
    'level.egg': 'Trứng Khủng Long',
    'level.baby': 'Khủng Long Bột',
    'level.apprentice': 'Khủng Long Học Việc',
    'level.trex': 'T-Rex Mê Học',
    'level.wise': 'Khủng Long Thông Thái',
    'level.immortal': 'Khủng Long Bất Tử',

    // Settings
    'settings.title': 'Cài đặt',
    'settings.subscription': 'Đăng ký',
    'settings.upgradeBannerTitle': 'Nâng cấp với Q+',
    'settings.upgradeBannerSub': 'Không quảng cáo, học ngoại tuyến và các tính năng Premium khác.',
    'settings.upgradeBtn': 'Nâng cấp ngay',
    'settings.upgradeDevInfo': 'Tính năng nâng cấp đang được phát triển',
    'settings.personalInfo': 'Thông tin cá nhân',
    'settings.avatar': 'Ảnh đại diện',
    'settings.customAvatarInfo': 'Chọn ảnh tùy chỉnh từ máy tính',
    'settings.username': 'Tên người dùng',
    'settings.edit': 'Biên tập',
    'settings.save': 'Lưu',
    'settings.cancel': 'Hủy',
    'settings.usernameEmpty': 'Tên người dùng không được để trống',
    'settings.usernameSuccess': 'Đã cập nhật tên người dùng',
    'settings.avatarSuccess': 'Đã cập nhật ảnh đại diện',
    'settings.emailEmpty': 'Email không được để trống',
    'settings.emailSuccess': 'Đã cập nhật email',
    'settings.email': 'E-mail',
    'settings.updateFailed': 'Cập nhật thất bại',
    'settings.accountType': 'Loại tài khoản',
    'settings.student': 'Học sinh',
    'settings.teacher': 'Giáo viên',
    'settings.accountTypeSuccess': 'Đã cập nhật loại tài khoản',
    'settings.appearance': 'Về bề ngoài',
    'settings.theme': 'Chủ đề',
    'settings.light': 'Ánh sáng',
    'settings.dark': 'Bóng tối',
    'settings.themeSuccess': 'Đã thay đổi chủ đề giao diện',
    'settings.language': 'Ngôn ngữ',
    'settings.englishUs': 'Tiếng Anh (Mỹ)',
    'settings.vietnamese': 'Tiếng Việt',
    'settings.langSuccess': 'Đã cập nhật ngôn ngữ giao diện',
    'settings.notifications': 'Thông báo',
    'settings.notifStudyUpdate': 'Cập nhật nghiên cứu cá nhân',
    'settings.streakBadges': 'Vệt sáng và huy hiệu',
    'settings.streakBadgesSub': 'Nhận email khi bạn có chuỗi ngày học mới hoặc đạt huy hiệu.',
    'settings.streakNotifOff': 'Đã tắt nhận email vệt sáng',
    'settings.streakNotifOn': 'Đã bật nhận email vệt sáng',
    'settings.studyReminders': 'Lời nhắc học tập',
    'settings.studyRemindersSub': 'Nhận thông báo nhắc nhở ôn thẻ hàng ngày để giữ streak.',
    'settings.remindersOff': 'Đã tắt nhận email nhắc nhở',
    'settings.remindersOn': 'Đã bật nhận email nhắc nhở',
    'settings.reminderTimeTitle': 'Chọn thời điểm bạn muốn nhận lời nhắc học tập',
    'settings.reminderTimeSuccess': 'Đã cập nhật giờ nhắc nhở',
  },
  en: {
    // Sidebar
    'sidebar.decks': 'Decks',
    'sidebar.stats': 'Statistics',
    'sidebar.achievements': 'Achievements',
    'sidebar.logout': 'Log out',
    'sidebar.logo': '🦕 Learning Dinosaur',

    // Header
    'header.greeting': 'Hi, {name}',
    'header.defaultName': 'Dinosaur Learner',
    'header.level': 'Level {level}',
    'header.darkTheme': 'Dark Mode',
    'header.days': 'days',
    'level.egg': 'Dinosaur Egg',
    'level.baby': 'Baby Dinosaur',
    'level.apprentice': 'Apprentice Dinosaur',
    'level.trex': 'Studious T-Rex',
    'level.wise': 'Wise Dinosaur',
    'level.immortal': 'Immortal Dinosaur',

    // Settings
    'settings.title': 'Settings',
    'settings.subscription': 'Subscription',
    'settings.upgradeBannerTitle': 'Upgrade with Q+',
    'settings.upgradeBannerSub': 'No ads, offline studying, and other Premium features.',
    'settings.upgradeBtn': 'Upgrade Now',
    'settings.upgradeDevInfo': 'Upgrade feature is under development',
    'settings.personalInfo': 'Personal Information',
    'settings.avatar': 'Avatar',
    'settings.customAvatarInfo': 'Choose custom image from computer',
    'settings.username': 'Username',
    'settings.edit': 'Edit',
    'settings.save': 'Save',
    'settings.cancel': 'Cancel',
    'settings.usernameEmpty': 'Username cannot be empty',
    'settings.usernameSuccess': 'Username updated successfully',
    'settings.avatarSuccess': 'Avatar updated successfully',
    'settings.emailEmpty': 'Email cannot be empty',
    'settings.emailSuccess': 'Email updated successfully',
    'settings.email': 'Email',
    'settings.updateFailed': 'Update failed',
    'settings.accountType': 'Account Type',
    'settings.student': 'Student',
    'settings.teacher': 'Teacher',
    'settings.accountTypeSuccess': 'Account type updated successfully',
    'settings.appearance': 'Appearance',
    'settings.theme': 'Theme',
    'settings.light': 'Light',
    'settings.dark': 'Dark',
    'settings.themeSuccess': 'Theme updated successfully',
    'settings.language': 'Language',
    'settings.englishUs': 'English (US)',
    'settings.vietnamese': 'Vietnamese',
    'settings.langSuccess': 'Interface language updated successfully',
    'settings.notifications': 'Notifications',
    'settings.notifStudyUpdate': 'Personal Study Updates',
    'settings.streakBadges': 'Streaks and Badges',
    'settings.streakBadgesSub': 'Receive email notifications when you start a new streak or earn badges.',
    'settings.streakNotifOff': 'Disabled streak emails',
    'settings.streakNotifOn': 'Enabled streak emails',
    'settings.studyReminders': 'Study Reminders',
    'settings.studyRemindersSub': 'Receive daily notifications to study flashcards and maintain your streak.',
    'settings.remindersOff': 'Disabled study reminder emails',
    'settings.remindersOn': 'Enabled study reminder emails',
    'settings.reminderTimeTitle': 'Choose when you\'d like to receive study reminders',
    'settings.reminderTimeSuccess': 'Reminder time updated successfully',
  }
};

export default function useLocaleModel() {
  const [locale, setLocaleState] = useState<string>(() => {
    try {
      if (typeof window !== 'undefined') {
        return localStorage.getItem('lang') || 'vi';
      }
    } catch (e) {}
    return 'vi';
  });

  const setLocale = useCallback((newLocale: string) => {
    setLocaleState(newLocale);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('lang', newLocale);
      }
    } catch (e) {}
  }, []);

  const t = useCallback((key: string, variables?: Record<string, string | number>) => {
    const langDict = translations[locale] || translations['vi'];
    let text = langDict[key] || translations['vi'][key] || key;
    if (variables) {
      Object.entries(variables).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    return text;
  }, [locale]);

  return {
    locale,
    setLocale,
    t,
  };
}
