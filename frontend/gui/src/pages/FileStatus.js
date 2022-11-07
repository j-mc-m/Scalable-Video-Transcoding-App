import React from "react";

import { BsFillPatchQuestionFill } from 'react-icons/bs';
import { Button } from "reactstrap";
import { useParams } from 'react-router-dom';

export default function Home() {

    const { id } = useParams();
    document.title = "Video Converter - File processing Status";

    return (
        <div className="Page">
            <h2>File Upload</h2>
            <p>This page will load an api endpoint to display status info!</p>
            <p>File id: {id}</p>
        </div>
    );
}
