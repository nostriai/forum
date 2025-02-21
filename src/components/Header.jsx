import {Component} from "react";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import {Badge, Button, NavbarText, Row, Col} from "react-bootstrap";
import {AuthContext} from "../context/AuthManager";

export class Header extends Component {
    static contextType = AuthContext;

    render() {
        return (
            <>
                <Navbar expand="lg" className="bg-body-tertiary">
                    <Container>
                        <Nav>
                            <Navbar.Brand href="/">Nostri.ai</Navbar.Brand>
                            <Nav.Link href="/marketplace/user-files/">My files</Nav.Link>
                        </Nav>
                        <Nav>
                            {
                                this.context.user ?
                                    (<NavbarText>Logged in as {this.context.user}</NavbarText>) :
                                    (<Button onClick={this.context.launchLogin}>Login</Button>)
                            }
                        </Nav>
                    </Container>
                </Navbar>
            </>
        )
    }
}