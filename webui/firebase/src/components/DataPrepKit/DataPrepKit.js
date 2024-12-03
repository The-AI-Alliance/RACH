import React, { useState } from "react";
import { Button, ProgressBar, Form } from "react-bootstrap";
import { db, auth } from "../../firebase";
import { doc, setDoc } from "firebase/firestore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import { v4 as uuidv4 } from 'uuid';  // Corrected import

function DataPrepKit() {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setUploadProgress(0);
  };

  const handleFileUpload = async () => {
    if (file) {
      // Mocking the file upload progress
      setUploadProgress(50);

      // Simulating file upload with a timeout
      setTimeout(async () => {
        setUploadProgress(100);

        const fileId = uuidv4();
        const userId = auth.currentUser.uid;

        // Adding a metadata document in Firestore
        await setDoc(doc(db, `users/${userId}/files/${fileId}`), {
          status: "uploaded",
          fileName: file.name,  // Store file's name
          uploadedAt: new Date(),  // Store the upload time
        });

      }, 1000);
    }
  };

  return (
    <div>
      <Form>
        <Form.Check type="switch" label="Option 1" />
        <Form.Check type="switch" label="Option 2" />
        <Form.Group>
          <Form.Label>Range Slider</Form.Label>
          <Form.Control type="range" />
        </Form.Group>
        <Form.Group>
          <Form.Label>Free Form Input</Form.Label>
          <Form.Control type="text" placeholder="Type something..." />
        </Form.Group>
      </Form>
      <Form.Group controlId="formFile" className="mb-3">
        <Form.Label>Upload File</Form.Label>
        <Form.Control type="file" onChange={handleFileChange} />
      </Form.Group>
      {file && (
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>  {/* Centering upload button */}
          <Button onClick={handleFileUpload} style={{ margin: '10px' }}> {/* Added margin between button and progress bar */}
            Upload <FontAwesomeIcon icon={faUpload} />
          </Button>
          <ProgressBar now={uploadProgress} label={`${uploadProgress}%`} />
        </div>
      )}
    </div>
  );
}

export default DataPrepKit;
