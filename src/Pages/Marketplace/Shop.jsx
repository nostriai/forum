import useNostr from "../../hooks/useNostr";
import React, {useEffect, useState} from "react";
import {ItemList} from "../../components/Marketplace/ItemList.jsx";
export function Shop() {
    const nostr = useNostr();
    const [files, setFiles] = useState([]);
    useEffect(() => {
        if (!nostr) return;

        nostr.fetchFiles().then((files) => {
            setFiles(files);
        });
    }, [nostr]);
    return (
        <div className="row">
            <ItemList files={files}/>
        </div>
    )
}