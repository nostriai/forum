import {createBrowserRouter, createRoutesFromElements, Route, RouterProvider} from "react-router-dom";
import {Layout} from "./components/Layout";
import React from "react";
import {Marketplace} from "./Pages/Marketplace";
import RequireAuth from "./components/RequireAuth";
import {AuthManager} from "./context/AuthManager";
import {Home} from "./Pages/Home.jsx";
import NotFound from "./Pages/NotFound.jsx";

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<Layout/>}>
            {/* Public Routes */}
            <Route path="/" element={<Home/>}/>
            <Route path="*" element={<NotFound/>}/>
            {/* Private Routes (Protected by RequireAuth) */}
            <Route element={<RequireAuth/>}>
                <Route path="/marketplace" element={<Marketplace/>}/>
            </Route>
        </Route>
    )
)

function App() {
    return (
        <AuthManager>
            <RouterProvider router={router}/>
        </AuthManager>
    );
}

export default App;