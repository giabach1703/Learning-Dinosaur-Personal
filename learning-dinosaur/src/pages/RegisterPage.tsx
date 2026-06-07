import React, { useState, useEffect, useRef } from "react";
import { Button, Form, Input, Select, Checkbox, message, Tooltip } from "antd";
import { Link, history, useModel } from "umi";
import { InfoCircleOutlined } from "@ant-design/icons";
import "../global.css";
import "./login.css";

declare const google: any;

const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID ||
  "956714257482-2u4lmqbq96thm8k048boo9j22etiq297.apps.googleusercontent.com";

const months = Array.from({ length: 12 }, (_, i) => ({
  label: `Tháng ${i + 1}`,
  value: String(i + 1),
}));

const days = Array.from({ length: 31 }, (_, i) => ({
  label: String(i + 1),
  value: String(i + 1),
}));

const years = Array.from({ length: 80 }, (_, i) => {
  const year = new Date().getFullYear() - i;
  return { label: String(year), value: String(year) };
});

const RegisterPage: React.FC = () => {
  const { registerUser, loginGoogleUser } = useModel("useAuthModel");
  const [loading, setLoading] = useState<boolean>(false);
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);
  const [googleReady, setGoogleReady] = useState<boolean>(false);

  const callbackRef = useRef<((response: any) => void) | undefined>(undefined);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Keep callback ref up-to-date
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
      console.error("[Google GSI] Failed to load script.");
    };
    document.head.appendChild(script);

    return () => {};
  }, []);

  // Render the official Google button when ready
  useEffect(() => {
    if (googleReady && googleBtnRef.current) {
      googleBtnRef.current.innerHTML = ""; // Clear container
      google.accounts.id.renderButton(googleBtnRef.current, {
        theme: "outline",
        size: "large",
        shape: "pill",
        width: 440,
        text: "signup_with",
      });
    }
  }, [googleReady]);

  const handleSubmit = async (values: {
    email: string;
    password?: string;
    displayName: string;
    acceptTerms: boolean;
  }) => {
    if (!values.acceptTerms) {
      message.error(
        "Bạn phải chấp nhận Điều khoản dịch vụ và Chính sách bảo mật",
      );
      return;
    }

    setLoading(true);
    try {
      await registerUser({
        email: values.email,
        password: values.password,
        displayName: values.displayName,
      });
      message.success("Đăng ký tài khoản thành công!");
      history.push("/");
    } catch (error: any) {
      message.error(error.response?.data?.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container register-page">
      {/* Left panel (visuals) */}
      <div className="login-left">
        <div className="login-left-content">
          <h1
            className="login-left-title"
            style={{ fontSize: "42px", color: "#1a1a2e", fontWeight: 800 }}
          >
            The best way to study. Sign up for free.
          </h1>
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
            <div className="login-tab-item active">Sign up</div>
            <Link to="/login" className="login-tab-item">
              Log in
            </Link>
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

          {/* Registration Form */}
          <Form layout="vertical" onFinish={handleSubmit}>
            {/* Birthday Fields */}
            <div className="login-form-group">
              <div className="login-label-row">
                <label
                  className="login-label"
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  Birthday
                  <Tooltip title="Chỉ sử dụng để tối ưu hóa trải nghiệm học tập của bạn.">
                    <InfoCircleOutlined
                      style={{ color: "#939bb4", cursor: "pointer" }}
                    />
                  </Tooltip>
                </label>
              </div>
              <div className="birthday-selects">
                <Form.Item name="birthMonth" style={{ margin: 0, flex: 1.5 }}>
                  <Select placeholder="Month" options={months} allowClear />
                </Form.Item>
                <Form.Item name="birthDay" style={{ margin: 0, flex: 1 }}>
                  <Select placeholder="Day" options={days} allowClear />
                </Form.Item>
                <Form.Item name="birthYear" style={{ margin: 0, flex: 1.2 }}>
                  <Select placeholder="Year" options={years} allowClear />
                </Form.Item>
              </div>
            </div>

            {/* Email Field */}
            <div className="login-form-group" style={{ marginTop: "16px" }}>
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
                <Input placeholder="user@email.com" />
              </Form.Item>
            </div>

            {/* Username (Display Name) Field */}
            <div className="login-form-group">
              <div className="login-label-row">
                <label className="login-label">Username</label>
              </div>
              <Form.Item
                name="displayName"
                rules={[{ required: true, message: "Vui lòng nhập username" }]}
              >
                <Input placeholder="andrew123" />
              </Form.Item>
            </div>

            {/* Password Field */}
            <div className="login-form-group">
              <div className="login-label-row">
                <label className="login-label">Password</label>
              </div>
              <Form.Item
                name="password"
                rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu" },
                  { min: 6, message: "Mật khẩu tối thiểu 6 ký tự" },
                ]}
              >
                <Input.Password placeholder="••••••••" />
              </Form.Item>
            </div>

            {/* Accept Terms Checkbox */}
            <div className="register-terms-checkbox">
              <Form.Item
                name="acceptTerms"
                valuePropName="checked"
                initialValue={true}
                rules={[
                  {
                    validator: (_, value) =>
                      value
                        ? Promise.resolve()
                        : Promise.reject(
                            new Error(
                              "Bạn phải chấp nhận điều khoản để tiếp tục",
                            ),
                          ),
                  },
                ]}
              >
                <Checkbox>
                  I accept Learning Dinosaur's <a href="#">Terms of Service</a>{" "}
                  and <a href="#">Privacy Policy</a>
                </Checkbox>
              </Form.Item>
            </div>

            {/* Submit Button */}
            <Button
              className="login-submit-btn"
              type="primary"
              htmlType="submit"
              block
              loading={loading}
            >
              Sign up
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
