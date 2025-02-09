import React, {Component} from "react";
import {Outlet} from "react-router-dom";
import { AuthContext } from "../context/AuthManager";
import Unauthorized from "../Pages/Unauthorized.jsx";
export default class RequireAuth extends Component {
    static contextType = AuthContext;

    render() {
        const {user} = this.context;
        return user ? <Outlet /> : <Unauthorized />;
    }
}