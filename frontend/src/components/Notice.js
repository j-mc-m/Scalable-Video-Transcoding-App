import React from "react";
import { Alert, Button } from "reactstrap";
import { Link } from "react-router-dom";

export default function Notice(props) {
    return (
        <div>
            <Alert color={props.color}>{props.msg}<br /><br />
                <Link to={props.link}><Button color={props.linkColor}>{props.linkText}</Button></Link>
            </Alert>
        </div>

    );
}