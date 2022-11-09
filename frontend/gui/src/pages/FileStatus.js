import React, { useState, useEffect } from "react";

import { BsFillPatchQuestionFill } from 'react-icons/bs';
import { Button } from "reactstrap";
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Link } from "react-router-dom";

export default function Home() {

    const { id } = useParams();
    document.title = "Video Converter - File processing Status";

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [status, setStatus] = useState(null);
    const [downloadURI, setDownloadURI] = useState(null);

    useEffect(() => {
        checkStatusAPI();
    }, []);

    function checkStatusAPI() {
        const checkURI = process.env.NODE_ENV === "development" ? "http://192.168.1.111:3001/api/status/" : "/api/status/";
        setLoading(true);
        setError(false);
        setErrorMsg(null);
        setDownloadURI(null);
        // file upload
        axios.get(`${checkURI}${id}`)
            .then(res => {
                setStatus(res.data.data.status);
                if (res.data.data.status === "done") {
                    setDownloadURI(res.data.data.s3TranscodeUrl);
                }
                setLoading(false);
                console.log(res);
            })
            .catch(err => {
                setErrorMsg(err.response.data.message);
                setLoading(false);
                setError(true);
                console.log(err);
            })
    }

    return (
        <div className="Page">
            <h2>Processing status</h2>
            {loading ? <div className="text-center mt-3 mx-2"><div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div></div> : ""}
            {error ? <div className=" alert alert-danger mt-3 mb-0 mx-2 text-center" role="alert">{errorMsg}<br />Please try again.<br /><Button color="primary" onClick={checkStatusAPI}>Refresh</Button></div> : ""}
            {(loading || error) ? "" :
                <div>
                    <p>File status: {status}</p>
                    <Button color="primary" onClick={checkStatusAPI}>Refresh</Button>
                    {!downloadURI ? "" : <a href={`${downloadURI}`}><Button color="success" className="mx-2">Download</Button></a>}
                </div>
            }
        </div>
    );
}
