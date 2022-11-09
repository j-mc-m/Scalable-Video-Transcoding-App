import React, { useEffect, useState } from "react";
import { Form, Button, FormGroup, Input, Label } from "reactstrap";
import VideoDropZone from '../components/VideoDropZone';
import axios from 'axios';
import { Link } from "react-router-dom";

export default function Home() {
    document.title = "Video Converter - Upload a file";

    const onSubmit = data => {
        data.preventDefault();
        setLoading(true);
        setError(false);
        setErrorMsg(null);
        setSuccess(false);
        setReturnedID(null);
        let formData = new FormData();
        formData.append('video', videoFile);
        formData.append('format', videoFormat);
        // prevent same format re-transcoding
        if (videoFile.path.substr(-videoFormat.length) === videoFormat) {
            setError(true);
            setErrorMsg("The file is already in the specified format. Please choose a different format or file.");
            setLoading(false);
            return;
        }
        axios.post('http://192.168.1.111:3001/api/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
            .then(res => {
                setLoading(false);
                setSuccess(true);
                console.log(res);
                setReturnedID(res.data.data.id);
            })
            .catch(err => {
                setLoading(false);
                setError(true);
                console.log(err);
            })
    };
    const [videoFormat, videoFormatSetter] = useState('mkv');
    const [videoFile, videoFileSetter] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [success, setSuccess] = useState(false);
    const [returnedID, setReturnedID] = useState(null);

    useEffect(() => {
        console.log("videoFile: " + videoFile);
    }, [videoFile]);

    return (
        <div className="Page">
            <h2>File Upload</h2>
            <p>Drop your file here to convert it to a new format!</p>
            <Form onSubmit={onSubmit}>
                <FormGroup floating className="mt-3 mx-2">
                    <Input id="fileFormat" name="format" placeholder="mkv" type="select" onChange={e => videoFormatSetter(e.target.value)}>
                        <option value="mkv">mkv</option>
                        <option value="mp4">mp4</option>
                        <option value="avi">avi</option>
                        <option value="mov">mov</option>
                        <option value="flv">flv</option>
                        <option value="m4v">m4v</option>
                    </Input>
                    <Label for="fileFormat">Format to transcode into</Label>
                </FormGroup>
                <VideoDropZone videoFile={videoFile} videoFileSetter={videoFileSetter} uploading={loading} success={success} setSuccess={setSuccess} error={error} setError={setError} />
                {loading ? <div className="text-center mt-3 mx-2"><div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div></div> : ""}
                {error ? <div className=" alert alert-danger mt-3 mb-0 mx-2 text-center" role="alert">{errorMsg}<br />Please try again.</div> : ""}
                {success ? <div className="alert alert-success mt-3 mb-0 mx-2 text-center" role="alert">Success! Your file has been uploaded and is now queued for conversion.<br /><br />
                    <Link to={`/upload/${returnedID}`}><Button className="d-inlineblock" color="success">View Status</Button></Link></div> : ""}
            </Form>
        </div>
    );
}
