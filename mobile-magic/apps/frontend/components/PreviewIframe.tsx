import { useState } from "react";
import { useEffect } from "react";


export function PreviewIframe({ url }: { url: string }) {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        console.log("interval started")
        const timer = setInterval(() => {
            console.log(`Checking if ${url} is ready`);
            fetch(url)
                .then(response => response.ok)
                .then(ok => {
                    if (ok) {
                        setIsLoading(false);
                    } else {
                        setIsLoading(true);
                    }
                })
        }, 1000);
        return () => clearInterval(timer);
    }, [url]);

    if (isLoading) {
        return <div className="w-full h-full rounded-lg flex items-center justify-center"></div>;
    }
    
    return (
        <iframe src={url} className="w-full h-full rounded-lg" title="Project Worker" />
    )
}

