import React, {Component, createContext} from "react";
import {init as nostrLoginInit, launch as nostrLoginLaunch} from "nostr-login"

export const AuthContext = createContext(null);

export class AuthManager extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: null,
            authDone: false,
        };
        nostrLoginInit({
            theme: 'default',
            onAuth: (user) => {
                this.setUser(user);
                this.setState({authDone: true});
            },
        });

    }

    launchLogin = () => {
        nostrLoginLaunch();
    }

    setUser = (user) => {
        this.setState({user});
    }

    render() {
        return (
            <AuthContext.Provider value={{user: this.state.user, authDone: this.state.authDone, launchLogin: this.launchLogin}}>
                {this.props.children}
            </AuthContext.Provider>
        );
    }
}
