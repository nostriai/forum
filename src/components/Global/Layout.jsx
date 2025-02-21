import { Header } from "./Header.jsx";
import { Footer } from "./Footer.jsx";
import { Outlet } from "react-router-dom";
import { Component } from "react";
import Container from "react-bootstrap/Container";
import { AuthContext } from "../../context/AuthManager.jsx";

export class Layout extends Component {
    static contextType = AuthContext;

    render() {
        return this.context.authDone ? (
            <>
                <Header />
                <Container className="mt-5">
                    <Outlet />
                </Container>
                <Footer />
            </>
        ) : null;
    }
}
