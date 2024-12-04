import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";

import { collection, getDocs } from "firebase/firestore";
import { Card, Row, Col } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFile, faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";

function FileListView() {
  const user = auth.currentUser
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const fetchFiles = async () => {
      const filesCollection = collection(db, `users/${user.uid}/files`);
      const filesSnapshot = await getDocs(filesCollection);
      const filesData = filesSnapshot.docs.map((doc) => doc.data());
      setFiles(filesData);
    };

    if (user) {
      fetchFiles();
    }
  }, [user]);

  const getStatusIcon = (status) => {
    switch (status) {
      case "uploaded":
        return faCheck;
      case "error":
        return faTimes;
      default:
        return faFile;
    }
  };

  return (
    <div className="page-background">
      <Card className="m-4 custom-card">
        <Card.Body>
          <Card.Title>Files</Card.Title>
          {files.map((file, index) => (
            <Row key={index} className="mb-2">
              <Col xs={2} className="d-flex align-items-center justify-content-center">
                <FontAwesomeIcon icon={getStatusIcon(file.status)} />
              </Col>
              <Col className="d-flex align-items-center">{file.fileName || "File"}</Col>
              <Col xs={4} className="d-flex align-items-center justify-content-end">
                {file.uploadedAt ? new Date(file.uploadedAt.seconds * 1000).toLocaleString() : ""}
              </Col>
            </Row>
          ))}
        </Card.Body>
      </Card>
    </div>
  );
}

export default FileListView;
