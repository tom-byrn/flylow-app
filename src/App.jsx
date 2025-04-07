import React from 'react';
import './index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import SearchResults from './components/SearchResults';
import SignInSignUp from './components/SignInSignUp';
import MyFlights from './components/MyFlights';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/search-results" element={<SearchResults />} />
        <Route path="/signin" element={<SignInSignUp />} />
        <Route path="/myflights" element={<MyFlights />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
