import React, { useState, useEffect, useRef } from "react";
import { Button, Form, Input, message } from "antd";
import { Link, history, useModel } from "umi";
import "../global.css";
import "./login.css";

declare const google: any;

const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID ||
  "956714257482-2u4lmqbq96thm8k048boo9j22etiq297.apps.googleusercontent.com";

// Official Google logo SVG
const GoogleIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: "block", flexShrink: 0 }}
  >
    <path
      d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
      fill="#4285F4"
    />
    <path
      d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      fill="#34A853"
    />
    <path
      d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
      fill="#FBBC05"
    />
    <path
      d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"
      fill="#EA4335"
    />
  </svg>
);

const LoginPage: React.FC = () => {
  const { loginUser, loginGoogleUser } = useModel("useAuthModel");
  const [loading, setLoading] = useState<boolean>(false);
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);
  const [googleReady, setGoogleReady] = useState<boolean>(false);
  const callbackRef = useRef<((response: any) => void) | undefined>(undefined);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Keep callback ref up-to-date so it always captures the latest state
  callbackRef.current = async (response: any) => {
    setGoogleLoading(true);
    try {
      await loginGoogleUser(response.credential);
      message.success("Đăng nhập bằng Google thành công!");
      history.push("/");
    } catch (error: any) {
      message.error(
        error.response?.data?.message || "Đăng nhập Google thất bại",
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  useEffect(() => {
    const initializeGSI = () => {
      try {
        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response: any) => callbackRef.current?.(response),
          cancel_on_tap_outside: false,
        });
        setGoogleReady(true);
      } catch (e) {
        console.error("[Google GSI] initialize failed:", e);
      }
    };

    // If already loaded, skip script injection
    if (typeof google !== "undefined" && google?.accounts?.id) {
      initializeGSI();
      return;
    }

    const scriptId = "google-gsi-script";
    if (document.getElementById(scriptId)) {
      const interval = setInterval(() => {
        if (typeof google !== "undefined" && google?.accounts?.id) {
          clearInterval(interval);
          initializeGSI();
        }
      }, 100);
      return () => clearInterval(interval);
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (typeof google !== "undefined" && google?.accounts?.id) {
        initializeGSI();
      }
    };
    script.onerror = () => {
      console.error(
        "[Google GSI] Failed to load script — check your network or CSP.",
      );
    };
    document.head.appendChild(script);

    return () => {};
  }, []);

  // Render the official Google button when ready
  useEffect(() => {
    if (googleReady && googleBtnRef.current) {
      googleBtnRef.current.innerHTML = ""; // Clear container
      // Giới hạn width theo màn hình thực tế để không tràn trên mobile
      const btnWidth = Math.min(440, window.innerWidth - 64);
      google.accounts.id.renderButton(googleBtnRef.current, {
        theme: "outline",
        size: "large",
        shape: "pill",
        width: btnWidth,
        text: "signin_with",
      });
    }
  }, [googleReady]);


  const handleSubmit = async (values: { email: string; password?: string }) => {
    setLoading(true);
    try {
      await loginUser(values);
      message.success("Đăng nhập thành công");
      history.push("/");
    } catch (error: any) {
      message.error(error.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Left panel (visuals) */}
      <div className="login-left">
        <div className="login-left-content">
          <h1 className="login-left-title">Smash sets in your sweats.</h1>
          <div className="login-image-container">
            <img
              className="login-image"
              src="/login_illustration.png"
              alt="Learning Dinosaur Illustration"
            />
          </div>
          <div className="login-left-logo">
            <span>🦕</span>
            <span>Learning Dinosaur</span>
          </div>
        </div>
      </div>

      {/* Right panel (form) */}
      <div className="login-right">
        {/* Close Button */}
        <button className="login-close" onClick={() => history.push("/")}>
          &times;
        </button>

        <div className="login-form-wrapper">
          {/* Form Tabs */}
          <div className="login-tabs">
            <Link to="/register" className="login-tab-item">
              Sign up
            </Link>
            <div className="login-tab-item active">Log in</div>
          </div>

          {/* Official Google Sign-in Button Container */}
          <div
            style={{
              minHeight: "52px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            {googleLoading ? (
              <div
                className="login-google-btn"
                style={{ justifyContent: "center", opacity: 0.7 }}
              >
                <span>Đang xử lý...</span>
              </div>
            ) : !googleReady ? (
              <div
                className="login-google-btn"
                style={{ justifyContent: "center", opacity: 0.7 }}
              >
                <span>Đang tải Google...</span>
              </div>
            ) : (
              <div
                ref={googleBtnRef}
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                }}
              />
            )}
          </div>

          {/* Divider */}
          <div className="login-divider">
            <span>or email</span>
          </div>

          {/* Login Form */}
          <Form layout="vertical" onFinish={handleSubmit}>
            {/* Email Field */}
            <div className="login-form-group">
              <div className="login-label-row">
                <label className="login-label">Email</label>
              </div>
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: "Vui lòng nhập email" },
                  { type: "email", message: "Email không hợp lệ" },
                ]}
              >
                <Input placeholder="Enter your email address" />
              </Form.Item>
            </div>

            {/* Password Field */}
            <div className="login-form-group">
              <div className="login-label-row">
                <label className="login-label">Password</label>
                <Link to="/forgot-password" className="login-forgot-link">
                  Forgot password
                </Link>
              </div>
              <Form.Item
                name="password"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
              >
                <Input.Password placeholder="Enter your password" />
              </Form.Item>
            </div>

            {/* Terms Statement */}
            <p className="login-terms">
              By clicking Log in, you accept Learning Dinosaur's{" "}
              <a href="#">Terms of Service</a> and{" "}
              <a href="#">Privacy Policy</a>
            </p>

            {/* Submit Button */}
            <Button
              className="login-submit-btn"
              type="primary"
              htmlType="submit"
              block
              loading={loading}
            >
              Log in
            </Button>
          </Form>

          {/* Link to Register */}
          <Link to="/register" className="login-register-btn">
            New to Learning Dinosaur? Create an account
          </Link>

          {/* Magic Link */}
          <Link to="/login/magic" className="login-magic-link">
            Log in with magic link
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
