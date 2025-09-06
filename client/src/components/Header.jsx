import React from 'react';
import { Button, Navbar, Nav, Container, Row } from 'react-bootstrap';
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/Header.css"

function Header() {
  // Check login status from localStorage (or context if you use it)
  const isLoggedIn = !!localStorage.getItem("authToken");

  const handleLogout = () => {
    localStorage.removeItem("authToken"); 
    window.location.href = "/"; // redirect to home after logout
  };

  return (
    <Container className='headerContainer'>
      <Row>
        <Navbar className="justify-content-between fixed-top p-4 px-4">
          <Navbar.Brand href="/" className='fs-3 logo'>CookMate</Navbar.Brand>
          <Nav>
            {isLoggedIn ? (
              <>
                <Button className="btn btn-success p-2 mx-1" href='/favorites'>
                  Favorites
                </Button>
                <Button className="btn btn-danger p-2 mx-1" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button className="btn btn-warning p-2 mx-1" href='/signup'>
                  Sign Up
                </Button>
                <Button className="btn btn-outline-light p-2 mx-1" href='/login'>
                  Login
                </Button>
              </>
            )}
          </Nav>
        </Navbar>
      </Row>
    </Container>
  );
}

export default Header;
