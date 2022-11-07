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
            'video/x-ms-wmv': ['.wmv'],
            'video/x-flv': ['.flv'],
            'video/3gpp': ['.3gp'],
            'video/3gpp2': ['.3g2'],
            'video/quicktime': ['.mov'],
            'video/x-m4v': ['.m4v']
        }
    });
    const acceptedFileItems = acceptedFiles.map(file => (
        <li key={file.path}>
            {file.path} - {file.size} bytes
        </li>
    ));
    const fileRejectionItems = fileRejections.map(({ file, errors }) => {
        return (
            <li key={file.path}>
                {file.path} - {file.size} bytes
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
                <div>Drag 'n' drop a video here, or click to select a file <br /> <em>Only one upload is supported at a time, max size 100MiB</em></div>
                {acceptedFileItems.length > 0 ? <div className="d-grid gap-2 col-6 mx-auto text-center"><h4>Awesome! '{acceptedFiles[0].name}' is ready to upload!</h4></div> : ""}
                {fileRejectionItems.length > 0 ? <div><h4>Uh oh, rejects</h4><ul>{fileRejectionItems}</ul></div> : ""}
            </div>
            <aside>
                {acceptedFileItems.length > 0 ? <div className="d-grid gap-2 mt-4 col-6 mx-auto text-center"><Button color="success" type="submit">Upload</Button></div> : ""}
            </aside>
        </section>
    );
}