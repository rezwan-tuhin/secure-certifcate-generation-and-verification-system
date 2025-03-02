import Home from "./pages/Home"
import Certificate from "./components/Certificate";
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import { useEffect, useState } from "react";

function App() {

  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>}></Route>
        <Route path="/certificate" element={<Certificate/>}></Route>
      </Routes>
    
    </BrowserRouter>
    </>
  )
}

export default App
