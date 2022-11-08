import React, { useEffect, useState } from "react";
import { Form, Button } from "reactstrap";
import VideoDropZone from '../components/VideoDropZone';
import axios from 'axios';

export default function Home() {
    document.title = "Video Converter - Upload a file";

    const onSubmit = data => {
        data.preventDefault();
        setLoading(true);
        setError(false);
        setSuccess(false);
        let formData = new FormData();
        formData.append('video', videoFile);
        console.log(data);
        console.log(formData);
        axios.post('http://192.168.1.111:3001/api/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
            .then(res => {
                setLoading(false);
                setSuccess(true);
                console.log(res);
                console.log(res.data);
            })
            .catch(err => {
                setLoading(false);
                setError(true);
                console.log(err);
            })
    };
    const [videoFile, videoFileSetter] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        console.log("videoFile: " + videoFile);
    }, [videoFile]);

    return (
        <div className="Page">
            <h2>File Upload</h2>
            <p>Drop your file here to convert it to mkv!</p>
            <Form onSubmit={onSubmit}>
                <VideoDropZone videoFile={videoFile} videoFileSetter={videoFileSetter} uploading={loading} success={success} setSuccess={setSuccess} error={error} setError={setError} />
                {loading ? <div className="text-center mt-3"><div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div></div> : ""}
                {error ? <div className=" alert alert-danger mt-3 mb-0 text-center" role="alert">Something went wrong! Please try again.</div> : ""}
                {success ? <div className="alert alert-success mt-3 mb-0 text-center" role="alert">Success! Your file is being converted.<br /><br /><Button className="d-inlineblock" color="success">View Status</Button></div> : ""}
            </Form>
        </div>
    );
}
