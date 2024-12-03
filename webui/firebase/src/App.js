import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header/Header';
import Chatbot from './views/Chatbot';
import EvalCreate from "./views/EvalCreate";
import EvalList from "./views/EvalList";
import EvalResult from "./views/EvalResult";
import LoadDataView from "./views/LoadDataView";  // Import LoadDataView
import FileListView from "./views/FileListView";  // Import FileListView

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="/createeval" element={<EvalCreate />} />
        <Route path="/evaluation/:id" element={<EvalResult />} />
        <Route path="/evals" element={<EvalList />} />
        <Route path="/adddata" element={<LoadDataView />} />  {/* Add route for load data */}
        <Route path="/files" element={<FileListView />} />    {/* Add route for file list */}
        <Route path="/" exact element={<Chatbot />} />
      </Routes>
    </Router>
  );
}

export default App;
