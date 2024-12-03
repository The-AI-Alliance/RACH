import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Modal } from 'react-bootstrap';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';
import Chat from '../components/Chat/Chat';
import Login from '../components/Login/Login';
import { doc, getDoc, setDoc } from 'firebase/firestore';

function Chatbot() {
  const [endpoints, setEndpoints] = useState({});
  const [selectedEndpoint, setSelectedEndpoint] = useState('');
  const [user, setUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEndpointName, setNewEndpointName] = useState('');
  const [newEndpointUrl, setNewEndpointUrl] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        const userData = userDoc.data();
        if (userData && userData.wss) {
          setEndpoints(userData.wss);
          const firstEndpoint = Object.keys(userData.wss)[0];
          if (firstEndpoint) {
            setSelectedEndpoint(userData.wss[firstEndpoint]);
          }
        }
      }
    });
    return unsubscribe;
  }, []);

  const handleAddEndpoint = async () => {
    if (user) {
      const updatedEndpoints = {
        ...endpoints,
        [newEndpointName]: newEndpointUrl,
      };
      await setDoc(doc(db, 'users', user.uid), {
        wss: updatedEndpoints,
      }, { merge: true });
      setEndpoints(updatedEndpoints);
      setNewEndpointName('');
      setNewEndpointUrl('');
      setShowAddModal(false);
    }
  };

  return (
    <Container>
      {!user ? (
        <Login setUser={setUser} />
      ) : (
        <Col>
          <Row className="mt-3" style={{ marginBottom: '5px' }}>
            <h1>Chat Client</h1>
          </Row>
          <Row className="mb-3">
            <Col xs={9}>
              <Form.Group controlId="endpoints">
                <Form.Control
                  as="select"
                  value={selectedEndpoint}
                  onChange={(e) => setSelectedEndpoint(e.target.value)}
                >
                  {Object.entries(endpoints).map(([name, value]) => (
                    <option key={name} value={value}>{name}</option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
            <Col xs={3}>
              <Button variant="secondary" onClick={() => setShowAddModal(true)} style={{ width: '100%' }}>
                Add Endpoint
              </Button>
            </Col>
          </Row>
          <Row>
            <Chat selectedEndpoint={selectedEndpoint} />
          </Row>
        </Col>
      )}

      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Endpoint</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="endpointName">
              <Form.Label>Friendly Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter a friendly name"
                value={newEndpointName}
                onChange={(e) => setNewEndpointName(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="endpointUrl">
              <Form.Label>Endpoint URL</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter the WSS URL"
                value={newEndpointUrl}
                onChange={(e) => setNewEndpointUrl(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleAddEndpoint}>
            Add Endpoint
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default Chatbot;
