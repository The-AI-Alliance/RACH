// src/components/Header/Header.js
import React, { useEffect, useState } from 'react';
import {Navbar, Nav, Button, Dropdown} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { db } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth } from '../../firebase';

function Header() {
  const [user, setUser] = useState(null);
  const [userDocExists, setUserDocExists] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        setUserDocExists(userDoc.exists());
      }
    });
    return unsubscribe;
  }, []);

  const initializeUser = async () => {
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        uid: user.uid,
        wss: [],
        });
      setUserDocExists(true);
    }
  };

  return (
    <Navbar bg="light" expand="lg" className="mb-3">
      <Navbar.Brand as={Link} to="/" style={{ paddingLeft: "20px" }}>
        Agent Demo
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ml-auto mr-3">
          <Nav.Link as={Link} to="/chatbot">Chatbot</Nav.Link>

          {/* Dropdown for Evaluations */}
          <!-- Dropdown>
            <Dropdown.Toggle variant="light" id="evaluations-dropdown">
              Evaluations
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item as={Link} to="/evals">List</Dropdown.Item>
              <Dropdown.Item as={Link} to="/createeval">Create</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <Dropdown>
            <Dropdown.Toggle variant="light" id="dpk-dropdown">
              Data Prep Kit
            </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item as={Link} to="/adddata">Add Data</Dropdown.Item>
            <Dropdown.Item as={Link} to="/files">View Files</Dropdown.Item -->
          </Dropdown.Menu></Dropdown>
          {/* Initialize User Button */}
          {/* user && !userDocExists && ( */}
            <!-- Button variant="outline-primary" onClick={initializeUser}>
              Initialize User
            </Button -->
          {*/ ) /*}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default Header;
