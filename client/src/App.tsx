import { BrowserRouter, Routes, Route } from 'react-router-dom';
import UserDirectory from './routes/UserDirectory';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UserDirectory />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
