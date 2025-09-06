import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Form, Button, Alert, Row, Col } from "react-bootstrap";
import { signup } from "../API/api"; 
import { useNavigate } from "react-router-dom";
import "../css/Signup.css"

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    height: "",
    weight: "",
    gender: "",
    age: "",
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = "Firstname is required!";
    if (!formData.lastName) newErrors.lastName = "Lastname is required!";
    if (!formData.height) newErrors.height = "Height is required!";
    if (!formData.weight) newErrors.weight = "Weight is required!";
    if (!formData.gender) newErrors.gender = "Gender is required!";
    if (!formData.age) newErrors.age = "Age is required!";
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
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required!";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match!";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length === 0) {
      try {
        const response = await signup(formData);

        // ✅ Adjust based on your backend
        if (response.status === "success" || response.success) {
          setSuccess(true);
          setServerError("");
          setErrors({});

          // redirect after 3s
          setTimeout(() => {
            navigate("/");
          }, 3000);
        } else {
          setServerError(response.message || "Signup failed!");
          setSuccess(false);
        }
      } catch (error) {
        setServerError("An error occurred during signup.");
        setSuccess(false);
      }
    } else {
      setErrors(validationErrors);
      setSuccess(false);
    }
  };

  return (
    <div className="container registerContainer d-flex flex-column justify-content-center bg-light p-4 px-5 rounded">
      <div>
        <h2 className="mb-4 fs-4 text-center">Register to CookMate</h2>

        {/* ✅ Success Alert */}
        {success && (
          <Alert variant="success" className="text-center">
            🎉 Signup successful! Redirecting to homepage...
          </Alert>
        )}

        {/* ❌ Error Alert */}
        {serverError && (
          <Alert variant="danger" className="text-center">
            {serverError}
          </Alert>
        )}

        <Form
          onSubmit={handleSubmit}
          className="d-flex flex-column justify-content-center align-items-center"
        >
          <Row className="w-100">
            {/* Left Column */}
            <Col md={6}>
              <Form.Group className="mb-2" controlId="formFirstname">
                <Form.Label>Firstname</Form.Label>
                <Form.Control
                  type="text"
                  name="firstName"
                  placeholder="Enter your firstname"
                  value={formData.firstName}
                  onChange={handleChange}
                  isInvalid={!!errors.firstName}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.firstName}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-2" controlId="formLastname">
                <Form.Label>Lastname</Form.Label>
                <Form.Control
                  type="text"
                  name="lastName"
                  placeholder="Enter your lastname"
                  value={formData.lastName}
                  onChange={handleChange}
                  isInvalid={!!errors.lastName}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.lastName}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-2" controlId="formEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  isInvalid={!!errors.email}
                  className="w-100"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-2" controlId="formHeight">
                <Form.Label>Height</Form.Label>
                <Form.Control
                  type="number"
                  name="height"
                  placeholder="Enter your height (175)"
                  value={formData.height}
                  onChange={handleChange}
                  isInvalid={!!errors.height}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.height}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            {/* Right Column */}
            <Col md={6}>
              <Form.Group className="mb-2" controlId="formWeight">
                <Form.Label>Weight</Form.Label>
                <Form.Control
                  type="number"
                  name="weight"
                  placeholder="Enter your weight (80)"
                  value={formData.weight}
                  onChange={handleChange}
                  isInvalid={!!errors.weight}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.weight}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-2" controlId="formAge">
                <Form.Label>Age</Form.Label>
                <Form.Control
                  type="number"
                  name="age"
                  placeholder="Enter your age (25)"
                  value={formData.age}
                  onChange={handleChange}
                  isInvalid={!!errors.age}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.age}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-2" controlId="formGender">
                <Form.Label>Gender</Form.Label>
                <Form.Select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  isInvalid={!!errors.gender}
                >
                  <option value="">Select your gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.gender}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-2" controlId="formPassword">
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
            </Col>

            <Col md={6}>
              <Form.Group className="mb-2" controlId="formConfirmPassword">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  isInvalid={!!errors.confirmPassword}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.confirmPassword}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-2 mt-3 mx-2" controlId="formSubmit">
                <Button className="btn btn-secondary mt-3" type="submit">
                  Register
                </Button>
              </Form.Group>
            </Col>
          </Row>
        </Form>

        <div className="mt-4 text-center">
          <span>Already have an account? </span>
          <a href="/login" className="text-decoration-none">
            Sign In
          </a>
        </div>
      </div>
    </div>
  );
};

export default Signup;
