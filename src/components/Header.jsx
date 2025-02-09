import {Component} from "react";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import {Button, NavbarText} from "react-bootstrap";
import { AuthContext } from "../context/AuthManager";
export class Header extends Component {
    static contextType = AuthContext;
    render() {
        return (
            <>
                <Navbar expand="lg" className="bg-body-tertiary">
                    <Container>
                        <Navbar.Brand href="/">Nostri.ai</Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav"/>
                        <Navbar.Collapse id="basic-navbar-nav">
                            <Nav className="me-auto">
                                <Nav.Link href="/marketplace">Marketplace</Nav.Link>
                            </Nav>
                        </Navbar.Collapse>
                        {this.context.user ? (
                            <Nav.Item>
                                <NavbarText>Logged in as {this.context.user}</NavbarText>
                            </Nav.Item>) : (
                            <Nav.Item>
                                <Button onClick={this.context.launchLogin}>Login</Button>
                            </Nav.Item>)}
                    </Container>
                </Navbar>
            </>
        )
    }
}