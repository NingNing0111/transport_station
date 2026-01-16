import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import UploadFile from './pages/UploadFile';
import UploadMessage from './pages/UploadMessage';
import Access from './pages/Access';
import Transfer from './pages/Transfer';
import Pickup from './pages/Pickup';
import NotFound from './pages/NotFound';
import Expired from './pages/Expired';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload/file" element={<UploadFile />} />
        <Route path="/upload/message" element={<UploadMessage />} />
        <Route path="/access/:shortCode" element={<Access />} />
        <Route path="/file/:shortCode" element={<Transfer />} />
        <Route path="/message/:shortCode" element={<Transfer />} />
        <Route path="/transfer/:shortCode" element={<Transfer />} />
        <Route path="/pickup" element={<Pickup />} />
        <Route path="/not-found" element={<NotFound />} />
        <Route path="/expired" element={<Expired />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
