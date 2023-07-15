import React, { useState } from "react";

const KysPage = () => {
    const [s, setS] = useState(false);

    return (
        <div className="flex max-h-[calc(100svh-64px)] w-full flex-col">
            <div className="h-16 bg-blue-500"></div>
            <div className="flex-1 overflow-y-auto bg-purple-500">
                <p>yo</p>
                <p>yo</p>
                <p>yo</p>
                <p>yo</p>
                <p>yo</p>
                <p>yo</p>
                <p>yo</p>
                <p>yo</p>
                <p>yo</p>
                <p>yo</p>
                <p>yo</p>
            </div>
            <div className="h-14 bg-red-500">
                <button onClick={() => setS(!s)}>Click</button>
            </div>
            {s && (
                <div className="flex-1 overflow-y-auto bg-green-500">
                    <p>yo</p>
                    <p>yo</p>
                    <p>yo</p>
                    <p>yo</p>
                    <p>yo</p>
                    <p>yo</p>
                    <p>yo</p>
                    <p>yo</p>
                    <p>yo</p>
                    <p>yo</p>
                    <p>yo</p>
                    <p>yo</p>
                    <p>yo</p>
                    <p>yo</p>
                    <p>yo</p>
                    <p>yo</p>
                    <p>yo</p>
                    <p>yo</p>
                    <p>yo</p>
                    <p>yo</p>
                    <p>yo</p>
                </div>
            )}
        </div>
    );
};

export default KysPage;
