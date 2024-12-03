import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import DataPrepKit from "../components/DataPrepKit/DataPrepKit";

function LoadDataView() {
  return (
    <Container>
      <Row className="mt-3">
        <Col>
          <h1>Data Preparation Kit</h1>
          <DataPrepKit />
        </Col>
      </Row>
    </Container>
  );
}

export default LoadDataView;
