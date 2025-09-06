import { React, useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Form, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { login, tokenToId } from "../API/api";
import "../css/Login.css"
const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (formData.email && formData.password) {
      setSuccess(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Email is required!";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid!";
    }
    if (!formData.password) {
      newErrors.password = "Password is required!";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters!";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length === 0) {
      setErrors({});
      try {
        const response = await login(formData);

        if (response.status == "success") {
          setSuccess(true);
          localStorage.setItem("authToken", response.token);
          setIsLoggedIn(true);
          setSuccessMessage("Login successful!");
          tokenToId();
          console.log(tokenToId());
        } else {
          setErrorMessage("Incorrect email or password");
          setSuccess(false);
        }
      } catch (error) {
        setErrorMessage("An error occurred. Please try again.");
        setSuccess(false);
      }
    } else {
      setErrors(validationErrors);
      setSuccess(false);
    }
    console.log("Form Data Sent:", formData);
  };

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/home");
    }
  }, [isLoggedIn, navigate]);

  return (
    <div className="container loginContainer mt-5 d-flex flex-column justify-content-center bg-light p-5 px-5 rounded">
      <div className="p-3">
        <h2 className="mb-4 text-center">Login</h2>
        {success && <Alert variant="success">Login successful!</Alert>}
        {errorMessage && !success && (
          <Alert variant="danger">{errorMessage}</Alert>
        )}

        <Form
          onSubmit={handleSubmit}
          className="d-flex flex-column justify-content-center align-items-center"
        >
          <Form.Group className="mb-3" controlId="formEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              isInvalid={!!errors.email}
              
            />
            <Form.Control.Feedback type="invalid">
              {errors.email}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              isInvalid={!!errors.password}
              
            />
            <Form.Control.Feedback type="invalid">
              {errors.password}
            </Form.Control.Feedback>
          </Form.Group>

          <Button className="btn btn-dark mt-2" type="submit">
            Login
          </Button>
        </Form>

        <div className="mt-5 text-center">
          <span>Don't have an account? </span>
          <a href="/signup" className="text-decoration-none">
            Sign Up
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
