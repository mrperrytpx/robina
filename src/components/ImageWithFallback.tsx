import Image, { StaticImageData } from "next/image";
import { useState, useEffect } from "react";

interface IImageWithFallbackProps {
    fallback: string | StaticImageData;
    alt: string;
    src: string | StaticImageData;
    [key: string]: any;
}

export const ImageWithFallback = ({
    fallback,
    alt,
    src,
    ...props
}: IImageWithFallbackProps) => {
    const [error, setError] = useState(false);

    useEffect(() => {
        setError(false);
    }, [src]);

    return (
        <Image
            alt={alt}
            onError={() => setError(true)}
            src={error ? fallback : src}
            {...props}
        />
    );
};
