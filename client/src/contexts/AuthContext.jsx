import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('heli_token') || '');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'register' | 'recover'
  const [showRecoveryCodeModal, setShowRecoveryCodeModal] = useState(false);
  const [guestRecoveryCode, setGuestRecoveryCode] = useState(localStorage.getItem('heli_guest_recovery_code') || '');
  const [showRecoverModal, setShowRecoverModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Khởi tạo phiên khi mở ứng dụng
  useEffect(() => {
    checkCurrentSession();
  }, []);

  async function checkCurrentSession() {
    try {
      setLoading(true);
      const res = await axiosClient.get('/auth/me');
      setUser(res.user);
    } catch (err) {
      // Nếu chưa có phiên, tự động tạo phiên khách ẩn danh trong nền
      await createAnonymousSession(false);
    } finally {
      setLoading(false);
    }
  }

  // Đăng nhập tài khoản
  async function login(username, password) {
    try {
      const res = await axiosClient.post('/auth/login', { username, password });
      setUser({
        userId: res.userId,
        username: res.username,
        anonymousName: res.anonymousName,
        avatarUrl: res.avatarUrl,
        bio: res.bio,
        role: res.role,
        isGuest: false
      });
      if (res.token) {
        setToken(res.token);
        localStorage.setItem('heli_token', res.token);
      }
      setShowAuthModal(false);
      return { success: true, user: res };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  // Đăng ký tài khoản mới
  async function register(username, password, anonymousName, bio) {
    try {
      const res = await axiosClient.post('/auth/register', { username, password, anonymousName, bio });
      setUser({
        userId: res.userId,
        username: res.username,
        anonymousName: res.anonymousName,
        avatarUrl: null,
        bio: bio || null,
        role: res.role,
        isGuest: false
      });
      if (res.token) {
        setToken(res.token);
        localStorage.setItem('heli_token', res.token);
      }
      setShowAuthModal(false);
      return { success: true, user: res };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  // Tạo tài khoản ẩn danh mới (Khách vãng lai)
  async function createAnonymousSession(showModal = false) {
    try {
      const res = await axiosClient.post('/auth/anonymous-session');
      setUser({
        userId: res.userId,
        username: null,
        anonymousName: res.anonymousName,
        avatarUrl: '🍃',
        bio: '',
        role: 'user',
        isGuest: true
      });
      if (res.token) {
        setToken(res.token);
        localStorage.setItem('heli_token', res.token);
      }
      if (res.recoveryCode) {
        setGuestRecoveryCode(res.recoveryCode);
        localStorage.setItem('heli_guest_recovery_code', res.recoveryCode);
        if (showModal) {
          setShowRecoveryCodeModal(true);
        }
      }
      return res;
    } catch (err) {
      console.error('Lỗi tạo phiên ẩn danh:', err);
    }
  }

  // Khôi phục tài khoản bằng Recovery Code (O(1))
  async function recoverAccount(recoveryCode) {
    try {
      const res = await axiosClient.post('/auth/recover', { recoveryCode });
      setUser({
        userId: res.userId,
        username: res.username,
        anonymousName: res.anonymousName,
        avatarUrl: res.avatarUrl,
        bio: res.bio,
        role: 'user',
        isGuest: res.isGuest
      });
      if (res.token) {
        setToken(res.token);
        localStorage.setItem('heli_token', res.token);
      }
      setGuestRecoveryCode(recoveryCode);
      localStorage.setItem('heli_guest_recovery_code', recoveryCode);
      return { success: true, user: res };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  // Cập nhật hồ sơ cá nhân
  async function updateProfile(data) {
    try {
      const res = await axiosClient.put('/users/profile', data);
      setUser(prev => ({
        ...prev,
        ...res.user
      }));
      return { success: true, user: res.user };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  // Đổi mật khẩu
  async function changePassword(currentPassword, newPassword) {
    try {
      const res = await axiosClient.put('/users/change-password', {
        currentPassword,
        newPassword
      });
      return { success: true, message: res.message };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  // Cấp lại mã khôi phục mới (Vô hiệu hóa mã cũ)
  async function regenerateRecoveryCode() {
    try {
      const res = await axiosClient.post('/users/regenerate-recovery-code');
      if (res.recoveryCode) {
        setGuestRecoveryCode(res.recoveryCode);
        localStorage.setItem('heli_guest_recovery_code', res.recoveryCode);
        setShowRecoveryCodeModal(true);
      }
      return { success: true, recoveryCode: res.recoveryCode };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  // Đóng/Xóa tài khoản
  async function deleteAccount() {
    try {
      await axiosClient.delete('/users/account');
      localStorage.removeItem('heli_token');
      localStorage.removeItem('heli_guest_recovery_code');
      setToken('');
      setUser(null);
      await createAnonymousSession(false);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  // Đăng nhập quyền Admin
  async function adminLogin(username, password) {
    try {
      const res = await axiosClient.post('/auth/admin-login', { username, password });
      setUser({
        userId: 'admin-master-id',
        username: 'admin',
        anonymousName: 'Quản trị viên (Admin)',
        role: 'admin',
        isGuest: false
      });
      if (res.token) {
        setToken(res.token);
        localStorage.setItem('heli_token', res.token);
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  // Đăng xuất
  async function logout() {
    try {
      await axiosClient.post('/auth/logout');
    } catch (e) {}
    localStorage.removeItem('heli_token');
    localStorage.removeItem('heli_guest_recovery_code');
    setToken('');
    setUser(null);
    await createAnonymousSession(false);
  }

  function openLoginModal() {
    setAuthModalMode('login');
    setShowAuthModal(true);
  }

  function openRegisterModal() {
    setAuthModalMode('register');
    setShowAuthModal(true);
  }

  function openRecoverAccountModal() {
    setShowRecoverModal(true);
  }

  function openProfileModal() {
    setShowProfileModal(true);
  }

  function openRecoveryCodeModal() {
    setShowRecoveryCodeModal(true);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        showAuthModal,
        setShowAuthModal,
        authModalMode,
        setAuthModalMode,
        showRecoveryCodeModal,
        setShowRecoveryCodeModal,
        guestRecoveryCode,
        showRecoverModal,
        setShowRecoverModal,
        showProfileModal,
        setShowProfileModal,
        openLoginModal,
        openRegisterModal,
        openRecoverAccountModal,
        openProfileModal,
        openRecoveryCodeModal,
        login,
        register,
        recoverAccount,
        updateProfile,
        changePassword,
        regenerateRecoveryCode,
        deleteAccount,
        adminLogin,
        logout,
        createAnonymousSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
