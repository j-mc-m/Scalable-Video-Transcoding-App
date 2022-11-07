import React from 'react';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import './style/main.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './components/Header';
import Footer from './components/Footer';

import Main from './pages/Main';
import FileStatus from './pages/FileStatus';
import ErrorNotFound from "./pages/Errors";

// return standard page using routes
function App() {
    return (
        <div className="wrapper container-lg">
            <BrowserRouter>
                <Header />
                <Routes>
                    <Route exact path="/" element={<Main />} />
                    <Route exact path="/upload/:id" element={<FileStatus />} />
                    <Route path="/*" element={<ErrorNotFound />} />
                </Routes>
                <Footer />
            </BrowserRouter>
        </div>
    );
}

export default App;