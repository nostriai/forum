import {BlossomUploader} from '@nostrify/nostrify/uploaders';

export default class NostrService {
    constructor(ndk, user){
        this.ndk = ndk;
        this.user = user;
    }

     async getCurrentUser(){
         return await window.nostr.getPublicKey();
    }

    async subscribe(filters){
        return this.ndk.subscribe(filters);
    }

    async fetchFiles(authors = []){
        const filters = {
            kinds: [24242],
        };
        if(authors.length > 0){
            filters.authors = authors;
        }
        console.log("Fetching files with filters:", filters);
        const formattedInfo = [];
        const fileEvents = await this.ndk.fetchEvents(filters,
            {
                closeOnEose: true,
            });
        fileEvents.forEach((fileEvent) => {
            const name = fileEvent.tags[0][1];
            const extension = this.getExtensionFromMimeType(fileEvent.tags[1][1]);
            const size = fileEvent.tags[2][1];
            const url = `https://test.nostri.ai/${name}.${extension}`;
            formattedInfo.push({
                name:name,
                extension:extension,
                size: size,
                url: url
            });
        });
        return formattedInfo;
    }

    async uploadFile(){
        try {
        const uploader = new BlossomUploader({
            servers: ['https://test.nostri.ai'],
            signer: window.nostr,
            fetch: (...args) => globalThis.fetch(...args)
        });
        const [fileHandle] = await window.showOpenFilePicker();
        const file = await fileHandle.getFile();
        await uploader.upload(file);
        } catch (error) {
            console.error("Failed to get uploaded files:", error);
        }
    }

    getExtensionFromMimeType(mimeType){
        if(mimeType === "image/jpeg"){
            return "jpg";
        }
        if(mimeType === "image/png"){
            return "png";
        }
        if(mimeType === "application/pdf"){
            return "pdf";
        }
        return "txt";
    }
}