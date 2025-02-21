import styled from "styled-components";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFile} from "@fortawesome/free-solid-svg-icons";
import React from "react";

export function ItemList(props) {
    const files = props.files;
    return (
        <_ItemList>
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
        </_ItemList>
    )
}

const _ItemList = styled.ul`
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