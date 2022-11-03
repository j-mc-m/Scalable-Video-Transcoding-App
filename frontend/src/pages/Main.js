import React from "react";
import { Form } from "reactstrap";
import VideoDropZone from '../components/VideoDropZone';

export default function Home() {
    document.title = "Video Converter - Upload a file";

    const onSubmit = data => {data.preventDefault(); console.log(data)};

    return (
        <div className="Page">
            <h2>File Upload</h2>
            <p>Drop your file here to convert it to mkv!</p>
            <Form onSubmit={onSubmit}>
                <VideoDropZone />
            </Form>
        </div>
    );
}
