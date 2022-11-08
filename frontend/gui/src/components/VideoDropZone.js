import React from "react";
import { BsFillPatchQuestionFill } from 'react-icons/bs';
import { Form, Button } from "reactstrap";
import { useDropzone } from 'react-dropzone';

export default function VideoDropZone(props) {
    const {
        acceptedFiles,
        fileRejections,
        getRootProps,
        getInputProps
    } = useDropzone({
        maxFiles: 1,
        maxSize: 104857600, // 100 megabytes enough ?
        accept: {
            'image/gif': ['.gif'],
            'video/mp4': ['.mp4'],
            'video/mpeg': ['.mpeg'],
            'video/ogg': ['.ogg'],
            'video/webm': ['.webm'],
            'video/x-matroska': ['.mkv'],
            'video/x-msvideo': ['.avi'],
            'video/x-flv': ['.flv'],
            'video/quicktime': ['.mov'],
            'video/x-m4v': ['.m4v']
        },
        onDrop: files => props.videoFileSetter(files[0]),
        onFileDialogOpen: () => { props.videoFileSetter(null); props.setSuccess(false); props.setError(false) } // reset file on dialog open
    });
    const acceptedFileItems = acceptedFiles.map(file => (
        <li key={file.path}>
            {file.path} - {file.size} bytes
        </li>
    ));
    const fileRejectionItems = fileRejections.map(({ file, errors }) => {
        return (
            <li key={file.path}>
                {file.path} - {(file.size / 1024 / 1024).toFixed(2)}MiB
                <ul>
                    {errors.map(e => <li key={e.code}>{e.message}</li>)}
                </ul>
            </li>
        )
    });

    return (
        <section className="container">
            <div {...getRootProps({ className: 'dropzone text-center' })}>
                <input {...getInputProps()} />
                <div>
                    Drag 'n' drop a video here, or click to select a file <br />
                    <em>Only one upload is supported at a time, max size 100MiB<br />
                        Valid types: gif, mp4, mpeg, ogg, webm, mkv, avi, flv, mov, m4v</em>
                </div>
                {acceptedFileItems.length > 0 ? <div className="mb-0 mt-2"><h4>Awesome! '{acceptedFiles[0].name}' is ready to upload!</h4></div> : ""}
                {fileRejectionItems.length > 0 ? <div><h4 className="mb-0 mt-2">Bad file - try again</h4></div> : ""}
            </div>
            <aside>
                {acceptedFileItems.length > 0 && !props.uploading && !props.success ? <div className="d-grid gap-2 mt-4 col-6 mx-auto text-center"><Button color="success" type="submit">Upload</Button></div> : ""}
            </aside>
        </section>
    );
}