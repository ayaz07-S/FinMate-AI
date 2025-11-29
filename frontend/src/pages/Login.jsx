import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import logo from "../assets/logo.png";

const Login = () => {
  const [isActive, setIsActive] = useState(false);
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    setIsActive(true);
    setError("");
  };

  const handleLoginClick = () => {
    setIsActive(false);
    setError("");
  };

  const handleSignUpSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!signUpName.trim() || !signUpEmail.trim() || !signUpPassword.trim() || !signUpConfirmPassword.trim()) {
      setError("Please fill in all fields");
      return;
    }
    if (signUpPassword !== signUpConfirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (signUpPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    // TODO: handle sign-up logic here
    console.log("Sign up submit");
  };

  const handleSignInSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!signInEmail.trim() || !signInPassword.trim()) {
      setError("Please enter both email and password");
      return;
    }
    // TODO: validate user credentials with backend
    console.log("Sign in submit");
    navigate("/dashboard");
  };

  return (
    <div className="login-page-wrapper">
      <div className={`container ${isActive ? "active" : ""}`} id="container">
        {/* SIGN UP FORM */}
        <div className="form-container sign-up">
          <form onSubmit={handleSignUpSubmit}>
            <img src={logo} alt="FinMate AI Logo" className="logo" style={{ width: '80px', marginBottom: '10px' }} />
            <h1>Create Account</h1>
            <span>use your email for registration</span>
            {error && isActive && <p className="error-message" style={{ color: 'red', fontSize: '14px', margin: '5px 0' }}>{error}</p>}
            <input
              type="text"
              placeholder="Name"
              value={signUpName}
              onChange={(e) => setSignUpName(e.target.value)}
            />
            <input
              type="email"
              placeholder="Email"
              value={signUpEmail}
              onChange={(e) => setSignUpEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={signUpPassword}
              onChange={(e) => setSignUpPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Re-type Password"
              value={signUpConfirmPassword}
              onChange={(e) => setSignUpConfirmPassword(e.target.value)}
            />
            <button type="submit">Sign Up</button>
          </form>
        </div>

        {/* SIGN IN FORM */}
        <div className="form-container sign-in">
          <form onSubmit={handleSignInSubmit}>
            <img src={logo} alt="FinMate AI Logo" className="logo" style={{ width: '80px', marginBottom: '10px' }} />
            <h1>Sign In</h1>
            <span>use your email password</span>
            {error && !isActive && <p className="error-message" style={{ color: 'red', fontSize: '14px', margin: '5px 0' }}>{error}</p>}
            <input
              type="email"
              placeholder="Email"
              value={signInEmail}
              onChange={(e) => setSignInEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={signInPassword}
              onChange={(e) => setSignInPassword(e.target.value)}
            />
            <a href="#">Forget Your Password?</a>
            <button type="submit">Sign In</button>
          </form>
        </div>

        {/* TOGGLE PANELS */}
        <div className="toggle-container">
          <div className="toggle">
            <div className="toggle-panel toggle-left">
              <h1>Welcome Back!</h1>
              <p>Enter your personal details to use all of site features</p>
              <button className="hidden" id="login" onClick={handleLoginClick}>
                Sign In
              </button>
            </div>
            <div className="toggle-panel toggle-right">
              <h1>Hello, Friend!</h1>
              <p>Register with your personal details to use all of site features</p>
              <button className="hidden" id="register" onClick={handleRegisterClick}>
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
