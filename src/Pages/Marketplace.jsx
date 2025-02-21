import useNostr from "../hooks/useNostr";
import React, {useEffect, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFile} from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";

export function Marketplace() {
    const nostr = useNostr();
    const [files, setFiles] = useState([]);

    useEffect(() => {
        if (!nostr) return;

        nostr.fetchUserFiles().then((files) => {
            setFiles(files);
        });
    }, [nostr]);

    return (
        <div>
            <div className="row">
                <div className="col">
                    <div className="d-flex gap-2 align-items-center">
                        <h2>Your Uploaded Files</h2>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"
                             className="bi bi-file-plus" viewBox="0 0 16 16">
                            <path
                                d="M8.5 6a.5.5 0 0 0-1 0v1.5H6a.5.5 0 0 0 0 1h1.5V10a.5.5 0 0 0 1 0V8.5H10a.5.5 0 0 0 0-1H8.5z"/>
                            <path
                                d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2zm10-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1"/>
                        </svg>
                    </div>
                </div>
            </div>
            <div className="row">
                <ItemList>
                    {files.length > 0 ? (
                        files.map((file, index) => (
                            <li key={index}>
                                <a href={file.url} target="_blank" rel="noreferrer">
                                    <div className="filePreview">
                                        {file.extension === "jpg" || file.extension === "png" ? (
                                            <img src={file.url} alt="file preview"/>
                                        ) : (
                                            <FontAwesomeIcon icon={faFile}/>
                                        )}
                                    </div>
                                    <p>{file.name}</p>
                                </a>
                            </li>
                        ))
                    ) : (
                        <li>No files uploaded yet.</li>
                    )}
                </ItemList>
            </div>
        </div>
    );
}


const ItemList = styled.ul`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1rem;
    padding: 0;
    list-style: none;

    li {
        display: flex;
        flex-direction: column;
        align-items: center;
        background: #1e1e1e; /* Darker to match page */
        border-radius: 8px;
        padding: 12px;

        &:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 10px rgba(255, 255, 255, 0.1);
        }
    }

    .filePreview {
        width: 150px;
        height: 150px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 6px;
        overflow: hidden;

        img, svg {
            width: 100%;
            height: 100%;
            object-fit: cover; /* Ensures consistency */
            border-radius: 6px;
        }

        svg {
            color: #aaa;
        }

        &:hover svg {
            color: #fff;
        }
    }

    p {
        margin-top: 8px;
        font-size: 14px;
        font-weight: 500;
        text-align: center;
        color: #ddd;
        word-break: break-word;
    }

    a {
        text-decoration: none;
        color: inherit;
        display: flex;
        flex-direction: column;
        align-items: center;
    }
`;

