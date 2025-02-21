import {createBrowserRouter, createRoutesFromElements, Route, RouterProvider} from "react-router-dom";
import {Layout} from "./components/Global/Layout.jsx";
import React from "react";
import RequireAuth from "./components/Global/RequireAuth.jsx";
import {AuthManager} from "./context/AuthManager";
import NotFound from "./Pages/NotFound.jsx";
import {UserFiles} from "./Pages/Marketplace/UserFiles.jsx";
import {Shop} from "./Pages/Marketplace/Shop.jsx";

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<Layout/>}>

            {/* Public Routes */}
            <Route path="/" element={<Shop/>}/>
            <Route path="*" element={<NotFound/>}/>

            {/* Private Routes (Protected by RequireAuth) */}
            <Route element={<RequireAuth/>}>
                <Route path="/marketplace/user-files" element={<UserFiles/>}/>
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