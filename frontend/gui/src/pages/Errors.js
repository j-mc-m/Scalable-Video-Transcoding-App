import React from "react";
import Notice from "../components/Notice";

export default function ErrorNotFound() {
    document.title = "Page not found";
    return (
        <div className="Page">
            <h1>Page not found</h1>
            <Notice color="info" linkColor="info" msg="Unfortunately, this page could not be found. Sorry about that." link="/" linkText="Return to home page" />
        </div>
    );
}

