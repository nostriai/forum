import {useContext, useEffect, useState} from 'react';
import NDK from "@nostr-dev-kit/ndk";
import NostrService from "../Services/NostrService.js";
import {AuthContext} from "../context/AuthManager.jsx";

export default function useNostr() {
    const [nostrService, setNostrService] = useState(null);
    const {user} = useContext(AuthContext);

    useEffect(() => {
        const ndk = new NDK({
            explicitRelayUrls: ["wss://test.nostri.ai/"],
        });
        ndk.connect().then(() => {
            const nostrService = new NostrService(ndk, user);
            setNostrService(nostrService);
        });

    }, [user]);

    return nostrService;
}
