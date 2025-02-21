import useNostr from "../../hooks/useNostr";
import React, {useEffect, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFileCirclePlus} from "@fortawesome/free-solid-svg-icons";
import {ItemList} from "../../components/Marketplace/ItemList.jsx";

export function UserFiles() {
    const nostr = useNostr();
    const [files, setFiles] = useState([]);

    useEffect(() => {
        if (!nostr) return;
        nostr.getCurrentUser().then((user) => {
            nostr.fetchFiles([user]).then((files) => {
                setFiles(files);
            });
        })
    }, [nostr]);
    const uploadFile = async () => {
        nostr.uploadFile().then(() => {
            nostr.getCurrentUser().then((user) => {
                nostr.fetchFiles([user]).then((files) => {
                    setFiles(files);
                });
            })
        });
    };
    return (
        <div>
            <div className="row">
                <div className="col">
                    <div className="d-flex gap-2 align-items-center">
                        <h2>Your Uploaded Files</h2>
                        <FontAwesomeIcon onClick={uploadFile} icon={faFileCirclePlus} title={"Add new file"} size={"xl"} />
                    </div>
                </div>
            </div>
            <div className="row">
                <ItemList files={files}/>
            </div>
        </div>
    );
}

