import {Component} from "react";

export class Marketplace extends Component {
    render() {
        return (
            <>
            <div className="row">
                <div className="col-4">
                    <h2>Your uploaded files</h2>
                    <ul className={"list-unstyled"}>
                        <li>File 1</li>
                        <li>File 2</li>
                        <li>File 3</li>
                    </ul>
                </div>
            </div>
            </>
        )
    }
}