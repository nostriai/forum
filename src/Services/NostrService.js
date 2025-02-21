export default class NostrService {
    constructor(ndk, user){
        this.ndk = ndk;
        this.user = user;
    }

    async subscribe(filters){
        return this.ndk.subscribe(filters);
    }

    async fetchUserFiles(){
        const filters = {
            pubkeys: [this.user],
            kinds: [24242],
        };
        const formattedInfo = [];
        const fileEvents = await this.ndk.fetchEvents(filters);
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