import { Link } from "react-router-dom";
import {Component} from "react";
import {Button} from "react-bootstrap";

class Unauthorized extends Component {
    render() {
        return (
            <div>
                <h1>Nostr sign in required</h1>
                <p>To use this page you need to login with your npub</p>
                <Button>Login using browser extension</Button>
            </div>
        );
    }
}

export default Unauthorized;