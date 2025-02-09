import {createBrowserRouter, createRoutesFromElements, Route, RouterProvider} from "react-router-dom";
import {Layout} from "./components/Layout";
import React from "react";
import {Marketplace} from "./Pages/Marketplace";
import RequireAuth from "./components/RequireAuth";
import {AuthManager} from "./context/AuthManager";
import {AuthContext} from "./context/AuthManager";

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<Layout/>}>
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